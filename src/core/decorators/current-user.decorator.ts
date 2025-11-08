// NestJS: Backend framework'ü
// createParamDecorator: Parametre decorator'ı oluşturmak için
// ExecutionContext: HTTP isteği bağlamını (context) temsil eder
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// UserPayload: Kullanıcı bilgilerinin tipi
// Bu tip, kullanıcının ID, email, name gibi bilgilerini içerir
import { UserPayload } from '../types/user.types';

/**
 * CurrentUser Decorator (Süsleyici)
 * 
 * Bu decorator, controller fonksiyonlarında mevcut kullanıcı bilgisini almak için kullanılır.
 * 
 * Decorator Nedir?
 * Decorator, bir fonksiyon veya parametreye özel bir özellik ekleyen bir yapıdır.
 * TypeScript ve NestJS'te decorator'lar yaygın olarak kullanılır.
 * 
 * createParamDecorator: NestJS'te parametre decorator'ı oluşturmak için kullanılan fonksiyon
 *   Bu fonksiyon, bir parametreye özel bir değer atamak için kullanılır
 * 
 * Kullanım Örneği:
 * @Get('me')
 * async getProfile(@CurrentUser() user: UserPayload) {
 *   // user.id, user.email, user.name gibi bilgilere erişebiliriz
 *   return this.service.getProfile(user.id);
 * }
 * 
 * İş Akışı:
 * 1. Controller fonksiyonunda @CurrentUser() decorator'ı kullanılır
 * 2. Decorator, HTTP isteğinden request nesnesini alır
 * 3. request.user'dan kullanıcı bilgisini çıkarır
 * 4. Kullanıcı bilgisini fonksiyon parametresine atar
 * 
 * request.user Nereden Gelir?
 * request.user, middleware (JwtUserMiddleware) veya guard (JwtAuthGuard) tarafından eklenir.
 * JWT token doğrulandıktan sonra, kullanıcı bilgisi request.user'a eklenir.
 */
export const CurrentUser = createParamDecorator(
  /**
   * Decorator Fonksiyonu
   * 
   * Bu fonksiyon, decorator kullanıldığında çalışır.
   * 
   * @param data: Decorator'a gönderilen veri (bu örnekte kullanılmıyor)
   * @param ctx: ExecutionContext - HTTP isteği bağlamı
   *   Bu bağlam, request, response gibi bilgileri içerir
   * 
   * @returns UserPayload - Kullanıcı bilgisi
   *   Bu bilgi, controller fonksiyonunun parametresine atanır
   * 
   * İş Akışı:
   * 1. HTTP bağlamından request nesnesini alır
   * 2. request.user'dan kullanıcı bilgisini çıkarır
   * 3. Kullanıcı bilgisini döndürür
   */
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    /**
     * ADIM 1: HTTP İsteğinden Request Nesnesini Al
     * 
     * switchToHttp(): HTTP bağlamına geçer
     *   NestJS'te farklı bağlamlar olabilir (HTTP, WebSocket, gRPC, vb.)
     *   Bu fonksiyon, HTTP bağlamına geçmemizi sağlar
     * 
     * getRequest(): HTTP isteği nesnesini alır
     *   Bu nesne, Express.js'in request nesnesidir
     *   request.user, request.body, request.headers gibi bilgilere erişebiliriz
     */
    const request = ctx.switchToHttp().getRequest();
    
    /**
     * ADIM 2: Kullanıcı Bilgisini Döndür
     * 
     * request.user: Middleware veya guard tarafından eklenen kullanıcı bilgisi
     *   - JWT token doğrulandıktan sonra eklenir
     *   - Kullanıcı ID'si, email, name gibi bilgileri içerir
     *   - Eğer token yoksa veya geçersizse → undefined olur
     * 
     * return: Kullanıcı bilgisi
     *   Bu bilgi, controller fonksiyonunun parametresine atanır
     *   Örneğin: @CurrentUser() user → user değişkenine atanır
     */
    return request.user;
  },
);

