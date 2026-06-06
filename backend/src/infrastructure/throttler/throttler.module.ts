import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { THROTTLER_REDIS, ThrottlerRedisStorage } from './throttler-redis.storage';

@Global()
@Module({
  providers: [
    {
      provide: THROTTLER_REDIS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis =>
        ThrottlerRedisStorage.buildClient(configService),
    },
    {
      provide: ThrottlerRedisStorage,
      inject: [THROTTLER_REDIS],
      useFactory: (redis: Redis) => new ThrottlerRedisStorage(redis),
    },
  ],
  exports: [ThrottlerRedisStorage, THROTTLER_REDIS],
})
export class ThrottlerInfraModule {}
