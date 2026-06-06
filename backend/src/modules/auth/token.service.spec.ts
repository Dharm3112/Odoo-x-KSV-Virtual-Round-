import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { generateKeyPairSync } from 'node:crypto';
import { TokenService } from './token.service';

function toEnvValue(pem: string): string {
  return pem.replace(/\n/g, '\\n');
}

function buildConfig(pub: string, priv: string): ConfigService {
  return {
    get: jest.fn((key: string, fallback?: string) => {
      const map: Record<string, string> = {
        JWT_PRIVATE_KEY: toEnvValue(priv),
        JWT_PUBLIC_KEY: toEnvValue(pub),
        JWT_ACCESS_TOKEN_EXPIRY: '15m',
        JWT_REFRESH_TOKEN_EXPIRY: '7d',
      };
      return map[key] ?? fallback;
    }),
    getOrThrow: jest.fn(),
  } as unknown as ConfigService;
}

describe('TokenService', () => {
  let service: TokenService;
  let publicKey: string;
  let privateKey: string;

  beforeAll(() => {
    const keys = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: buildConfig(publicKey, privateKey) },
        TokenService,
      ],
    }).compile();
    service = moduleRef.get(TokenService);
  });

  it('issues an access token that can be verified and exposes its claims', () => {
    const token = service.issueAccessToken({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'admin',
    });
    const payload = service.verifyAccessToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.email).toBe('test@example.com');
    expect(payload.role).toBe('admin');
    expect(payload.iss).toBe('vendorbridge-auth');
    expect(payload.iat).toBeDefined();
    expect(payload.exp).toBeDefined();
  });

  it('issues a refresh token that can be verified', () => {
    const token = service.issueRefreshToken({ sub: 'user-1', sid: 'session-1' });
    const payload = service.verifyRefreshToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.sid).toBe('session-1');
    expect(payload.iss).toBe('vendorbridge-auth');
  });

  it('throws when verifying a tampered token', () => {
    const token = service.issueAccessToken({ sub: 'u', email: 'e@x.com', role: 'admin' });
    const tampered = token.slice(0, -2) + (token.endsWith('A') ? 'BB' : 'AA');
    expect(() => service.verifyAccessToken(tampered)).toThrow();
  });

  it('hashes refresh tokens deterministically with SHA-256', () => {
    const a = service.hashRefreshToken('abc');
    const b = service.hashRefreshToken('abc');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(service.hashRefreshToken('xyz')).not.toBe(a);
  });

  it('exposes the configured access/refresh TTL strings', () => {
    expect(service.accessTokenTtl).toBe('15m');
    expect(service.refreshTokenTtl).toBe('7d');
  });
});
