import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    }),

    // ====== Event System ======
    EventEmitterModule.forRoot(),

    // ====== Task Scheduling (Cron Jobs) ======
    ScheduleModule.forRoot(),

    // ====== BullMQ Background Processing ======
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    // ====== Infrastructure Modules ======
    PrismaModule,
    LoggerModule,
    StorageModule,
    MailModule,
    PdfModule,
    QueueModule,

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
