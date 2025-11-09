// NestJS: Backend framework'ü
// Module: Modül sistemi
import { Module } from '@nestjs/common';

// Transactions modülünün bileşenleri
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { VoiceTransactionService } from './voice-transaction.service';

// PrismaModule: Veritabanı işlemleri için gerekli modül
import { PrismaModule } from '../core';

/**
 * TransactionsModule Sınıfı
 * 
 * Bu modül, işlem (transaction) ile ilgili tüm bileşenleri bir araya getirir.
 * 
 * Modül Nedir?
 * Modül, ilgili controller'ları, service'leri ve diğer bileşenleri organize eden bir yapıdır.
 * NestJS'te her özellik (feature) kendi modülüne sahiptir.
 * 
 * @Module(): Bu sınıfın bir NestJS modülü olduğunu belirtir
 * 
 * imports: Bu modülün ihtiyaç duyduğu diğer modüller
 *   - PrismaModule: Veritabanı işlemleri için gerekli
 *     TransactionsService, PrismaService'i kullanır, bu yüzden PrismaModule'ü import etmemiz gerekir
 * 
 * controllers: Bu modülde bulunan controller'lar
 *   - TransactionsController: İşlem HTTP endpoint'lerini yönetir
 *     Controller, HTTP isteklerini alır ve service'e yönlendirir
 * 
 * providers: Bu modülde bulunan service'ler ve diğer sağlayıcılar
 *   - TransactionsService: İşlem iş mantığını içerir
 *     Service, veritabanı işlemlerini ve iş kurallarını yönetir
 * 
 * exports: Bu modülden dışarıya (başka modüllere) açılan bileşenler
 *   - TransactionsService: Başka modüller (örneğin: AnalyticsModule) bu service'i kullanabilir
 *     Örneğin: İşlem istatistiklerini hesaplamak için
 * 
 * Modül Yapısı:
 * 1. Controller → HTTP isteklerini alır
 * 2. Service → İş mantığını yönetir
 * 3. Module → Her şeyi bir araya getirir
 */
@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, VoiceTransactionService],
  exports: [TransactionsService],
})
export class TransactionsModule {}

