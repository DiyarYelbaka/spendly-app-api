import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';
import { ErrorCode } from './error-codes.enum';

/**
 * Business logic exceptions
 * Used for domain-specific errors
 */
export class BusinessException extends BaseException {
  constructor(
    message: string,
    messageKey: ErrorCode,
    fields?: Record<string, any[]>,
  ) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message, messageKey, messageKey, fields);
  }
}

