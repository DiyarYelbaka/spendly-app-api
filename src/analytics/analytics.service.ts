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
   * getDashboard: Dashboard verilerini getiren fonksiyon
   * 
   * Bu fonksiyon, kullanıcının dashboard (kontrol paneli) için gerekli tüm analitik verilerini hesaplar.
   * 
   * @param userId: string - Kullanıcının benzersiz ID'si
   *   Bu ID, sadece bu kullanıcının verilerini getirmek için kullanılır
   * 
   * @returns Promise<DashboardData> - Dashboard verileri
   *   - summary: Özet bilgiler (toplam gelir, gider, net bakiye)
   *   - monthly_trends: Aylık trendler (son 6 ay)
   *   - category_breakdown: Kategori bazında dağılım
   * 
   * İş Akışı:
   * 1. Tüm zamanlar toplam gelir ve gider hesaplanır (paralel olarak)
   * 2. Net bakiye hesaplanır (gelir - gider)
   * 3. Son 6 ayın aylık trendleri hesaplanır
   * 4. Kategori bazında dağılım hesaplanır
   * 5. Tüm veriler birleştirilip döndürülür
   */
  async getDashboard(userId: string) {
    // try-catch: Hata yakalama bloğu
    // Eğer kod içinde bir hata oluşursa, catch bloğuna düşer
    try {
      /**
       * ADIM 1: Tüm Zamanlar Toplam Gelir ve Gider Hesapla
       * 
       * Promise.all(): Birden fazla asenkron işlemi paralel olarak çalıştırır
       *   Bu sayede performans artar (iki sorgu aynı anda çalışır)
       * 
       * aggregate(): Veritabanında toplama (aggregation) işlemi yapar
       *   _sum: Belirtilen alanların toplamını hesaplar
       *   where: Filtreleme kriterleri
       *     - userId: Sadece bu kullanıcının işlemlerine bak
       *     - type: 'income' veya 'expense' (gelir veya gider)
       * 
       * totalIncomeResult: Tüm gelir işlemlerinin toplam tutarı
       * totalExpenseResult: Tüm gider işlemlerinin toplam tutarı
       * 
       * await: Her iki sorgunun da tamamlanmasını bekler
       */
      const [totalIncomeResult, totalExpenseResult] = await Promise.all([
        // Gelir işlemlerinin toplamını hesapla
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'income',
          },
          _sum: {
            amount: true,
          },
        }),
        // Gider işlemlerinin toplamını hesapla
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
       * ADIM 2: Toplamları Sayıya Çevir ve Net Bakiyeyi Hesapla
       * 
       * toNumber(): Prisma'nın Decimal tipini JavaScript number'a çevirir
       *   Prisma, para miktarlarını Decimal tipinde saklar (hassasiyet için)
       *   Ancak JavaScript'te number olarak kullanmak daha kolaydır
       * 
       * || 0: Eğer sonuç null veya undefined ise, 0 kullan
       *   Bu durum, hiç işlem yoksa oluşur
       * 
       * netBalance: Net bakiye = Toplam gelir - Toplam gider
       *   Pozitif ise → Kullanıcı kazançta
       *   Negatif ise → Kullanıcı zararda
       */
      const totalIncome = totalIncomeResult._sum.amount?.toNumber() || 0;
      const totalExpense = totalExpenseResult._sum.amount?.toNumber() || 0;
      const netBalance = totalIncome - totalExpense;

      /**
       * ADIM 3: Aylık Trendleri Hesapla
       * 
       * getMonthlyTrends(): Son 6 ayın aylık gelir ve gider trendlerini hesaplar
       *   Bu fonksiyon, her ay için gelir ve gider toplamlarını döndürür
       * 
       * userId: Sadece bu kullanıcının verilerini getir
       * 6: Son 6 ayın verilerini getir
       */
      const monthlyTrends = await this.getMonthlyTrends(userId, 6);

      /**
       * ADIM 4: Kategori Dağılımını Hesapla
       * 
       * getCategoryBreakdown(): Kategori bazında gelir ve gider dağılımını hesaplar
       *   Bu fonksiyon, her kategori için toplam tutar ve yüzdeyi döndürür
       * 
       * userId: Sadece bu kullanıcının verilerini getir
       */
      const categoryBreakdown = await this.getCategoryBreakdown(userId);

      /**
       * ADIM 5: Tüm Verileri Birleştir ve Döndür
       * 
       * summary: Özet bilgiler
       *   - total_income: Tüm zamanlar toplam gelir (snake_case - backend formatı)
       *   - total_expense: Tüm zamanlar toplam gider (snake_case)
       *   - net_balance: Net bakiye (snake_case)
       *   - netIncome, totalIncome, totalExpense: Frontend uyumu için camelCase formatı
       *     Frontend bazı yerlerde camelCase bekliyor, bu yüzden her iki format da sağlanıyor
       * 
       * monthly_trends: Aylık trendler (son 6 ay)
       * category_breakdown: Kategori bazında dağılım
       */
      return {
        summary: {
          total_income: totalIncome,
          total_expense: totalExpense,
          net_balance: netBalance,
          // Frontend uyumu için camelCase de ekle
          netIncome: netBalance,
          totalIncome: totalIncome,
          totalExpense: totalExpense,
        },
        monthly_trends: monthlyTrends,
        category_breakdown: categoryBreakdown,
      };
    } catch (error) {
      /**
       * Hata Yakalama Bloğu
       * 
       * Eğer yukarıdaki kod içinde herhangi bir hata oluşursa (örneğin: veritabanı hatası),
       * bu blok çalışır.
       * 
       * ErrorHandler.handleError: Hataları yönetmek için kullanılan yardımcı fonksiyon
       *   - error: Oluşan hata nesnesi
       *   - this.logger: Hataları loglamak için logger
       *   - 'getDashboard': Hatanın hangi işlem sırasında oluştuğunu belirtir
       *   - 'Dashboard verileri getirilirken bir hata oluştu': Kullanıcıya gösterilecek mesaj
       */
      ErrorHandler.handleError(
        error,
        this.logger,
        'getDashboard',
        'Dashboard verileri getirilirken bir hata oluştu',
      );
    }
  }

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
   *   - top_categories: En çok kullanılan kategoriler (top 5)
   * 
   * İş Akışı:
   * 1. Bu ayın başlangıç ve bitiş tarihleri hesaplanır
   * 2. Bu ayki gelir ve gider hesaplanır (paralel olarak)
   * 3. Tüm zamanlar toplam gelir ve gider hesaplanır (paralel olarak)
   * 4. Mevcut bakiye hesaplanır
   * 5. Tasarruf oranı hesaplanır
   * 6. En çok kullanılan kategoriler bulunur
   * 7. Tüm veriler birleştirilip döndürülür
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
       * ADIM 5: En Çok Kullanılan Kategorileri Bul
       * 
       * getTopCategories(): En çok kullanılan kategorileri getirir
       *   Kategoriler, toplam tutara göre sıralanır (en yüksekten en düşüğe)
       * 
       * userId: Sadece bu kullanıcının verilerini getir
       * 5: En çok kullanılan 5 kategoriyi getir
       */
      const topCategories = await this.getTopCategories(userId, 5);

      /**
       * ADIM 6: Tüm Verileri Birleştir ve Döndür
       * 
       * current_balance: Mevcut bakiye (tüm zamanlar net bakiye)
       * monthly_income: Bu ayki toplam gelir
       * monthly_expense: Bu ayki toplam gider
       * savings_rate: Tasarruf oranı (%)
       * top_categories: En çok kullanılan kategoriler (top 5)
       */
      return {
        current_balance: currentBalance,
        monthly_income: monthlyIncome,
        monthly_expense: monthlyExpense,
        savings_rate: savingsRate,
      top_categories: topCategories,
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

  /**
   * getMonthlyTrends: Aylık trendleri hesaplayan özel fonksiyon
   * 
   * Bu fonksiyon, son N ayın aylık gelir ve gider trendlerini hesaplar.
   * Trend, her ay için gelir ve gider toplamlarını gösterir.
   * 
   * @param userId: string - Kullanıcının benzersiz ID'si
   * @param months: number - Kaç ayın trendini hesaplayacağı (varsayılan: 6)
   * 
   * @returns Promise<Array<{month: string, income: number, expense: number}>>
   *   Her ay için:
   *   - month: Ay anahtarı (örneğin: "2025-01")
   *   - income: O ayki toplam gelir
   *   - expense: O ayki toplam gider
   * 
   * private: Bu fonksiyon sadece bu sınıf içinde kullanılabilir
   *   Dışarıdan (controller'dan) çağrılamaz, sadece service içinde kullanılır
   * 
   * İş Akışı:
   * 1. Son N ayın her biri için döngü başlatılır
   * 2. Her ayın başlangıç ve bitiş tarihleri hesaplanır
   * 3. O ayki gelir ve gider toplamları hesaplanır (paralel olarak)
   * 4. Sonuçlar birleştirilip döndürülür
   */
  private async getMonthlyTrends(userId: string, months: number = 6) {
    /**
     * trends: Aylık trend verilerini saklayan dizi
     * 
     * Bu dizi, her ay için gelir ve gider bilgilerini içerir.
     * Örnek: [
     *   { month: "2025-01", income: 5000, expense: 3000 },
     *   { month: "2025-02", income: 6000, expense: 4000 },
     *   ...
     * ]
     */
    const trends: Array<{ month: string; income: number; expense: number }> = [];
    
    /**
     * now: Şu anki tarih ve saat
     * 
     * Bu tarih, hangi aydan geriye doğru gideceğimizi belirler.
     */
    const now = new Date();

    /**
     * ADIM 1: Son N Ay İçin Döngü
     * 
     * for (let i = months - 1; i >= 0; i--):
     *   - i = months - 1: En eski ay (örneğin: 6 ay için i = 5, yani 5 ay önce)
     *   - i >= 0: En yeni aya kadar (i = 0, yani bu ay)
     *   - i--: Her döngüde i'yi 1 azalt (geriye doğru gider)
     * 
     * Örnek (6 ay için):
     *   - i = 5 → 5 ay önceki ay
     *   - i = 4 → 4 ay önceki ay
     *   - ...
     *   - i = 0 → Bu ay
     */
    for (let i = months - 1; i >= 0; i--) {
      /**
       * ADIM 2: İlgili Ayın Tarihini Hesapla
       * 
       * date: İlgili ayın ilk günü
       *   - now.getFullYear(): Şu anki yıl (örneğin: 2025)
       *   - now.getMonth() - i: İlgili ay (örneğin: i = 5 ise 5 ay önceki ay)
       *   - 1: Ayın 1. günü
       * 
       * startOfMonth: Ayın ilk günü (00:00:00)
       * endOfMonth: Ayın son günü (23:59:59)
       */
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      /**
       * ADIM 3: Ay Anahtarını Oluştur
       * 
       * monthKey: Ayı temsil eden string (örneğin: "2025-01", "2025-02")
       *   - date.getFullYear(): Yıl (örneğin: 2025)
       *   - date.getMonth() + 1: Ay (1-12 arası, +1 çünkü getMonth() 0-11 döndürür)
       *   - padStart(2, '0'): Ayı 2 haneli yapar (örneğin: "1" → "01", "12" → "12")
       * 
       * Bu format, ayları sıralamak ve karşılaştırmak için kullanılır.
       */
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      /**
       * ADIM 4: O Ayki Gelir ve Gider Toplamlarını Hesapla
       * 
       * Promise.all(): İki sorguyu paralel olarak çalıştırır
       *   Bu sayede performans artar
       * 
       * aggregate(): O ayki işlemlerin toplamını hesaplar
       *   where.date: Sadece o ayki işlemlere bak
       *     - gte: Ayın başından itibaren
       *     - lte: Ayın sonuna kadar
       */
      const [incomeResult, expenseResult] = await Promise.all([
        // O ayki gelir işlemlerinin toplamını hesapla
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
        // O ayki gider işlemlerinin toplamını hesapla
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
      ]);

      /**
       * ADIM 5: Sonuçları Diziye Ekle
       * 
       * trends.push(): Hesaplanan verileri trends dizisine ekler
       *   - month: Ay anahtarı (örneğin: "2025-01")
       *   - income: O ayki toplam gelir
       *   - expense: O ayki toplam gider
       */
      trends.push({
        month: monthKey,
        income: incomeResult._sum.amount?.toNumber() || 0,
        expense: expenseResult._sum.amount?.toNumber() || 0,
      });
    }

    /**
     * ADIM 6: Tüm Trend Verilerini Döndür
     * 
     * return: Tüm ayların trend verilerini içeren dizi
     *   Bu dizi, en eski aydan en yeni aya doğru sıralanmıştır
     */
    return trends;
  }

  /**
   * getCategoryBreakdown: Kategori dağılımını hesaplayan özel fonksiyon
   * 
   * Bu fonksiyon, kategori bazında gelir ve gider dağılımını hesaplar.
   * Her kategori için toplam tutar ve yüzde hesaplanır.
   * 
   * @param userId: string - Kullanıcının benzersiz ID'si
   * 
   * @returns Promise<Array<{category: string, amount: number, percentage: number, type: string}>>
   *   Her kategori için:
   *   - category: Kategori adı
   *   - amount: O kategoriye ait toplam tutar
   *   - percentage: Toplam içindeki yüzdesi
   *   - type: İşlem tipi ('income' veya 'expense')
   * 
   * private: Bu fonksiyon sadece bu sınıf içinde kullanılabilir
   * 
   * İş Akışı:
   * 1. Gelir kategorileri gruplanır (kategori bazında toplam)
   * 2. Gider kategorileri gruplanır (kategori bazında toplam)
   * 3. Toplam gelir ve gider hesaplanır
   * 4. Kategori isimleri veritabanından alınır
   * 5. Her kategori için yüzde hesaplanır
   * 6. Sonuçlar birleştirilip döndürülür
   */
  private async getCategoryBreakdown(userId: string) {
    /**
     * ADIM 1: Gelir Kategorilerini Grupla
     * 
     * groupBy(): Veritabanında gruplama işlemi yapar
     *   by: ['categoryId'] → Kategori ID'sine göre grupla
     *   where: Sadece bu kullanıcının gelir işlemlerine bak
     *   _sum: Her kategori için toplam tutarı hesapla
     * 
     * Sonuç: Her kategori için toplam tutar
     * Örnek: [
     *   { categoryId: "cat1", _sum: { amount: 5000 } },
     *   { categoryId: "cat2", _sum: { amount: 3000 } }
     * ]
     */
    const incomeCategories = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'income',
      },
      _sum: {
        amount: true,
      },
    });

    /**
     * ADIM 2: Gider Kategorilerini Grupla
     * 
     * Aynı işlem, bu sefer gider işlemleri için yapılır.
     */
    const expenseCategories = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'expense',
      },
      _sum: {
        amount: true,
      },
    });

    /**
     * ADIM 3: Toplam Gelir ve Gider Hesapla
     * 
     * reduce(): Dizideki tüm elemanları toplar
     *   - sum: Toplam (başlangıç değeri: 0)
     *   - cat: Her bir kategori
     *   - cat._sum.amount?.toNumber() || 0: Kategorinin toplam tutarı (yoksa 0)
     * 
     * totalIncome: Tüm gelir kategorilerinin toplamı
     * totalExpense: Tüm gider kategorilerinin toplamı
     * 
     * Bu toplamlar, yüzde hesaplamak için kullanılır.
     */
    const totalIncome = incomeCategories.reduce(
      (sum: number, cat: any) => sum + (cat._sum.amount?.toNumber() || 0),
      0,
    );
    const totalExpense = expenseCategories.reduce(
      (sum: number, cat: any) => sum + (cat._sum.amount?.toNumber() || 0),
      0,
    );

    /**
     * ADIM 4: Kategori İsimlerini Veritabanından Al
     * 
     * categoryIds: Tüm kategori ID'lerini birleştir
     *   - incomeCategories: Gelir kategorilerinin ID'leri
     *   - expenseCategories: Gider kategorilerinin ID'leri
     *   - ... (spread operator): Dizileri birleştirir
     * 
     * findMany(): Veritabanından birden fazla kayıt bulur
     *   where.id.in: Belirtilen ID'lere sahip kategorileri bul
     *   select: Sadece id ve name alanlarını getir (performans için)
     * 
     * categoryMap: Kategori ID'sini kategori adına çevirmek için Map (harita)
     *   Map, hızlı arama için kullanılır (key-value çiftleri)
     *   Örnek: Map { "cat1" => "Maaş", "cat2" => "Yemek" }
     */
    const categoryIds = [
      ...incomeCategories.map((c: any) => c.categoryId),
      ...expenseCategories.map((c: any) => c.categoryId),
    ];
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

    /**
     * ADIM 5: Gelir Kategorileri İçin Breakdown Oluştur
     * 
     * map(): Her kategori için breakdown verisi oluşturur
     * 
     * amount: Kategorinin toplam tutarı
     * percentage: Toplam gelir içindeki yüzdesi
     *   Formül: (Kategori Tutarı / Toplam Gelir) * 100
     *   Örnek: (5000 / 10000) * 100 = %50
     * 
     * categoryMap.get(cat.categoryId): Kategori ID'sinden kategori adını bul
     *   || 'Bilinmeyen': Eğer kategori bulunamazsa "Bilinmeyen" kullan
     * 
     * Math.round(percentage * 100) / 100: 2 ondalık basamağa yuvarlar
     */
    const incomeBreakdown = incomeCategories.map((cat: any) => {
      const amount = cat._sum.amount?.toNumber() || 0;
      const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
      return {
        category: categoryMap.get(cat.categoryId) || 'Bilinmeyen',
        amount: amount,
        percentage: Math.round(percentage * 100) / 100,
        type: 'income',
      };
    });

    /**
     * ADIM 6: Gider Kategorileri İçin Breakdown Oluştur
     * 
     * Aynı işlem, bu sefer gider kategorileri için yapılır.
     * Yüzde hesaplaması, toplam gider üzerinden yapılır.
     */
    const expenseBreakdown = expenseCategories.map((cat: any) => {
      const amount = cat._sum.amount?.toNumber() || 0;
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        category: categoryMap.get(cat.categoryId) || 'Bilinmeyen',
        amount: amount,
        percentage: Math.round(percentage * 100) / 100,
        type: 'expense',
      };
    });

    /**
     * ADIM 7: Gelir ve Gider Breakdown'larını Birleştir ve Döndür
     * 
     * ... (spread operator): Dizileri birleştirir
     *   Önce gelir kategorileri, sonra gider kategorileri
     */
    return [...incomeBreakdown, ...expenseBreakdown];
  }

  /**
   * getTopCategories: En çok kullanılan kategorileri getiren özel fonksiyon
   * 
   * Bu fonksiyon, toplam tutara göre en çok kullanılan kategorileri getirir.
   * 
   * @param userId: string - Kullanıcının benzersiz ID'si
   * @param limit: number - Kaç kategori getirileceği (varsayılan: 5)
   * 
   * @returns Promise<Array<{name: string, amount: number, type: string}>>
   *   Her kategori için:
   *   - name: Kategori adı
   *   - amount: O kategoriye ait toplam tutar
   *   - type: İşlem tipi ('income' veya 'expense')
   * 
   * private: Bu fonksiyon sadece bu sınıf içinde kullanılabilir
   * 
   * İş Akışı:
   * 1. Kategorileri kategori ID ve tipine göre grupla
   * 2. Toplam tutara göre sırala (en yüksekten en düşüğe)
   * 3. İlk N kategoriyi al
   * 4. Kategori isimlerini veritabanından al
   * 5. Sonuçları formatla ve döndür
   */
  private async getTopCategories(userId: string, limit: number = 5) {
    /**
     * ADIM 1: Kategorileri Grupla ve Sırala
     * 
     * groupBy(): Kategorileri kategori ID ve tipine göre grupla
     *   by: ['categoryId', 'type'] → Hem kategori ID'si hem de tipine göre grupla
     *     Bu sayede aynı kategori hem gelir hem gider olarak ayrı ayrı görünebilir
     * 
     * orderBy: Sıralama kriteri
     *   _sum.amount: 'desc' → Toplam tutara göre azalan sırada (en yüksekten en düşüğe)
     * 
     * take: limit → Sadece ilk N kategoriyi al
     * 
     * Sonuç: En çok kullanılan N kategori (toplam tutara göre)
     */
    const categories = await this.prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: {
        userId,
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: limit,
    });

    /**
     * ADIM 2: Kategori İsimlerini Veritabanından Al
     * 
     * categoryIds: Kategori ID'lerini çıkar
     * findMany(): Bu ID'lere sahip kategorileri bul
     * categoryMap: Kategori ID'sini kategori adına çevirmek için Map
     */
    const categoryIds = categories.map((c: any) => c.categoryId);
    const categoryDetails = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const categoryMap = new Map(categoryDetails.map((c: any) => [c.id, c.name]));

    /**
     * ADIM 3: Sonuçları Formatla ve Döndür
     * 
     * map(): Her kategori için formatlanmış veri oluşturur
     *   - name: Kategori adı (categoryMap'ten alınır)
     *   - amount: Toplam tutar
     *   - type: İşlem tipi ('income' veya 'expense')
     */
    return categories.map((cat: any) => ({
      name: categoryMap.get(cat.categoryId) || 'Bilinmeyen',
      amount: cat._sum.amount?.toNumber() || 0,
      type: cat.type,
    }));
  }
}

