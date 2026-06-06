import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';

// Infrastructure Modules
import { PrismaModule } from '@infra/database/prisma.module';
import { LoggerModule } from '@infra/logger/logger.module';
import { StorageModule } from '@infra/storage/storage.module';
import { MailModule } from '@infra/mail/mail.module';
import { PdfModule } from '@infra/pdf/pdf.module';
import { QueueModule } from '@infra/queue/queue.module';
import { AntivirusModule } from '@infra/antivirus/antivirus.module';
import { HealthModule } from '@infra/health/health.module';
import { validateEnvironment } from './config/environment';

// Domain Modules (will be registered as development progresses)
// import { AuthModule } from '@modules/auth/auth.module';
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

    // ====== Infrastructure Modules ======
    PrismaModule,
    LoggerModule,
    StorageModule,
    MailModule,
    PdfModule,
    QueueModule,
    AntivirusModule,
    HealthModule,

    // ====== Domain Modules (uncomment as they are built) ======
    // AuthModule,
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
})
export class AppModule {}
