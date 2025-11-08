// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * CreateTransactionDto Sınıfı
 * 
 * Bu sınıf, yeni bir işlem (transaction) oluştururken gönderilmesi gereken verileri tanımlar.
 * DTO (Data Transfer Object): Veri transfer nesnesi - API'ye gelen verilerin yapısını tanımlar.
 * 
 * Transaction (İşlem) Nedir?
 * Transaction, kullanıcının gelir veya gider kaydıdır.
 * Örneğin: Maaş almak (gelir), yemek yemek (gider), fatura ödemek (gider)
 * 
 * Örnek kullanım:
 * POST /api/transactions/income
 * {
 *   "amount": 1500.50,
 *   "description": "Ocak maaşı",
 *   "category_id": "uuid-here",
 *   "date": "2025-01-21",
 *   "notes": "Ocak ayı maaşı"
 * }
 */
export class CreateTransactionDto {
  /**
   * amount: İşlem tutarı
   * 
   * İşlemin para miktarını belirtir (örneğin: 1500.50 TL).
   * 
   * @IsNumber(): Bu alan sayı (number) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * @Min(0.01): En az 0.01 olmalıdır (0 veya negatif sayılar kabul edilmez)
   * 
   * Örnek: 1500.50, 100, 25.75
   * Örnek geçersiz: 0, -100, "abc" (string)
   */
  @ApiProperty({
    example: 1500.50,
    description: 'Tutar (pozitif sayı, min: 0.01)',
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Tutar sayı olmalıdır' })
  @IsNotEmpty({ message: 'Tutar zorunludur' })
  @Min(0.01, { message: 'Tutar en az 0.01 olmalıdır' })
  amount: number;

  /**
   * description: İşlem açıklaması
   * 
   * İşlemin ne olduğunu açıklayan metin (örneğin: "Ocak maaşı", "Market alışverişi").
   * 
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * @MinLength(1): En az 1 karakter olmalıdır (boş string kabul edilmez)
   * @MaxLength(500): En fazla 500 karakter olabilir (çok uzun açıklamalar veritabanında yer kaplar)
   * 
   * Örnek: "Ocak maaşı", "Market alışverişi", "Fatura ödemesi"
   */
  @ApiProperty({
    example: 'Maaş',
    description: 'Açıklama (1-500 karakter)',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'Açıklama zorunludur' })
  @MinLength(1, { message: 'Açıklama en az 1 karakter olmalıdır' })
  @MaxLength(500, { message: 'Açıklama en fazla 500 karakter olmalıdır' })
  description: string;

  /**
   * category_id: Kategori ID'si
   * 
   * İşlemin hangi kategoriye ait olduğunu belirten kategori ID'si.
   * 
   * @IsUUID(4): Bu alan UUID v4 formatında olmalıdır
   *   UUID (Universally Unique Identifier): Benzersiz tanımlayıcı
   *   Örnek: "550e8400-e29b-41d4-a716-446655440000"
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * 
   * NOT: Kategori ID'si, daha önce oluşturulmuş bir kategorinin ID'si olmalıdır.
   * Ayrıca, gelir işlemi için income tipinde, gider işlemi için expense tipinde kategori olmalıdır.
   */
  @ApiProperty({
    example: 'uuid',
    description: 'Kategori ID (UUID format)',
  })
  @IsUUID(4, { message: 'Kategori ID geçerli bir UUID olmalıdır' })
  @IsNotEmpty({ message: 'Kategori ID zorunludur' })
  category_id: string;

  /**
   * date: İşlem tarihi
   * 
   * İşlemin hangi tarihte yapıldığını belirtir.
   * 
   * @IsDateString(): Bu alan ISO8601 formatında tarih string'i olmalıdır
   *   ISO8601 formatı: YYYY-MM-DD (örneğin: "2025-01-21")
   * @IsOptional(): Bu alan opsiyoneldir (gönderilmezse bugünün tarihi kullanılır)
   * 
   * Varsayılan: Eğer gönderilmezse, bugünün tarihi kullanılır
   * 
   * Örnek: "2025-01-21", "2025-12-31"
   * Örnek geçersiz: "21-01-2025" (format yanlış), "2025/01/21" (tire yerine slash)
   */
  @ApiProperty({
    example: '2025-01-21',
    description: 'Tarih (ISO8601 format: YYYY-MM-DD, opsiyonel, default: bugün)',
    required: false,
  })
  @IsDateString({}, { message: 'Tarih ISO8601 formatında olmalıdır (YYYY-MM-DD)' })
  @IsOptional()
  date?: string;

  /**
   * notes: İşlem notları
   * 
   * İşlem hakkında ek bilgi vermek için kullanılan notlar (opsiyonel).
   * 
   * @IsString(): Eğer gönderilirse, string (metin) tipinde olmalıdır
   * @IsOptional(): Bu alan opsiyoneldir
   * @MaxLength(1000): En fazla 1000 karakter olabilir (çok uzun notlar veritabanında yer kaplar)
   * 
   * Örnek: "Ocak ayı maaşı", "Market alışverişi - haftalık ihtiyaçlar"
   */
  @ApiProperty({
    example: 'Ocak maaşı',
    description: 'Notlar (max 1000 karakter, opsiyonel)',
    required: false,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Notlar en fazla 1000 karakter olmalıdır' })
  notes?: string;
}

