// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

/**
 * UpdateCategoryDto Sınıfı
 * 
 * Bu sınıf, mevcut bir kategoriyi güncellerken gönderilmesi gereken verileri tanımlar.
 * 
 * ÖNEMLİ FARK: CreateCategoryDto'dan farklı olarak, bu sınıftaki TÜM alanlar opsiyoneldir.
 * Kullanıcı sadece değiştirmek istediği alanları gönderir, diğerleri aynı kalır.
 * 
 * Örnek kullanım:
 * PUT /api/categories/123
 * {
 *   "name": "Yeni İsim",
 *   "color": "#00FF00"
 * }
 * 
 * Bu örnekte sadece name ve color güncellenir, diğer alanlar (icon, description, vb.) değişmez.
 */
export class UpdateCategoryDto {
  /**
   * name: Kategori adı (güncelleme için)
   * 
   * Kategorinin yeni adını belirtir. Gönderilmezse mevcut ad aynı kalır.
   * 
   * @IsOptional(): Bu alan opsiyoneldir (gönderilmesi zorunlu değildir)
   * @IsString(): Eğer gönderilirse, string (metin) tipinde olmalıdır
   * @MinLength(2): En az 2 karakter olmalıdır
   * @MaxLength(20): En fazla 20 karakter olabilir
   * @Matches(...): Sadece harf, rakam, boşluk, tire ve alt çizgi içerebilir
   */
  @ApiProperty({
    example: 'Yeni Kategori Adı',
    description: 'Kategori adı (2-20 karakter, opsiyonel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Kategori adı en az 2 karakter olmalıdır' })
  @MaxLength(20, { message: 'Kategori adı en fazla 20 karakter olmalıdır' })
  @Matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_]+$/, {
    message: 'Kategori adı sadece harf, rakam, boşluk, tire ve alt çizgi içerebilir',
  })
  name?: string;

  /**
   * icon: Kategori ikonu (güncelleme için)
   * 
   * Kategorinin yeni ikonunu belirtir. Gönderilmezse mevcut ikon aynı kalır.
   * 
   * @IsOptional(): Bu alan opsiyoneldir
   * @IsString(): Eğer gönderilirse, string (metin) tipinde olmalıdır
   * @MinLength(1): En az 1 karakter olmalıdır
   * @MaxLength(10): En fazla 10 karakter olabilir
   */
  @ApiProperty({
    example: '🍕',
    description: 'Kategori ikonu (1-10 karakter, opsiyonel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'İkon en az 1 karakter olmalıdır' })
  @MaxLength(10, { message: 'İkon en fazla 10 karakter olmalıdır' })
  icon?: string;

  /**
   * color: Kategori rengi (güncelleme için)
   * 
   * Kategorinin yeni rengini belirtir. Gönderilmezse mevcut renk aynı kalır.
   * 
   * @IsOptional(): Bu alan opsiyoneldir
   * @IsString(): Eğer gönderilirse, string (metin) tipinde olmalıdır
   * @Matches(...): Hex formatında olmalıdır (# ile başlayıp 6 karakter)
   */
  @ApiProperty({
    example: '#00FF00',
    description: 'Kategori rengi (Hex format, opsiyonel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Renk hex formatında olmalıdır (örn: #FF5733)',
  })
  color?: string;

  /**
   * description: Kategori açıklaması (güncelleme için)
   * 
   * Kategorinin yeni açıklamasını belirtir. Gönderilmezse mevcut açıklama aynı kalır.
   * 
   * @IsOptional(): Bu alan opsiyoneldir
   * @IsString(): Eğer gönderilirse, string (metin) tipinde olmalıdır
   * @MaxLength(500): En fazla 500 karakter olabilir
   */
  @ApiProperty({
    example: 'Yeni açıklama',
    description: 'Kategori açıklaması (max 500 karakter, opsiyonel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Açıklama en fazla 500 karakter olmalıdır' })
  description?: string;

  /**
   * sort_order: Sıralama sırası (güncelleme için)
   * 
   * Kategorinin listedeki yeni sıralama pozisyonunu belirtir. Gönderilmezse mevcut sıra aynı kalır.
   * 
   * @IsOptional(): Bu alan opsiyoneldir
   * @IsInt(): Eğer gönderilirse, tam sayı (integer) olmalıdır
   * @Min(0): En az 0 olabilir
   * @Max(9999): En fazla 9999 olabilir
   */
  @ApiProperty({
    example: 2,
    description: 'Sıralama sırası (0-9999, opsiyonel)',
    required: false,
  })
  @IsInt({ message: 'Sıralama sırası tam sayı olmalıdır' })
  @IsOptional()
  @Min(0, { message: 'Sıralama sırası en az 0 olmalıdır' })
  @Max(9999, { message: 'Sıralama sırası en fazla 9999 olmalıdır' })
  sort_order?: number;

  /**
   * is_active: Kategori aktif mi? (güncelleme için)
   * 
   * Kategorinin aktif olup olmadığını belirtir.
   * - true: Kategori aktif, listelerde görünür
   * - false: Kategori pasif, listelerde görünmez (soft delete)
   * 
   * Gönderilmezse mevcut durum aynı kalır.
   * 
   * @IsOptional(): Bu alan opsiyoneldir
   * @IsBoolean(): Eğer gönderilirse, boolean (true/false) olmalıdır
   * 
   * NOT: Bu alan CreateCategoryDto'da yoktur çünkü yeni oluşturulan kategoriler her zaman aktif olur.
   */
  @ApiProperty({
    example: true,
    description: 'Kategori aktif mi? (opsiyonel)',
    required: false,
  })
  @IsBoolean({ message: 'is_active boolean olmalıdır' })
  @IsOptional()
  is_active?: boolean;
}

