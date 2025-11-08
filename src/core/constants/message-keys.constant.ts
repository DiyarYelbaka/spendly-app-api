/**
 * MessageKey Enum (Mesaj Anahtarları Sabit Değerler Listesi)
 * 
 * Bu enum, uygulamada kullanılan tüm mesaj anahtarlarını merkezi olarak tanımlar.
 * 
 * Enum Nedir?
 * Enum, bir değişkenin alabileceği sabit değerleri tanımlar.
 * Bu sayede mesaj anahtarları tutarlı olur ve yazım hataları önlenir.
 * 
 * Mesaj Anahtarı Nedir?
 * Mesaj anahtarı, frontend'de çeviri (translation) için kullanılan bir anahtardır.
 * Frontend, bu anahtarı kullanarak kullanıcıya uygun mesajı gösterir.
 * 
 * Bu Enum'un Amacı:
 * 1. Tüm mesaj anahtarlarını merkezi olarak tanımlamak
 * 2. Tutarlı mesaj yönetimi sağlamak
 * 3. Frontend'de çeviri desteği sağlamak
 * 4. Yazım hatalarını önlemek
 * 
 * Mesaj Anahtarları Kategorileri:
 * - General Success: Genel başarı mesajları
 * - Auth Messages: Kimlik doğrulama mesajları
 * - Category Messages: Kategori mesajları
 * - Transaction Messages: İşlem mesajları
 * - Analytics Messages: Analitik mesajları
 */
export enum MessageKey {
  /**
   * General Success (Genel Başarı Mesajları)
   * 
   * Genel işlemler için kullanılan başarı mesajları.
   */
  SUCCESS = 'SUCCESS',        // Genel başarı mesajı
  CREATED = 'CREATED',        // Oluşturuldu mesajı
  UPDATED = 'UPDATED',        // Güncellendi mesajı
  DELETED = 'DELETED',        // Silindi mesajı
  RETRIEVED = 'RETRIEVED',    // Getirildi mesajı

  /**
   * Auth Messages (Kimlik Doğrulama Mesajları)
   * 
   * Kimlik doğrulama işlemleri için kullanılan mesajlar.
   */
  AUTH_REGISTER_SUCCESS = 'AUTH_REGISTER_SUCCESS',              // Kayıt başarılı
  AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',                   // Giriş başarılı
  AUTH_LOGOUT_SUCCESS = 'AUTH_LOGOUT_SUCCESS',                 // Çıkış başarılı
  AUTH_TOKEN_REFRESH_SUCCESS = 'AUTH_TOKEN_REFRESH_SUCCESS',    // Token yenilendi
  AUTH_PROFILE_RETRIEVED = 'AUTH_PROFILE_RETRIEVED',            // Profil bilgileri alındı

  /**
   * Category Messages (Kategori Mesajları)
   * 
   * Kategori işlemleri için kullanılan mesajlar.
   */
  CATEGORY_CREATED = 'CATEGORY_CREATED',        // Kategori oluşturuldu
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',        // Kategori güncellendi
  CATEGORY_DELETED = 'CATEGORY_DELETED',        // Kategori silindi
  CATEGORY_RETRIEVED = 'CATEGORY_RETRIEVED',    // Kategori getirildi
  CATEGORIES_RETRIEVED = 'CATEGORIES_RETRIEVED', // Kategoriler getirildi

  /**
   * Transaction Messages (İşlem Mesajları)
   * 
   * İşlem işlemleri için kullanılan mesajlar.
   */
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',        // İşlem oluşturuldu
  TRANSACTION_UPDATED = 'TRANSACTION_UPDATED',        // İşlem güncellendi
  TRANSACTION_DELETED = 'TRANSACTION_DELETED',        // İşlem silindi
  TRANSACTION_RETRIEVED = 'TRANSACTION_RETRIEVED',    // İşlem getirildi
  TRANSACTIONS_RETRIEVED = 'TRANSACTIONS_RETRIEVED',  // İşlemler getirildi

