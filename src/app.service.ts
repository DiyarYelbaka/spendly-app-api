// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
import { Injectable } from '@nestjs/common';

/**
 * AppService Sınıfı
 * 
 * Bu sınıf, uygulamanın ana service'idir.
 * Temel iş mantığını içerir (örneğin: health check).
 * 
 * @Injectable(): Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
 *   Bu sayede bu sınıf başka sınıflara otomatik olarak enjekte edilebilir
 */
@Injectable()
export class AppService {
  /**
   * getHealth: Health check fonksiyonu
   * 
   * Bu fonksiyon, uygulamanın çalışıp çalışmadığını kontrol eder.
   * Uygulama durumu hakkında bilgi döndürür.
   * 
   * @returns {success: boolean, message: string, timestamp: string, version: string, environment: string}
   *   - success: İşlem başarılı mı? (her zaman true - eğer bu fonksiyon çalışıyorsa API çalışıyor demektir)
   *   - message: Durum mesajı
   *   - timestamp: İsteğin yapıldığı zaman (ISO8601 formatında)
   *   - version: API versiyonu
   *   - environment: Çalışma ortamı (development, production, test, vb.)
   * 
   * İş Akışı:
   * 1. Başarı durumu belirlenir (her zaman true)
   * 2. Durum mesajı oluşturulur
   * 3. Şu anki zaman alınır (timestamp)
   * 4. API versiyonu belirtilir
   * 5. Çalışma ortamı belirlenir (ortam değişkeninden veya varsayılan olarak 'development')
   * 6. Tüm bilgiler birleştirilip döndürülür
   */
  getHealth() {
    /**
     * Health check yanıtı oluşturulur
     * 
     * success: true
     *   Eğer bu fonksiyon çalışıyorsa, API çalışıyor demektir.
     *   Bu yüzden her zaman true döndürülür.
     * 
     * message: 'Hesap Asistan API is running'
     *   Kullanıcıya gösterilecek durum mesajı
     * 
     * timestamp: new Date().toISOString()
     *   Şu anki tarih ve saat (ISO8601 formatında)
     *   Örnek: "2025-01-21T10:30:00.000Z"
     *   ISO8601: Uluslararası tarih/saat formatı standardı
     * 
     * version: '1.0.0'
     *   API versiyonu
     *   Bu değer, API'nin hangi versiyonunda olduğunu belirtir
     *   Semantik versiyonlama (Semantic Versioning) kullanılır:
     *     - Major.Minor.Patch (örneğin: 1.0.0)
     *     - Major: Büyük değişiklikler (geriye uyumsuz)
     *     - Minor: Yeni özellikler (geriye uyumlu)
     *     - Patch: Hata düzeltmeleri (geriye uyumlu)
     * 
     * environment: process.env.NODE_ENV || 'development'
     *   Çalışma ortamı (environment)
     *   process.env.NODE_ENV: Ortam değişkeninden alınır (.env dosyasından veya sistem ayarlarından)
     *   || 'development': Eğer NODE_ENV tanımlı değilse, varsayılan olarak 'development' kullanılır
     *   
     *   Olası değerler:
     *     - 'development': Geliştirme ortamı (local, test için)
     *     - 'production': Canlı ortam (gerçek kullanıcılar için)
     *     - 'test': Test ortamı (otomatik testler için)
     *     - 'staging': Staging ortamı (production'a geçmeden önce test için)
     */
    return {
      success: true,
      message: 'Hesap Asistan API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

