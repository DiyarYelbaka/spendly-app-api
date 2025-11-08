import { SuccessResponseDto } from '../dto/success-response.dto';
import { PaginatedResponseDto, PaginationDto } from '../dto/paginated-response.dto';
import { MessageKey, MessageTexts } from '../constants/message-keys.constant';

/**
 * Response Utility
 * Helper functions for creating standardized responses
 */
export class ResponseUtil {
  /**
   * Create success response
   */
  static success<T>(
    data: T,
    messageKey: MessageKey = MessageKey.SUCCESS,
    customMessage?: string,
  ): SuccessResponseDto<T> {
    return new SuccessResponseDto(
      data,
      messageKey,
      customMessage || MessageTexts[messageKey],
    );
  }

  /**
   * Create paginated response
   */
  static paginated<T>(
    items: T[],
    pagination: PaginationDto,
    messageKey: MessageKey = MessageKey.SUCCESS,
    customMessage?: string,
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(
      items,
      pagination,
      messageKey,
      customMessage || MessageTexts[messageKey],
    );
  }

  /**
   * Create created response (201)
   */
  static created<T>(
    data: T,
    messageKey: MessageKey = MessageKey.CREATED,
    customMessage?: string,
  ): SuccessResponseDto<T> {
    return new SuccessResponseDto(
      data,
      messageKey,
      customMessage || MessageTexts[messageKey],
    );
  }

  /**
   * Create updated response
   */
  static updated<T>(
    data: T,
    messageKey: MessageKey = MessageKey.UPDATED,
    customMessage?: string,
  ): SuccessResponseDto<T> {
    return new SuccessResponseDto(
      data,
      messageKey,
      customMessage || MessageTexts[messageKey],
    );
  }

  /**
   * Create deleted response
   */
  static deleted(
    messageKey: MessageKey = MessageKey.DELETED,
    customMessage?: string,
  ): SuccessResponseDto<{ message: string }> {
    return new SuccessResponseDto(
      { message: customMessage || MessageTexts[messageKey] },
      messageKey,
      customMessage || MessageTexts[messageKey],
    );
  }
}

