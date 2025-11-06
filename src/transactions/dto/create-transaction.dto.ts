import { ApiProperty } from '@nestjs/swagger';
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

export class CreateTransactionDto {
  @ApiProperty({
    example: 1500.50,
    description: 'Tutar (pozitif sayı, min: 0.01)',
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'Tutar sayı olmalıdır' })
  @IsNotEmpty({ message: 'Tutar zorunludur' })
  @Min(0.01, { message: 'Tutar en az 0.01 olmalıdır' })
  amount: number;

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

  @ApiProperty({
    example: 'uuid',
    description: 'Kategori ID (UUID format)',
  })
  @IsUUID(4, { message: 'Kategori ID geçerli bir UUID olmalıdır' })
  @IsNotEmpty({ message: 'Kategori ID zorunludur' })
  category_id: string;

  @ApiProperty({
    example: '2025-01-21',
    description: 'Tarih (ISO8601 format: YYYY-MM-DD, opsiyonel, default: bugün)',
    required: false,
  })
  @IsDateString({}, { message: 'Tarih ISO8601 formatında olmalıdır (YYYY-MM-DD)' })
  @IsOptional()
  date?: string;

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

