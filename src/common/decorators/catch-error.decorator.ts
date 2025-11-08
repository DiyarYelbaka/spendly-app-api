import { Logger } from '@nestjs/common';
import { ErrorHandler } from '../utils/error-handler.util';

/**
 * Method Decorator: Try-Catch'i otomatik ekler
 * 
 * Kullanım:
 * @CatchError('Kategori oluşturulurken bir hata oluştu')
 * async create(dto: CreateCategoryDto, userId: string) {
 *   // try-catch'e gerek yok, decorator hallediyor
 *   return await this.prisma.category.create({...});
 * }
 */
export function CatchError(defaultMessage?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = new Logger(target.constructor.name);

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const context = `${target.constructor.name}.${propertyKey}`;
        const message = defaultMessage || `${propertyKey} işlemi sırasında bir hata oluştu`;
        ErrorHandler.handleError(error, logger, context, message);
      }
    };

    return descriptor;
  };
}

