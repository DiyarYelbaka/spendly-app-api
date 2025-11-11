// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// Exception sınıfları: Farklı hata durumlarını temsil eder
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';

// PrismaService: Veritabanı işlemlerini yapan servis
// Prisma, veritabanı ile iletişim kurmak için kullanılan bir ORM (Object-Relational Mapping) aracıdır
import { PrismaService } from '../core';

// DTO'lar: Gelen verilerin yapısını tanımlayan sınıflar
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';

// Yardımcı fonksiyonlar: Ortak işlemler için kullanılan utility fonksiyonları
// ErrorHandler: Hataları yönetmek için
// parsePagination: Sayfalama parametrelerini işlemek için
// createPaginationResult: Sayfalama sonuçlarını oluşturmak için
// formatCategory: Kategori verilerini formatlamak için
import { ErrorHandler, parsePagination, createPaginationResult, formatCategory, DEFAULT_CATEGORIES, CategoryType } from '../core';

/**
 * CategoriesService Sınıfı
 * 
 * Bu sınıf, kategori ile ilgili tüm iş mantığını (business logic) içerir.
 * Service'in görevi:
 * 1. Veritabanı işlemlerini yapmak (CRUD: Create, Read, Update, Delete)
 * 2. İş kurallarını uygulamak (örneğin: aynı isimde kategori olamaz)
 * 3. Veri doğrulamaları yapmak
 * 4. Hata yönetimi yapmak
 * 
 * @Injectable(): Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
 *   Bu sayede bu sınıf başka sınıflara otomatik olarak enjekte edilebilir
 */
