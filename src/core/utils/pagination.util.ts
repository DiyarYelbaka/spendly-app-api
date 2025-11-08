/**
 * Pagination Utility (Sayfalama Yardımcı Fonksiyonları)
 * 
 * Bu dosya, sayfalama (pagination) hesaplamaları için yardımcı fonksiyonlar içerir.
 * 
 * Utility (Yardımcı) Nedir?
 * Utility, ortak işlemler için kullanılan yardımcı fonksiyonlardır.
 * Bu fonksiyonlar, farklı yerlerde tekrar kullanılabilir.
 */

// PaginationDto import ediliyor
import { PaginationDto } from '../dto/paginated-response.dto';

/**
 * PaginationParams Interface (Arayüz)
 * 
 * Bu arayüz, sayfalama parametrelerini tanımlar.
 * 
 * Interface Nedir?
 * Interface, bir nesnenin hangi alanlara sahip olması gerektiğini belirten bir yapıdır.
 */
export interface PaginationParams {
  /**
   * page: Sayfa numarası
   * 
   * Hangi sayfanın gösterileceğini belirtir.
   * 
   * number: Sayı tipinde (örneğin: 1, 2, 5)
   */
  page: number;

  /**
   * limit: Sayfa başına kayıt sayısı
   * 
   * Bir sayfada kaç kayıt gösterileceğini belirtir.
   * 
   * number: Sayı tipinde (örneğin: 20, 50, 100)
   */
  limit: number;

  /**
   * skip: Atlanacak kayıt sayısı
   * 
   * Veritabanı sorgusunda kaç kayıt atlanacağını belirtir.
   * 
   * number: Sayı tipinde
   * 
   * Hesaplama: skip = (page - 1) * limit
   * Örnek: page=2, limit=20 → skip=20 (ilk 20 kayıt atlanır)
   */
  skip: number;
}

/**
 * PaginationResult Interface (Arayüz)
 * 
 * Bu arayüz, sayfalama sonuç bilgilerini tanımlar.
 * Frontend'e döndürülecek sayfalama bilgilerini içerir.
 * React Native AdvancedList bileşeni için camelCase formatında.
 */
export interface PaginationResult {
  /**
   * totalResults: Toplam kayıt sayısı (camelCase)
   * 
   * Tüm kayıtların toplam sayısı (sayfalama olmadan).
   * 
   * number: Sayı tipinde (örneğin: 100, 500, 1000)
   */
  totalResults: number;

  /**
   * totalPages: Toplam sayfa sayısı (camelCase)
   * 
   * Toplam kaç sayfa olduğunu belirtir.
   * Hesaplama: Math.ceil(totalResults / perPage)
   * 
   * number: Sayı tipinde (örneğin: 5, 10, 25)
   */
  totalPages: number;

  /**
   * currentPage: Mevcut sayfa numarası (camelCase)
   * 
   * Kullanıcının hangi sayfada olduğunu belirtir.
   * 
   * number: Sayı tipinde (örneğin: 1, 2, 5)
   */
  currentPage: number;

  /**
   * perPage: Sayfa başına kayıt sayısı (camelCase)
   * 
   * Bir sayfada kaç kayıt gösterildiğini belirtir.
   * 
   * number: Sayı tipinde (örneğin: 20, 50, 100)
   */
  perPage: number;
}

/**
 * parsePagination: Sayfalama parametrelerini işleyen fonksiyon
 * 
 * Bu fonksiyon, URL'den gelen sayfalama parametrelerini işler ve standart değerlere çevirir.
 * 
 * @param page: number | string - Sayfa numarası (opsiyonel)
 *   URL'den string olarak gelebilir (örneğin: "1", "2")
 *   Veya number olarak gelebilir (örneğin: 1, 2)
 * 
 * @param results: number | string - Sayfa başına kayıt sayısı (opsiyonel)
 *   URL'den string olarak gelebilir (örneğin: "20", "50")
 *   Veya number olarak gelebilir (örneğin: 20, 50)
 * 
 * @returns PaginationParams - İşlenmiş sayfalama parametreleri
 *   - page: Sayfa numarası (min: 1)
 *   - limit: Sayfa başına kayıt sayısı (min: 1, max: 100)
 *   - skip: Atlanacak kayıt sayısı (hesaplanır)
 * 
 * İş Akışı:
 * 1. page parametresi işlenir (string → number, min: 1)
 * 2. results parametresi işlenir (string → number, min: 1, max: 100)
 * 3. skip hesaplanır (skip = (page - 1) * limit)
 * 4. Sonuçlar döndürülür
 * 
 * Örnek Kullanım:
 * parsePagination("2", "20")
 * → { page: 2, limit: 20, skip: 20 }
 * 
 * parsePagination(undefined, undefined)
 * → { page: 1, limit: 20, skip: 0 } (varsayılan değerler)
 */
