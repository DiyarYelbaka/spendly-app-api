// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// Logger: Loglama (kayıt tutma) için
import { Injectable, Logger } from '@nestjs/common';

// PrismaService: Veritabanı işlemlerini yapmak için
// ErrorHandler: Hataları yönetmek için
import { PrismaService, ErrorHandler } from '../core';

/**
 * AnalyticsService Sınıfı
 * 
 * Bu sınıf, analitik (analytics) ile ilgili tüm iş mantığını (business logic) içerir.
 * Service'in görevi:
 * 1. Finansal verileri analiz etmek (gelir, gider, bakiye)
 * 2. İstatistikleri hesaplamak (aylık trendler, kategori dağılımı)
 * 3. Raporlar oluşturmak (dashboard, özet)
 * 4. Hata yönetimi yapmak
 * 
 * @Injectable(): Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
 *   Bu sayede bu sınıf başka sınıflara otomatik olarak enjekte edilebilir
 */
@Injectable()
export class AnalyticsService {
  /**
   * logger: Loglama (kayıt tutma) için kullanılan nesne
   * 
   * Logger, uygulamanın çalışması sırasında oluşan olayları kaydetmek için kullanılır.
   * Örneğin: Hatalar, bilgilendirmeler, uyarılar
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * AnalyticsService.name: Logger'ın hangi sınıftan geldiğini belirtir
   */
  private readonly logger = new Logger(AnalyticsService.name);

  /**
   * Constructor (Yapıcı Fonksiyon)
   * 
   * Bu fonksiyon, service oluşturulduğunda çalışır.
   * PrismaService'i buraya enjekte eder (dependency injection).
   * 
   * private prisma: Veritabanı işlemlerini yapmak için kullanılan Prisma servisi
   *   Bu servis sayesinde veritabanına sorgu gönderebiliriz
   */
  constructor(private prisma: PrismaService) {}

