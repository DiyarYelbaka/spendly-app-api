// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
// Her bir decorator (süsleyici) farklı bir doğrulama kuralı uygular
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsInt,
  Min,
  Max,
} from 'class-validator';

/**
 * CategoryType Enum (Sabit Değerler Listesi)
 * 
 * Enum, bir değişkenin alabileceği sabit değerleri tanımlar.
 * Bu enum, kategorinin gelir mi gider mi olduğunu belirtir.
 * 
 * INCOME = 'income': Gelir kategorisi (örneğin: Maaş, Yatırım)
 * EXPENSE = 'expense': Gider kategorisi (örneğin: Yemek, Ulaşım)
 * 
 * Enum kullanmanın faydası: Yazım hatalarını önler ve kod daha okunabilir olur.
 */
export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/**
 * CreateCategoryDto Sınıfı
 * 
 * Bu sınıf, yeni bir kategori oluştururken gönderilmesi gereken verileri tanımlar.
 * DTO (Data Transfer Object): Veri transfer nesnesi - API'ye gelen/giden verilerin yapısını tanımlar.
 * 
 * Bu sınıfın amacı:
 * 1. Gelen verilerin doğru formatta olduğunu kontrol etmek
 * 2. API dokümantasyonunda hangi alanların gerekli olduğunu göstermek
 * 3. Veri tipi hatalarını önlemek
 * 
 * Örnek kullanım:
 * POST /api/categories
 * {
 *   "name": "Yemek",
 *   "type": "expense",
 *   "icon": "🍔",
 *   "color": "#FF5733"
 * }
 */
