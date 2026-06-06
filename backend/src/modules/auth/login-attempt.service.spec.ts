import Redis from 'ioredis';
import { LoginAttemptService } from './login-attempt.service';

function makeRedisStub(): jest.Mocked<Redis> {
  const store = new Map<string, { value: string; expiresAt: number }>();
  const stub = {
    incr: jest.fn(async (key: string) => {
      const existing = store.get(key);
      const now = Date.now();
      if (existing && existing.expiresAt <= now) {
        store.delete(key);
      }
      const current = existing ? Number(existing.value) : 0;
      const next = current + 1;
      store.set(key, { value: String(next), expiresAt: now + 60_000 });
      return next;
    }),
    expire: jest.fn(async () => 1),
    exists: jest.fn(async (...args: unknown[]) => {
      const key = args[0] as string;
      return store.has(key) ? 1 : 0;
    }),
    set: jest.fn(async (...args: unknown[]) => {
      const key = args[0] as string;
      const value = args[1] as string;
      const ttl = Number(args[3] ?? 60);
      store.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
      return 'OK';
    }),
    del: jest.fn(async (...args: unknown[]) => {
      const key = args[0] as string;
      return store.delete(key) ? 1 : 0;
    }),
    quit: jest.fn(async () => 'OK'),
    disconnect: jest.fn(),
  };
  return stub as unknown as jest.Mocked<Redis>;
}

describe('LoginAttemptService', () => {
  let redis: jest.Mocked<Redis>;
  let service: LoginAttemptService;

  beforeEach(() => {
    redis = makeRedisStub();
    service = new LoginAttemptService(redis);
  });

  it('is not locked initially', async () => {
    await expect(service.isLocked('user@example.com')).resolves.toBe(false);
  });

  it('locks the account after 5 failures and reports remaining counter', async () => {
    let result = await service.recordFailure('User@Example.com');
    expect(result.locked).toBe(false);
    expect(result.failures).toBe(1);
    result = await service.recordFailure('User@Example.com');
    expect(result.locked).toBe(false);
    result = await service.recordFailure('User@Example.com');
    expect(result.locked).toBe(false);
    result = await service.recordFailure('User@Example.com');
    expect(result.locked).toBe(false);
    result = await service.recordFailure('User@Example.com');
    expect(result.locked).toBe(true);
    expect(result.failures).toBe(5);
    await expect(service.isLocked('user@example.com')).resolves.toBe(true);
  });

  it('treats email case-insensitively', async () => {
    await service.recordFailure('Foo@Bar.com');
    await expect(service.isLocked('foo@bar.com')).resolves.toBe(false);
    for (let i = 0; i < 4; i += 1) {
      await service.recordFailure('foo@bar.com');
    }
    await expect(service.isLocked('FOO@bar.com')).resolves.toBe(true);
  });

  it('clears failures on successful login', async () => {
    await service.recordFailure('user@example.com');
    await service.recordFailure('user@example.com');
    await service.clearFailures('USER@example.com');
    await expect(service.isLocked('user@example.com')).resolves.toBe(false);
    const result = await service.recordFailure('user@example.com');
    expect(result.failures).toBe(1);
  });

  it('exposes lock and threshold constants', () => {
    expect(LoginAttemptService.maxFailures).toBe(5);
    expect(LoginAttemptService.lockDurationSeconds).toBe(15 * 60);
  });
});
