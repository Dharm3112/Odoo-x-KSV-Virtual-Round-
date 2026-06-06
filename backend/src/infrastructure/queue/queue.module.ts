import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

// Queue names as constants for type-safe referencing
export const QUEUE_EMAIL_NOTIFICATIONS = 'email-notifications';
export const QUEUE_PDF_GENERATION = 'pdf-generation';
export const QUEUE_REPORT_EXPORT = 'report-export';

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUE_EMAIL_NOTIFICATIONS,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      },
      {
        name: QUEUE_PDF_GENERATION,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: 50,
          removeOnFail: 200,
        },
      },
      {
        name: QUEUE_REPORT_EXPORT,
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 30,
          removeOnFail: 100,
        },
      },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
