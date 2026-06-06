import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  }, 30000);

  it('reports all local infrastructure dependencies as available', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health');
    expect(response.body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
      dependencies: {
        database: { status: 'up' },
        redis: { status: 'up' },
        storage: { status: 'up' },
        antivirus: { status: 'up' },
      },
    });
    expect(response.status).toBe(200);
  });
});
