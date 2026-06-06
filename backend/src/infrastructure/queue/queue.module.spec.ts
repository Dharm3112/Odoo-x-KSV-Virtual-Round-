import {
  DEFAULT_QUEUE_JOB_OPTIONS,
  QUEUE_EMAIL_NOTIFICATIONS,
  QUEUE_PDF_GENERATION,
  QUEUE_REPORT_EXPORT,
} from './queue.module';

describe('Queue infrastructure', () => {
  it('exports stable queue names', () => {
    expect([QUEUE_EMAIL_NOTIFICATIONS, QUEUE_PDF_GENERATION, QUEUE_REPORT_EXPORT]).toEqual([
      'email-notifications',
      'pdf-generation',
      'report-export',
    ]);
  });

  it('uses three attempts with exponential backoff', () => {
    expect(DEFAULT_QUEUE_JOB_OPTIONS).toEqual({
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  });
});
