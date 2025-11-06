# Frontend Analizi ve Beklentiler

> ⚠️ **KRİTİK**: Bu dosya AI için çok önemlidir! Frontend'in beklediği formatlara MUTLAKA uy! Bu formatları değiştirme veya bypass etme!

> Bu dosya, React Native frontend uygulamasının (`mobile-app/` klasörü) API'den ne beklediğini detaylandırır.

## 📱 Frontend Bilgileri

- **Framework**: React Native
- **Language**: TypeScript/JavaScript
- **State Management**: Zustand
- **API Client**: Custom hook (`useApiCall`)
- **Konum**: `mobile-app/` klasörü

## 🔌 API Client Yapısı

Frontend, `hooks/use-api-call/index.ts` dosyasında custom bir API client kullanır.

### Base URL
```typescript
// config/app-config.js
API_URL: "http://localhost:3001" // Development
```

### Request Format
```typescript
useApiCall({
  endpoint: "/api/categories",
  method: METHOD.GET,
  body: { ... }, // POST/PUT için
  query: { type: "expense" }, // GET için query params
  onSuccess: (data) => { ... },
  onError: (error) => { ... }
})
```

### Response Format Beklentisi

Frontend iki farklı response formatını destekler:

#### Format 1: Standart Response
```json
{
  "success": true,
  "message_key": "SUCCESS_MESSAGE_KEY",
  "data": { ... },
  "message": "İşlem başarılı"
}
```

#### Format 2: useApiCall Hook Formatı
```json
{
  "data": [ ... ], // veya { ... }
  "pagination": {
    "total": 10,
    "current_page": 1,
    "per_page": 20
  }
}
```

**Önemli**: `useApiCall` hook'u response'u şu şekilde işler:
- Eğer response'da `data` field'ı varsa → `items` olarak döner
- `pagination` field'ı varsa → aynen döner

## 🔐 Authentication

### Login Flow
```typescript
// src/auth/layouts/login.js
POST /api/auth/login
Body: { email, password }

Response beklenen format:
{
  success: true,
  data: {
    user: { id, email, name, createdAt },
    tokens: {
      accessToken: "jwt_token",
      refreshToken: "refresh_token",
      expiresAt: "2025-01-28T10:30:00.000Z"
    }
  }
}
```

### Token Kullanımı
- Token `AsyncStorage`'da saklanır
- Her request'te `Authorization: Bearer {token}` header'ı eklenir
- 401 response'da otomatik logout yapılır

### Register Flow
```typescript
// src/auth/layouts/register.js
POST /api/auth/register
Body: {
  email: string,
  password: string,
  confirmPassword: string,
  name: string
}
```

## 📊 Kullanılan Endpoint'ler

### 1. Authentication
- ✅ `POST /api/auth/login` - Giriş
- ✅ `POST /api/auth/register` - Kayıt
- ⚠️ `POST /api/auth/refresh` - Token yenileme (henüz kullanılmıyor ama dokümanda var)

### 2. Categories
- ✅ `GET /api/categories?type={income|expense}` - Kategori listesi
- ✅ `GET /api/categories/:id` - Tek kategori detayı
- ✅ `POST /api/categories` - Yeni kategori
- ✅ `PUT /api/categories/:id` - Kategori güncelle
- ✅ `DELETE /api/categories/:id` - Kategori sil

**Kullanım Yerleri:**
- `src/main/home/shared/categories/index.js` - Liste sayfası
- `src/main/home/shared/categories/shared/add-category.js` - Ekleme
- `src/main/home/shared/categories/shared/edit-category.js` - Düzenleme

### 3. Transactions
- ✅ `POST /api/transactions/income` - Gelir ekle
- ✅ `POST /api/transactions/expense` - Gider ekle
- ⚠️ `GET /api/transactions` - Liste (henüz kullanılmıyor ama gerekli)

**Kullanım Yerleri:**
- `src/main/home/shared/transaction-form/index.js` - İşlem formu

**Request Format:**
```typescript
{
  amount: number,        // Formatlanmamış sayı (örn: 1500.50)
  description: string,   // 1-500 karakter
  date: "YYYY-MM-DD",    // ISO format
  categoryId: "uuid",    // Kategori ID
  notes?: string         // Opsiyonel
}
```

