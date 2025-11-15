import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import appConfig from '../../../appConfig';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    // Resend API yapılandırması
    // Railway Hobby plan'da SMTP engellenmiş, bu yüzden Resend API kullanıyoruz
    // Resend HTTPS API kullandığı için Railway'da çalışır
    
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!resendApiKey) {
      this.logger.warn('RESEND_API_KEY not found. Email service will not work.');
    } else {
      this.resend = new Resend(resendApiKey);
    }
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    try {
      // Resend API key kontrolü
      const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
      const emailFrom = this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('RESEND_FROM_EMAIL');

      if (!resendApiKey) {
        this.logger.error('RESEND_API_KEY is missing');
        throw new Error('Email yapılandırması eksik: RESEND_API_KEY');
      }

      if (!emailFrom) {
        this.logger.error('EMAIL_FROM or RESEND_FROM_EMAIL is missing');
        throw new Error('Email yapılandırması eksik: EMAIL_FROM veya RESEND_FROM_EMAIL');
      }

      // Resend client'ı yoksa oluştur
      if (!this.resend) {
        this.resend = new Resend(resendApiKey);
      }

      // Resend API ile email gönder
      // Resend'de "from" alanı sadece email adresi veya "Name <email>" formatında olabilir
      const emailFromName = this.configService.get<string>('EMAIL_FROM_NAME') || appConfig.email.fromName;
      const fromAddress = emailFromName ? `${emailFromName} <${emailFrom}>` : emailFrom;

      const { data, error } = await this.resend.emails.send({
        from: fromAddress,
        to: email,
        subject: 'Şifre Sıfırlama Kodu - Spendly',
        html: this.getPasswordResetTemplate(code),
      });

      if (error) {
        this.logger.error(`Resend API error:`, {
          error: JSON.stringify(error),
          message: error.message,
          name: error.name,
          from: fromAddress,
          to: email,
        });
        throw new Error(`Email gönderilemedi: ${error.message || 'Bilinmeyen hata'}`);
      }

      this.logger.log(`Password reset code sent to ${email} via Resend. Email ID: ${data?.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : String(error);
      
      this.logger.error(`Failed to send password reset code to ${email}`, {
        message: errorMessage,
        stack: errorStack,
        error: error,
      });
      
      // Daha anlamlı hata mesajı
      if (errorMessage.includes('Email yapılandırması eksik')) {
        throw new Error('Email servisi yapılandırılmamış. Lütfen sistem yöneticisine başvurun.');
      }
      
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

