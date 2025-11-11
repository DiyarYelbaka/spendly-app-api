// NestJS: Backend framework'ü
// NestFactory: NestJS uygulamasını oluşturmak için kullanılan fabrika sınıfı
import { NestFactory } from '@nestjs/core';

// ValidationPipe: Gelen verilerin doğruluğunu kontrol etmek için kullanılan pipe
// BadRequestException: Validation hataları için kullanılan exception
// Pipe, verileri işlemeden önce dönüştürür veya doğrular
import { ValidationPipe, BadRequestException } from '@nestjs/common';

// Swagger: API dokümantasyonu için kullanılan modüller
// SwaggerModule: Swagger dokümantasyonunu oluşturmak için
// DocumentBuilder: Swagger dokümantasyon ayarlarını yapmak için
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// helmet: Güvenlik başlıkları (security headers) eklemek için kullanılan kütüphane
// Bu kütüphane, XSS, clickjacking gibi saldırılara karşı koruma sağlar
import helmet from 'helmet';

// AppModule: Ana modül - tüm modüllerin birleştiği yer
import { AppModule } from './app.module';

// HttpExceptionFilter: Tüm hataları yakalayıp standart formatta döndürmek için
// TransformInterceptor: Tüm yanıtları standart formatta döndürmek için
import { HttpExceptionFilter, TransformInterceptor } from './core';

// appConfig: Uygulama ayarlarını (config) yüklemek için
// Config dosyası, port, CORS ayarları, Swagger ayarları gibi bilgileri içerir
import appConfig from './config/app.config';

/**
 * bootstrap: Uygulamayı başlatan ana fonksiyon
 * 
 * Bu fonksiyon, NestJS uygulamasını oluşturur ve yapılandırır.
 * Uygulama başlatıldığında bu fonksiyon çalışır.
 * 
 * async: Bu fonksiyon asenkron (asenkron) çalışır
 *   Asenkron fonksiyonlar, uzun süren işlemleri (örneğin: veritabanı bağlantısı) bekler
 */
