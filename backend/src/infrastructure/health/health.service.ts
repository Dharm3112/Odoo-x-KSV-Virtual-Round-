import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { AntivirusService } from '@infra/antivirus/antivirus.service';
import { PrismaService } from '@infra/database/prisma.service';
import { StorageService } from '@infra/storage/storage.service';

type DependencyStatus = { status: 'up' | 'down'; message?: string };

export interface SystemHealth {
  status: 'ok' | 'degraded';
  timestamp: string;
  dependencies: {
    database: DependencyStatus;
    redis: DependencyStatus;
    storage: DependencyStatus;
    antivirus: DependencyStatus;
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly antivirus: AntivirusService,
  ) {}

  async check(): Promise<SystemHealth> {
    const [database, redis, storage, antivirus] = await Promise.all([
      this.checkDependency(() => this.prisma.$queryRaw`SELECT 1`),
      this.checkDependency(() => this.pingRedis()),
      this.checkDependency(() => this.storage.verifyConnection()),
      this.checkDependency(async () => {
        if (!(await this.antivirus.ping())) throw new Error('ClamAV did not respond to PING');
      }),
    ]);
    const dependencies = { database, redis, storage, antivirus };

    return {
      status: Object.values(dependencies).every((item) => item.status === 'up') ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      dependencies,
    };
  }

  private async pingRedis(): Promise<void> {
    const redis = new Redis({
      host: this.configService.getOrThrow<string>('REDIS_HOST'),
      port: Number(this.configService.getOrThrow<string>('REDIS_PORT')),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    try {
      await redis.connect();
      await redis.ping();
    } finally {
      redis.disconnect();
    }
  }

  private async checkDependency(check: () => Promise<unknown>): Promise<DependencyStatus> {
    try {
      await check();
      return { status: 'up' };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown dependency error',
      };
    }
  }
}
