/**
 * Entity Mapper Utility (Varlık Dönüştürücü Yardımcı Fonksiyonları)
 * 
 * Bu dosya, Prisma modellerini API yanıt formatına çeviren yardımcı fonksiyonlar içerir.
 * 
 * Utility (Yardımcı) Nedir?
 * Utility, ortak işlemler için kullanılan yardımcı fonksiyonlardır.
 * Bu fonksiyonlar, farklı yerlerde tekrar kullanılabilir.
 * 
 * Bu Dosyanın Amacı:
 * 1. Prisma modellerini API yanıt formatına çevirmek
 * 2. camelCase → snake_case dönüşümü yapmak (API tutarlılığı için)
 * 3. Veri formatlamak (tarih, Decimal, vb.)
 */

/**
 * toSnakeCase: camelCase string'i snake_case'e çeviren fonksiyon
 * 
 * Bu fonksiyon, bir string'in içindeki büyük harfleri küçük harfe çevirir ve önüne alt çizgi ekler.
 * 
 * @param str: string - Dönüştürülecek string
 *   Örnek: "categoryId", "createdAt", "isActive"
 * 
 * @returns string - Dönüştürülmüş string
 *   Örnek: "category_id", "created_at", "is_active"
 * 
 * İş Akışı:
 * 1. String içindeki büyük harfleri bulur (regex: /[A-Z]/g)
 * 2. Her büyük harfi küçük harfe çevirir ve önüne alt çizgi ekler
 * 3. Sonucu döndürür
 * 
 * Örnek:
 *   "categoryId" → "category_id"
 *   "createdAt" → "created_at"
 *   "isActive" → "is_active"
 * 
 * Neden Snake Case?
 * - API tutarlılığı için (tüm API yanıtları snake_case)
 * - Frontend'in beklediği format
 * - Veritabanı kolon isimleri genellikle snake_case
 */
