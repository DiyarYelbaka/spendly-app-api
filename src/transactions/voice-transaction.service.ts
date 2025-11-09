// NestJS: Backend framework'ü
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

// PrismaService: Veritabanı işlemleri için
import { PrismaService, ErrorHandler, ErrorCode } from '../core';

// DTO'lar
import { ParsedTransactionDto } from './dto/voice-transaction.dto';

// TransactionsService: Mevcut createIncome ve createExpense metodlarını kullanmak için
import { TransactionsService } from './transactions.service';

/**
 * VoiceTransactionService Sınıfı
 * 
 * Bu servis, ses komutundan gelen text'i parse edip transaction oluşturur.
 * 
 * İş Akışı:
 * 1. Text'i AI ile parse et
 * 2. Kategori bul (bulunamazsa default kullan)
 * 3. Transaction oluştur (createIncome veya createExpense)
 */
@Injectable()
export class VoiceTransactionService {
  private readonly logger = new Logger(VoiceTransactionService.name);
  private openai: OpenAI | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private transactionsService: TransactionsService,
  ) {
    // OpenAI client'ı initialize et
    const apiKey = this.configService.get<string>('openai.apiKey');
    const enabled = this.configService.get<boolean>('openai.enabled', true);

    if (enabled && apiKey) {
      this.openai = new OpenAI({
        apiKey,
      });
      this.logger.log('OpenAI client initialized');
    } else {
      this.logger.warn('OpenAI is disabled or API key is missing');
    }
  }

  /**
   * parseAndCreate: Text'i parse edip transaction oluştur
   * 
   * @param text: Ses komutundan gelen text
   * @param userId: Kullanıcı ID'si
   * 
   * @returns Oluşturulan transaction ve parsing bilgileri
   */
  async parseAndCreate(text: string, userId: string) {
    try {
      // 1. AI ile parse et
      const parsed = await this.parseWithAI(text);

      // 2. Kategori bul (bulunamazsa default kullan)
      const { categoryId, categoryFound } = await this.findOrGetDefaultCategory(
        parsed.category_keyword,
        parsed.type,
        userId,
      );

      // 3. Transaction oluştur
      const createDto = {
        amount: parsed.amount || 0,
        description: parsed.description || text,
        category_id: categoryId,
        date: parsed.date || undefined, // null → undefined
        notes: parsed.notes || undefined, // null → undefined
      };

      // Confidence kontrolü - düşük güven skorlarında kullanıcıya sor
      const confidenceThreshold = this.configService.get<number>(
        'openai.confidenceThreshold',
        0.7,
      );
      const confidence = parsed.confidence || 0.9;

      if (confidence < confidenceThreshold) {
        // Belirsiz durum - kullanıcıya onay sor
        return {
          needsConfirmation: true,
          parsed: {
            amount: parsed.amount,
            type: parsed.type,
            description: parsed.description || text,
            category_keyword: parsed.category_keyword,
            date: parsed.date,
            notes: parsed.notes,
            confidence,
          },
        };
      }

      // Transaction oluştur
      let transaction;
      if (parsed.type === 'income') {
        transaction = await this.transactionsService.createIncome(createDto, userId);
      } else if (parsed.type === 'expense') {
        transaction = await this.transactionsService.createExpense(createDto, userId);
      } else {
        throw new BadRequestException({
          message: 'İşlem tipi belirlenemedi',
          messageKey: ErrorCode.TRANSACTION_TYPE_UNDETERMINED,
          error: 'BAD_REQUEST',
        });
      }

      // 4. Response döndür (transaction + parsing bilgileri)
      return {
        transaction,
        parsing: {
          method: 'ai',
          confidence,
          category_found: categoryFound,
        },
      };
    } catch (error) {
      ErrorHandler.handleError(
        error,
        this.logger,
        'parseAndCreate',
        'Ses komutu ile işlem oluşturulurken bir hata oluştu',
      );
    }
  }

  /**
   * parseWithAI: OpenAI ile text'i parse et
   * 
   * @param text: Parse edilecek text
   * 
   * @returns ParsedTransactionDto
   */
  private async parseWithAI(text: string): Promise<ParsedTransactionDto> {
    if (!this.openai) {
      throw new BadRequestException({
        message: 'AI parsing servisi aktif değil',
        messageKey: ErrorCode.AI_PARSING_DISABLED,
        error: 'BAD_REQUEST',
      });
    }

    const model = this.configService.get<string>('openai.model', 'gpt-4o-mini');
    const timeout = this.configService.get<number>('openai.timeout', 5000);

    const systemPrompt = `Sen bir finansal işlem parser'ısın. Kullanıcının Türkçe veya İngilizce konuşmasını analiz edip structured JSON'a çevir.

Çıktı formatı (JSON object zorunlu):
{
  "amount": number | null,
  "type": "income" | "expense" | null,
  "description": string | null,
  "category_keyword": string | null,
  "date": "YYYY-MM-DD" | null,
  "notes": string | null,
  "confidence": number (0.0-1.0)
}

Kurallar:
- Türkçe: "aldım", "kazandım", "maaş", "gelir" → income
- İngilizce: "received", "earned", "salary", "income" → income
- Türkçe: "yaptım", "harcadım", "ödeme", "gider" → expense
- İngilizce: "spent", "paid", "payment", "expense" → expense
- Tutarı mutlaka çıkar (sayı + "tl", "lira", "₺", "dollar", "$" gibi)
- Kategori keyword'ü çıkar:
  * Türkçe: "market", "yemek", "maaş", "yatırım", "ulaşım", "fatura", "eğlence", "sağlık"
  * İngilizce: "grocery", "food", "salary", "investment", "transportation", "bills", "entertainment", "health"
- Tarih varsa çıkar ("dün/yesterday", "bugün/today", "geçen hafta/last week" gibi) YYYY-MM-DD formatında
- Belirsizse confidence düşük olsun (0.5 altı)
- Sadece JSON döndür, başka açıklama yapma`;

    try {
      const completion = await Promise.race([
        this.openai.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1, // Tutarlı sonuçlar için
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('OpenAI API timeout')), timeout),
        ),
      ]);

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException({
          message: 'AI yanıt vermedi',
          messageKey: ErrorCode.AI_NO_RESPONSE,
          error: 'BAD_REQUEST',
        });
      }

      let parsed: ParsedTransactionDto;
      try {
        parsed = JSON.parse(content) as ParsedTransactionDto;
      } catch (parseError) {
        throw new BadRequestException({
          message: 'AI yanıtı parse edilemedi',
          messageKey: ErrorCode.AI_PARSE_ERROR,
          error: 'BAD_REQUEST',
        });
      }

      // Validation
      if (!parsed.type || !parsed.amount) {
        throw new BadRequestException({
          message: 'AI yanıtında eksik bilgi: tip veya tutar bulunamadı',
          messageKey: ErrorCode.AI_INCOMPLETE_RESPONSE,
          error: 'BAD_REQUEST',
        });
      }

      return parsed;
    } catch (error) {
      // NestJS exception'larını direkt fırlat
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Diğer hataları logla ve fırlat
      this.logger.error('Error parsing with AI', error);
      throw new BadRequestException({
        message: 'Text parse edilemedi',
        messageKey: ErrorCode.PARSE_ERROR,
        error: 'BAD_REQUEST',
      });
    }
  }

  /**
   * findOrGetDefaultCategory: Kategori bul veya default kullan
   * 
   * @param categoryKeyword: AI'dan gelen kategori keyword'ü
   * @param type: İşlem tipi (income veya expense)
   * @param userId: Kullanıcı ID'si
   * 
   * @returns Kategori ID ve kategori bulundu mu bilgisi
   */
  private async findOrGetDefaultCategory(
    categoryKeyword: string | null,
    type: 'income' | 'expense' | null,
    userId: string,
  ): Promise<{ categoryId: string; categoryFound: boolean }> {
    // Eğer kategori keyword varsa, kullanıcının kategorilerinde ara
    if (categoryKeyword && type) {
      // Türkçe ve İngilizce keyword'leri İngilizce nameKey'lere map et
      const keywordMapping: Record<string, string[]> = {
        // Gelir kategorileri
        'maaş': ['salary', 'maas'],
        'maas': ['salary', 'maas'],
        'salary': ['salary', 'maas'],
        'yatırım': ['investment', 'yatirim'],
        'yatirim': ['investment', 'yatirim'],
        'investment': ['investment', 'yatirim'],
        'gelir': ['income'],
        'income': ['income'],
        // Gider kategorileri
        'yemek': ['food', 'yemek'],
        'food': ['food', 'yemek'],
        'market': ['food', 'market', 'grocery'],
        'grocery': ['food', 'market', 'grocery'],
        'ulaşım': ['transportation', 'ulasim', 'transport'],
        'ulasim': ['transportation', 'ulasim', 'transport'],
        'transportation': ['transportation', 'ulasim', 'transport'],
        'transport': ['transportation', 'ulasim', 'transport'],
        'fatura': ['bills', 'fatura', 'bill'],
        'bills': ['bills', 'fatura', 'bill'],
        'bill': ['bills', 'fatura', 'bill'],
        'eğlence': ['entertainment', 'eglence'],
        'eglence': ['entertainment', 'eglence'],
        'entertainment': ['entertainment', 'eglence'],
        'sağlık': ['health', 'saglik'],
        'saglik': ['health', 'saglik'],
        'health': ['health', 'saglik'],
      };

      // Keyword'ü normalize et (küçük harf, trim)
      const normalizedKeyword = categoryKeyword.toLowerCase().trim();

      // Tüm kullanıcının kategorilerini al
      const allCategories = await this.prisma.category.findMany({
        where: {
          userId,
          type,
          isActive: true,
        },
      });

      // 1. Önce direkt eşleşme kontrolü (hem Türkçe hem İngilizce için)
      const directMatch = allCategories.find((cat) => {
        const categoryName = cat.name.toLowerCase();
        return categoryName === normalizedKeyword;
      });

      if (directMatch) {
        this.logger.log(
          `Category found (direct match): ${directMatch.name} for keyword: ${categoryKeyword}`,
        );
        return { categoryId: directMatch.id, categoryFound: true };
      }

      // 2. Contains araması (kullanıcının özel kategorileri için - örn: "petrol")
      const containsMatch = allCategories.find((cat) => {
        const categoryName = cat.name.toLowerCase();
        return (
          categoryName.includes(normalizedKeyword) ||
          normalizedKeyword.includes(categoryName)
        );
      });

      if (containsMatch) {
        this.logger.log(
          `Category found (contains match): ${containsMatch.name} for keyword: ${categoryKeyword}`,
        );
        return { categoryId: containsMatch.id, categoryFound: true };
      }

      // 3. Mapping'e göre arama (default kategoriler için)
      const searchKeywords = keywordMapping[normalizedKeyword] || [normalizedKeyword];

      // Keyword mapping'e göre eşleşen kategoriyi bul
      for (const searchKeyword of searchKeywords) {
        const category = allCategories.find((cat) => {
          const categoryName = cat.name.toLowerCase();
          // Hem exact match hem de contains kontrolü
          return (
            categoryName === searchKeyword ||
            categoryName.includes(searchKeyword) ||
            searchKeyword.includes(categoryName)
          );
        });

        if (category) {
          this.logger.log(
            `Category found (mapping): ${category.name} for keyword: ${categoryKeyword}`,
          );
          return { categoryId: category.id, categoryFound: true };
        }
      }
    }

    // Bulunamazsa default kategori kullan
    if (!type) {
      throw new BadRequestException({
        message: 'İşlem tipi belirlenemedi',
        messageKey: ErrorCode.TRANSACTION_TYPE_UNDETERMINED,
        error: 'BAD_REQUEST',
      });
    }

    const defaultCategoryName = type === 'income' ? 'other_income' : 'other_expense';

    const defaultCategory = await this.prisma.category.findFirst({
      where: {
        userId,
        type,
        name: defaultCategoryName, // nameKey yerine name kullan (Prisma'da nameKey yok)
        isDefault: true,
      },
    });

    if (!defaultCategory) {
      this.logger.error(
        `Default category not found: ${defaultCategoryName} for user ${userId}`,
      );
      throw new BadRequestException({
        message: 'Varsayılan kategori bulunamadı',
        messageKey: ErrorCode.DEFAULT_CATEGORY_NOT_FOUND,
        error: 'BAD_REQUEST',
      });
    }

    return { categoryId: defaultCategory.id, categoryFound: false };
  }
}

