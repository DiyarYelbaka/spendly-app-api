import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let messageKey = 'SERVER_ERROR';
    let error = 'SERVER_ERROR';
    let fields: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        messageKey = responseObj.messageKey || this.getErrorCode(status);
        error = responseObj.error || this.getErrorCode(status);
        fields = responseObj.fields || null;
      } else {
        message = exceptionResponse as string;
        messageKey = this.getErrorCode(status);
        error = this.getErrorCode(status);
      }

      // Validation errors için özel format
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
        messageKey = 'VALIDATION_ERROR';
        error = 'VALIDATION_ERROR';
        message = 'Doğrulama hatası';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      messageKey = 'SERVER_ERROR';
      error = 'SERVER_ERROR';
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

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
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'AUTH_TOKEN_INVALID',
      403: 'INSUFFICIENT_PERMISSIONS',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      500: 'SERVER_ERROR',
    };

    return errorCodes[status] || 'SERVER_ERROR';
  }
}

