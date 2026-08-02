import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('email-notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    const { to, subject, body } = job.data;
    
    this.logger.log(`[Queue Worker] Processing email job ID: ${job.id}`);
    this.logger.log(`[Queue Worker] Delivery target: ${to}`);
    this.logger.log(`[Queue Worker] Subject: ${subject}`);
    this.logger.log(`[Queue Worker] Body: ${body}`);
    
    // SMTP/Resend integration point
    return { success: true };
  }
}