function toSnakeCase(str: string): string {
  /**
   * replace(): String içindeki eşleşen karakterleri değiştirir
   * 
   * /[A-Z]/g: Regex (düzenli ifade) pattern
   *   - [A-Z]: Büyük harfler (A'dan Z'ye)
   *   - g: Global (tüm eşleşmeleri bul)
   * 
   * (letter) => `_${letter.toLowerCase()}`: Her büyük harf için çalışan fonksiyon
   *   - letter: Bulunan büyük harf (örneğin: "I", "A")
   *   - letter.toLowerCase(): Küçük harfe çevirir (örneğin: "i", "a")
   *   - `_${...}`: Önüne alt çizgi ekler (örneğin: "_i", "_a")
   * 
   * Örnek:
   *   "categoryId" → "I" bulunur → "_i" ile değiştirilir → "category_id"
   */
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * convertKeysToSnakeCase: Nesne anahtarlarını özyinelemeli (recursive) olarak snake_case'e çeviren fonksiyon
 * 
 * Bu fonksiyon, bir nesnenin tüm anahtarlarını (key) snake_case'e çevirir.
 * İç içe nesneler (nested objects) ve diziler (arrays) için de çalışır.
 * 
 * @param obj: any - Dönüştürülecek nesne
 *   Örnek: { categoryId: "...", createdAt: "...", user: { userId: "..." } }
 * 
 * @returns any - Dönüştürülmüş nesne
 *   Örnek: { category_id: "...", created_at: "...", user: { user_id: "..." } }
 * 
 * İş Akışı:
 * 1. Null veya undefined kontrolü yapılır
 * 2. Dizi kontrolü yapılır (dizideki her eleman için özyinelemeli çağrılır)
 * 3. Nesne kontrolü yapılır (nesnedeki her anahtar için özyinelemeli çağrılır)
 * 4. Diğer tipler (string, number, boolean) olduğu gibi döndürülür
 * 
 * Özyineleme (Recursion) Nedir?
 * Özyineleme, bir fonksiyonun kendisini çağırmasıdır.
 * Bu sayede iç içe nesneler ve diziler işlenebilir.
 * 
 * Örnek:
 *   { categoryId: "123", user: { userId: "456" } }
 *   → { category_id: "123", user: { user_id: "456" } }
 */
function convertKeysToSnakeCase(obj: any): any {
  /**
   * ADIM 1: Null veya Undefined Kontrolü
   * 
   * Eğer nesne null veya undefined ise, olduğu gibi döndürülür.
   * Çünkü null/undefined'ı dönüştürmeye gerek yoktur.
   */
  if (obj === null || obj === undefined) {
    return obj;
  }

  /**
   * ADIM 2: Dizi Kontrolü
   * 
   * Eğer nesne bir dizi ise, dizideki her eleman için özyinelemeli olarak çağrılır.
   * 
   * Array.isArray(): Bir değişkenin dizi olup olmadığını kontrol eder
   * 
   * map(): Dizideki her eleman için fonksiyon çalıştırır
   *   convertKeysToSnakeCase: Her eleman için tekrar çağrılır (özyineleme)
   * 
   * Örnek:
   *   [{ categoryId: "1" }, { categoryId: "2" }]
   *   → [{ category_id: "1" }, { category_id: "2" }]
   */
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }

  /**
   * ADIM 3: Nesne Kontrolü
   * 
   * Eğer nesne bir nesne ise (object), içindeki her anahtarı snake_case'e çevirir.
   * 
   * typeof obj === 'object': Nesne tipinde mi?
   * obj.constructor === Object: Sadece düz nesne mi? (Date, Array gibi özel nesneler değil)
   * 
   * for...in: Nesnedeki her anahtar için döngü
   *   Object.prototype.hasOwnProperty.call(): Anahtarın nesneye ait olup olmadığını kontrol eder
   *     (miras alınan özellikler değil, sadece kendi özellikleri)
   * 
   * toSnakeCase(key): Anahtarı snake_case'e çevirir
   * convertKeysToSnakeCase(obj[key]): Değeri özyinelemeli olarak işler
   *   (Eğer değer de bir nesne veya dizi ise, onu da dönüştürür)
   */
  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = toSnakeCase(key);
        converted[snakeKey] = convertKeysToSnakeCase(obj[key]);
      }
    }
    return converted;
  }

  /**
   * ADIM 4: Diğer Tipler
   * 
   * Eğer nesne string, number, boolean gibi bir tip ise, olduğu gibi döndürülür.
   * Çünkü bu tiplerin anahtarları yoktur, sadece değerleridir.
   */
  return obj;
}

/**
 * formatCategory: Kategori varlığını API yanıt formatına çeviren fonksiyon
 * 
 * Bu fonksiyon, Prisma'dan gelen kategori verisini frontend'in beklediği formata çevirir.
 * 
 * @param category: any - Prisma'dan gelen kategori verisi
 *   Örnek: { id: "...", name: "Yemek", sortOrder: 1, isActive: true, ... }
 * 
 * @returns any - Formatlanmış kategori verisi
 *   Örnek: { id: "...", name: "Yemek", sort_order: 1, is_active: true, ... }
 * 
 * İş Akışı:
 * 1. Temel alanlar kopyalanır (id, name, type, icon, color, description)
 * 2. camelCase alanlar snake_case'e çevrilir (sortOrder → sort_order, isActive → is_active)
 * 3. Tarih alanları eklenir (created_at, updated_at - varsa)
 * 4. İstatistik alanları eklenir (stats, transaction_count - varsa)
 * 
 * Neden Bu Fonksiyon?
 * - Prisma, camelCase kullanır (sortOrder, isActive)
 * - API, snake_case kullanır (sort_order, is_active)
 * - Frontend'in beklediği formatı sağlamak için
 */
