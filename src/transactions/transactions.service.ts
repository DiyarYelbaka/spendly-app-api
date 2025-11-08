// NestJS: Backend framework'ü
// Injectable: Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
// Exception sınıfları: Farklı hata durumlarını temsil eder
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';

// PrismaService: Veritabanı işlemlerini yapan servis
import { PrismaService } from '../core';

// DTO'lar: Gelen verilerin yapısını tanımlayan sınıflar
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';

// Yardımcı fonksiyonlar: Ortak işlemler için kullanılan utility fonksiyonları
import { ErrorHandler, parsePagination, createPaginationResult, formatTransaction } from '../core';

/**
 * TransactionsService Sınıfı
 * 
 * Bu sınıf, işlem (transaction) ile ilgili tüm iş mantığını (business logic) içerir.
 * Service'in görevi:
 * 1. Veritabanı işlemlerini yapmak (CRUD: Create, Read, Update, Delete)
 * 2. İş kurallarını uygulamak (örneğin: gelir işlemi için income tipinde kategori olmalı)
 * 3. Veri doğrulamaları yapmak
 * 4. Hata yönetimi yapmak
 * 
 * @Injectable(): Bu sınıfın NestJS'in dependency injection sistemine dahil olduğunu belirtir
 *   Bu sayede bu sınıf başka sınıflara otomatik olarak enjekte edilebilir
 */
