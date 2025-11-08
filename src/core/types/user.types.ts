/**
 * User Types (Kullanıcı Tipleri)
 * 
 * Bu dosya, kimlik doğrulaması yapılmış kullanıcı için tip tanımlarını içerir.
 * 
 * Type (Tip) Nedir?
 * TypeScript'te tip, bir değişkenin hangi veri yapısına sahip olduğunu belirtir.
 * Tipler sayesinde:
 * - Kod daha güvenli olur (hangi alanların var olduğunu biliriz)
 * - IDE'de otomatik tamamlama çalışır
 * - Hataları erken yakalarız (derleme sırasında)
 */

/**
 * UserPayload Interface (Arayüz)
 * 
 * Bu arayüz, JWT token'dan çıkarılan veya request.user'dan alınan kullanıcı bilgilerini tanımlar.
 * 
 * Interface Nedir?
 * Interface, bir nesnenin hangi alanlara sahip olması gerektiğini belirten bir yapıdır.
 * TypeScript'te interface'ler, nesnelerin şeklini (shape) tanımlar.
 * 
 * Kullanım Yerleri:
 * - @CurrentUser() decorator'ı ile controller'larda kullanılır
 * - JWT token payload'ında kullanılır
 * - Middleware ve guard'larda kullanılır
 * 
 * Örnek Kullanım:
 * @Get('me')
 * async getProfile(@CurrentUser() user: UserPayload) {
 *   // user.id, user.email, user.name gibi bilgilere erişebiliriz
 *   return this.service.getProfile(user.id);
 * }
 */
export interface UserPayload {
  /**
   * id: Kullanıcının benzersiz ID'si
   * 
   * Bu ID, veritabanındaki kullanıcı kaydının birincil anahtarıdır (primary key).
   * UUID veya başka bir benzersiz tanımlayıcı olabilir.
   * 
   * string: Metin tipinde (örneğin: "550e8400-e29b-41d4-a716-446655440000")
   */
  id: string;

  /**
   * email: Kullanıcının email adresi
   * 
   * Kullanıcının giriş yaparken kullandığı email adresidir.
   * 
   * string: Metin tipinde (örneğin: "user@example.com")
   */
  email: string;

  /**
   * name: Kullanıcının adı
   * 
   * Kullanıcının tam adı veya görünen adı.
   * 
   * ?: Opsiyonel alan (undefined olabilir)
   *   Bazı kullanıcıların adı olmayabilir, bu yüzden opsiyoneldir.
   * 
   * string: Metin tipinde (örneğin: "Ahmet Yılmaz")
   */
  name?: string;
}

/**
 * UserContext Interface (Arayüz)
 * 
 * Bu arayüz, kullanıcının ek bağlam (context) bilgilerini tanımlar.
 * Frontend'de kullanıcı arayüzü için gerekli bilgileri içerir.
 * 
 * NOT: Bu arayüz şu anda kullanılmıyor olabilir, ancak gelecekte kullanılabilir.
 */
export interface UserContext {
  /**
   * preferences: Kullanıcı tercihleri
   * 
   * Kullanıcının uygulama ayarlarını ve tercihlerini içerir.
   * 
   * Record<string, any>: Key-value çiftleri (herhangi bir anahtar, herhangi bir değer)
   *   Örnek: { theme: "dark", language: "tr", currency: "TRY" }
   */
  preferences: Record<string, any>;

  /**
   * firstName: Kullanıcının adı (ilk isim)
   * 
   * Kullanıcının adının ilk kısmı.
   * 
   * string: Metin tipinde (örneğin: "Ahmet")
   */
  firstName: string;

  /**
   * initials: Kullanıcının baş harfleri
   * 
   * Kullanıcının ad ve soyadının baş harfleri.
   * Genellikle profil resmi yerine kullanılır.
   * 
   * string: Metin tipinde (örneğin: "AY" - Ahmet Yılmaz için)
   */
  initials: string;
}

