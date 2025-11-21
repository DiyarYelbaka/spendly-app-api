import { Injectable, Logger } from '@nestjs/common';
import { PrismaService, ErrorHandler } from '../core';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Kullanıcının hesabını devre dışı bırakır (soft delete).
   * @param userId - Hesabı devre dışı bırakılacak kullanıcının ID'si
   */
  async deactivateAccount(userId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
      return { message: 'Hesabınız başarıyla kapatılmıştır.' };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'deactivateAccount',
        'Hesap kapatılırken bir hata oluştu.',
      );
    }
  }
}
