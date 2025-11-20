/**
 * Date Utility (Tarih Yardımcı Fonksiyonları)
 * 
 * Bu dosya, tarih işlemleri için yardımcı fonksiyonlar içerir.
 * 
 * Utility (Yardımcı) Nedir?
 * Utility, ortak işlemler için kullanılan yardımcı fonksiyonlardır.
 * Bu fonksiyonlar, farklı yerlerde tekrar kullanılabilir.
 */

/**
 * getDaysBetween: İki tarih arasındaki tüm günleri getiren fonksiyon
 * 
 * Bu fonksiyon, başlangıç ve bitiş tarihleri arasındaki tüm günleri
 * YYYY-MM-DD formatında string array olarak döndürür.
 * 
 * @param startDate: string - Başlangıç tarihi (ISO8601: YYYY-MM-DD)
 *   Örnek: "2025-01-01"
 * 
 * @param endDate: string - Bitiş tarihi (ISO8601: YYYY-MM-DD)
 *   Örnek: "2025-01-31"
 * 
 * @returns string[] - Tarih aralığındaki tüm günler (YYYY-MM-DD formatında)
 *   Örnek: ["2025-01-01", "2025-01-02", "2025-01-03", ..., "2025-01-31"]
 * 
 * İş Akışı:
 * 1. Başlangıç ve bitiş tarihlerini Date nesnesine çevirir
 * 2. Başlangıç tarihinden başlayarak, bitiş tarihine kadar her günü ekler
 * 3. Her günü YYYY-MM-DD formatında string olarak döndürür
 * 
 * Örnek Kullanım:
 * getDaysBetween("2025-01-01", "2025-01-03")
 * → ["2025-01-01", "2025-01-02", "2025-01-03"]
 * 
 * getDaysBetween("2025-01-15", "2025-01-15")
 * → ["2025-01-15"] (tek gün)
 * 
 * Neden YYYY-MM-DD String Formatı?
 * - Timezone sorunlarını önlemek için
 * - UTC timestamp kullanılsaydı, farklı timezone'larda farklı günler görünebilirdi
 * - Frontend'de direkt kullanılabilir
 * - Grafik kütüphaneleri genelde string tarih kabul eder
 * - Daha basit ve anlaşılır
 * 
 * Önemli Notlar:
 * - Başlangıç ve bitiş tarihleri dahildir (inclusive)
 * - Tarih formatı YYYY-MM-DD olmalıdır (ISO8601)
 * - Eğer startDate > endDate ise, boş array döndürür
 */
export function getDaysBetween(startDate: string, endDate: string): string[] {
  /**
   * ADIM 1: Tarihleri Date Nesnesine Çevir
   * 
   * new Date(dateString): String tarihi Date nesnesine çevirir
   *   - "2025-01-01" → Date object (2025-01-01 00:00:00 UTC)
   * 
   * split('T')[0]: Eğer tarih "2025-01-01T00:00:00.000Z" formatındaysa,
   *   sadece tarih kısmını alır ("2025-01-01")
   * 
   * Örnek:
   *   startDate = "2025-01-01" → new Date("2025-01-01")
   *   endDate = "2025-01-31" → new Date("2025-01-31")
   */
  const start = new Date(startDate.split('T')[0]);
  const end = new Date(endDate.split('T')[0]);

  /**
   * ADIM 2: Boş Array Oluştur
   * 
   * days: string[] - Tarih aralığındaki günleri tutacak array
   *   Başlangıçta boş, her gün eklendikçe dolacak
   */
  const days: string[] = [];

  /**
   * ADIM 3: Her Günü Array'e Ekle
   * 
   * for döngüsü: Başlangıç tarihinden başlayarak, bitiş tarihine kadar iterasyon yapar
   * 
   * let d = new Date(start): Başlangıç tarihinden başla
   *   new Date() kullanarak yeni bir Date nesnesi oluşturur (orijinal tarihi değiştirmez)
   * 
   * d <= end: Bitiş tarihine kadar devam et (dahil)
   * 
   * d.setDate(d.getDate() + 1): Bir sonraki güne geç
   *   - d.getDate(): Mevcut günü al (1-31 arası)
   *   - + 1: Bir gün ekle
   *   - setDate(): Tarihi güncelle
   *   - Bu işlem otomatik olarak ay ve yıl değişikliklerini de yönetir
   *     Örnek: 31 Ocak + 1 gün → 1 Şubat
   * 
   * toISOString().split('T')[0]: Date nesnesini YYYY-MM-DD formatına çevir
   *   - toISOString(): "2025-01-01T00:00:00.000Z" formatında string döndürür
   *   - split('T')[0]: Sadece tarih kısmını al ("2025-01-01")
   * 
   * days.push(...): Her günü array'e ekle
   * 
   * Örnek İterasyon:
   *   İlk: d = 2025-01-01 → days.push("2025-01-01") → d = 2025-01-02
   *   İkinci: d = 2025-01-02 → days.push("2025-01-02") → d = 2025-01-03
   *   Üçüncü: d = 2025-01-03 → days.push("2025-01-03") → d = 2025-01-04
   *   ...
   *   Son: d = 2025-01-31 → days.push("2025-01-31") → d = 2025-02-01 (döngü biter)
   */
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    /**
     * Her Günü YYYY-MM-DD Formatına Çevir ve Array'e Ekle
     * 
     * toISOString(): Date nesnesini ISO8601 formatında string'e çevirir
     *   Örnek: Date(2025-01-01) → "2025-01-01T00:00:00.000Z"
     * 
     * split('T')[0]: Sadece tarih kısmını al
     *   Örnek: "2025-01-01T00:00:00.000Z" → "2025-01-01"
     * 
     * push(): Array'e yeni eleman ekler
     */
    days.push(d.toISOString().split('T')[0]);
  }

  /**
   * ADIM 4: Sonuçları Döndür
   * 
   * return: Tarih aralığındaki tüm günleri içeren array
   *   Örnek: ["2025-01-01", "2025-01-02", "2025-01-03", ..., "2025-01-31"]
   */
  return days;
}

