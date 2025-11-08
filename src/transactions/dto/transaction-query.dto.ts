import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '../../core';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

/**
 * Transaction Query DTO
 * Query parameters for transaction list endpoint
 */
export class TransactionQueryDto extends PaginationQueryDto {
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

  @ApiPropertyOptional({
    description: 'Kategori ID filtresi',
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Kategori ID geçerli bir UUID olmalıdır' })
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Başlangıç tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Başlangıç tarihi ISO8601 formatında olmalıdır' })
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Bitiş tarihi (ISO8601: YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Bitiş tarihi ISO8601 formatında olmalıdır' })
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Arama terimi (açıklamada ara)',
    example: 'maaş',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

