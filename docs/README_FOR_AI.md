# 🤖 AI için Özel Rehber - KRİTİK KURALLAR

> ⚠️ **ÖNEMLİ**: Bu proje TAMAMEN AI ile yazılıyor. Chat geçmişi silinse bile, bu dosyayı okuyarak projeyi anlayıp devam edebilmelisin. **MUTLAKA OKU VE UYGULA!**

## 🚨 KRİTİK: İLK OKUNMASI GEREKEN DOSYALAR (Sırayla!)

### 1. **[PROGRESS.md](./PROGRESS.md)** ⭐⭐⭐⭐⭐
**MUTLAKA ÖNCE BUNU OKU!**
- Projenin mevcut durumu
- Tamamlanan işler (checklist formatında)
- Mevcut proje yapısı
- Server durumu
- **Bu dosyayı okumadan HİÇBİR ŞEY YAPMA!**

### 2. **[NEXT_STEPS.md](./NEXT_STEPS.md)** ⭐⭐⭐⭐⭐
**SONRA BUNU OKU!**
- Sonraki adımlar (öncelik sırasıyla)
- Detaylı yapılacaklar
- Checklist'ler
- Komutlar
- **Bu dosyayı okumadan HİÇBİR ŞEY YAPMA!**

### 3. **[01-getting-started/ARCHITECTURE.md](./01-getting-started/ARCHITECTURE.md)** ⭐⭐⭐⭐
**MİMARİ KURALLAR - MUTLAKA OKU!**
- Mimari yapı
- Modül organizasyonu
- Proje yapısı
- Dosya organizasyonu
- **Bu dosyayı okumadan KOD YAZMA!**

### 4. **[02-reference/FRONTEND_ANALYSIS.md](./02-reference/FRONTEND_ANALYSIS.md)** ⭐⭐⭐⭐
**FRONTEND BEKLENTİLERİ - MUTLAKA OKU!**
- Frontend'in beklediği API formatları
- Response yapıları
- Error formatları
- **Bu dosyayı okumadan ENDPOINT YAZMA!**

### 5. **[02-reference/API_SPECIFICATION.md](./02-reference/API_SPECIFICATION.md)** ⭐⭐⭐
**API SPESİFİKASYONLARI**
- Tüm endpoint'ler
- Request/Response formatları
- Validation kuralları

### 6. **[02-reference/DATABASE_SCHEMA.md](./02-reference/DATABASE_SCHEMA.md)** ⭐⭐⭐
**DATABASE ŞEMASI**
- Prisma schema
- Entity ilişkileri
- **Bu dosyayı okumadan DATABASE İŞLEMİ YAPMA!**

### 6.5. **[02-reference/QUICK_REFERENCE.md](./02-reference/QUICK_REFERENCE.md)** ⭐⭐⭐⭐
**HIZLI REFERANS - KOD YAZARKEN BAK!**
- Response formatları (copy-paste ready)
- Modül template'leri (copy-paste ready)
- Prisma query pattern'leri
- Error codes referansı
- Validation decorators
- **Kod yazarken buraya sık sık bak!**

### 6.6. **[02-reference/DECISION_TREE.md](./02-reference/DECISION_TREE.md)** ⭐⭐⭐⭐⭐
**KARAR AĞACI - NE ZAMAN NE YAPMALI?**
- Senaryo bazlı karar ağacı
- Adım adım iş akışı
- Kontrol listeleri
- 10 altın kural
- **Her işlem öncesi MUTLAKA BAK!**

### 6.7. **[02-reference/PRE_COMMIT_CHECKLIST.md](./02-reference/PRE_COMMIT_CHECKLIST.md)** ⭐⭐⭐⭐⭐
**PRE-COMMIT CHECKLIST - COMMIT ETMEDEN ÖNCE!**
- Kod kontrolü
- Mimari kontrolü
- Güvenlik kontrolü
- Dokümantasyon kontrolü
- **Her commit öncesi MUTLAKA KONTROL ET!**

### 7. **[03-guides/DEVELOPMENT_GUIDE.md](./03-guides/DEVELOPMENT_GUIDE.md)** ⭐⭐⭐
**GELİŞTİRME REHBERİ**
- Kod standartları
- Modül oluşturma
- Best practices

### 8. **[03-guides/COMMON_MISTAKES.md](./03-guides/COMMON_MISTAKES.md)** ⭐⭐⭐
**YAYGIN HATALAR**
- Yapılmaması gerekenler
- Hatalı örnekler
- Doğru kullanımlar

---

## 🚨 %0 HATA İÇİN ZORUNLU ADIMLAR

### Her İşlem Öncesi (MUTLAKA!)
1. **[DECISION_TREE.md](./02-reference/DECISION_TREE.md)** oku → Ne yapmalıyım?
2. **[PRE_COMMIT_CHECKLIST.md](./02-reference/PRE_COMMIT_CHECKLIST.md)** kontrol et → Eksik var mı?