@Injectable()
export class TransactionsService {
  /**
   * logger: Loglama (kayıt tutma) için kullanılan nesne
   * 
   * Logger, uygulamanın çalışması sırasında oluşan olayları kaydetmek için kullanılır.
   * Örneğin: Hatalar, bilgilendirmeler, uyarılar
   * 
   * private readonly: Bu değişken sadece bu sınıf içinde kullanılabilir ve değiştirilemez
   * TransactionsService.name: Logger'ın hangi sınıftan geldiğini belirtir
   */
  private readonly logger = new Logger(TransactionsService.name);

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
   * createIncome: Yeni gelir işlemi oluşturma fonksiyonu
   * 
   * Bu fonksiyon, kullanıcının yeni bir gelir işlemi oluşturmasını sağlar.
   * 
   * @param dto: CreateTransactionDto - Kullanıcıdan gelen işlem bilgileri
   * @param userId: string - İşlemi oluşturan kullanıcının ID'si
   * 
   * @returns Promise<Transaction> - Oluşturulan işlem bilgisi
   * 
   * İş Akışı:
   * 1. Kategori kontrolü yapılır (kategori income tipinde olmalı)
   * 2. Tarih belirlenir (gönderilmezse bugünün tarihi kullanılır)
   * 3. İşlem veritabanına kaydedilir
   * 4. Oluşturulan işlem formatlanarak döndürülür
   * 
   * Hata Durumları:
   * - BadRequestException (400): Kategori geçersiz veya income tipinde değil
   * - Diğer hatalar: ErrorHandler tarafından yönetilir
   */
  async createIncome(dto: CreateTransactionDto, userId: string) {
    // try-catch: Hata yakalama bloğu
    try {
      /**
       * ADIM 1: Kategori Kontrolü
       * 
       * Gelir işlemi için, kategori mutlaka income tipinde olmalıdır.
       * Bu kontrol önemlidir çünkü:
       * - Gelir işlemi expense kategorisine atanamaz
       * - Kategori kullanıcıya ait olmalıdır
       * 
       * findFirst: Veritabanında ilk eşleşen kaydı bulur
       * where: Arama kriterleri
       *   - id: Kategori ID'si (dto'dan gelir)
       *   - userId: Sadece bu kullanıcının kategorilerine bak
       *   - type: 'income' - Kategori income tipinde olmalı
       */
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.category_id,
          userId,
          type: 'income',
        },
      });

      /**
       * ADIM 2: Eğer Kategori Bulunamazsa Hata Fırlat
       * 
       * category null ise, yani kategori bulunamadıysa veya income tipinde değilse,
       * BadRequestException (400) hatası fırlatılır.
       */
      if (!category) {
        throw new BadRequestException({
          message: 'Geçersiz kategori veya kategori income tipinde değil',
          messageKey: 'INVALID_CATEGORY',
          error: 'BAD_REQUEST',
        });
      }

      /**
       * ADIM 3: Tarih Belirleme
       * 
       * Eğer dto.date gönderilmişse, o tarih kullanılır.
       * Gönderilmemişse, bugünün tarihi kullanılır (varsayılan).
       * 
       * new Date(dto.date): String tarihi Date nesnesine çevirir
       * new Date(): Şu anki tarih ve saat
       */
      const transactionDate = dto.date ? new Date(dto.date) : new Date();

      /**
       * ADIM 4: İşlemi Veritabanına Kaydet
       * 
       * create: Veritabanına yeni bir kayıt ekler
       * data: Kaydedilecek veriler
       *   - amount: İşlem tutarı (dto'dan gelir)
       *   - type: 'income' - Gelir işlemi
       *   - description: İşlem açıklaması (dto'dan gelir)
       *   - categoryId: Kategori ID'si (dto'dan gelir)
       *   - date: İşlem tarihi
       *   - notes: İşlem notları (dto'dan gelir, opsiyonel)
       *   - userId: İşlemi oluşturan kullanıcının ID'si
       * 
       * include: İlişkili verileri de getir
       *   category: İşlemin kategorisi
       *     select: Sadece belirtilen alanları getir (id, name, icon, color)
       * 
       * NOT: Prisma, her query'yi otomatik olarak transaction (işlem) içinde çalıştırır.
       * Bu yüzden manuel transaction yönetimine gerek yoktur.
       */
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

      /**
       * ADIM 5: İşlemi Formatla ve Döndür
       * 
       * formatTransaction: İşlem verilerini frontend'in beklediği formata çevirir
       * Örneğin: categoryId → category_id (snake_case'e çevirir)
       */
      return formatTransaction(transaction);
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
        'createIncome',
        'Gelir işlemi oluşturulurken bir hata oluştu',
      );
    }
  }

  /**
   * createExpense: Yeni gider işlemi oluşturma fonksiyonu
   * 
   * Bu fonksiyon, kullanıcının yeni bir gider işlemi oluşturmasını sağlar.
   * 
   * @param dto: CreateTransactionDto - Kullanıcıdan gelen işlem bilgileri
   * @param userId: string - İşlemi oluşturan kullanıcının ID'si
   * 
   * @returns Promise<Transaction> - Oluşturulan işlem bilgisi
   * 
   * İş Akışı:
   * 1. Kategori kontrolü yapılır (kategori expense tipinde olmalı)
   * 2. Tarih belirlenir (gönderilmezse bugünün tarihi kullanılır)
   * 3. İşlem veritabanına kaydedilir
   * 4. Oluşturulan işlem formatlanarak döndürülür
   * 
   * Hata Durumları:
   * - BadRequestException (400): Kategori geçersiz veya expense tipinde değil
   * - Diğer hatalar: ErrorHandler tarafından yönetilir
   */
  async createExpense(dto: CreateTransactionDto, userId: string) {
    // try-catch: Hata yakalama bloğu
    try {
      /**
       * ADIM 1: Kategori Kontrolü
       * 
       * Gider işlemi için, kategori mutlaka expense tipinde olmalıdır.
       * Bu kontrol önemlidir çünkü:
       * - Gider işlemi income kategorisine atanamaz
       * - Kategori kullanıcıya ait olmalıdır
       */
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.category_id,
          userId,
          type: 'expense',
        },
      });

      /**
       * ADIM 2: Eğer Kategori Bulunamazsa Hata Fırlat
       */
      if (!category) {
        throw new BadRequestException({
          message: 'Geçersiz kategori veya kategori expense tipinde değil',
          messageKey: 'INVALID_CATEGORY',
          error: 'BAD_REQUEST',
        });
      }

      /**
       * ADIM 3: Tarih Belirleme
       * 
       * Eğer dto.date gönderilmişse, o tarih kullanılır.
       * Gönderilmemişse, bugünün tarihi kullanılır (varsayılan).
       */
      const transactionDate = dto.date ? new Date(dto.date) : new Date();

      /**
       * ADIM 4: İşlemi Veritabanına Kaydet
       * 
       * create: Veritabanına yeni bir kayıt ekler
       * data: Kaydedilecek veriler
       *   - type: 'expense' - Gider işlemi (createIncome'dan farkı bu)
       *   - Diğer alanlar createIncome ile aynı
       */
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

      /**
       * ADIM 5: İşlemi Formatla ve Döndür
       */
      return formatTransaction(transaction);
    } catch (error) {
      /**
       * Hata Yakalama Bloğu
       */
      ErrorHandler.handleError(
        error,
        this.logger,
        'createExpense',
        'Gider işlemi oluşturulurken bir hata oluştu',
      );
    }
  }

  /**
   * findAll: İşlemleri listeleme fonksiyonu
   * 
   * Bu fonksiyon, kullanıcının işlemlerini listeler.
   * Sayfalama (pagination), filtreleme ve arama özellikleri destekler.
   * 
   * @param userId: string - Kullanıcının benzersiz ID'si
   * @param query: TransactionQueryDto - Sorgu parametreleri (filtreleme, sayfalama, arama)
   * 
   * @returns Promise<{items: Transaction[], pagination: PaginationResult}>
   *   - items: İşlem listesi
   *   - pagination: Sayfalama bilgileri
   * 
   * İş Akışı:
   * 1. Sayfalama parametreleri işlenir
   * 2. Filtreleme kriterleri oluşturulur (tip, kategori, tarih aralığı, arama)
   * 3. İşlemler ve toplam sayı paralel olarak getirilir
   * 4. Sonuçlar formatlanıp döndürülür
   */
  async findAll(userId: string, query: TransactionQueryDto) {
    // try-catch: Hata yakalama bloğu
    try {
      /**
       * ADIM 1: Sayfalama Parametrelerini İşle
       * 
       * parsePagination: Sayfalama parametrelerini işler ve standart değerlere çevirir
       *   - page: Sayfa numarası (varsayılan: 1)
       *   - limit: Sayfa başına kayıt sayısı (varsayılan: 20)
       *   - skip: Atlanacak kayıt sayısı (sayfa numarasına göre hesaplanır)
       * 
       * Örnek: page=2, limit=20 → skip=20 (ilk 20 kayıt atlanır)
       */
      const { page, limit, skip } = parsePagination(query.page, query.limit);

      /**
       * ADIM 2: Filtreleme Kriterlerini Oluştur
       * 
       * where: Veritabanı sorgusu için filtreleme kriterleri
       *   Başlangıçta sadece userId filtresi vardır (sadece bu kullanıcının işlemleri)
       */
      const where: any = {
        userId,
      };

      /**
       * ADIM 2.1: Tip Filtresi
       * 
       * Eğer query.type gönderilmişse (income veya expense),
       * sadece o tipteki işlemler getirilir.
       */
      if (query.type) {
        where.type = query.type;
      }

      /**
       * ADIM 2.2: Kategori Filtresi
       * 
       * Eğer query.category_id gönderilmişse,
       * sadece o kategoriye ait işlemler getirilir.
       */
      if (query.category_id) {
        where.categoryId = query.category_id;
      }

      /**
       * ADIM 2.3: Tarih Aralığı Filtresi
       * 
       * Eğer query.start_date veya query.end_date gönderilmişse,
       * belirtilen tarih aralığındaki işlemler getirilir.
       * 
       * where.date: Tarih filtresi nesnesi
       *   - gte: Büyük veya eşit (greater than or equal) - Başlangıç tarihinden itibaren
       *   - lte: Küçük veya eşit (less than or equal) - Bitiş tarihine kadar
       * 
       * Örnek: start_date=2025-01-01, end_date=2025-01-31
       *   → Sadece Ocak ayındaki işlemler getirilir
       */
      if (query.start_date || query.end_date) {
        where.date = {};
        if (query.start_date) {
          where.date.gte = new Date(query.start_date);
        }
        if (query.end_date) {
          where.date.lte = new Date(query.end_date);
        }
      }

      /**
       * ADIM 2.4: Arama Filtresi
       * 
       * Eğer query.search gönderilmişse,
       * açıklama (description) alanında arama yapılır.
       * 
       * contains: Metin içinde arama yapar
       * mode: 'insensitive' - Büyük/küçük harf duyarsız arama
       * 
       * Örnek: search="maaş" → "Maaş", "maaş", "MAAŞ" gibi tüm eşleşmeleri bulur
       */
      if (query.search) {
        where.description = {
          contains: query.search,
          mode: 'insensitive',
        };
      }

      /**
       * ADIM 3: İşlemleri ve Toplam Sayıyı Paralel Olarak Getir
       * 
       * Promise.all(): İki sorguyu paralel olarak çalıştırır
       *   Bu sayede performans artar (iki sorgu aynı anda çalışır)
       * 
       * findMany: Birden fazla kayıt bulur
       *   - where: Filtreleme kriterleri
       *   - skip: Atlanacak kayıt sayısı (sayfalama için)
       *   - take: Alınacak kayıt sayısı (sayfalama için)
       *   - orderBy: Sıralama kriteri (date: 'desc' - Tarihe göre azalan sırada, en yeni önce)
       *   - include: İlişkili verileri de getir (kategori bilgileri)
       * 
       * count: Toplam kayıt sayısını hesaplar
       *   - where: Aynı filtreleme kriterleri (sayfalama olmadan)
       * 
       * items: İşlem listesi
       * total: Toplam işlem sayısı (sayfalama bilgileri için)
       */
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

      /**
       * ADIM 4: Sonuçları Formatla ve Döndür
       * 
       * transactions.map(): Her işlemi formatlar
       *   formatTransaction: İşlem verilerini frontend'in beklediği formata çevirir
       * 
       * createPaginationResult: Sayfalama bilgilerini oluşturur
       *   - total: Toplam kayıt sayısı
       *   - page: Mevcut sayfa numarası
       *   - limit: Sayfa başına kayıt sayısı
       *   Sonuç: { page, limit, total, totalPages } gibi bilgiler
       */
      return {
        items: transactions.map((t: any) => formatTransaction(t)),
        pagination: createPaginationResult(total, page, limit),
      };
    } catch (error) {
      /**
       * Hata Yakalama Bloğu
       */
      ErrorHandler.handleError(
        error,
        this.logger,
        'findAll transactions',
        'İşlemler getirilirken bir hata oluştu',
      );
    }
  }

  /**
   * findOne: Tek işlem detayı getiren fonksiyon
   * 
   * Bu fonksiyon, belirli bir işlemin detaylı bilgilerini getirir.
   * 
   * @param id: string - İşlem ID'si
   * @param userId: string - Kullanıcının benzersiz ID'si
   * 
   * @returns Promise<Transaction> - İşlem detayı
   * 
   * İş Akışı:
   * 1. İşlem veritabanından bulunur (kullanıcı kontrolü ile)
   * 2. İşlem bulunamazsa hata fırlatılır
   * 3. İşlem formatlanarak döndürülür
   * 
   * Hata Durumları:
   * - NotFoundException (404): İşlem bulunamadı veya kullanıcıya ait değil
   */
  async findOne(id: string, userId: string) {
    // try-catch: Hata yakalama bloğu
    try {
      /**
       * ADIM 1: İşlemi Veritabanından Bul
       * 
       * findFirst: Veritabanında ilk eşleşen kaydı bulur
       * where: Arama kriterleri
       *   - id: İşlem ID'si
       *   - userId: Sadece bu kullanıcının işlemlerine bak (güvenlik)
       * 
       * include: İlişkili verileri de getir
       *   category: İşlemin kategorisi
       */
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

      /**
       * ADIM 2: Eğer İşlem Bulunamazsa Hata Fırlat
       * 
       * transaction null ise, yani işlem bulunamadıysa veya kullanıcıya ait değilse,
       * NotFoundException (404) hatası fırlatılır.
       */
      if (!transaction) {
        throw new NotFoundException({
          message: 'İşlem bulunamadı',
          messageKey: 'TRANSACTION_NOT_FOUND',
          error: 'NOT_FOUND',
        });
      }

      /**
       * ADIM 3: İşlemi Formatla ve Döndür
       */
      return formatTransaction(transaction);
    } catch (error) {
      /**
       * Hata Yakalama Bloğu
       */
      ErrorHandler.handleError(
        error,
        this.logger,
        'findOne transaction',
        'İşlem getirilirken bir hata oluştu',
      );
    }
  }

  /**
   * update: İşlem güncelleme fonksiyonu
   * 
   * Bu fonksiyon, mevcut bir işlemin bilgilerini günceller.
   * 
   * @param id: string - Güncellenecek işlemin ID'si
   * @param dto: UpdateTransactionDto - Güncelleme bilgileri (tüm alanlar opsiyonel)
   * @param userId: string - Kullanıcının benzersiz ID'si
   * 
   * @returns Promise<Transaction> - Güncellenmiş işlem bilgisi
   * 
   * İş Akışı:
   * 1. İşlem bulunur ve kullanıcı kontrolü yapılır
   * 2. Eğer kategori güncelleniyorsa, kategori kontrolü yapılır (aynı tip olmalı)
   * 3. İşlem güncellenir (sadece gönderilen alanlar)
   * 4. Güncellenmiş işlem formatlanarak döndürülür
   * 
   * Hata Durumları:
   * - NotFoundException (404): İşlem bulunamadı veya kullanıcıya ait değil
   * - BadRequestException (400): Kategori geçersiz veya tipi uyuşmuyor
   */
  async update(id: string, dto: UpdateTransactionDto, userId: string) {
    // try-catch: Hata yakalama bloğu
    try {
      /**
       * ADIM 1: İşlemi Bul ve Kullanıcı Kontrolü Yap
       * 
       * İşlemin var olup olmadığını ve kullanıcıya ait olup olmadığını kontrol eder.
       */
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          id,
          userId,
        },
      });

      /**
       * ADIM 2: Eğer İşlem Bulunamazsa Hata Fırlat
       */
      if (!transaction) {
        throw new NotFoundException({
          message: 'İşlem bulunamadı',
          messageKey: 'TRANSACTION_NOT_FOUND',
          error: 'NOT_FOUND',
        });
      }

      /**
       * ADIM 3: Kategori Kontrolü (Eğer Kategori Güncelleniyorsa)
       * 
       * Eğer dto.category_id gönderilmişse ve mevcut kategoriden farklıysa,
       * yeni kategorinin geçerli olduğunu ve işlem tipiyle uyumlu olduğunu kontrol eder.
       * 
       * ÖNEMLİ: Gelir işlemi için income, gider işlemi için expense kategorisi olmalı.
       * İşlem tipi değiştirilemez, sadece kategori değiştirilebilir (aynı tip içinde).
       */
      if (dto.category_id && dto.category_id !== transaction.categoryId) {
        const category = await this.prisma.category.findFirst({
          where: {
            id: dto.category_id,
            userId,
            type: transaction.type, // Aynı tip olmalı (income veya expense)
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

      /**
       * ADIM 4: İşlemi Güncelle
       * 
       * update: Veritabanında mevcut bir kaydı günceller
       * where: Güncellenecek kaydı belirtir (id)
       * data: Güncellenecek veriler
       *   - amount: İşlem tutarı (dto'dan gelir, opsiyonel)
       *   - description: İşlem açıklaması (dto'dan gelir, opsiyonel)
       *   - categoryId: Kategori ID'si (dto'dan gelir, opsiyonel)
       *   - date: İşlem tarihi (dto'dan gelir, opsiyonel)
       *   - notes: İşlem notları (dto'dan gelir, opsiyonel)
       * 
       * NOT: undefined değerler gönderilirse, o alan güncellenmez (mevcut değer kalır).
       * Örneğin: dto.date gönderilmemişse → date: undefined → Tarih değişmez
       */
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

      /**
       * ADIM 5: Güncellenmiş İşlemi Formatla ve Döndür
       */
      return formatTransaction(updated);
    } catch (error) {
      /**
       * Hata Yakalama Bloğu
       */
      ErrorHandler.handleError(
        error,
        this.logger,
        'update transaction',
        'İşlem güncellenirken bir hata oluştu',
      );
    }
  }

  /**
   * remove: İşlem silme fonksiyonu
   * 
   * Bu fonksiyon, mevcut bir işlemi siler.
   * 
   * ÖNEMLİ: Bu fonksiyon "hard delete" yapar, yani işlemi veritabanından tamamen siler.
   * Soft delete (isActive=false) yapmaz.
   * 
   * @param id: string - Silinecek işlemin ID'si
   * @param userId: string - Kullanıcının benzersiz ID'si
   * 
   * @returns Promise<{message: string}> - Başarı mesajı
   * 
   * İş Akışı:
   * 1. İşlem bulunur ve kullanıcı kontrolü yapılır
   * 2. İşlem silinir
   * 3. Başarı mesajı döndürülür
   * 
   * Hata Durumları:
   * - NotFoundException (404): İşlem bulunamadı veya kullanıcıya ait değil
   */
  async remove(id: string, userId: string) {
    // try-catch: Hata yakalama bloğu
    try {
      /**
       * ADIM 1: İşlemi Bul ve Kullanıcı Kontrolü Yap
       * 
       * İşlemin var olup olmadığını ve kullanıcıya ait olup olmadığını kontrol eder.
       * Bu kontrol, güvenlik için önemlidir (kullanıcı başkasının işlemini silemez).
       */
      const transaction = await this.prisma.transaction.findFirst({
        where: {
          id,
          userId,
        },
      });

      /**
       * ADIM 2: Eğer İşlem Bulunamazsa Hata Fırlat
       */
      if (!transaction) {
        throw new NotFoundException({
          message: 'İşlem bulunamadı',
          messageKey: 'TRANSACTION_NOT_FOUND',
          error: 'NOT_FOUND',
        });
      }

      /**
       * ADIM 3: İşlemi Sil
       * 
       * delete: Veritabanından kaydı tamamen siler (hard delete)
       * where: Silinecek kaydı belirtir (id)
       * 
       * NOT: Bu işlem geri alınamaz. İşlem veritabanından tamamen silinir.
       */
      await this.prisma.transaction.delete({
        where: { id },
      });

      /**
       * ADIM 4: Başarı Mesajı Döndür
       */
      return { message: 'İşlem başarıyla silindi' };
    } catch (error) {
      /**
       * Hata Yakalama Bloğu
       */
      ErrorHandler.handleError(
        error,
        this.logger,
        'remove transaction',
        'İşlem silinirken bir hata oluştu',
      );
    }
  }

}

