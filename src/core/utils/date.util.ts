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

/**
 * parseDateString: Tarih string'ini timezone-safe şekilde parse eder
 * 
 * Bu fonksiyon, YYYY-MM-DD veya YYYY-MM-DD HH:mm formatındaki tarih string'ini Date nesnesine çevirir.
 * Timezone sorunlarını önlemek için local timezone'da parse eder.
 * 
 * @param dateString: string - Tarih string'i
 *   Format 1: "YYYY-MM-DD" (sadece tarih)
 *     Örnek: "2025-11-21"
 *   Format 2: "YYYY-MM-DD HH:mm" (tarih + saat)
 *     Örnek: "2025-11-21 15:30"
 * 
 * @returns Date - Parse edilmiş tarih (local timezone'da)
 *   Format 1: Date(2025-11-21 00:00:00 local time)
 *   Format 2: Date(2025-11-21 15:30:00 local time)
 * 
 * Neden Gerekli?
 * - new Date("2025-11-21") UTC olarak parse edilir
 * - Bu yüzden timezone farkı yüzünden bir önceki güne kaydedilebilir
 * - Örnek: Türkiye'de (UTC+3) gece 00:49'da yapılan işlem UTC'de hala önceki gün
 * 
 * Çözüm:
 * - Tarih string'ini local timezone'da parse ediyoruz
 * - "2025-11-21" → [2025, 10, 21] → new Date(2025, 10, 21)
 * - "2025-11-21 15:30" → [2025, 10, 21, 15, 30] → new Date(2025, 10, 21, 15, 30)
 * - Bu sayede hangi timezone'da olursa olsun, tarih doğru kaydedilir
 * 
 * Global Projeler İçin:
 * - Bu yaklaşım, kullanıcının bulunduğu timezone'a göre çalışır
 * - Server'ın timezone'u ne olursa olsun, tarih doğru kaydedilir
 * - Frontend'den timezone bilgisi gönderilirse, o da kullanılabilir (gelecek geliştirme)
 * 
 * Örnek Kullanım:
 * parseDateString("2025-11-21")
 * → Date(2025-11-21 00:00:00 local time)
 * 
 * parseDateString("2025-11-21 15:30")
 * → Date(2025-11-21 15:30:00 local time)
 */
export function parseDateString(dateString: string): Date {
  /**
   * Tarih string'inde saat bilgisi var mı kontrol et
   * 
   * "YYYY-MM-DD HH:mm" formatında boşluk ve iki nokta üst üste varsa saat bilgisi var demektir
   */
  const hasTime = dateString.includes(' ') && dateString.includes(':');

  if (hasTime) {
    /**
     * Format 2: Tarih + Saat (YYYY-MM-DD HH:mm)
     * 
     * Örnek: "2025-11-21 15:30"
     */
    const [datePart, timePart] = dateString.split(' ');
    
    // Tarih kısmını parse et: "2025-11-21" → [2025, 11, 21]
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Saat kısmını parse et: "15:30" → [15, 30]
    const [hour, minute] = timePart.split(':').map(Number);
    
    /**
     * Local timezone'da Date nesnesi oluştur (tarih + saat)
     * 
     * new Date(year, month - 1, day, hour, minute):
     *   - year: Yıl (2025)
     *   - month - 1: Ay (0-indexed, yani 10 = Kasım)
     *   - day: Gün (21)
     *   - hour: Saat (15)
     *   - minute: Dakika (30)
     * 
     * Bu constructor, local timezone'da belirtilen tarih ve saati oluşturur.
     * 
     * Örnek:
     *   new Date(2025, 10, 21, 15, 30) → 2025-11-21 15:30:00 local time
     */
    return new Date(year, month - 1, day, hour, minute || 0);
  } else {
    /**
     * Format 1: Sadece Tarih (YYYY-MM-DD)
     * 
     * Örnek: "2025-11-21"
     */
    // Sadece YYYY-MM-DD formatı ise
    // 'T00:00:00' ekleyerek JS'in bunu local time olarak yorumlamasını sağla, UTC varsayımından kaçın
    return new Date(`${dateString}T00:00:00`);
  }
}

/**
 * formatDateToString: Date nesnesini timezone-safe şekilde string'e çevirir
 * 
 * Bu fonksiyon, Date nesnesini YYYY-MM-DD veya YYYY-MM-DD HH:mm formatında string'e çevirir.
 * Timezone sorunlarını önlemek için local timezone'da formatlar.
 * 
 * @param date: Date - Formatlanacak tarih
 * 
 * @param includeTime: boolean - Saat bilgisini de dahil et (varsayılan: false)
 *   true: "YYYY-MM-DD HH:mm" formatında döner
 *   false: "YYYY-MM-DD" formatında döner
 * 
 * @returns string - Formatlanmış tarih string'i
 *   includeTime=false: "2025-11-21"
 *   includeTime=true: "2025-11-21 15:30"
 * 
 * Neden Gerekli?
 * - toISOString() UTC'ye çevirir ve timezone farkı yüzünden bir önceki güne düşebilir
 * - Local timezone'da formatlamak için bu fonksiyonu kullanıyoruz
 * 
 * Örnek Kullanım:
 * formatDateToString(new Date(2025, 10, 21, 15, 30))
 * → "2025-11-21" (includeTime=false)
 * 
 * formatDateToString(new Date(2025, 10, 21, 15, 30), true)
 * → "2025-11-21 15:30" (includeTime=true)
 */
export function formatDateToString(date: Date, includeTime: boolean = false): string {
  /**
   * Local timezone'da yıl, ay, gün, saat, dakika bilgilerini al
   * 
   * getFullYear(): Yıl (2025)
   * getMonth(): Ay (0-11 arası, 10 = Kasım)
   * getDate(): Gün (1-31 arası)
   * getHours(): Saat (0-23 arası)
   * getMinutes(): Dakika (0-59 arası)
   */
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 çünkü getMonth() 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  
  /**
   * Tarih kısmını oluştur
   * 
   * padStart(2, '0'): String'i 2 karakter yap, eksikse başına 0 ekle
   *   Örnek: "1" → "01", "11" → "11"
   */
  const dateStr = `${year}-${month}-${day}`;
  
  /**
   * Eğer saat bilgisi isteniyorsa, saat ve dakikayı da ekle
   */
  if (includeTime) {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hour}:${minute}`;
  }
  
  /**
   * Sadece tarih döndür
   */
  return dateStr;
}

