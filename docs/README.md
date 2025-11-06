# Spendly API - Dokümantasyon

> ⚠️ **ÖNEMLİ**: Bu dokümantasyon yeni bir chat açıldığında veya başka bir geliştirici projeye dahil olduğunda, projeyi hızlıca anlaması için hazırlanmıştır. Lütfen güncel tutunuz.

## 📁 Dokümantasyon Yapısı

```
docs/
├── README.md (bu dosya)
├── README_FOR_AI.md               # 🤖 AI için özel rehber
├── PROGRESS.md                    # ⭐ Proje durumu ve tamamlanan işler
├── NEXT_STEPS.md                  # ⭐ Sonraki adımlar ve yapılacaklar
│
├── 01-getting-started/            # 🚀 Başlangıç Rehberi
│   ├── PROJECT_OVERVIEW.md
│   └── ARCHITECTURE.md
│
├── 02-reference/                  # 📖 Referans Dokümantasyonu
│   ├── FRONTEND_ANALYSIS.md
│   ├── API_SPECIFICATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── QUICK_REFERENCE.md         # ⚡ Hızlı referans (AI için)
│   ├── DECISION_TREE.md           # 🌳 Karar ağacı (AI için)
│   ├── PRE_COMMIT_CHECKLIST.md    # ✅ Pre-commit checklist
│   └── TECHNICAL_DECISIONS.md
│
└── 03-guides/                     # 📚 Geliştirme Rehberleri
    ├── DEVELOPMENT_GUIDE.md
    ├── FRONTEND_DEVELOPER_GUIDE.md
    ├── COMMON_MISTAKES.md
    ├── NEW_FEATURE.md             # ✅ Yeni özellik checklist'i
    ├── PROFESSIONAL_REVIEW.md     # 🔍 Profesyonel review
    └── GUIDE_FOR_UPDATING.md      # 📝 Dokümantasyon güncelleme rehberi
```

## 🎯 Hızlı Erişim

### 🤖 AI için Özel Rehber
**Yeni bir AI chat açıldığında**: **[README_FOR_AI.md](./README_FOR_AI.md)** ⭐⭐⭐⭐⭐ - **MUTLAKA ÖNCE BUNU OKU!**

> ⚠️ **KRİTİK**: Bu proje TAMAMEN AI ile yazılıyor. Chat geçmişi silinse bile README_FOR_AI.md dosyasını okuyarak projeyi anlayıp devam edebilmelisin!

### 👤 İnsan Geliştirici için
1. **[PROGRESS.md](./PROGRESS.md)** ⭐ - **ÖNCE BUNU OKU!** Proje durumu ve tamamlanan işler
2. **[NEXT_STEPS.md](./NEXT_STEPS.md)** ⭐ - **SONRA BUNU OKU!** Sonraki adımlar ve yapılacaklar
3. **[01-getting-started/](./01-getting-started/)** - Projeyi anlamak için başlangıç rehberi
4. **[02-reference/](./02-reference/)** - Detaylı referans bilgileri
5. **[03-guides/](./03-guides/)** - Geliştirme rehberleri

### Geliştirme Yaparken
- Yeni özellik eklerken → **[03-guides/NEW_FEATURE.md](./03-guides/NEW_FEATURE.md)**
- Kod yazarken → **[03-guides/DEVELOPMENT_GUIDE.md](./03-guides/DEVELOPMENT_GUIDE.md)**
- Hata yapmadan önce → **[03-guides/COMMON_MISTAKES.md](./03-guides/COMMON_MISTAKES.md)**
- Frontend developer olarak → **[03-guides/FRONTEND_DEVELOPER_GUIDE.md](./03-guides/FRONTEND_DEVELOPER_GUIDE.md)**

## 📚 Klasör Açıklamaları

### 🚀 01-getting-started/
Projeye başlamak için gerekli temel bilgiler:
- **PROJECT_OVERVIEW.md** - Proje genel bakış, teknoloji stack, temel özellikler
- **ARCHITECTURE.md** - Mimari yapı, modül organizasyonu, proje yapısı

**Ne zaman kullanılır?** Yeni bir chat açtığında veya projeye ilk kez dahil olduğunda.

### 📖 02-reference/
Detaylı referans bilgileri:
- **FRONTEND_ANALYSIS.md** - Frontend analizi ve API beklentileri
- **API_SPECIFICATION.md** - Tüm API endpoint'leri, request/response formatları
- **DATABASE_SCHEMA.md** - Veritabanı şeması, ilişkiler, migration stratejisi
- **TECHNICAL_DECISIONS.md** - Alınan teknik kararlar ve gerekçeleri

**Ne zaman kullanılır?** Geliştirme yaparken referans olarak.

### 📚 03-guides/
Geliştirme rehberleri ve yardımcı dokümantasyon:
- **DEVELOPMENT_GUIDE.md** - Geliştirme rehberi (kurulum, kod standartları)
- **FRONTEND_DEVELOPER_GUIDE.md** - Frontend developer için özel rehber
- **COMMON_MISTAKES.md** - Yaygın hatalar ve çözümleri
- **NEW_FEATURE.md** - Yeni özellik ekleme checklist'i
- **PROFESSIONAL_REVIEW.md** - Profesyonel backend review
- **GUIDE_FOR_UPDATING.md** - Dokümantasyon güncelleme rehberi

**Ne zaman kullanılır?** Kod yazarken, hata yapmadan önce, yeni özellik eklerken.

## 🚀 Hızlı Başlangıç

Yeni bir chat açtığınızda veya projeye dahil olduğunuzda:

1. **Önce okuyun**: [PROGRESS.md](./PROGRESS.md) - Projenin mevcut durumunu öğrenin
2. **Başlangıç**: [01-getting-started/PROJECT_OVERVIEW.md](./01-getting-started/PROJECT_OVERVIEW.md) - Projenin ne olduğunu anlayın
3. **Mimari**: [01-getting-started/ARCHITECTURE.md](./01-getting-started/ARCHITECTURE.md) - Proje yapısını öğrenin
4. **Referans**: [02-reference/](./02-reference/) - Detaylı bilgiler için
5. **Rehberler**: [03-guides/](./03-guides/) - Geliştirme yaparken

## 📝 Dokümantasyon Güncelleme Kuralları

- Yeni bir modül eklendiğinde → `02-reference/API_SPECIFICATION.md` ve `01-getting-started/ARCHITECTURE.md` güncellenmelidir
- Yeni bir endpoint eklendiğinde → `02-reference/API_SPECIFICATION.md` güncellenmelidir
- Database şeması değiştiğinde → `02-reference/DATABASE_SCHEMA.md` güncellenmelidir
- Önemli teknik kararlar → `02-reference/TECHNICAL_DECISIONS.md`'ye eklenmelidir
- Önemli ilerleme → `PROGRESS.md` güncellenmelidir

**Detaylı rehber**: [03-guides/GUIDE_FOR_UPDATING.md](./03-guides/GUIDE_FOR_UPDATING.md)

## 🔗 İlgili Dosyalar

- Frontend API Dokümantasyonu: `../mobile-app/API_ENDPOINTS_DOCUMENTATION.md`
- Frontend Kodu: `../mobile-app/` klasörü

## 💡 İpuçları

- **Hızlı başlangıç için**: `01-getting-started/` klasöründeki dosyaları sırayla oku
- **Geliştirme yaparken**: `03-guides/` klasöründeki rehberleri kullan
- **Referans için**: `02-reference/` klasöründeki dosyalara bak
- **Kontrol için**: `03-guides/NEW_FEATURE.md` checklist'ini kullan
