import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto, userId: string) {
    // Duplicate name kontrolü (aynı user, aynı type, aynı name)
    const existing = await this.prisma.category.findFirst({
      where: {
        userId,
        name: dto.name,
        type: dto.type,
        isActive: true,
      },
    });

    if (existing) {
      throw new ConflictException({
        message: 'Bu isimde bir kategori zaten mevcut',
        messageKey: 'CATEGORY_NAME_EXISTS',
        error: 'CONFLICT',
      });
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        type: dto.type,
        icon: dto.icon,
        color: dto.color,
        description: dto.description,
        sortOrder: dto.sort_order || 0,
        userId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        icon: true,
        color: true,
        description: true,
        sortOrder: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
      },
    });

    return this.formatCategory(category);
  }

  async findAll(
    userId: string,
    query: {
      type?: string;
      include_defaults?: string;
      include_stats?: string;
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
      isActive: true,
    };

    // Type filtresi
    if (query.type && (query.type === 'income' || query.type === 'expense')) {
      where.type = query.type;
    }

    // Search filtresi
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Include defaults kontrolü
    const includeDefaults = query.include_defaults !== 'false';

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
        ],
        select: {
          id: true,
          name: true,
          type: true,
          icon: true,
          color: true,
          description: true,
          sortOrder: true,
          isActive: true,
          isDefault: true,
          createdAt: true,
          _count: {
            select: {
              transactions: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    // Stats hesaplama (opsiyonel)
    const includeStats = query.include_stats === 'true';
    let categoriesWithStats = categories;

    if (includeStats) {
      categoriesWithStats = await Promise.all(
        categories.map(async (category: any) => {
          const stats = await this.prisma.transaction.aggregate({
            where: {
              categoryId: category.id,
            },
            _sum: {
              amount: true,
            },
            _count: true,
          });

          return {
            ...category,
            stats: {
              transaction_count: stats._count,
              total_amount: stats._sum.amount?.toNumber() || 0,
            },
          };
        }),
      );
    }

    return {
      categories: categoriesWithStats.map((cat: any) => this.formatCategory(cat)),
      pagination: {
        total,
        current_page: page,
        per_page: limit,
      },
    };
  }

  async findOne(id: string, userId: string, includeStats?: boolean) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        icon: true,
        color: true,
        description: true,
        sortOrder: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Kategori bulunamadı',
        messageKey: 'CATEGORY_NOT_FOUND',
        error: 'NOT_FOUND',
      });
    }

    let formattedCategory = this.formatCategory(category);

    if (includeStats) {
      const stats = await this.prisma.transaction.aggregate({
        where: {
          categoryId: id,
        },
        _sum: {
          amount: true,
        },
        _count: true,
      });

      formattedCategory = {
        ...formattedCategory,
        stats: {
          transaction_count: stats._count,
          total_amount: stats._sum.amount?.toNumber() || 0,
        },
      };
    }

    return formattedCategory;
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    // Kategoriyi bul ve kullanıcı kontrolü yap
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Kategori bulunamadı',
        messageKey: 'CATEGORY_NOT_FOUND',
        error: 'NOT_FOUND',
      });
    }

    // is_default kategoriler güncellenemez (opsiyonel - şimdilik izin veriyoruz)
    // type güncellenemez
    if (dto.name && dto.name !== category.name) {
      // Aynı isimde başka kategori var mı kontrol et
      const existing = await this.prisma.category.findFirst({
        where: {
          userId,
          name: dto.name,
          type: category.type,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException({
          message: 'Bu isimde bir kategori zaten mevcut',
          messageKey: 'CATEGORY_NAME_EXISTS',
          error: 'CONFLICT',
        });
      }
    }

    // Sadece gönderilen field'ları güncelle
    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.sort_order !== undefined) updateData.sortOrder = dto.sort_order;
    if (dto.is_active !== undefined) updateData.isActive = dto.is_active;

    const updated = await this.prisma.category.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        type: true,
        icon: true,
        color: true,
        description: true,
        sortOrder: true,
        isActive: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.formatCategory(updated);
  }

  async remove(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException({
        message: 'Kategori bulunamadı',
        messageKey: 'CATEGORY_NOT_FOUND',
        error: 'NOT_FOUND',
      });
    }

    // Varsayılan kategoriler silinemez
    if (category.isDefault) {
      throw new ForbiddenException({
        message: 'Varsayılan kategoriler silinemez',
        messageKey: 'CANNOT_DELETE_DEFAULT_CATEGORY',
        error: 'FORBIDDEN',
      });
    }

    // İşlem yapılmış kategoriler silinemez
    if (category._count.transactions > 0) {
      throw new ForbiddenException({
        message: 'İşlem yapılmış kategoriler silinemez',
        messageKey: 'CANNOT_DELETE_CATEGORY_WITH_TRANSACTIONS',
        error: 'FORBIDDEN',
      });
    }

    // Soft delete - isActive = false
    await this.prisma.category.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return {
      message: 'Kategori başarıyla silindi',
    };
  }

  /**
   * Default kategorileri oluştur
   * Yeni kullanıcı kaydolduğunda çağrılır
   */
  async createDefaultCategories(userId: string) {
    const defaultCategories = [
      // Income kategorileri
      { name: 'Maaş', type: 'income', icon: '💰', color: '#00C853', sortOrder: 1 },
      { name: 'Yatırım', type: 'income', icon: '📈', color: '#00E676', sortOrder: 2 },
      { name: 'Diğer Gelirler', type: 'income', icon: '💵', color: '#69F0AE', sortOrder: 3 },
      // Expense kategorileri
      { name: 'Yemek', type: 'expense', icon: '🍔', color: '#FF5722', sortOrder: 1 },
      { name: 'Ulaşım', type: 'expense', icon: '🚗', color: '#FF9800', sortOrder: 2 },
      { name: 'Faturalar', type: 'expense', icon: '💡', color: '#FFC107', sortOrder: 3 },
      { name: 'Eğlence', type: 'expense', icon: '🎬', color: '#9C27B0', sortOrder: 4 },
      { name: 'Sağlık', type: 'expense', icon: '🏥', color: '#F44336', sortOrder: 5 },
      { name: 'Diğer Giderler', type: 'expense', icon: '📦', color: '#607D8B', sortOrder: 6 },
    ];

    const categories = await Promise.all(
      defaultCategories.map((cat) =>
        this.prisma.category.create({
          data: {
            name: cat.name,
            type: cat.type,
            icon: cat.icon,
            color: cat.color,
            sortOrder: cat.sortOrder,
            isDefault: true,
            userId,
          },
        }),
      ),
    );

    return categories;
  }

  /**
   * Category formatını snake_case'e çevir
   */
  private formatCategory(category: any) {
    return {
      id: category.id,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      description: category.description,
      sort_order: category.sortOrder,
      is_active: category.isActive,
      is_default: category.isDefault,
      created_at: category.createdAt,
      ...(category.updatedAt && { updated_at: category.updatedAt }),
      ...(category.stats && { stats: category.stats }),
    };
  }
}

