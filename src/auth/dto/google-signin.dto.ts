// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * GoogleSignInDto Sınıfı
 * 
 * Bu sınıf, Google Sign-In için gönderilmesi gereken verileri tanımlar.
 * 
 * Örnek kullanım:
 * POST /api/auth/google-signin
 * {
 *   "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
 * }
 */
export class GoogleSignInDto {
  /**
   * idToken: Google ID Token
   * 
   * Google Sign-In işlemi sonrasında frontend'den alınan ID token'dır.
   * Bu token backend'de doğrulanır ve kullanıcı bilgileri çıkarılır.
   * 
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * 
   * NOT: Token, Google'ın resmi kütüphanesi ile doğrulanır.
   * Token geçersizse veya süresi dolmuşsa hata döndürülür.
   */
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjRmZWI0NGYwZjdhN2UyN2M3YzQwMzM3OWFmZjIwYWY1YzhjZjUyZGMiLCJ0eXAiOiJKV1QifQ...',
    description: 'Google ID Token (frontend\'den alınan)',
  })
  @IsString({ message: 'ID Token string (metin) olmalıdır' })
  @IsNotEmpty({ message: 'ID Token alanı zorunludur' })
  idToken: string;
}

