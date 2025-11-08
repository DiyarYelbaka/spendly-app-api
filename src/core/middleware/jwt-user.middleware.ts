// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// NestMiddleware: Middleware arayüzü (interface)
// Logger: Loglama (kayıt tutma) için
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

// Express: Node.js web framework'ü
// Request, Response, NextFunction: HTTP isteği, yanıtı ve sonraki middleware fonksiyonu
import { Request, Response, NextFunction } from 'express';

// JwtService: JWT token işlemlerini yapan servis
import { JwtService } from '@nestjs/jwt';

// ConfigService: Ortam değişkenlerini (.env dosyasından) okumak için
import { ConfigService } from '@nestjs/config';

// PrismaService: Veritabanı işlemlerini yapan servis
import { PrismaService } from '../prisma/prisma.service';

/**
 * JwtUserMiddleware Sınıfı
 * 
 * Bu sınıf, JWT token'dan kullanıcı bilgisini çıkarıp request'e ekleyen bir middleware'dir.
 * 
 * Middleware Nedir?
 * Middleware, HTTP isteği ile controller arasında çalışan bir ara katmandır.
 * Her HTTP isteğinde çalışır ve isteği işlemeden önce bazı kontroller yapar.
 * 
 * Bu Middleware'in Görevi:
 * 1. HTTP isteğinden JWT token'ı alır (Authorization header'dan)
 * 2. Token'ı doğrular (geçerli mi, süresi dolmuş mu?)
 * 3. Token'dan kullanıcı ID'sini çıkarır
 * 4. Veritabanından kullanıcı bilgilerini getirir
 * 5. Kullanıcı bilgisini request.user'a ekler
 * 
 * ÖNEMLİ: Bu middleware "opsiyonel kimlik doğrulama" yapar.
 * - Token varsa ve geçerliyse → Kullanıcı bilgisi request.user'a eklenir
 * - Token yoksa veya geçersizse → Hata fırlatmaz, sadece request.user undefined kalır
 * - Guard'lar (örneğin: JwtAuthGuard) token gerektiren endpoint'leri korur
 * 
 * @Injectable(): Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
 * implements NestMiddleware: NestJS middleware arayüzünü uygular
 */
@Injectable()
export class JwtUserMiddleware implements NestMiddleware {
  /**
   * logger: Loglama (kayıt tutma) için kullanılan nesne
   * 
   * Logger, middleware'in çalışması sırasında oluşan olayları kaydetmek için kullanılır.
   * Örneğin: Token doğrulama hataları
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * JwtUserMiddleware.name: Logger'ın hangi sınıftan geldiğini belirtir
   */
  private readonly logger = new Logger(JwtUserMiddleware.name);

  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, middleware oluşturulduğunda çalışır.
   * Gerekli servisleri buraya enjekte eder (dependency injection).
   * 
   * @param jwtService: JWT token işlemlerini yapan servis
   *   Token'ı doğrulamak ve decode etmek için kullanılır
   * 
   * @param configService: Ortam değişkenlerini okumak için
   *   JWT_SECRET gibi gizli anahtarları okumak için kullanılır
   * 
   * @param prisma: Veritabanı işlemlerini yapan servis
   *   Kullanıcı bilgilerini veritabanından getirmek için kullanılır
   */
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * use: Middleware'in ana fonksiyonu
   * 
   * Bu fonksiyon, her HTTP isteğinde çalışır.
   * 
   * @param req: Request - HTTP isteği nesnesi
   *   - req.headers: İstek başlıkları (Authorization header burada)
   *   - req.user: Kullanıcı bilgisi (bu middleware tarafından eklenir)
   * 
   * @param res: Response - HTTP yanıtı nesnesi
   *   Bu middleware'de kullanılmaz, ancak gerekirse yanıt gönderebiliriz
   * 
   * @param next: NextFunction - Sonraki middleware veya controller'a geçmek için
   *   Bu fonksiyon çağrılmazsa, istek controller'a ulaşmaz
   * 
   * İş Akışı:
   * 1. Authorization header'dan token alınır
   * 2. Token yoksa → next() çağrılır (kullanıcı olmadan devam eder)
   * 3. Token varsa → Token doğrulanır
   * 4. Token geçerliyse → Kullanıcı bilgisi veritabanından getirilir
   * 5. Kullanıcı bilgisi request.user'a eklenir
   * 6. next() çağrılır (controller'a geçer)
   */
  async use(req: Request, res: Response, next: NextFunction) {
    // try-catch: Hata yakalama bloğu
    // Token doğrulama hatası oluşursa, hata fırlatılmaz (opsiyonel kimlik doğrulama)
    try {
      /**
       * ADIM 1: Authorization Header'dan Token Al
       * 
       * req.headers.authorization: HTTP isteğinin Authorization başlığı
       *   Format: "Bearer <token>"
       *   Örnek: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
       * 
       * Authorization Header Nedir?
       * Authorization header, HTTP isteğinde kimlik doğrulama bilgilerini taşır.
       * JWT token'lar genellikle bu header'da "Bearer <token>" formatında gönderilir.
       */
      const authHeader = req.headers.authorization;
      
      /**
       * ADIM 2: Token Kontrolü
       * 
       * Eğer Authorization header yoksa veya "Bearer " ile başlamıyorsa,
       * token yok demektir. Bu durumda kullanıcı olmadan devam ederiz.
       * 
       * !authHeader: Authorization header yok mu?
       * !authHeader.startsWith('Bearer '): "Bearer " ile başlamıyor mu?
       * 
       * return next(): Sonraki middleware veya controller'a geçer (kullanıcı olmadan)
       */
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Token yok - kullanıcı olmadan devam et
        return next();
      }

      /**
       * ADIM 3: Token'ı Çıkar
       * 
       * substring(7): "Bearer " kelimesini kaldırır (7 karakter)
       *   "Bearer " = 7 karakter (B-e-a-r-e-r- -)
       * 
       * Örnek:
       *   authHeader = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
       *   token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
       */
      const token = authHeader.substring(7); // 'Bearer ' önekini kaldır

      /**
       * ADIM 4: Token'ı Doğrula ve Decode Et
       * 
       * jwtService.verify(): Token'ı doğrular ve içeriğini (payload) döndürür
       *   - Token geçerliyse → Payload döndürülür
       *   - Token geçersizse veya süresi dolmuşsa → Hata fırlatılır (catch bloğuna düşer)
       * 
       * secret: JWT token'ı imzalamak için kullanılan gizli anahtar
       *   - configService.get('JWT_SECRET'): .env dosyasından alınır
       *   - || 'your-super-secret-jwt-key...': Varsayılan değer (güvenlik için değiştirilmeli)
       * 
       * payload: Token içeriği
       *   - payload.sub: Kullanıcı ID'si (subject - JWT standardı)
       *   - payload.email: Kullanıcı email'i (opsiyonel)
       *   - payload.exp: Token'ın sona erme zamanı (expiration)
       */
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
      });

