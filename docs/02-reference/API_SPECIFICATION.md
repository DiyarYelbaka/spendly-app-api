# API Spesifikasyonu

> Bu dosya, tüm API endpoint'lerinin detaylı spesifikasyonunu içerir. Frontend'in beklediği formatlara uygun olmalıdır.

## 📋 Genel Bilgiler

- **Base URL**: `http://localhost:3001`
- **API Version**: v1 (gelecekte `/api/v1/` prefix'i eklenebilir)
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

## 📝 Response Format Standartları

### Başarılı Response
```json
{
  "success": true,
  "message_key": "SUCCESS_MESSAGE_KEY",
  "data": {
    // Response data
  },
  "message": "İşlem başarılı"
}
```

### Hata Response
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

### Pagination Response (List Endpoint'leri için)
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "total": 50,
      "current_page": 1,
      "per_page": 20
    }
  }
}
```

**Not**: `useApiCall` hook'u için `data` field'ı içinde `items` array'i olmalı.

## 🔐 Authentication Endpoints

### POST /api/auth/register
Yeni kullanıcı kaydı.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "name": "Kullanıcı Adı"
}
```

**Validation:**
- `email`: Geçerli email formatı, unique
- `password`: Min 6 karakter, en az 1 küçük harf, 1 büyük harf, 1 rakam
- `confirmPassword`: Password ile eşleşmeli
- `name`: 2-100 karakter, sadece harfler ve boşluk

**Response:**
```json
{
  "success": true,
  "message_key": "AUTH_REGISTER_SUCCESS",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Kullanıcı Adı",
      "createdAt": "2025-01-21T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresAt": "2025-01-28T10:30:00.000Z"
    }
  },
  "message": "Kullanıcı başarıyla oluşturuldu"
}
```

### POST /api/auth/login
Kullanıcı girişi.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Headers:**
- `x-device-id`: Opsiyonel cihaz ID'si

**Response:**
```json
{
  "success": true,
  "message_key": "AUTH_LOGIN_SUCCESS",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Kullanıcı Adı",
      "createdAt": "2025-01-21T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresAt": "2025-01-28T10:30:00.000Z"
    }
  },
  "message": "Giriş başarılı"
}
```

### POST /api/auth/refresh
Access token yenileme.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response:**
```json
{
  "success": true,
  "message_key": "AUTH_TOKEN_REFRESH_SUCCESS",
  "data": {
    "accessToken": "new_jwt_token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Kullanıcı Adı"
    }
  },
  "message": "Token yenilendi"
}
```

### POST /api/auth/logout
Kullanıcı çıkışı.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response:**
```json
{
  "success": true,
  "message_key": "AUTH_LOGOUT_SUCCESS",
  "message": "Çıkış başarılı"
}
```

### GET /api/auth/me
Mevcut kullanıcı profili.

**Headers:**
- `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "message_key": "AUTH_PROFILE_RETRIEVED",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Kullanıcı Adı",
      "createdAt": "2025-01-21T10:30:00.000Z"
    },
    "userContext": {
      "preferences": {},
      "firstName": "Kullanıcı",
      "initials": "KU"
    }
  },
  "message": "Profil bilgileri alındı"
}
```

## 📁 Categories Endpoints

**Not**: Tüm kategori endpoint'leri authentication gerektirir.

### GET /api/categories
Kullanıcının kategorilerini listele.

**Query Parameters:**
- `type`: `income` | `expense` (opsiyonel)
- `include_defaults`: `boolean` (default: true)
- `include_stats`: `boolean` (default: false)
- `search`: `string` (opsiyonel)

