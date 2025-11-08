/**
 * ErrorCode Enum (Hata Kodları Sabit Değerler Listesi)
 * 
 * Bu enum, uygulamada kullanılan tüm hata kodlarını merkezi olarak tanımlar.
 * 
 * Enum Nedir?
 * Enum, bir değişkenin alabileceği sabit değerleri tanımlar.
 * Bu sayede hata kodları tutarlı olur ve yazım hataları önlenir.
 * 
 * Bu Enum'un Amacı:
 * 1. Tüm hata kodlarını merkezi olarak tanımlamak
 * 2. Tutarlı hata yönetimi sağlamak
 * 3. Frontend'de çeviri (translation) için kullanmak
 * 4. Yazım hatalarını önlemek
 * 
 * Hata Kodları Kategorileri:
 * - Validation Errors (400): Doğrulama hataları
 * - Authentication Errors (401): Kimlik doğrulama hataları
 * - Authorization Errors (403): Yetkilendirme hataları
 * - Not Found Errors (404): Bulunamadı hataları
 * - Conflict Errors (409): Çakışma hataları
 * - Business Logic Errors (422): İş mantığı hataları
 * - Server Errors (500): Sunucu hataları
 */
export enum ErrorCode {
  /**
   * Validation Errors (400) - Doğrulama Hataları
   * 
   * Bu hatalar, gelen verilerin geçersiz olduğunu belirtir.
   */
  VALIDATION_ERROR = 'VALIDATION_ERROR',      // Genel doğrulama hatası
  INVALID_INPUT = 'INVALID_INPUT',            // Geçersiz girdi

  /**
   * Authentication Errors (401) - Kimlik Doğrulama Hataları
   * 
   * Bu hatalar, kullanıcının kimliğinin doğrulanamadığını belirtir.
   */
  UNAUTHORIZED = 'UNAUTHORIZED',              // Yetkisiz erişim
  AUTH_TOKEN_INVALID = 'AUTH_TOKEN_INVALID', // Token geçersiz
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED', // Token süresi dolmuş
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS', // Geçersiz kimlik bilgileri (email/şifre yanlış)
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN', // Geçersiz refresh token

  /**
   * Authorization Errors (403) - Yetkilendirme Hataları
   * 
   * Bu hatalar, kullanıcının yetkisinin olmadığını belirtir.
   */
  FORBIDDEN = 'FORBIDDEN',                    // Yasak erişim
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS', // Yetersiz yetki

  /**
   * Not Found Errors (404) - Bulunamadı Hataları
   * 
   * Bu hatalar, istenen kaynağın bulunamadığını belirtir.
   */
  NOT_FOUND = 'NOT_FOUND',                    // Genel bulunamadı hatası
  USER_NOT_FOUND = 'USER_NOT_FOUND',          // Kullanıcı bulunamadı
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',  // Kategori bulunamadı
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND', // İşlem bulunamadı

  /**
   * Conflict Errors (409) - Çakışma Hataları
   * 
   * Bu hatalar, isteğin mevcut kayıtla çakıştığını belirtir.
   */
  CONFLICT = 'CONFLICT',                      // Genel çakışma hatası
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS', // Email zaten mevcut
  CATEGORY_NAME_EXISTS = 'CATEGORY_NAME_EXISTS', // Kategori adı zaten mevcut

  /**
   * Business Logic Errors (422) - İş Mantığı Hataları
   * 
   * Bu hatalar, iş kurallarının ihlal edildiğini belirtir.
   */
  CANNOT_DELETE_DEFAULT_CATEGORY = 'CANNOT_DELETE_DEFAULT_CATEGORY', // Varsayılan kategori silinemez
  CANNOT_DELETE_CATEGORY_WITH_TRANSACTIONS = 'CANNOT_DELETE_CATEGORY_WITH_TRANSACTIONS', // Üzerinde işlem olan kategori silinemez
  INVALID_CATEGORY = 'INVALID_CATEGORY',      // Geçersiz kategori (örneğin: gelir işlemi için expense kategorisi)
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',    // Şifreler eşleşmiyor (örneğin: şifre ve şifre onayı)

  /**
   * Server Errors (500) - Sunucu Hataları
   * 
   * Bu hatalar, sunucu tarafında bir sorun olduğunu belirtir.
   */
  SERVER_ERROR = 'SERVER_ERROR',              // Genel sunucu hatası
  DATABASE_ERROR = 'DATABASE_ERROR',          // Veritabanı hatası
  INTERNAL_ERROR = 'INTERNAL_ERROR',         // İç hata
}