export class CreateCategoryDto {
  /**
   * name: Kategori adı
   * 
   * Kullanıcının kategoriye vereceği isimdir (örneğin: "Yemek", "Ulaşım", "Maaş").
   * 
   * @ApiProperty: Swagger dokümantasyonunda bu alanın zorunlu olduğunu ve özelliklerini belirtir
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * @MinLength(2): En az 2 karakter olmalıdır (çok kısa isimler anlamsızdır)
   * @MaxLength(20): En fazla 20 karakter olabilir (çok uzun isimler veritabanında sorun yaratabilir)
   * @Matches(...): Sadece belirli karakterlere izin verir:
   *   - Harfler (Türkçe karakterler dahil: ğ, ü, ş, ı, ö, ç)
   *   - Rakamlar (0-9)
   *   - Boşluk
   *   - Tire (-) ve alt çizgi (_)
   * 
   * Özel karakterlere (örneğin: @, #, $) izin verilmez çünkü güvenlik ve tutarlılık için tehlikeli olabilir.
   */
  @ApiProperty({
    example: 'Yemek',
    description: 'Kategori adı (2-20 karakter)',
    minLength: 2,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: 'Kategori adı zorunludur' })
  @MinLength(2, { message: 'Kategori adı en az 2 karakter olmalıdır' })
  @MaxLength(20, { message: 'Kategori adı en fazla 20 karakter olmalıdır' })
  @Matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s\-_]+$/, {
    message: 'Kategori adı sadece harf, rakam, boşluk, tire ve alt çizgi içerebilir',
  })
  name: string;

  /**
   * type: Kategori tipi
   * 
   * Kategorinin gelir (income) mi yoksa gider (expense) mi olduğunu belirtir.
   * 
   * @IsEnum(CategoryType): Bu alan sadece CategoryType enum'undaki değerlerden biri olabilir
   *   - 'income': Gelir kategorisi (para kazandığımız yerler: Maaş, Yatırım)
   *   - 'expense': Gider kategorisi (para harcadığımız yerler: Yemek, Ulaşım)
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * 
   * Bu alan zorunludur çünkü bir kategorinin mutlaka gelir veya gider olması gerekir.
   */
  @ApiProperty({
    example: 'expense',
    description: 'Kategori tipi',
    enum: CategoryType,
  })
  @IsEnum(CategoryType, {
    message: 'Kategori tipi income veya expense olmalıdır',
  })
  @IsNotEmpty({ message: 'Kategori tipi zorunludur' })
  type: CategoryType;

  /**
   * icon: Kategori ikonu
   * 
   * Kategoriyi görsel olarak temsil eden emoji veya simge (örneğin: 🍔, 💰, 🚗).
   * Kullanıcı arayüzünde kategoriyi daha kolay tanımayı sağlar.
   * 
   * @IsOptional(): Bu alan opsiyoneldir, gönderilmesi zorunlu değildir
   * @IsString(): Eğer gönderilirse, string (metin) tipinde olmalıdır
   * @MinLength(1): En az 1 karakter olmalıdır (boş string kabul edilmez)
   * @MaxLength(10): En fazla 10 karakter olabilir (çok uzun emoji kombinasyonları kabul edilmez)
   * 
   * ? işareti: TypeScript'te bu alanın opsiyonel olduğunu belirtir (undefined olabilir)
   */
  @ApiProperty({
    example: '🍔',
    description: 'Kategori ikonu (1-10 karakter, opsiyonel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'İkon en az 1 karakter olmalıdır' })
  @MaxLength(10, { message: 'İkon en fazla 10 karakter olmalıdır' })
  icon?: string;

  /**
   * color: Kategori rengi
   * 
   * Kategoriyi görsel olarak ayırt etmek için kullanılan renk kodu.
   * Hex formatında olmalıdır (örneğin: #FF5733, #00C853).
   * 
   * @IsOptional(): Bu alan opsiyoneldir
   * @IsString(): Eğer gönderilirse, string (metin) tipinde olmalıdır
   * @Matches(...): Sadece belirli formata uyan renk kodlarını kabul eder:
   *   - # işareti ile başlamalı
   *   - Ardından tam 6 karakter (0-9 ve A-F arası)
   *   - Örnek geçerli formatlar: #FF5733, #00C853, #000000
   *   - Örnek geçersiz formatlar: FF5733 (başında # yok), #FF5 (6 karakter değil)
   * 
   * Hex formatı: Web'de renkleri temsil etmek için kullanılan standart formattır.
   */
  @ApiProperty({
    example: '#FF5733',
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
   * description: Kategori açıklaması
   * 
   * Kategori hakkında ek bilgi vermek için kullanılan açıklama metni.
   * Kullanıcı bu kategoriyi ne için kullandığını buraya yazabilir.
   * 
   * @IsOptional(): Bu alan opsiyoneldir
   * @IsString(): Eğer gönderilirse, string (metin) tipinde olmalıdır
   * @MaxLength(500): En fazla 500 karakter olabilir (çok uzun açıklamalar veritabanında yer kaplar)
   * 
   * Örnek: "Yemek ve içecek giderleri", "İşe gidip gelirken kullanılan ulaşım masrafları"
   */
  @ApiProperty({
    example: 'Yemek ve içecek giderleri',
    description: 'Kategori açıklaması (max 500 karakter, opsiyonel)',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Açıklama en fazla 500 karakter olmalıdır' })
  description?: string;

  /**
   * sort_order: Sıralama sırası
   * 
   * Kategorilerin listede hangi sırada görüneceğini belirler.
   * Düşük sayılar önce, yüksek sayılar sonra görünür.
   * 
   * @IsOptional(): Bu alan opsiyoneldir (gönderilmezse varsayılan olarak 0 kullanılır)
   * @IsInt(): Eğer gönderilirse, tam sayı (integer) olmalıdır (ondalıklı sayı kabul edilmez)
   * @Min(0): En az 0 olabilir (negatif sayılar kabul edilmez)
   * @Max(9999): En fazla 9999 olabilir (çok büyük sayılar gereksizdir)
   * 
   * Örnek kullanım:
   * - sort_order: 1 → Listenin en başında görünür
   * - sort_order: 5 → 1, 2, 3, 4'ten sonra görünür
   * - sort_order: 0 → Varsayılan değer, en başta görünür
   */
  @ApiProperty({
    example: 1,
    description: 'Sıralama sırası (0-9999, opsiyonel)',
    required: false,
    minimum: 0,
    maximum: 9999,
  })
  @IsInt({ message: 'Sıralama sırası tam sayı olmalıdır' })
  @IsOptional()
  @Min(0, { message: 'Sıralama sırası en az 0 olmalıdır' })
  @Max(9999, { message: 'Sıralama sırası en fazla 9999 olmalıdır' })
  sort_order?: number;
}

