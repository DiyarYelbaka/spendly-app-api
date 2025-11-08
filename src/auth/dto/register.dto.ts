// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

/**
 * RegisterDto Sınıfı
 * 
 * Bu sınıf, yeni kullanıcı kaydı (register) için gönderilmesi gereken verileri tanımlar.
 * DTO (Data Transfer Object): Veri transfer nesnesi - API'ye gelen verilerin yapısını tanımlar.
 * 
 * Örnek kullanım:
 * POST /api/auth/register
 * {
 *   "email": "user@example.com",
 *   "password": "Password123!",
 *   "confirmPassword": "Password123!",
 *   "name": "Kullanıcı Adı"
 * }
 */
export class RegisterDto {
  /**
   * email: Kullanıcı email adresi
   * 
   * Kullanıcının giriş yaparken kullanacağı email adresidir.
   * Her kullanıcının benzersiz bir email adresi olmalıdır.
   * 
   * @IsEmail(): Bu alan geçerli bir email formatında olmalıdır
   *   Örnek geçerli: user@example.com
   *   Örnek geçersiz: userexample.com (@ işareti yok)
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * 
   * Email formatı kontrolü: @ işareti, domain adı gibi email kurallarını kontrol eder
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
   * Kullanıcının giriş yaparken kullanacağı şifredir.
   * Güvenlik için güçlü şifre kuralları uygulanır.
   * 
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * @MinLength(6): En az 6 karakter olmalıdır (kısa şifreler güvensizdir)
   * @Matches(...): Şifre kurallarını kontrol eder:
   *   - (?=.*[a-z]): En az 1 küçük harf içermeli (a-z)
   *   - (?=.*[A-Z]): En az 1 büyük harf içermeli (A-Z)
   *   - (?=.*\d): En az 1 rakam içermeli (0-9)
   * 
   * Örnek geçerli şifreler: "Password123", "MyPass1", "Secure123"
   * Örnek geçersiz şifreler: "password" (büyük harf yok), "PASSWORD" (küçük harf yok), "Password" (rakam yok)
   * 
   * NOT: Şifre veritabanına kaydedilmeden önce hash'lenir (bcrypt ile şifrelenir)
   */
  @ApiProperty({
    example: 'Password123!',
    description: 'Kullanıcı şifresi (min 6 karakter, en az 1 küçük harf, 1 büyük harf, 1 rakam)',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre alanı zorunludur' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir',
  })
  password: string;

  /**
   * confirmPassword: Şifre tekrarı
   * 
   * Kullanıcının şifresini doğrulamak için tekrar girmesi gereken alan.
   * Bu alan, kullanıcının şifreyi yanlış yazmasını önler.
   * 
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * 
   * NOT: Bu alanın password ile eşleşip eşleşmediği service katmanında kontrol edilir.
   * DTO seviyesinde sadece format kontrolü yapılır.
   */
  @ApiProperty({
    example: 'Password123!',
    description: 'Şifre tekrarı (password ile eşleşmeli)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Şifre tekrarı alanı zorunludur' })
  confirmPassword: string;

  /**
   * name: Kullanıcı adı
   * 
   * Kullanıcının görünen adıdır. Profilde ve arayüzde gösterilir.
   * 
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * @MinLength(2): En az 2 karakter olmalıdır (çok kısa isimler anlamsızdır)
   * @MaxLength(100): En fazla 100 karakter olabilir (çok uzun isimler veritabanında sorun yaratabilir)
   * @Matches(...): Sadece harfler ve boşluk içerebilir:
   *   - Harfler (Türkçe karakterler dahil: ğ, ü, ş, ı, ö, ç)
   *   - Boşluk
   * 
   * Özel karakterlere (örneğin: @, #, $, rakamlar) izin verilmez çünkü isim alanı için uygun değildir.
   * 
   * Örnek geçerli: "Ahmet Yılmaz", "Mehmet", "Ayşe"
   * Örnek geçersiz: "Ahmet123" (rakam var), "Ahmet@Yılmaz" (özel karakter var)
   */
  @ApiProperty({
    example: 'Kullanıcı Adı',
    description: 'Kullanıcı adı (2-100 karakter, sadece harfler ve boşluk)',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Ad alanı zorunludur' })
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır' })
  @MaxLength(100, { message: 'Ad en fazla 100 karakter olmalıdır' })
  @Matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, {
    message: 'Ad sadece harfler ve boşluk içerebilir',
  })
  name: string;
}

