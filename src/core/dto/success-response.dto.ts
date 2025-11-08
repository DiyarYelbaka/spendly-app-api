import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Success Response DTO
 * Standard success response format for all endpoints
 */
export class SuccessResponseDto<T = any> {
  @ApiProperty({ example: true, description: 'İşlem başarılı mı?' })
  success: boolean;

  @ApiProperty({ example: 'SUCCESS', description: 'Message key for frontend' })
  message_key: string;

  @ApiProperty({ description: 'Response data' })
  data: T;

  @ApiPropertyOptional({ example: 'İşlem başarılı', description: 'Human readable message' })
  message?: string;

  constructor(data: T, messageKey: string, message?: string) {
    this.success = true;
    this.message_key = messageKey;
    this.data = data;
    this.message = message;
  }
}

