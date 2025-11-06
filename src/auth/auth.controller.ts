import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı' })
  @ApiResponse({
    status: 201,
    description: 'Kullanıcı başarıyla oluşturuldu',
  })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  @ApiResponse({ status: 409, description: 'Email zaten kullanılıyor' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      success: true,
      message_key: 'AUTH_REGISTER_SUCCESS',
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: result,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı' })
  @ApiResponse({ status: 401, description: 'Email veya şifre hatalı' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      success: true,
      message_key: 'AUTH_LOGIN_SUCCESS',
      message: 'Giriş başarılı',
      data: result,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Access token yenileme' })
  @ApiResponse({ status: 200, description: 'Token yenilendi' })
  @ApiResponse({ status: 401, description: 'Geçersiz refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refresh(dto);
    return {
      success: true,
      message_key: 'AUTH_TOKEN_REFRESH_SUCCESS',
      message: 'Token yenilendi',
      data: result,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Kullanıcı çıkışı' })
  @ApiResponse({ status: 200, description: 'Çıkış başarılı' })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto);
    return {
      success: true,
      message_key: 'AUTH_LOGOUT_SUCCESS',
      message: 'Çıkış başarılı',
      data: null,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mevcut kullanıcı profili' })
  @ApiResponse({ status: 200, description: 'Profil bilgileri alındı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getProfile(@CurrentUser() user: any) {
    const result = await this.authService.getProfile(user.id);
    return {
      success: true,
      message_key: 'AUTH_PROFILE_RETRIEVED',
      message: 'Profil bilgileri alındı',
      data: result,
    };
  }
}

