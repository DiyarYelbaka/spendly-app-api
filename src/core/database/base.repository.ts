/**
 * Base Repository
 * Abstract base repository for Prisma entities
 * Provides common CRUD operations
 */

import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export abstract class BaseRepository<T, CreateInput, UpdateInput, WhereInput> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: any, // Prisma model delegate
  ) {}

  /**
   * Create a new record
   */
  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  /**
   * Find many records with filters
   */
  async findMany(args?: {
    where?: WhereInput;
    skip?: number;
    take?: number;
    orderBy?: any;
    include?: any;
    select?: any;
  }): Promise<T[]> {
    return this.model.findMany(args);
  }

  /**
   * Find a single record
   */
  async findFirst(args?: {
    where?: WhereInput;
    include?: any;
    select?: any;
  }): Promise<T | null> {
    return this.model.findFirst(args);
  }

  /**
   * Find unique record
   */
  async findUnique(args: {
    where: WhereInput;
    include?: any;
    select?: any;
  }): Promise<T | null> {
    return this.model.findUnique(args);
  }

  /**
   * Update a record
   */
  async update(args: {
    where: WhereInput;
    data: UpdateInput;
    include?: any;
    select?: any;
  }): Promise<T> {
    return this.model.update(args);
  }

  /**
   * Delete a record
   */
  async delete(args: { where: WhereInput }): Promise<T> {
    return this.model.delete(args);
  }

  /**
   * Count records
   */
  async count(args?: { where?: WhereInput }): Promise<number> {
    return this.model.count(args);
  }

  /**
   * Aggregate records
   */
  async aggregate(args?: {
    where?: WhereInput;
    _sum?: any;
    _avg?: any;
    _min?: any;
    _max?: any;
    _count?: any;
  }): Promise<any> {
    return this.model.aggregate(args);
  }
}

