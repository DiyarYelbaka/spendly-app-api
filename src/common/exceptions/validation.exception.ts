import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from './error-codes.enum';

/**
 * Validation exception
 * Used for input validation errors
 */
export class ValidationException extends BaseException {
  constructor(public fields: Record<string, any[]>) {
    super(
      HttpStatus.BAD_REQUEST,
      'Doğrulama hatası',
      ErrorCode.VALIDATION_ERROR,
      ErrorCode.VALIDATION_ERROR,
      fields,
    );
  }
}

