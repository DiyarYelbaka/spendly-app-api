import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../core';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { ErrorHandler, parsePagination, createPaginationResult, formatTransaction } from '../core';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private prisma: PrismaService) {}

  async createIncome(dto: CreateTransactionDto, userId: string) {
    try {
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

      return formatTransaction(transaction);
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'createIncome',
        'Gelir işlemi oluşturulurken bir hata oluştu',
      );
    }
  }

  async createExpense(dto: CreateTransactionDto, userId: string) {
    try {
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

      return formatTransaction(transaction);
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'createExpense',
        'Gider işlemi oluşturulurken bir hata oluştu',
      );
    }
  }

  async findAll(userId: string, query: TransactionQueryDto) {
    try {
      const { page, limit, skip } = parsePagination(query.page, query.limit);

      const where: any = {
        userId,
      };

      // Type filtresi
      if (query.type) {
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
        transactions: transactions.map((t: any) => formatTransaction(t)),
        pagination: createPaginationResult(total, page, limit),
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'findAll transactions',
        'İşlemler getirilirken bir hata oluştu',
      );
    }
  }

  async findOne(id: string, userId: string) {
    try {
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

      return formatTransaction(transaction);
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'findOne transaction',
        'İşlem getirilirken bir hata oluştu',
      );
    }
  }

  async update(id: string, dto: UpdateTransactionDto, userId: string) {
    try {
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

      return formatTransaction(updated);
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'update transaction',
        'İşlem güncellenirken bir hata oluştu',
      );
    }
  }

  async remove(id: string, userId: string) {
    try {
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

      return { message: 'İşlem başarıyla silindi' };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'remove transaction',
        'İşlem silinirken bir hata oluştu',
      );
    }
  }

}

