import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponseDto } from '../dto/success-response.dto';
import { MessageKey, MessageTexts } from '../constants/message-keys.constant';

/**
 * Transform Interceptor
 * Automatically wraps responses in SuccessResponseDto format
 * If response is already formatted (has success field), returns as is
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // Eğer data zaten formatlanmışsa (SuccessResponseDto veya benzeri), olduğu gibi döndür
        if (data && typeof data === 'object' && 'success' in data) {
          return data as SuccessResponseDto<T>;
        }

        // Aksi halde standart format ile wrap et
        return new SuccessResponseDto(
          data,
          MessageKey.SUCCESS,
          MessageTexts[MessageKey.SUCCESS],
        );
      }),
    );
  }
}

