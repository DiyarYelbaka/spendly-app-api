// NestJS: Backend framework'ü
// Controller, Get: HTTP isteklerini yönetmek için kullanılan decorator'lar
import { Controller, Get } from '@nestjs/common';

// Swagger: API dokümantasyonu için kullanılan decorator'lar
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

// AppService: Ana servis sınıfı
import { AppService } from './app.service';

/**
 * AppController Sınıfı
 * 
 * Bu sınıf, uygulamanın ana controller'ıdır.
 * Health check (sağlık kontrolü) endpoint'lerini içerir.
 * 
 * Health Check Nedir?
 * Health check, uygulamanın çalışıp çalışmadığını kontrol etmek için kullanılan bir endpoint'tir.
 * Örneğin: Sunucu yönetim araçları, uygulamanın çalışıp çalışmadığını kontrol etmek için bu endpoint'i kullanır.
 * 
 * @ApiTags('health'): Swagger dokümantasyonunda bu controller'ı "health" grubunda gösterir
 * @Controller(): Bu controller'ın URL'i /api olur (global prefix ile birlikte)
 *   Boş string olduğu için, global prefix'ten sonra direkt /api olur
 */
@ApiTags('health')
@Controller()
export class AppController {
  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, controller oluşturulduğunda çalışır.
   * AppService'i buraya enjekte eder (dependency injection).
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * appService: Ana servis - health check işlemlerini yapar
   */
  constructor(private readonly appService: AppService) {}

  /**
   * getHealth: Health check endpoint'i (Ana endpoint)
   * 
   * HTTP Metodu: GET
   * URL: /api
   * 
   * Bu endpoint, uygulamanın çalışıp çalışmadığını kontrol eder.
   * Genellikle uygulamanın ana URL'inde (root) bulunur.
   * 
   * @Get(): Bu fonksiyonun GET isteğine yanıt vereceğini belirtir
   *   Boş parametre olduğu için, controller'ın base URL'ine (/) yanıt verir
   * 
   * @ApiOperation(): Swagger dokümantasyonunda bu endpoint'in açıklaması
   * @ApiResponse(): Swagger'da bu endpoint'in dönebileceği HTTP durum kodları
   * 
   * Dönüş Değeri:
   * - 200 OK: API çalışıyor
   *   {
   *     success: true,
   *     message: "Hesap Asistan API is running",
   *     timestamp: "2025-01-21T10:30:00.000Z",
   *     version: "1.0.0",
   *     environment: "development"
   *   }
   * 
   * İş Akışı:
   * 1. Service'e health check isteği gönderilir
   * 2. Service, uygulama durumu bilgilerini döndürür
   * 3. Bilgiler HTTP yanıtı olarak döndürülür
   */
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'API is running' })
  getHealth() {
    // Service'e health check isteği gönderilir
    // appService.getHealth(): Uygulama durumu bilgilerini döndürür
    return this.appService.getHealth();
  }

  /**
   * health: Health check endpoint'i (Özel endpoint)
   * 
   * HTTP Metodu: GET
   * URL: /api/health
   * 
   * Bu endpoint, uygulamanın çalışıp çalışmadığını kontrol eder.
   * getHealth() ile aynı işlevi görür, ancak daha açık bir URL'e sahiptir.
   * 
   * @Get('health'): Bu fonksiyonun GET /api/health isteğine yanıt vereceğini belirtir
   *   'health' parametresi, URL'e /health ekler
   * 
   * Neden İki Endpoint?
   * - /api: Ana URL (root) - Genellikle tarayıcıda açıldığında kullanılır
   * - /api/health: Açık health check endpoint'i - Monitoring araçları için daha uygun
   * 
   * Dönüş Değeri:
   * - 200 OK: API çalışıyor (getHealth() ile aynı)
   * 
   * İş Akışı:
   * 1. Service'e health check isteği gönderilir
   * 2. Service, uygulama durumu bilgilerini döndürür
   * 3. Bilgiler HTTP yanıtı olarak döndürülür
   */
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'API is running' })
  health() {
    // Service'e health check isteği gönderilir
    // appService.getHealth(): Uygulama durumu bilgilerini döndürür
    return this.appService.getHealth();
  }
}