  /**
   * Analytics Messages (Analitik Mesajları)
   * 
   * Analitik işlemleri için kullanılan mesajlar.
   */
  ANALYTICS_DASHBOARD_RETRIEVED = 'ANALYTICS_DASHBOARD_RETRIEVED', // Dashboard verileri getirildi
  ANALYTICS_SUMMARY_RETRIEVED = 'ANALYTICS_SUMMARY_RETRIEVED',     // Özet verileri getirildi
}

/**
 * MessageTexts Constant (Mesaj Metinleri Sabit Değerleri)
 * 
 * Bu sabit değer, her mesaj anahtarı için insan tarafından okunabilir mesajları içerir.
 * 
 * Record<MessageKey, string> Nedir?
 * Record, TypeScript'te key-value çiftlerini temsil eden bir tipdir.
 * Bu durumda:
 *   - Key: MessageKey enum değeri (örneğin: MessageKey.SUCCESS)
 *   - Value: String (mesaj metni)
 * 
 * Bu Sabit Değerin Amacı:
 * 1. Her mesaj anahtarı için Türkçe mesaj sağlamak
 * 2. Frontend'de çeviri yapılamazsa, varsayılan mesaj olarak kullanmak
 * 3. Mesajları merkezi olarak yönetmek
 * 
 * Kullanım:
 * MessageTexts[MessageKey.SUCCESS] → "İşlem başarılı"
 * MessageTexts[MessageKey.CATEGORY_CREATED] → "Kategori başarıyla oluşturuldu"
 * 
 * NOT: Frontend genellikle message_key'den çeviri yapar.
 * Bu mesajlar, çeviri yapılamazsa veya geliştirme sırasında kullanılır.
 */
export const MessageTexts: Record<MessageKey, string> = {
  /**
   * General Success Messages (Genel Başarı Mesajları)
   */
  [MessageKey.SUCCESS]: 'İşlem başarılı',
  [MessageKey.CREATED]: 'Kayıt başarıyla oluşturuldu',
  [MessageKey.UPDATED]: 'Kayıt başarıyla güncellendi',
  [MessageKey.DELETED]: 'Kayıt başarıyla silindi',
  [MessageKey.RETRIEVED]: 'Kayıt başarıyla getirildi',

  /**
   * Auth Messages (Kimlik Doğrulama Mesajları)
   */
  [MessageKey.AUTH_REGISTER_SUCCESS]: 'Kullanıcı başarıyla oluşturuldu',
  [MessageKey.AUTH_LOGIN_SUCCESS]: 'Giriş başarılı',
  [MessageKey.AUTH_LOGOUT_SUCCESS]: 'Çıkış başarılı',
  [MessageKey.AUTH_TOKEN_REFRESH_SUCCESS]: 'Token yenilendi',
  [MessageKey.AUTH_PROFILE_RETRIEVED]: 'Profil bilgileri alındı',

  /**
   * Category Messages (Kategori Mesajları)
   */
  [MessageKey.CATEGORY_CREATED]: 'Kategori başarıyla oluşturuldu',
  [MessageKey.CATEGORY_UPDATED]: 'Kategori başarıyla güncellendi',
  [MessageKey.CATEGORY_DELETED]: 'Kategori başarıyla silindi',
  [MessageKey.CATEGORY_RETRIEVED]: 'Kategori başarıyla getirildi',
  [MessageKey.CATEGORIES_RETRIEVED]: 'Kategoriler başarıyla getirildi',

  /**
   * Transaction Messages (İşlem Mesajları)
   */
  [MessageKey.TRANSACTION_CREATED]: 'İşlem başarıyla oluşturuldu',
  [MessageKey.TRANSACTION_UPDATED]: 'İşlem başarıyla güncellendi',
  [MessageKey.TRANSACTION_DELETED]: 'İşlem başarıyla silindi',
  [MessageKey.TRANSACTION_RETRIEVED]: 'İşlem başarıyla getirildi',
  [MessageKey.TRANSACTIONS_RETRIEVED]: 'İşlemler başarıyla getirildi',

  /**
   * Analytics Messages (Analitik Mesajları)
   */
  [MessageKey.ANALYTICS_DASHBOARD_RETRIEVED]: 'Dashboard verileri başarıyla getirildi',
  [MessageKey.ANALYTICS_SUMMARY_RETRIEVED]: 'Özet verileri başarıyla getirildi',
};

