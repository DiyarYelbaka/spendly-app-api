// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiPropertyOptional } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import { IsOptional, IsString, IsEnum, IsUUID, IsDateString } from 'class-validator';

// PaginationQueryDto: Sayfalama (pagination) için kullanılan temel sınıf
import { PaginationQueryDto } from '../../core';

/**
 * TransactionType Enum (Sabit Değerler Listesi)
 * 
 * Enum, bir değişkenin alabileceği sabit değerleri tanımlar.
 * Bu enum, işlemin gelir mi gider mi olduğunu belirtir.
 * 
 * INCOME = 'income': Gelir işlemi (para kazandığımız işlemler: Maaş, Yatırım)
 * EXPENSE = 'expense': Gider işlemi (para harcadığımız işlemler: Yemek, Fatura)
 * 
 * Enum kullanmanın faydası: Yazım hatalarını önler ve kod daha okunabilir olur.
 */
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/**
 * TransactionQueryDto Sınıfı
 * 
 * Bu sınıf, işlemleri (transactions) listelemek için kullanılan sorgu parametrelerini tanımlar.
 * 
 * Örnek kullanım:
 * GET /api/transactions?type=expense&start_date=2025-01-01&end_date=2025-01-31&page=1&limit=20
 * 
 * Bu sınıf PaginationQueryDto'dan türetilmiştir, yani sayfalama özelliklerini de içerir.
 */
export class TransactionQueryDto extends PaginationQueryDto {
  /**
   * type: İşlem tipi filtresi
   * 
   * Kullanıcı sadece gelir (income) veya sadece gider (expense) işlemlerini görmek istediğinde kullanılır.
   * 
   * @IsOptional(): Bu alanın gönderilmesi zorunlu değildir
   * @IsEnum(): Bu alan sadece TransactionType enum'undaki değerlerden biri olabilir
   *   - 'income': Sadece gelir işlemlerini getirir
   *   - 'expense': Sadece gider işlemlerini getirir
   * 
   * Örnek: ?type=expense (sadece gider işlemlerini getirir)
   */
  @ApiPropertyOptional({
    description: 'İşlem tipi filtresi',
    enum: TransactionType,
    example: 'expense',
  })
  @IsOptional()
  @IsEnum(TransactionType, {
    message: 'İşlem tipi income veya expense olmalıdır',
  })
  type?: TransactionType;

  /**
   * category_id: Kategori ID filtresi
   * 
   * Belirli bir kategoriye ait işlemleri görmek için kullanılır.
   * 
   * @IsOptional(): Bu alanın gönderilmesi zorunlu değildir
   * @IsUUID(4): Eğer gönderilirse, UUID v4 formatında olmalıdır
   * 
   * Örnek: ?category_id=550e8400-e29b-41d4-a716-446655440000 (sadece bu kategoriye ait işlemleri getirir)
   */
  @ApiPropertyOptional({
    description: 'Kategori ID filtresi',
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Kategori ID geçerli bir UUID olmalıdır' })
  category_id?: string;

  /**
   * start_date: Başlangıç tarihi filtresi
   * 
   * Belirli bir tarihten sonraki işlemleri görmek için kullanılır.
   * 
   * @IsOptional(): Bu alanın gönderilmesi zorunlu değildir
   * @IsDateString(): Eğer gönderilirse, ISO8601 formatında olmalıdır (YYYY-MM-DD)
   * 
   * Örnek: ?start_date=2025-01-01 (1 Ocak 2025'ten sonraki işlemleri getirir)
   * 
   * NOT: start_date ve end_date birlikte kullanılarak tarih aralığı filtresi yapılabilir.
   */
  @ApiPropertyOptional({
    description: 'Başlangıç tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Başlangıç tarihi ISO8601 formatında olmalıdır' })
  start_date?: string;

  /**
   * end_date: Bitiş tarihi filtresi
   * 
   * Belirli bir tarihten önceki işlemleri görmek için kullanılır.
   * 
   * @IsOptional(): Bu alanın gönderilmesi zorunlu değildir
   * @IsDateString(): Eğer gönderilirse, ISO8601 formatında olmalıdır (YYYY-MM-DD)
   * 
   * Örnek: ?end_date=2025-01-31 (31 Ocak 2025'ten önceki işlemleri getirir)
   * 
   * NOT: start_date ve end_date birlikte kullanılarak tarih aralığı filtresi yapılabilir.
   * Örnek: ?start_date=2025-01-01&end_date=2025-01-31 (Ocak ayındaki tüm işlemleri getirir)
   */
  @ApiPropertyOptional({
    description: 'Bitiş tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Bitiş tarihi ISO8601 formatında olmalıdır' })
  end_date?: string;

  /**
   * search: Arama terimi
   * 
   * İşlem açıklamasında (description) arama yapmak için kullanılır.
   * Kullanıcı bir kelime yazdığında, o kelimeyi içeren işlemleri bulur.
   * 
   * @IsOptional(): Bu alanın gönderilmesi zorunlu değildir
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * 
   * Örnek: ?search=maaş (açıklamasında "maaş" geçen işlemleri getirir)
   */
  @ApiPropertyOptional({
    description: 'Arama terimi (açıklamada ara)',
    example: 'maaş',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

