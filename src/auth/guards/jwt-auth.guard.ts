// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// ExecutionContext: HTTP isteği bağlamını (context) temsil eder
import { Injectable, ExecutionContext } from '@nestjs/common';

// Passport: Kimlik doğrulama için kullanılan kütüphane
// AuthGuard: Passport guard'larının temel sınıfı
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard Sınıfı
 * 
 * Bu sınıf, JWT token kontrolü yapan bir guard (koruyucu) görevi görür.
 * 
 * Guard Nedir?
 * Guard, endpoint'lere erişimi kontrol eden bir mekanizmadır.
 * Bir endpoint'e istek geldiğinde, guard önce çalışır ve:
 * - Token geçerliyse → İsteğe izin verir
 * - Token yoksa veya geçersizse → 401 Unauthorized hatası döndürür
 * 
 * @Injectable(): Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
 * extends AuthGuard('jwt'): Passport'un JWT stratejisini kullanır
 *   'jwt' parametresi, JwtStrategy'yi işaret eder
 * 
 * Optimizasyon:
 * Bu guard, middleware'den gelen kullanıcı bilgisini kontrol eder.
 * Eğer middleware zaten kullanıcı bilgisini eklemişse (request.user varsa),
 * Passport doğrulamasını atlar. Bu sayede:
 * - Gereksiz token doğrulaması yapılmaz
 * - Gereksiz veritabanı sorgusu yapılmaz
 * - Performans artar
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * canActivate: Endpoint'e erişime izin verilip verilmeyeceğini kontrol eden fonksiyon
   * 
   * Bu fonksiyon, bir endpoint'e istek geldiğinde çalışır.
   * 
   * @param context: ExecutionContext - HTTP isteği bağlamı
   *   Bu bağlam, request, response gibi bilgileri içerir
   * 
   * @returns boolean | Promise<boolean>
   *   - true: İsteğe izin verilir, endpoint çalışır
   *   - false: İsteğe izin verilmez, 401 hatası döndürülür
   * 
   * İş Akışı:
   * 1. HTTP isteğinden request nesnesini alır
   * 2. request.user kontrolü yapar (middleware tarafından eklenmiş olabilir)
   * 3. Eğer kullanıcı bilgisi varsa → true döndürür (optimizasyon)
   * 4. Eğer kullanıcı bilgisi yoksa → Passport JWT Strategy'yi çalıştırır
   */
  canActivate(context: ExecutionContext) {
    // HTTP isteğinden request nesnesini alır
    // switchToHttp(): HTTP bağlamına geçer (WebSocket, gRPC gibi diğer bağlamlar da olabilir)
    const request = context.switchToHttp().getRequest();
    
    /**
     * Optimizasyon Kontrolü
     * 
     * Eğer middleware (JwtUserMiddleware) zaten kullanıcı bilgisini eklemişse,
     * Passport doğrulamasını atlar.
     * 
     * request.user: Middleware tarafından eklenen kullanıcı bilgisi
     *   - Eğer token geçerliyse ve middleware çalıştıysa → user bilgisi var
     *   - Eğer token yoksa veya middleware çalışmadıysa → user undefined
     * 
     * Bu kontrol sayesinde:
     * - Gereksiz token doğrulaması yapılmaz (zaten middleware yaptı)
     * - Gereksiz veritabanı sorgusu yapılmaz (zaten middleware yaptı)
     * - Performans artar
     */
    if (request.user) {
      // Kullanıcı bilgisi varsa, endpoint'e erişime izin ver
      return true;
    }

    /**
     * Passport JWT Strategy Kullan
     * 
     * Eğer middleware kullanıcı bilgisini eklememişse,
     * Passport'un JWT Strategy'sini çalıştırır.
     * 
     * super.canActivate(context): Üst sınıftaki (AuthGuard) canActivate fonksiyonunu çağırır
     *   Bu fonksiyon, JwtStrategy'yi çalıştırır ve token'ı doğrular
     *   Token geçerliyse → true döndürür
     *   Token geçersizse → 401 hatası fırlatır
     */
    return super.canActivate(context);
  }
}