@Injectable()
export class CategoriesService {
  /**
   * logger: Loglama (kayıt tutma) için kullanılan nesne
   * 
   * Logger, uygulamanın çalışması sırasında oluşan olayları kaydetmek için kullanılır.
   * Örneğin: Hatalar, bilgilendirmeler, uyarılar
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * CategoriesService.name: Logger'ın hangi sınıftan geldiğini belirtir
   */
  private readonly logger = new Logger(CategoriesService.name);

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
   * create: Yeni kategori oluşturma fonksiyonu
   * 
   * Bu fonksiyon, kullanıcının yeni bir kategori oluşturmasını sağlar.
   * 
   * @param dto: CreateCategoryDto - Kullanıcıdan gelen kategori bilgileri
   *   - name: Kategori adı (zorunlu)
   *   - type: Kategori tipi - income veya expense (zorunlu)
   *   - icon: Kategori ikonu (opsiyonel)
   *   - color: Kategori rengi (opsiyonel)
   *   - description: Kategori açıklaması (opsiyonel)
   *   - sort_order: Sıralama sırası (opsiyonel)
   * 
   * @param userId: string - Kategoriyi oluşturan kullanıcının ID'si
   *   Bu ID, kategorinin hangi kullanıcıya ait olduğunu belirler
   * 
   * @returns Promise<Category> - Oluşturulan kategori bilgisi
   * 
   * İş Akışı:
   * 1. Aynı isimde ve tipte bir kategori var mı kontrol edilir
   * 2. Varsa ConflictException (409) hatası fırlatılır
   * 3. Yoksa yeni kategori veritabanına kaydedilir
   * 4. Oluşturulan kategori formatlanarak döndürülür
   * 
   * Hata Durumları:
   * - ConflictException (409): Aynı isimde kategori zaten mevcut
   * - Diğer hatalar: ErrorHandler tarafından yönetilir
   */
  async create(dto: CreateCategoryDto, userId: string) {
    // try-catch: Hata yakalama bloğu
    // Eğer kod içinde bir hata oluşursa, catch bloğuna düşer
    try {
      /**
       * ADIM 1: Duplicate (Tekrar Eden) İsim Kontrolü
       * 
       * Aynı kullanıcının, aynı tipte ve aynı isimde bir kategorisi var mı kontrol edilir.
       * Bu kontrol önemlidir çünkü:
       * - Kullanıcı aynı isimde iki kategori oluşturmasın
       * - Kategorileri ayırt etmek zorlaşmasın
       * 
       * findFirst: Veritabanında ilk eşleşen kaydı bulur
       * where: Arama kriterleri
       *   - userId: Sadece bu kullanıcının kategorilerine bak
       *   - name: Kategori adı eşleşmeli
       *   - type: Kategori tipi eşleşmeli (income veya expense)
       *   - isActive: true - Sadece aktif kategorilere bak (silinmiş kategorileri sayma)
       * 
       * await: Veritabanı sorgusunun tamamlanmasını bekler (asynchronous işlem)
       */
      const existing = await this.prisma.category.findFirst({
        where: {
          userId,
          name: dto.name,
          type: dto.type,
          isActive: true,
        },
      });

      /**
       * ADIM 2: Eğer Aynı İsimde Kategori Varsa Hata Fırlat
       * 
       * existing değişkeni null değilse, yani aynı isimde bir kategori bulunduysa,
       * ConflictException (409) hatası fırlatılır.
       * 
       * ConflictException: HTTP 409 durum kodu - Çakışma hatası
       * Bu hata, kullanıcıya "Bu isimde bir kategori zaten mevcut" mesajını gösterir
       */
      if (existing) {
        throw new ConflictException({
          message: 'Bu isimde bir kategori zaten mevcut',
          messageKey: 'CATEGORY_NAME_EXISTS',
          error: 'CONFLICT',
        });
      }

      /**
       * ADIM 3: Yeni Kategoriyi Veritabanına Kaydet
       * 
       * Aynı isimde kategori yoksa, yeni kategori oluşturulur.
       * 
       * create: Veritabanına yeni bir kayıt ekler
       * data: Kaydedilecek veriler
       *   - name: Kategori adı (dto'dan gelir)
       *   - type: Kategori tipi (dto'dan gelir)
       *   - icon: Kategori ikonu (dto'dan gelir, opsiyonel)
       *   - color: Kategori rengi (dto'dan gelir, opsiyonel)
       *   - description: Kategori açıklaması (dto'dan gelir, opsiyonel)
       *   - sortOrder: Sıralama sırası (dto'dan gelir, yoksa 0 kullanılır)
       *   - userId: Kategoriyi oluşturan kullanıcının ID'si
       * 
       * select: Döndürülecek alanları belirtir
       *   Sadece belirtilen alanlar döndürülür (güvenlik ve performans için)
       *   - id: Kategorinin benzersiz ID'si
       *   - name: Kategori adı
       *   - type: Kategori tipi
       *   - icon: Kategori ikonu
       *   - color: Kategori rengi
       *   - description: Kategori açıklaması
       *   - sortOrder: Sıralama sırası
       *   - isActive: Kategori aktif mi? (her zaman true olur yeni oluşturulan kategorilerde)
       *   - isDefault: Varsayılan kategori mi? (kullanıcı oluşturduğu için false)
       *   - createdAt: Oluşturulma tarihi
       * 
       * NOT: password gibi hassas alanlar select'e dahil edilmez (güvenlik)
       */
      const category = await this.prisma.category.create({
        data: {
          name: dto.name,
          type: dto.type,
          icon: dto.icon,
          color: dto.color,
          description: dto.description,
          // || 0: Eğer sort_order gönderilmemişse, varsayılan olarak 0 kullan
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

      /**
       * ADIM 4: Kategoriyi Formatla ve Döndür
       * 
       * formatCategory: Kategori verilerini frontend'in beklediği formata çevirir
       * Örneğin: sortOrder → sort_order (snake_case'e çevirir)
       * 
       * return: Oluşturulan kategori bilgisi döndürülür
       */
      return formatCategory(category);
    } catch (error) {
      /**
       * Hata Yakalama Bloğu
       * 
       * Eğer yukarıdaki kod içinde herhangi bir hata oluşursa (örneğin: veritabanı hatası),
       * bu blok çalışır.
       * 
       * ErrorHandler.handleError: Hataları yönetmek için kullanılan yardımcı fonksiyon
       *   - error: Oluşan hata nesnesi
       *   - this.logger: Hataları loglamak için logger
       *   - 'create category': Hatanın hangi işlem sırasında oluştuğunu belirtir
       *   - 'Kategori oluşturulurken bir hata oluştu': Kullanıcıya gösterilecek mesaj
       * 
       * Bu fonksiyon, hatayı loglar ve uygun HTTP hatası olarak fırlatır
       */
      ErrorHandler.handleError(
        error,
        this.logger,
        'create category',
        'Kategori oluşturulurken bir hata oluştu',
      );
    }
  }

  async findAll(userId: string, query: CategoryQueryDto) {
    try {
      const { page, limit, skip } = parsePagination(query.page, query.results);

      const where: any = {
        userId,
        isActive: true,
      };

      // Type filtresi
      if (query.type) {
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
      const includeDefaults = query.include_defaults !== false;

      const [categories, total] = await Promise.all([
        this.prisma.category.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { createdAt: 'desc' },
            { sortOrder: 'asc' },
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
      const includeStats = query.include_stats === true;
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
        items: categoriesWithStats.map((cat: any) => formatCategory(cat)),
        pagination: createPaginationResult(total, page, limit),
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'findAll categories',
        'Kategoriler getirilirken bir hata oluştu',
      );
    }
  }

  async findOne(id: string, userId: string, includeStats?: boolean) {
    try {
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

      let formattedCategory = formatCategory(category);

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
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'findOne category',
        'Kategori getirilirken bir hata oluştu',
      );
    }
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    try {
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

      // Tek bir kayıt güncellendiği için transaction'a gerek yok
      // Prisma zaten her query'yi kendi transaction'ında çalıştırır
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

      return formatCategory(updated);
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'update category',
        'Kategori güncellenirken bir hata oluştu',
      );
    }
  }

  async remove(id: string, userId: string) {
    try {
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

      return { message: 'Kategori başarıyla silindi' };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'remove category',
        'Kategori silinirken bir hata oluştu',
      );
    }
  }

  /**
   * Default kategorileri oluştur
   * Yeni kullanıcı kaydolduğunda çağrılır
   */
  async createDefaultCategories(userId: string) {
    try {
      const categories = await Promise.all(
        DEFAULT_CATEGORIES.map((cat) =>
          this.prisma.category.create({
            data: {
              name: cat.nameKey, // nameKey i18next translation key'i olarak saklanır
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
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'createDefaultCategories',
        'Varsayılan kategoriler oluşturulurken bir hata oluştu',
      );
    }
  }

}

