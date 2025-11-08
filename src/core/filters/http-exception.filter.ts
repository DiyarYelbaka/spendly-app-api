// NestJS: Backend framework'ü
// ExceptionFilter: Exception filter arayüzü (interface)
// Catch: Hangi exception'ları yakalayacağını belirten decorator
// ArgumentsHost: HTTP isteği bağlamını (context) temsil eder
// HttpException: HTTP hatalarını temsil eden temel sınıf
// HttpStatus: HTTP durum kodlarını temsil eden enum
// Logger: Loglama (kayıt tutma) için
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

// Express: Node.js web framework'ü
// Request, Response: HTTP isteği ve yanıtı nesneleri
import { Request, Response } from 'express';

// ErrorCode: Hata kodlarını temsil eden enum
import { ErrorCode } from '../exceptions/error-codes.enum';

/**
 * HttpExceptionFilter Sınıfı
 * 
 * Bu sınıf, tüm exception'ları yakalayıp frontend'in beklediği formatta döndüren bir filter'dır.
 * 
 * Exception Filter Nedir?
 * Exception filter, uygulamada oluşan tüm hataları yakalar ve standart formatta döndürür.
 * Bu sayede frontend, tüm hataları aynı formatta alır.
 * 
 * Bu Filter'ın Görevi:
 * 1. Tüm exception'ları yakalar (HttpException, Error, vb.)
 * 2. Exception tipine göre uygun HTTP durum kodunu belirler
 * 3. Hata mesajını ve detaylarını çıkarır
 * 4. Validation hatalarını özel formatta işler
 * 5. Hataları loglar (server error'lar için stack trace ile)
 * 6. Frontend'in beklediği formatta hata yanıtı döndürür
 * 
 * @Catch(): Bu filter'ın tüm exception'ları yakalayacağını belirtir
 *   Boş parametre olduğu için, tüm exception türlerini yakalar
 * 
 * implements ExceptionFilter: NestJS exception filter arayüzünü uygular
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * logger: Loglama (kayıt tutma) için kullanılan nesne
   * 
   * Logger, hataları kaydetmek için kullanılır.
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * HttpExceptionFilter.name: Logger'ın hangi sınıftan geldiğini belirtir
   */
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * catch: Filter'ın ana fonksiyonu
   * 
   * Bu fonksiyon, bir exception oluştuğunda otomatik olarak çalışır.
   * 
   * @param exception: unknown - Oluşan exception (hata)
   *   unknown: Herhangi bir tip olabilir (HttpException, Error, vb.)
   * 
   * @param host: ArgumentsHost - HTTP isteği bağlamı
   *   Bu bağlam, request, response gibi bilgileri içerir
   * 
   * İş Akışı:
   * 1. HTTP bağlamından request ve response alınır
   * 2. Request context bilgileri toplanır (requestId, userId, timestamp)
   * 3. Exception tipine göre işlenir
   * 4. HTTP durum kodu belirlenir
   * 5. Hata mesajı ve detayları çıkarılır
   * 6. Validation hataları özel formatta işlenir
   * 7. Hata loglanır
   * 8. Frontend'in beklediği formatta hata yanıtı döndürülür
   */
  catch(exception: unknown, host: ArgumentsHost) {
    /**
     * ADIM 1: HTTP Bağlamından Request ve Response Al
     * 
     * switchToHttp(): HTTP bağlamına geçer
     *   NestJS'te farklı bağlamlar olabilir (HTTP, WebSocket, gRPC, vb.)
     *   Bu fonksiyon, HTTP bağlamına geçmemizi sağlar
     * 
     * getResponse(): HTTP yanıtı nesnesini alır
     *   Bu nesne, hata yanıtını göndermek için kullanılır
     * 
     * getRequest(): HTTP isteği nesnesini alır
     *   Bu nesne, istek bilgilerini (URL, method, headers, vb.) içerir
     */
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    /**
     * ADIM 2: Request Context Bilgilerini Topla
     * 
     * requestId: İsteği takip etmek için benzersiz ID
     *   - request.headers['x-request-id']: Eğer header'da varsa kullanılır
     *   - || this.generateRequestId(): Yoksa yeni bir ID oluşturulur
     * 
     * userId: İsteği yapan kullanıcının ID'si
     *   - (request as any).user?.id: Middleware tarafından eklenen kullanıcı bilgisi
     *   - || 'anonymous': Kullanıcı yoksa "anonymous" kullanılır
     * 
     * timestamp: Hatanın oluştuğu zaman
     *   - new Date().toISOString(): Şu anki zaman (ISO8601 formatında)
     */
    const requestId = request.headers['x-request-id'] || this.generateRequestId();
    const userId = (request as any).user?.id || 'anonymous';
    const timestamp = new Date().toISOString();

    /**
     * ADIM 3: Varsayılan Hata Değerlerini Ayarla
     * 
     * Bu değerler, exception tipine göre güncellenir.
     * Eğer exception tanınmazsa, bu varsayılan değerler kullanılır.
     * 
     * status: HTTP durum kodu (varsayılan: 500 - Internal Server Error)
     * message: Hata mesajı (varsayılan: "Internal server error")
     * messageKey: Mesaj anahtarı (varsayılan: SERVER_ERROR)
     * error: Hata kodu (varsayılan: SERVER_ERROR)
     * fields: Alan bazlı hatalar (varsayılan: null)
     */
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let messageKey = ErrorCode.SERVER_ERROR;
    let error = ErrorCode.SERVER_ERROR;
    let fields: any = null;

    /**
     * ADIM 4: Exception Tipine Göre İşle
     * 
     * Farklı exception tipleri farklı şekilde işlenir.
     */
    
    /**
     * ADIM 4.1: HttpException İşle (NestJS Exception'ları)
     * 
     * HttpException, NestJS'in standart exception sınıfıdır.
     * Tüm NestJS exception'ları (NotFoundException, BadRequestException, vb.) bu sınıftan türer.
     */
    if (exception instanceof HttpException) {
      /**
       * HTTP Durum Kodunu Al
       * 
       * getStatus(): Exception'dan HTTP durum kodunu alır
       *   Örnek: NotFoundException → 404, BadRequestException → 400
       */
      status = exception.getStatus();
      
      /**
       * Exception Response'unu Al
       * 
       * getResponse(): Exception'dan yanıt nesnesini veya string'ini alır
       *   - Object olabilir: { message: "...", message_key: "...", ... }
       *   - String olabilir: "Hata mesajı"
       */
      const exceptionResponse = exception.getResponse();

      /**
       * ADIM 4.1.1: Object Response İşle
       * 
       * Eğer exception response bir nesne ise, içindeki bilgileri çıkarırız.
       */
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        
        /**
         * Hata Bilgilerini Çıkar
         * 
         * message: Hata mesajı
         *   - responseObj.message: Özel mesaj varsa kullanılır
         *   - || exception.message: Yoksa exception'ın kendi mesajı kullanılır
         * 
         * messageKey: Mesaj anahtarı
         *   - responseObj.message_key veya responseObj.messageKey: Özel anahtar varsa kullanılır
         *   - || this.getErrorCode(status): Yoksa HTTP durum koduna göre belirlenir
         * 
         * error: Hata kodu
         *   - responseObj.error: Özel kod varsa kullanılır
         *   - || this.getErrorCode(status): Yoksa HTTP durum koduna göre belirlenir
         * 
         * fields: Alan bazlı hatalar
         *   - responseObj.fields: Varsa kullanılır
         *   - || null: Yoksa null
         */
        message = responseObj.message || exception.message;
        messageKey = responseObj.message_key || responseObj.messageKey || this.getErrorCode(status);
        error = responseObj.error || this.getErrorCode(status);
        fields = responseObj.fields || null;
      } 
      /**
       * ADIM 4.1.2: String Response İşle
       * 
       * Eğer exception response bir string ise, sadece mesaj olarak kullanılır.
       */
      else {
        message = exceptionResponse as string;
        messageKey = this.getErrorCode(status);
        error = this.getErrorCode(status);
      }

      /**
       * ADIM 4.1.3: Validation Hatalarını Özel Formatta İşle
       * 
       * class-validator kütüphanesi, validation hatalarını özel bir formatta döndürür.
       * Bu formatı, frontend'in beklediği formata çeviririz.
       * 
       * Validation Hataları Formatı (class-validator):
       * {
       *   message: [
       *     { property: "email", constraints: { isEmail: "Email geçerli olmalıdır" } },
       *     { property: "password", constraints: { minLength: "Şifre en az 8 karakter olmalıdır" } }
       *   ]
       * }
       * 
       * Frontend'in Beklediği Format:
       * {
       *   fields: {
       *     email: [{ message: "Email geçerli olmalıdır", value: "...", location: "body" }],
       *     password: [{ message: "Şifre en az 8 karakter olmalıdır", value: "...", location: "body" }]
       *   }
       * }
       */
      if (status === HttpStatus.BAD_REQUEST && Array.isArray((exceptionResponse as any)?.message)) {
        const validationErrors = (exceptionResponse as any).message;
        fields = {};
        
        /**
         * Her Validation Hatasını İşle
         * 
         * forEach: Dizideki her eleman için fonksiyon çalıştırır
         * 
         * error.property: Hangi alanda hata var? (örneğin: "email", "password")
         * error.constraints: O alandaki hata mesajları (örneğin: { isEmail: "..." })
         * error.value: Gönderilen değer (örneğin: "invalid-email")
         */
        validationErrors.forEach((error: any) => {
          if (error.property) {
            /**
             * Alan Bazlı Hataları Oluştur
             * 
             * Object.values(error.constraints): Tüm hata mesajlarını alır
             *   Örnek: { isEmail: "Email geçerli olmalıdır", isNotEmpty: "Email zorunludur" }
             *   → ["Email geçerli olmalıdır", "Email zorunludur"]
             * 
             * map(): Her mesajı bir nesneye çevirir
             *   - message: Hata mesajı
             *   - value: Gönderilen değer
             *   - location: Hatanın nerede olduğu (body, query, param)
             */
            fields[error.property] = Object.values(error.constraints || {}).map(
              (constraint: string) => ({
                message: constraint,
                value: error.value,
                location: 'body',
              }),
            );
          }
        });
        
        /**
         * Validation Hataları İçin Özel Mesajlar
         */
        messageKey = ErrorCode.VALIDATION_ERROR;
        error = ErrorCode.VALIDATION_ERROR;
        message = 'Doğrulama hatası';
      }
    } 
    /**
     * ADIM 4.2: Generic Error İşle
     * 
     * Eğer exception HttpException değilse, genel Error olarak işlenir.
     * Bu durumda, sadece hata mesajı alınır.
     */
    else if (exception instanceof Error) {
      message = exception.message;
      messageKey = ErrorCode.SERVER_ERROR;
      error = ErrorCode.SERVER_ERROR;
    }

    /**
     * ADIM 5: Hata Bilgilerini Logla
     * 
     * Loglama, hataları takip etmek ve debug etmek için önemlidir.
     * 
     * logContext: Log için kullanılacak bağlam bilgileri
     *   Bu bilgiler, hatanın ne zaman, kim tarafından, hangi endpoint'te oluştuğunu gösterir
     */
    const logContext = {
      requestId,
      userId,
      method: request.method,
      url: request.url,
      status,
      message,
      timestamp,
    };

    /**
     * ADIM 5.1: Server Error'ları Logla (500+)
     * 
     * Server error'lar (500, 502, 503, vb.) kritik hatalardır.
     * Bu hatalar için stack trace (hata yığını) loglanır.
     * 
     * logger.error(): Hata seviyesinde log yazar
     *   - İlk parametre: Log mesajı
     *   - İkinci parametre: Stack trace (hata yığını)
     *   - Üçüncü parametre: Bağlam bilgileri (JSON formatında)
     */
    if (status >= 500) {
      // Server error'lar - stack trace ile logla
      this.logger.error(
        `[${requestId}] ${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        JSON.stringify(logContext),
      );
    } 
    /**
     * ADIM 5.2: Client Error'ları Logla (400-499)
     * 
     * Client error'lar (400, 401, 404, vb.) kullanıcı hatalarıdır.
     * Bu hatalar için stack trace loglanmaz (gerekli değil).
     * 
     * logger.warn(): Uyarı seviyesinde log yazar
     */
    else {
      // Client error'lar - stack trace olmadan logla
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} - ${status} - ${message}`,
        JSON.stringify(logContext),
      );
    }

    /**
     * ADIM 6: Frontend'in Beklediği Formatta Hata Yanıtı Oluştur
     * 
     * Frontend, tüm hataları aynı formatta bekler.
     * Bu format, frontend'in hataları göstermesini ve işlemesini kolaylaştırır.
     */
    const errorResponse = {
      success: false,
      message_key: messageKey,
      error: error,
      message: message,
      /**
       * Spread Operator (...) Kullanımı
       * 
       * ...(fields && { fields }): Eğer fields varsa, fields alanını ekle
       */
      ...(fields && { fields }),
      /**
       * Summary Oluştur
       * 
       * Eğer fields varsa, kaç alanda hata olduğunu belirten özet mesaj oluştur.
       */
      ...(fields && {
        summary: `${Object.keys(fields).length} alanda hata bulundu`,
      }),
      /**
       * Development Mode'da Ekstra Bilgi
       * 
       * Development mode'da (NODE_ENV === 'development'), ekstra bilgiler eklenir.
       * Bu bilgiler, geliştirme sırasında hataları debug etmeyi kolaylaştırır.
       * 
       * Production'da bu bilgiler eklenmez (güvenlik için).
       */
      ...(process.env.NODE_ENV === 'development' && {
        requestId,
        timestamp,
        path: request.url,
      }),
    };

    /**
     * ADIM 7: Hata Yanıtını Gönder
     * 
     * response.status(): HTTP durum kodunu ayarlar
     * response.json(): JSON formatında yanıt gönderir
     * 
     * Bu noktadan sonra, frontend hata yanıtını alır ve işler.
     */
    response.status(status).json(errorResponse);
  }

  /**
   * getErrorCode: HTTP durum kodunu hata koduna çeviren özel fonksiyon
   * 
   * Bu fonksiyon, HTTP durum koduna göre uygun hata kodunu döndürür.
   * 
   * @param status: number - HTTP durum kodu
   *   Örnek: 400, 401, 404, 500
   * 
   * @returns ErrorCode - Hata kodu
   *   Örnek: VALIDATION_ERROR, UNAUTHORIZED, NOT_FOUND
   * 
   * private: Bu fonksiyon sadece bu sınıf içinde kullanılabilir
   * 
   * İş Akışı:
   * 1. HTTP durum koduna göre hata kodu belirlenir
   * 2. Eğer durum kodu tanınmazsa, SERVER_ERROR döndürülür
   */
  private getErrorCode(status: number): ErrorCode {
    /**
     * HTTP Durum Kodları → Hata Kodları Mapping
     * 
     * errorCodes: HTTP durum kodlarını hata kodlarına çeviren harita (map)
     *   - Key: HTTP durum kodu (örneğin: 400, 404)
     *   - Value: Hata kodu (örneğin: VALIDATION_ERROR, NOT_FOUND)
     * 
     * HttpStatus: NestJS'in HTTP durum kodları enum'u
     *   - BAD_REQUEST (400): Geçersiz istek → VALIDATION_ERROR
     *   - UNAUTHORIZED (401): Yetkisiz erişim → UNAUTHORIZED
     *   - FORBIDDEN (403): Yasak erişim → INSUFFICIENT_PERMISSIONS
     *   - NOT_FOUND (404): Bulunamadı → NOT_FOUND
     *   - CONFLICT (409): Çakışma → CONFLICT
     *   - UNPROCESSABLE_ENTITY (422): İşlenemiyor → VALIDATION_ERROR
     *   - INTERNAL_SERVER_ERROR (500): Sunucu hatası → SERVER_ERROR
     */
    const errorCodes: Record<number, ErrorCode> = {
      [HttpStatus.BAD_REQUEST]: ErrorCode.VALIDATION_ERROR,
      [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
      [HttpStatus.FORBIDDEN]: ErrorCode.INSUFFICIENT_PERMISSIONS,
      [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
      [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
      [HttpStatus.UNPROCESSABLE_ENTITY]: ErrorCode.VALIDATION_ERROR,
      [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.SERVER_ERROR,
    };

    /**
     * Hata Kodunu Döndür
     * 
     * errorCodes[status]: Durum koduna göre hata kodu
     * || ErrorCode.SERVER_ERROR: Eğer durum kodu tanınmazsa, varsayılan olarak SERVER_ERROR
     */
    return errorCodes[status] || ErrorCode.SERVER_ERROR;
  }

  /**
   * generateRequestId: Benzersiz istek ID'si oluşturan özel fonksiyon
   * 
   * Bu fonksiyon, her istek için benzersiz bir ID oluşturur.
   * Bu ID, loglarda ve hata takibinde kullanılır.
   * 
   * @returns string - Benzersiz istek ID'si
   *   Örnek: "req-1705834800000-k3j9x2m1p"
   * 
   * private: Bu fonksiyon sadece bu sınıf içinde kullanılabilir
   * 
   * ID Formatı:
   * - "req-": Önek (request'in kısaltması)
   * - Date.now(): Şu anki zaman (milisaniye cinsinden)
   * - Math.random().toString(36).substr(2, 9): Rastgele string (9 karakter)
   * 
   * Neden Benzersiz?
   * - Her istek için farklı ID → İstekleri ayırt edebiliriz
   * - Loglarda takip edilebilir → Hangi istekte hata oluştu?
   * - Debug etmeyi kolaylaştırır
   */
  private generateRequestId(): string {
    /**
     * Benzersiz ID Oluştur
     * 
     * Date.now(): Şu anki zaman (milisaniye cinsinden)
     *   Örnek: 1705834800000
     * 
     * Math.random(): 0 ile 1 arasında rastgele sayı
     *   Örnek: 0.123456789
     * 
     * .toString(36): Sayıyı 36 tabanında string'e çevirir
     *   36 tabanı: 0-9 ve a-z karakterlerini kullanır
     *   Örnek: 0.123456789 → "0.abc123def"
     * 
     * .substr(2, 9): 2. karakterden itibaren 9 karakter alır
     *   "0." kısmını atlar, sadece rastgele karakterleri alır
     *   Örnek: "0.abc123def" → "abc123def"
     * 
     * Sonuç: "req-1705834800000-abc123def"
     */
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

