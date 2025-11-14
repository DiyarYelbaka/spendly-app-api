# Spendly API - Kapsamlı Dokümantasyon

Bu dokümantasyon, Spendly API backend projesinin tamamını anlamak için gereken tüm bilgileri içerir. Backend deneyimi olmayan geliştiriciler için de anlaşılır şekilde yazılmıştır.

## 📚 Dokümantasyon İçeriği

### 🚀 Başlangıç
- **[SETUP.md](./SETUP.md)** - Kurulum ve yapılandırma talimatları
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Proje yapısı ve mimari açıklamaları

### 📖 Detaylı Dokümantasyon
- **[MODULES.md](./MODULES.md)** - Tüm modüllerin detaylı açıklamaları
- **[ENDPOINTS.md](./ENDPOINTS.md)** - API endpoint'leri, örnek request/response'lar
- **[CORE.md](./CORE.md)** - Core modül bileşenleri (utils, filters, interceptors)
- **[DATABASE.md](./DATABASE.md)** - Veritabanı şeması ve modeller
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Kimlik doğrulama sistemi
- **[ERRORS.md](./ERRORS.md)** - Hata yönetimi ve hata kodları

### 📋 Geliştirme Planları
- **[PASSWORD_RESET_PLAN.md](./PASSWORD_RESET_PLAN.md)** - Şifremi Unuttum özelliği implementasyon planı

## 🎯 Proje Hakkında

**Spendly API**, gelir-gider takip mobil uygulaması için geliştirilmiş bir REST API backend'idir. NestJS framework'ü kullanılarak TypeScript ile yazılmıştır.

### Temel Özellikler
- ✅ Kullanıcı kaydı ve girişi (JWT authentication)
- ✅ Kategori yönetimi (gelir/gider kategorileri)
- ✅ İşlem yönetimi (gelir/gider işlemleri)
- ✅ Analitik ve raporlama (dashboard, özet)
- ✅ Sayfalama (pagination) ve filtreleme
- ✅ Standart hata yönetimi

### Teknoloji Stack
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 6.x
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

## 📁 Proje Yapısı

```
spendly-app-api/
├── src/
│   ├── main.ts                 # Uygulama giriş noktası
│   ├── app.module.ts           # Ana modül
│   ├── auth/                   # Kimlik doğrulama modülü
│   ├── categories/             # Kategori modülü
│   ├── transactions/           # İşlem modülü
│   ├── analytics/              # Analitik modülü
│   ├── core/                   # Core modül (ortak bileşenler)
│   └── config/                 # Yapılandırma dosyaları
├── prisma/
│   └── schema.prisma           # Veritabanı şeması
├── documentation/              # Bu dokümantasyon
└── package.json               # Proje bağımlılıkları
```

## 🏗️ Mimari Yapı

### Modüler Yapı
Proje, NestJS'in modüler yapısını kullanır. Her modül kendi controller, service ve DTO'larını içerir:

1. **Auth Module** - Kullanıcı kaydı, girişi, token yönetimi
2. **Categories Module** - Kategori CRUD işlemleri
3. **Transactions Module** - İşlem CRUD işlemleri
4. **Analytics Module** - Finansal analiz ve raporlama
5. **Core Module** - Ortak bileşenler (utils, filters, interceptors)

### Katmanlı Mimari
```
Request → Controller → Service → Prisma (Database)
         ↓
      Response
```

- **Controller**: HTTP isteklerini alır, DTO validasyonu yapar, service'e yönlendirir
- **Service**: İş mantığını (business logic) içerir, veritabanı işlemlerini yapar
- **Prisma**: Veritabanı ORM, veritabanı sorgularını yapar

## 🔐 Güvenlik

- JWT token tabanlı kimlik doğrulama
- Şifreler bcrypt ile hash'lenir
- CORS yapılandırması
- Helmet ile güvenlik başlıkları
- Input validation (class-validator)

## 📝 Notasyonlar

Bu dokümantasyonda kullanılan notasyonlar:

- `@Decorator` - NestJS decorator'ları
- `function()` - Fonksiyon tanımları
- `Type` - TypeScript tip tanımları
- `"string"` - String değerler
- `{ key: value }` - Object/JSON yapıları

## 🚦 Hızlı Başlangıç

1. **Kurulum**: [SETUP.md](./SETUP.md) dosyasını okuyun
2. **Yapılandırma**: Environment değişkenlerini ayarlayın
3. **Veritabanı**: Migration'ları çalıştırın
4. **Başlatma**: `yarn start:dev` komutu ile uygulamayı başlatın
5. **Test**: Swagger UI'den (`http://localhost:3001/api/docs`) API'yi test edin

## 📖 Okuma Sırası

Yeni başlayanlar için önerilen okuma sırası:

1. [SETUP.md](./SETUP.md) - Projeyi çalıştırmak için
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - Proje yapısını anlamak için
3. [AUTHENTICATION.md](./AUTHENTICATION.md) - Kimlik doğrulama sistemini anlamak için
4. [MODULES.md](./MODULES.md) - Her modülün ne yaptığını öğrenmek için
5. [ENDPOINTS.md](./ENDPOINTS.md) - API endpoint'lerini kullanmak için
6. [CORE.md](./CORE.md) - Core bileşenleri derinlemesine anlamak için
7. [ERRORS.md](./ERRORS.md) - Hata yönetimini anlamak için

## 🤝 Katkıda Bulunma

Bu dokümantasyon, projeyi anlamak ve geliştirmek için hazırlanmıştır. Eksik veya hatalı bilgi görürseniz lütfen bildirin.

## 📞 İletişim

Sorularınız için proje maintainer'larına ulaşabilirsiniz.

---

**Son Güncelleme**: 2025-01-08

