// NestJS: Backend framework'ü - Node.js için geliştirilmiş bir framework
// Controller, Get, Post, vb.: HTTP isteklerini yönetmek için kullanılan decorator'lar (süsleyiciler)
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
// Bu decorator'lar sayesinde API endpoint'lerimiz otomatik olarak dokümante edilir
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// CategoriesService: Kategori işlemlerini yapan servis sınıfı
// Controller, HTTP isteklerini alır ve iş mantığını (business logic) service'e yönlendirir
import { CategoriesService } from './categories.service';

// DTO'lar: Gelen verilerin yapısını tanımlayan sınıflar
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';

// JwtAuthGuard: JWT token kontrolü yapan guard (koruyucu)
// Bu guard, sadece giriş yapmış kullanıcıların bu endpoint'lere erişmesine izin verir
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// CurrentUser: Mevcut kullanıcı bilgisini almak için kullanılan decorator
// UserPayload: Kullanıcı bilgilerinin tipi (id, email, vb.)
import { CurrentUser, UserPayload } from '../core';

/**
 * CategoriesController Sınıfı
 * 
 * Bu sınıf, kategori ile ilgili HTTP isteklerini karşılar.
 * Controller'ın görevi:
 * 1. HTTP isteklerini almak (GET, POST, PUT, DELETE)
 * 2. Gelen verileri doğrulamak (DTO ile)
 * 3. İş mantığını service'e yönlendirmek
 * 4. Service'den gelen sonucu HTTP yanıtı olarak döndürmek
 * 
 * @ApiTags('categories'): Swagger dokümantasyonunda bu controller'ı "categories" grubunda gösterir
 * @Controller('categories'): Bu controller'ın URL'i /api/categories olur
 * @UseGuards(JwtAuthGuard): Bu controller'daki tüm endpoint'ler için JWT token kontrolü yapar
 * @ApiBearerAuth(): Swagger'da bu endpoint'lerin Bearer token gerektirdiğini belirtir
 */
