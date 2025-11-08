# Spendly API

Gelir-Gider Takip Mobil Uygulaması için REST API Backend

## 📚 Dokümantasyon

**ÖNEMLİ**: Projeyi anlamak için önce `documentation/` klasöründeki kapsamlı dokümantasyonu okuyun!

### 📁 Kapsamlı Dokümantasyon (Yeni)

```
documentation/
├── README.md              # Ana indeks ve genel bakış
├── SETUP.md              # Kurulum ve yapılandırma talimatları
├── ARCHITECTURE.md       # Proje yapısı ve mimari açıklamaları
├── MODULES.md            # Tüm modüllerin detaylı açıklamaları
├── ENDPOINTS.md          # API endpoint'leri ve örnek request/response'lar
├── DATABASE.md           # Veritabanı şeması ve modeller
├── AUTHENTICATION.md     # JWT kimlik doğrulama sistemi
├── CORE.md               # Core modül bileşenleri detayları
└── ERRORS.md             # Hata yönetimi ve hata kodları
```

### 🚀 Hızlı Başlangıç

**Yeni başlayanlar için önerilen okuma sırası:**

1. **[documentation/README.md](./documentation/README.md)** - Ana indeks ve genel bakış
2. **[documentation/SETUP.md](./documentation/SETUP.md)** - Kurulum ve yapılandırma
3. **[documentation/ARCHITECTURE.md](./documentation/ARCHITECTURE.md)** - Proje yapısı ve mimari
4. **[documentation/AUTHENTICATION.md](./documentation/AUTHENTICATION.md)** - Kimlik doğrulama sistemi
5. **[documentation/MODULES.md](./documentation/MODULES.md)** - Her modülün ne yaptığını öğrenmek için
6. **[documentation/ENDPOINTS.md](./documentation/ENDPOINTS.md)** - API endpoint'lerini kullanmak için

**Detaylı Dokümantasyon:**
- **[documentation/CORE.md](./documentation/CORE.md)** - Core bileşenleri derinlemesine anlamak için
- **[documentation/DATABASE.md](./documentation/DATABASE.md)** - Veritabanı yapısını anlamak için
- **[documentation/ERRORS.md](./documentation/ERRORS.md)** - Hata yönetimini anlamak için

### 📁 Eski Dokümantasyon

Eski dokümantasyon `docs/` klasöründe mevcuttur:
- **[docs/PROGRESS.md](./docs/PROGRESS.md)** - Proje durumu
- **[docs/NEXT_STEPS.md](./docs/NEXT_STEPS.md)** - Sonraki adımlar

## 🛠️ Teknoloji Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT

## 🚀 Kurulum

```bash
# Dependencies yükle
yarn install

# Environment variables ayarla
cp .env.example .env

# Database migration'ları çalıştır
yarn prisma migrate dev

# Uygulamayı başlat
yarn start:dev
```

Detaylı kurulum için **[documentation/SETUP.md](./documentation/SETUP.md)** dosyasına bakınız.

## 📁 Proje Yapısı

```
spendly-app-api/
├── src/                  # Source code
├── prisma/               # Database schema
├── documentation/        # Kapsamlı dokümantasyon (YENİ)
├── docs/                 # Eski dokümantasyon
├── mobile-app/           # Frontend (React Native)
└── README.md
```

## 📝 Notlar

- Frontend uygulaması `mobile-app/` klasöründe bulunmaktadır
- Tüm API endpoint'leri frontend'in beklentilerine göre tasarlanmalıdır
- **Yeni kapsamlı dokümantasyon** `documentation/` klasöründe bulunmaktadır
- Eski dokümantasyon `docs/` klasöründe mevcuttur

## 🔗 İlgili Dosyalar

- Frontend API Dokümantasyonu: [mobile-app/API_ENDPOINTS_DOCUMENTATION.md](./mobile-app/API_ENDPOINTS_DOCUMENTATION.md)
