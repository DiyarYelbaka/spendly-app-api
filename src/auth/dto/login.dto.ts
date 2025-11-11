// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

/**
 * LoginDto Sınıfı
 * 
 * Bu sınıf, kullanıcı girişi (login) için gönderilmesi gereken verileri tanımlar.
 * 
 * Örnek kullanım:
 * POST /api/auth/login
 * {
 *   "email": "user@example.com",
 *   "password": "Password123!"
 * }
 */
export class LoginDto {
  /**
   * email: Kullanıcı email adresi
   * 
   * Giriş yapmak için kullanıcının kayıtlı email adresidir.
   * 
   * @IsEmail(): Bu alan geçerli bir email formatında olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   */
  @ApiProperty({
    example: 'user@example.com',
    description: 'Kullanıcı email adresi',
  })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email alanı zorunludur' })
  email: string;

  /**
   * password: Kullanıcı şifresi
   * 
   * Giriş yapmak için kullanıcının kayıtlı şifresidir.
   * 
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * 
   * NOT: Şifre veritabanında hash'lenmiş (şifrelenmiş) olarak saklanır.
   * Service katmanında, gelen şifre hash'lenmiş şifre ile karşılaştırılır.
   */
  @ApiProperty({
    example: 'Password123!',
    description: 'Kullanıcı şifresi',
  })
  @IsString({ message: 'Şifre string (metin) olmalıdır' })
  @IsNotEmpty({ message: 'Şifre alanı zorunludur' })
  password: string;
}

