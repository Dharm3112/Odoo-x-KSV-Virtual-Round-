import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

// Queue names as constants for type-safe referencing
export const QUEUE_EMAIL_NOTIFICATIONS = 'email-notifications';
export const QUEUE_PDF_GENERATION = 'pdf-generation';
export const QUEUE_REPORT_EXPORT = 'report-export';
export const DEFAULT_QUEUE_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
};

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUE_EMAIL_NOTIFICATIONS,
        defaultJobOptions: {
          ...DEFAULT_QUEUE_JOB_OPTIONS,
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      },
      {
        name: QUEUE_PDF_GENERATION,
        defaultJobOptions: {
          ...DEFAULT_QUEUE_JOB_OPTIONS,
          removeOnComplete: 50,
          removeOnFail: 200,
        },
      },
      {
        name: QUEUE_REPORT_EXPORT,
        defaultJobOptions: {
          ...DEFAULT_QUEUE_JOB_OPTIONS,
          removeOnComplete: 30,
          removeOnFail: 100,
        },
      },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
