# Proje Genel Bakış

## 📱 Proje Bilgileri

**Proje Adı**: Spendly API  
**Proje Tipi**: REST API Backend  
**Amaç**: Gelir-Gider Takip Mobil Uygulaması için backend servisi  
**Frontend**: React Native (mobile-app klasöründe)  
**Durum**: Geliştirme aşamasında

## 🎯 Proje Amacı

Bu proje, React Native ile geliştirilmiş bir gelir-gider takip mobil uygulaması için backend API'sidir. Kullanıcıların:

- Gelir ve gider işlemlerini kaydetmesini
- Kategoriler oluşturup yönetmesini
- Finansal raporlar ve istatistikler görmesini
- İşlem geçmişini takip etmesini

sağlar.

## 🛠️ Teknoloji Stack

### Backend
- **Runtime**: Node.js
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcrypt
- **API Documentation**: @nestjs/swagger

### Frontend (Referans)
- **Framework**: React Native
- **Language**: TypeScript/JavaScript
- **State Management**: Zustand
- **API Client**: Custom hook (useApiCall)

## 📂 Proje Yapısı

```
spendly-app-api/
├── src/
│   ├── auth/              # Kimlik doğrulama modülü
│   ├── categories/        # Kategori yönetimi modülü
│   ├── transactions/      # İşlem (gelir/gider) modülü
│   ├── analytics/         # Raporlar ve istatistikler modülü
│   ├── users/             # Kullanıcı yönetimi modülü
│   ├── common/            # Ortak utilities, guards, decorators
│   └── main.ts            # Uygulama giriş noktası
├── prisma/
│   ├── schema.prisma      # Database şeması
│   └── migrations/        # Database migration'ları
├── test/                  # Test dosyaları
├── docs/                  # Dokümantasyon (bu klasör)
├── mobile-app/            # Frontend React Native uygulaması (referans)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔗 Frontend Bağlantısı

Frontend uygulaması `mobile-app/` klasöründe bulunmaktadır. Frontend'in API beklentileri için `03_FRONTEND_ANALYSIS.md` dosyasına bakınız.

## 🌐 API Bilgileri

- **Base URL**: `http://localhost:3001` (development)
- **API Version**: v1
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

## 📋 Temel Özellikler

1. **Kimlik Doğrulama**
   - Kullanıcı kaydı
   - Giriş/Çıkış
   - Token yenileme
   - Profil yönetimi

2. **Kategori Yönetimi**
   - Kategori oluşturma/düzenleme/silme
   - Gelir/Gider kategorileri
   - Varsayılan kategoriler
   - Kategori istatistikleri

3. **İşlem Yönetimi**
   - Gelir ekleme
   - Gider ekleme
   - İşlem listeleme (filtreleme ile)
   - İşlem güncelleme/silme
   - İşlem detayları

4. **Analitik ve Raporlar**
   - Dashboard verileri
   - Aylık/yıllık özetler
   - Kategori bazlı analizler
   - Trend analizleri

## 🚀 Geliştirme Durumu

- [x] Proje planlama ve dokümantasyon
- [ ] Proje kurulumu (NestJS + Prisma)
- [ ] Database şeması tasarımı
- [ ] Authentication modülü
- [ ] Categories modülü
- [ ] Transactions modülü
- [ ] Analytics modülü
- [ ] API dokümantasyonu (Swagger)
- [ ] Test yazımı

## 📝 Notlar

- Frontend hazır durumda, backend geliştirilmektedir
- Tüm API endpoint'leri frontend'in beklentilerine göre tasarlanmalıdır
- Response formatları frontend'in beklediği formatta olmalıdır
- Detaylı API spesifikasyonu için `04_API_SPECIFICATION.md` dosyasına bakınız

