// NestJS: Backend framework'ü
// Controller, Get, Post, Put, Delete, Query, UseGuards: HTTP isteklerini yönetmek için kullanılan decorator'lar
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';

// Swagger: API dokümantasyonu için kullanılan decorator'lar
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// TransactionsService: İşlem işlemlerini yapan servis sınıfı
import { TransactionsService } from './transactions.service';

// DTO'lar: Gelen verilerin yapısını tanımlayan sınıflar
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';

// JwtAuthGuard: JWT token kontrolü yapan guard (koruyucu)
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// CurrentUser: Mevcut kullanıcı bilgisini almak için kullanılan decorator
// UserPayload: Kullanıcı bilgilerinin tipi
import { CurrentUser, UserPayload } from '../core';

/**
 * TransactionsController Sınıfı
 * 
 * Bu sınıf, işlem (transaction) ile ilgili HTTP isteklerini karşılar.
 * Controller'ın görevi:
 * 1. HTTP isteklerini almak (GET, POST, PUT, DELETE)
 * 2. Gelen verileri doğrulamak (DTO ile)
 * 3. İş mantığını service'e yönlendirmek
 * 4. Service'den gelen sonucu HTTP yanıtı olarak döndürmek
 * 
 * @ApiTags('transactions'): Swagger dokümantasyonunda bu controller'ı "transactions" grubunda gösterir
 * @Controller('transactions'): Bu controller'ın URL'i /api/transactions olur
 * @UseGuards(JwtAuthGuard): Bu controller'daki tüm endpoint'ler için JWT token kontrolü yapar
 * @ApiBearerAuth(): Swagger'da bu endpoint'lerin Bearer token gerektirdiğini belirtir
 */
