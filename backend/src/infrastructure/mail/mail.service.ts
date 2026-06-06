import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
    contentType?: string;
  }>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'localhost'),
      port: Number(this.configService.get<string>('MAIL_PORT', '1025')),
      secure: false,
      auth: this.configService.get<string>('MAIL_USER')
        ? {
            user: this.configService.get<string>('MAIL_USER'),
            pass: this.configService.get<string>('MAIL_PASSWORD'),
          }
        : undefined,
    });
  }

  async verifyConnection(): Promise<void> {
    await this.transporter.verify();
  }

  /**
   * Send an email using the configured transporter.
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>(
          'MAIL_FROM',
          'VendorBridge ERP <noreply@vendorbridge.com>',
        ),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(`Email sent successfully: ${info.messageId} -> ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Send a password reset email.
   */
  async sendPasswordResetEmail(to: string, resetToken: string, firstName: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3001')}/reset-password?token=${resetToken}`;

    await this.sendMail({
      to,
      subject: 'VendorBridge - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4361ee; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">VendorBridge ERP - Procurement & Vendor Management</p>
        </div>
      `,
    });
  }

  /**
   * Send an RFQ invitation email to a vendor.
   */
  async sendRfqInvitation(
    to: string,
    vendorName: string,
    rfqCode: string,
    rfqTitle: string,
    deadline: string,
  ): Promise<void> {
    await this.sendMail({
      to,
      subject: `VendorBridge - New RFQ Invitation: ${rfqCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">New RFQ Invitation</h2>
          <p>Dear ${vendorName},</p>
          <p>You have been invited to submit a quotation for the following RFQ:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">RFQ Code</td><td style="padding: 8px; border: 1px solid #ddd;">${rfqCode}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Title</td><td style="padding: 8px; border: 1px solid #ddd;">${rfqTitle}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Deadline</td><td style="padding: 8px; border: 1px solid #ddd;">${deadline}</td></tr>
          </table>
          <p>Please log in to VendorBridge to review the details and submit your quotation before the deadline.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">VendorBridge ERP - Procurement & Vendor Management</p>
        </div>
      `,
    });
  }
}
