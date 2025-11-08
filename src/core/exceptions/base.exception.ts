// NestJS: Backend framework'ü
// HttpException: HTTP hatalarını temsil eden temel sınıf
// HttpStatus: HTTP durum kodlarını temsil eden enum
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * ErrorResponse Interface (Arayüz)
 * 
 * Bu arayüz, hata yanıtının yapısını tanımlar.
 * Tüm hata yanıtları bu formatta döndürülür.
 * 
 * Interface Nedir?
 * Interface, bir nesnenin hangi alanlara sahip olması gerektiğini belirten bir yapıdır.
 * 
 * Bu arayüz, frontend'in beklediği hata formatını tanımlar.
 * Frontend, bu formata göre hataları gösterir ve işler.
 */
export interface ErrorResponse {
  /**
   * success: İşlem başarılı mı?
   * 
   * Hata yanıtlarında her zaman false olur.
   * 
   * false: İşlem başarısız (sabit değer)
   */
  success: false;

  /**
   * message_key: Mesaj anahtarı
   * 
   * Frontend'de çeviri (translation) için kullanılan anahtar.
   * Frontend, bu anahtarı kullanarak kullanıcıya uygun mesajı gösterir.
   * 
   * string: Metin tipinde (örneğin: "VALIDATION_ERROR", "NOT_FOUND")
   */
  message_key: string;

  /**
   * error: Hata kodu
   * 
   * Hatanın kategorisini belirten kod.
   * Genellikle message_key ile aynıdır.
   * 
   * string: Metin tipinde (örneğin: "VALIDATION_ERROR", "NOT_FOUND")
   */
  error: string;

  /**
   * message: İnsan tarafından okunabilir hata mesajı
   * 
   * Kullanıcıya gösterilecek hata mesajı.
   * 
   * string: Metin tipinde (örneğin: "Kategori bulunamadı", "Doğrulama hatası")
   */
  message: string;

  /**
   * fields: Alan bazlı hatalar (opsiyonel)
   * 
   * Doğrulama (validation) hatalarında, hangi alanlarda hata olduğunu belirtir.
   * 
   * ?: Opsiyonel alan (undefined olabilir)
   *   Sadece doğrulama hatalarında kullanılır.
   * 
   * Record<string, any[]>: Key-value çiftleri
   *   - Key: Alan adı (örneğin: "email", "password")
   *   - Value: O alandaki hata mesajları dizisi
   * 
   * Örnek:
   * {
   *   email: ["Email geçerli bir email adresi olmalıdır"],
   *   password: ["Şifre en az 8 karakter olmalıdır", "Şifre büyük harf içermelidir"]
   * }
   */
  fields?: Record<string, any[]>;

  /**
   * summary: Hata özeti (opsiyonel)
   * 
   * Kaç alanda hata olduğunu belirten özet mesaj.
   * 
   * ?: Opsiyonel alan (undefined olabilir)
   *   Sadece fields varsa kullanılır.
   * 
   * string: Metin tipinde (örneğin: "2 alanda hata bulundu")
   */
  summary?: string;
}

/**
 * BaseException Sınıfı
 * 
 * Bu sınıf, tüm özel (custom) exception'ların temel sınıfıdır.
 * Tutarlı hata yanıt formatı sağlar.
 * 
 * Exception (İstisna) Nedir?
 * Exception, bir hata durumunu temsil eden bir nesnedir.
 * Hata oluştuğunda, exception fırlatılır (throw) ve yakalanır (catch).
 * 
 * abstract: Bu sınıf doğrudan kullanılamaz, sadece türetilerek (extend) kullanılır
 *   Örnek: BusinessException extends BaseException
 * 
 * extends HttpException: NestJS'in HttpException sınıfını genişletir
 *   Bu sayede HTTP hatalarını standart formatta fırlatabiliriz
 * 
 * Bu Sınıfın Amacı:
 * 1. Tüm hata yanıtlarını standart formatta döndürmek
 * 2. Frontend'in beklediği hata formatını sağlamak
 * 3. Hata yönetimini merkezileştirmek
 */
export abstract class BaseException extends HttpException {
  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, exception oluşturulduğunda çalışır.
   * Hata yanıtını oluşturur ve HttpException'a gönderir.
   * 
   * @param status: HttpStatus - HTTP durum kodu
   *   Örnek: HttpStatus.BAD_REQUEST (400), HttpStatus.NOT_FOUND (404)
   * 
   * @param message: string - İnsan tarafından okunabilir hata mesajı
   *   Örnek: "Kategori bulunamadı", "Doğrulama hatası"
   * 
   * @param messageKey: string - Mesaj anahtarı (frontend için)
   *   Örnek: "NOT_FOUND", "VALIDATION_ERROR"
   * 
   * @param error: string - Hata kodu
   *   Genellikle messageKey ile aynıdır
   * 
   * @param fields: Record<string, any[]> - Alan bazlı hatalar (opsiyonel)
   *   Sadece doğrulama hatalarında kullanılır
   * 
   * İş Akışı:
   * 1. ErrorResponse nesnesi oluşturulur
   * 2. Alanlar doldurulur (success, message_key, error, message)
   * 3. Eğer fields varsa, fields ve summary eklenir
   * 4. HttpException'a gönderilir (super() ile)
   */
  constructor(
    status: HttpStatus,
    message: string,
    messageKey: string,
    error: string,
    fields?: Record<string, any[]>,
  ) {
    /**
     * ErrorResponse Nesnesi Oluştur
     * 
     * Bu nesne, frontend'in beklediği hata formatını içerir.
     */
    const response: ErrorResponse = {
      success: false,
      message_key: messageKey,
      error: error,
      message: message,
      /**
       * Spread Operator (...) Kullanımı
       * 
       * ...(fields && { fields }): Eğer fields varsa, fields alanını ekle
       *   - fields && { fields }: Eğer fields truthy ise, { fields } nesnesini döndür
       *   - ...: Nesneyi aç ve içindeki alanları response'a ekle
       * 
       * Örnek:
       * fields = { email: ["Hata mesajı"] }
       * → ...(true && { fields })
       * → ...{ fields: { email: ["Hata mesajı"] } }
       * → response.fields = { email: ["Hata mesajı"] }
       */
      ...(fields && { fields }),
      /**
       * Summary Oluştur
       * 
       * Eğer fields varsa, kaç alanda hata olduğunu belirten özet mesaj oluştur.
       * 
       * Object.keys(fields).length: fields nesnesindeki anahtar sayısı
       *   Örnek: { email: [...], password: [...] } → 2 alan
       * 
       * Template Literal (``): String içinde değişken kullanmak için
       *   Örnek: `${2} alanda hata bulundu` → "2 alanda hata bulundu"
       */
      ...(fields && {
        summary: `${Object.keys(fields).length} alanda hata bulundu`,
      }),
    };

    /**
     * HttpException'a Gönder
     * 
     * super(): Üst sınıfın (HttpException) constructor'ını çağırır
     *   - response: Hata yanıtı (ErrorResponse formatında)
     *   - status: HTTP durum kodu
     * 
     * Bu sayede, exception fırlatıldığında (throw) standart HTTP hatası olarak işlenir.
     */
    super(response, status);
  }
}