### Her Kod Yazmadan Önce (MUTLAKA!)
1. **[QUICK_REFERENCE.md](./02-reference/QUICK_REFERENCE.md)** bak → Template kopyala
2. **[COMMON_MISTAKES.md](./03-guides/COMMON_MISTAKES.md)** kontrol et → Bu hataları yapma

### Her Commit Öncesi (MUTLAKA!)
1. **[PRE_COMMIT_CHECKLIST.md](./02-reference/PRE_COMMIT_CHECKLIST.md)** kontrol et → Tüm maddeler işaretli mi?

---

## ⚠️ MİMARİ KURALLAR - ASLA İHLAL ETME!

### 🚫 YAPILMAMASI GEREKENLER

1. **❌ Yeni bir modül oluştururken ARCHITECTURE.md'yi okumadan oluşturma!**
   - Her modül belirli bir yapıya sahip olmalı
   - Dosya organizasyonu standart olmalı

2. **❌ Frontend'in beklediği format dışında response döndürme!**
   - Response formatı: `{ success: true, data: ..., message: ... }`
   - Error formatı: `{ success: false, message_key: ..., error: ..., fields: ... }`
   - [FRONTEND_ANALYSIS.md](./02-reference/FRONTEND_ANALYSIS.md) dosyasını MUTLAKA oku!

3. **❌ Database şemasını değiştirmeden önce DATABASE_SCHEMA.md'yi okumadan değiştirme!**
   - Prisma schema'ya uyum zorunlu
   - Migration stratejisi var

4. **❌ API endpoint'lerini API_SPECIFICATION.md'ye bakmadan yazma!**
   - Her endpoint'in spesifikasyonu var
   - Request/Response formatları belirlenmiş

5. **❌ NestJS modül yapısına uymayan kod yazma!**
   - Her modül: `.module.ts`, `.controller.ts`, `.service.ts`, `dto/` klasörü içermeli
   - Common modülü kullanılmalı (PrismaService, decorators, guards)

6. **❌ Global exception filter ve interceptor'ları bypass etme!**
   - Tüm response'lar standart formatta olmalı
   - Error handling global filter ile yapılmalı

7. **❌ PROGRESS.md ve NEXT_STEPS.md'yi güncellemeden işlem yapma!**
   - Her önemli işlem sonrası MUTLAKA güncelle
   - Dokümantasyon güncel tutulmalı

8. **❌ Frontend'in beklediği validation error formatı dışında hata döndürme!**
   - Validation errors: `{ fields: { fieldName: [{ message: "...", value: ..., location: "body" }] } }`
   - [FRONTEND_ANALYSIS.md](./02-reference/FRONTEND_ANALYSIS.md) dosyasını oku!

9. **❌ Yeni bir özellik eklerken NEW_FEATURE.md checklist'ini kullanmadan ekleme!**
   - Her özellik için checklist var
   - Adım adım takip et

10. **❌ Common modülünde olan decorator'ları, guard'ları, filter'ları tekrar yazma!**
    - `@CurrentUser()` decorator'ı var
    - `HttpExceptionFilter` var
    - `TransformInterceptor` var
    - Bunları kullan!

### ✅ YAPILMASI GEREKENLER

1. **✅ Her yeni modül oluşturmadan önce:**
   - [ARCHITECTURE.md](./01-getting-started/ARCHITECTURE.md) dosyasını oku
   - Modül yapısını anla
   - Standart dosya organizasyonunu kullan

2. **✅ Her endpoint yazmadan önce:**
   - [API_SPECIFICATION.md](./02-reference/API_SPECIFICATION.md) dosyasını kontrol et
   - [FRONTEND_ANALYSIS.md](./02-reference/FRONTEND_ANALYSIS.md) dosyasını oku
   - Frontend'in beklediği formatı kullan

3. **✅ Her database işlemi yapmadan önce:**
   - [DATABASE_SCHEMA.md](./02-reference/DATABASE_SCHEMA.md) dosyasını oku
   - Prisma schema'yı kontrol et
   - Migration stratejisini takip et

4. **✅ Her önemli işlem sonrası:**
   - PROGRESS.md'yi güncelle
   - NEXT_STEPS.md'yi güncelle
   - İlgili dokümantasyonu güncelle

5. **✅ Her kod yazmadan önce:**
   - [DEVELOPMENT_GUIDE.md](./03-guides/DEVELOPMENT_GUIDE.md) dosyasını oku
   - Kod standartlarını takip et
   - Best practices'i uygula

---

## 📋 İŞ AKIŞI - MUTLAKA TAKİP ET!

### Yeni Bir Özellik Eklerken (Adım Adım)

