// NestJS: Backend framework'ü
// Global: Global modül decorator'ı
// Module: Modül sistemi
import { Global, Module } from '@nestjs/common';

// PrismaService: Veritabanı işlemlerini yapan servis
import { PrismaService } from './prisma.service';

/**
 * PrismaModule Sınıfı
 * 
 * Bu modül, Prisma veritabanı servisini sağlar.
 * 
 * @Global(): Bu modül global bir modüldür
 *   Global modül, tüm uygulamada kullanılabilir.
 *   Başka modüllerde import etmeye gerek yoktur.
 * 
 * @Module(): Bu sınıfın bir NestJS modülü olduğunu belirtir
 * 
 * providers: Bu modülde bulunan service'ler ve diğer sağlayıcılar
 *   - PrismaService: Veritabanı işlemlerini yapan servis
 *     Bu servis, Prisma ORM'i kullanarak veritabanı işlemlerini yapar
 * 
 * exports: Bu modülden dışarıya (başka modüllere) açılan bileşenler
 *   - PrismaService: Tüm modüller bu service'i kullanabilir
 *     Global modül olduğu için, import etmeye gerek yoktur
 * 
 * Neden Global Modül?
 * - PrismaService, neredeyse tüm modüller tarafından kullanılır
 * - Her modülde import etmek gereksiz tekrar olur
 * - Global modül, tüm uygulamada otomatik olarak kullanılabilir
 * 
 * Modül Yapısı:
 * 1. PrismaService → Veritabanı işlemlerini yapar
 * 2. PrismaModule → Service'i sağlar ve global yapar
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

