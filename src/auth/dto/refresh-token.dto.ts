// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * RefreshTokenDto Sınıfı
 * 
 * Bu sınıf, JWT token yenileme (refresh) ve çıkış (logout) işlemleri için gönderilmesi gereken verileri tanımlar.
 * 
 * JWT Token Nedir?
 * JWT (JSON Web Token), kullanıcının kimliğini doğrulamak için kullanılan bir token'dır.
 * İki tür token vardır:
 * - Access Token: Kısa süreli (örneğin: 7 gün), API isteklerinde kullanılır
 * - Refresh Token: Uzun süreli (örneğin: 30 gün), access token'ı yenilemek için kullanılır
 * 
 * Örnek kullanım:
 * POST /api/auth/refresh
 * {
 *   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
export class RefreshTokenDto {
  /**
   * refreshToken: Refresh token string'i
   * 
   * Kullanıcının daha önce aldığı refresh token'ıdır.
   * Bu token ile yeni bir access token alınabilir veya çıkış yapılabilir.
   * 
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * 
   * Token Formatı:
   * JWT token'lar genellikle üç bölümden oluşur:
   * - Header: Token tipi ve algoritma bilgisi
   * - Payload: Kullanıcı bilgileri (id, email, vb.)
   * - Signature: Token'ın doğruluğunu kontrol etmek için imza
   * 
   * Örnek: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
   */
  @ApiProperty({
    example: 'refresh_token_string',
    description: 'Refresh token',
  })
  @IsString({ message: 'Refresh token string (metin) olmalıdır' })
  @IsNotEmpty({ message: 'Refresh token alanı zorunludur' })
  refreshToken: string;
}

