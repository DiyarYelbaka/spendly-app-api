/**
 * User Repository
 * Data access layer for User entity
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../base.repository';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findUnique({
      where: { email },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.UserWhereInput = {
      email,
      ...(excludeId && { id: { not: excludeId } }),
    };

    const count = await this.count({ where });
    return count > 0;
  }
}