  /**
   * getSummary: Finansal özet verilerini getiren fonksiyon
   * 
   * Bu fonksiyon, kullanıcının finansal özet bilgilerini hesaplar.
   * Özet, mevcut ay ve genel durum hakkında bilgi verir.
   * 
   * @param userId: string - Kullanıcının benzersiz ID'si
   * 
   * @returns Promise<SummaryData> - Finansal özet verileri
   *   - current_balance: Mevcut bakiye (tüm zamanlar net bakiye)
   *   - monthly_income: Bu ayki toplam gelir
   *   - monthly_expense: Bu ayki toplam gider
   *   - savings_rate: Tasarruf oranı (%)
   * 
   * İş Akışı:
   * 1. Bu ayın başlangıç ve bitiş tarihleri hesaplanır
   * 2. Bu ayki gelir ve gider hesaplanır (paralel olarak)
   * 3. Tüm zamanlar toplam gelir ve gider hesaplanır (paralel olarak)
   * 4. Mevcut bakiye hesaplanır
   * 5. Tasarruf oranı hesaplanır
   * 6. Tüm veriler birleştirilip döndürülür
   */
  async getSummary(userId: string) {
    // try-catch: Hata yakalama bloğu
    try {
      /**
       * ADIM 1: Bu Ayın Başlangıç ve Bitiş Tarihlerini Hesapla
       * 
       * new Date(): Şu anki tarih ve saat
       * 
       * startOfMonth: Ayın ilk günü (örneğin: 1 Ocak 2025 00:00:00)
       *   - getFullYear(): Yıl (örneğin: 2025)
       *   - getMonth(): Ay (0-11 arası, 0 = Ocak, 11 = Aralık)
       *   - new Date(year, month, 1): Ayın 1. günü
       * 
       * endOfMonth: Ayın son günü (örneğin: 31 Ocak 2025 23:59:59)
       *   - new Date(year, month + 1, 0): Bir sonraki ayın 0. günü = bu ayın son günü
       *   - 23, 59, 59: Saat, dakika, saniye (günün son anı)
       */
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      /**
       * ADIM 2: Bu Ayki ve Tüm Zamanlar Gelir/Gider Hesapla
       * 
       * Promise.all(): Dört sorguyu paralel olarak çalıştırır
       *   Bu sayede performans artar (dört sorgu aynı anda çalışır)
       * 
       * monthlyIncomeResult: Bu ayki toplam gelir
       * monthlyExpenseResult: Bu ayki toplam gider
       * totalIncomeResult: Tüm zamanlar toplam gelir
       * totalExpenseResult: Tüm zamanlar toplam gider
       * 
       * date: Tarih filtresi (sadece bu ayki işlemler için)
       *   - gte: Büyük veya eşit (greater than or equal) - ayın başından itibaren
       *   - lte: Küçük veya eşit (less than or equal) - ayın sonuna kadar
       */
      const [monthlyIncomeResult, monthlyExpenseResult, totalIncomeResult, totalExpenseResult] =
        await Promise.all([
          // Bu ayki gelir işlemlerinin toplamını hesapla
          this.prisma.transaction.aggregate({
            where: {
              userId,
              type: 'income',
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
            _sum: {
              amount: true,
            },
          }),
          // Bu ayki gider işlemlerinin toplamını hesapla
          this.prisma.transaction.aggregate({
            where: {
              userId,
              type: 'expense',
              date: {
                gte: startOfMonth,
                lte: endOfMonth,
              },
            },
            _sum: {
              amount: true,
            },
          }),
          // Tüm zamanlar toplam gelir
          this.prisma.transaction.aggregate({
            where: {
              userId,
              type: 'income',
            },
            _sum: {
              amount: true,
            },
          }),
          // Tüm zamanlar toplam gider
          this.prisma.transaction.aggregate({
            where: {
              userId,
              type: 'expense',
            },
            _sum: {
              amount: true,
            },
          }),
        ]);

      /**
       * ADIM 3: Sonuçları Sayıya Çevir ve Bakiyeyi Hesapla
       * 
       * toNumber(): Prisma'nın Decimal tipini JavaScript number'a çevirir
       * || 0: Eğer sonuç null veya undefined ise, 0 kullan
       * 
       * currentBalance: Mevcut bakiye = Tüm zamanlar toplam gelir - Tüm zamanlar toplam gider
       *   Bu, kullanıcının toplam net bakiyesidir
       */
      const monthlyIncome = monthlyIncomeResult._sum.amount?.toNumber() || 0;
      const monthlyExpense = monthlyExpenseResult._sum.amount?.toNumber() || 0;
      const totalIncome = totalIncomeResult._sum.amount?.toNumber() || 0;
      const totalExpense = totalExpenseResult._sum.amount?.toNumber() || 0;
      const currentBalance = totalIncome - totalExpense;

      /**
       * ADIM 4: Tasarruf Oranını Hesapla
       * 
       * Tasarruf Oranı = ((Aylık Gelir - Aylık Gider) / Aylık Gelir) * 100
       * 
       * Örnek:
       * - Aylık gelir: 5000 TL
       * - Aylık gider: 3000 TL
       * - Tasarruf: 5000 - 3000 = 2000 TL
       * - Tasarruf oranı: (2000 / 5000) * 100 = %40
       * 
       * if (monthlyIncome > 0): Sıfıra bölme hatasını önlemek için kontrol
       *   Eğer aylık gelir 0 ise, tasarruf oranı hesaplanamaz (0 döndürülür)
       * 
       * Math.round(savingsRate * 100) / 100: 2 ondalık basamağa yuvarlar
       *   Örnek: 40.123456 → 40.12
       */
      let savingsRate = 0;
      if (monthlyIncome > 0) {
        savingsRate = ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100;
        savingsRate = Math.round(savingsRate * 100) / 100; // 2 decimal
      }

      /**
       * ADIM 5: Tüm Verileri Birleştir ve Döndür
       * 
       * current_balance: Mevcut bakiye (tüm zamanlar net bakiye)
       * monthly_income: Bu ayki toplam gelir
       * monthly_expense: Bu ayki toplam gider
       * savings_rate: Tasarruf oranı (%)
       */
      return {
        current_balance: currentBalance,
        monthly_income: monthlyIncome,
        monthly_expense: monthlyExpense,
        savings_rate: savingsRate,
      };
    } catch (error) {
      /**
       * Hata Yakalama Bloğu
       * 
       * Eğer yukarıdaki kod içinde herhangi bir hata oluşursa,
       * bu blok çalışır.
       */
      ErrorHandler.handleError(
        error,
        this.logger,
        'getSummary',
        'Özet verileri getirilirken bir hata oluştu',
      );
    }
  }
}

