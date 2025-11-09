// Swagger: API dokümantasyonu için kullanılan kütüphane
import { ApiProperty } from '@nestjs/swagger';

// class-validator: Gelen verilerin doğruluğunu kontrol etmek için kullanılan kütüphane
import {
  IsString,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

/**
 * VoiceTransactionDto Sınıfı
 * 
 * Bu sınıf, ses komutundan gelen text'i almak için kullanılır.
 * Frontend'de kullanıcı ses komutu ile konuşur, bu text'e çevrilir ve bu DTO ile gönderilir.
 * 
 * Örnek kullanım:
 * POST /api/transactions/voice
 * {
 *   "text": "500 tl lik market alışverişi yaptım"
 * }
 */
export class VoiceTransactionDto {
  /**
   * text: Ses komutundan çevrilen text
   * 
   * Kullanıcının konuştuğu cümle, text'e çevrilmiş hali.
   * 
   * @IsString(): Bu alan string (metin) tipinde olmalıdır
   * @IsNotEmpty(): Bu alan boş olamaz (zorunlu alan)
   * @MaxLength(500): En fazla 500 karakter olabilir (çok uzun cümleler token maliyetini artırır)
   * 
   * Örnek: "500 tl lik market alışverişi yaptım", "3000 maaş aldım"
   */
  @ApiProperty({
    example: '500 tl lik market alışverişi yaptım',
    description: 'Ses komutundan çevrilen text (max 500 karakter)',
    maxLength: 500,
  })
  @IsString({ message: 'Text string olmalıdır' })
  @IsNotEmpty({ message: 'Text zorunludur' })
  @MaxLength(500, { message: 'Text en fazla 500 karakter olmalıdır' })
  text: string;
}

/**
 * ParsedTransactionDto Interface
 * 
 * AI'dan dönen parse edilmiş veri yapısı.
 * OpenAI API'den gelen JSON response'un formatı.
 */
export interface ParsedTransactionDto {
  /**
   * amount: İşlem tutarı
   * 
   * AI'dan parse edilen tutar. Eğer bulunamazsa null olabilir.
   */
  amount: number | null;

  /**
   * type: İşlem tipi
   * 
   * "income" veya "expense". AI tarafından belirlenir.
   */
  type: 'income' | 'expense' | null;

  /**
   * description: İşlem açıklaması
   * 
   * AI'dan çıkarılan açıklama. Eğer bulunamazsa text'in kendisi kullanılabilir.
   */
  description: string | null;

  /**
   * category_keyword: Kategori anahtar kelimesi
   * 
   * AI'dan çıkarılan kategori anahtar kelimesi (örneğin: "market", "yemek", "maaş").
   * Bu keyword ile kullanıcının kategorilerinde arama yapılır.
   * Eğer bulunamazsa null olabilir, bu durumda default kategori kullanılır.
   */
  category_keyword: string | null;

  /**
   * date: İşlem tarihi
   * 
   * AI'dan çıkarılan tarih (ISO8601 format: YYYY-MM-DD).
   * Eğer bulunamazsa null olabilir, bu durumda bugünün tarihi kullanılır.
   */
  date: string | null;

  /**
   * notes: İşlem notları
   * 
   * AI'dan çıkarılan ek notlar. Opsiyonel.
   */
  notes?: string | null;

  /**
   * confidence: Güven skoru
   * 
   * AI'ın parse işleminin ne kadar güvenilir olduğunu gösterir (0.0 - 1.0).
   * Düşük güven skorlarında kullanıcıya onay sorulabilir.
   */
  confidence?: number;
}

/**
 * VoiceTransactionResponseDto Interface
 * 
 * Voice transaction endpoint'inden dönen response formatı.
 */
export interface VoiceTransactionResponseDto {
  /**
   * transaction: Oluşturulan işlem
   * 
   * Başarılı olursa oluşturulan transaction objesi.
   */
  transaction?: any;

  /**
   * parsing: Parsing bilgileri
   * 
   * Parsing metodunun bilgileri (ai, confidence, category_found).
   */
  parsing?: {
    method: 'ai';
    confidence: number;
    category_found: boolean;
  };

  /**
   * needsConfirmation: Kullanıcı onayı gerekli mi?
   * 
   * Belirsiz durumlarda true olur, kullanıcıdan onay istenir.
   */
  needsConfirmation?: boolean;

  /**
   * parsed: Parse edilmiş veri (onay için)
   * 
   * Kullanıcı onayı gerektiğinde parse edilmiş veri gösterilir.
   */
  parsed?: ParsedTransactionDto;
}

