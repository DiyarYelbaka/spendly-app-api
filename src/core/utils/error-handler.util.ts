// NestJS: Backend framework'ü
// Exception sınıfları: Farklı hata durumlarını temsil eder
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';

// Prisma: Veritabanı ORM'i
// Prisma: Prisma hata tiplerini içerir
import { Prisma } from '@prisma/client';

// ErrorCode: Hata kodlarını temsil eden enum
import { ErrorCode } from '../exceptions/error-codes.enum';

/**
 * ErrorHandler Sınıfı
 * 
 * Bu sınıf, Prisma ve diğer hataları yakalayıp anlamlı exception'lara dönüştüren yardımcı fonksiyonlar içerir.
 * 
 * Utility (Yardımcı) Nedir?
 * Utility, ortak işlemler için kullanılan yardımcı fonksiyonlardır.
 * Bu fonksiyonlar, farklı yerlerde tekrar kullanılabilir.
 * 
 * static: Bu fonksiyonlar sınıf üzerinden çağrılır (örnek oluşturmaya gerek yok)
 *   Örnek: ErrorHandler.handleError(...)
 * 
 * Bu Sınıfın Amacı:
 * 1. Prisma hatalarını anlamlı exception'lara dönüştürmek
 * 2. Hata yönetimini merkezileştirmek
 * 3. Tutarlı hata mesajları sağlamak
 */
export class ErrorHandler {
  /**
   * handlePrismaError: Prisma hatalarını yakalayıp uygun exception'a dönüştüren fonksiyon
   * 
   * Bu fonksiyon, Prisma veritabanı hatalarını yakalar ve anlamlı HTTP exception'larına dönüştürür.
   * 
   * @param error: unknown - Oluşan hata
   *   Herhangi bir tip olabilir (Prisma hatası, NestJS exception'ı, vb.)
   * 
   * @param logger: Logger - Loglama nesnesi
   *   Hataları loglamak için kullanılır
   * 
   * @param context: string - Hatanın oluştuğu bağlam
   *   Örnek: "create category", "update transaction"
   *   Loglarda hangi işlem sırasında hata oluştuğunu gösterir
   * 
   * @param defaultMessage: string - Varsayılan hata mesajı
   *   Eğer hata tanınmazsa, bu mesaj kullanılır
   * 
   * @returns never - Bu fonksiyon hiçbir zaman normal şekilde dönmez, her zaman exception fırlatır
   * 
   * İş Akışı:
   * 1. NestJS exception'ları kontrol edilir (direkt fırlatılır)
   * 2. Prisma hataları kontrol edilir (koduna göre işlenir)
   * 3. Prisma validation hataları kontrol edilir
   * 4. Diğer hatalar genel server error olarak işlenir
   * 
   * Prisma Hata Kodları:
   * - P2002: Unique constraint violation (benzersizlik kuralı ihlali)
   * - P2003: Foreign key constraint violation (yabancı anahtar kuralı ihlali)
   * - P2025: Record not found (kayıt bulunamadı)
   * - P2014: Required relation violation (gerekli ilişki eksik)
   */
  static handlePrismaError(
    error: unknown,
    logger: Logger,
    context: string,
    defaultMessage: string,
  ): never {
    /**
     * ADIM 1: NestJS Exception'larını Kontrol Et
     * 
     * Eğer hata zaten bir NestJS exception'ı ise (HttpException, NotFoundException, vb.),
     * direkt fırlatılır. Çünkü bu exception'lar zaten doğru formatta ve işlenmiş durumdadır.
     * 
     * instanceof: Bir nesnenin belirli bir sınıftan türeyip türemediğini kontrol eder
     * 
     * throw error: Exception'ı tekrar fırlatır
     *   Bu sayede exception'ın orijinal formatı korunur
     */
    if (
      error instanceof HttpException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof BadRequestException ||
      error instanceof ForbiddenException
    ) {
      throw error;
    }

    /**
     * ADIM 2: Prisma Bilinen Hatalarını İşle
     * 
     * Prisma.PrismaClientKnownRequestError: Prisma'nın bilinen hataları
     *   Bu hatalar, veritabanı kural ihlalleri gibi durumlarda oluşur.
     *   Her hata, bir kod (error.code) ile tanımlanır.
     */
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      /**
       * Hata Logla
       * 
       * logger.error(): Hata seviyesinde log yazar
       *   - İlk parametre: Log mesajı (hangi bağlamda, ne hatası)
       *   - İkinci parametre: Stack trace (hata yığını)
       */
      logger.error(`Prisma error in ${context}: ${error.message}`, error.stack);

      /**
       * Hata Koduna Göre İşle
       * 
       * switch: Hata koduna göre farklı işlemler yapar
       *   error.code: Prisma hata kodu (örneğin: "P2002", "P2025")
       */
      switch (error.code) {
        /**
         * P2002: Unique Constraint Violation (Benzersizlik Kuralı İhlali)
         * 
         * Bu hata, benzersiz (unique) bir alana aynı değer eklenmeye çalışıldığında oluşur.
         * Örnek: Aynı email ile iki kullanıcı oluşturulmaya çalışılırsa
         * 
         * ConflictException (409): Çakışma hatası
         *   İstek, mevcut kayıtla çakışıyor
         */
        case 'P2002':
          // Benzersizlik kuralı ihlali
          throw new ConflictException({
            message: defaultMessage || 'Bu kayıt zaten mevcut',
            messageKey: ErrorCode.CONFLICT,
            error: ErrorCode.CONFLICT,
          });

        /**
         * P2003: Foreign Key Constraint Violation (Yabancı Anahtar Kuralı İhlali)
         * 
         * Bu hata, var olmayan bir kayda referans verilmeye çalışıldığında oluşur.
         * Örnek: Var olmayan bir kategori ID'si ile işlem oluşturulmaya çalışılırsa
         * 
         * BadRequestException (400): Geçersiz istek
         *   İstek geçersiz (var olmayan bir kayda referans)
         */
        case 'P2003':
          // Yabancı anahtar kuralı ihlali
          throw new BadRequestException({
            message: defaultMessage || 'Geçersiz referans',
            messageKey: ErrorCode.INVALID_INPUT,
            error: ErrorCode.INVALID_INPUT,
          });

        /**
         * P2025: Record Not Found (Kayıt Bulunamadı)
         * 
         * Bu hata, güncellenmeye veya silinmeye çalışılan kayıt bulunamadığında oluşur.
         * Örnek: Var olmayan bir kategori ID'si ile güncelleme yapılmaya çalışılırsa
         * 
         * NotFoundException (404): Bulunamadı hatası
         *   İstenen kayıt bulunamadı
         */
        case 'P2025':
          // Kayıt bulunamadı
          throw new NotFoundException({
            message: defaultMessage || 'Kayıt bulunamadı',
            messageKey: ErrorCode.NOT_FOUND,
            error: ErrorCode.NOT_FOUND,
          });

        /**
         * P2014: Required Relation Violation (Gerekli İlişki Eksik)
         * 
         * Bu hata, gerekli bir ilişki eksik olduğunda oluşur.
         * Örnek: Bir kategori silinmeye çalışılıyor ama üzerinde işlemler varsa
         * 
         * BadRequestException (400): Geçersiz istek
         *   İstek geçersiz (gerekli ilişki eksik)
         */
        case 'P2014':
          // Gerekli ilişki eksik
          throw new BadRequestException({
            message: defaultMessage || 'Gerekli ilişki eksik',
            messageKey: ErrorCode.INVALID_INPUT,
            error: ErrorCode.INVALID_INPUT,
          });

        /**
         * default: Diğer Prisma Hataları
         * 
         * Eğer hata kodu tanınmazsa, genel veritabanı hatası olarak işlenir.
         * 
         * InternalServerErrorException (500): Sunucu hatası
         *   Veritabanı hatası (tanınmayan hata kodu)
         */
        default:
          throw new InternalServerErrorException({
            message: defaultMessage || 'Veritabanı hatası',
            messageKey: ErrorCode.DATABASE_ERROR,
            error: ErrorCode.DATABASE_ERROR,
          });
      }
    }

