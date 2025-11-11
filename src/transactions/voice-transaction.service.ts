// NestJS: Backend framework'ü
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

// PrismaService: Veritabanı işlemleri için
import { PrismaService, ErrorHandler, ErrorCode, DEFAULT_CATEGORIES } from '../core';

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
- Kategori keyword'ü çıkar (ÖNEMLİ: Kullanıcının özel kategori isimlerini de çıkar):
  * Standart kategoriler: "market", "yemek", "maaş", "yatırım", "ulaşım", "fatura", "eğlence", "sağlık"
  * İngilizce: "grocery", "food", "salary", "investment", "transportation", "bills", "entertainment", "health"
  * Özel kategori isimleri: Metinde geçen herhangi bir özel isim veya kategori adı (örn: "TestA", "Petrol", "Kira" gibi)
  * Örnek: "500 tl TestA harcaması yaptım" → category_keyword: "TestA"
  * Örnek: "300 lira Petrol için ödeme yaptım" → category_keyword: "Petrol"
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
      // Keyword'ü normalize et (küçük harf, trim)
      let normalizedKeyword = categoryKeyword.toLowerCase().trim();
      
      // "harcaması", "harcama", "gideri", "alışverişi" gibi ekleri temizle
      // Örn: "A harcaması" → "A", "Market alışverişi" → "Market"
      normalizedKeyword = normalizedKeyword
        .replace(/\s+(harcaması|harcama|gideri|gider|geliri|gelir|alışverişi|alışveriş|işlemi|işlem|ödeme|ödemi)\s*$/i, '')
        .trim();

      // Tüm kullanıcının kategorilerini al (hem default hem de kullanıcının eklediği)
      const allCategories = await this.prisma.category.findMany({
        where: {
          userId,
          type,
          isActive: true,
        },
      });

      // 0. Önce default kategori keyword mapping'ini kontrol et
      // DEFAULT_CATEGORIES'den keyword'leri kontrol et
      for (const defaultCat of DEFAULT_CATEGORIES) {
        if (defaultCat.type === type) {
          // Normalize edilmiş keyword'ün default kategori keywords array'inde olup olmadığını kontrol et
          const keywordMatch = defaultCat.keywords.some(
            (keyword) => keyword.toLowerCase().trim() === normalizedKeyword,
          );
          
          if (keywordMatch) {
            // Bu nameKey'e sahip kategoriyi kullanıcının kategorilerinde bul
            const defaultCategoryMatch = allCategories.find(
              (cat) => cat.name.toLowerCase().trim() === defaultCat.nameKey.toLowerCase() && cat.isDefault,
            );
            
            if (defaultCategoryMatch) {
              this.logger.log(
                `Category found (default keyword mapping): ${defaultCategoryMatch.name} for keyword: ${categoryKeyword}`,
              );
              return { categoryId: defaultCategoryMatch.id, categoryFound: true };
            }
          }
        }
      }

      // 1. Önce direkt eşleşme kontrolü
      const directMatch = allCategories.find((cat) => {
        const categoryName = cat.name.toLowerCase().trim();
        return categoryName === normalizedKeyword;
      });

      if (directMatch) {
        this.logger.log(
          `Category found (direct match): ${directMatch.name} for keyword: ${categoryKeyword}`,
        );
        return { categoryId: directMatch.id, categoryFound: true };
      }

      // 2. Contains araması - keyword kategori adını içeriyor mu?
      // Örn: "A harcaması" → normalized "a" → kategori "A" bulunur
      const containsMatch = allCategories.find((cat) => {
        const categoryName = cat.name.toLowerCase().trim();
        // Kategori adı keyword'ü içeriyor mu? (örn: "Market Alışverişi" kategori, "market" keyword)
        if (categoryName.includes(normalizedKeyword)) {
          return true;
        }
        // Keyword kategori adını içeriyor mu? (örn: "A harcaması" keyword → "a", kategori "A")
        if (normalizedKeyword.includes(categoryName)) {
          return true;
        }
        return false;
      });

      if (containsMatch) {
        this.logger.log(
          `Category found (contains match): ${containsMatch.name} for keyword: ${categoryKeyword}`,
        );
        return { categoryId: containsMatch.id, categoryFound: true };
      }

      // 3. Kelime bazlı arama - keyword'ü kelimelere böl ve her kelimeyi kontrol et
      // Örn: "A harcaması" → ["a"] → "A" kategorisi bulunur
      const keywordWords = normalizedKeyword.split(/\s+/).filter(word => word.length > 0);
      
      for (const word of keywordWords) {
        // Her kelimeyi kategori adlarıyla karşılaştır
        const wordMatch = allCategories.find((cat) => {
          const categoryName = cat.name.toLowerCase().trim();
          // Tam eşleşme (örn: "a" === "a")
          if (categoryName === word) {
            return true;
          }
          // Kategori adı kelimeyi içeriyor mu? (örn: "Market Alışverişi" kategori, "market" kelimesi)
          if (categoryName.includes(word)) {
            return true;
          }
          // Kelime kategori adını içeriyor mu? (tek harf kategoriler için: "a" kelimesi, "A" kategori)
          if (word.includes(categoryName)) {
            return true;
          }
          return false;
        });

        if (wordMatch) {
          this.logger.log(
            `Category found (word match): ${wordMatch.name} for keyword: ${categoryKeyword} (matched word: ${word})`,
          );
          return { categoryId: wordMatch.id, categoryFound: true };
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

