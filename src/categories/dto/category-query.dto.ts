import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../core';
import { CategoryType } from './create-category.dto';

/**
 * Category Query DTO
 * Query parameters for category list endpoint
 */
export class CategoryQueryDto extends PaginationQueryDto {
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

  @ApiPropertyOptional({
    description: 'Varsayılan kategorileri dahil et',
    example: true,
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => value !== 'false')
  @IsBoolean()
  include_defaults?: boolean;

  @ApiPropertyOptional({
    description: 'İstatistikleri dahil et',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  include_stats?: boolean;

  @ApiPropertyOptional({
    description: 'Arama terimi (kategori adında ara)',
    example: 'yemek',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

