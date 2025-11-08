// NestJS: Backend framework'ü
// HttpStatus: HTTP durum kodlarını temsil eden enum
import { HttpStatus } from '@nestjs/common';

// BaseException: Tüm özel exception'ların temel sınıfı
import { BaseException } from './base.exception';

// ErrorCode: Hata kodlarını temsil eden enum
import { ErrorCode } from './error-codes.enum';

/**
 * BusinessException Sınıfı
 * 
 * Bu sınıf, iş mantığı (business logic) hatalarını temsil eden exception'dur.
 * 
 * Business Logic (İş Mantığı) Nedir?
 * İş mantığı, uygulamanın iş kurallarını içerir.
 * Örneğin:
 * - "Varsayılan kategoriler silinemez"
 * - "Üzerinde işlem yapılmış kategoriler silinemez"
 * - "Aynı isimde kategori olamaz"
 * 
 * Bu Exception Ne Zaman Kullanılır?
 * - İş kuralları ihlal edildiğinde
 * - Domain-specific (alan-spesifik) hatalar için
 * - Validation hatası değil, iş mantığı hatası olduğunda
 * 
 * HTTP Durum Kodu: 422 (UNPROCESSABLE_ENTITY)
 *   - 400 (BAD_REQUEST): Geçersiz istek (validation hatası)
 *   - 422 (UNPROCESSABLE_ENTITY): İstek geçerli ama işlenemiyor (iş mantığı hatası)
 * 
 * extends BaseException: BaseException sınıfını genişletir
 *   Bu sayede standart hata formatını kullanır
 * 
 * Örnek Kullanım:
 * throw new BusinessException(
 *   'Varsayılan kategoriler silinemez',
 *   ErrorCode.CANNOT_DELETE_DEFAULT_CATEGORY
 * );
 */
export class BusinessException extends BaseException {
  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, exception oluşturulduğunda çalışır.
   * 
   * @param message: string - İnsan tarafından okunabilir hata mesajı
   *   Örnek: "Varsayılan kategoriler silinemez"
   * 
   * @param messageKey: ErrorCode - Mesaj anahtarı (frontend için)
   *   Örnek: ErrorCode.CANNOT_DELETE_DEFAULT_CATEGORY
   * 
   * @param fields: Record<string, any[]> - Alan bazlı hatalar (opsiyonel)
   *   Genellikle business exception'larda kullanılmaz
   *   Sadece özel durumlarda kullanılır
   * 
   * İş Akışı:
   * 1. BaseException constructor'ına parametreler gönderilir
   * 2. HTTP durum kodu: 422 (UNPROCESSABLE_ENTITY)
   * 3. messageKey hem message_key hem de error olarak kullanılır
   * 4. Exception oluşturulur ve fırlatılabilir
   */
  constructor(
    message: string,
    messageKey: ErrorCode,
    fields?: Record<string, any[]>,
  ) {
    /**
     * BaseException Constructor'ını Çağır
     * 
     * super(): Üst sınıfın (BaseException) constructor'ını çağırır
     * 
     * Parametreler:
     *   - HttpStatus.UNPROCESSABLE_ENTITY: HTTP 422 durum kodu
     *     İstek geçerli ama işlenemiyor (iş mantığı hatası)
     *   - message: Hata mesajı
     *   - messageKey: Mesaj anahtarı (message_key olarak kullanılır)
     *   - messageKey: Hata kodu (error olarak kullanılır)
     *     NOT: messageKey hem message_key hem de error olarak kullanılır
     *   - fields: Alan bazlı hatalar (opsiyonel)
     */
    super(HttpStatus.UNPROCESSABLE_ENTITY, message, messageKey, messageKey, fields);
  }
}

