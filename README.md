# Spendly API

Gelir-Gider Takip Mobil Uygulaması için REST API Backend

## 📚 Dokümantasyon

**ÖNEMLİ**: Projeyi anlamak için önce `docs/` klasöründeki dokümantasyonu okuyun!

### 📁 Dokümantasyon Yapısı

```
docs/
├── README.md                    # Ana indeks
├── PROGRESS.md                  # ⭐ Proje durumu
├── NEXT_STEPS.md                # ⭐ Sonraki adımlar
├── README_FOR_AI.md             # 🤖 AI için özel rehber
├── 01-getting-started/          # 🚀 Başlangıç rehberi
├── 02-reference/                # 📖 Referans dokümantasyonu
└── 03-guides/                   # 📚 Geliştirme rehberleri
```

### 🚀 Hızlı Başlangıç

**Yeni bir chat açtığınızda önce bunları okuyun:**
1. **[docs/PROGRESS.md](./docs/PROGRESS.md)** - Projenin mevcut durumu ve tamamlanan işler ⭐
2. **[docs/NEXT_STEPS.md](./docs/NEXT_STEPS.md)** - Sonraki adımlar ve yapılacaklar ⭐

**Sonra:**
3. **[docs/README.md](./docs/README.md)** - Dokümantasyon indeksi
4. **[docs/01-getting-started/PROJECT_OVERVIEW.md](./docs/01-getting-started/PROJECT_OVERVIEW.md)** - Proje genel bilgileri
5. **[docs/03-guides/FRONTEND_DEVELOPER_GUIDE.md](./docs/03-guides/FRONTEND_DEVELOPER_GUIDE.md)** - Frontend developer için rehber
6. **[docs/03-guides/NEW_FEATURE.md](./docs/03-guides/NEW_FEATURE.md)** - Yeni özellik ekleme checklist'i

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

Detaylı kurulum için [docs/03-guides/DEVELOPMENT_GUIDE.md](./docs/03-guides/DEVELOPMENT_GUIDE.md) dosyasına bakınız.

## 📁 Proje Yapısı

```
spendly-app-api/
├── src/              # Source code
├── prisma/           # Database schema
├── docs/             # Dokümantasyon
├── mobile-app/       # Frontend (React Native)
└── README.md
```

## 📝 Notlar

- Frontend uygulaması `mobile-app/` klasöründe bulunmaktadır
- Tüm API endpoint'leri frontend'in beklentilerine göre tasarlanmalıdır
- Detaylı bilgi için `docs/` klasöründeki dokümantasyonu inceleyin

## 🔗 İlgili Dosyalar

- Frontend API Dokümantasyonu: [mobile-app/API_ENDPOINTS_DOCUMENTATION.md](./mobile-app/API_ENDPOINTS_DOCUMENTATION.md)
