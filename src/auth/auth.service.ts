import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  UnprocessableEntityException,
  Logger,
  NotFoundException,
  GoneException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService, EmailService } from '../core';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ErrorHandler, DEFAULT_CATEGORIES, CategoryType } from '../core';
import appConfig from '../../appConfig';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
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

      // Tek bir obje olarak döndür (user bilgileri + frontend için formatlanmış bilgiler)
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        firstName: user.name.split(' ')[0] || user.name,
        initials: user.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2),
        preferences: {},
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

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; expiresIn: number }> {
    try {
      // Kullanıcı var mı kontrol et (güvenlik için belirsiz mesaj)
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      // Güvenlik: Kullanıcı yoksa bile başarı mesajı döndür
      if (!user) {
        // Log'la ama kullanıcıya belirsiz mesaj göster
        this.logger.warn(`Password reset requested for non-existent email: ${dto.email}`);
        return {
          message: 'Doğrulama kodu e-posta adresinize gönderildi',
          expiresIn: 15,
        };
      }

      // Rate limiting kontrolü (son 5 dakikada istek var mı?)
      // Hassas olmayan değer appConfig.js'den alınır
      const rateLimitMinutes = this.configService.get<number>('PASSWORD_RESET_RATE_LIMIT_MINUTES') || appConfig.passwordReset.rateLimitMinutes;
      const rateLimitTime = new Date();
      rateLimitTime.setMinutes(rateLimitTime.getMinutes() - rateLimitMinutes);

      const recentRequest = await this.prisma.passwordReset.findFirst({
        where: {
          email: dto.email,
          createdAt: { gte: rateLimitTime },
          isUsed: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentRequest) {
        throw new HttpException(
          {
            message: `Lütfen ${rateLimitMinutes} dakika sonra tekrar deneyin`,
            messageKey: 'TOO_MANY_REQUESTS',
            error: 'TOO_MANY_REQUESTS',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Süresi dolmuş kodları temizle
      await this.cleanupExpiredCodes(dto.email);

      // 6 haneli kod oluştur
      const code = this.generateResetCode();

      // Kod geçerlilik süresi (15 dakika)
      // Hassas olmayan değer appConfig.js'den alınır
      const expiresIn = this.configService.get<string>('PASSWORD_RESET_CODE_EXPIRES_IN') || appConfig.passwordReset.codeExpiresIn;
      const expiresAt = new Date();
      if (expiresIn.endsWith('m')) {
        expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiresIn));
      } else if (expiresIn.endsWith('h')) {
        expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
      }

      // PasswordReset kaydı oluştur
      await this.prisma.passwordReset.create({
        data: {
          email: dto.email,
          code,
          expiresAt,
          attempts: 0,
          isUsed: false,
        },
      });

      // E-posta gönder
      try {
        await this.emailService.sendPasswordResetCode(dto.email, code);
      } catch (emailError) {
        // Email hatası durumunda kaydı sil (kullanıcı tekrar deneyebilsin)
        await this.prisma.passwordReset.deleteMany({
          where: { email: dto.email, code },
        });
        
        const errorMessage = emailError instanceof Error ? emailError.message : 'Email gönderilemedi';
        this.logger.error(`Email sending failed for ${dto.email}`, {
          error: emailError,
          message: errorMessage,
        });
        
        // Email hatasını özel olarak işle
        throw new HttpException(
          {
            message: errorMessage.includes('yapılandırılmamış') || errorMessage.includes('kimlik doğrulama')
              ? errorMessage
              : 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.',
            messageKey: 'EMAIL_SEND_FAILED',
            error: 'EMAIL_ERROR',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        message: 'Doğrulama kodu e-posta adresinize gönderildi',
        expiresIn: 15,
      };
    } catch (error) {
      // HttpException ise direkt fırlat (yukarıdaki email hatası gibi)
      if (error instanceof HttpException) {
        throw error;
      }
      
      ErrorHandler.handleError(
        error,
        this.logger,
        'forgotPassword',
        'Şifre sıfırlama kodu gönderilirken bir hata oluştu',
      );
    }
  }

  async verifyResetCode(dto: VerifyCodeDto): Promise<{ message: string; token: string }> {
    try {
      // Kod kaydını bul
      const passwordReset = await this.prisma.passwordReset.findFirst({
        where: {
          email: dto.email,
          code: dto.code,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!passwordReset) {
        throw new NotFoundException({
          message: 'Geçersiz kod',
          messageKey: 'INVALID_RESET_CODE',
          error: 'NOT_FOUND',
        });
      }

      // Kod kullanılmış mı?
      if (passwordReset.isUsed) {
        throw new GoneException({
          message: 'Bu kod zaten kullanılmış',
          messageKey: 'CODE_ALREADY_USED',
          error: 'GONE',
        });
      }

      // Kod süresi dolmuş mu?
      if (new Date() > passwordReset.expiresAt) {
        throw new NotFoundException({
          message: 'Kod süresi dolmuş',
          messageKey: 'CODE_EXPIRED',
          error: 'NOT_FOUND',
        });
      }

      // Deneme sayısı kontrolü
      // Hassas olmayan değer appConfig.js'den alınır
      const maxAttempts = this.configService.get<number>('PASSWORD_RESET_MAX_ATTEMPTS') || appConfig.passwordReset.maxAttempts;
      if (passwordReset.attempts >= maxAttempts) {
        throw new HttpException(
          {
            message: 'Çok fazla yanlış deneme. Lütfen yeni kod isteyin',
            messageKey: 'TOO_MANY_ATTEMPTS',
            error: 'TOO_MANY_REQUESTS',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Kodu doğrula - deneme sayısını sıfırla
      await this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { attempts: 0 },
      });

      // Geçici reset token oluştur (JWT, 10 dakika)
      const resetToken = this.jwtService.sign(
        { 
          sub: passwordReset.id, 
          email: dto.email,
          type: 'password_reset' 
        },
        {
          secret: this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
          expiresIn: '10m',
        },
      );

      return {
        message: 'Kod doğrulandı',
        token: resetToken,
      };
    } catch (error) {
      // Yanlış kod denemesi - attempts artır
      if (error instanceof NotFoundException) {
        await this.incrementAttempts(dto.email, dto.code);
      }
      ErrorHandler.handleError(
        error,
        this.logger,
        'verifyResetCode',
        'Kod doğrulanırken bir hata oluştu',
      );
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      // Reset token'ı doğrula
      let payload: any;
      try {
        payload = this.jwtService.verify(dto.token, {
          secret: this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
        });
      } catch (error) {
        throw new UnauthorizedException({
          message: 'Geçersiz veya süresi dolmuş token',
          messageKey: 'INVALID_RESET_TOKEN',
          error: 'UNAUTHORIZED',
        });
      }

      // Token tipi kontrolü
      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException({
          message: 'Geçersiz token tipi',
          messageKey: 'INVALID_RESET_TOKEN',
          error: 'UNAUTHORIZED',
        });
      }

      // PasswordReset kaydını bul
      const passwordReset = await this.prisma.passwordReset.findUnique({
        where: { id: payload.sub },
      });

      if (!passwordReset) {
        throw new NotFoundException({
          message: 'Token bulunamadı',
          messageKey: 'RESET_TOKEN_NOT_FOUND',
          error: 'NOT_FOUND',
        });
      }

      // Kod kullanılmış mı?
      if (passwordReset.isUsed) {
        throw new GoneException({
          message: 'Bu token zaten kullanılmış',
          messageKey: 'TOKEN_ALREADY_USED',
          error: 'GONE',
        });
      }

      // Şifreler eşleşiyor mu?
      if (dto.newPassword !== dto.confirmPassword) {
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

      // Kullanıcıyı bul
      const user = await this.prisma.user.findUnique({
        where: { email: passwordReset.email },
      });

      if (!user) {
        throw new NotFoundException({
          message: 'Kullanıcı bulunamadı',
          messageKey: 'USER_NOT_FOUND',
          error: 'NOT_FOUND',
        });
      }

      // Yeni şifreyi hash'le
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

      // Kullanıcı şifresini güncelle ve PasswordReset kaydını işaretle
      await this.prisma.$transaction(async (tx: any) => {
        await tx.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        await tx.passwordReset.update({
          where: { id: passwordReset.id },
          data: { isUsed: true },
        });
      });

      return {
        message: 'Şifre başarıyla güncellendi',
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'resetPassword',
        'Şifre sıfırlanırken bir hata oluştu',
      );
    }
  }

  private generateResetCode(): string {
    // 6 haneli rastgele sayı (100000-999999)
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async cleanupExpiredCodes(email: string): Promise<void> {
    // Süresi dolmuş veya çok fazla deneme yapılmış kodları sil
    const maxAttempts = parseInt(
      String(this.configService.get<number>('PASSWORD_RESET_MAX_ATTEMPTS') || appConfig.passwordReset.maxAttempts),
      10,
    );
    await this.prisma.passwordReset.deleteMany({
      where: {
        email,
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true },
          { attempts: { gte: maxAttempts } },
        ],
      },
    });
  }

  private async incrementAttempts(email: string, code: string): Promise<void> {
    // Yanlış kod denemesi - attempts artır
    const passwordReset = await this.prisma.passwordReset.findFirst({
      where: { email, code },
      orderBy: { createdAt: 'desc' },
    });

    if (passwordReset && !passwordReset.isUsed) {
      await this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { attempts: passwordReset.attempts + 1 },
      });
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

