// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// NestInterceptor: Interceptor arayüzü (interface)
// ExecutionContext: HTTP isteği bağlamını (context) temsil eder
// CallHandler: Controller fonksiyonunu çağırmak için
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

// RxJS: Reactive programming kütüphanesi
// Observable: Asenkron veri akışını temsil eder
import { Observable } from 'rxjs';

// map: Observable'ı dönüştürmek için kullanılan operatör
import { map } from 'rxjs/operators';

// SuccessResponseDto: Standart başarı yanıtı formatı
import { SuccessResponseDto } from '../dto/success-response.dto';

// MessageKey, MessageTexts: Mesaj anahtarları ve metinleri
import { MessageKey, MessageTexts } from '../constants/message-keys.constant';

/**
 * TransformInterceptor Sınıfı
 * 
 * Bu sınıf, tüm başarılı HTTP yanıtlarını standart formatta döndüren bir interceptor'dur.
 * 
 * Interceptor Nedir?
 * Interceptor, controller fonksiyonundan önce veya sonra çalışan bir ara katmandır.
 * Yanıtları dönüştürmek, loglama yapmak gibi işlemler için kullanılır.
 * 
 * Bu Interceptor'un Görevi:
 * 1. Controller'dan dönen yanıtı yakalar
 * 2. Yanıt zaten formatlanmışsa (success alanı varsa) → Olduğu gibi döndürür
 * 3. Yanıt formatlanmamışsa → Standart SuccessResponseDto formatına sarar
 * 
 * Neden Gerekli?
 * - Frontend'in beklediği yanıt formatı standart olmalı
 * - Tüm yanıtlar aynı yapıda olmalı (örneğin: { success: true, data: ... })
 * - Mesaj anahtarları (message_key) frontend'de çeviri için kullanılır
 * 
 * @Injectable(): Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
 * implements NestInterceptor: NestJS interceptor arayüzünü uygular
 * 
 * <T>: Generic tip parametresi
 *   T, yanıt verisinin tipini temsil eder (örneğin: Category, Transaction[])
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponseDto<T>>
{
  /**
   * intercept: Interceptor'un ana fonksiyonu
   * 
   * Bu fonksiyon, controller fonksiyonundan dönen yanıtı yakalar ve dönüştürür.
   * 
   * @param context: ExecutionContext - HTTP isteği bağlamı
   *   Bu bağlam, request, response gibi bilgileri içerir
   *   Bu interceptor'da kullanılmaz, ancak gerekirse erişebiliriz
   * 
   * @param next: CallHandler - Controller fonksiyonunu çağırmak için
   *   next.handle(): Controller fonksiyonunu çağırır ve yanıtı döndürür
   * 
   * @returns Observable<SuccessResponseDto<T>> - Dönüştürülmüş yanıt
   *   Observable, asenkron veri akışını temsil eder
   * 
   * İş Akışı:
   * 1. Controller fonksiyonu çağrılır (next.handle())
   * 2. Controller'dan dönen yanıt yakalanır
   * 3. Yanıt formatlanmış mı kontrol edilir
   * 4. Formatlanmamışsa → Standart formata sarılır
   * 5. Formatlanmışsa → Olduğu gibi döndürülür
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponseDto<T>> {
    /**
     * ADIM 1: Controller Fonksiyonunu Çağır ve Yanıtı Yakala
     * 
     * next.handle(): Controller fonksiyonunu çağırır ve yanıtı döndürür
     *   Bu fonksiyon, controller'ın döndürdüğü değeri bir Observable olarak döndürür
     * 
     * pipe(): Observable'ı dönüştürmek için kullanılan operatör zinciri
     *   Bu zincir, yanıtı işleyip dönüştürür
     * 
     * map(): Observable içindeki veriyi dönüştürmek için kullanılan operatör
     *   Bu operatör, controller'dan dönen veriyi alır ve dönüştürür
     */
    return next.handle().pipe(
      map((data) => {
        /**
         * ADIM 2: Yanıt Formatlanmış mı Kontrol Et
         * 
         * Eğer yanıt zaten formatlanmışsa (success alanı varsa),
         * olduğu gibi döndürürüz. Bu sayede:
         * - Manuel olarak formatlanmış yanıtlar korunur
         * - Gereksiz sarmalama (wrapping) yapılmaz
         * 
         * Kontrol Kriterleri:
         * - data: Veri var mı? (null veya undefined değil)
         * - typeof data === 'object': Veri bir nesne mi? (array veya object)
         * - 'success' in data: Veri içinde 'success' alanı var mı?
         * 
         * Örnek Formatlanmış Yanıt:
         * {
         *   success: true,
         *   message_key: "SUCCESS",
         *   data: { ... }
         * }
         */
        if (data && typeof data === 'object' && 'success' in data) {
          // Yanıt zaten formatlanmış - olduğu gibi döndür
          return data as SuccessResponseDto<T>;
        }

        /**
         * ADIM 3: Yanıtı Standart Formata Sar
         * 
         * Eğer yanıt formatlanmamışsa, standart SuccessResponseDto formatına sararız.
         * 
         * SuccessResponseDto Constructor:
         *   - data: Controller'dan dönen veri (T tipinde)
         *   - messageKey: Mesaj anahtarı (MessageKey.SUCCESS)
         *   - message: İnsan tarafından okunabilir mesaj (MessageTexts[MessageKey.SUCCESS])
         * 
         * Sonuç Formatı:
         * {
         *   success: true,
         *   message_key: "SUCCESS",
         *   data: <controller'dan dönen veri>,
         *   message: "İşlem başarılı"
         * }
         * 
         * Örnek:
         * Controller döner: { id: "123", name: "Kategori" }
         * Interceptor döner:
         * {
         *   success: true,
         *   message_key: "SUCCESS",
         *   data: { id: "123", name: "Kategori" },
         *   message: "İşlem başarılı"
         * }
         */
        return new SuccessResponseDto(
          data,
          MessageKey.SUCCESS,
          MessageTexts[MessageKey.SUCCESS],
        );
      }),
    );
  }
}

