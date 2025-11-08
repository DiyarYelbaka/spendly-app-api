// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * SuccessResponseDto Sınıfı
 * 
 * Bu sınıf, tüm başarılı HTTP yanıtları için standart formatı tanımlar.
 * 
 * DTO (Data Transfer Object) Nedir?
 * DTO, API'den dönen verilerin yapısını tanımlar.
 * Bu sayede frontend, hangi verilerin döneceğini bilir.
 * 
 * Bu Sınıfın Amacı:
 * 1. Tüm başarılı yanıtları standart formatta döndürmek
 * 2. Frontend'in beklediği yanıt formatını sağlamak
 * 3. Mesaj anahtarları (message_key) ile çeviri desteği sağlamak
 * 
 * Generic Tip (<T>):
 * T, yanıt verisinin tipini temsil eder.
 * Örneğin: SuccessResponseDto<Category>, SuccessResponseDto<Transaction[]>
 * 
 * Örnek Kullanım:
 * return new SuccessResponseDto(
 *   category,                    // data
 *   MessageKey.CATEGORY_CREATED, // messageKey
 *   'Kategori oluşturuldu'       // message (opsiyonel)
 * );
 * 
 * Sonuç:
 * {
 *   success: true,
 *   message_key: "CATEGORY_CREATED",
 *   data: { id: "...", name: "Yemek", ... },
 *   message: "Kategori oluşturuldu"
 * }
 */
export class SuccessResponseDto<T = any> {
  /**
   * success: İşlem başarılı mı?
   * 
   * Başarılı yanıtlarda her zaman true olur.
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın özelliklerini belirtir
   *   - example: true → Örnek değer
   *   - description: Alan açıklaması
   * 
   * boolean: true veya false değeri
   */
  @ApiProperty({ example: true, description: 'İşlem başarılı mı?' })
  success: boolean;

  /**
   * message_key: Mesaj anahtarı
   * 
   * Frontend'de çeviri (translation) için kullanılan anahtar.
   * Frontend, bu anahtarı kullanarak kullanıcıya uygun mesajı gösterir.
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın özelliklerini belirtir
   * 
   * string: Metin tipinde (örneğin: "SUCCESS", "CATEGORY_CREATED")
   */
  @ApiProperty({ example: 'SUCCESS', description: 'Message key for frontend' })
  message_key: string;

  /**
   * data: Yanıt verisi
   * 
   * Controller'dan dönen asıl veri burada bulunur.
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın özelliklerini belirtir
   * 
   * T: Generic tip (herhangi bir tip olabilir)
   *   Örnek: Category, Transaction[], { categories: [...], pagination: {...} }
   */
  @ApiProperty({ description: 'Response data' })
  data: T;

  /**
   * message: İnsan tarafından okunabilir mesaj
   * 
   * Kullanıcıya gösterilecek mesaj.
   * 
   * @ApiPropertyOptional: Swagger dokümantasyonunda bu alanın opsiyonel olduğunu belirtir
   * 
   * ?: Opsiyonel alan (undefined olabilir)
   *   Bazı durumlarda gönderilmeyebilir (frontend message_key'den çeviri yapar)
   * 
   * string: Metin tipinde (örneğin: "İşlem başarılı", "Kategori oluşturuldu")
   */
  @ApiPropertyOptional({ example: 'İşlem başarılı', description: 'Human readable message' })
  message?: string;

  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, SuccessResponseDto oluşturulduğunda çalışır.
   * 
   * @param data: T - Yanıt verisi
   *   Controller'dan dönen asıl veri
   * 
   * @param messageKey: string - Mesaj anahtarı
   *   Frontend'de çeviri için kullanılan anahtar
   * 
   * @param message: string - İnsan tarafından okunabilir mesaj (opsiyonel)
   *   Kullanıcıya gösterilecek mesaj
   * 
   * İş Akışı:
   * 1. success = true olarak ayarlanır (başarılı yanıt)
   * 2. message_key = messageKey olarak ayarlanır
   * 3. data = data olarak ayarlanır
   * 4. message = message olarak ayarlanır (varsa)
   */
  constructor(data: T, messageKey: string, message?: string) {
    /**
     * Alanları Ayarla
     * 
     * this.success: Bu sınıfın success alanına true atanır
     * this.message_key: Bu sınıfın message_key alanına messageKey atanır
     * this.data: Bu sınıfın data alanına data atanır
     * this.message: Bu sınıfın message alanına message atanır (varsa)
     */
    this.success = true;
    this.message_key = messageKey;
    this.data = data;
    this.message = message;
  }
}