**Headers:**
- `Authorization: Bearer {accessToken}`

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Kategori Adı",
        "type": "expense",
        "icon": "🍔",
        "color": "#FF5733",
        "description": "Açıklama",
        "sort_order": 1,
        "is_active": true,
        "is_default": false,
        "created_at": "2025-01-21T10:30:00.000Z",
        "stats": {
          "transaction_count": 5,
          "total_amount": 150.50
        }
      }
    ],
    "pagination": {
      "total": 10,
      "current_page": 1,
      "per_page": 20
    }
  }
}
```

**Önemli**: Field isimleri **snake_case** olmalı (`is_default`, `created_at`).

### GET /api/categories/:id
Tek kategori detayı.

**Path Parameters:**
- `id`: UUID

**Query Parameters:**
- `include_stats`: `boolean` (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kategori Adı",
    "type": "expense",
    "icon": "🍔",
    "color": "#FF5733",
    "description": "Açıklama",
    "sort_order": 1,
    "is_active": true,
    "is_default": false,
    "created_at": "2025-01-21T10:30:00.000Z"
  }
}
```

### POST /api/categories
Yeni kategori oluştur.

**Request Body:**
```json
{
  "name": "Kategori Adı",
  "type": "expense",
  "icon": "🍔",
  "color": "#FF5733",
  "description": "Açıklama",
  "sort_order": 1
}
```

**Validation:**
- `name`: 2-20 karakter, harf/rakam/temel işaretler
- `type`: `income` | `expense`
- `icon`: 1-10 karakter (opsiyonel)
- `color`: Hex format (#FF5733) (opsiyonel)
- `description`: Max 500 karakter (opsiyonel)
- `sort_order`: 0-9999 arası sayı (opsiyonel)

**Response:**
```json
{
  "success": true,
  "message_key": "CATEGORY_CREATED",
  "data": {
    "id": "uuid",
    "name": "Kategori Adı",
    "type": "expense",
    "icon": "🍔",
    "color": "#FF5733",
    "is_default": false,
    "created_at": "2025-01-21T10:30:00.000Z"
  },
  "message": "Kategori başarıyla oluşturuldu"
}
```

### PUT /api/categories/:id
Kategori güncelle.

**Request Body:**
```json
{
  "name": "Yeni Kategori Adı",
  "icon": "🍕",
  "color": "#00FF00",
  "description": "Yeni açıklama",
  "sort_order": 2,
  "is_active": true
}
```

**Not**: `type` ve `is_default` güncellenemez.

**Response:**
```json
{
  "success": true,
  "message_key": "CATEGORY_UPDATED",
  "data": {
    "id": "uuid",
    "name": "Yeni Kategori Adı",
    "icon": "🍕",
    "color": "#00FF00",
    "updated_at": "2025-01-21T10:30:00.000Z"
  },
  "message": "Kategori başarıyla güncellendi"
}
```

### DELETE /api/categories/:id
Kategori sil (soft delete).

**Not**: 
- İşlem yapılmış kategoriler silinemez
- Varsayılan kategoriler silinemez

**Response:**
```json
{
  "success": true,
  "message_key": "CATEGORY_DELETED",
  "message": "Kategori başarıyla silindi"
}
```

## 💰 Transactions Endpoints

**Not**: Tüm transaction endpoint'leri authentication gerektirir.

### POST /api/transactions/income
Gelir ekle.

**Request Body:**
```json
{
  "amount": 1500.50,
  "description": "Maaş",
  "category_id": "uuid",
  "date": "2025-01-21",
  "notes": "Ocak maaşı"
}
```

**Validation:**
- `amount`: Pozitif sayı (min: 0.01)
- `description`: 1-500 karakter
- `category_id`: UUID format, kategori type'ı "income" olmalı
- `date`: ISO8601 format (YYYY-MM-DD) (opsiyonel, default: bugün)
- `notes`: Max 1000 karakter (opsiyonel)

**Response:**
```json
{
  "success": true,
  "message_key": "TRANSACTION_CREATED",
  "data": {
    "id": "uuid",
    "amount": 1500.50,
    "type": "income",
    "description": "Maaş",
    "category": {
      "id": "uuid",
      "name": "Maaş",
      "icon": "💰",
      "color": "#00FF00"
    },
    "date": "2025-01-21",
    "notes": "Ocak maaşı",
    "created_at": "2025-01-21T10:30:00.000Z"
  },
  "message": "Gelir başarıyla eklendi"
}
```

### POST /api/transactions/expense
Gider ekle.

**Request Body:** (Income ile aynı)

**Validation:** (Income ile aynı, ama `category_id` type'ı "expense" olmalı)

**Response:** (Income ile aynı format, `type: "expense"`)

### GET /api/transactions
İşlemleri listele.

**Query Parameters:**
- `type`: `income` | `expense` (opsiyonel)
- `category_id`: UUID (opsiyonel)
- `start_date`: ISO8601 format (opsiyonel)
- `end_date`: ISO8601 format (opsiyonel)
- `search`: 1-100 karakter (opsiyonel)
- `page`: Sayı (default: 1)
- `limit`: 1-100 arası sayı (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "amount": 1500.50,
        "type": "income",
        "description": "Maaş",
        "category": {
          "id": "uuid",
          "name": "Maaş",
          "icon": "💰",
          "color": "#00FF00"
        },
        "date": "2025-01-21",
        "notes": "Ocak maaşı",
        "created_at": "2025-01-21T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 50,
      "current_page": 1,
      "per_page": 20
    }
  }
}
```

### GET /api/transactions/:id
Tek işlem detayı.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 1500.50,
    "type": "income",
    "description": "Maaş",
    "category": {
      "id": "uuid",
      "name": "Maaş",
      "icon": "💰",
      "color": "#00FF00"
    },
    "date": "2025-01-21",
    "notes": "Ocak maaşı",
    "created_at": "2025-01-21T10:30:00.000Z",
    "updated_at": "2025-01-21T10:30:00.000Z"
  }
}
```

