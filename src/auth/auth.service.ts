import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../core';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ErrorHandler, DEFAULT_CATEGORIES, CategoryType } from '../core';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      // Email kontrolü
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException({
          message: 'Bu email adresi zaten kullanılıyor',
          messageKey: 'EMAIL_ALREADY_EXISTS',
          error: 'CONFLICT',
        });
      }

      // Password ve confirmPassword eşleşme kontrolü
      if (dto.password !== dto.confirmPassword) {
        throw new BadRequestException({
          message: 'Şifreler eşleşmiyor',
          messageKey: 'PASSWORD_MISMATCH',
          error: 'BAD_REQUEST',
          fields: {
            confirmPassword: [
              {
                message: 'Şifreler eşleşmiyor',
                value: dto.confirmPassword,
                location: 'body',
              },
            ],
          },
        });
      }

      // Password hash
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Transaction içinde user ve default kategorileri oluştur
      // Eğer herhangi bir işlem başarısız olursa, tüm işlemler geri alınır (rollback)
      const result = await this.prisma.$transaction(async (tx: any) => {
        // User oluştur
        const user = await tx.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
          },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });

        // Default kategorileri oluştur
        await Promise.all(
          DEFAULT_CATEGORIES.map((cat) =>
            tx.category.create({
              data: {
                name: cat.nameKey, // nameKey i18next translation key'i olarak saklanır
                type: cat.type,
                icon: cat.icon,
                color: cat.color,
                sortOrder: cat.sortOrder,
                isDefault: true,
                userId: user.id,
              },
            }),
          ),
        );

        return user;
      });

      // JWT token oluştur (transaction dışında - veritabanı işlemi değil)
      const tokens = await this.generateTokens(result.id);

      return {
        user: result,
        tokens,
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'register',
        'Kullanıcı kaydı sırasında bir hata oluştu',
      );
    }
  }

  async login(dto: LoginDto) {
    try {
      // User bul
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new UnprocessableEntityException({
          message: 'Email veya şifre hatalı',
          messageKey: 'INVALID_CREDENTIALS',
          error: 'UNPROCESSABLE_ENTITY',
        });
      }

      // Password kontrolü
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);

      if (!isPasswordValid) {
        throw new UnprocessableEntityException({
          message: 'Email veya şifre hatalı',
          messageKey: 'INVALID_CREDENTIALS',
          error: 'UNPROCESSABLE_ENTITY',
        });
      }

      // JWT token oluştur
      const tokens = await this.generateTokens(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
        tokens,
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'login',
        'Giriş yapılırken bir hata oluştu',
      );
    }
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      // Refresh token'ı verify et
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
      });

      // User bul
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException({
          message: 'Kullanıcı bulunamadı',
          messageKey: 'UNAUTHORIZED',
          error: 'UNAUTHORIZED',
        });
      }

      // Yeni access token oluştur
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
          expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') || '7d') as import('ms').StringValue,
        },
      );

      return {
        accessToken,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Geçersiz refresh token',
        messageKey: 'INVALID_REFRESH_TOKEN',
        error: 'UNAUTHORIZED',
      });
    }
  }

  async logout(dto: RefreshTokenDto) {
    // Refresh token'ı verify et (geçerliliğini kontrol et)
    try {
      this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
      });
    } catch (error) {
      // Token geçersizse bile logout başarılı sayılır
    }

    return {
      message: 'Çıkış başarılı',
    };
  }

  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException({
          message: 'Kullanıcı bulunamadı',
          messageKey: 'UNAUTHORIZED',
          error: 'UNAUTHORIZED',
        });
      }

      // User context oluştur (frontend'in beklediği format)
      const userContext = {
        preferences: {},
        firstName: user.name.split(' ')[0] || user.name,
        initials: user.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2),
      };

      return {
        user,
        userContext,
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'getProfile',
        'Kullanıcı profili getirilirken bir hata oluştu',
      );
    }
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
      expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') || '7d') as import('ms').StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
      expiresIn: '30d' as import('ms').StringValue, // Refresh token daha uzun süreli
    });

    // Expires at hesapla
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';
    const expiresAt = new Date();
    if (expiresIn.endsWith('d')) {
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    } else if (expiresIn.endsWith('h')) {
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
    };
  }
}

