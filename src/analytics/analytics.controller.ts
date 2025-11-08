// NestJS: Backend framework'ü
// Controller, Get, UseGuards: HTTP isteklerini yönetmek için kullanılan decorator'lar
import { Controller, Get, UseGuards } from '@nestjs/common';

// Swagger: API dokümantasyonu için kullanılan decorator'lar
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// AnalyticsService: Analitik işlemlerini yapan servis sınıfı
import { AnalyticsService } from './analytics.service';

// JwtAuthGuard: JWT token kontrolü yapan guard (koruyucu)
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// CurrentUser: Mevcut kullanıcı bilgisini almak için kullanılan decorator
// UserPayload: Kullanıcı bilgilerinin tipi
import { CurrentUser, UserPayload } from '../core';

/**
 * AnalyticsController Sınıfı
 * 
 * Bu sınıf, analitik (analytics) ile ilgili HTTP isteklerini karşılar.
 * Analitik, kullanıcının finansal verilerini analiz edip raporlar sunar.
 * 
 * Controller'ın görevi:
 * 1. HTTP isteklerini almak (GET)
 * 2. İş mantığını service'e yönlendirmek
 * 3. Service'den gelen sonucu HTTP yanıtı olarak döndürmek
 * 
 * @ApiTags('analytics'): Swagger dokümantasyonunda bu controller'ı "analytics" grubunda gösterir
 * @Controller('analytics'): Bu controller'ın URL'i /api/analytics olur
 * @UseGuards(JwtAuthGuard): Bu controller'daki tüm endpoint'ler için JWT token kontrolü yapar
 * @ApiBearerAuth(): Swagger'da bu endpoint'lerin Bearer token gerektirdiğini belirtir
 */
@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, controller oluşturulduğunda çalışır.
   * AnalyticsService'i buraya enjekte eder (dependency injection).
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * analyticsService: Analitik işlemlerini yapan servis
   */
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * getDashboard: Dashboard verileri endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/analytics/dashboard
   * 
   * Bu endpoint, kullanıcının dashboard (kontrol paneli) için gerekli tüm analitik verilerini getirir.
   * Dashboard, kullanıcının finansal durumunu özetleyen bir ekrandır.
   * 
   * @Get('dashboard'): Bu fonksiyonun GET /api/analytics/dashboard isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @CurrentUser() user: JWT token'dan alınan mevcut kullanıcı bilgisi
   *   - user.id: Kullanıcının benzersiz ID'si
   * 
   * Dönüş Değeri:
   * - 200 OK: Dashboard verileri başarıyla alındı
   *   {
   *     summary: {
   *       total_income: 50000,      // Tüm zamanlar toplam gelir
   *       total_expense: 30000,     // Tüm zamanlar toplam gider
   *       net_balance: 20000,      // Net bakiye (gelir - gider)
   *       netIncome: 20000,         // Frontend uyumu için camelCase
   *       totalIncome: 50000,        // Frontend uyumu için camelCase
   *       totalExpense: 30000        // Frontend uyumu için camelCase
   *     },
   *     monthly_trends: [           // Son 6 ayın aylık trendleri
   *       { month: "2025-01", income: 5000, expense: 3000 },
   *       { month: "2025-02", income: 6000, expense: 4000 },
   *       ...
   *     ],
   *     category_breakdown: [       // Kategori bazında dağılım
   *       { category: "Yemek", amount: 5000, percentage: 16.67, type: "expense" },
   *       { category: "Maaş", amount: 20000, percentage: 40, type: "income" },
   *       ...
   *     ]
   *   }
   * 
   * İş Akışı:
   * 1. Tüm zamanlar toplam gelir ve gider hesaplanır
   * 2. Net bakiye hesaplanır (gelir - gider)
   * 3. Son 6 ayın aylık trendleri hesaplanır
   * 4. Kategori bazında dağılım hesaplanır
   * 5. Tüm veriler birleştirilip döndürülür
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard verileri' })
  @ApiResponse({ status: 200, description: 'Dashboard verileri alındı' })
  async getDashboard(@CurrentUser() user: UserPayload) {
    // Service'e dashboard verileri isteği gönderilir
    // user.id: Sadece bu kullanıcının verilerini getir
    return await this.analyticsService.getDashboard(user.id);
  }

  /**
   * getSummary: Finansal özet endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/analytics/summary
   * 
   * Bu endpoint, kullanıcının finansal özet bilgilerini getirir.
   * Özet, mevcut ay ve genel durum hakkında bilgi verir.
   * 
   * @Get('summary'): Bu fonksiyonun GET /api/analytics/summary isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @CurrentUser() user: JWT token'dan alınan mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 200 OK: Finansal özet başarıyla alındı
   *   {
   *     current_balance: 20000,      // Mevcut bakiye (tüm zamanlar net bakiye)
   *     monthly_income: 5000,        // Bu ayki toplam gelir
   *     monthly_expense: 3000,      // Bu ayki toplam gider
   *     savings_rate: 40,            // Tasarruf oranı (%)
   *     top_categories: [            // En çok kullanılan kategoriler (top 5)
   *       { name: "Yemek", amount: 5000, type: "expense" },
   *       { name: "Maaş", amount: 20000, type: "income" },
   *       ...
   *     ]
   *   }
   * 
   * İş Akışı:
   * 1. Bu ayki gelir ve gider hesaplanır
   * 2. Tüm zamanlar toplam gelir ve gider hesaplanır
   * 3. Mevcut bakiye hesaplanır (tüm zamanlar net bakiye)
   * 4. Tasarruf oranı hesaplanır ((aylık gelir - aylık gider) / aylık gelir * 100)
   * 5. En çok kullanılan kategoriler bulunur (top 5)
   * 6. Tüm veriler birleştirilip döndürülür
   */
  @Get('summary')
  @ApiOperation({ summary: 'Finansal özet' })
  @ApiResponse({ status: 200, description: 'Finansal özet alındı' })
  async getSummary(@CurrentUser() user: UserPayload) {
    // Service'e finansal özet isteği gönderilir
    // user.id: Sadece bu kullanıcının verilerini getir
    return await this.analyticsService.getSummary(user.id);
  }
}

