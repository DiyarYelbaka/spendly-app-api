// NestJS: Backend framework'ü
// HttpStatus: HTTP durum kodlarını temsil eden enum
import { HttpStatus } from '@nestjs/common';

// BaseException: Tüm özel exception'ların temel sınıfı
import { BaseException } from './base.exception';

// ErrorCode: Hata kodlarını temsil eden enum
import { ErrorCode } from './error-codes.enum';

/**
 * ValidationException Sınıfı
 * 
 * Bu sınıf, doğrulama (validation) hatalarını temsil eden exception'dur.
 * 
 * Validation (Doğrulama) Nedir?
 * Validation, gelen verilerin geçerli olup olmadığını kontrol etmektir.
 * Örneğin:
 * - Email geçerli bir email formatında mı?
 * - Şifre en az 8 karakter mi?
 * - Zorunlu alanlar doldurulmuş mu?
 * 
 * Bu Exception Ne Zaman Kullanılır?
 * - Gelen veriler geçersiz olduğunda
 * - class-validator hataları oluştuğunda
 * - Alan bazlı hatalar olduğunda
 * 
 * HTTP Durum Kodu: 400 (BAD_REQUEST)
 *   Geçersiz istek - Kullanıcı gönderdiği veriler hatalı
 * 
 * extends BaseException: BaseException sınıfını genişletir
 *   Bu sayede standart hata formatını kullanır
 * 
 * Örnek Kullanım:
 * throw new ValidationException({
 *   email: ["Email geçerli bir email adresi olmalıdır"],
 *   password: ["Şifre en az 8 karakter olmalıdır"]
 * });
 */
export class ValidationException extends BaseException {
  /**
   * fields: Alan bazlı hatalar
   * 
   * public: Bu alan dışarıdan erişilebilir
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
  constructor(public fields: Record<string, any[]>) {
    /**
     * BaseException Constructor'ını Çağır
     * 
     * super(): Üst sınıfın (BaseException) constructor'ını çağırır
     * 
     * Parametreler:
     *   - HttpStatus.BAD_REQUEST: HTTP 400 durum kodu
     *     Geçersiz istek - Kullanıcı gönderdiği veriler hatalı
     *   - 'Doğrulama hatası': Hata mesajı
     *   - ErrorCode.VALIDATION_ERROR: Mesaj anahtarı (message_key olarak kullanılır)
     *   - ErrorCode.VALIDATION_ERROR: Hata kodu (error olarak kullanılır)
     *   - fields: Alan bazlı hatalar
     *     Bu alan, BaseException'da fields ve summary oluşturmak için kullanılır
     */
    super(
      HttpStatus.BAD_REQUEST,
      'Doğrulama hatası',
      ErrorCode.VALIDATION_ERROR,
      ErrorCode.VALIDATION_ERROR,
      fields,
    );
  }
}