1. **PROGRESS.md oku** → Projenin durumunu anla
2. **NEXT_STEPS.md oku** → Hangi özellik sırada?
3. **ARCHITECTURE.md oku** → Modül yapısını anla
4. **API_SPECIFICATION.md oku** → Endpoint spesifikasyonlarını kontrol et
5. **FRONTEND_ANALYSIS.md oku** → Frontend beklentilerini anla
6. **NEW_FEATURE.md checklist'ini kullan** → Adım adım takip et
7. **DEVELOPMENT_GUIDE.md'ye göre kod yaz** → Standartlara uy
8. **Test et** → Çalıştığından emin ol
9. **PROGRESS.md güncelle** → Tamamlanan işi işaretle
10. **NEXT_STEPS.md güncelle** → Sonraki adıma geç
11. **İlgili dokümantasyonu güncelle** → API_SPECIFICATION.md, ARCHITECTURE.md vb.

### Yeni Bir Modül Oluştururken

1. **ARCHITECTURE.md oku** → Modül yapısını anla
2. **DEVELOPMENT_GUIDE.md oku** → Modül oluşturma rehberini takip et
3. **Standart yapıyı kullan:**
   ```
   src/module-name/
   ├── module-name.module.ts
   ├── module-name.controller.ts
   ├── module-name.service.ts
   └── dto/
       ├── create-module-name.dto.ts
       └── update-module-name.dto.ts
   ```
4. **Common modülü kullan** → PrismaService, decorators, guards
5. **Frontend formatına uy** → Response/Error formatları
6. **PROGRESS.md güncelle** → Yeni modülü ekle
7. **ARCHITECTURE.md güncelle** → Modül yapısını dokümante et

### Yeni Bir Endpoint Eklerken

1. **API_SPECIFICATION.md oku** → Endpoint spesifikasyonunu kontrol et
2. **FRONTEND_ANALYSIS.md oku** → Frontend'in beklediği formatı anla
3. **DTO oluştur** → Validation için
4. **Controller'a ekle** → Route tanımla
5. **Service'e ekle** → Business logic
6. **Test et** → Çalıştığından emin ol
7. **API_SPECIFICATION.md güncelle** → Yeni endpoint'i dokümante et

---

## 🎯 MİMARİ STANDARTLAR

### Modül Yapısı (ZORUNLU)

Her modül şu yapıya sahip olmalı:

```typescript
src/module-name/
├── module-name.module.ts      // Modül tanımı
├── module-name.controller.ts  // Controller (endpoint'ler)
├── module-name.service.ts     // Service (business logic)
└── dto/                       // Data Transfer Objects
    ├── create-module-name.dto.ts
    └── update-module-name.dto.ts
```

### Response Formatı (ZORUNLU)

**Başarılı Response:**
```typescript
{
  success: true,
  data: { ... },
  message?: string,
  message_key?: string,
  pagination?: {
    total: number,
    page: number,
    limit: number
  }
}
```

**Hata Response:**
```typescript
{
  success: false,
  message_key: "ERROR_CODE",
  error: "ERROR_CODE",
  fields?: {
    fieldName: [{
      message: "Validation error message",
      value: "invalid value",
      location: "body"
    }]
  },
  message: "Error message",
  summary?: string
}
```

### Error Handling (ZORUNLU)

- Global `HttpExceptionFilter` kullanılmalı
- Validation errors frontend formatına uygun olmalı
- Custom exception'lar kullanılabilir ama format standart olmalı

### Database İşlemleri (ZORUNLU)

- PrismaService kullanılmalı (common modülünden)
- Prisma schema'ya uyum zorunlu
- Migration'lar dikkatli yapılmalı

### Authentication (ZORUNLU)

- JWT kullanılmalı
- `@CurrentUser()` decorator'ı kullanılmalı
- Guard'lar kullanılmalı

---

## ✅ ÖNEMLİ KURALLAR - MUTLAKA UYGULA!

### ⚠️ KRİTİK: Her İşlem Sonrası Güncelleme

**Her önemli işlem tamamlandığında MUTLAKA şunları yap:**

#### 1. PROGRESS.md Güncelleme (ZORUNLU)
- ✅ Tamamlanan işi checklist'te işaretle
- ✅ "Son Yapılan İşlemler" bölümüne ekle
- ✅ Tarihi güncelle
- ✅ "Mevcut Proje Yapısı" bölümünü güncelle (yeni dosya/klasör varsa)

#### 2. NEXT_STEPS.md Güncelleme (ZORUNLU)
- ✅ Tamamlanan adımı "✅ Tamamlandı" olarak işaretle
- ✅ Checklist'teki ilgili maddeleri işaretle
- ✅ Yeni adımları ekle (gerekirse)
- ✅ Öncelik sırasını güncelle
- ✅ Tarihi güncelle

