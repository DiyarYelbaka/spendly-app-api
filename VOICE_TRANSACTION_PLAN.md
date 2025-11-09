# Ses Komutu ile İşlem Ekleme - Uygulama Planı

## 📋 Proje Özeti

Kullanıcılar ses komutu ile gelir/gider ekleyebilecek. Frontend'den gelen text'i parse edip, gelir veya gider olarak otomatik kaydedeceğiz.

**Örnek:** "500 tl lik market alışverişi yaptım" → Gider olarak kaydedilir

---

## 🎯 Hedefler

1. ✅ Ses komutunu text'e çeviren endpoint oluştur
2. ✅ GPT-4o-mini ile text parsing yap (HER ZAMAN AI KULLAN)
3. ✅ Gelir/gider otomatik tespit
4. ✅ Kategori otomatik tahmin (bulunamazsa default kullan)
5. ✅ Mevcut `createIncome` ve `createExpense` metodlarını kullan
6. ✅ Default kategoriler: "diğer gelirler" ve "diğer giderleri" (zorunlu)
7. ✅ Kategori bulunamazsa default kategoriye at

---

## 🏗️ Mimari Tasarım

### Yeni Bileşenler

```
src/transactions/
├── transactions.controller.ts (güncelle)
├── transactions.service.ts (güncelle)
├── voice-transaction.service.ts (YENİ)
├── voice-transaction.parser.ts (YENİ)
└── dto/
    └── voice-transaction.dto.ts (YENİ)
```

### Akış Diyagramı

```
1. Frontend → POST /api/transactions/voice
   { text: "500 tl lik market alışverişi yaptım" }
   
2. TransactionsController.voiceTransaction()
   ↓
3. VoiceTransactionService.parseAndCreate()
   └── AI Parsing (HER ZAMAN)
       ├── OpenAI API çağrısı
       ├── Parse edilen veri
       ├── Kategori bulma
       │   ├── Bulundu → kullan
       │   └── Bulunamadı → Default kategori kullan
       │       ├── income → "diğer gelirler"
       │       └── expense → "diğer giderleri"
       └── createTransaction()
   
4. Response → Oluşturulan transaction
```

---

## 📝 Adım Adım Uygulama Planı

### Faz 1: Temel Altyapı (1-2 saat)

#### 1.1 DTO Oluşturma
- [ ] `voice-transaction.dto.ts` oluştur
  - `VoiceTransactionDto`: `{ text: string }`
  - `ParsedTransactionDto`: AI'dan dönen structured data
  - `VoiceTransactionResponseDto`: Response formatı

#### 1.2 OpenAI Entegrasyonu
- [ ] `openai` paketini yükle: `yarn add openai`
- [ ] Environment variable ekle: `OPENAI_API_KEY`
- [ ] Config dosyasına ekle: `jwt.config.ts` benzeri `openai.config.ts`

#### 1.3 Voice Transaction Service
- [ ] `voice-transaction.service.ts` oluştur
- [ ] `VoiceTransactionService` class'ı
- [ ] OpenAI client initialize et
- [ ] Temel yapıyı kur

### Faz 2: AI Entegrasyonu (2-3 saat)

#### 2.1 OpenAI Prompt Tasarımı
- [ ] System prompt oluştur
- [ ] Response format: JSON object zorunlu
- [ ] Örnek input/output hazırla
- [ ] Temperature: 0.1 (tutarlı sonuçlar için)

#### 2.2 AI Parsing Metodu
- [ ] `parseWithAI(text: string)` metodu
- [ ] OpenAI API çağrısı
- [ ] Response parsing
- [ ] Error handling

#### 2.3 Response Validation
- [ ] Parsed data doğrulama
- [ ] Eksik alan kontrolü
- [ ] Tip kontrolü (income/expense)
- [ ] Confidence score

### Faz 3: Transaction Oluşturma (1 saat)

#### 3.1 Kategori Bulma
- [ ] `findOrGetDefaultCategory()` metodu oluştur
- [ ] AI'dan gelen kategori keyword'ü ile kullanıcının kategorilerinde ara
- [ ] Kategori arama: nameKey veya name alanında fuzzy search
- [ ] Bulunamazsa default kategori kullan:
  - income → `other_income` kategorisini getir (nameKey: "other_income")
  - expense → `other_expense` kategorisini getir (nameKey: "other_expense")
