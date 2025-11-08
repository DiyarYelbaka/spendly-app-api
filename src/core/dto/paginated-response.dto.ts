import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from './success-response.dto';

/**
 * Pagination metadata
 */
export class PaginationDto {
  @ApiProperty({ example: 100, description: 'Toplam kayıt sayısı' })
  total: number;

  @ApiProperty({ example: 1, description: 'Mevcut sayfa' })
  current_page: number;

  @ApiProperty({ example: 20, description: 'Sayfa başına kayıt sayısı' })
  per_page: number;
}

/**
 * Paginated data structure
 */
export class PaginatedDataDto<T = any> {
  @ApiProperty({ description: 'Items array' })
  items: T[];

  @ApiProperty({ type: PaginationDto, description: 'Pagination metadata' })
  pagination: PaginationDto;

  constructor(items: T[], pagination: PaginationDto) {
    this.items = items;
    this.pagination = pagination;
  }
}

/**
 * Paginated Response DTO
 * Standard paginated response format
 */
export class PaginatedResponseDto<T = any> extends SuccessResponseDto<PaginatedDataDto<T>> {
  constructor(items: T[], pagination: PaginationDto, messageKey: string, message?: string) {
    super(new PaginatedDataDto(items, pagination), messageKey, message);
  }
}

