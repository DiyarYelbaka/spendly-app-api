import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../exceptions/error-codes.enum';

/**
 * Global Exception Filter
 * Catches all exceptions and formats them according to frontend expectations
 * Implements ExceptionFilter interface from NestJS
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Request context for logging
    const requestId = request.headers['x-request-id'] || this.generateRequestId();
    const userId = (request as any).user?.id || 'anonymous';
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let messageKey = ErrorCode.SERVER_ERROR;
    let error = ErrorCode.SERVER_ERROR;
    let fields: any = null;

    // Handle HttpException (NestJS exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        messageKey = responseObj.message_key || responseObj.messageKey || this.getErrorCode(status);
        error = responseObj.error || this.getErrorCode(status);
        fields = responseObj.fields || null;
      } else {
        message = exceptionResponse as string;
        messageKey = this.getErrorCode(status);
        error = this.getErrorCode(status);
      }

      // Handle validation errors (class-validator format)
      if (status === HttpStatus.BAD_REQUEST && Array.isArray((exceptionResponse as any)?.message)) {
        const validationErrors = (exceptionResponse as any).message;
        fields = {};
        validationErrors.forEach((error: any) => {
          if (error.property) {
            fields[error.property] = Object.values(error.constraints || {}).map(
              (constraint: string) => ({
                message: constraint,
                value: error.value,
                location: 'body',
              }),
            );
          }
        });
        messageKey = ErrorCode.VALIDATION_ERROR;
        error = ErrorCode.VALIDATION_ERROR;
        message = 'Doğrulama hatası';
      }
    } 
    // Handle generic Error
    else if (exception instanceof Error) {
      message = exception.message;
      messageKey = ErrorCode.SERVER_ERROR;
      error = ErrorCode.SERVER_ERROR;
    }

    // Enhanced logging with context
    const logContext = {
      requestId,
      userId,
      method: request.method,
      url: request.url,
      status,
      message,
      timestamp,
    };

    if (status >= 500) {
      // Server errors - log with stack trace
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify(logContext),
      );
    } else {
      // Client errors - log without stack trace
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} - ${status} - ${message}`,
        JSON.stringify(logContext),
      );
    }

    // Frontend'in beklediği format
    const errorResponse = {
      success: false,
      message_key: messageKey,
      error: error,
      message: message,
      ...(fields && { fields }),
      ...(fields && {
        summary: `${Object.keys(fields).length} alanda hata bulundu`,
      }),
      // Development mode'da ekstra bilgi
      ...(process.env.NODE_ENV === 'development' && {
        requestId,
        timestamp,
        path: request.url,
      }),
    };

    response.status(status).json(errorResponse);
  }

  /**
   * Maps HTTP status codes to error codes
   */
  private getErrorCode(status: number): ErrorCode {
    const errorCodes: Record<number, ErrorCode> = {
      [HttpStatus.BAD_REQUEST]: ErrorCode.VALIDATION_ERROR,
      [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ErrorCode.INSUFFICIENT_PERMISSIONS,
      [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
      [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.VALIDATION_ERROR,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.SERVER_ERROR,
    };

    return errorCodes[status] || ErrorCode.SERVER_ERROR;
  }

  /**
   * Generates a unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