- [ ] Default kategoriler zaten mevcut (DEFAULT_CATEGORIES, auth service'de oluşturuluyor)

#### 3.2 Transaction Service Entegrasyonu
- [ ] `createIncome()` veya `createExpense()` çağır
- [ ] Parsed data'yı DTO'ya çevir
- [ ] Mevcut validation'ları kullan
- [ ] Kategori ID'yi set et (bulunan veya default)

### Faz 4: Controller & Endpoint (1 saat)

#### 4.1 Controller Metodu
- [ ] `TransactionsController.voiceTransaction()` ekle
- [ ] `@Post('voice')` decorator
- [ ] DTO validation
- [ ] Service çağrısı
- [ ] Response formatla

#### 4.2 Swagger Dokümantasyonu
- [ ] `@ApiOperation` ekle
- [ ] `@ApiResponse` ekle
- [ ] Örnek request/response

### Faz 5: Hata Yönetimi (1 saat)

#### 5.1 Error Handling
- [ ] OpenAI API hataları
- [ ] Parse edilemeyen text
- [ ] Validation hataları
- [ ] Default kategori bulunamadı (çok kritik hata)

#### 5.2 Fallback Stratejisi
- [ ] Belirsiz durumlarda kullanıcıya sor
- [ ] `needsConfirmation: true` response
- [ ] Frontend'e bilgi ver
- [ ] Kategori bulunamazsa default kullan (her zaman)

### Faz 6: Optimizasyon (1-2 saat)

#### 6.1 Prompt Optimizasyonu
- [ ] System prompt'u kısalt
- [ ] Gereksiz token'ları çıkar
- [ ] Response format optimize et

### Faz 7: Test & Dokümantasyon (1-2 saat)

#### 7.1 Test Senaryoları
- [ ] Basit örnekler: "500 tl market"
- [ ] Karmaşık örnekler: "dün gece 200 lira yemek yedim"
- [ ] Belirsiz örnekler: "bir şeyler aldım"
- [ ] Kategori bulunamayan: "500 tl harcadım" → default kategori
- [ ] Hata durumları

#### 7.2 Dokümantasyon
- [ ] Endpoint dokümantasyonu
- [ ] Örnek request/response
- [ ] Hata kodları
- [ ] Kullanım örnekleri
- [ ] Default kategoriler açıklaması

---

## 📦 Gerekli Paketler

```bash
yarn add openai
```

---

## 🔐 Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
AI_PARSING_ENABLED=true
AI_CONFIDENCE_THRESHOLD=0.7
```

---

## 📊 Örnek Request/Response

### Request
```http
POST /api/transactions/voice
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "500 tl lik market alışverişi yaptım"
}
```

### Response (Başarılı)
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "uuid",
      "amount": 500,
      "type": "expense",
      "description": "market alışverişi",
      "category": {
        "id": "uuid",
        "name": "Market",
        "icon": "🛒",
        "color": "#FF5733"
      },
      "date": "2025-01-21",
      "created_at": "2025-01-21T10:30:00.000Z"
    },
    "parsing": {
      "method": "ai",
      "confidence": 0.9,
      "category_found": true // veya false (default kullanıldıysa)
    }
  }
}
```

### Response (Belirsiz - Kullanıcı Onayı Gerekli)
```json
{
  "success": false,
  "data": {
    "needsConfirmation": true,
    "parsed": {
      "amount": null,
      "type": null,
      "description": "bir şeyler aldım",
      "suggestions": {
        "type": ["income", "expense"],
        "categories": []
      }
    },
    "message": "İşlem belirsiz, lütfen onaylayın"
  }
}
```

---

## 🧪 Test Senaryoları

### Senaryo 1: Basit Gider (Kategori Bulundu)
```
Input: "500 tl lik market alışverişi yaptım"
Expected: expense, 500, "Market" kategorisi
Method: ai
```

### Senaryo 2: Basit Gelir (Kategori Bulundu)
```
Input: "3000 maaş aldım"
Expected: income, 3000, "Maaş" kategorisi
Method: ai
```

