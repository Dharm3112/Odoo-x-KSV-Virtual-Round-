import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';

export const THROTTLER_REDIS = Symbol('THROTTLER_REDIS');

const KEY_PREFIX = 'throttler:';

/**
 * Redis-backed implementation of NestJS throttler's `ThrottlerStorage`.
 *
 * The official in-memory storage is unsuitable for multi-instance deployments
 * (e.g. when running multiple API replicas behind a load balancer), so we
 * store counters in Redis. Each call to `increment` performs an atomic
 * `INCR` followed by an `EXPIRE` (only on the first hit) so the TTL window
 * lines up with the first request of the window.
 */
@Injectable()
export class ThrottlerRedisStorage implements ThrottlerStorage, OnModuleDestroy {
  private readonly logger = new Logger(ThrottlerRedisStorage.name);

  constructor(@Inject(THROTTLER_REDIS) private readonly redis: Redis) {}

  static buildClient(configService: ConfigService): Redis {
    return new Redis({
      host: configService.getOrThrow<string>('REDIS_HOST'),
      port: Number(configService.getOrThrow<string>('REDIS_PORT')),
      password: configService.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
    });
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.redis.quit();
    } catch {
      this.redis.disconnect();
    }
  }

  async increment(key: string, ttl: number): Promise<{ totalHits: number; timeToExpire: number }> {
    const redisKey = `${KEY_PREFIX}${key}`;
    const totalHits = await this.redis.incr(redisKey);
    if (totalHits === 1) {
      await this.redis.expire(redisKey, Math.max(1, Math.ceil(ttl / 1000)));
    }
    const timeToExpire = await this.redis.pttl(redisKey);
    return {
      totalHits,
      timeToExpire: timeToExpire > 0 ? timeToExpire : Math.max(1, Math.ceil(ttl / 1000)) * 1000,
    };
  }
}
