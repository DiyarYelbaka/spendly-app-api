// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// OnModuleInit: Modül başlatıldığında çalışacak fonksiyon için arayüz
// OnModuleDestroy: Modül kapatıldığında çalışacak fonksiyon için arayüz
// Logger: Loglama (kayıt tutma) için
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

// PrismaClient: Prisma ORM'in ana sınıfı
// Prisma, veritabanı ile iletişim kurmak için kullanılan bir ORM (Object-Relational Mapping) aracıdır
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService Sınıfı
 * 
 * Bu sınıf, veritabanı işlemlerini yapmak için kullanılan Prisma servisidir.
 * 
 * Prisma Nedir?
 * Prisma, veritabanı ile iletişim kurmak için kullanılan bir ORM (Object-Relational Mapping) aracıdır.
 * Prisma sayesinde:
 * - SQL sorguları yazmak yerine, TypeScript kodları ile veritabanı işlemleri yapabiliriz
 * - Veritabanı şeması otomatik olarak TypeScript tiplerine dönüştürülür
 * - Tip güvenliği sağlanır (hangi alanların var olduğunu biliriz)
 * 
 * @Injectable(): Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
 * extends PrismaClient: Prisma'nın temel sınıfını genişletir
 *   Bu sayede Prisma'nın tüm özelliklerini (findMany, create, update, vb.) kullanabiliriz
 * implements OnModuleInit, OnModuleDestroy: Modül yaşam döngüsü (lifecycle) arayüzleri
 *   - OnModuleInit: Modül başlatıldığında çalışır (veritabanı bağlantısı kurulur)
 *   - OnModuleDestroy: Modül kapatıldığında çalışır (veritabanı bağlantısı kapatılır)
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * logger: Loglama (kayıt tutma) için kullanılan nesne
   * 
   * Logger, veritabanı bağlantı durumunu kaydetmek için kullanılır.
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * PrismaService.name: Logger'ın hangi sınıftan geldiğini belirtir
   */
  private readonly logger = new Logger(PrismaService.name);

  /**
   * onModuleInit: Modül başlatıldığında çalışan fonksiyon
   * 
   * Bu fonksiyon, NestJS modülü başlatıldığında otomatik olarak çalışır.
   * Veritabanı bağlantısını burada kurarız.
   * 
   * async: Bu fonksiyon asenkron (asenkron) çalışır
   *   Veritabanı bağlantısı uzun sürebilir, bu yüzden async kullanılır
   * 
   * İş Akışı:
   * 1. Veritabanına bağlanmayı dener ($connect)
   * 2. Başarılı olursa → Başarı mesajı loglar
   * 3. Başarısız olursa → Uyarı mesajı loglar (uygulama çalışmaya devam eder)
   */
  async onModuleInit() {
    // try-catch: Hata yakalama bloğu
    // Veritabanı bağlantısı başarısız olursa, uygulama çökmesin
    try {
      /**
       * $connect(): Veritabanına bağlanır
       * 
       * Bu fonksiyon, Prisma'nın veritabanına bağlanmasını sağlar.
       * DATABASE_URL ortam değişkeninden (.env dosyasından) bağlantı bilgilerini alır.
       * 
       * await: Bağlantının tamamlanmasını bekler (asynchronous işlem)
       * 
       * Örnek DATABASE_URL:
       * postgresql://user:password@localhost:5432/database_name
       */
      await this.$connect();
      
      /**
       * Başarılı Bağlantı Mesajı
       * 
       * Veritabanı başarıyla bağlandıysa, bu mesaj loglanır.
       * Bu sayede uygulamanın veritabanına bağlandığını görebiliriz.
       */
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      /**
       * Bağlantı Hatası
       * 
       * Eğer veritabanına bağlanılamazsa (örneğin: PostgreSQL çalışmıyor),
       * uyarı mesajları loglanır.
       * 
       * NOT: Uygulama çökmez, sadece uyarı verilir.
       * Bu sayede veritabanı olmadan da uygulama çalışabilir (test amaçlı).
       * 
       * logger.warn(): Uyarı seviyesinde log yazar (hata değil, uyarı)
       */
      this.logger.warn('⚠️ Database connection failed. App will continue without database.');
      this.logger.warn('Make sure PostgreSQL is running and DATABASE_URL is set in .env file');
    }
  }

  /**
   * onModuleDestroy: Modül kapatıldığında çalışan fonksiyon
   * 
   * Bu fonksiyon, NestJS modülü kapatıldığında (uygulama kapatıldığında) otomatik olarak çalışır.
   * Veritabanı bağlantısını burada kapatırız.
   * 
   * async: Bu fonksiyon asenkron (asenkron) çalışır
   * 
   * İş Akışı:
   * 1. Veritabanı bağlantısını kapatmayı dener ($disconnect)
   * 2. Hata oluşursa → Hata görmezden gelinir (uygulama zaten kapanıyor)
   * 
   * Neden Önemli?
   * Veritabanı bağlantılarını kapatmak önemlidir çünkü:
   * - Açık bağlantılar kaynak (resource) tüketir
   * - Veritabanı sunucusu bağlantı limitine ulaşabilir
   * - Temiz bir kapanış için bağlantıları kapatmalıyız
   */
  async onModuleDestroy() {
    // try-catch: Hata yakalama bloğu
    // Bağlantı kapatma hatası oluşursa, görmezden gelinir (uygulama zaten kapanıyor)
    try {
      /**
       * $disconnect(): Veritabanı bağlantısını kapatır
       * 
       * Bu fonksiyon, Prisma'nın veritabanı bağlantısını kapatır.
       * 
       * await: Bağlantının kapatılmasını bekler (asynchronous işlem)
       */
      await this.$disconnect();
    } catch (error) {
      /**
       * Hata Görmezden Gel
       * 
       * Bağlantı kapatma hatası oluşursa, görmezden gelinir.
       * Çünkü:
       * - Uygulama zaten kapanıyor
       * - Hata mesajı kullanıcıya gösterilemez
       * - Kritik bir hata değil
       */
      // Ignore disconnect errors
    }
  }
}

