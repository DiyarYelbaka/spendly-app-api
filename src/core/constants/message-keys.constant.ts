/**
 * Message Keys Constants
 * Centralized message keys for consistent response messages
 */
export enum MessageKey {
  // General Success
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  RETRIEVED = 'RETRIEVED',

  // Auth Messages
  AUTH_REGISTER_SUCCESS = 'AUTH_REGISTER_SUCCESS',
  AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGOUT_SUCCESS = 'AUTH_LOGOUT_SUCCESS',
  AUTH_TOKEN_REFRESH_SUCCESS = 'AUTH_TOKEN_REFRESH_SUCCESS',
  AUTH_PROFILE_RETRIEVED = 'AUTH_PROFILE_RETRIEVED',

  // Category Messages
  CATEGORY_CREATED = 'CATEGORY_CREATED',
  CATEGORY_UPDATED = 'CATEGORY_UPDATED',
  CATEGORY_DELETED = 'CATEGORY_DELETED',
  CATEGORY_RETRIEVED = 'CATEGORY_RETRIEVED',
  CATEGORIES_RETRIEVED = 'CATEGORIES_RETRIEVED',

  // Transaction Messages
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_UPDATED = 'TRANSACTION_UPDATED',
  TRANSACTION_DELETED = 'TRANSACTION_DELETED',
  TRANSACTION_RETRIEVED = 'TRANSACTION_RETRIEVED',
  TRANSACTIONS_RETRIEVED = 'TRANSACTIONS_RETRIEVED',

  // Analytics Messages
  ANALYTICS_DASHBOARD_RETRIEVED = 'ANALYTICS_DASHBOARD_RETRIEVED',
  ANALYTICS_SUMMARY_RETRIEVED = 'ANALYTICS_SUMMARY_RETRIEVED',
}

/**
 * Message texts mapping
 * Human-readable messages for each message key
 */
export const MessageTexts: Record<MessageKey, string> = {
  [MessageKey.SUCCESS]: 'İşlem başarılı',
  [MessageKey.CREATED]: 'Kayıt başarıyla oluşturuldu',
  [MessageKey.UPDATED]: 'Kayıt başarıyla güncellendi',
  [MessageKey.DELETED]: 'Kayıt başarıyla silindi',
  [MessageKey.RETRIEVED]: 'Kayıt başarıyla getirildi',

  [MessageKey.AUTH_REGISTER_SUCCESS]: 'Kullanıcı başarıyla oluşturuldu',
  [MessageKey.AUTH_LOGIN_SUCCESS]: 'Giriş başarılı',
  [MessageKey.AUTH_LOGOUT_SUCCESS]: 'Çıkış başarılı',
  [MessageKey.AUTH_TOKEN_REFRESH_SUCCESS]: 'Token yenilendi',
  [MessageKey.AUTH_PROFILE_RETRIEVED]: 'Profil bilgileri alındı',

  [MessageKey.CATEGORY_CREATED]: 'Kategori başarıyla oluşturuldu',
  [MessageKey.CATEGORY_UPDATED]: 'Kategori başarıyla güncellendi',
  [MessageKey.CATEGORY_DELETED]: 'Kategori başarıyla silindi',
  [MessageKey.CATEGORY_RETRIEVED]: 'Kategori başarıyla getirildi',
  [MessageKey.CATEGORIES_RETRIEVED]: 'Kategoriler başarıyla getirildi',

  [MessageKey.TRANSACTION_CREATED]: 'İşlem başarıyla oluşturuldu',
  [MessageKey.TRANSACTION_UPDATED]: 'İşlem başarıyla güncellendi',
  [MessageKey.TRANSACTION_DELETED]: 'İşlem başarıyla silindi',
  [MessageKey.TRANSACTION_RETRIEVED]: 'İşlem başarıyla getirildi',
  [MessageKey.TRANSACTIONS_RETRIEVED]: 'İşlemler başarıyla getirildi',

  [MessageKey.ANALYTICS_DASHBOARD_RETRIEVED]: 'Dashboard verileri başarıyla getirildi',
  [MessageKey.ANALYTICS_SUMMARY_RETRIEVED]: 'Özet verileri başarıyla getirildi',
};

