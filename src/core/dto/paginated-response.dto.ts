// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty } from '@nestjs/swagger';

// SuccessResponseDto: Standart başarı yanıtı formatı
import { SuccessResponseDto } from './success-response.dto';

/**
 * PaginationDto Sınıfı
 * 
 * Bu sınıf, sayfalama (pagination) bilgilerini tanımlar.
 * React Native AdvancedList bileşeni için camelCase formatında.
 * 
 * Sayfalama Nedir?
 * Sayfalama, büyük veri listelerini küçük parçalara bölerek göstermek için kullanılan bir tekniktir.
 * 
 * Bu sınıf, sayfalama hakkında bilgi verir:
 * - Toplam kaç kayıt var?
 * - Toplam kaç sayfa var?
 * - Hangi sayfadayız?
 * - Sayfa başına kaç kayıt gösteriliyor?
 */
export class PaginationDto {
  /**
   * totalResults: Toplam kayıt sayısı (camelCase)
   * 
   * Tüm kayıtların toplam sayısı (sayfalama olmadan).
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın özelliklerini belirtir
   * 
   * number: Sayı tipinde (örneğin: 100, 500, 1000)
   * 
   * Örnek: 100 kayıt varsa ve sayfa başına 20 kayıt gösteriliyorsa → 5 sayfa olur
   */
  @ApiProperty({ example: 100, description: 'Toplam kayıt sayısı' })
  totalResults: number;

  /**
   * totalPages: Toplam sayfa sayısı (camelCase)
   * 
   * Toplam kaç sayfa olduğunu belirtir.
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın özelliklerini belirtir
   * 
   * number: Sayı tipinde (örneğin: 5, 10, 25)
   * 
   * Örnek: 100 kayıt, 20 kayıt/sayfa → 5 sayfa
   */
  @ApiProperty({ example: 5, description: 'Toplam sayfa sayısı' })
  totalPages: number;

  /**
   * currentPage: Mevcut sayfa numarası (camelCase)
   * 
   * Kullanıcının hangi sayfada olduğunu belirtir.
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın özelliklerini belirtir
   * 
   * number: Sayı tipinde (örneğin: 1, 2, 5)
   * 
   * Örnek: 1 → İlk sayfa, 2 → İkinci sayfa
   */
  @ApiProperty({ example: 1, description: 'Mevcut sayfa' })
  currentPage: number;

  /**
   * perPage: Sayfa başına kayıt sayısı (camelCase)
   * 
   * Bir sayfada kaç kayıt gösterildiğini belirtir.
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın özelliklerini belirtir
   * 
   * number: Sayı tipinde (örneğin: 20, 50, 100)
   * 
   * Örnek: 20 → Her sayfada 20 kayıt gösteriliyor
   */
  @ApiProperty({ example: 20, description: 'Sayfa başına kayıt sayısı' })
  perPage: number;
}

/**
 * PaginatedDataDto Sınıfı
 * 
 * Bu sınıf, sayfalanmış veri yapısını tanımlar.
 * Hem kayıtları hem de sayfalama bilgilerini içerir.
 * 
 * Generic Tip (<T>):
 * T, kayıt tipini temsil eder.
 * Örneğin: PaginatedDataDto<Category>, PaginatedDataDto<Transaction>
 */
export class PaginatedDataDto<T = any> {
  /**
   * items: Kayıt listesi
   * 
   * Mevcut sayfadaki kayıtlar.
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın özelliklerini belirtir
   * 
   * T[]: T tipinde bir dizi (array)
   *   Örnek: Category[], Transaction[]
   */
  @ApiProperty({ description: 'Items array' })
  items: T[];

  /**
   * pagination: Sayfalama bilgileri
   * 
   * Sayfalama hakkında bilgi (toplam kayıt, mevcut sayfa, sayfa başına kayıt).
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın özelliklerini belirtir
   *   - type: PaginationDto → Bu alanın tipi PaginationDto
   * 
   * PaginationDto: Sayfalama bilgilerini içeren sınıf
   */
  @ApiProperty({ type: PaginationDto, description: 'Pagination metadata' })
  pagination: PaginationDto;

  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, PaginatedDataDto oluşturulduğunda çalışır.
   * 
   * @param items: T[] - Kayıt listesi
   * @param pagination: PaginationDto - Sayfalama bilgileri
   */
  constructor(items: T[], pagination: PaginationDto) {
    this.items = items;
    this.pagination = pagination;
  }
}

/**
 * PaginatedResponseDto Sınıfı
 * 
 * Bu sınıf, sayfalanmış yanıtlar için standart formatı tanımlar.
 * 
 * extends SuccessResponseDto: SuccessResponseDto sınıfını genişletir
 *   Bu sayede standart başarı yanıtı formatını kullanır
 * 
 * Generic Tip (<T>):
 * T, kayıt tipini temsil eder.
 * Örneğin: PaginatedResponseDto<Category>, PaginatedResponseDto<Transaction>
 * 
 * Örnek Kullanım:
 * return new PaginatedResponseDto(
 *   categories,                    // items
 *   { totalResults: 100, totalPages: 5, currentPage: 1, perPage: 20 }, // pagination
 *   MessageKey.CATEGORIES_RETRIEVED, // messageKey
 *   'Kategoriler getirildi'         // message (opsiyonel)
 * );
 * 
 * Sonuç:
 * {
 *   success: true,
 *   message_key: "CATEGORIES_RETRIEVED",
 *   data: {
 *     items: [{ id: "...", name: "Yemek" }, ...],
 *     pagination: { totalResults: 100, totalPages: 5, currentPage: 1, perPage: 20 }
 *   },
 *   message: "Kategoriler getirildi"
 * }
 */
export class PaginatedResponseDto<T = any> extends SuccessResponseDto<PaginatedDataDto<T>> {
  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, PaginatedResponseDto oluşturulduğunda çalışır.
   * 
   * @param items: T[] - Kayıt listesi
   *   Mevcut sayfadaki kayıtlar
   * 
   * @param pagination: PaginationDto - Sayfalama bilgileri
   *   Toplam kayıt, mevcut sayfa, sayfa başına kayıt
   * 
   * @param messageKey: string - Mesaj anahtarı
   *   Frontend'de çeviri için kullanılan anahtar
   * 
   * @param message: string - İnsan tarafından okunabilir mesaj (opsiyonel)
   *   Kullanıcıya gösterilecek mesaj
   * 
   * İş Akışı:
   * 1. PaginatedDataDto oluşturulur (items ve pagination ile)
   * 2. SuccessResponseDto constructor'ına gönderilir
   * 3. Standart başarı yanıtı formatında döndürülür
   */
  constructor(items: T[], pagination: PaginationDto, messageKey: string, message?: string) {
    /**
     * SuccessResponseDto Constructor'ını Çağır
     * 
     * super(): Üst sınıfın (SuccessResponseDto) constructor'ını çağırır
     * 
     * Parametreler:
     *   - new PaginatedDataDto(items, pagination): Sayfalanmış veri yapısı
     *     - items: Kayıt listesi
     *     - pagination: Sayfalama bilgileri
     *   - messageKey: Mesaj anahtarı
     *   - message: İnsan tarafından okunabilir mesaj (opsiyonel)
     */
    super(new PaginatedDataDto(items, pagination), messageKey, message);
  }
}

