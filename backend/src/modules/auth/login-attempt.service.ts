import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

const FAILURE_KEY_PREFIX = 'login:fail:';
const LOCK_KEY_PREFIX = 'login:lock:';
const FAILURE_WINDOW_SECONDS = 15 * 60;
const LOCK_DURATION_SECONDS = 15 * 60;
const MAX_FAILURES_BEFORE_LOCK = 5;

@Injectable()
export class LoginAttemptService implements OnModuleDestroy {
  private readonly logger = new Logger(LoginAttemptService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleDestroy(): Promise<void> {
    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    }
  }

  static buildClient(configService: ConfigService): Redis {
    return new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: Number(configService.getOrThrow<string>('REDIS_PORT')),
      password: configService.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });
  }

  /**
   * Returns true when the account is currently locked out.
   */
  async isLocked(email: string): Promise<boolean> {
    const lockKey = `${LOCK_KEY_PREFIX}${this.normalise(email)}`;
    const exists = await this.redis.exists(lockKey);
    return exists === 1;
  }

  /**
   * Increments the failure counter for the supplied email.
   * Locks the account for `LOCK_DURATION_SECONDS` once the threshold is hit.
   */
  async recordFailure(email: string): Promise<{ locked: boolean; failures: number }> {
    const normalised = this.normalise(email);
    const failureKey = `${FAILURE_KEY_PREFIX}${normalised}`;
    const lockKey = `${LOCK_KEY_PREFIX}${normalised}`;

    const failures = await this.redis.incr(failureKey);
    if (failures === 1) {
      await this.redis.expire(failureKey, FAILURE_WINDOW_SECONDS);
    }

    if (failures >= MAX_FAILURES_BEFORE_LOCK) {
      await this.redis.set(lockKey, '1', 'EX', LOCK_DURATION_SECONDS);
      return { locked: true, failures };
    }

    return { locked: false, failures };
  }

  /**
   * Clears failure state once the user successfully authenticates.
   */
  async clearFailures(email: string): Promise<void> {
    const normalised = this.normalise(email);
    await this.redis.del(`${FAILURE_KEY_PREFIX}${normalised}`);
  }

  static get maxFailures(): number {
    return MAX_FAILURES_BEFORE_LOCK;
  }

  static get lockDurationSeconds(): number {
    return LOCK_DURATION_SECONDS;
  }

  private normalise(email: string): string {
    return email.trim().toLowerCase();
  }
}
