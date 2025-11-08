/**
 * Transaction Repository
 * Data access layer for Transaction entity
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { Transaction, Prisma } from '@prisma/client';

@Injectable()
export class TransactionRepository extends BaseRepository<
  Transaction,
  Prisma.TransactionCreateInput,
  Prisma.TransactionUpdateInput,
  Prisma.TransactionWhereInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.transaction);
  }

  /**
   * Find transactions by user ID with optional filters
   */
  async findByUserId(
    userId: string,
    filters?: {
      type?: string;
      categoryId?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    },
  ): Promise<Transaction[]> {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...((filters?.startDate || filters?.endDate) && {
        date: {
          ...(filters?.startDate && { gte: filters.startDate }),
          ...(filters?.endDate && { lte: filters.endDate }),
        },
      }),
      ...(filters?.search && {
        description: {
          contains: filters.search,
          mode: 'insensitive',
        },
      }),
    };

    return this.findMany({
      where,
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
    });
  }

  /**
   * Get transaction statistics for a category
   */
  async getCategoryStats(categoryId: string) {
    return this.aggregate({
      where: { categoryId },
      _sum: { amount: true },
      _count: true,
    });
  }
}

