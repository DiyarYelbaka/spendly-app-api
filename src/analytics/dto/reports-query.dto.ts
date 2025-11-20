// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import {
  IsDateString,
  IsNotEmpty,
  IsEnum,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// PaginationQueryDto: Sayfalama için kullanılan temel sınıf
import { PaginationQueryDto } from '../../core';

// TransactionType: İşlem tipi enum'u
import { TransactionType } from '../../transactions/dto/transaction-query.dto';

/**
 * ReportPeriod Enum (Sabit Değerler Listesi)
 * 
 * Rapor periyodunu belirtir (saatlik, günlük, haftalık, aylık).
 * Detay seviyesi: hourly > daily > weekly > monthly
 */
export enum ReportPeriod {
  HOURLY = 'hourly',  // Tarih aralığındaki her günün her saati için veri
  DAILY = 'daily',    // Tarih aralığındaki her gün için günlük özet
  WEEKLY = 'weekly',  // Tarih aralığındaki her hafta için haftalık özet
  MONTHLY = 'monthly', // Tarih aralığındaki her ay için aylık özet
}

/**
 * Custom Validator: Tarih Aralığı Kontrolü
 * 
 * start_date <= end_date kontrolü yapar.
 */
function IsValidDateRange(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidDateRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const startDate = obj.start_date;
          const endDate = obj.end_date;

          if (!startDate || !endDate) {
            return true; // Diğer validator'lar kontrol edecek
          }

          return new Date(startDate) <= new Date(endDate);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Başlangıç tarihi bitiş tarihinden büyük olamaz';
        },
      },
    });
  };
}

/**
 * Custom Validator: Tarih Aralığı Max 1 Yıl Kontrolü
 * 
 * Tarih aralığının 1 yıldan uzun olmamasını kontrol eder.
 */
function IsMaxOneYearRange(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isMaxOneYearRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          const startDate = obj.start_date;
          const endDate = obj.end_date;

          if (!startDate || !endDate) {
            return true; // Diğer validator'lar kontrol edecek
          }

          const start = new Date(startDate);
          const end = new Date(endDate);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const maxDays = 365;

          return diffDays <= maxDays;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Tarih aralığı en fazla 1 yıl olabilir';
        },
      },
    });
  };
}


/**
 * ReportsSummaryQueryDto Sınıfı
 * 
 * Özet rapor API'si için sorgu parametrelerini tanımlar.
 * 
 * Örnek kullanım:
 * GET /api/analytics/reports/summary?start_date=2025-01-01&end_date=2025-01-31
 */
export class ReportsSummaryQueryDto {
  /**
   * start_date: Başlangıç tarihi
   * 
   * @IsDateString(): ISO8601 formatında olmalıdır (YYYY-MM-DD)
   * @IsNotEmpty(): Zorunlu alan
   * @IsValidDateRange(): start_date <= end_date kontrolü
   * @IsMaxOneYearRange(): Tarih aralığı max 1 yıl kontrolü
   */
  @ApiProperty({
    description: 'Başlangıç tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString({}, { message: 'Başlangıç tarihi ISO8601 formatında olmalıdır (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Başlangıç tarihi zorunludur' })
  @IsValidDateRange({ message: 'Başlangıç tarihi bitiş tarihinden büyük olamaz' })
  @IsMaxOneYearRange({ message: 'Tarih aralığı en fazla 1 yıl olabilir' })
  start_date: string;

  /**
   * end_date: Bitiş tarihi
   * 
   * @IsDateString(): ISO8601 formatında olmalıdır (YYYY-MM-DD)
   * @IsNotEmpty(): Zorunlu alan
   */
  @ApiProperty({
    description: 'Bitiş tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString({}, { message: 'Bitiş tarihi ISO8601 formatında olmalıdır (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Bitiş tarihi zorunludur' })
  end_date: string;
}

/**
 * ReportsCategoriesQueryDto Sınıfı
 * 
 * Kategori bazlı rapor API'si için sorgu parametrelerini tanımlar.
 * PaginationQueryDto'dan türetilmiştir, sayfalama özelliklerini içerir.
 * 
 * Örnek kullanım:
 * GET /api/analytics/reports/categories?start_date=2025-01-01&end_date=2025-01-31&type=expense&page=1&results=20
 */
export class ReportsCategoriesQueryDto extends PaginationQueryDto {
  /**
   * start_date: Başlangıç tarihi
   */
  @ApiProperty({
    description: 'Başlangıç tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString({}, { message: 'Başlangıç tarihi ISO8601 formatında olmalıdır (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Başlangıç tarihi zorunludur' })
  @IsValidDateRange({ message: 'Başlangıç tarihi bitiş tarihinden büyük olamaz' })
  @IsMaxOneYearRange({ message: 'Tarih aralığı en fazla 1 yıl olabilir' })
  start_date: string;

  /**
   * end_date: Bitiş tarihi
   */
  @ApiProperty({
    description: 'Bitiş tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString({}, { message: 'Bitiş tarihi ISO8601 formatında olmalıdır (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Bitiş tarihi zorunludur' })
  end_date: string;

  /**
   * type: İşlem tipi (gelir veya gider)
   * 
   * @IsEnum(): TransactionType enum'undaki değerlerden biri olmalıdır
   * @IsNotEmpty(): Zorunlu alan
   */
  @ApiProperty({
    description: 'İşlem tipi (income veya expense)',
    enum: TransactionType,
    example: 'expense',
  })
  @IsEnum(TransactionType, {
    message: 'İşlem tipi income veya expense olmalıdır',
  })
  @IsNotEmpty({ message: 'İşlem tipi zorunludur' })
  type: TransactionType;
}

/**
 * ReportsTrendsQueryDto Sınıfı
 * 
 * Trend verileri API'si için sorgu parametrelerini tanımlar.
 * PaginationQueryDto'dan türetilmiştir, sayfalama özelliklerini içerir.
 * 
 * Örnek kullanım:
 * GET /api/analytics/reports/trends?start_date=2025-01-01&end_date=2025-01-31&period=monthly&page=1&results=20
 */
export class ReportsTrendsQueryDto extends PaginationQueryDto {
  /**
   * start_date: Başlangıç tarihi
   */
  @ApiProperty({
    description: 'Başlangıç tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsDateString({}, { message: 'Başlangıç tarihi ISO8601 formatında olmalıdır (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Başlangıç tarihi zorunludur' })
  @IsValidDateRange({ message: 'Başlangıç tarihi bitiş tarihinden büyük olamaz' })
  @IsMaxOneYearRange({ message: 'Tarih aralığı en fazla 1 yıl olabilir' })
  start_date: string;

  /**
   * end_date: Bitiş tarihi
   */
  @ApiProperty({
    description: 'Bitiş tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsDateString({}, { message: 'Bitiş tarihi ISO8601 formatında olmalıdır (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Bitiş tarihi zorunludur' })
  end_date: string;

  /**
   * period: Rapor periyodu (günlük, haftalık, aylık)
   * 
   * @IsEnum(): ReportPeriod enum'undaki değerlerden biri olmalıdır
   * @IsNotEmpty(): Zorunlu alan
   */
  @ApiProperty({
    description: 'Rapor periyodu (hourly, daily, weekly, monthly)',
    enum: ReportPeriod,
    example: 'monthly',
  })
  @IsEnum(ReportPeriod, {
    message: 'Rapor periyodu hourly, daily, weekly veya monthly olmalıdır',
  })
  @IsNotEmpty({ message: 'Rapor periyodu zorunludur' })
  period: ReportPeriod;
}

