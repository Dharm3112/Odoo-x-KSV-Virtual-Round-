import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { Role, UserStatus } from '@prisma/client';
import { PrismaService } from '@infra/database/prisma.service';

export interface JwtRequestUser {
  userId: string;
  email: string;
  role: Role;
  status: UserStatus;
  firstName: string;
  lastName: string;
}

interface AccessTokenClaims {
  sub: string;
  email: string;
  role: string;
  iss?: string;
  iat?: number;
  exp?: number;
}

const JWT_ISSUER = 'vendorbridge-auth';
const CLOCK_TOLERANCE_SECONDS = 60;

/**
 * Passport JWT strategy used by the global `JwtAuthGuard`.
 *
 * Behaviour:
 * - Verifies the RS256 signature using `JWT_PUBLIC_KEY`.
 * - Enforces the configured `vendorbridge-auth` issuer.
 * - Allows 60s clock skew tolerance (PRD §1.10).
 * - Looks the user up in the database on every request so a `suspended` or
 *   `inactive` status flips access off instantly (PRD §1.10) and any
 *   lingering sessions for that user are wiped.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const publicKey = (configService.get<string>('JWT_PUBLIC_KEY') || '').replace(/\\n/g, '\n');
    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      issuer: JWT_ISSUER,
      algorithms: ['RS256'],
      jsonWebTokenOptions: { clockTolerance: CLOCK_TOLERANCE_SECONDS },
    };
    super(options);
  }

  async validate(payload: AccessTokenClaims): Promise<JwtRequestUser> {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Account no longer exists');
    }

    if (user.status !== UserStatus.active) {
      // Drop all lingering sessions for this user so refresh tokens stop working.
      await this.prisma.userSession.deleteMany({ where: { userId: user.id } });
      throw new UnauthorizedException('Account is not active');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
