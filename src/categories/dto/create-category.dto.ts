import { ApiProperty } from '@nestjs/swagger';
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

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export class CreateCategoryDto {
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