      /**
       * ADIM 5: Kullanıcı Bilgisini Veritabanından Getir
       * 
       * findUnique: Veritabanında benzersiz bir kayıt bulur
       * where: Arama kriteri
       *   - id: payload.sub (token'dan çıkarılan kullanıcı ID'si)
       * 
       * select: Döndürülecek alanları belirtir
       *   - id: Kullanıcı ID'si
       *   - email: Kullanıcı email'i
       *   - name: Kullanıcı adı
       *   - createdAt: Oluşturulma tarihi
       * 
       * NOT: password gibi hassas alanlar select'e dahil edilmez (güvenlik)
       */
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      /**
       * ADIM 6: Kullanıcı Bilgisini Request'e Ekle
       * 
       * Eğer kullanıcı bulunduysa, bilgileri request.user'a ekleriz.
       * Bu sayede controller'larda @CurrentUser() decorator'ı ile kullanıcı bilgisine erişebiliriz.
       * 
       * (req as any).user: TypeScript tip kontrolünü atlamak için
       *   Express'in Request tipinde user alanı yoktur, bu yüzden any'e cast ederiz
       * 
       * req.headers['x-user-id']: Loglama için kullanıcı ID'sini header'a ekler
       *   Bu sayede loglarda hangi kullanıcının isteği yaptığını görebiliriz
       */
      if (user) {
        // Kullanıcı bilgisini request nesnesine ekle
        (req as any).user = user;
        
        // Loglama için kullanıcı ID'sini header'a ekle (opsiyonel)
        req.headers['x-user-id'] = user.id;
      }
    } catch (error) {
      /**
       * Hata Yakalama Bloğu
       * 
       * Eğer token doğrulama hatası oluşursa (örneğin: token geçersiz, süresi dolmuş),
       * hata fırlatılmaz. Bunun yerine:
       * - Hata loglanır (debug seviyesinde)
       * - İstek kullanıcı olmadan devam eder
       * 
       * Neden Hata Fırlatılmıyor?
       * Bu middleware "opsiyonel kimlik doğrulama" yapar.
       * Bazı endpoint'ler token gerektirmez (örneğin: /auth/login).
       * Guard'lar (örneğin: JwtAuthGuard) token gerektiren endpoint'leri korur.
       * 
       * logger.debug(): Debug seviyesinde log yazar (geliştirme sırasında görünür)
       */
      // Token geçersiz veya süresi dolmuş - kullanıcı olmadan devam et
      // Hata fırlatma, guard'lar kimlik doğrulamayı yönetir
      this.logger.debug(`JWT token validation failed: ${error.message}`);
    }

    /**
     * ADIM 7: Sonraki Middleware veya Controller'a Geç
     * 
     * next(): Sonraki middleware veya controller'a geçer
     *   Bu fonksiyon çağrılmazsa, istek controller'a ulaşmaz ve yanıt gönderilmez
     * 
     * NOT: Bu satır her durumda çalışır (try veya catch bloğundan sonra)
     *   Token olsa da olmasa da, istek devam eder
     */
    next();
  }
}

