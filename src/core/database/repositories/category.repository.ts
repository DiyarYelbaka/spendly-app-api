/**
 * Category Repository
 * Data access layer for Category entity
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryRepository extends BaseRepository<
  Category,
  Prisma.CategoryCreateInput,
  Prisma.CategoryUpdateInput,
  Prisma.CategoryWhereInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.category);
  }

  /**
   * Find categories by user ID with optional filters
   */
  async findByUserId(
    userId: string,
    filters?: {
      type?: string;
      isActive?: boolean;
      search?: string;
    },
  ): Promise<Category[]> {
    const where: Prisma.CategoryWhereInput = {
      userId,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.search && {
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      }),
    };

    return this.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * Check if category name exists for user
   */
  async nameExists(
    userId: string,
    name: string,
    type: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: Prisma.CategoryWhereInput = {
      userId,
      name,
      type,
      isActive: true,
      ...(excludeId && { id: { not: excludeId } }),
    };

    const count = await this.count({ where });
    return count > 0;
  }
}