@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, controller oluşturulduğunda çalışır.
   * CategoriesService'i buraya enjekte eder (dependency injection).
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * categoriesService: Kategori işlemlerini yapan servis
   */
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * create: Yeni kategori oluşturma endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/categories
   * 
   * Bu endpoint, kullanıcının yeni bir kategori oluşturmasını sağlar.
   * 
   * @Post(): Bu fonksiyonun POST isteğine yanıt vereceğini belirtir
   * @ApiOperation(): Swagger dokümantasyonunda bu endpoint'in açıklaması
   * @ApiResponse(): Swagger'da bu endpoint'in dönebileceği HTTP durum kodları
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen kategori bilgileri (CreateCategoryDto formatında)
   *   - name: Kategori adı (zorunlu)
   *   - type: Kategori tipi - income veya expense (zorunlu)
   *   - icon: Kategori ikonu (opsiyonel)
   *   - color: Kategori rengi (opsiyonel)
   *   - description: Kategori açıklaması (opsiyonel)
   *   - sort_order: Sıralama sırası (opsiyonel)
   * 
   * @CurrentUser() user: JWT token'dan alınan mevcut kullanıcı bilgisi
   *   - user.id: Kullanıcının benzersiz ID'si (kategoriyi hangi kullanıcının oluşturduğunu belirlemek için)
   * 
   * Dönüş Değeri:
   * - 201 Created: Kategori başarıyla oluşturuldu
   * - 400 Bad Request: Gönderilen veriler geçersiz (validation hatası)
   * - 409 Conflict: Aynı isimde bir kategori zaten mevcut
   * 
   * İş Akışı:
   * 1. Gelen veriler CreateCategoryDto formatında doğrulanır
   * 2. Kullanıcı bilgisi JWT token'dan alınır
   * 3. Service'e kategori oluşturma isteği gönderilir
   * 4. Service, veritabanına kategoriyi kaydeder
   * 5. Oluşturulan kategori bilgisi döndürülür
   */
  @Post()
  @ApiOperation({ summary: 'Yeni kategori oluştur' })
  @ApiResponse({ status: 201, description: 'Kategori başarıyla oluşturuldu' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  @ApiResponse({ status: 409, description: 'Kategori adı zaten mevcut' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Service'e kategori oluşturma isteği gönderilir
    // dto: Kullanıcıdan gelen kategori bilgileri
    // user.id: Kategoriyi oluşturan kullanıcının ID'si
    // await: Service'in işlemi tamamlamasını bekler (asynchronous işlem)
    return await this.categoriesService.create(dto, user.id);
  }

  /**
   * findAll: Kategorileri listeleme endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/categories
   * 
   * Bu endpoint, kullanıcının kategorilerini listeler.
   * Sayfalama (pagination), filtreleme ve arama özellikleri destekler.
   * 
   * @Get(): Bu fonksiyonun GET isteğine yanıt vereceğini belirtir
   * 
   * Query Parametreleri (URL'de ? ile başlayan parametreler):
   * @Query() query: URL'den gelen sorgu parametreleri (CategoryQueryDto formatında)
   *   - page: Sayfa numarası (varsayılan: 1)
   *   - limit: Sayfa başına kayıt sayısı (varsayılan: 20)
   *   - type: Kategori tipi filtresi (income veya expense) - opsiyonel
   *   - search: Arama terimi (kategori adında ara) - opsiyonel
   *   - include_defaults: Varsayılan kategorileri dahil et (varsayılan: true) - opsiyonel
   *   - include_stats: İstatistikleri dahil et (varsayılan: false) - opsiyonel
   * 
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Örnek Kullanım:
   * GET /api/categories?type=expense&search=yemek&page=1&limit=20
   * 
   * Dönüş Değeri:
   * - 200 OK: Kategoriler başarıyla listelendi
   *   {
   *     items: [...], // Kategori listesi
   *     pagination: {     // Sayfalama bilgileri
   *       page: 1,
   *       limit: 20,
   *       total: 50,
   *       totalPages: 3
   *     }
   *   }
   * 
   * İş Akışı:
   * 1. Query parametreleri CategoryQueryDto formatında doğrulanır
   * 2. Kullanıcı bilgisi JWT token'dan alınır
   * 3. Service'e kategori listeleme isteği gönderilir
   * 4. Service, veritabanından kullanıcının kategorilerini getirir
   * 5. Filtreleme, arama ve sayfalama uygulanır
   * 6. Kategori listesi ve sayfalama bilgileri döndürülür
   */
  @Get()
  @ApiOperation({ summary: 'Kategorileri listele' })
  @ApiResponse({ status: 200, description: 'Kategoriler listelendi' })
  async findAll(
    @Query() query: CategoryQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Service'e kategori listeleme isteği gönderilir
    // user.id: Sadece bu kullanıcının kategorilerini getir
    // query: Filtreleme, arama ve sayfalama parametreleri
    return await this.categoriesService.findAll(user.id, query);
  }

  /**
   * findOne: Tek kategori detayı endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/categories/:id
   * 
   * Bu endpoint, belirli bir kategorinin detaylı bilgilerini getirir.
   * 
   * @Get(':id'): Bu fonksiyonun GET isteğine yanıt vereceğini belirtir
   *   :id URL'deki dinamik parametredir (örneğin: /api/categories/123)
   * 
   * Parametreler:
   * @Param('id') id: URL'den alınan kategori ID'si (string)
   *   Örnek: /api/categories/abc123 → id = "abc123"
   * 
   * @Query('include_stats') includeStats: İstatistikleri dahil etme parametresi (opsiyonel)
   *   - "true" string'i gelirse → İstatistikleri dahil et
   *   - Diğer durumlarda → İstatistikleri dahil etme
   *   Örnek: /api/categories/123?include_stats=true
   * 
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Dönüş Değeri:
   * - 200 OK: Kategori detayı başarıyla getirildi
   *   {
   *     id: "...",
   *     name: "Yemek",
   *     type: "expense",
   *     icon: "🍔",
   *     color: "#FF5733",
   *     stats: { // include_stats=true ise
   *       transaction_count: 15,
   *       total_amount: 1250.50
   *     }
   *   }
   * - 404 Not Found: Kategori bulunamadı veya kullanıcıya ait değil
   * 
   * İş Akışı:
   * 1. URL'den kategori ID'si alınır
   * 2. Kullanıcı bilgisi JWT token'dan alınır
   * 3. Service'e kategori detayı isteği gönderilir
   * 4. Service, veritabanından kategoriyi bulur ve kullanıcı kontrolü yapar
   * 5. İstenirse istatistikler hesaplanır
   * 6. Kategori detayı döndürülür
   */
  @Get(':id')
  @ApiOperation({ summary: 'Tek kategori detayı' })
  @ApiResponse({ status: 200, description: 'Kategori detayı' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  async findOne(
    @Param('id') id: string,
    @Query('include_stats') includeStats: string,
    @CurrentUser() user: UserPayload,
  ) {
    // Service'e kategori detayı isteği gönderilir
    // id: Aranacak kategori ID'si
    // user.id: Sadece bu kullanıcıya ait kategorileri kontrol et
    // includeStats === 'true': URL'den gelen string değerini boolean'a çevir
    return await this.categoriesService.findOne(
      id,
      user.id,
      includeStats === 'true',
    );
  }

  /**
   * update: Kategori güncelleme endpoint'i
   * 
   * HTTP Metodu: PUT
   * URL: /api/categories/:id
   * 
   * Bu endpoint, mevcut bir kategorinin bilgilerini günceller.
   * 
   * @Put(':id'): Bu fonksiyonun PUT isteğine yanıt vereceğini belirtir
   *   :id URL'deki dinamik parametredir
   * 
   * Parametreler:
   * @Param('id') id: Güncellenecek kategorinin ID'si
   * 
   * @Body() dto: Request body'den gelen güncelleme bilgileri (UpdateCategoryDto formatında)
   *   TÜM alanlar opsiyoneldir - sadece değiştirmek istediğiniz alanları gönderin:
   *   - name: Yeni kategori adı (opsiyonel)
   *   - icon: Yeni kategori ikonu (opsiyonel)
   *   - color: Yeni kategori rengi (opsiyonel)
   *   - description: Yeni kategori açıklaması (opsiyonel)
   *   - sort_order: Yeni sıralama sırası (opsiyonel)
   *   - is_active: Kategori aktif mi? (opsiyonel)
   * 
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Örnek Kullanım:
   * PUT /api/categories/123
   * {
   *   "name": "Yeni İsim",
   *   "color": "#00FF00"
   * }
   * 
   * Dönüş Değeri:
   * - 200 OK: Kategori başarıyla güncellendi
   * - 400 Bad Request: Gönderilen veriler geçersiz
   * - 404 Not Found: Kategori bulunamadı veya kullanıcıya ait değil
   * - 409 Conflict: Yeni isim zaten başka bir kategoride kullanılıyor
   * 
   * İş Akışı:
   * 1. URL'den kategori ID'si alınır
   * 2. Request body'den güncelleme bilgileri alınır ve doğrulanır
   * 3. Kullanıcı bilgisi JWT token'dan alınır
   * 4. Service'e kategori güncelleme isteği gönderilir
   * 5. Service, kategoriyi bulur, kullanıcı kontrolü yapar ve günceller
   * 6. Güncellenmiş kategori bilgisi döndürülür
   */
  @Put(':id')
  @ApiOperation({ summary: 'Kategori güncelle' })
  @ApiResponse({ status: 200, description: 'Kategori başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: UserPayload,
  ) {
    // Service'e kategori güncelleme isteği gönderilir
    // id: Güncellenecek kategorinin ID'si
    // dto: Güncelleme bilgileri (sadece gönderilen alanlar güncellenir)
    // user.id: Sadece bu kullanıcıya ait kategorileri güncelleyebilir
    return await this.categoriesService.update(id, dto, user.id);
  }

  /**
   * remove: Kategori silme endpoint'i
   * 
   * HTTP Metodu: DELETE
   * URL: /api/categories/:id
   * 
   * Bu endpoint, mevcut bir kategoriyi siler.
   * 
   * ÖNEMLİ: Bu endpoint "soft delete" yapar, yani kategoriyi tamamen silmez,
   * sadece isActive alanını false yapar. Böylece kategori veritabanında kalır
   * ama listelerde görünmez.
   * 
   * @Delete(':id'): Bu fonksiyonun DELETE isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Param('id') id: Silinecek kategorinin ID'si
   * @CurrentUser() user: Mevcut kullanıcı bilgisi
   * 
   * Örnek Kullanım:
   * DELETE /api/categories/123
   * 
   * Dönüş Değeri:
   * - 200 OK: Kategori başarıyla silindi
   *   { message: "Kategori başarıyla silindi" }
   * - 404 Not Found: Kategori bulunamadı veya kullanıcıya ait değil
   * - 403 Forbidden: Kategori silinemez (varsayılan kategori veya işlem yapılmış kategori)
   * 
   * Silme Kuralları:
   * 1. Varsayılan kategoriler (isDefault=true) silinemez
   * 2. Üzerinde işlem (transaction) yapılmış kategoriler silinemez
   * 3. Sadece kullanıcının kendi kategorileri silinebilir
   * 
   * İş Akışı:
   * 1. URL'den kategori ID'si alınır
   * 2. Kullanıcı bilgisi JWT token'dan alınır
   * 3. Service'e kategori silme isteği gönderilir
   * 4. Service, kategoriyi bulur ve silme kurallarını kontrol eder
   * 5. Kategori silinebilirse, isActive=false yapılır (soft delete)
   * 6. Başarı mesajı döndürülür
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Kategori sil' })
  @ApiResponse({ status: 200, description: 'Kategori başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  @ApiResponse({ status: 403, description: 'Kategori silinemez' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    // Service'e kategori silme isteği gönderilir
    // id: Silinecek kategorinin ID'si
    // user.id: Sadece bu kullanıcıya ait kategorileri silebilir
    return await this.categoriesService.remove(id, user.id);
  }
}

