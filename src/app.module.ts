// NestJS: Backend framework'ü
// Module: Modül sistemi
// NestModule: Modül yapılandırma arayüzü (interface)
// MiddlewareConsumer: Middleware yönetimi için
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

// ConfigModule: Ortam değişkenlerini (.env dosyasından) yüklemek için
// Bu modül sayesinde .env dosyasındaki ayarları kullanabiliriz
import { ConfigModule } from '@nestjs/config';

// Ana modül bileşenleri
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core modül bileşenleri
// PrismaModule: Veritabanı işlemleri için
// JwtUserMiddleware: JWT token'dan kullanıcı bilgisini çıkaran middleware
import { PrismaModule, JwtUserMiddleware } from './core';

// Feature modülleri (Özellik modülleri)
// Her modül, belirli bir özelliği (feature) yönetir
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AnalyticsModule } from './analytics/analytics.module';

// JwtModule: JWT token işlemleri için
// Bu modül, JWT token oluşturma ve doğrulama işlemlerini yapar
import { JwtModule } from '@nestjs/jwt';

// jwtConfig: JWT ayarlarını yüklemek için
import jwtConfig from './config/jwt.config';
import openaiConfig from './config/openai.config';

/**
 * AppModule Sınıfı
 * 
 * Bu modül, uygulamanın ana modülüdür.
 * Tüm diğer modüller burada birleşir.
 * 
 * @Module(): Bu sınıfın bir NestJS modülü olduğunu belirtir
 * 
 * implements NestModule: Middleware yapılandırması için gerekli arayüz
 *   Bu arayüz sayesinde, modül seviyesinde middleware ekleyebiliriz
 */
@Module({
  /**
   * imports: Bu modülün ihtiyaç duyduğu diğer modüller
   * 
   * ConfigModule.forRoot():
   *   - isGlobal: true → Bu modül tüm uygulamada kullanılabilir (global)
   *   - envFilePath: '.env' → .env dosyasından ayarları yükle
   *   Bu modül sayesinde process.env.XXX şeklinde ortam değişkenlerine erişebiliriz
   * 
   * PrismaModule: Veritabanı işlemleri için gerekli
   *   Tüm modüller veritabanına erişmek için bu modüle ihtiyaç duyar
   * 
   * Feature Modülleri:
   *   - AuthModule: Kimlik doğrulama (login, register, vb.)
   *   - CategoriesModule: Kategori yönetimi
   *   - TransactionsModule: İşlem (transaction) yönetimi
   *   - AnalyticsModule: Analitik ve raporlama
   * 
   * JwtModule.register():
   *   - JWT token işlemleri için gerekli
   *   - secret: JWT token'ı imzalamak için kullanılan gizli anahtar
   *   - Bu modül, middleware'de JWT token'ı doğrulamak için kullanılır
   */
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [openaiConfig], // OpenAI config'i yükle
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    AnalyticsModule,
    // JWT Module for middleware
    // Middleware'de JWT token'ı doğrulamak için gerekli
    JwtModule.register({
      secret: jwtConfig().jwt.secret,
    }),
    // Modüller buraya eklenecek
  ],
  /**
   * controllers: Bu modülde bulunan controller'lar
   * 
   * AppController: Ana controller
   *   Genellikle health check (sağlık kontrolü) gibi temel endpoint'leri içerir
   */
  controllers: [AppController],
  /**
   * providers: Bu modülde bulunan service'ler ve diğer sağlayıcılar
   * 
   * AppService: Ana service
   *   Genellikle temel iş mantığını içerir
   * 
   * JwtUserMiddleware: JWT token'dan kullanıcı bilgisini çıkaran middleware
   *   Bu middleware, her HTTP isteğinde çalışır ve kullanıcı bilgisini request'e ekler
   */
  providers: [AppService, JwtUserMiddleware],
})
export class AppModule implements NestModule {
  /**
   * configure: Middleware yapılandırma fonksiyonu
   * 
   * Bu fonksiyon, modül seviyesinde middleware eklemek için kullanılır.
   * 
   * @param consumer: MiddlewareConsumer - Middleware yönetimi için nesne
   * 
   * İş Akışı:
   * 1. consumer.apply(): Hangi middleware'in kullanılacağını belirtir
   * 2. forRoutes('*'): Hangi route'larda (URL'lerde) çalışacağını belirtir
   *    - '*': Tüm route'larda çalışır
   * 
   * JwtUserMiddleware Ne Yapar?
   * - Her HTTP isteğinde JWT token'ı kontrol eder
   * - Token geçerliyse, token'dan kullanıcı bilgisini çıkarır
   * - Kullanıcı bilgisini request.user'a ekler
   * - Bu sayede controller'larda @CurrentUser() decorator'ı ile kullanıcı bilgisine erişebiliriz
   * 
   * Neden Tüm Route'larda?
   * - Bazı endpoint'ler (örneğin: /auth/login) token gerektirmez
   * - Ancak middleware token yoksa hata fırlatmaz, sadece request.user'ı undefined bırakır
   * - Guard'lar (örneğin: JwtAuthGuard) token gerektiren endpoint'leri korur
   */
  configure(consumer: MiddlewareConsumer) {
    // Apply JWT User Middleware to all routes
    // This middleware extracts user info from JWT token and attaches to request
    // Tüm route'larda çalışır, ancak token yoksa hata fırlatmaz
    consumer.apply(JwtUserMiddleware).forRoutes('*');
  }
}

