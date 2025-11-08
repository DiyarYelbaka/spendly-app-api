// NestJS: Backend framework'ü
// Module: Modül sistemi
import { Module } from '@nestjs/common';

// Analytics modülünün bileşenleri
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

// PrismaModule: Veritabanı işlemleri için gerekli modül
import { PrismaModule } from '../core';

/**
 * AnalyticsModule Sınıfı
 * 
 * Bu modül, analitik (analytics) ile ilgili tüm bileşenleri bir araya getirir.
 * 
 * Modül Nedir?
 * Modül, ilgili controller'ları, service'leri ve diğer bileşenleri organize eden bir yapıdır.
 * NestJS'te her özellik (feature) kendi modülüne sahiptir.
 * 
 * @Module(): Bu sınıfın bir NestJS modülü olduğunu belirtir
 * 
 * imports: Bu modülün ihtiyaç duyduğu diğer modüller
 *   - PrismaModule: Veritabanı işlemleri için gerekli
 *     AnalyticsService, PrismaService'i kullanır, bu yüzden PrismaModule'ü import etmemiz gerekir
 * 
 * controllers: Bu modülde bulunan controller'lar
 *   - AnalyticsController: Analitik HTTP endpoint'lerini yönetir
 *     Controller, HTTP isteklerini alır ve service'e yönlendirir
 * 
 * providers: Bu modülde bulunan service'ler ve diğer sağlayıcılar
 *   - AnalyticsService: Analitik iş mantığını içerir
 *     Service, finansal verileri analiz eder ve raporlar oluşturur
 * 
 * exports: Bu modülden dışarıya (başka modüllere) açılan bileşenler
 *   - AnalyticsService: Başka modüller bu service'i kullanabilir
 *     Ancak bu örnekte başka modül AnalyticsService'i kullanmıyor
 * 
 * Modül Yapısı:
 * 1. Controller → HTTP isteklerini alır
 * 2. Service → İş mantığını yönetir
 * 3. Module → Her şeyi bir araya getirir
 */
@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

