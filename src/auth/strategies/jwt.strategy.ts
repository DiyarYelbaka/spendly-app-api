// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// UnauthorizedException: Yetkisiz erişim hatası
import { Injectable, UnauthorizedException } from '@nestjs/common';

// Passport: Kimlik doğrulama için kullanılan kütüphane
// PassportStrategy: Passport stratejilerinin temel sınıfı
import { PassportStrategy } from '@nestjs/passport';

// passport-jwt: JWT token doğrulama için kullanılan Passport stratejisi
// ExtractJwt: JWT token'ı HTTP isteğinden çıkarmak için
// Strategy: JWT stratejisinin temel sınıfı
import { ExtractJwt, Strategy } from 'passport-jwt';

// ConfigService: Ortam değişkenlerine (.env) erişmek için
import { ConfigService } from '@nestjs/config';

// PrismaService: Veritabanı işlemlerini yapmak için
import { PrismaService } from '../../core';

/**
 * JwtStrategy Sınıfı
 * 
 * Bu sınıf, JWT token doğrulama stratejisini tanımlar.
 * 
 * Strategy Nedir?
 * Strategy, Passport'un kimlik doğrulama yöntemlerini tanımlayan bir yapıdır.
 * Bu strateji, JWT token'ı doğrular ve kullanıcı bilgisini çıkarır.
 * 
 * @Injectable(): Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
 * extends PassportStrategy(Strategy): Passport'un JWT stratejisini genişletir
 *   Strategy parametresi, passport-jwt'den gelen JWT stratejisidir
 * 
 * İş Akışı:
 * 1. HTTP isteğinden JWT token çıkarılır (Authorization header'dan)
 * 2. Token doğrulanır (imza kontrolü, süre kontrolü)
 * 3. Token'dan kullanıcı ID'si çıkarılır (payload.sub)
 * 4. Kullanıcı veritabanından bulunur
 * 5. Kullanıcı bilgisi request.user'a eklenir
 * 
 * NOT: Eğer middleware (JwtUserMiddleware) zaten kullanıcı bilgisini eklemişse,
 * guard bu stratejiyi atlar (optimizasyon).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, strategy oluşturulduğunda çalışır.
   * JWT token doğrulama ayarlarını yapar.
   * 
   * @param configService: Ortam değişkenlerine erişmek için
   * @param prisma: Veritabanı işlemlerini yapmak için
   * 
   * super(): Üst sınıfın (PassportStrategy) constructor'ını çağırır
   *   Bu constructor'a JWT ayarları gönderilir:
   *   - jwtFromRequest: Token'ın nereden çıkarılacağı
   *   - ignoreExpiration: Token süresinin kontrol edilip edilmeyeceği
   *   - secretOrKey: Token'ı doğrulamak için kullanılan gizli anahtar
   */
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      /**
       * jwtFromRequest: JWT token'ın HTTP isteğinden nasıl çıkarılacağını belirtir
       * 
       * ExtractJwt.fromAuthHeaderAsBearerToken():
       *   Authorization header'ından Bearer token'ı çıkarır
       * 
       * Örnek HTTP isteği:
       * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       * 
       * Bu fonksiyon, "Bearer " kısmını atlar ve sadece token string'ini alır
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      /**
       * ignoreExpiration: Token süresinin kontrol edilip edilmeyeceğini belirtir
       * 
       * false: Token süresini kontrol et (süresi dolmuş token'ları reddet)
       * true: Token süresini kontrol etme (süresi dolmuş token'ları da kabul et)
       * 
       * Güvenlik için false kullanılır - süresi dolmuş token'lar kabul edilmez
       */
      ignoreExpiration: false,
      
      /**
       * secretOrKey: JWT token'ı doğrulamak için kullanılan gizli anahtar
       * 
       * Bu anahtar, token oluşturulurken kullanılan anahtarla aynı olmalıdır.
       * Farklı olursa, token doğrulanamaz.
       * 
       * configService.get<string>('JWT_SECRET'): .env dosyasından JWT_SECRET değerini alır
       * || 'your-super-secret-jwt-key-change-this-in-production': Eğer .env'de yoksa varsayılan değer kullanılır
       * 
       * NOT: Production'da mutlaka .env dosyasında JWT_SECRET tanımlanmalıdır!
       */
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
    });
  }

  /**
   * validate: Token doğrulandıktan sonra çalışan fonksiyon
   * 
   * Bu fonksiyon, JWT token başarıyla doğrulandıktan sonra çalışır.
   * Token'dan çıkarılan bilgileri (payload) kullanarak kullanıcıyı bulur.
   * 
   * @param payload: JWT token'ın payload (içerik) kısmı
   *   - payload.sub: Kullanıcı ID'si (subject - token'ın sahibi)
   *   - payload.email: Kullanıcı email'i (opsiyonel)
   *   - payload.iat: Token oluşturulma zamanı (issued at)
   *   - payload.exp: Token sona erme zamanı (expiration)
   * 
   * @returns Promise<User> - Kullanıcı bilgisi
   *   Bu bilgi, request.user'a eklenir ve controller'larda kullanılabilir
   * 
   * İş Akışı:
   * 1. Token'dan kullanıcı ID'si çıkarılır (payload.sub)
   * 2. Kullanıcı veritabanından bulunur
   * 3. Kullanıcı bulunamazsa 401 hatası fırlatılır
   * 4. Kullanıcı bulunursa, kullanıcı bilgisi döndürülür
   * 
   * NOT: Eğer middleware (JwtUserMiddleware) zaten kullanıcı bilgisini eklemişse,
   * guard bu fonksiyonu çalıştırmaz (optimizasyon).
   */
  async validate(payload: any) {
    /**
     * ADIM 1: Kullanıcıyı Veritabanından Bul
     * 
     * payload.sub: Token'da saklanan kullanıcı ID'si
     *   Token oluşturulurken bu ID token'a eklenir
     * 
     * findUnique: Veritabanında benzersiz bir kaydı bulur
     * where: { id: payload.sub } → Bu ID'ye sahip kullanıcıyı bul
     * 
     * select: Döndürülecek alanları belirtir
     *   Sadece belirtilen alanlar döndürülür (güvenlik ve performans için)
     *   - id: Kullanıcının benzersiz ID'si
     *   - email: Kullanıcı email'i
     *   - name: Kullanıcı adı
     *   - createdAt: Hesap oluşturulma tarihi
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
     * ADIM 2: Kullanıcı Bulunamazsa Hata Fırlat
     * 
     * Eğer token geçerli ama kullanıcı veritabanında yoksa,
     * bu durumda bir sorun var demektir (örneğin: kullanıcı silinmiş).
     * 
     * UnauthorizedException: HTTP 401 durum kodu - Yetkisiz erişim hatası
     * Bu hata, kullanıcıya "Kullanıcı bulunamadı" mesajını gösterir
     */
    if (!user) {
      throw new UnauthorizedException({
        message: 'Kullanıcı bulunamadı',
        messageKey: 'UNAUTHORIZED',
        error: 'UNAUTHORIZED',
      });
    }

    /**
     * ADIM 3: Kullanıcı Bilgisini Döndür
     * 
     * Kullanıcı bulunduysa, kullanıcı bilgisi döndürülür.
     * Bu bilgi, request.user'a eklenir ve controller'larda kullanılabilir.
     * 
     * return: Kullanıcı bilgisi
     *   Bu bilgi, @CurrentUser() decorator'ı ile controller'larda alınabilir
     */
    return user;
  }
}

