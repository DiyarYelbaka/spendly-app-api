import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    // Gmail SMTP yapılandırması
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('MAIL_KEY'), // App Password (boşluklar dahil)
      },
    });
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"${this.configService.get<string>('EMAIL_FROM_NAME', 'Spendly')}" <${this.configService.get<string>('EMAIL_FROM')}>`,
        to: email,
        subject: 'Şifre Sıfırlama Kodu - Spendly',
        html: this.getPasswordResetTemplate(code),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset code sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset code to ${email}`, error);
      throw error;
    }
  }

  private getPasswordResetTemplate(code: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 8px;
          }
          .code {
            font-size: 32px;
            letter-spacing: 5px;
            color: #4F46E5;
            text-align: center;
            font-weight: bold;
            margin: 20px 0;
            padding: 15px;
            background-color: #ffffff;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Şifre Sıfırlama Kodu</h2>
          <p>Merhaba,</p>
          <p>Şifre sıfırlama talebiniz için doğrulama kodunuz:</p>
          <div class="code">${code}</div>
          <p>Bu kod <strong>15 dakika</strong> geçerlidir.</p>
          <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
          <div class="footer">
            <p>Saygılarımızla,<br><strong>Spendly Ekibi</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

