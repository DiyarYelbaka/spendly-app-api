// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiPropertyOptional } from '@nestjs/swagger';

// class-transformer: Gelen verileri dönüştürmek için kullanılan kütüphane
// Type: Veri tipini dönüştürmek için kullanılan decorator
import { Type } from 'class-transformer';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import { IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * PaginationQueryDto Sınıfı
 * 
 * Bu sınıf, sayfalama (pagination) için kullanılan sorgu parametrelerini tanımlar.
 * 
 * Sayfalama (Pagination) Nedir?
 * Sayfalama, büyük veri listelerini küçük parçalara bölerek göstermek için kullanılan bir tekniktir.
 * Örneğin: 1000 kayıt varsa, her sayfada 20 kayıt gösterilir (50 sayfa).
 * 
 * Bu sınıf, diğer query DTO'larına (örneğin: CategoryQueryDto) extend edilerek kullanılır.
 * 
 * Örnek kullanım:
 * GET /api/categories?page=1&results=20
 * 
 * Bu sınıfın amacı:
 * 1. Sayfa numarası ve sayfa başına kayıt sayısını belirlemek
 * 2. Gelen verilerin doğru formatta olduğunu kontrol etmek
 * 3. API dokümantasyonunda sayfalama parametrelerini göstermek
 */
export class PaginationQueryDto {
  /**
   * page: Sayfa numarası
   * 
   * Hangi sayfanın gösterileceğini belirtir.
   * 
   * @ApiPropertyOptional: Swagger dokümantasyonunda bu alanın opsiyonel olduğunu belirtir
   * @IsOptional(): Bu alanın gönderilmesi zorunlu değildir (gönderilmezse varsayılan değer kullanılır)
   * @Type(() => Number): URL'den gelen string değerini number'a çevirir
   *   Örnek: "1" (string) → 1 (number)
   * @IsInt(): Bu alan tam sayı (integer) olmalıdır (ondalıklı sayı kabul edilmez)
   * @Min(1): En az 1 olabilir (0 veya negatif sayılar kabul edilmez)
   * 
   * = 1: Varsayılan değer 1'dir (gönderilmezse 1 kullanılır)
   * 
   * Örnek: ?page=1 (ilk sayfa), ?page=2 (ikinci sayfa), ?page=5 (beşinci sayfa)
   */
  @ApiPropertyOptional({
    description: 'Sayfa numarası',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Sayfa numarası tam sayı (integer) olmalıdır' })
  @Min(1, { message: 'Sayfa numarası en az 1 olmalıdır' })
  page?: number = 1;

  /**
   * results: Sayfa başına kayıt sayısı
   * 
   * Bir sayfada kaç kayıt gösterileceğini belirtir.
   * React Native AdvancedList bileşeni bu parametreyi kullanır.
   * 
   * @ApiPropertyOptional: Swagger dokümantasyonunda bu alanın opsiyonel olduğunu belirtir
   * @IsOptional(): Bu alanın gönderilmesi zorunlu değildir (gönderilmezse varsayılan değer kullanılır)
   * @Type(() => Number): URL'den gelen string değerini number'a çevirir
   * @IsInt(): Bu alan tam sayı (integer) olmalıdır
   * @Min(1): En az 1 olabilir (0 veya negatif sayılar kabul edilmez)
   * @Max(100): En fazla 100 olabilir (çok büyük sayılar performans sorunlarına yol açabilir)
   * 
   * = 20: Varsayılan değer 20'dir (gönderilmezse 20 kullanılır)
   * 
   * Neden Max 10000?
   * - Çok fazla kayıt getirmek performans sorunlarına yol açabilir
   * - Veritabanı sorguları yavaşlar
   * - Ağ trafiği artar
   * - Frontend'de render etmek zorlaşır
   * 
   * Örnek: ?results=20 (20 kayıt), ?results=50 (50 kayıt), ?results=10000 (10000 kayıt - maksimum)
   */
  @ApiPropertyOptional({
    description: 'Sayfa başına kayıt sayısı',
    example: 20,
    minimum: 1,
    maximum: 10000,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Sayfa başına kayıt sayısı tam sayı (integer) olmalıdır' })
  @Min(1, { message: 'Sayfa başına kayıt sayısı en az 1 olmalıdır' })
  @Max(10000, { message: 'Sayfa başına kayıt sayısı en fazla 10000 olmalıdır' })
  results?: number = 20;
}

