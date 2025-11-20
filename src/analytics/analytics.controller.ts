// NestJS: Backend framework'ü
// Controller, Get, Post, UseGuards, Query: HTTP isteklerini yönetmek için kullanılan decorator'lar
import { Controller, Get, Post, UseGuards, Query } from '@nestjs/common';

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

// PaginatedResponseDto: Sayfalanmış yanıtlar için standart format
import { PaginatedResponseDto } from '../core/dto/paginated-response.dto';

// MessageKey: Mesaj anahtarları
import { MessageKey } from '../core';

// DTO'lar: Rapor sorgu parametreleri
import {
  ReportsSummaryQueryDto,
  ReportsCategoriesQueryDto,
  ReportsTrendsQueryDto,
} from './dto/reports-query.dto';

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
   *     savings_rate: 40            // Tasarruf oranı (%)
   *   }
   * 
   * İş Akışı:
   * 1. Bu ayki gelir ve gider hesaplanır
   * 2. Tüm zamanlar toplam gelir ve gider hesaplanır
   * 3. Mevcut bakiye hesaplanır (tüm zamanlar net bakiye)
   * 4. Tasarruf oranı hesaplanır ((aylık gelir - aylık gider) / aylık gelir * 100)
   * 5. Tüm veriler birleştirilip döndürülür
   */
  @Get('summary')
  @ApiOperation({ summary: 'Finansal özet' })
  @ApiResponse({ status: 200, description: 'Finansal özet alındı' })
  async getSummary(@CurrentUser() user: UserPayload) {
    // Service'e finansal özet isteği gönderilir
    // user.id: Sadece bu kullanıcının verilerini getir
    return await this.analyticsService.getSummary(user.id);
  }

  /**
   * getReportsSummary: Tarih aralığı bazlı finansal özet endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/analytics/reports/summary
   * 
   * Bu endpoint, seçilen tarih aralığı için finansal özet verilerini getirir.
   * 
   * @Get('reports/summary'): Bu fonksiyonun GET /api/analytics/reports/summary isteğine yanıt vereceğini belirtir
   * 
   * Query Parametreleri:
   * @Query() query: URL'den gelen sorgu parametreleri (ReportsSummaryQueryDto formatında)
   *   - start_date: Başlangıç tarihi (ISO8601: YYYY-MM-DD) - zorunlu
   *   - end_date: Bitiş tarihi (ISO8601: YYYY-MM-DD) - zorunlu
   * 
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 200 OK: Finansal özet başarıyla alındı
   *   {
   *     total_income: 50000.00,      // Toplam gelir
   *     total_expense: 30000.00,     // Toplam gider
   *     net_balance: 20000.00,       // Net bakiye
   *     savings_rate: 40.00          // Tasarruf oranı (%)
   *   }
   */
  @Get('reports/summary')
  @ApiOperation({ summary: 'Tarih aralığı bazlı finansal özet' })
  @ApiResponse({ status: 200, description: 'Finansal özet alındı' })
  async getReportsSummary(
    @Query() query: ReportsSummaryQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.analyticsService.getReportsSummary(user.id, query);
  }

  /**
   * getReportsCategories: Kategori bazlı rapor endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/analytics/reports/categories
   * 
   * Bu endpoint, seçilen tarih aralığı ve tipe göre kategori bazlı raporları getirir.
   * 
   * @Get('reports/categories'): Bu fonksiyonun GET /api/analytics/reports/categories isteğine yanıt vereceğini belirtir
   * 
   * Query Parametreleri:
   * @Query() query: URL'den gelen sorgu parametreleri (ReportsCategoriesQueryDto formatında)
   *   - start_date: Başlangıç tarihi (ISO8601: YYYY-MM-DD) - zorunlu
   *   - end_date: Bitiş tarihi (ISO8601: YYYY-MM-DD) - zorunlu
   *   - type: İşlem tipi (income veya expense) - zorunlu
   *   - page: Sayfa numarası (opsiyonel, varsayılan: 1)
   *   - results: Sayfa başına kayıt sayısı (opsiyonel, varsayılan: 20)
   * 
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 200 OK: Kategori raporları başarıyla alındı
   *   {
   *     items: [...],                // Kategori listesi (tutarlara göre DESC sıralı)
   *     pagination: {                // Sayfalama bilgileri
   *       totalResults: 50,
   *       totalPages: 3,
   *       currentPage: 1,
   *       perPage: 20
   *     }
   *   }
   */
  @Get('reports/categories')
  @ApiOperation({ summary: 'Kategori bazlı raporlar' })
  @ApiResponse({ status: 200, description: 'Kategori raporları alındı' })
  async getReportsCategories(
    @Query() query: ReportsCategoriesQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.analyticsService.getReportsCategories(user.id, query);
    
    // Standart formatlanmış yanıt döndür
    return new PaginatedResponseDto(
      result.items,
      result.pagination,
      MessageKey.SUCCESS,
    );
  }

  /**
   * getReportsTrends: Trend verileri endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/analytics/reports/trends
   * 
   * Bu endpoint, seçilen tarih aralığı ve periyoda göre trend verilerini getirir.
   * 
   * @Get('reports/trends'): Bu fonksiyonun GET /api/analytics/reports/trends isteğine yanıt vereceğini belirtir
   * 
   * Query Parametreleri:
   * @Query() query: URL'den gelen sorgu parametreleri (ReportsTrendsQueryDto formatında)
   *   - start_date: Başlangıç tarihi (ISO8601: YYYY-MM-DD) - zorunlu
   *   - end_date: Bitiş tarihi (ISO8601: YYYY-MM-DD) - zorunlu
   *   - period: Rapor periyodu (hourly, daily, weekly, monthly) - zorunlu
   *   - page: Sayfa numarası (opsiyonel, varsayılan: 1)
   *   - results: Sayfa başına kayıt sayısı (opsiyonel, varsayılan: 20)
   * 
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 200 OK: Trend verileri başarıyla alındı
   *   Hourly mod (tarih aralığındaki her günün her saati):
   *   {
   *     granularity: "hourly",
   *     start_date: "2025-01-01",
   *     end_date: "2025-11-01",
   *     items: [{ datetime: "YYYY-MM-DD HH:00", income, expense, net }, ...],
   *     pagination: { totalResults, totalPages, currentPage, perPage }
   *   }
   *   Daily mod (tarih aralığındaki her gün için günlük özet):
   *   {
   *     granularity: "daily",
   *     start_date: "2025-01-01",
   *     end_date: "2025-01-31",
   *     items: [{ date: "YYYY-MM-DD", income, expense, net }, ...],
   *     pagination: { totalResults, totalPages, currentPage, perPage }
   *   }
   *   Weekly mod (tarih aralığındaki her hafta için haftalık özet):
   *   {
   *     granularity: "weekly",
   *     start_date: "2025-01-01",
   *     end_date: "2025-11-01",
   *     items: [{ week: "YYYY-WW", income, expense, net }, ...],
   *     pagination: { totalResults, totalPages, currentPage, perPage }
   *   }
   *   Monthly mod (tarih aralığındaki her ay için aylık özet):
   *   {
   *     granularity: "monthly",
   *     start_date: "2025-01-01",
   *     end_date: "2025-11-01",
   *     items: [{ month: "YYYY-MM", income, expense, net }, ...],
   *     pagination: { totalResults, totalPages, currentPage, perPage }
   *   }
   */
  @Get('reports/trends')
  @ApiOperation({ summary: 'Trend verileri (hourly, daily, weekly, monthly)' })
  @ApiResponse({ status: 200, description: 'Trend verileri alındı' })
  async getReportsTrends(
    @Query() query: ReportsTrendsQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.analyticsService.getReportsTrends(user.id, query);
    
    if (!result) {
      throw new Error('Trend verileri alınamadı');
    }
    
    // PaginatedDataDto oluştur ve ekstra alanları ekle
    const paginatedData = new PaginatedResponseDto(
      result.items,
      result.pagination,
      MessageKey.SUCCESS,
    );
    
    // granularity, start_date, end_date alanlarını data içine ekle
    (paginatedData.data as any).granularity = result.granularity;
    (paginatedData.data as any).start_date = result.start_date;
    (paginatedData.data as any).end_date = result.end_date;
    
    return paginatedData;
  }

  /**
   * seedTestData: Test verisi oluşturma endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/analytics/seed-test-data
   * 
   * Bu endpoint, Ekim, Kasım, Aralık ayları için rastgele gelir-gider işlemleri oluşturur.
   * Kullanıcının mevcut kategorilerini kullanır.
   * 
   * @Post('seed-test-data'): Bu fonksiyonun POST /api/analytics/seed-test-data isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 200 OK: Test verileri başarıyla oluşturuldu
   *   {
   *     success: true,
   *     message: "Test verileri başarıyla oluşturuldu",
   *     created_transactions: 150,
   *     income_categories_used: 3,
   *     expense_categories_used: 8,
   *     months: "Ekim, Kasım, Aralık"
   *   }
   * 
   * Not: Bu endpoint sadece test/development amaçlıdır.
   */
  @Post('seed-test-data')
  @ApiOperation({ summary: 'Test verisi oluştur (Ekim-Kasım-Aralık)' })
  @ApiResponse({ status: 200, description: 'Test verileri oluşturuldu' })
  @ApiResponse({ status: 400, description: 'Kategori bulunamadı' })
  async seedTestData(@CurrentUser() user: UserPayload) {
    return await this.analyticsService.seedTestData(user.id);
  }
}