async function bootstrap() {
  /**
   * ADIM 1: NestJS Uygulamasını Oluştur
   * 
   * NestFactory.create: Yeni bir NestJS uygulaması oluşturur
   * AppModule: Ana modül - tüm modüllerin birleştiği yer
   * 
   * await: Uygulamanın oluşturulmasını bekler (asynchronous işlem)
   * app: Oluşturulan uygulama nesnesi - bu nesne üzerinden uygulamayı yapılandırabiliriz
   */
  const app = await NestFactory.create(AppModule);

  /**
   * ADIM 2: Güvenlik Başlıkları Ekle
   * 
   * helmet(): Güvenlik başlıkları ekler
   * Bu başlıklar, XSS (Cross-Site Scripting), clickjacking gibi saldırılara karşı koruma sağlar
   * 
   * Örnek başlıklar:
   * - X-Content-Type-Options: nosniff (MIME type sniffing'i önler)
   * - X-Frame-Options: DENY (Clickjacking saldırılarını önler)
   * - X-XSS-Protection: 1; mode=block (XSS saldırılarını önler)
   * 
   * app.use(): Middleware (ara yazılım) ekler
   * Middleware, her HTTP isteğinden önce çalışan kod parçalarıdır
   */
  app.use(helmet());

  /**
   * ADIM 3: Global URL Öneki (Prefix) Ayarla
   * 
   * setGlobalPrefix('api'): Tüm endpoint'lere 'api' öneki ekler
   * 
   * Örnek:
   * - Önce: http://localhost:3000/categories
   * - Sonra: http://localhost:3000/api/categories
   * 
   * Bu sayede API endpoint'leri daha organize olur ve frontend'den kolayca ayırt edilir
   */
  app.setGlobalPrefix('api');

  /**
   * ADIM 4: CORS (Cross-Origin Resource Sharing) Ayarları
   * 
   * CORS Nedir?
   * CORS, farklı domain'lerden (örneğin: frontend uygulaması) API'ye istek yapılmasına izin verir.
   * 
   * appConfig(): Uygulama ayarlarını yükler
   *   - config.cors.origin: Hangi domain'lerden istek kabul edileceği
   *   - config.cors.credentials: Cookie ve authentication bilgilerinin gönderilip gönderilmeyeceği
   * 
   * enableCors(): CORS'u etkinleştirir
   *   Bu sayede frontend uygulaması (farklı bir port'ta çalışıyor olabilir) API'ye istek yapabilir
   */
  const config = appConfig();
  app.enableCors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  });

  /**
   * ADIM 5: Global Exception Filter (Hata Yakalayıcı) Ekle
   * 
   * HttpExceptionFilter: Tüm hataları yakalayıp standart formatta döndürür
   * 
   * Neden Gerekli?
   * - Frontend'in beklediği hata formatı standart olmalı
   * - Hatalar loglanmalı
   * - Kullanıcıya anlaşılır hata mesajları gösterilmeli
   * 
   * useGlobalFilters(): Tüm endpoint'ler için bu filter'ı kullanır
   *   Herhangi bir endpoint'te hata oluşursa, bu filter çalışır
   */
  app.useGlobalFilters(new HttpExceptionFilter());

  /**
   * ADIM 6: Global Response Interceptor (Yanıt Dönüştürücü) Ekle
   * 
   * TransformInterceptor: Tüm başarılı yanıtları standart formatta döndürür
   * 
   * Neden Gerekli?
   * - Frontend'in beklediği yanıt formatı standart olmalı
   * - Tüm yanıtlar aynı yapıda olmalı (örneğin: { success: true, data: ... })
   * 
   * useGlobalInterceptors(): Tüm endpoint'ler için bu interceptor'ı kullanır
   *   Herhangi bir endpoint'ten yanıt döndürülürken, bu interceptor çalışır
   */
  app.useGlobalInterceptors(new TransformInterceptor());

  /**
   * ADIM 7: Global Validation Pipe (Doğrulama Borusu) Ekle
   * 
   * ValidationPipe: Gelen verilerin doğruluğunu kontrol eder
   * 
   * whitelist: true
   *   - Sadece DTO'da tanımlı alanları kabul eder
   *   - DTO'da olmayan alanlar otomatik olarak silinir (güvenlik)
   * 
   * forbidNonWhitelisted: true
   *   - DTO'da olmayan alanlar gönderilirse hata fırlatır
   *   - Bu sayede beklenmeyen veriler reddedilir
   * 
   * transform: true
   *   - Gelen verileri otomatik olarak DTO sınıfına dönüştürür
   *   - Örneğin: String "123" → Number 123
   * 
   * transformOptions.enableImplicitConversion: true
   *   - Tip dönüşümlerini otomatik yapar
   *   - Örneğin: Query parametrelerinden gelen string'leri number'a çevirir
   * 
   * useGlobalPipes(): Tüm endpoint'ler için bu pipe'ı kullanır
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        // Validation hatalarını object array formatında döndür
        // Format: [{ property: "...", constraints: {...} }]
        const formattedErrors = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints || {},
          value: error.value,
        }));
        return new BadRequestException({
          message: formattedErrors,
          error: 'Bad Request',
          statusCode: 400,
        });
      },
    }),
  );

  /**
   * ADIM 8: Swagger API Dokümantasyonu Ayarla
   * 
   * Swagger Nedir?
   * Swagger, API endpoint'lerini otomatik olarak dokümante eden bir araçtır.
   * Bu sayede geliştiriciler API'yi kolayca test edebilir ve anlayabilir.
   * 
   * DocumentBuilder: Swagger dokümantasyon ayarlarını yapmak için
   *   - setTitle(): Dokümantasyon başlığı
   *   - setDescription(): Dokümantasyon açıklaması
   *   - setVersion(): API versiyonu
   *   - addBearerAuth(): JWT token ile kimlik doğrulama desteği ekler
   *   - build(): Ayarları tamamlar ve config nesnesini oluşturur
   * 
   * SwaggerModule.createDocument(): Swagger dokümantasyonunu oluşturur
   *   - app: NestJS uygulaması
   *   - swaggerConfig: Swagger ayarları
   * 
   * SwaggerModule.setup(): Swagger UI'yi belirtilen URL'de yayınlar
   *   - config.swagger.path: Swagger UI'nin erişileceği URL (örneğin: /docs)
   *   - app: NestJS uygulaması
   *   - document: Oluşturulan dokümantasyon
   * 
   * Örnek: http://localhost:3000/docs adresinden Swagger UI'ye erişilebilir
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.swagger.title)
    .setDescription(config.swagger.description)
    .setVersion(config.swagger.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(config.swagger.path, app, document);

  /**
   * ADIM 9: Uygulamayı Belirtilen Port'ta Başlat
   * 
   * config.app.port: Uygulamanın çalışacağı port numarası (örneğin: 3000)
   * 
   * app.listen(): Uygulamayı belirtilen port'ta dinlemeye başlar
   *   await: Uygulamanın başlatılmasını bekler
   * 
   * console.log(): Başarılı başlatma mesajlarını konsola yazdırır
   *   - Uygulama URL'i: http://localhost:3000/api
   *   - Swagger dokümantasyon URL'i: http://localhost:3000/docs
   * 
   * Bu noktadan sonra uygulama çalışmaya başlar ve HTTP isteklerini kabul eder
   */
  const port = config.app.port;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/${config.swagger.path}`);
}

/**
 * bootstrap() Fonksiyonunu Çalıştır
 * 
 * Bu satır, uygulama başlatıldığında bootstrap() fonksiyonunu çalıştırır.
 * Node.js, bu dosyayı çalıştırdığında (örneğin: npm start), bu satır çalışır.
 */
bootstrap();

