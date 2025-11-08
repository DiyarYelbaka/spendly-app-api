import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponse {
  success: false;
  message_key: string;
  error: string;
  message: string;
  fields?: Record<string, any[]>;
  summary?: string;
}

/**
 * Base exception class for all custom exceptions
 * Provides consistent error response format
 */
export abstract class BaseException extends HttpException {
  constructor(
    status: HttpStatus,
    message: string,
    messageKey: string,
    error: string,
    fields?: Record<string, any[]>,
  ) {
    const response: ErrorResponse = {
      success: false,
      message_key: messageKey,
      error: error,
      message: message,
      ...(fields && { fields }),
      ...(fields && {
        summary: `${Object.keys(fields).length} alanda hata bulundu`,
      }),
    };

    super(response, status);
  }
}