### PUT /api/transactions/:id
İşlem güncelle.

**Request Body:**
```json
{
  "amount": 1600.00,
  "description": "Güncellenmiş maaş",
  "category_id": "uuid",
  "date": "2025-01-21",
  "notes": "Güncellenmiş notlar"
}
```

**Response:**
```json
{
  "success": true,
  "message_key": "TRANSACTION_UPDATED",
  "data": {
    "id": "uuid",
    "amount": 1600.00,
    "description": "Güncellenmiş maaş",
    "updated_at": "2025-01-21T10:30:00.000Z"
  },
  "message": "İşlem başarıyla güncellendi"
}
```

### DELETE /api/transactions/:id
İşlem sil.

**Response:**
```json
{
  "success": true,
  "message_key": "TRANSACTION_DELETED",
  "message": "İşlem başarıyla silindi"
}
```

## 📊 Analytics Endpoints

**Not**: Tüm analytics endpoint'leri authentication gerektirir.

### GET /api/analytics/dashboard
Dashboard verileri.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_income": 5000.00,
      "total_expense": 2500.00,
      "net_balance": 2500.00
    },
    "monthly_trends": [
      {
        "month": "2025-01",
        "income": 1500.00,
        "expense": 800.00
      }
    ],
    "category_breakdown": [
      {
        "category": "Maaş",
        "amount": 1500.00,
        "percentage": 30.0
      }
    ]
  }
}
```

**Önemli**: Frontend `summary.netIncome`, `summary.totalIncome`, `summary.totalExpense` bekliyor.

### GET /api/analytics/summary
Finansal özet.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_balance": 2500.00,
    "monthly_income": 1500.00,
    "monthly_expense": 800.00,
    "savings_rate": 46.67,
    "top_categories": [
      {
        "name": "Maaş",
        "amount": 1500.00,
        "type": "income"
      }
    ]
  }
}
```

## ⚠️ Error Codes

- `VALIDATION_ERROR`: Doğrulama hatası
- `AUTH_INVALID_CREDENTIALS`: Geçersiz kimlik bilgileri
- `AUTH_TOKEN_EXPIRED`: Token süresi dolmuş
- `AUTH_TOKEN_INVALID`: Geçersiz token
- `CATEGORY_NOT_FOUND`: Kategori bulunamadı
- `TRANSACTION_NOT_FOUND`: İşlem bulunamadı
- `INSUFFICIENT_PERMISSIONS`: Yetersiz yetki
- `SERVER_ERROR`: Sunucu hatası

## 🔒 Rate Limiting (Gelecek)

- **Standard Limit**: 100 requests / 15 minutes
- **Auth Limit**: 10 requests / 15 minutes (login/register)
- **Strict Limit**: 5 requests / 15 minutes (sensitive operations)

