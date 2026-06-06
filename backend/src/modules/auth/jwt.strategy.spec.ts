import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { generateKeyPairSync } from 'node:crypto';
import { Role, UserStatus } from '@prisma/client';
import { PrismaService } from '@infra/database/prisma.service';
import { JwtStrategy } from './jwt.strategy';

function buildConfig(pub: string): ConfigService {
  return {
    get: jest.fn((key: string, fallback?: string) => {
      const map: Record<string, string> = {
        JWT_PUBLIC_KEY: pub.replace(/\n/g, '\\n'),
      };
      return map[key] ?? fallback;
    }),
    getOrThrow: jest.fn(),
  } as unknown as ConfigService;
}

describe('JwtStrategy', () => {
  let publicKey: string;
  let prismaMock: {
    user: { findUnique: jest.Mock };
    userSession: { deleteMany: jest.Mock };
  };
  let strategy: JwtStrategy;

  beforeAll(() => {
    const keys = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    publicKey = keys.publicKey;
  });

  beforeEach(async () => {
    prismaMock = {
      user: { findUnique: jest.fn() },
      userSession: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: buildConfig(publicKey) },
        { provide: PrismaService, useValue: prismaMock },
        JwtStrategy,
      ],
    }).compile();
    strategy = moduleRef.get(JwtStrategy);
  });

  it('returns a sanitised user when the database record exists and is active', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u-1',
      email: 'a@b.com',
      role: Role.admin,
      status: UserStatus.active,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    const result = await strategy.validate({
      sub: 'u-1',
      email: 'a@b.com',
      role: 'admin',
    });
    expect(result).toEqual({
      userId: 'u-1',
      email: 'a@b.com',
      role: Role.admin,
      status: UserStatus.active,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
  });

  it('rejects when the user record does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(strategy.validate({ sub: 'missing', email: 'x', role: 'admin' })).rejects.toThrow(
      'Account no longer exists',
    );
  });

  it('rejects and wipes sessions when the user is not active', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u-1',
      email: 'a@b.com',
      role: Role.admin,
      status: UserStatus.suspended,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });
    await expect(
      strategy.validate({ sub: 'u-1', email: 'a@b.com', role: 'admin' }),
    ).rejects.toThrow('Account is not active');
    expect(prismaMock.userSession.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u-1' } });
  });

  it('rejects when the payload has no subject', async () => {
    await expect(strategy.validate({ sub: '', email: 'x', role: 'admin' })).rejects.toThrow(
      'Invalid authentication token',
    );
  });
});
