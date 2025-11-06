import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateTransactionDto {
  @ApiProperty({
    example: 1600.00,
    description: 'Tutar (pozitif sayı, min: 0.01, opsiyonel)',
    required: false,
  })
  @IsNumber({}, { message: 'Tutar sayı olmalıdır' })
  @IsOptional()
  @Min(0.01, { message: 'Tutar en az 0.01 olmalıdır' })
  amount?: number;

  @ApiProperty({
    example: 'Güncellenmiş açıklama',
    description: 'Açıklama (1-500 karakter, opsiyonel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Açıklama en az 1 karakter olmalıdır' })
  @MaxLength(500, { message: 'Açıklama en fazla 500 karakter olmalıdır' })
  description?: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Kategori ID (UUID format, opsiyonel)',
    required: false,
  })
  @IsUUID(4, { message: 'Kategori ID geçerli bir UUID olmalıdır' })
  @IsOptional()
  category_id?: string;

  @ApiProperty({
    example: '2025-01-22',
    description: 'Tarih (ISO8601 format: YYYY-MM-DD, opsiyonel)',
    required: false,
  })
  @IsDateString({}, { message: 'Tarih ISO8601 formatında olmalıdır (YYYY-MM-DD)' })
  @IsOptional()
  date?: string;

  @ApiProperty({
    example: 'Güncellenmiş notlar',
    description: 'Notlar (max 1000 karakter, opsiyonel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Notlar en fazla 1000 karakter olmalıdır' })
  notes?: string;
}

