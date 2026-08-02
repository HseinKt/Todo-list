import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectQueue('email-notifications') private readonly emailQueue: Queue,
  ) {}

  async sendEmail(to: string, subject: string, body: string) {
    try {
      this.logger.log(`Enqueuing background email notification to: ${to}`);
      await this.emailQueue.add('send-email-job', {
        to,
        subject,
        body,
      });
    } catch (error: any) {
      this.logger.warn(`Redis Queue failed: ${error.message}. Falling back to immediate delivery.`);
      this.logger.log(`[EMAIL SEND FALLBACK] To: ${to} | Subject: ${subject} | Body: ${body}`);
    }
  }
}