#### 3. Dokümantasyon Güncelleme (GEREKTİĞİNDE)
- Yeni endpoint eklendiğinde → `02-reference/API_SPECIFICATION.md` güncelle
- Yeni modül eklendiğinde → `01-getting-started/ARCHITECTURE.md` güncelle
- Database değiştiğinde → `02-reference/DATABASE_SCHEMA.md` güncelle

---

## 🔄 GÜNCELLEME AKIŞI

**Her önemli işlem sonrası:**
1. İşi tamamla
2. Test et
3. **PROGRESS.md güncelle** ← UNUTMA!
4. **NEXT_STEPS.md güncelle** ← UNUTMA!
5. İlgili dokümantasyonu güncelle (gerekirse)
6. Kullanıcıya "Dokümantasyon güncellendi" de

---

## 🎯 MEVCUT DURUM (ÖZET)

### ✅ Tamamlanan
- NestJS projesi kuruldu
- Prisma schema oluşturuldu
- Common modülü (filters, interceptors, decorators)
- Global exception filter
- Response interceptor
- Security headers (Helmet)
- Dokümantasyon yapısı

### ⏳ Beklemede
- PostgreSQL kurulumu
- Database migration
- Auth modülü
- Categories modülü
- Transactions modülü
- Analytics modülü

---

## 🚀 SONRAKİ ADIM

**PostgreSQL kurulumu ve database bağlantısı**

Detaylar için: [NEXT_STEPS.md](./NEXT_STEPS.md)

---

## 💡 İPUÇLARI

1. **Her zaman PROGRESS.md'yi oku** - Projenin durumunu anla
2. **NEXT_STEPS.md'yi takip et** - Ne yapılacağını bil
3. **ARCHITECTURE.md'yi unutma** - Mimari kuralları takip et
4. **FRONTEND_ANALYSIS.md'yi unutma** - Frontend formatlarına uy
5. **Checklist kullan** - Hiçbir şeyi unutma
6. **Dokümantasyonu güncelle** - Her değişiklikte (ZORUNLU!)
7. **Test et** - Her özellikten sonra

---

## 🔗 HIZLI LİNKLER

- [PROGRESS.md](./PROGRESS.md) - Proje durumu ⭐⭐⭐⭐⭐
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Sonraki adımlar ⭐⭐⭐⭐⭐
- [01-getting-started/ARCHITECTURE.md](./01-getting-started/ARCHITECTURE.md) - Mimari kurallar ⭐⭐⭐⭐
- [02-reference/FRONTEND_ANALYSIS.md](./02-reference/FRONTEND_ANALYSIS.md) - Frontend beklentileri ⭐⭐⭐⭐
- [02-reference/QUICK_REFERENCE.md](./02-reference/QUICK_REFERENCE.md) - Hızlı referans (KOD YAZARKEN BAK!) ⭐⭐⭐⭐
- [02-reference/DECISION_TREE.md](./02-reference/DECISION_TREE.md) - Karar ağacı (NE ZAMAN NE YAPMALI?) ⭐⭐⭐⭐⭐
- [02-reference/PRE_COMMIT_CHECKLIST.md](./02-reference/PRE_COMMIT_CHECKLIST.md) - Pre-commit checklist (COMMIT ETMEDEN ÖNCE!) ⭐⭐⭐⭐⭐
- [02-reference/API_SPECIFICATION.md](./02-reference/API_SPECIFICATION.md) - API spesifikasyonları ⭐⭐⭐
- [02-reference/DATABASE_SCHEMA.md](./02-reference/DATABASE_SCHEMA.md) - Database şeması ⭐⭐⭐
- [03-guides/DEVELOPMENT_GUIDE.md](./03-guides/DEVELOPMENT_GUIDE.md) - Geliştirme rehberi ⭐⭐⭐
- [03-guides/COMMON_MISTAKES.md](./03-guides/COMMON_MISTAKES.md) - Yaygın hatalar ⭐⭐⭐
- [03-guides/NEW_FEATURE.md](./03-guides/NEW_FEATURE.md) - Yeni özellik checklist'i ⭐⭐⭐

---

## ⚠️ SON UYARI

**Bu proje TAMAMEN AI ile yazılıyor. Chat geçmişi silinse bile:**

1. ✅ Bu dosyayı oku
2. ✅ PROGRESS.md'yi oku
3. ✅ NEXT_STEPS.md'yi oku
4. ✅ ARCHITECTURE.md'yi oku
5. ✅ FRONTEND_ANALYSIS.md'yi oku
6. ✅ Mimari kurallara uy
7. ✅ Frontend formatlarına uy
8. ✅ Dokümantasyonu güncelle
9. ✅ Saçma sapan işler yapma!

**Unutma**: Bu dokümantasyon senin için hazırlandı. Oku, anla, uygula! 🚀

**VE EN ÖNEMLİSİ**: Her işlem sonrası dokümantasyonu güncelle! ⚠️
