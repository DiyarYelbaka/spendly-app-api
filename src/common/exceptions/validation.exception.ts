import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(public fields: Record<string, any[]>) {
    super({
      success: false,
      message_key: 'VALIDATION_ERROR',
      error: 'VALIDATION_ERROR',
      fields,
      summary: `${Object.keys(fields).length} alanda hata bulundu`,
      message: 'Doğrulama hatası',
    });
  }
}

