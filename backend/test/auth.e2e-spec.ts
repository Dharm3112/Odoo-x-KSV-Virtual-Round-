import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomBytes } from 'node:crypto';
import request = require('supertest');
import { GlobalExceptionFilter } from '@common/exceptions';
import { ResponseInterceptor } from '@common/interceptors';
import { PrismaService } from '@infra/database/prisma.service';
import { AppModule } from '../src/app.module';

jest.setTimeout(60000);

const STRONG_PASSWORD = 'TestPass123!';

function uniqueEmail(): string {
  return `auth-e2e-${Date.now()}-${randomBytes(3).toString('hex')}@vendorbridge.test`;
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
    prisma = app.get(PrismaService);
  }, 60000);

  afterAll(async () => {
    await app.close();
  }, 60000);

  it('rejects signup when the role is "vendor"', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/auth/signup').send({
      email: uniqueEmail(),
      password: STRONG_PASSWORD,
      firstName: 'Test',
      lastName: 'User',
      role: 'vendor',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('rejects signup with a weak password', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/auth/signup').send({
      email: uniqueEmail(),
      password: 'weak',
      firstName: 'Test',
      lastName: 'User',
      role: 'procurement_officer',
    });

    expect(response.status).toBe(400);
  });

  it('completes the full signup → login → refresh → logout lifecycle', async () => {
    const email = uniqueEmail();

    const signup = await request(app.getHttpServer()).post('/api/v1/auth/signup').send({
      email,
      password: STRONG_PASSWORD,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'procurement_officer',
    });

    expect(signup.status).toBe(201);
    expect(signup.body.success).toBe(true);
    expect(signup.body.data.email).toBe(email);
    expect(signup.body.data.role).toBe('procurement_officer');

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: STRONG_PASSWORD });

    expect(login.status).toBe(200);
    expect(login.body.data.accessToken).toEqual(expect.any(String));
    expect(login.body.data.refreshToken).toEqual(expect.any(String));
    expect(login.body.data.user.email).toBe(email);

    const accessToken = login.body.data.accessToken as string;
    const refreshToken = login.body.data.refreshToken as string;

    const refresh = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken });

    expect(refresh.status).toBe(200);
    expect(refresh.body.data.accessToken).toEqual(expect.any(String));
    const newRefresh = refresh.body.data.refreshToken as string;
    expect(newRefresh).not.toBe(refreshToken);

    // Reusing the old refresh token must trigger the compromise response.
    const reuse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh-token')
      .send({ refreshToken });

    expect(reuse.status).toBe(401);

    const logout = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken: newRefresh });

    expect(logout.status).toBe(200);
    expect(logout.body.success).toBe(true);

    // Verify the user persisted with an Argon2id hash.
    const persisted = await prisma.user.findUnique({ where: { email } });
    expect(persisted).not.toBeNull();
    expect(persisted!.passwordHash.startsWith('$argon2id$')).toBe(true);
  });

  it('returns 401 on wrong password and persists a session on success', async () => {
    const email = uniqueEmail();
    await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({
        email,
        password: STRONG_PASSWORD,
        firstName: 'Wrong',
        lastName: 'Pass',
        role: 'manager',
      })
      .expect(201);

    const wrong = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPass1!' });
    expect(wrong.status).toBe(401);

    const ok = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: STRONG_PASSWORD });
    expect(ok.status).toBe(200);

    const sessions = await prisma.userSession.findMany({ where: { user: { email } } });
    expect(sessions.length).toBe(1);
    expect(sessions[0].refreshTokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('forgot-password always returns 200 even for unknown emails', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nobody-here@vendorbridge.test' });
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/reset link/i);
  });
});
