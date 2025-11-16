// NestJS: Backend framework'ü
// Controller, Post, Get, UseGuards: HTTP isteklerini yönetmek için kullanılan decorator'lar
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';

// Swagger: API dokümantasyonu için kullanılan decorator'lar
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

// AuthService: Kimlik doğrulama işlemlerini yapan servis sınıfı
import { AuthService } from './auth.service';

// DTO'lar: Gelen verilerin yapısını tanımlayan sınıflar
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleSignInDto } from './dto/google-signin.dto';

// JwtAuthGuard: JWT token kontrolü yapan guard (koruyucu)
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// CurrentUser: Mevcut kullanıcı bilgisini almak için kullanılan decorator
// UserPayload: Kullanıcı bilgilerinin tipi
import { CurrentUser, UserPayload } from '../core';

/**
 * AuthController Sınıfı
 * 
 * Bu sınıf, kimlik doğrulama (authentication) ile ilgili HTTP isteklerini karşılar.
 * Controller'ın görevi:
 * 1. HTTP isteklerini almak (POST, GET)
 * 2. Gelen verileri doğrulamak (DTO ile)
 * 3. İş mantığını service'e yönlendirmek
 * 4. Service'den gelen sonucu HTTP yanıtı olarak döndürmek
 * 
 * @ApiTags('auth'): Swagger dokümantasyonunda bu controller'ı "auth" grubunda gösterir
 * @Controller('auth'): Bu controller'ın URL'i /api/auth olur
 * 
 * NOT: Bu controller'da @UseGuards(JwtAuthGuard) yok çünkü:
 * - register ve login endpoint'leri herkese açık olmalı (token gerektirmez)
 * - Sadece /me endpoint'i token gerektirir (kendi üzerinde @UseGuards var)
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, controller oluşturulduğunda çalışır.
   * AuthService'i buraya enjekte eder (dependency injection).
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * authService: Kimlik doğrulama işlemlerini yapan servis
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * register: Yeni kullanıcı kaydı endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/auth/register
   * 
   * Bu endpoint, yeni bir kullanıcı hesabı oluşturur.
   * 
   * @Post('register'): Bu fonksiyonun POST /api/auth/register isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen kullanıcı bilgileri (RegisterDto formatında)
   *   - email: Kullanıcı email adresi (zorunlu)
   *   - password: Kullanıcı şifresi (zorunlu, min 6 karakter, büyük/küçük harf ve rakam içermeli)
   *   - confirmPassword: Şifre tekrarı (zorunlu, password ile eşleşmeli)
   *   - name: Kullanıcı adı (zorunlu, 2-100 karakter, sadece harfler ve boşluk)
   * 
   * Dönüş Değeri:
   * - 201 Created: Kullanıcı başarıyla oluşturuldu
   *   {
   *     user: { id, email, name, createdAt },
   *     tokens: { accessToken, refreshToken, expiresAt }
   *   }
   * - 400 Bad Request: Gönderilen veriler geçersiz veya şifreler eşleşmiyor
   * - 409 Conflict: Bu email adresi zaten kullanılıyor
   * 
   * İş Akışı:
   * 1. Email kontrolü yapılır (aynı email'de kullanıcı var mı?)
   * 2. Şifre ve confirmPassword eşleşmesi kontrol edilir
   * 3. Şifre hash'lenir (bcrypt ile şifrelenir)
   * 4. Kullanıcı veritabanına kaydedilir
   * 5. Varsayılan kategoriler oluşturulur
   * 6. JWT token'lar oluşturulur ve döndürülür
   */
  @Post('register')
  @ApiOperation({ summary: 'Yeni kullanıcı kaydı' })
  @ApiResponse({
    status: 201,
    description: 'Kullanıcı başarıyla oluşturuldu',
  })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  @ApiResponse({ status: 409, description: 'Email zaten kullanılıyor' })
  async register(@Body() dto: RegisterDto) {
    // Service'e kullanıcı kaydı isteği gönderilir
    // dto: Kullanıcıdan gelen kayıt bilgileri
    return await this.authService.register(dto);
  }

  /**
   * login: Kullanıcı girişi endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/auth/login
   * 
   * Bu endpoint, mevcut bir kullanıcının giriş yapmasını sağlar.
   * 
   * @Post('login'): Bu fonksiyonun POST /api/auth/login isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen giriş bilgileri (LoginDto formatında)
   *   - email: Kullanıcı email adresi (zorunlu)
   *   - password: Kullanıcı şifresi (zorunlu)
   * 
   * Dönüş Değeri:
   * - 200 OK: Giriş başarılı
   *   {
   *     user: { id, email, name, createdAt },
   *     tokens: { accessToken, refreshToken, expiresAt }
   *   }
   * - 422 Unprocessable Entity: Email veya şifre hatalı
   * 
   * İş Akışı:
   * 1. Email ile kullanıcı bulunur
   * 2. Şifre kontrol edilir (hash'lenmiş şifre ile karşılaştırılır)
   * 3. Şifre doğruysa JWT token'lar oluşturulur ve döndürülür
   * 4. Şifre yanlışsa 422 hatası döndürülür
   */
  @Post('login')
  @ApiOperation({ summary: 'Kullanıcı girişi' })
  @ApiResponse({ status: 200, description: 'Giriş başarılı' })
  @ApiResponse({ status: 422, description: 'Email veya şifre hatalı' })
  async login(@Body() dto: LoginDto) {
    // Service'e giriş isteği gönderilir
    // dto: Kullanıcıdan gelen giriş bilgileri
    return await this.authService.login(dto);
  }

  /**
   * googleSignIn: Google ile giriş endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/auth/google-signin
   * 
   * Bu endpoint, Google Sign-In ile giriş yapmak için kullanılır.
   * Frontend'den gelen Google ID Token doğrulanır ve kullanıcı otomatik olarak
   * kaydedilir veya giriş yapar.
   * 
   * @Post('google-signin'): Bu fonksiyonun POST /api/auth/google-signin isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen Google ID Token (GoogleSignInDto formatında)
   *   - idToken: Google ID Token string'i (zorunlu)
   * 
   * Dönüş Değeri:
   * - 200 OK: Giriş başarılı
   *   {
   *     user: { id, email, name, createdAt },
   *     tokens: { accessToken, refreshToken, expiresAt }
   *   }
   * - 401 Unauthorized: Geçersiz Google token
   * 
   * İş Akışı:
   * 1. Google ID Token doğrulanır (google-auth-library ile)
   * 2. Token'dan kullanıcı bilgileri çıkarılır (email, name, picture)
   * 3. Email ile kullanıcı kontrol edilir
   * 4. Kullanıcı yoksa otomatik kayıt yapılır (şifre olmadan, varsayılan kategoriler ile)
   * 5. Kullanıcı varsa mevcut kullanıcı kullanılır
   * 6. JWT token'lar oluşturulur ve döndürülür
   */
  @Post('google-signin')
  @ApiOperation({ summary: 'Google ile giriş' })
  @ApiResponse({ status: 200, description: 'Google ile giriş başarılı' })
  @ApiResponse({ status: 401, description: 'Geçersiz Google token' })
  async googleSignIn(@Body() dto: GoogleSignInDto) {
    // Service'e Google giriş isteği gönderilir
    // dto: Google ID Token bilgisi
    return await this.authService.googleSignIn(dto);
  }

  /**
   * refresh: Access token yenileme endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/auth/refresh
   * 
   * Bu endpoint, süresi dolmuş access token'ı yenilemek için kullanılır.
   * Refresh token hala geçerliyse, yeni bir access token oluşturulur.
   * 
   * @Post('refresh'): Bu fonksiyonun POST /api/auth/refresh isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen refresh token (RefreshTokenDto formatında)
   *   - refreshToken: Refresh token string'i (zorunlu)
   * 
   * Dönüş Değeri:
   * - 200 OK: Token yenilendi
   *   {
   *     accessToken: "yeni_access_token",
   *     user: { id, email, name, createdAt }
   *   }
   * - 401 Unauthorized: Geçersiz refresh token
   * 
   * İş Akışı:
   * 1. Refresh token doğrulanır (JWT verify)
   * 2. Token'dan kullanıcı ID'si çıkarılır
   * 3. Kullanıcı veritabanından bulunur
   * 4. Yeni access token oluşturulur ve döndürülür
   */
  @Post('refresh')
  @ApiOperation({ summary: 'Access token yenileme' })
  @ApiResponse({ status: 200, description: 'Token yenilendi' })
  @ApiResponse({ status: 401, description: 'Geçersiz refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    // Service'e token yenileme isteği gönderilir
    // dto: Refresh token bilgisi
    return await this.authService.refresh(dto);
  }

  /**
   * logout: Kullanıcı çıkışı endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/auth/logout
   * 
   * Bu endpoint, kullanıcının çıkış yapmasını sağlar.
   * 
   * NOT: Bu uygulamada token'lar veritabanında saklanmaz (stateless JWT),
   * bu yüzden logout işlemi sadece token'ın geçerliliğini kontrol eder.
   * Gerçek bir logout için frontend'de token'ı silmek yeterlidir.
   * 
   * @Post('logout'): Bu fonksiyonun POST /api/auth/logout isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen refresh token (RefreshTokenDto formatında)
   *   - refreshToken: Refresh token string'i (zorunlu)
   * 
   * Dönüş Değeri:
   * - 200 OK: Çıkış başarılı
   *   { message: "Çıkış başarılı" }
   * 
   * İş Akışı:
   * 1. Refresh token doğrulanır (geçersizse bile hata fırlatılmaz)
   * 2. Başarı mesajı döndürülür
   */
  @Post('logout')
  @ApiOperation({ summary: 'Kullanıcı çıkışı' })
  @ApiResponse({ status: 200, description: 'Çıkış başarılı' })
  async logout(@Body() dto: RefreshTokenDto) {
    // Service'e çıkış isteği gönderilir
    // dto: Refresh token bilgisi
    return await this.authService.logout(dto);
  }

  /**
   * getProfile: Mevcut kullanıcı profili endpoint'i
   * 
   * HTTP Metodu: GET
   * URL: /api/auth/me
   * 
   * Bu endpoint, giriş yapmış kullanıcının profil bilgilerini getirir.
   * 
   * @Get('me'): Bu fonksiyonun GET /api/auth/me isteğine yanıt vereceğini belirtir
   * @UseGuards(JwtAuthGuard): Bu endpoint için JWT token kontrolü yapar
   *   Token yoksa veya geçersizse 401 hatası döndürülür
   * @ApiBearerAuth(): Swagger'da bu endpoint'in Bearer token gerektirdiğini belirtir
   * 
   * Parametreler:
   * @CurrentUser() user: JWT token'dan alınan mevcut kullanıcı bilgisi
   *   - user.id: Kullanıcının benzersiz ID'si
   * 
   * Dönüş Değeri:
   * - 200 OK: Profil bilgileri alındı
   *   {
   *     id: string,
   *     email: string,
   *     name: string,
   *     createdAt: Date,
   *     firstName: string,
   *     initials: string,
   *     preferences: {}
   *   }
   * - 401 Unauthorized: Token yok veya geçersiz
   * 
   * İş Akışı:
   * 1. JWT token'dan kullanıcı ID'si alınır (middleware veya guard tarafından)
   * 2. Kullanıcı veritabanından bulunur
   * 3. Kullanıcı bilgileri tek bir obje olarak döndürülür (id, email, name, createdAt, firstName, initials, preferences)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mevcut kullanıcı profili' })
  @ApiResponse({ status: 200, description: 'Profil bilgileri alındı' })
  @ApiResponse({ status: 401, description: 'Yetkisiz erişim' })
  async getProfile(@CurrentUser() user: UserPayload) {
    // Service'e profil bilgisi isteği gönderilir
    // user.id: JWT token'dan alınan kullanıcı ID'si
    return await this.authService.getProfile(user.id);
  }

  /**
   * forgotPassword: Şifremi unuttum endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/auth/forgot-password
   * 
   * Bu endpoint, kullanıcının e-posta adresine şifre sıfırlama kodu gönderir.
   * 
   * @Post('forgot-password'): Bu fonksiyonun POST /api/auth/forgot-password isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen e-posta adresi (ForgotPasswordDto formatında)
   *   - email: Kullanıcı email adresi (zorunlu)
   * 
   * Dönüş Değeri:
   * - 200 OK: Kod gönderildi
   *   {
   *     message: "Doğrulama kodu e-posta adresinize gönderildi",
   *     expiresIn: 15
   *   }
   * - 429 Too Many Requests: Çok fazla istek (rate limiting)
   * 
   * İş Akışı:
   * 1. E-posta adresi kontrol edilir
   * 2. Rate limiting kontrolü yapılır
   * 3. 6 haneli kod oluşturulur
   * 4. Kod veritabanına kaydedilir
   * 5. E-posta gönderilir
   */
  @Post('forgot-password')
  @ApiOperation({ summary: 'Şifremi unuttum - Kod gönderme' })
  @ApiResponse({ status: 200, description: 'Doğrulama kodu gönderildi' })
  @ApiResponse({ status: 429, description: 'Çok fazla istek' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  /**
   * verifyResetCode: Doğrulama kodu kontrolü endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/auth/verify-reset-code
   * 
   * Bu endpoint, kullanıcının girdiği doğrulama kodunu kontrol eder.
   * 
   * @Post('verify-reset-code'): Bu fonksiyonun POST /api/auth/verify-reset-code isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen kod bilgileri (VerifyCodeDto formatında)
   *   - email: Kullanıcı email adresi (zorunlu)
   *   - code: 6 haneli doğrulama kodu (zorunlu)
   * 
   * Dönüş Değeri:
   * - 200 OK: Kod doğrulandı
   *   {
   *     message: "Kod doğrulandı",
   *     token: "reset-token-uuid"
   *   }
   * - 404 Not Found: Geçersiz kod veya süresi dolmuş
   * - 410 Gone: Kod zaten kullanılmış
   * - 429 Too Many Requests: Çok fazla deneme
   * 
   * İş Akışı:
   * 1. Kod kaydı bulunur
   * 2. Kod geçerliliği kontrol edilir (süre, kullanılmış mı?)
   * 3. Deneme sayısı kontrol edilir
   * 4. Kod doğrulanır
   * 5. Geçici reset token oluşturulur
   */
  @Post('verify-reset-code')
  @ApiOperation({ summary: 'Doğrulama kodu kontrolü' })
  @ApiResponse({ status: 200, description: 'Kod doğrulandı' })
  @ApiResponse({ status: 404, description: 'Geçersiz kod veya süresi dolmuş' })
  @ApiResponse({ status: 410, description: 'Kod zaten kullanılmış' })
  @ApiResponse({ status: 429, description: 'Çok fazla deneme' })
  async verifyResetCode(@Body() dto: VerifyCodeDto) {
    return await this.authService.verifyResetCode(dto);
  }

  /**
   * resetPassword: Şifre sıfırlama endpoint'i
   * 
   * HTTP Metodu: POST
   * URL: /api/auth/reset-password
   * 
   * Bu endpoint, kullanıcının şifresini sıfırlar.
   * 
   * @Post('reset-password'): Bu fonksiyonun POST /api/auth/reset-password isteğine yanıt vereceğini belirtir
   * 
   * Parametreler:
   * @Body() dto: Request body'den gelen şifre bilgileri (ResetPasswordDto formatında)
   *   - token: Reset token (zorunlu)
   *   - newPassword: Yeni şifre (zorunlu, min 6 karakter)
   *   - confirmPassword: Şifre tekrarı (zorunlu, newPassword ile eşleşmeli)
   * 
   * Dönüş Değeri:
   * - 200 OK: Şifre güncellendi
   *   {
   *     message: "Şifre başarıyla güncellendi"
   *   }
   * - 400 Bad Request: Şifreler eşleşmiyor
   * - 401 Unauthorized: Geçersiz veya süresi dolmuş token
   * - 410 Gone: Token zaten kullanılmış
   * 
   * İş Akışı:
   * 1. Reset token doğrulanır
   * 2. PasswordReset kaydı bulunur
   * 3. Şifreler eşleşme kontrolü yapılır
   * 4. Yeni şifre hash'lenir
   * 5. Kullanıcı şifresi güncellenir
   * 6. PasswordReset kaydı işaretlenir
   */
  @Post('reset-password')
  @ApiOperation({ summary: 'Şifre sıfırlama' })
  @ApiResponse({ status: 200, description: 'Şifre başarıyla güncellendi' })
  @ApiResponse({ status: 400, description: 'Şifreler eşleşmiyor' })
  @ApiResponse({ status: 401, description: 'Geçersiz veya süresi dolmuş token' })
  @ApiResponse({ status: 410, description: 'Token zaten kullanılmış' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }
}

