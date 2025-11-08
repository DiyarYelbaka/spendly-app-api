import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ErrorCode } from '../exceptions/error-codes.enum';

/**
 * Error Handler Utility
 * Prisma ve diğer hataları yakalayıp anlamlı exception'lara dönüştürür
 */
export class ErrorHandler {
  /**
   * Prisma hatalarını yakalayıp uygun exception'a dönüştürür
   */
  static handlePrismaError(
    error: unknown,
    logger: Logger,
    context: string,
    defaultMessage: string,
  ): never {
    // NestJS exception'ları direkt fırlat
    if (
      error instanceof HttpException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof BadRequestException ||
      error instanceof ForbiddenException
    ) {
      throw error;
    }

    // Prisma hatalarını yakala
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(`Prisma error in ${context}: ${error.message}`, error.stack);

      switch (error.code) {
        case 'P2002':
          // Unique constraint violation
          throw new ConflictException({
            message: defaultMessage || 'Bu kayıt zaten mevcut',
            messageKey: ErrorCode.CONFLICT,
            error: ErrorCode.CONFLICT,
          });

        case 'P2003':
          // Foreign key constraint violation
          throw new BadRequestException({
            message: defaultMessage || 'Geçersiz referans',
            messageKey: ErrorCode.INVALID_INPUT,
            error: ErrorCode.INVALID_INPUT,
          });

        case 'P2025':
          // Record not found
          throw new NotFoundException({
            message: defaultMessage || 'Kayıt bulunamadı',
            messageKey: ErrorCode.NOT_FOUND,
            error: ErrorCode.NOT_FOUND,
          });

        case 'P2014':
          // Required relation violation
          throw new BadRequestException({
            message: defaultMessage || 'Gerekli ilişki eksik',
            messageKey: ErrorCode.INVALID_INPUT,
            error: ErrorCode.INVALID_INPUT,
          });

        default:
          throw new InternalServerErrorException({
            message: defaultMessage || 'Veritabanı hatası',
            messageKey: ErrorCode.DATABASE_ERROR,
            error: ErrorCode.DATABASE_ERROR,
          });
      }
    }

    // Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      logger.error(`Prisma validation error in ${context}: ${error.message}`, error.stack);
      throw new BadRequestException({
        message: 'Geçersiz veri formatı',
        messageKey: ErrorCode.VALIDATION_ERROR,
        error: ErrorCode.VALIDATION_ERROR,
      });
    }

    // Diğer hatalar
    logger.error(`Unexpected error in ${context}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException({
      message: defaultMessage || 'Beklenmeyen bir hata oluştu',
      messageKey: ErrorCode.SERVER_ERROR,
      error: ErrorCode.SERVER_ERROR,
    });
  }

  /**
   * Generic error handler - tüm hataları yakalar
   */
  static handleError(
    error: unknown,
    logger: Logger,
    context: string,
    defaultMessage: string,
  ): never {
    return this.handlePrismaError(error, logger, context, defaultMessage);
  }
}

