// NestJS: Backend framework'ü
// Module: NestJS modül sistemi - ilgili bileşenleri bir araya getirir
import { Module } from '@nestjs/common';

// Categories modülünün bileşenleri
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

// PrismaModule: Veritabanı işlemleri için gerekli modül
import { PrismaModule } from '../core';

/**
 * CategoriesModule Sınıfı
 * 
 * Bu modül, kategori ile ilgili tüm bileşenleri bir araya getirir.
 * 
 * Modül Nedir?
 * Modül, ilgili controller'ları, service'leri ve diğer bileşenleri organize eden bir yapıdır.
 * NestJS'te her özellik (feature) kendi modülüne sahiptir.
 * 
 * @Module(): Bu sınıfın bir NestJS modülü olduğunu belirtir
 * 
 * imports: Bu modülün ihtiyaç duyduğu diğer modüller
 *   - PrismaModule: Veritabanı işlemleri için gerekli
 *     CategoriesService, PrismaService'i kullanır, bu yüzden PrismaModule'ü import etmemiz gerekir
 * 
 * controllers: Bu modülde bulunan controller'lar
 *   - CategoriesController: Kategori HTTP endpoint'lerini yönetir
 *     Controller, HTTP isteklerini alır ve service'e yönlendirir
 * 
 * providers: Bu modülde bulunan service'ler ve diğer sağlayıcılar
 *   - CategoriesService: Kategori iş mantığını içerir
 *     Service, veritabanı işlemlerini ve iş kurallarını yönetir
 * 
 * exports: Bu modülden dışarıya (başka modüllere) açılan bileşenler
 *   - CategoriesService: Başka modüller (örneğin: AuthModule) bu service'i kullanabilir
 *     Örneğin: Yeni kullanıcı kaydolduğunda varsayılan kategorileri oluşturmak için
 * 
 * Modül Yapısı:
 * 1. Controller → HTTP isteklerini alır
 * 2. Service → İş mantığını yönetir
 * 3. Module → Her şeyi bir araya getirir
 * 
 * Bu yapı sayesinde kod daha organize ve bakımı kolay olur.
 */
@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

