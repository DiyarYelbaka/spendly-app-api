// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// Logger: Loglama (kayıt tutma) için
import { Injectable, Logger, BadRequestException } from '@nestjs/common';

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
  SeedDataQueryDto,
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
   * @param userId - Kullanıcı ID'si
   * @param query - Rapor sorgu parametreleri
   * @returns Kategori bazlı rapor verileri ve sayfalama bilgileri
   */
  async getReportsCategories(userId: string, query: ReportsCategoriesQueryDto) {
    try {
      const startDate = new Date(query.start_date);
      const endDate = new Date(query.end_date);
      endDate.setHours(23, 59, 59, 999);

      const { page, limit, skip } = parsePagination(query.page, query.results);

      // Belirtilen tiplere göre kategori istatistiklerini hesapla
      const typesToFetch = query.type ? [query.type] : ['income', 'expense'];
      const categoriesWithStats = await this._getAggregatedCategoryStats(
        userId,
        startDate,
        endDate,
        typesToFetch,
      );

      // Sayfalama uygula ve sonucu formatla
      const total = categoriesWithStats.length;
      const paginatedItems = categoriesWithStats.slice(skip, skip + limit);
      const pagination = createPaginationResult(total, page, limit);

      return {
        items: paginatedItems,
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
   * getReportsTrends: Trend verileri (saatlik, günlük, haftalık, aylık veya işlem bazlı)
   *
   * @param userId - Kullanıcı ID'si
   * @param query - Rapor sorgu parametreleri
   * @returns Trend verileri ve sayfalama bilgileri
   */
  async getReportsTrends(userId: string, query: ReportsTrendsQueryDto) {
    try {
      const startDate = new Date(query.start_date);
      const endDate = new Date(query.end_date);
      endDate.setHours(23, 59, 59, 999);

      const { page, limit, skip } = parsePagination(query.page, query.results);

      // Tüm işlemleri veritabanından çekerken en yeniden en eskiye sırala
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
        orderBy: {
          date: 'desc', // En yeniden en eskiye sırala
        },
      });

      // Periyoda göre uygun raporlama fonksiyonunu çağır
      let items: any[];
      switch (query.period) {
        case ReportPeriod.HOURLY:
          items = this._getHourlyReport(transactions);
          break;
        case ReportPeriod.DAILY:
          items = this._getDailyReport(transactions);
          break;
        case ReportPeriod.WEEKLY:
          items = this._getWeeklyReport(transactions);
          break;
        case ReportPeriod.MONTHLY:
          items = this._getMonthlyReport(transactions);
          break;
        default:
          items = this._getTransactionalReport(transactions);
          break;
      }

      // Sayfalama uygula ve sonucu formatla
      const total = items.length;
      const paginatedItems = items.slice(skip, skip + limit);
      const pagination = createPaginationResult(total, page, limit);

      return {
        granularity: query.period || 'transaction',
        start_date: query.start_date.split('T')[0],
        end_date: query.end_date.split('T')[0],
        items: paginatedItems,
        pagination,
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'getReportsTrends',
        'Trend verileri getirilirken bir hata oluştu',
      );
    }
  }

  // ===================================================================================
  // PRIVATE HELPER METHODS
  // ===================================================================================

  /**
   * Belirtilen işlem tipleri için kategori istatistiklerini toplar ve işler.
   *
   * @param userId - Kullanıcı ID'si
   * @param startDate - Başlangıç tarihi
   * @param endDate - Bitiş tarihi
   * @param types - İşlem tipleri dizisi (['income'], ['expense'], veya ['income', 'expense'])
   * @returns İşlenmiş ve sıralanmış kategori istatistikleri
   */
  private async _getAggregatedCategoryStats(
    userId: string,
    startDate: Date,
    endDate: Date,
    types: string[],
  ) {
    // 1. Her tip için paralel olarak 'groupBy' sorgusu çalıştır
    const statsPromises = types.map((type) =>
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, type, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
        _count: true,
      }),
    );
    const statsResults = await Promise.all(statsPromises);
    const allStats = statsResults.flat().map((stat, index) => ({
      ...stat,
      type: types[Math.floor(index / statsResults[0].length)], // Hangi tipe ait olduğunu ekle
    }));

    if (allStats.length === 0) return [];

    // 2. İlgili tüm kategorileri tek seferde veritabanından çek
    const categoryIds = allStats.map((stat) => stat.categoryId).filter(Boolean);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds }, userId },
    });

    // 3. Verileri bellekte birleştir ve işle
    const totalAmount = allStats.reduce(
      (sum, stat) => sum + (stat._sum.amount?.toNumber() || 0),
      0,
    );

    return categories
      .map((category) => {
        const stat = allStats.find(
          (s) => s.categoryId === category.id && s.type === category.type,
        );
        const amount = stat?._sum.amount?.toNumber() || 0;
        return {
          ...formatCategory(category),
          total_amount: amount,
          transaction_count: stat?._count || 0,
          percentage:
            totalAmount > 0
              ? Math.round((amount / totalAmount) * 100 * 100) / 100
              : 0,
        };
      })
      .filter((item) => item.total_amount > 0)
      .sort((a, b) => b.total_amount - a.total_amount);
  }

  /**
   * İşlem listesini formatlar.
   * @param transactions - Veritabanından çekilen işlem verileri
   * @returns Formatlanmış işlem listesi
   */
  private _getTransactionalReport(transactions: any[]) {
    return transactions.map((t) => {
      const tDate = typeof t.date === 'string' ? new Date(t.date) : t.date;

      const year = tDate.getFullYear();
      const month = (tDate.getMonth() + 1).toString().padStart(2, '0');
      const day = tDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const hour = tDate.getHours().toString().padStart(2, '0');
      const minute = tDate.getMinutes().toString().padStart(2, '0');
      const second = tDate.getSeconds().toString().padStart(2, '0');
      const timeStr = `${hour}:${minute}:${second}`;
      const amount = t.amount.toNumber();

      return {
        date: dateStr,
        period: timeStr,
        type: t.type,
        amount,
        income: t.type === 'income' ? amount : 0,
        expense: t.type === 'expense' ? amount : 0,
        net: t.type === 'income' ? amount : -amount,
      };
    });
  }

  /**
   * Saatlik trend raporu oluşturur.
   * @param transactions - Veritabanından çekilen işlem verileri
   * @returns Saatlik gruplanmış rapor
   */
  private _getHourlyReport(transactions: any[]) {
    const hourlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const tDate = typeof t.date === 'string' ? new Date(t.date) : t.date;
      const year = tDate.getFullYear();
      const month = (tDate.getMonth() + 1).toString().padStart(2, '0');
      const day = tDate.getDate().toString().padStart(2, '0');
      const hour = tDate.getHours().toString().padStart(2, '0');
      const key = `${year}-${month}-${day} ${hour}`;

      if (!hourlyMap.has(key)) {
        hourlyMap.set(key, { income: 0, expense: 0 });
      }

      const hourData = hourlyMap.get(key)!;
      const amount = t.amount.toNumber();
      if (t.type === 'income') {
        hourData.income += amount;
      } else {
        hourData.expense += amount;
      }
    });

    return Array.from(hourlyMap.entries())
      .map(([key, data]) => {
        const [date, hour] = key.split(' ');
        return {
          date: date,
          period: `${hour}:00:00`,
          income: data.income,
          expense: data.expense,
          net: data.income - data.expense,
        };
      })
      .sort((a, b) => (b.date + b.period).localeCompare(a.date + a.period));
  }

  /**
   * Günlük trend raporu oluşturur.
   * @param transactions - Veritabanından çekilen işlem verileri
   * @returns Günlük gruplanmış rapor
   */
  private _getDailyReport(transactions: any[]) {
    const dailyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const tDate = typeof t.date === 'string' ? new Date(t.date) : t.date;
      const year = tDate.getFullYear();
      const month = (tDate.getMonth() + 1).toString().padStart(2, '0');
      const day = tDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { income: 0, expense: 0 });
      }

      const dayData = dailyMap.get(dateStr)!;
      const amount = t.amount.toNumber();
      if (t.type === 'income') {
        dayData.income += amount;
      } else {
        dayData.expense += amount;
      }
    });

    return Array.from(dailyMap.entries())
      .map(([dateStr, data]) => ({
        date: dateStr,
        period: '00:00:00',
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Haftalık trend raporu oluşturur.
   * @param transactions - Veritabanından çekilen işlem verileri
   * @returns Haftalık gruplanmış rapor
   */
  private _getWeeklyReport(transactions: any[]) {
    const weeklyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const tDate = typeof t.date === 'string' ? new Date(t.date) : t.date;
      const year = tDate.getFullYear();
      const month = tDate.getMonth();
      const day = tDate.getDate();

      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStartDate = new Date(date);
      weekStartDate.setDate(weekStartDate.getDate() + mondayOffset);

      const weekYear = weekStartDate.getFullYear();
      const weekMonth = (weekStartDate.getMonth() + 1).toString().padStart(2, '0');
      const weekDay = weekStartDate.getDate().toString().padStart(2, '0');
      const weekKey = `${weekYear}-${weekMonth}-${weekDay}`;

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

    return Array.from(weeklyMap.entries())
      .map(([dateStr, data]) => ({
        date: dateStr,
        period: '00:00:00',
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Aylık trend raporu oluşturur.
   * @param transactions - Veritabanından çekilen işlem verileri
   * @returns Aylık gruplanmış rapor
   */
  private _getMonthlyReport(transactions: any[]) {
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const tDate = typeof t.date === 'string' ? new Date(t.date) : t.date;
      const year = tDate.getFullYear();
      const month = (tDate.getMonth() + 1).toString().padStart(2, '0');
      const monthKey = `${year}-${month}-01`;

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

    return Array.from(monthlyMap.entries())
      .map(([dateStr, data]) => ({
        date: dateStr,
        period: '00:00:00',
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Test verisi oluşturur.
   * 
   * @param userId - Kullanıcı ID'si
   * @param options - Veri oluşturma seçenekleri (yıl, ay, ay sayısı)
   * @returns Oluşturulan veri hakkında özet bilgi
   */
  async seedTestData(userId: string, options: SeedDataQueryDto) {
    try {
      // 1. Kategorileri Çek
      const { incomeCategories, expenseCategories } = await this._getSeedCategories(userId);

      // 2. Tarih Aralığını Belirle
      const dateRanges = this._getSeedDateRanges(options);
      
      let transactions = [];
      
      // 3. Her ay için işlem oluştur
      for (const { year, month } of dateRanges) {
        // Ayın belirli günlerinde düzenli gelir/gider ekle
        this._createFixedTransactions(transactions, userId, year, month, incomeCategories, expenseCategories);

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(year, month, day);
          const dayOfWeek = currentDate.getDay(); // 0: Pazar, 6: Cumartesi

          // Günlerin %80'inde işlem olsun
          if (Math.random() < 0.8) {
            // Hafta içi (1-5) daha fazla, hafta sonu (0,6) daha az işlem
            const transactionsPerDay = (dayOfWeek > 0 && dayOfWeek < 6)
              ? Math.floor(Math.random() * 4) + 2 // 2-5 arası
              : Math.floor(Math.random() * 3) + 1; // 1-3 arası

            for (let i = 0; i < transactionsPerDay; i++) {
              const transaction = this._createRandomTransaction(userId, currentDate, incomeCategories, expenseCategories);
              if (transaction) {
                transactions.push(transaction);
              }
            }
          }
        }
      }

      // 4. Verileri Toplu Halde Kaydet
      if (transactions.length > 0) {
        await this.prisma.transaction.createMany({
          data: transactions,
          skipDuplicates: true,
        });
      }

      return {
        success: true,
        message: 'Test verileri başarıyla oluşturuldu.',
        created_transactions: transactions.length,
        date_range: `${dateRanges[0].year}-${dateRanges[0].month + 1} to ${dateRanges[dateRanges.length - 1].year}-${dateRanges[dateRanges.length - 1].month + 1}`,
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'seedTestData',
        'Test verileri oluşturulurken bir hata oluştu',
      );
    }
  }

  /**
   * Test verisi için gelir ve gider kategorilerini çeker.
   */
  private async _getSeedCategories(userId: string) {
    const categories = await this.prisma.category.findMany({
      where: { userId, isActive: true },
    });
    if (categories.length === 0) {
      throw new BadRequestException('Lütfen önce en az bir kategori oluşturun.');
    }
    const incomeCategories = categories.filter((c) => c.type === 'income');
    const expenseCategories = categories.filter((c) => c.type === 'expense');
    if (incomeCategories.length === 0 || expenseCategories.length === 0) {
      throw new BadRequestException('Lütfen hem gelir hem de gider tipi için en az birer kategori oluşturun.');
    }
    return { incomeCategories, expenseCategories };
  }

  /**
   * Test verisi için tarih aralıklarını belirler.
   */
  private _getSeedDateRanges(options: SeedDataQueryDto) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (options.year && options.month) {
      return [{ year: options.year, month: options.month - 1 }];
    }
    
    const monthsToGenerate = options.months || 3;
    const dateRanges = [];
    for (let i = 0; i < monthsToGenerate; i++) {
      const date = new Date(currentYear, currentMonth - i, 1);
      dateRanges.push({ year: date.getFullYear(), month: date.getMonth() });
    }
    return dateRanges.reverse();
  }

  /**
   * Her ayın belirli günlerinde sabit (maaş, kira gibi) işlemler oluşturur.
   */
  private _createFixedTransactions(
    transactions: any[],
    userId: string,
    year: number,
    month: number,
    incomeCategories: any[],
    expenseCategories: any[],
  ) {
    // Maaş kategorisini bul veya ilk gelir kategorisini kullan
    const salaryCategory = 
      incomeCategories.find(c => c.name.toLowerCase().includes('maaş')) || 
      incomeCategories[0];
      
    if (salaryCategory) {
      transactions.push({
        userId,
        categoryId: salaryCategory.id,
        amount: Math.floor(Math.random() * 10000) + 15000, // 15000 - 25000 arası
        type: 'income',
        description: 'Aylık Maaş',
        date: new Date(year, month, 1, 9, 30, 0),
        notes: 'Otomatik oluşturulmuş test verisi',
      });
    }

    // Kira kategorisini bul veya ilk gider kategorisini kullan
    const rentCategory = 
      expenseCategories.find(c => c.name.toLowerCase().includes('kira')) || 
      expenseCategories[0];
      
    if (rentCategory) {
      transactions.push({
        userId,
        categoryId: rentCategory.id,
        amount: Math.floor(Math.random() * 3000) + 5000, // 5000 - 8000 arası
        type: 'expense',
        description: 'Aylık Kira Ödemesi',
        date: new Date(year, month, 5, 11, 0, 0),
        notes: 'Otomatik oluşturulmuş test verisi',
      });
    }
  }

  /**
   * Rastgele bir işlem oluşturur (gelir veya gider).
   */
  private _createRandomTransaction(
    userId: string,
    date: Date,
    incomeCategories: any[],
    expenseCategories: any[],
  ) {
    const dayOfWeek = date.getDay();

    // Saati günün mantıklı zaman dilimlerine yay
    let hour: number;
    if (dayOfWeek > 0 && dayOfWeek < 6) { // Hafta içi
      hour = (Math.random() < 0.3) 
        ? Math.floor(Math.random() * 2) + 8 // %30 ihtimalle sabah (8-9)
        : Math.floor(Math.random() * 10) + 12; // %70 ihtimalle öğleden sonra/akşam (12-21)
    } else { // Hafta sonu
      hour = Math.floor(Math.random() * 12) + 11; // 11:00 - 22:00 arası
    }
    
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, second);

    // Hafta sonu gelir olma ihtimali daha düşük
    const isIncome = (dayOfWeek === 0 || dayOfWeek === 6) ? Math.random() < 0.05 : Math.random() < 0.1;

    if (isIncome && incomeCategories.length > 0) {
      const category = incomeCategories.find(c => !c.name.toLowerCase().includes('maaş')) || incomeCategories[0];
      return {
        userId,
        categoryId: category.id,
        amount: Math.floor(Math.random() * 1500) + 100, // 100 - 1600 arası ek gelir
        type: 'income',
        description: `Ek Gelir #${Math.floor(Math.random() * 100)}`,
        date: transactionDate,
        notes: 'Otomatik oluşturulmuş test verisi',
      };
    } else if (expenseCategories.length > 0) {
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      return {
        userId,
        categoryId: category.id,
        amount: Math.floor(Math.random() * 400) + 10, // 10 - 410 arası harcama
        type: 'expense',
        description: `${category.name} harcaması #${Math.floor(Math.random() * 100)}`,
        date: transactionDate,
        notes: 'Otomatik oluşturulmuş test verisi',
      };
    }
    return null;
  }
}

