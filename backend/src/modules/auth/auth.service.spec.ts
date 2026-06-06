import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { Role, UserStatus, type User } from '@prisma/client';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@infra/database/prisma.service';
import { MailService } from '@infra/mail/mail.service';
import { LoginAttemptService } from './login-attempt.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RefreshTokenDto, ResetPasswordDto, SignupDto } from './dto';

const ctx = { ipAddress: '127.0.0.1', userAgent: 'jest' };

const baseUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: '$argon2id$hash',
  firstName: 'Test',
  lastName: 'User',
  role: Role.procurement_officer,
  status: UserStatus.active,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function buildPrismaMock() {
  return {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    passwordReset: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };
}

function buildTokenService(): jest.Mocked<TokenService> {
  return {
    issueAccessToken: jest.fn().mockReturnValue('access.jwt'),
    issueRefreshToken: jest.fn().mockReturnValue('refresh.jwt'),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn().mockReturnValue({ sub: 'user-1', sid: 'session-1' }),
    hashRefreshToken: jest.fn().mockReturnValue('hashed-token'),
    accessTokenTtl: '15m',
    refreshTokenTtl: '7d',
  } as unknown as jest.Mocked<TokenService>;
}

describe('AuthService', () => {
  let prisma: ReturnType<typeof buildPrismaMock>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordService: jest.Mocked<PasswordService>;
  let loginAttemptService: jest.Mocked<LoginAttemptService>;
  let mailService: jest.Mocked<MailService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let emailQueue: jest.Mocked<Queue>;
  let service: AuthService;

  beforeEach(async () => {
    prisma = buildPrismaMock();
    tokenService = buildTokenService();
    passwordService = {
      hash: jest.fn().mockResolvedValue('hash'),
      verify: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<PasswordService>;
    loginAttemptService = {
      isLocked: jest.fn().mockResolvedValue(false),
      recordFailure: jest.fn().mockResolvedValue({ locked: false, failures: 1 }),
      clearFailures: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<LoginAttemptService>;
    mailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MailService>;
    eventEmitter = { emit: jest.fn() } as unknown as jest.Mocked<EventEmitter2>;
    emailQueue = { add: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<Queue>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: prisma },
        { provide: PasswordService, useValue: passwordService },
        { provide: TokenService, useValue: tokenService },
        { provide: LoginAttemptService, useValue: loginAttemptService },
        { provide: MailService, useValue: mailService },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: ConfigService, useValue: {} },
        { provide: 'BullQueue_email-notifications', useValue: emailQueue },
        AuthService,
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  describe('signup', () => {
    const dto: SignupDto = {
      email: 'Test@Example.com',
      password: 'StrongPass1!',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.procurement_officer,
    };

    it('rejects with 409 when the email is already in use', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' } as User);
      await expect(service.signup(dto, ctx)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('hashes, normalises, and persists the user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(
        async ({ data }) =>
          ({
            ...baseUser,
            ...data,
          }) as User,
      );

      const result = await service.signup(dto, ctx);

      expect(passwordService.hash).toHaveBeenCalledWith(dto.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          role: Role.procurement_officer,
          status: UserStatus.active,
        }),
      });
      expect(result.email).toBe('test@example.com');
      expect(eventEmitter.emit).toHaveBeenCalledWith('auth.user_signup', expect.any(Object));
    });
  });

  describe('login', () => {
    const dto: LoginDto = { email: 'test@example.com', password: 'StrongPass1!' };

    it('blocks locked accounts with 401', async () => {
      loginAttemptService.isLocked.mockResolvedValue(true);
      await expect(service.login(dto, ctx)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'auth.login_failed',
        expect.objectContaining({ reason: 'account_locked' }),
      );
    });

    it('rejects unknown users and records a failure', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login(dto, ctx)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(loginAttemptService.recordFailure).toHaveBeenCalledWith('test@example.com');
    });

    it('rejects inactive users without recording a failure', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...baseUser, status: UserStatus.suspended });
      await expect(service.login(dto, ctx)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(loginAttemptService.recordFailure).not.toHaveBeenCalled();
    });

    it('rejects wrong passwords and triggers lockout email at threshold', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      passwordService.verify.mockResolvedValue(false);
      loginAttemptService.recordFailure.mockResolvedValue({ locked: true, failures: 5 });
      await expect(service.login(dto, ctx)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(emailQueue.add).toHaveBeenCalledWith(
        'account-locked',
        expect.objectContaining({ userId: baseUser.id }),
        expect.any(Object),
      );
    });

    it('issues tokens, persists a session and emits login_success', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      prisma.userSession.create.mockResolvedValue({ id: 'session-1' });
      prisma.userSession.update.mockResolvedValue({ id: 'session-1' });

      const result = await service.login(dto, ctx);

      expect(loginAttemptService.clearFailures).toHaveBeenCalledWith('test@example.com');
      expect(prisma.userSession.create).toHaveBeenCalled();
      expect(result.accessToken).toBe('access.jwt');
      expect(result.refreshToken).toBe('refresh.jwt');
      expect(result.user.userId).toBe(baseUser.id);
      expect(eventEmitter.emit).toHaveBeenCalledWith('auth.login_success', expect.any(Object));
    });
  });

  describe('refreshToken', () => {
    const dto: RefreshTokenDto = { refreshToken: 'old-refresh' };

    it('throws 401 when the refresh token is tampered with', async () => {
      tokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('bad');
      });
      await expect(service.refreshToken(dto, ctx)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('wipes all sessions on token reuse (compromise detection)', async () => {
      prisma.userSession.findUnique.mockResolvedValue(null);
      await expect(service.refreshToken(dto, ctx)).rejects.toThrow(/reuse/);
      expect(prisma.userSession.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'auth.session_compromised',
        expect.any(Object),
      );
    });

    it('rejects expired sessions and removes them', async () => {
      prisma.userSession.findUnique.mockResolvedValue({
        id: 's-1',
        userId: 'user-1',
        refreshTokenHash: 'h',
        ipAddress: '127.0.0.1',
        userAgent: null,
        expiresAt: new Date(Date.now() - 1000),
        createdAt: new Date(),
        user: baseUser,
      });
      await expect(service.refreshToken(dto, ctx)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.userSession.delete).toHaveBeenCalledWith({ where: { id: 's-1' } });
    });

    it('rotates tokens and persists a fresh session on success', async () => {
      prisma.userSession.findUnique.mockResolvedValue({
        id: 's-1',
        userId: 'user-1',
        refreshTokenHash: 'h',
        ipAddress: '127.0.0.1',
        userAgent: null,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        user: baseUser,
      });
      prisma.userSession.create.mockResolvedValue({ id: 'session-2' });
      prisma.userSession.update.mockResolvedValue({ id: 'session-2' });

      const result = await service.refreshToken(dto, ctx);
      expect(prisma.userSession.delete).toHaveBeenCalledWith({ where: { id: 's-1' } });
      expect(result.accessToken).toBe('access.jwt');
    });

    it('wipes sessions for inactive users on refresh', async () => {
      prisma.userSession.findUnique.mockResolvedValue({
        id: 's-1',
        userId: 'user-1',
        refreshTokenHash: 'h',
        ipAddress: '127.0.0.1',
        userAgent: null,
        expiresAt: new Date(Date.now() + 60_000),
        createdAt: new Date(),
        user: { ...baseUser, status: UserStatus.suspended },
      });
      await expect(service.refreshToken(dto, ctx)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.userSession.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });
  });

  describe('logout', () => {
    it('removes the matching session when a refresh token is supplied', async () => {
      prisma.userSession.delete.mockResolvedValue({ id: 's-1' });
      await service.logout('user-1', 'refresh-1', ctx);
      expect(prisma.userSession.delete).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('auth.user_logout', expect.any(Object));
    });

    it('wipes every session for the user when no refresh token is supplied', async () => {
      prisma.userSession.deleteMany.mockResolvedValue({ count: 0 });
      await service.logout('user-1', undefined, ctx);
      expect(prisma.userSession.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });
  });

  describe('forgotPassword', () => {
    const dto: ForgotPasswordDto = { email: 'test@example.com' };

    it('is a no-op (no email queued) when the user is unknown', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await service.forgotPassword(dto, ctx);
      expect(prisma.passwordReset.create).not.toHaveBeenCalled();
      expect(emailQueue.add).not.toHaveBeenCalled();
    });

    it('persists a reset token, enqueues email and emits event when user exists', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser);
      prisma.passwordReset.create.mockResolvedValue({});
      await service.forgotPassword(dto, ctx);
      expect(prisma.passwordReset.create).toHaveBeenCalled();
      expect(emailQueue.add).toHaveBeenCalledWith(
        'password-reset',
        expect.objectContaining({ userId: baseUser.id }),
        expect.any(Object),
      );
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'auth.password_reset_requested',
        expect.any(Object),
      );
    });
  });

  describe('resetPassword', () => {
    const dto: ResetPasswordDto = { token: 'reset-token-abc', newPassword: 'NewStrong1!' };

    it('rejects unknown/expired/used tokens with 400', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue(null);
      await expect(service.resetPassword(dto, ctx)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects used tokens', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        resetTokenHash: 'h',
        isUsed: true,
        expiresAt: new Date(Date.now() + 60_000),
        user: baseUser,
      });
      await expect(service.resetPassword(dto, ctx)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects expired tokens', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        resetTokenHash: 'h',
        isUsed: false,
        expiresAt: new Date(Date.now() - 1000),
        user: baseUser,
      });
      await expect(service.resetPassword(dto, ctx)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates password, marks token used, and wipes sessions on success', async () => {
      prisma.passwordReset.findUnique.mockResolvedValue({
        id: 'r-1',
        userId: 'u-1',
        resetTokenHash: 'h',
        isUsed: false,
        expiresAt: new Date(Date.now() + 60_000),
        user: baseUser,
      });
      prisma.$transaction.mockImplementation(async (ops: unknown) => ops);
      await service.resetPassword(dto, ctx);
      expect(passwordService.hash).toHaveBeenCalledWith(dto.newPassword);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'auth.password_reset_success',
        expect.any(Object),
      );
    });
  });
});
