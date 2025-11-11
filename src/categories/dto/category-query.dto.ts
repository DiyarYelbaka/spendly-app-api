// Swagger: API dokümantasyonu için kullanılan kütüphane
// Bu kütüphane sayesinde API endpoint'lerimiz otomatik olarak dokümante edilir
import { ApiPropertyOptional } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
// Örneğin: Bir alanın string olup olmadığını, enum değerlerinden biri olup olmadığını kontrol eder
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

// class-transformer: Gelen verileri dönüştürmek için kullanılan kütüphane
// Örneğin: String olarak gelen "true" değerini boolean true'ya çevirmek için kullanılır
import { Transform } from 'class-transformer';

// PaginationQueryDto: Sayfalama (pagination) için kullanılan temel sınıf
// Bu sınıf sayfa numarası (page) ve sayfa başına kayıt sayısı (limit) gibi alanları içerir
import { PaginationQueryDto } from '../../core';

// CategoryType: Kategori tipini belirten enum (enumeration - sabit değerler listesi)
// İki değer içerir: 'income' (gelir) ve 'expense' (gider)
import { CategoryType } from './create-category.dto';

/**
 * CategoryQueryDto Sınıfı
 * 
 * Bu sınıf, kategorileri listelemek için kullanılan sorgu parametrelerini tanımlar.
 * 
 * Örnek kullanım:
 * GET /api/categories?type=expense&search=yemek&page=1&limit=20
 * 
 * Bu sınıf PaginationQueryDto'dan türetilmiştir, yani sayfalama özelliklerini de içerir.
 */
export class CategoryQueryDto extends PaginationQueryDto {
  /**
   * type: Kategori tipi filtresi
   * 
   * Kullanıcı sadece gelir (income) veya sadece gider (expense) kategorilerini görmek istediğinde kullanılır.
   * 
   * @ApiPropertyOptional: Swagger dokümantasyonunda bu alanın opsiyonel olduğunu belirtir
   * @IsOptional(): Bu alanın gönderilmesi zorunlu değildir
   * @IsEnum(): Bu alan sadece CategoryType enum'undaki değerlerden biri olabilir
   * 
   * Örnek: ?type=expense (sadece gider kategorilerini getirir)
   */
  @ApiPropertyOptional({
    description: 'Kategori tipi filtresi',
    enum: CategoryType,
    example: 'expense',
  })
  @IsOptional()
  @IsEnum(CategoryType, {
    message: 'Kategori tipi income veya expense olmalıdır',
  })
  type?: CategoryType;

  /**
   * include_defaults: Varsayılan kategorileri dahil etme ayarı
   * 
   * Yeni kullanıcı kaydolduğunda otomatik oluşturulan varsayılan kategorileri
   * (örneğin: Maaş, Yemek, Ulaşım) listelemeye dahil edip etmeyeceğimizi belirler.
   * 
   * @Transform: URL'den gelen string değerini boolean'a çevirir
   * - "false" string'i gelirse → false
   * - Diğer tüm durumlarda → true (varsayılan olarak true)
   * 
   * Örnek: ?include_defaults=false (varsayılan kategorileri gösterme)
   */
  @ApiPropertyOptional({
    description: 'Varsayılan kategorileri dahil et',
    example: true,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value !== 'false')
  @IsBoolean({ message: 'include_defaults boolean olmalıdır' })
  include_defaults?: boolean;

  /**
   * include_stats: İstatistikleri dahil etme ayarı
   * 
   * Her kategori için istatistik bilgilerini (toplam işlem sayısı, toplam tutar)
   * döndürüp döndürmeyeceğimizi belirler.
   * 
   * @Transform: URL'den gelen string değerini boolean'a çevirir
   * - "true" string'i gelirse → true
   * - Diğer tüm durumlarda → false (varsayılan olarak false)
   * 
   * Örnek: ?include_stats=true (her kategori için istatistikleri de getir)
   */
  @ApiPropertyOptional({
    description: 'İstatistikleri dahil et',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean({ message: 'include_stats boolean olmalıdır' })
  include_stats?: boolean;

  /**
   * search: Arama terimi
   * 
   * Kategori adında arama yapmak için kullanılır.
   * Kullanıcı bir kelime yazdığında, o kelimeyi içeren kategorileri bulur.
   * 
   * @IsOptional(): Bu alanın gönderilmesi zorunlu değildir
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * 
   * Örnek: ?search=yemek (adında "yemek" geçen kategorileri getirir)
   */
  @ApiPropertyOptional({
    description: 'Arama terimi (kategori adında ara)',
    example: 'yemek',
  })
  @IsOptional()
  @IsString({ message: 'Arama terimi string (metin) olmalıdır' })
  search?: string;
}