### Senaryo 3: Karmaşık (Kategori Bulundu)
```
Input: "dün gece arkadaşımla dışarıda yemek yedik, 250 lira harcadım"
Expected: expense, 250, "Yemek" kategorisi
Method: ai
```

### Senaryo 4: Kategori Bulunamadı (Default Kullan)
```
Input: "500 tl harcadım"
Expected: expense, 500, "diğer giderleri" kategorisi (default)
Method: ai (kategori bulunamadı → default)
```

### Senaryo 5: Belirsiz (Onay Gerekli)
```
Input: "bir şeyler aldım"
Expected: needsConfirmation: true
Method: ai (düşük confidence)
```

---

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Maliyet Kontrolü**
   - Her zaman AI kullan (pattern matching yok)
   - Prompt'u optimize et (token tasarrufu)

2. **Güvenlik**
   - API key'i environment variable'da sakla
   - Input validation yap
   - Text uzunluğu sınırla (max 500 karakter)

3. **Hata Yönetimi**
   - OpenAI API hatalarını yakala
   - Timeout ekle (5 saniye)
   - Retry mekanizması (opsiyonel)
   - Default kategoriler her zaman mevcut olmalı

4. **Performans**
   - AI: ~200-500ms
   - Timeout: 5 saniye

5. **Kullanıcı Deneyimi**
   - Belirsiz durumlarda kullanıcıya sor
   - Kategori bulunamazsa default kullan (sessizce)
   - Anlamlı hata mesajları

6. **Default Kategoriler (KRİTİK)**
   - ✅ Zaten mevcut: `other_income` ve `other_expense` (DEFAULT_CATEGORIES)
   - ✅ Auth service'de zaten oluşturuluyor (register metodunda)
   - ✅ Bu kategoriler silinememeli (is_default: true)
   - ✅ Kategori bulunamazsa her zaman default kullan:
     - income → nameKey: "other_income"
     - expense → nameKey: "other_expense"

---

## 📈 Başarı Metrikleri

- ✅ AI parsing başarı oranı: %90-95
- ✅ Kategori bulma oranı: %70-80 (geri kalanı default)
- ✅ Ortalama response time: <500ms
- ✅ Maliyet: ~$2-3/ay (1000 kullanıcı için, günde 1000 parse)

---

## 🚀 Uygulama Sırası

1. **Faz 1**: Temel altyapı (DTO, OpenAI config)
2. **Faz 2**: AI entegrasyonu (her zaman AI kullan)
3. **Faz 3**: Transaction oluşturma (kategori bulma + default fallback)
4. **Faz 4**: Controller & Endpoint
5. **Faz 5**: Hata yönetimi
6. **Faz 6**: Optimizasyon
7. **Faz 7**: Test & Dokümantasyon

---

## 📝 Notlar

- Mevcut `createIncome` ve `createExpense` metodlarını kullan
- Yeni bir transaction tipi ekleme, mevcut yapıyı koru
- **HER ZAMAN AI KULLAN** (pattern matching yok)
- Kategori bulunamazsa default kategorileri kullan:
  - income → "diğer gelirler"
  - expense → "diğer giderleri"
- ✅ Default kategoriler zaten mevcut ve auth service'de otomatik oluşturuluyor
- ✅ `other_income` ve `other_expense` kategorilerini kullan
- Belirsiz durumlarda kullanıcıya sor
- Kategori bulunamadığında hata verme, default kullan

---

**Plan Tarihi:** 2025-01-21  
**Güncelleme:** 2025-01-21 (AI-only, default kategoriler zaten mevcut)  
**Tahmini Süre:** 7-10 saat  
**Öncelik:** Yüksek

---

## 🔄 Değişiklikler (Güncelleme)

### Kaldırılanlar
- ❌ Pattern matching fazı (Faz 2)
- ❌ Hybrid yaklaşım (Faz 4)
- ❌ Pattern matching logic

### Eklenenler
- ✅ Her zaman AI kullan
- ✅ Default kategoriler zaten mevcut: `other_income` ve `other_expense`
- ✅ Kategori bulunamazsa default kullan (hata verme)
- ✅ Auth service'de zaten otomatik oluşturuluyor (değişiklik gerekmez)

