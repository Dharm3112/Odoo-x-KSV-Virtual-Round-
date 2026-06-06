import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Infrastructure Modules
import { PrismaModule } from '@infra/database/prisma.module';
import { LoggerModule } from '@infra/logger/logger.module';
import { StorageModule } from '@infra/storage/storage.module';
import { MailModule } from '@infra/mail/mail.module';
import { PdfModule } from '@infra/pdf/pdf.module';
import { QueueModule } from '@infra/queue/queue.module';
import { AntivirusModule } from '@infra/antivirus/antivirus.module';
import { HealthModule } from '@infra/health/health.module';
import { ThrottlerInfraModule } from '@infra/throttler/throttler.module';
import { ThrottlerRedisStorage } from '@infra/throttler/throttler-redis.storage';
import { validateEnvironment } from './config/environment';

// Domain Modules
import { AuthModule } from '@modules/auth/auth.module';
// import { DashboardModule } from '@modules/dashboard/dashboard.module';
// import { VendorsModule } from '@modules/vendors/vendors.module';
// import { RfqsModule } from '@modules/rfqs/rfqs.module';
// import { QuotationsModule } from '@modules/quotations/quotations.module';
// import { ApprovalsModule } from '@modules/approvals/approvals.module';
// import { PurchaseOrdersModule } from '@modules/purchase-orders/purchase-orders.module';
// import { InvoicesModule } from '@modules/invoices/invoices.module';
// import { ActivityLogsModule } from '@modules/activity-logs/activity-logs.module';
// import { ReportsModule } from '@modules/reports/reports.module';

@Module({
  imports: [
    // ====== Global Configuration ======
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validate: validateEnvironment,
    }),

    // ====== Event System ======
    EventEmitterModule.forRoot(),

    // ====== Task Scheduling (Cron Jobs) ======
    ScheduleModule.forRoot(),

    // ====== BullMQ Background Processing ======
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.getOrThrow<string>('REDIS_HOST'),
          port: Number(configService.getOrThrow<string>('REDIS_PORT')),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),

    // ====== Throttler (Redis-backed) ======
    ThrottlerInfraModule,
    ThrottlerModule.forRootAsync({
      inject: [ThrottlerRedisStorage],
      useFactory: (storage: ThrottlerRedisStorage) => ({
        storage,
        throttlers: [
          // Default 100 req/min per IP across the API. Routes that need a
          // tighter/different cap (login, password recovery) override with
          // the @Throttle decorator referencing the matching throttler name.
          { name: 'default', limit: 100, ttl: 60_000 },
          { name: 'login', limit: 10, ttl: 60_000 },
          { name: 'recovery', limit: 3, ttl: 3_600_000 },
        ],
      }),
    }),

    // ====== Infrastructure Modules ======
    PrismaModule,
    LoggerModule,
    StorageModule,
    MailModule,
    PdfModule,
    QueueModule,
    AntivirusModule,
    HealthModule,

    // ====== Domain Modules ======
    AuthModule,
    // DashboardModule,
    // VendorsModule,
    // RfqsModule,
    // QuotationsModule,
    // ApprovalsModule,
    // PurchaseOrdersModule,
    // InvoicesModule,
    // ActivityLogsModule,
    // ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