    /**
     * ADIM 3: Prisma Validation Hatalarını İşle
     * 
     * Prisma.PrismaClientValidationError: Prisma validation hataları
     *   Bu hatalar, veri formatı hatalarında oluşur.
     *   Örnek: String bir alana number gönderilirse
     * 
     * BadRequestException (400): Geçersiz istek
     *   Veri formatı geçersiz
     */
    if (error instanceof Prisma.PrismaClientValidationError) {
      /**
       * Hata Logla
       */
      logger.error(`Prisma validation error in ${context}: ${error.message}`, error.stack);
      
      /**
       * Validation Exception Fırlat
       */
      throw new BadRequestException({
        message: 'Geçersiz veri formatı',
        messageKey: ErrorCode.VALIDATION_ERROR,
        error: ErrorCode.VALIDATION_ERROR,
      });
    }

    /**
     * ADIM 4: Diğer Hataları İşle
     * 
     * Eğer hata Prisma hatası değilse, genel sunucu hatası olarak işlenir.
     * 
     * InternalServerErrorException (500): Sunucu hatası
     *   Beklenmeyen bir hata oluştu
     */
    logger.error(`Unexpected error in ${context}: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error.stack : undefined);
    throw new InternalServerErrorException({
      message: defaultMessage || 'Beklenmeyen bir hata oluştu',
      messageKey: ErrorCode.SERVER_ERROR,
      error: ErrorCode.SERVER_ERROR,
    });
  }

  /**
   * handleError: Genel hata yöneticisi
   * 
   * Bu fonksiyon, tüm hataları yakalar ve uygun exception'a dönüştürür.
   * 
   * @param error: unknown - Oluşan hata
   * @param logger: Logger - Loglama nesnesi
   * @param context: string - Hatanın oluştuğu bağlam
   * @param defaultMessage: string - Varsayılan hata mesajı
   * 
   * @returns never - Bu fonksiyon hiçbir zaman normal şekilde dönmez, her zaman exception fırlatır
   * 
   * İş Akışı:
   * 1. handlePrismaError fonksiyonunu çağırır
   * 2. Prisma hataları ve diğer hatalar işlenir
   * 3. Uygun exception fırlatılır
   * 
   * NOT: Bu fonksiyon, handlePrismaError'ı çağırır.
   * Gelecekte farklı hata tipleri eklenebilir (örneğin: external API hataları).
   */
  static handleError(
    error: unknown,
    logger: Logger,
    context: string,
    defaultMessage: string,
  ): never {
    /**
     * handlePrismaError Fonksiyonunu Çağır
     * 
     * this.handlePrismaError: Aynı sınıftaki handlePrismaError fonksiyonunu çağırır
     *   Bu fonksiyon, Prisma hatalarını ve diğer hataları işler
     */
    return this.handlePrismaError(error, logger, context, defaultMessage);
  }
}

