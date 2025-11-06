import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message_key?: string;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Eğer data zaten formatlanmışsa (success field'ı varsa), olduğu gibi döndür
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Aksi halde standart format
        return {
          success: true,
          message_key: 'SUCCESS',
          data: data,
          message: 'İşlem başarılı',
        };
      }),
    );
  }
}

