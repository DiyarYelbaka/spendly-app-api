// NestJS: Backend framework'ü
// Module: Modül sistemi
import { Module } from '@nestjs/common';

// JwtModule: JWT token işlemleri için
import { JwtModule } from '@nestjs/jwt';

// PassportModule: Passport kimlik doğrulama için
import { PassportModule } from '@nestjs/passport';

// ConfigModule, ConfigService: Ortam değişkenlerine (.env) erişmek için
import { ConfigModule, ConfigService } from '@nestjs/config';

// StringValue: JWT token süresi tipi için
import type { StringValue } from 'ms';

// Auth modülünün bileşenleri
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// PrismaModule: Veritabanı işlemleri için
// EmailModule: E-posta gönderme işlemleri için
import { PrismaModule, EmailModule } from '../core';

/**
 * AuthModule Sınıfı
 * 
 * Bu modül, kimlik doğrulama (authentication) ile ilgili tüm bileşenleri bir araya getirir.
 * 
 * @Module(): Bu sınıfın bir NestJS modülü olduğunu belirtir
 */
@Module({
  /**
   * imports: Bu modülün ihtiyaç duyduğu diğer modüller
   * 
   * PrismaModule: Veritabanı işlemleri için gerekli
   *   AuthService, kullanıcı bilgilerini veritabanından almak için PrismaService'i kullanır
   * 
   * PassportModule: Passport kimlik doğrulama için gerekli
   *   JwtStrategy, Passport'un strateji sistemini kullanır
   * 
   * JwtModule.registerAsync(): JWT token işlemleri için gerekli
   *   registerAsync: Asenkron yapılandırma için kullanılır (ConfigService'den değer almak için)
   *   - imports: [ConfigModule] → ConfigService'i kullanabilmek için ConfigModule'ü import eder
   *   - useFactory: JWT ayarlarını oluşturan fonksiyon
   *     - secret: JWT token'ı imzalamak için kullanılan gizli anahtar (.env'den alınır)
   *     - signOptions.expiresIn: Token'ın geçerlilik süresi (varsayılan: 7 gün)
   *   - inject: [ConfigService] → useFactory fonksiyonuna ConfigService'i enjekte eder
   * 
   * NOT: JWT_SECRET ve JWT_EXPIRES_IN değerleri .env dosyasından alınır.
   * Production'da mutlaka .env dosyasında tanımlanmalıdır!
   */
  imports: [
    PrismaModule,
    EmailModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '7d') as StringValue,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  /**
   * controllers: Bu modülde bulunan controller'lar
   * 
   * AuthController: Kimlik doğrulama HTTP endpoint'lerini yönetir
   *   - POST /api/auth/register: Yeni kullanıcı kaydı
   *   - POST /api/auth/login: Kullanıcı girişi
   *   - POST /api/auth/refresh: Token yenileme
   *   - POST /api/auth/logout: Kullanıcı çıkışı
   *   - GET /api/auth/me: Mevcut kullanıcı profili
   */
  controllers: [AuthController],
  /**
   * providers: Bu modülde bulunan service'ler ve diğer sağlayıcılar
   * 
   * AuthService: Kimlik doğrulama iş mantığını içerir
   *   - Kullanıcı kaydı, girişi, token oluşturma gibi işlemleri yapar
   * 
   * JwtStrategy: JWT token doğrulama stratejisini içerir
   *   - Passport'un JWT stratejisini tanımlar
   *   - Token doğrulandıktan sonra kullanıcı bilgisini çıkarır
   */
  providers: [AuthService, JwtStrategy],
  /**
   * exports: Bu modülden dışarıya (başka modüllere) açılan bileşenler
   * 
   * AuthService: Başka modüller (örneğin: başka bir servis) bu service'i kullanabilir
   *   Ancak bu örnekte başka modül AuthService'i kullanmıyor
   */
  exports: [AuthService],
})
export class AuthModule {}

