// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// Logger: Loglama (kayıt tutma) için
import { Injectable, Logger } from '@nestjs/common';

// PrismaService: Veritabanı işlemlerini yapmak için
// ErrorHandler: Hataları yönetmek için
// formatCategory: Kategori formatlamak için
// parsePagination, createPaginationResult: Sayfalama için
// getDaysBetween: Tarih aralığı için
import {
  PrismaService,
  ErrorHandler,
  formatCategory,
  parsePagination,
  createPaginationResult,
  getDaysBetween,
} from '../core';

// DTO'lar: Rapor sorgu parametreleri
import {
  ReportsSummaryQueryDto,
  ReportsCategoriesQueryDto,
  ReportsTrendsQueryDto,
  ReportPeriod,
} from './dto/reports-query.dto';

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
   * getWeekNumber: ISO 8601 hafta numarasını hesaplar
   * 
   * @param date: Date - Hafta numarası hesaplanacak tarih
   * @returns number - ISO 8601 hafta numarası (1-53)
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

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

  /**
   * getReportsSummary: Tarih aralığı bazlı finansal özet
   * 
   * @param userId: string - Kullanıcı ID'si
   * @param query: ReportsSummaryQueryDto - Tarih aralığı parametreleri
   * 
   * @returns Promise<SummaryData> - Finansal özet verileri
   */
  async getReportsSummary(userId: string, query: ReportsSummaryQueryDto) {
    try {
      // Tarih formatı dönüşümü: YYYY-MM-DD string → Date object
      const startDate = new Date(query.start_date);
      const endDate = new Date(query.end_date);
      // Bitiş tarihini günün sonuna ayarla (23:59:59)
      endDate.setHours(23, 59, 59, 999);

      // Paralel aggregate: Gelir ve gider toplamları
      const [incomeResult, expenseResult] = await Promise.all([
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'income',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'expense',
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      // Decimal → number dönüşümü
      const totalIncome = incomeResult._sum.amount?.toNumber() || 0;
      const totalExpense = expenseResult._sum.amount?.toNumber() || 0;
      const netBalance = totalIncome - totalExpense;

      // Tasarruf oranı hesaplama
      let savingsRate = 0;
      if (totalIncome > 0) {
        savingsRate = (netBalance / totalIncome) * 100;
        savingsRate = Math.round(savingsRate * 100) / 100; // 2 decimal
      }

      return {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_balance: netBalance,
        savings_rate: savingsRate,
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'getReportsSummary',
        'Özet rapor verileri getirilirken bir hata oluştu',
      );
    }
  }

  /**
   * getReportsCategories: Kategori bazlı raporlar
   * 
   * @param userId: string - Kullanıcı ID'si
   * @param query: ReportsCategoriesQueryDto - Tarih aralığı ve tip parametreleri
   * 
   * @returns Promise<PaginatedDataDto> - Kategori listesi ve sayfalama bilgileri
   */
  async getReportsCategories(userId: string, query: ReportsCategoriesQueryDto) {
    try {
      // Tarih formatı dönüşümü
      const startDate = new Date(query.start_date);
      const endDate = new Date(query.end_date);
      endDate.setHours(23, 59, 59, 999);

      // Sayfalama parametrelerini işle
      const { page, limit, skip } = parsePagination(query.page, query.results);

      // Kategorilere göre grupla ve toplamları hesapla
      const categoryStats = await this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: query.type,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

      // Kategori ID'lerini topla
      const categoryIds = categoryStats.map((stat) => stat.categoryId).filter(Boolean);

      // Kategori detaylarını getir
      const categories = await this.prisma.category.findMany({
        where: {
          id: { in: categoryIds },
          userId,
          type: query.type,
        },
      });

      // Toplam tutarı hesapla (yüzde için)
      const totalAmount = categoryStats.reduce(
        (sum, stat) => sum + (stat._sum.amount?.toNumber() || 0),
        0,
      );

      // JavaScript'te birleştir, yüzde hesapla, sırala
      const categoriesWithStats = categories
        .map((category) => {
          const stat = categoryStats.find((s) => s.categoryId === category.id);
          const amount = stat?._sum.amount?.toNumber() || 0;
          return {
            ...formatCategory(category),
            total_amount: amount,
            transaction_count: stat?._count || 0,
            percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100 * 100) / 100 : 0,
          };
        })
        .sort((a, b) => b.total_amount - a.total_amount); // DESC sıralama

      // Toplam kayıt sayısı
      const total = categoriesWithStats.length;

      // Sayfalama uygula
      const paginatedCategories = categoriesWithStats.slice(skip, skip + limit);

      // Sayfalama sonuç bilgilerini oluştur
      const pagination = createPaginationResult(total, page, limit);

      return {
        items: paginatedCategories,
        pagination,
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'getReportsCategories',
        'Kategori raporları getirilirken bir hata oluştu',
      );
    }
  }

  /**
   * getReportsTrends: Trend verileri (saatlik veya günlük)
   * 
   * @param userId: string - Kullanıcı ID'si
   * @param query: ReportsTrendsQueryDto - Tarih aralığı ve periyot parametreleri
   * 
   * @returns Promise<TrendData> - Trend verileri
   */
  async getReportsTrends(userId: string, query: ReportsTrendsQueryDto) {
    try {
      // Tarih formatı dönüşümü
      const startDate = new Date(query.start_date);
      const endDate = new Date(query.end_date);
      endDate.setHours(23, 59, 59, 999);

      // Sayfalama parametrelerini işle
      const { page, limit, skip } = parsePagination(query.page, query.results);

      // Tüm işlemleri çek
      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          type: true,
          amount: true,
          date: true,
        },
      });

      if (query.period === ReportPeriod.HOURLY) {
        // HOURLY: Tarih aralığındaki her günün her saati için veri
        const days = getDaysBetween(query.start_date, query.end_date);
        const allHourlyData: any[] = [];

        // Her gün için saatlik veri oluştur
        days.forEach((dateStr) => {
          // Bu gündeki işlemleri filtrele (date alanını kullan)
          const dayTransactions = transactions.filter((t) => {
            const tDate = typeof t.date === 'string' ? new Date(t.date) : new Date(t.date);
            const tDateStr = tDate.toISOString().split('T')[0];
            return tDateStr === dateStr;
          });

          // Her saat için veri oluştur (0-23)
          for (let hour = 0; hour < 24; hour++) {
            // Bu saatteki işlemleri filtrele (date alanını kullan)
            const hourTransactions = dayTransactions.filter((t) => {
              const tDate = typeof t.date === 'string' ? new Date(t.date) : new Date(t.date);
              return tDate.getUTCHours() === hour;
            });

            // Gelir ve gider hesapla
            const income = hourTransactions
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount.toNumber(), 0);
            const expense = hourTransactions
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount.toNumber(), 0);

            // Sadece veri olan saatleri ekle (income > 0 veya expense > 0)
            if (income > 0 || expense > 0) {
              // Tarih+saat formatı: "YYYY-MM-DD HH:00"
              const datetime = `${dateStr} ${hour.toString().padStart(2, '0')}:00`;

              allHourlyData.push({
                datetime,
                income,
                expense,
                net: income - expense,
              });
            }
          }
        });

        // Toplam kayıt sayısı
        const total = allHourlyData.length;

        // Sayfalama uygula
        const paginatedData = allHourlyData.slice(skip, skip + limit);

        // Sayfalama sonuç bilgilerini oluştur
        const pagination = createPaginationResult(total, page, limit);

        return {
          granularity: 'hourly',
          start_date: query.start_date.split('T')[0],
          end_date: query.end_date.split('T')[0],
          items: paginatedData,
          pagination,
        } as any;
      } else if (query.period === ReportPeriod.DAILY) {
        // DAILY: Tarih aralığındaki her gün için günlük özet
        const days = getDaysBetween(query.start_date, query.end_date);

        const dailyData = days
          .map((dateStr) => {
            // Bu gündeki işlemleri filtrele
            const dayTransactions = transactions.filter((t) => {
              const tDateStr =
                typeof t.date === 'string'
                  ? t.date
                  : new Date(t.date).toISOString().split('T')[0];
              return tDateStr === dateStr;
            });

            // Gelir ve gider hesapla
            const income = dayTransactions
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount.toNumber(), 0);
            const expense = dayTransactions
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount.toNumber(), 0);

            return {
              date: dateStr,
              income,
              expense,
              net: income - expense,
            };
          })
          // Sadece veri olan günleri filtrele (income > 0 veya expense > 0)
          .filter((data) => data.income > 0 || data.expense > 0);

        // Toplam kayıt sayısı
        const total = dailyData.length;

        // Sayfalama uygula
        const paginatedData = dailyData.slice(skip, skip + limit);

        // Sayfalama sonuç bilgilerini oluştur
        const pagination = createPaginationResult(total, page, limit);

        return {
          granularity: 'daily',
          start_date: query.start_date.split('T')[0],
          end_date: query.end_date.split('T')[0],
          items: paginatedData,
          pagination,
        };
      } else if (query.period === ReportPeriod.WEEKLY) {
        // WEEKLY: Tarih aralığındaki her hafta için haftalık özet
        // Hafta başlangıcı: Pazartesi (ISO 8601 standardı)
        const weeklyMap = new Map<string, { income: number; expense: number }>();

        transactions.forEach((t) => {
          const tDate = typeof t.date === 'string' ? new Date(t.date) : new Date(t.date);
          const year = tDate.getFullYear();
          const month = tDate.getMonth();
          const day = tDate.getDate();

          // Haftanın başlangıcını bul (Pazartesi)
          const date = new Date(year, month, day);
          const dayOfWeek = date.getDay(); // 0 = Pazar, 1 = Pazartesi, ...
          const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pazartesi'ye kadar olan gün sayısı
          date.setDate(date.getDate() + mondayOffset);

          // Hafta anahtarı: "YYYY-WW" formatı (ISO week)
          const weekKey = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;

          if (!weeklyMap.has(weekKey)) {
            weeklyMap.set(weekKey, { income: 0, expense: 0 });
          }

          const weekData = weeklyMap.get(weekKey)!;
          const amount = t.amount.toNumber();

          if (t.type === 'income') {
            weekData.income += amount;
          } else {
            weekData.expense += amount;
          }
        });

        // Map'i array'e çevir ve sırala
        const weeklyData = Array.from(weeklyMap.entries())
          .map(([weekKey, data]) => ({
            week: weekKey,
            income: data.income,
            expense: data.expense,
            net: data.income - data.expense,
          }))
          .filter((data) => data.income > 0 || data.expense > 0)
          .sort((a, b) => a.week.localeCompare(b.week));

        // Toplam kayıt sayısı
        const total = weeklyData.length;

        // Sayfalama uygula
        const paginatedData = weeklyData.slice(skip, skip + limit);

        // Sayfalama sonuç bilgilerini oluştur
        const pagination = createPaginationResult(total, page, limit);

        return {
          granularity: 'weekly',
          start_date: query.start_date.split('T')[0],
          end_date: query.end_date.split('T')[0],
          items: paginatedData,
          pagination,
        };
      } else if (query.period === ReportPeriod.MONTHLY) {
        // MONTHLY: Tarih aralığındaki her ay için aylık özet
        const monthlyMap = new Map<string, { income: number; expense: number }>();

        transactions.forEach((t) => {
          const tDate = typeof t.date === 'string' ? new Date(t.date) : new Date(t.date);
          const year = tDate.getFullYear();
          const month = tDate.getMonth() + 1; // 1-12

          // Ay anahtarı: "YYYY-MM" formatı
          const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { income: 0, expense: 0 });
          }

          const monthData = monthlyMap.get(monthKey)!;
          const amount = t.amount.toNumber();

          if (t.type === 'income') {
            monthData.income += amount;
          } else {
            monthData.expense += amount;
          }
        });

        // Map'i array'e çevir ve sırala
        const monthlyData = Array.from(monthlyMap.entries())
          .map(([monthKey, data]) => ({
            month: monthKey,
            income: data.income,
            expense: data.expense,
            net: data.income - data.expense,
          }))
          .filter((data) => data.income > 0 || data.expense > 0)
          .sort((a, b) => a.month.localeCompare(b.month));

        // Toplam kayıt sayısı
        const total = monthlyData.length;

        // Sayfalama uygula
        const paginatedData = monthlyData.slice(skip, skip + limit);

        // Sayfalama sonuç bilgilerini oluştur
        const pagination = createPaginationResult(total, page, limit);

        return {
          granularity: 'monthly',
          start_date: query.start_date.split('T')[0],
          end_date: query.end_date.split('T')[0],
          items: paginatedData,
          pagination,
        };
      }
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'getReportsTrends',
        'Trend verileri getirilirken bir hata oluştu',
      );
    }
  }

  /**
   * seedTestData: Test verisi oluşturma fonksiyonu
   * 
   * Ekim, Kasım, Aralık ayları için rastgele gelir-gider işlemleri oluşturur.
   * Kullanıcının mevcut kategorilerini kullanır.
   * 
   * @param userId: string - Kullanıcı ID'si
   * 
   * @returns Promise<SeedResult> - Oluşturulan işlem sayıları
   */
  async seedTestData(userId: string) {
    try {
      // Kullanıcının tüm kategorilerini al
      const categories = await this.prisma.category.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      if (categories.length === 0) {
        throw new Error('Kategori bulunamadı. Önce kategori oluşturun.');
      }

      // Gelir ve gider kategorilerini ayır
      const incomeCategories = categories.filter((cat) => cat.type === 'income');
      const expenseCategories = categories.filter((cat) => cat.type === 'expense');

      if (incomeCategories.length === 0 && expenseCategories.length === 0) {
        throw new Error('Gelir veya gider kategorisi bulunamadı.');
      }

      const transactions = [];
      const months = [
        { month: 0, year: 2025, name: 'Ocak' }, // Ocak 2025
        { month: 1, year: 2025, name: 'Şubat' }, // Şubat 2025
        { month: 2, year: 2025, name: 'Mart' }, // Mart 2025
        { month: 3, year: 2025, name: 'Nisan' }, // Nisan 2025
        { month: 4, year: 2025, name: 'Mayıs' }, // Mayıs 2025
        { month: 5, year: 2025, name: 'Haziran' }, // Haziran 2025
        { month: 6, year: 2025, name: 'Temmuz' }, // Temmuz 2025
        { month: 7, year: 2025, name: 'Ağustos' }, // Ağustos 2025
        { month: 8, year: 2025, name: 'Eylül' }, // Eylül 2025
        { month: 9, year: 2025, name: 'Ekim' }, // Ekim 2025
        { month: 10, year: 2025, name: 'Kasım' }, // Kasım 2025
        { month: 11, year: 2025, name: 'Aralık' }, // Aralık 2025
      ];

      // Her ay için işlemler oluştur
      for (const monthData of months) {
        const daysInMonth = new Date(monthData.year, monthData.month + 1, 0).getDate();

        // Her gün için rastgele işlemler oluştur
        // Normal bir kullanıcı günde 2-8 işlem ekleyebilir (daha fazla veri)
        for (let day = 1; day <= daysInMonth; day++) {
          // Günlerin %90'ında en az 1 işlem olsun (daha fazla veri)
          const hasTransaction = Math.random() < 0.9;
          
          if (hasTransaction) {
            // Günde 2-8 işlem (rastgele) - daha fazla veri için
            const transactionsPerDay = Math.floor(Math.random() * 7) + 2;

            for (let t = 0; t < transactionsPerDay; t++) {
              // Rastgele saat (6-23 arası - daha geniş saat aralığı)
              const hour = Math.floor(Math.random() * 18) + 6;
              const minute = Math.floor(Math.random() * 60);
              const second = Math.floor(Math.random() * 60);

              const transactionDate = new Date(
                monthData.year,
                monthData.month,
                day,
                hour,
                minute,
                second,
              );

              // Gelir işlemi oluştur (%30 olasılık, eğer gelir kategorisi varsa)
              // Normal kullanıcılar ayda birkaç kez gelir ekler
              if (incomeCategories.length > 0 && Math.random() < 0.3) {
                const randomCategory =
                  incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
                // Gelir tutarları daha gerçekçi (2000-20000 arası) - daha geniş aralık
                const amount = Math.floor(Math.random() * 18000) + 2000;

                transactions.push({
                  amount,
                  type: 'income',
                  description: `${randomCategory.name} - ${monthData.name} ${day}`,
                  categoryId: randomCategory.id,
                  date: transactionDate,
                  userId,
                  notes: `Test verisi - ${monthData.name} ${day}`,
                });
              }

              // Gider işlemi oluştur (%80 olasılık, eğer gider kategorisi varsa)
              // Normal kullanıcılar günde birkaç gider ekler
              if (expenseCategories.length > 0 && Math.random() < 0.8) {
                const randomCategory =
                  expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
                // Gider tutarları gerçekçi (20-800 arası - küçük harcamalar daha sık)
                // Bazen büyük harcamalar da olsun (800-5000 arası - %25 olasılık)
                let amount;
                if (Math.random() < 0.25) {
                  // Büyük harcama (800-5000)
                  amount = Math.floor(Math.random() * 4200) + 800;
                } else {
                  // Küçük harcama (20-800)
                  amount = Math.floor(Math.random() * 780) + 20;
                }

                transactions.push({
                  amount,
                  type: 'expense',
                  description: `${randomCategory.name} - ${monthData.name} ${day}`,
                  categoryId: randomCategory.id,
                  date: transactionDate,
                  userId,
                  notes: `Test verisi - ${monthData.name} ${day}`,
                });
              }
            }
          }
        }
      }

      // Toplu insert (batch insert)
      if (transactions.length > 0) {
        // Prisma'da createMany kullan, ama her 100'lük gruplar halinde (performans için)
        const batchSize = 100;
        let createdCount = 0;

        for (let i = 0; i < transactions.length; i += batchSize) {
          const batch = transactions.slice(i, i + batchSize);
          await this.prisma.transaction.createMany({
            data: batch,
            skipDuplicates: true,
          });
          createdCount += batch.length;
        }

        return {
          success: true,
          message: 'Test verileri başarıyla oluşturuldu',
          created_transactions: createdCount,
          income_categories_used: incomeCategories.length,
          expense_categories_used: expenseCategories.length,
          months: months.map((m) => `${m.name} 2025`).join(', '),
        };
      } else {
        return {
          success: false,
          message: 'Hiç işlem oluşturulamadı',
          created_transactions: 0,
        };
      }
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'seedTestData',
        'Test verileri oluşturulurken bir hata oluştu',
      );
    }
  }
}

