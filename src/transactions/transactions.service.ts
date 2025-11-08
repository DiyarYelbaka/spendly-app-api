import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async createIncome(dto: CreateTransactionDto, userId: string) {
    // Kategori kontrolü - income tipinde olmalı
    const category = await this.prisma.category.findFirst({
      where: {
        id: dto.category_id,
        userId,
        type: 'income',
      },
    });

    if (!category) {
      throw new BadRequestException({
        message: 'Geçersiz kategori veya kategori income tipinde değil',
        messageKey: 'INVALID_CATEGORY',
        error: 'BAD_REQUEST',
      });
    }

    // Tarih kontrolü (default: bugün)
    const transactionDate = dto.date ? new Date(dto.date) : new Date();

    // Tek bir kayıt oluşturulduğu için transaction'a gerek yok
    // Prisma zaten her query'yi kendi transaction'ında çalıştırır
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        type: 'income',
        description: dto.description,
        categoryId: dto.category_id,
        date: transactionDate,
        notes: dto.notes,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    return this.formatTransaction(transaction);
  }

  async createExpense(dto: CreateTransactionDto, userId: string) {
    // Kategori kontrolü - expense tipinde olmalı
    const category = await this.prisma.category.findFirst({
      where: {
        id: dto.category_id,
        userId,
        type: 'expense',
      },
    });

    if (!category) {
      throw new BadRequestException({
        message: 'Geçersiz kategori veya kategori expense tipinde değil',
        messageKey: 'INVALID_CATEGORY',
        error: 'BAD_REQUEST',
      });
    }

    // Tarih kontrolü (default: bugün)
    const transactionDate = dto.date ? new Date(dto.date) : new Date();

    // Tek bir kayıt oluşturulduğu için transaction'a gerek yok
    // Prisma zaten her query'yi kendi transaction'ında çalıştırır
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        type: 'expense',
        description: dto.description,
        categoryId: dto.category_id,
        date: transactionDate,
        notes: dto.notes,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    return this.formatTransaction(transaction);
  }

  async findAll(
    userId: string,
    query: {
      type?: string;
      category_id?: string;
      start_date?: string;
      end_date?: string;
      search?: string;
      page?: string;
      limit?: string;
    },
  ) {
    const page = parseInt(query.page || '1', 10);
    const limit = Math.min(parseInt(query.limit || '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    // Type filtresi
    if (query.type && (query.type === 'income' || query.type === 'expense')) {
      where.type = query.type;
    }

    // Category filtresi
    if (query.category_id) {
      where.categoryId = query.category_id;
    }

    // Date range filtresi
    if (query.start_date || query.end_date) {
      where.date = {};
      if (query.start_date) {
        where.date.gte = new Date(query.start_date);
      }
      if (query.end_date) {
        where.date.lte = new Date(query.end_date);
      }
    }

    // Search filtresi (description'da ara)
    if (query.search) {
      where.description = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          date: 'desc',
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((t: any) => this.formatTransaction(t)),
      pagination: {
        total,
        current_page: page,
        per_page: limit,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException({
        message: 'İşlem bulunamadı',
        messageKey: 'TRANSACTION_NOT_FOUND',
        error: 'NOT_FOUND',
      });
    }

    return this.formatTransaction(transaction);
  }

  async update(id: string, dto: UpdateTransactionDto, userId: string) {
    // İşlemi bul ve kullanıcı kontrolü yap
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundException({
        message: 'İşlem bulunamadı',
        messageKey: 'TRANSACTION_NOT_FOUND',
        error: 'NOT_FOUND',
      });
    }

    // Kategori kontrolü (eğer category_id güncelleniyorsa)
    if (dto.category_id && dto.category_id !== transaction.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.category_id,
          userId,
          type: transaction.type, // Aynı tip olmalı
        },
      });

      if (!category) {
        throw new BadRequestException({
          message: 'Geçersiz kategori veya kategori tipi uyuşmuyor',
          messageKey: 'INVALID_CATEGORY',
          error: 'BAD_REQUEST',
        });
      }
    }

    // Tek bir kayıt güncellendiği için transaction'a gerek yok
    // Prisma zaten her query'yi kendi transaction'ında çalıştırır
    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        amount: dto.amount,
        description: dto.description,
        categoryId: dto.category_id,
        date: dto.date ? new Date(dto.date) : undefined,
        notes: dto.notes,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    return this.formatTransaction(updated);
  }

  async remove(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!transaction) {
      throw new NotFoundException({
        message: 'İşlem bulunamadı',
        messageKey: 'TRANSACTION_NOT_FOUND',
        error: 'NOT_FOUND',
      });
    }

    await this.prisma.transaction.delete({
      where: { id },
    });

    return {
      message: 'İşlem başarıyla silindi',
    };
  }

  /**
   * Transaction formatını snake_case'e çevir
   */
  private formatTransaction(transaction: any) {
    return {
      id: transaction.id,
      amount: transaction.amount.toNumber(),
      type: transaction.type,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date.toISOString().split('T')[0], // YYYY-MM-DD format
      notes: transaction.notes,
      created_at: transaction.createdAt,
      ...(transaction.updatedAt && { updated_at: transaction.updatedAt }),
    };
  }
}