@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, controller oluşturulduğunda çalışır.
   * TransactionsService'i buraya enjekte eder (dependency injection).
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * transactionsService: İşlem işlemlerini yapan servis
   */
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * createIncome: Gelir ekleme endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/transactions/income
   * 
   * Bu endpoint, kullanıcının yeni bir gelir işlemi eklemesini sağlar.
   * 
   * @Post('income'): Bu fonksiyonun POST /api/transactions/income isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen işlem bilgileri (CreateTransactionDto formatında)
   *   - amount: İşlem tutarı (zorunlu, min: 0.01)
   *   - description: İşlem açıklaması (zorunlu, 1-500 karakter)
   *   - category_id: Kategori ID'si (zorunlu, UUID format, income tipinde kategori olmalı)
   *   - date: İşlem tarihi (opsiyonel, default: bugün, ISO8601 format)
   *   - notes: İşlem notları (opsiyonel, max 1000 karakter)
   * 
   * @CurrentUser() user: JWT token'dan alınan mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 201 Created: Gelir başarıyla eklendi
   * - 400 Bad Request: Gönderilen veriler geçersiz veya kategori income tipinde değil
   * 
   * İş Akışı:
   * 1. Kategori kontrolü yapılır (kategori income tipinde olmalı)
   * 2. İşlem veritabanına kaydedilir
   * 3. Oluşturulan işlem bilgisi döndürülür
   */
  @Post('income')
  @ApiOperation({ summary: 'Gelir ekle' })
  @ApiResponse({ status: 201, description: 'Gelir başarıyla eklendi' })
  @ApiResponse({ status: 400, description: 'Validation hatası veya geçersiz kategori' })
  async createIncome(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Service'e gelir ekleme isteği gönderilir
    // dto: Kullanıcıdan gelen işlem bilgileri
    // user.id: İşlemi oluşturan kullanıcının ID'si
    return await this.transactionsService.createIncome(dto, user.id);
  }

  /**
   * createExpense: Gider ekleme endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/transactions/expense
   * 
   * Bu endpoint, kullanıcının yeni bir gider işlemi eklemesini sağlar.
   * 
   * @Post('expense'): Bu fonksiyonun POST /api/transactions/expense isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen işlem bilgileri (CreateTransactionDto formatında)
   *   - amount: İşlem tutarı (zorunlu, min: 0.01)
   *   - description: İşlem açıklaması (zorunlu, 1-500 karakter)
   *   - category_id: Kategori ID'si (zorunlu, UUID format, expense tipinde kategori olmalı)
   *   - date: İşlem tarihi (opsiyonel, default: bugün, ISO8601 format)
   *   - notes: İşlem notları (opsiyonel, max 1000 karakter)
   * 
   * @CurrentUser() user: JWT token'dan alınan mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 201 Created: Gider başarıyla eklendi
   * - 400 Bad Request: Gönderilen veriler geçersiz veya kategori expense tipinde değil
   * 
   * İş Akışı:
   * 1. Kategori kontrolü yapılır (kategori expense tipinde olmalı)
   * 2. İşlem veritabanına kaydedilir
   * 3. Oluşturulan işlem bilgisi döndürülür
   */
  @Post('expense')
  @ApiOperation({ summary: 'Gider ekle' })
  @ApiResponse({ status: 201, description: 'Gider başarıyla eklendi' })
  @ApiResponse({ status: 400, description: 'Validation hatası veya geçersiz kategori' })
  async createExpense(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Service'e gider ekleme isteği gönderilir
    // dto: Kullanıcıdan gelen işlem bilgileri
    // user.id: İşlemi oluşturan kullanıcının ID'si
    return await this.transactionsService.createExpense(dto, user.id);
  }

  /**
   * findAll: İşlemleri listeleme endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/transactions
   * 
   * Bu endpoint, kullanıcının işlemlerini listeler.
   * Sayfalama (pagination), filtreleme ve arama özellikleri destekler.
   * 
   * @Get(): Bu fonksiyonun GET isteğine yanıt vereceğini belirtir
   * 
   * Query Parametreleri (URL'de ? ile başlayan parametreler):
   * @Query() query: URL'den gelen sorgu parametreleri (TransactionQueryDto formatında)
   *   - page: Sayfa numarası (varsayılan: 1)
   *   - limit: Sayfa başına kayıt sayısı (varsayılan: 20)
   *   - type: İşlem tipi filtresi (income veya expense) - opsiyonel
   *   - category_id: Kategori ID filtresi - opsiyonel
   *   - start_date: Başlangıç tarihi (ISO8601 format) - opsiyonel
   *   - end_date: Bitiş tarihi (ISO8601 format) - opsiyonel
   *   - search: Arama terimi (açıklamada ara) - opsiyonel
   * 
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Örnek Kullanım:
   * GET /api/transactions?type=expense&start_date=2025-01-01&end_date=2025-01-31&page=1&limit=20
   * 
   * Dönüş Değeri:
   * - 200 OK: İşlemler başarıyla listelendi
   *   {
   *     items: [...], // İşlem listesi
   *     pagination: {         // Sayfalama bilgileri
   *       page: 1,
   *       limit: 20,
   *       total: 50,
   *       totalPages: 3
   *     }
   *   }
   */
  @Get()
  @ApiOperation({ summary: 'İşlemleri listele' })
  @ApiResponse({ status: 200, description: 'İşlemler listelendi' })
  async findAll(
    @Query() query: TransactionQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Service'e işlem listeleme isteği gönderilir
    // user.id: Sadece bu kullanıcının işlemlerini getir
    // query: Filtreleme, arama ve sayfalama parametreleri
    return await this.transactionsService.findAll(user.id, query);
  }

  /**
   * findOne: Tek işlem detayı endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/transactions/:id
   * 
   * Bu endpoint, belirli bir işlemin detaylı bilgilerini getirir.
   * 
   * @Get(':id'): Bu fonksiyonun GET isteğine yanıt vereceğini belirtir
   *   :id URL'deki dinamik parametredir (örneğin: /api/transactions/123)
   * 
   * Parametreler:
   * @Param('id') id: URL'den alınan işlem ID'si (string)
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 200 OK: İşlem detayı başarıyla getirildi
   * - 404 Not Found: İşlem bulunamadı veya kullanıcıya ait değil
   */
  @Get(':id')
  @ApiOperation({ summary: 'Tek işlem detayı' })
  @ApiResponse({ status: 200, description: 'İşlem detayı' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    // Service'e işlem detayı isteği gönderilir
    // id: Aranacak işlem ID'si
    // user.id: Sadece bu kullanıcıya ait işlemleri kontrol et
    return await this.transactionsService.findOne(id, user.id);
  }

  /**
   * update: İşlem güncelleme endpoint'i
   * 
   * HTTP Metodu: PUT
   * URL: /api/transactions/:id
   * 
   * Bu endpoint, mevcut bir işlemin bilgilerini günceller.
   * 
   * @Put(':id'): Bu fonksiyonun PUT isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Param('id') id: Güncellenecek işlemin ID'si
   * @Body() dto: Request body'den gelen güncelleme bilgileri (UpdateTransactionDto formatında)
   *   TÜM alanlar opsiyoneldir - sadece değiştirmek istediğiniz alanları gönderin
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 200 OK: İşlem başarıyla güncellendi
   * - 400 Bad Request: Gönderilen veriler geçersiz veya kategori tipi uyuşmuyor
   * - 404 Not Found: İşlem bulunamadı veya kullanıcıya ait değil
   */
  @Put(':id')
  @ApiOperation({ summary: 'İşlem güncelle' })
  @ApiResponse({ status: 200, description: 'İşlem başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Service'e işlem güncelleme isteği gönderilir
    // id: Güncellenecek işlemin ID'si
    // dto: Güncelleme bilgileri (sadece gönderilen alanlar güncellenir)
    // user.id: Sadece bu kullanıcıya ait işlemleri güncelleyebilir
    return await this.transactionsService.update(id, dto, user.id);
  }

  /**
   * remove: İşlem silme endpoint'i
   * 
   * HTTP Metodu: DELETE
   * URL: /api/transactions/:id
   * 
   * Bu endpoint, mevcut bir işlemi siler.
   * 
   * @Delete(':id'): Bu fonksiyonun DELETE isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Param('id') id: Silinecek işlemin ID'si
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 200 OK: İşlem başarıyla silindi
   *   { message: "İşlem başarıyla silindi" }
   * - 404 Not Found: İşlem bulunamadı veya kullanıcıya ait değil
   * 
   * NOT: Bu endpoint "hard delete" yapar, yani işlemi veritabanından tamamen siler.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'İşlem sil' })
  @ApiResponse({ status: 200, description: 'İşlem başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    // Service'e işlem silme isteği gönderilir
    // id: Silinecek işlemin ID'si
    // user.id: Sadece bu kullanıcıya ait işlemleri silebilir
    return await this.transactionsService.remove(id, user.id);
  }
}