### 4. Analytics
- ✅ `GET /api/analytics/dashboard` - Dashboard verileri

**Kullanım Yeri:**
- `src/main/home/index.js` - Ana sayfa

**Response Beklentisi:**
```typescript
{
  success: true,
  data: {
    summary: {
      netIncome: number,    // Net bakiye
      totalIncome: number,   // Toplam gelir
      totalExpense: number   // Toplam gider
    }
  }
}
```

## 📋 Veri Modelleri (Frontend Beklentileri)

### Category Model
```typescript
{
  id: string (UUID),
  name: string,
  type: "income" | "expense",
  icon: string,           // Emoji veya string
  color: string,          // Hex format (#FF5733)
  is_default: boolean,    // Backend'de snake_case
  created_at: string,     // ISO date string
  description?: string,
  sort_order?: number
}
```

**Not**: Frontend `is_default` ve `created_at` field'larını snake_case bekliyor.

### Transaction Model
```typescript
{
  id: string (UUID),
  amount: number,
  type: "income" | "expense",
  description: string,
  category: {
    id: string,
    name: string,
    icon: string,
    color: string
  },
  date: "YYYY-MM-DD",
  notes?: string,
  created_at: string
}
```

## ⚠️ Önemli Notlar

### 1. Response Field İsimleri
- Backend'de **snake_case** kullanılmalı (`created_at`, `is_default`)
- Frontend snake_case bekliyor
- Alternatif: Frontend'e camelCase gönderip frontend'de transform et (daha iyi değil)

### 2. Error Handling
Frontend error response'u şu formatta bekliyor:
```json
{
  "success": false,
  "message_key": "ERROR_MESSAGE_KEY",
  "error": "ERROR_CODE",
  "fields": {
    "field_name": [
      {
        "message": "Hata mesajı",
        "value": "hatalı_değer",
        "location": "body"
      }
    ]
  },
  "summary": "1 alanda hata bulundu",
  "message": "Doğrulama hatası"
}
```

Frontend `error?.message_key` veya `error?.error` field'larını kullanır.

### 3. Pagination
Frontend pagination'ı şu formatta bekliyor:
```typescript
{
  total: number,
  current_page: number,
  per_page: number
}
```

### 4. Date Format
- Tarihler **ISO8601** formatında (`YYYY-MM-DD`)
- Frontend `moment.js` kullanıyor

### 5. Amount Format
- Backend'e **formatlanmamış sayı** gönderilir (örn: `1500.50`)
- Frontend formatlamayı kendisi yapar

## 🔍 Frontend'de Kullanılmayan Ama Gerekli Endpoint'ler

Bu endpoint'ler frontend kodunda henüz kullanılmıyor ama gerekli:

1. `GET /api/transactions` - İşlem listesi (RecentEntries component'i için)
2. `GET /api/transactions/:id` - İşlem detayı
3. `PUT /api/transactions/:id` - İşlem güncelle
4. `DELETE /api/transactions/:id` - İşlem sil
5. `GET /api/auth/me` - Kullanıcı profili
6. `POST /api/auth/refresh` - Token yenileme

## 📝 Frontend Validation Kuralları

Frontend'de yapılan validation'lar (backend'de de olmalı):

### Register
- Email: Geçerli email formatı
- Password: Min 6 karakter (frontend'de, backend'de daha sıkı olabilir)
- ConfirmPassword: Password ile eşleşmeli
- Name: Required

### Category
- Name: 2-20 karakter
- Type: "income" | "expense"
- Icon: String (opsiyonel)
- Color: Hex format (opsiyonel)

### Transaction
- Amount: Required, pozitif sayı
- Description: Required, 1-500 karakter
- Date: Required, ISO format
- CategoryId: Required, UUID
- Notes: Opsiyonel, max 1000 karakter

## 🎯 Öncelik Sırası

1. **Yüksek Öncelik** (Frontend aktif kullanıyor):
   - Authentication (login, register)
   - Categories (CRUD)
   - Transactions (create income/expense)
   - Analytics (dashboard)

2. **Orta Öncelik** (Frontend hazır ama kullanmıyor):
   - Transactions (list, update, delete)
   - Auth (refresh, me)

3. **Düşük Öncelik** (Gelecek özellikler):
   - Raporlar
   - Export
   - Tekrarlayan işlemler

