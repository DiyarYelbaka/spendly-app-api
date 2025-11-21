import { Controller, Delete, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../core';
import { UsersService } from './users.service';
import { SuccessResponseDto, MessageKey } from '../core';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Mevcut kullanıcının hesabını devre dışı bırakır.
   * @param user - JWT'den alınan kullanıcı bilgisi
   */
  @Delete('me')
  @ApiOperation({ summary: 'Kullanıcı Hesabını Devre Dışı Bırak' })
  @ApiResponse({ status: 200, description: 'Hesap başarıyla devre dışı bırakıldı.' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim.' })
  async deactivateAccount(@CurrentUser() user: UserPayload) {
    return this.usersService.deactivateAccount(user.id);
  }
}