export function formatCategory(category: any): any {
  /**
   * Formatlanmış Kategori Nesnesi Oluştur
   * 
   * return: Frontend'in beklediği formatta kategori verisi
   * 
   * Temel Alanlar:
   *   - id, name, type, icon, color, description: Olduğu gibi kopyalanır
   * 
   * camelCase → snake_case Dönüşümü:
   *   - sortOrder → sort_order
   *   - isActive → is_active
   *   - isDefault → is_default
   *   - createdAt → created_at
   *   - updatedAt → updated_at
   * 
   * Spread Operator (...) Kullanımı:
   *   ...(category.updatedAt && { updated_at: category.updatedAt }):
   *     Eğer updatedAt varsa, updated_at alanını ekle
   *     Yoksa ekleme (opsiyonel alan)
   * 
   *   ...(category.stats && { stats: category.stats }):
   *     Eğer stats varsa, stats alanını ekle
   *     Yoksa ekleme (opsiyonel alan)
   * 
   *   ...(category._count && { transaction_count: category._count.transactions }):
   *     Eğer _count varsa, transaction_count alanını ekle
   *     _count, Prisma'nın ilişkili kayıt sayısını veren özel alanıdır
   */
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
    ...(category._count && {
      transaction_count: category._count.transactions,
    }),
  };
}

/**
 * formatTransaction: İşlem varlığını API yanıt formatına çeviren fonksiyon
 * 
 * Bu fonksiyon, Prisma'dan gelen işlem verisini frontend'in beklediği formata çevirir.
 * 
 * @param transaction: any - Prisma'dan gelen işlem verisi
 *   Örnek: { id: "...", amount: Decimal("1500.50"), categoryId: "...", ... }
 * 
 * @returns any - Formatlanmış işlem verisi
 *   Örnek: { id: "...", amount: 1500.50, category_id: "...", ... }
 * 
 * İş Akışı:
 * 1. Temel alanlar kopyalanır (id, type, description, notes)
 * 2. amount Decimal'den number'a çevrilir
 * 3. category ilişkisi formatlanır (varsa)
 * 4. categoryId snake_case'e çevrilir (category_id)
 * 5. date formatlanır (Date → ISO string → YYYY-MM-DD)
 * 6. Tarih alanları eklenir (created_at, updated_at - varsa)
 */
