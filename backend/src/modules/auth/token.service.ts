import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { createHash } from 'node:crypto';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  iss: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  iss: string;
  iat?: number;
  exp?: number;
}

const JWT_ISSUER = 'vendorbridge-auth';
const CLOCK_TOLERANCE_SECONDS = 60;
const DEFAULT_ACCESS_TTL = '15m';
const DEFAULT_REFRESH_TTL = '7d';

/**
 * Token service handling RS256-signed JWT issuance and verification.
 *
 * - Access tokens: short-lived (default 15m), carry `sub`, `email`, `role`.
 * - Refresh tokens: long-lived (default 7d), carry `sub` and `sid` (session id).
 * - The refresh token is **never stored verbatim**: the persisted record in
 *   `user_sessions` stores only its SHA-256 hash. `hashRefreshToken` returns
 *   the hex digest used as the unique column value.
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly accessTtl: string;
  private readonly refreshTtl: string;
  private readonly jwt: JwtService;

  constructor(configService: ConfigService) {
    const privateKey = this.readKey(configService, 'JWT_PRIVATE_KEY', 'private');
    const publicKey = this.readKey(configService, 'JWT_PUBLIC_KEY', 'public');

    this.accessTtl = configService.get<string>('JWT_ACCESS_TOKEN_EXPIRY', DEFAULT_ACCESS_TTL);
    this.refreshTtl = configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY', DEFAULT_REFRESH_TTL);

    this.jwt = new JwtService({
      privateKey,
      publicKey,
      signOptions: {
        algorithm: 'RS256',
        issuer: JWT_ISSUER,
      },
      verifyOptions: {
        algorithms: ['RS256'],
        issuer: JWT_ISSUER,
        clockTolerance: CLOCK_TOLERANCE_SECONDS,
      },
    });
  }

  issueAccessToken(payload: { sub: string; email: string; role: string }): string {
    const options: JwtSignOptions = { expiresIn: this.accessTtl as JwtSignOptions['expiresIn'] };
    return this.jwt.sign(payload, options);
  }

  issueRefreshToken(payload: { sub: string; sid: string }): string {
    const options: JwtSignOptions = { expiresIn: this.refreshTtl as JwtSignOptions['expiresIn'] };
    return this.jwt.sign(payload, options);
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.jwt.verify<AccessTokenPayload>(token);
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.jwt.verify<RefreshTokenPayload>(token);
  }

  /**
   * Returns the SHA-256 hex digest of the supplied token. The refresh-token
   * column in `user_sessions` stores this digest so raw tokens are never
   * persisted in plain text.
   */
  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  get accessTokenTtl(): string {
    return this.accessTtl;
  }

  get refreshTokenTtl(): string {
    return this.refreshTtl;
  }

  private readKey(
    configService: ConfigService,
    name: string,
    _label: 'private' | 'public',
  ): string {
    const raw = configService.get<string>(name);
    if (!raw) {
      throw new Error(`${name} is not set in the environment`);
    }
    return raw.replace(/\\n/g, '\n');
  }
}
