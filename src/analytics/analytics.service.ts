import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    // Tüm zamanlar toplam gelir/gider
    const [totalIncomeResult, totalExpenseResult] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: 'income',
        },
        _sum: {
          amount: true,
        },
      }),
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

    const totalIncome = totalIncomeResult._sum.amount?.toNumber() || 0;
    const totalExpense = totalExpenseResult._sum.amount?.toNumber() || 0;
    const netBalance = totalIncome - totalExpense;

    // Aylık trendler (son 6 ay)
    const monthlyTrends = await this.getMonthlyTrends(userId, 6);

    // Kategori dağılımı
    const categoryBreakdown = await this.getCategoryBreakdown(userId);

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
  }

  async getSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Bu ayki gelir/gider
    const [monthlyIncomeResult, monthlyExpenseResult, totalIncomeResult, totalExpenseResult] =
      await Promise.all([
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
        this.prisma.transaction.aggregate({
          where: {
            userId,
            type: 'income',
          },
          _sum: {
            amount: true,
          },
        }),
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

    const monthlyIncome = monthlyIncomeResult._sum.amount?.toNumber() || 0;
    const monthlyExpense = monthlyExpenseResult._sum.amount?.toNumber() || 0;
    const totalIncome = totalIncomeResult._sum.amount?.toNumber() || 0;
    const totalExpense = totalExpenseResult._sum.amount?.toNumber() || 0;
    const currentBalance = totalIncome - totalExpense;

    // Tasarruf oranı hesapla
    let savingsRate = 0;
    if (monthlyIncome > 0) {
      savingsRate = ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100;
      savingsRate = Math.round(savingsRate * 100) / 100; // 2 decimal
    }

    // En çok kullanılan kategoriler (top 5)
    const topCategories = await this.getTopCategories(userId, 5);

    return {
      current_balance: currentBalance,
      monthly_income: monthlyIncome,
      monthly_expense: monthlyExpense,
      savings_rate: savingsRate,
      top_categories: topCategories,
    };
  }

  /**
   * Aylık trendleri hesapla (son N ay)
   */
  private async getMonthlyTrends(userId: string, months: number = 6) {
    const trends: Array<{ month: string; income: number; expense: number }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
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

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const [incomeResult, expenseResult] = await Promise.all([
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

      trends.push({
        month: monthKey,
        income: incomeResult._sum.amount?.toNumber() || 0,
        expense: expenseResult._sum.amount?.toNumber() || 0,
      });
    }

    return trends;
  }

  /**
   * Kategori dağılımını hesapla
   */
  private async getCategoryBreakdown(userId: string) {
    // Gelir kategorileri
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

    // Gider kategorileri
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

    // Toplam gelir/gider hesapla
    const totalIncome = incomeCategories.reduce(
      (sum: number, cat: any) => sum + (cat._sum.amount?.toNumber() || 0),
      0,
    );
    const totalExpense = expenseCategories.reduce(
      (sum: number, cat: any) => sum + (cat._sum.amount?.toNumber() || 0),
      0,
    );

    // Kategori isimlerini al
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

    // Gelir kategorileri için breakdown
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

    // Gider kategorileri için breakdown
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

    return [...incomeBreakdown, ...expenseBreakdown];
  }

  /**
   * En çok kullanılan kategorileri getir
   */
  private async getTopCategories(userId: string, limit: number = 5) {
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

    // Kategori isimlerini al
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

    return categories.map((cat: any) => ({
      name: categoryMap.get(cat.categoryId) || 'Bilinmeyen',
      amount: cat._sum.amount?.toNumber() || 0,
      type: cat.type,
    }));
  }
}