export function formatTransaction(transaction: any): any {
  /**
   * Formatlanmış İşlem Nesnesi Oluştur
   * 
   * return: Frontend'in beklediği formatta işlem verisi
   */
  return {
    /**
     * Temel Alanlar
     * 
     * id, type, description, notes: Olduğu gibi kopyalanır
     */
    id: transaction.id,
    
    /**
     * amount: İşlem tutarı
     * 
     * Prisma, para miktarlarını Decimal tipinde saklar (hassasiyet için).
     * Ancak JavaScript'te number olarak kullanmak daha kolaydır.
     * 
     * transaction.amount?.toNumber?.():
     *   - ?. (optional chaining): Eğer amount varsa ve toNumber fonksiyonu varsa çağır
     *   - toNumber(): Decimal'i number'a çevirir
     *   - || transaction.amount: Eğer toNumber yoksa, olduğu gibi kullan (zaten number ise)
     * 
     * Örnek:
     *   Decimal("1500.50") → 1500.50 (number)
     */
    amount: transaction.amount?.toNumber?.() || transaction.amount,
    
    type: transaction.type,
    description: transaction.description,
    
    /**
     * category: Kategori bilgisi (ilişkili veri)
     * 
     * Eğer kategori ilişkisi yüklenmişse (include ile), kategori bilgileri formatlanır.
     * 
     * transaction.category ? ... : undefined:
     *   - Eğer category varsa → Formatlanmış kategori bilgisi
     *   - Yoksa → undefined (opsiyonel alan)
     * 
     * Kategori Bilgileri:
     *   - id, name, icon, color: Kategori hakkında temel bilgiler
     *   - Diğer alanlar (description, sortOrder, vb.) eklenmez (gereksiz)
     */
    category: transaction.category
      ? {
          id: transaction.category.id,
          name: transaction.category.name,
          icon: transaction.category.icon,
          color: transaction.category.color,
        }
      : undefined,
    
    /**
     * category_id: Kategori ID'si
     * 
     * categoryId → category_id (snake_case'e çevrilir)
     */
    category_id: transaction.categoryId,
    
    /**
     * date: İşlem tarihi
     * 
     * Tarih formatı: YYYY-MM-DD (ISO8601 tarih formatı, sadece tarih kısmı)
     * 
     * transaction.date ? ... : undefined:
     *   - Eğer date varsa → Formatlanmış tarih
     *   - Yoksa → undefined (opsiyonel alan)
     * 
     * typeof transaction.date === 'string':
     *   - Eğer zaten string ise → Olduğu gibi kullan
     *   - Date nesnesi ise → toISOString().split('T')[0] ile formatla
     * 
     * toISOString(): Date nesnesini ISO8601 formatına çevirir
     *   Örnek: "2025-01-21T10:30:00.000Z"
     * 
     * .split('T')[0]: "T" karakterinden böler ve ilk kısmı alır
     *   Örnek: "2025-01-21T10:30:00.000Z" → ["2025-01-21", "10:30:00.000Z"] → "2025-01-21"
     */
    date: transaction.date
      ? (typeof transaction.date === 'string'
          ? transaction.date
          : transaction.date.toISOString().split('T')[0])
      : undefined,
    
    notes: transaction.notes,
    
    /**
     * created_at: Oluşturulma tarihi
     * 
     * createdAt → created_at (snake_case'e çevrilir)
     */
    created_at: transaction.createdAt,
    
    /**
     * updated_at: Güncellenme tarihi (opsiyonel)
     * 
     * Eğer updatedAt varsa, updated_at alanını ekle.
     * Yoksa ekleme (opsiyonel alan).
     */
    ...(transaction.updatedAt && { updated_at: transaction.updatedAt }),
  };
}

/**
 * formatEntity: Genel varlık formatlayıcı fonksiyon
 * 
 * Bu fonksiyon, basit varlıklar için camelCase → snake_case dönüşümü yapar.
 * 
 * @param entity: any - Dönüştürülecek varlık
 *   Örnek: { userId: "...", createdAt: "...", isActive: true }
 * 
 * @returns any - Dönüştürülmüş varlık
 *   Örnek: { user_id: "...", created_at: "...", is_active: true }
 * 
 * İş Akışı:
 * 1. convertKeysToSnakeCase fonksiyonunu çağırır
 * 2. Tüm anahtarları snake_case'e çevirir
 * 3. İç içe nesneler ve diziler için de çalışır
 * 
 * Ne Zaman Kullanılır?
 * - Basit varlıklar için (sadece anahtar dönüşümü yeterliyse)
 * - Özel formatlamaya gerek yoksa
 * 
 * Ne Zaman Kullanılmaz?
 * - Özel formatlamaya ihtiyaç varsa (örneğin: Decimal → number, Date → string)
 *   Bu durumda formatCategory veya formatTransaction gibi özel fonksiyonlar kullanılır
 * 
 * Örnek Kullanım:
 * formatEntity({ userId: "123", createdAt: new Date() })
 * → { user_id: "123", created_at: Date object }
 * 
 * NOT: Date nesneleri olduğu gibi kalır, string'e çevrilmez.
 * Eğer Date'i string'e çevirmek istiyorsanız, özel formatlayıcı kullanın.
 */
export function formatEntity(entity: any): any {
  /**
   * convertKeysToSnakeCase Fonksiyonunu Çağır
   * 
   * Bu fonksiyon, nesnenin tüm anahtarlarını snake_case'e çevirir.
   * İç içe nesneler ve diziler için de çalışır (özyinelemeli).
   */
  return convertKeysToSnakeCase(entity);
}

