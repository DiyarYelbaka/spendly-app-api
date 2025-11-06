import { ApiProperty } from '@nestjs/swagger';
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

export class UpdateCategoryDto {
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

  @ApiProperty({
    example: 'Yeni açıklama',
    description: 'Kategori açıklaması (max 500 karakter, opsiyonel)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Açıklama en fazla 500 karakter olmalıdır' })
  description?: string;

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

  @ApiProperty({
    example: true,
    description: 'Kategori aktif mi? (opsiyonel)',
    required: false,
  })
  @IsBoolean({ message: 'is_active boolean olmalıdır' })
  @IsOptional()
  is_active?: boolean;
}