export function parsePagination(
  page?: number | string,
  results?: number | string,
): PaginationParams {
  /**
   * ADIM 1: Sayfa Numarasını İşle
   * 
   * page ? ... : 1: Eğer page gönderilmişse işle, yoksa 1 kullan (varsayılan)
   * 
   * parseInt(String(page), 10): String'i number'a çevirir
   *   - String(page): page'i string'e çevirir (zaten string ise değişmez)
   *   - 10: 10 tabanında (decimal) sayıya çevirir
   *   - || 1: Eğer parseInt başarısız olursa (NaN), 1 kullan
   * 
   * Math.max(1, ...): En az 1 olmalıdır
   *   - Negatif sayılar veya 0 kabul edilmez
   *   - Örnek: -5 → 1, 0 → 1, 1 → 1, 5 → 5
   * 
   * Örnek:
   *   page = "2" → parseInt("2", 10) = 2 → Math.max(1, 2) = 2
   *   page = "-5" → parseInt("-5", 10) = -5 → Math.max(1, -5) = 1
   *   page = undefined → 1 (varsayılan)
   */
  const parsedPage = page
    ? Math.max(1, parseInt(String(page), 10) || 1)
    : 1;
  
  /**
   * ADIM 2: Sayfa Başına Kayıt Sayısını İşle
   * 
   * results ? ... : 20: Eğer results gönderilmişse işle, yoksa 20 kullan (varsayılan)
   * 
   * parseInt(String(results), 10): String'i number'a çevirir
   *   || 20: Eğer parseInt başarısız olursa (NaN), 20 kullan
   * 
   * Math.max(1, ...): En az 1 olmalıdır
   *   - Negatif sayılar veya 0 kabul edilmez
   * 
   * Math.min(100, ...): En fazla 100 olabilir
   *   - Çok büyük sayılar performans sorunlarına yol açabilir
   *   - Örnek: 200 → 100, 50 → 50, 1 → 1
   * 
   * Örnek:
   *   results = "20" → parseInt("20", 10) = 20 → Math.max(1, 20) = 20 → Math.min(100, 20) = 20
   *   results = "200" → parseInt("200", 10) = 200 → Math.max(1, 200) = 200 → Math.min(100, 200) = 100
   *   results = undefined → 20 (varsayılan)
   */
  const parsedLimit = results
    ? Math.min(100, Math.max(1, parseInt(String(results), 10) || 20))
    : 20;
  
  /**
   * ADIM 3: Atlanacak Kayıt Sayısını Hesapla
   * 
   * skip: Veritabanı sorgusunda kaç kayıt atlanacağını belirtir.
   * 
   * Formül: skip = (page - 1) * limit
   * 
   * Örnek:
   *   page=1, limit=20 → skip = (1-1) * 20 = 0 (hiç kayıt atlanmaz)
   *   page=2, limit=20 → skip = (2-1) * 20 = 20 (ilk 20 kayıt atlanır)
   *   page=3, limit=20 → skip = (3-1) * 20 = 40 (ilk 40 kayıt atlanır)
   * 
   * Neden (page - 1)?
   * - Sayfa 1'de hiç kayıt atlanmaz (skip=0)
   * - Sayfa 2'de ilk sayfadaki kayıtlar atlanır (skip=limit)
   * - Sayfa 3'te ilk iki sayfadaki kayıtlar atlanır (skip=2*limit)
   */
  const skip = (parsedPage - 1) * parsedLimit;

  /**
   * ADIM 4: Sonuçları Döndür
   * 
   * return: İşlenmiş sayfalama parametreleri
   *   - page: Sayfa numarası
   *   - limit: Sayfa başına kayıt sayısı
   *   - skip: Atlanacak kayıt sayısı
   */
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
  };
}

/**
 * createPaginationResult: Sayfalama sonuç nesnesi oluşturan fonksiyon
 * 
 * Bu fonksiyon, frontend'e döndürülecek sayfalama bilgilerini oluşturur.
 * React Native AdvancedList bileşeni için camelCase formatında.
 * 
 * @param total: number - Toplam kayıt sayısı
 *   Tüm kayıtların toplam sayısı (sayfalama olmadan)
 * 
 * @param page: number - Mevcut sayfa numarası
 *   Kullanıcının hangi sayfada olduğu
 * 
 * @param limit: number - Sayfa başına kayıt sayısı
 *   Bir sayfada kaç kayıt gösterildiği
 * 
 * @returns PaginationResult - Sayfalama sonuç bilgileri (camelCase)
 *   - totalResults: Toplam kayıt sayısı
 *   - totalPages: Toplam sayfa sayısı
 *   - currentPage: Mevcut sayfa numarası
 *   - perPage: Sayfa başına kayıt sayısı
 * 
 * İş Akışı:
 * 1. Toplam sayfa sayısı hesaplanır (Math.ceil(total / limit))
 * 2. Sayfalama sonuç nesnesi oluşturulur (camelCase formatında)
 * 3. Sonuç döndürülür
 * 
 * Örnek Kullanım:
 * createPaginationResult(100, 2, 20)
 * → {
 *     totalResults: 100,
 *     totalPages: 5,
 *     currentPage: 2,
 *     perPage: 20
 *   }
 */
export function createPaginationResult(
  total: number,
  page: number,
  limit: number,
): PaginationDto {
  /**
   * Toplam Sayfa Sayısını Hesapla
   * 
   * Math.ceil(total / limit): Toplam kayıt sayısını sayfa başına kayıt sayısına bölerek
   * yukarı yuvarlar (örneğin: 100 kayıt, 20 kayıt/sayfa → 5 sayfa)
   */
  const totalPages = Math.ceil(total / limit);

  /**
   * Sayfalama Sonuç Nesnesi Oluştur (camelCase)
   * 
   * return: Sayfalama bilgilerini içeren nesne
   *   - totalResults: Toplam kayıt sayısı
   *   - totalPages: Toplam sayfa sayısı (hesaplanır)
   *   - currentPage: Mevcut sayfa numarası (page parametresinden gelir)
   *   - perPage: Sayfa başına kayıt sayısı (limit parametresinden gelir)
   */
  return {
    totalResults: total,
    totalPages,
    currentPage: page,
    perPage: limit,
  };
}

