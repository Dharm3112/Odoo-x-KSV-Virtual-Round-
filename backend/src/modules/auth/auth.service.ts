import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { User, UserStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '@infra/database/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { QUEUE_EMAIL_NOTIFICATIONS } from '@infra/queue/queue.module';
import { LoginAttemptService } from './login-attempt.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, ResetPasswordDto, SignupDto } from './dto';
import { AuthTokensDto, AuthUserDto } from './dto';

export interface RequestContext {
  ipAddress: string;
  userAgent?: string | null;
}

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly loginAttemptService: LoginAttemptService,
    private readonly mailService: MailService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    @InjectQueue(QUEUE_EMAIL_NOTIFICATIONS) private readonly emailQueue: Queue,
  ) {}

  // ---------------------------------------------------------------------
  // Signup
  // ---------------------------------------------------------------------

  async signup(dto: SignupDto, context: RequestContext): Promise<AuthUserDto> {
    const normalisedEmail = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalisedEmail },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Email already exists in the system');
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: normalisedEmail,
        passwordHash,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        role: dto.role,
        status: UserStatus.active,
      },
    });

    this.eventEmitter.emit('auth.user_signup', {
      userId: user.id,
      email: user.email,
      role: user.role,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent ?? null,
      timestamp: new Date().toISOString(),
    });

    return this.toAuthUser(user);
  }

  // ---------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------

  async login(dto: LoginDto, context: RequestContext): Promise<AuthTokensDto> {
    const email = dto.email.trim().toLowerCase();

    if (await this.loginAttemptService.isLocked(email)) {
      this.eventEmitter.emit('auth.login_failed', {
        email,
        reason: 'account_locked',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent ?? null,
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedException(
        'Account temporarily locked due to too many failed login attempts',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      await this.loginAttemptService.recordFailure(email);
      this.eventEmitter.emit('auth.login_failed', {
        email,
        reason: 'invalid_credentials',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent ?? null,
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.active) {
      this.eventEmitter.emit('auth.login_failed', {
        email,
        reason: 'account_inactive',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent ?? null,
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedException('Account is not active');
    }

    const passwordOk = await this.passwordService.verify(user.passwordHash, dto.password);
    if (!passwordOk) {
      const result = await this.loginAttemptService.recordFailure(email);
      this.eventEmitter.emit('auth.login_failed', {
        email,
        reason: 'invalid_credentials',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent ?? null,
        timestamp: new Date().toISOString(),
      });
      if (result.locked) {
        await this.enqueueAccountLockedEmail(user);
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.loginAttemptService.clearFailures(email);

    const tokens = await this.issueAndPersistSession(user, context);

    this.eventEmitter.emit('auth.login_success', {
      userId: user.id,
      email: user.email,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent ?? null,
      timestamp: new Date().toISOString(),
    });

    return tokens;
  }

  // ---------------------------------------------------------------------
  // Refresh token (with reuse-detection per PRD §1.10)
  // ---------------------------------------------------------------------

  async refreshToken(dto: RefreshTokenDto, context: RequestContext): Promise<AuthTokensDto> {
    let claims: { sub: string; sid: string };
    try {
      claims = this.tokenService.verifyRefreshToken(dto.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const refreshHash = this.tokenService.hashRefreshToken(dto.refreshToken);
    const session = await this.prisma.userSession.findUnique({
      where: { refreshTokenHash: refreshHash },
      include: { user: true },
    });

    if (!session) {
      // Token reuse / tampering: drop ALL sessions for that user.
      await this.prisma.userSession.deleteMany({ where: { userId: claims.sub } });
      this.eventEmitter.emit('auth.session_compromised', {
        userId: claims.sub,
        reason: 'refresh_token_reuse',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent ?? null,
        timestamp: new Date().toISOString(),
      });
      throw new UnauthorizedException('Refresh token reuse detected. Please log in again.');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.prisma.userSession.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    if (session.user.status !== UserStatus.active) {
      await this.prisma.userSession.deleteMany({ where: { userId: session.userId } });
      throw new UnauthorizedException('Account is not active');
    }

    // Rotate: delete old session row, issue fresh pair.
    await this.prisma.userSession.delete({ where: { id: session.id } });
    const tokens = await this.issueAndPersistSession(session.user, context);
    return tokens;
  }

  // ---------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------

  async logout(
    userId: string,
    refreshToken: string | undefined,
    context: RequestContext,
  ): Promise<void> {
    if (refreshToken) {
      const refreshHash = this.tokenService.hashRefreshToken(refreshToken);
      await this.prisma.userSession
        .delete({ where: { refreshTokenHash: refreshHash } })
        .catch(() => undefined);
    } else {
      await this.prisma.userSession.deleteMany({ where: { userId } });
    }

    this.eventEmitter.emit('auth.user_logout', {
      userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent ?? null,
      timestamp: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------------------
  // Forgot / reset password
  // ---------------------------------------------------------------------

  async forgotPassword(dto: ForgotPasswordDto, context: RequestContext): Promise<void> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      const rawToken = randomBytes(RESET_TOKEN_BYTES).toString('hex');
      const tokenHash = this.hashOpaqueToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          resetTokenHash: tokenHash,
          expiresAt,
        },
      });

      this.eventEmitter.emit('auth.password_reset_requested', {
        userId: user.id,
        email: user.email,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent ?? null,
        timestamp: new Date().toISOString(),
      });

      await this.enqueuePasswordResetEmail(user, rawToken);
    }
    // Always return without error to prevent user enumeration.
  }

  async resetPassword(dto: ResetPasswordDto, context: RequestContext): Promise<void> {
    const tokenHash = this.hashOpaqueToken(dto.token);

    const reset = await this.prisma.passwordReset.findUnique({
      where: { resetTokenHash: tokenHash },
      include: { user: true },
    });

    if (!reset || reset.isUsed || reset.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Token is invalid, expired, or has already been used');
    }

    const passwordHash = await this.passwordService.hash(dto.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordReset.update({
        where: { id: reset.id },
        data: { isUsed: true },
      }),
      // Force re-login on all devices.
      this.prisma.userSession.deleteMany({ where: { userId: reset.userId } }),
    ]);

    this.eventEmitter.emit('auth.password_reset_success', {
      userId: reset.userId,
      email: reset.user.email,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent ?? null,
      timestamp: new Date().toISOString(),
    });
  }

  // ---------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------

  private async issueAndPersistSession(
    user: User,
    context: RequestContext,
  ): Promise<AuthTokensDto> {
    const refreshTtl = this.parseTtlToMs(this.tokenService.refreshTokenTtl);
    const expiresAt = new Date(Date.now() + refreshTtl);

    const accessToken = this.tokenService.issueAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = this.tokenService.issueRefreshToken({
      sub: user.id,
      sid: 'pending',
    });

    const refreshHash = this.tokenService.hashRefreshToken(refreshToken);
    const session = await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: refreshHash,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent?.slice(0, 512) ?? null,
        expiresAt,
      },
    });

    // Re-issue refresh token with the now-known session id.
    const finalRefreshToken = this.tokenService.issueRefreshToken({
      sub: user.id,
      sid: session.id,
    });

    if (finalRefreshToken !== refreshToken) {
      const finalHash = this.tokenService.hashRefreshToken(finalRefreshToken);
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { refreshTokenHash: finalHash },
      });
    }

    return {
      accessToken,
      refreshToken: finalRefreshToken,
      user: this.toAuthUser(user),
    };
  }

  private async enqueueAccountLockedEmail(user: User): Promise<void> {
    try {
      await this.emailQueue.add(
        'account-locked',
        { userId: user.id, email: user.email, firstName: user.firstName },
        { attempts: 3, removeOnComplete: true },
      );
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue account-locked email for ${user.email}: ${(error as Error).message}`,
      );
    }
  }

  private async enqueuePasswordResetEmail(user: User, token: string): Promise<void> {
    try {
      await this.emailQueue.add(
        'password-reset',
        { userId: user.id, email: user.email, firstName: user.firstName, token },
        { attempts: 3, removeOnComplete: true },
      );
      // Best-effort direct send to MailDev so dev users can see the email
      // immediately. The queue remains the durable delivery path.
      await this.mailService.sendPasswordResetEmail(user.email, token, user.firstName);
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue password-reset email for ${user.email}: ${(error as Error).message}`,
      );
    }
  }

  private toAuthUser(user: User): AuthUserDto {
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
    };
  }

  private hashOpaqueToken(token: string): string {
    // Tokens are already high-entropy; we hash so a database leak does not
    // immediately yield usable reset tokens.
    return this.tokenService.hashRefreshToken(token);
  }

  private parseTtlToMs(ttl: string): number {
    const match = /^(\d+)([smhd])$/.exec(ttl.trim());
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
