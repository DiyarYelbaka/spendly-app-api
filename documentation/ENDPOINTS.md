# API Endpoints - Detaylı Dokümantasyon

Bu dokümantasyon, Spendly API'nin tüm endpoint'lerini, request/response örnekleriyle birlikte detaylı olarak açıklar.

## 📋 İçindekiler

1. [Authentication Endpoints](#authentication-endpoints)
2. [Categories Endpoints](#categories-endpoints)
3. [Transactions Endpoints](#transactions-endpoints)
4. [Analytics Endpoints](#analytics-endpoints)
5. [Health Check Endpoints](#health-check-endpoints)

## 🔐 Authentication

Tüm endpoint'ler `/api/auth` prefix'i ile başlar.

### POST /api/auth/register

Yeni kullanıcı kaydı oluşturur.

**Authentication**: Gerekli değil

**Request**:
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-01-08T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

**Hata Örnekleri**:

**400 Bad Request** - Şifreler eşleşmiyor:
```json
{
  "success": false,
  "error": {
    "message": "Şifreler eşleşmiyor",
    "messageKey": "PASSWORD_MISMATCH",
    "statusCode": 400,
    "fields": {
      "confirmPassword": [
        {
          "message": "Şifreler eşleşmiyor",
          "value": "DifferentPass123"
        }
      ]
    }
  }
}
```

**409 Conflict** - Email zaten kullanılıyor:
```json
{
  "success": false,
  "error": {
    "message": "Bu email adresi zaten kullanılıyor",
    "messageKey": "EMAIL_ALREADY_EXISTS",
    "statusCode": 409
  }
}
```

### POST /api/auth/login

Kullanıcı girişi yapar.

**Authentication**: Gerekli değil

**Request**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK)**: Register ile aynı format

**Hata Örnekleri**:

**401 Unauthorized** - Geçersiz kimlik bilgileri:
```json
{
  "success": false,
  "error": {
    "message": "Email veya şifre hatalı",
    "messageKey": "INVALID_CREDENTIALS",
    "statusCode": 401
  }
}
```

### POST /api/auth/refresh

Access token'ı yeniler.

**Authentication**: Gerekli değil (refresh token gerekli)

**Request**:
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "yeni_access_token",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-01-08T10:30:00.000Z"
    }
  }
}
```

### GET /api/auth/me

Mevcut kullanıcı profilini getirir.

**Authentication**: Gerekli (Bearer Token)

**Request**:
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-08T10:30:00.000Z",
    "firstName": "John",
    "initials": "JD",
    "preferences": {}
  }
}
```

---

## 📁 Categories

Tüm endpoint'ler `/api/categories` prefix'i ile başlar.

**Tüm endpoint'ler JWT Authentication gerektirir.**

### POST /api/categories

Yeni kategori oluşturur.

**Request**:
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Yemek",
  "type": "expense",
  "icon": "🍔",
  "color": "#FF5733",
  "description": "Yemek ve içecek giderleri",
  "sort_order": 1
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "category-uuid",
    "name": "Yemek",
    "type": "expense",
    "icon": "🍔",
    "color": "#FF5733",
    "description": "Yemek ve içecek giderleri",
    "sort_order": 1,
    "is_active": true,
    "is_default": false,
    "created_at": "2025-01-08T10:30:00.000Z"
  }
}
```

### GET /api/categories

Kategorileri listeler.

**Query Parameters**:
- `page` (number, default: 1): Sayfa numarası
- `limit` (number, default: 20): Sayfa başına kayıt
- `type` (string, optional): `income` veya `expense`
- `search` (string, optional): Arama terimi
- `include_defaults` (boolean, default: true): Varsayılan kategorileri dahil et
- `include_stats` (boolean, default: false): İstatistikleri dahil et

**Request**:
```http
GET /api/categories?type=expense&search=yemek&page=1&limit=20&include_stats=true
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "category-uuid",
        "name": "Yemek",
        "type": "expense",
        "icon": "🍔",
        "color": "#FF5733",
        "sort_order": 1,
        "is_active": true,
        "is_default": true,
        "created_at": "2025-01-08T10:30:00.000Z",
        "stats": {
          "transaction_count": 15,
          "total_amount": 1250.50
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### GET /api/categories/:id

Tek kategori detayını getirir.

**Query Parameters**:
- `include_stats` (boolean, optional): İstatistikleri dahil et

**Request**:
```http
GET /api/categories/category-uuid?include_stats=true
Authorization: Bearer <token>
```

**Response (200 OK)**: Tek kategori objesi (list endpoint ile aynı format)

### PUT /api/categories/:id

Kategori günceller.

**Request**:
```http
PUT /api/categories/category-uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Yeni İsim",
  "color": "#00FF00",
  "sort_order": 2
}
```

**Response (200 OK)**: Güncellenmiş kategori objesi

### DELETE /api/categories/:id

Kategori siler (soft delete).

**Request**:
```http
DELETE /api/categories/category-uuid
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Kategori başarıyla silindi"
  }
}
```

---

## 💰 Transactions

Tüm endpoint'ler `/api/transactions` prefix'i ile başlar.

**Tüm endpoint'ler JWT Authentication gerektirir.**

### POST /api/transactions/income

Gelir işlemi ekler.

**Request**:
```http
POST /api/transactions/income
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000.00,
  "description": "Ocak ayı maaşı",
  "category_id": "category-uuid",
  "date": "2025-01-01",
  "notes": "Ekstra bonus dahil"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "transaction-uuid",
    "amount": 5000.00,
    "type": "income",
    "description": "Ocak ayı maaşı",
    "category_id": "category-uuid",
    "category": {
      "id": "category-uuid",
      "name": "Maaş",
      "icon": "💰",
      "color": "#00C853"
    },
    "date": "2025-01-01",
    "notes": "Ekstra bonus dahil",
    "created_at": "2025-01-08T10:30:00.000Z"
  }
}
```

### POST /api/transactions/expense

Gider işlemi ekler. Format income ile aynı, ancak kategori `expense` tipinde olmalı.

### GET /api/transactions

İşlemleri listeler.

**Query Parameters**:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `type` (string, optional): `income` veya `expense`
- `category_id` (string, optional): Kategori ID
- `start_date` (string, optional): Başlangıç tarihi (ISO8601)
- `end_date` (string, optional): Bitiş tarihi (ISO8601)
- `search` (string, optional): Arama terimi

**Request**:
```http
GET /api/transactions?type=expense&start_date=2025-01-01&end_date=2025-01-31&page=1&limit=20
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction-uuid",
        "amount": 150.50,
        "type": "expense",
        "description": "Market alışverişi",
        "category_id": "category-uuid",
        "category": {
          "id": "category-uuid",
          "name": "Yemek",
          "icon": "🍔",
          "color": "#FF5733"
        },
        "date": "2025-01-05",
        "notes": null,
        "created_at": "2025-01-05T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### GET /api/transactions/:id

Tek işlem detayını getirir.

**Response (200 OK)**: Tek transaction objesi

### PUT /api/transactions/:id

İşlem günceller.

**Request**:
```http
PUT /api/transactions/transaction-uuid
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 6000.00,
  "description": "Güncellenmiş açıklama"
}
```

**Response (200 OK)**: Güncellenmiş transaction objesi

### DELETE /api/transactions/:id

İşlem siler.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "İşlem başarıyla silindi"
  }
}
```

---

## 📊 Analytics

Tüm endpoint'ler `/api/analytics` prefix'i ile başlar.

**Tüm endpoint'ler JWT Authentication gerektirir.**

### GET /api/analytics/dashboard

Dashboard verilerini getirir.

**Request**:
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_income": 50000,
      "total_expense": 30000,
      "net_balance": 20000,
      "netIncome": 20000,
      "totalIncome": 50000,
      "totalExpense": 30000
    },
    "monthly_trends": [
      {
        "month": "2024-07",
        "income": 5000,
        "expense": 3000
      },
      {
        "month": "2024-08",
        "income": 6000,
        "expense": 4000
      }
    ],
    "category_breakdown": [
      {
        "category": "Maaş",
        "amount": 20000,
        "percentage": 40,
        "type": "income"
      },
      {
        "category": "Yemek",
        "amount": 5000,
        "percentage": 16.67,
        "type": "expense"
      }
    ]
  }
}
```

### GET /api/analytics/summary

Finansal özet getirir.

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "current_balance": 20000,
    "monthly_income": 5000,
    "monthly_expense": 3000,
    "savings_rate": 40,
    "top_categories": [
      {
        "name": "Maaş",
        "amount": 20000,
        "type": "income"
      },
      {
        "name": "Yemek",
        "amount": 5000,
        "type": "expense"
      }
    ]
  }
}
```

---

## 🏥 Health Check

### GET /api

Ana health check endpoint'i.

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Hesap Asistan API is running",
  "timestamp": "2025-01-08T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### GET /api/health

Açık health check endpoint'i. `/api` ile aynı response.

---

## 🔒 Authentication Header

Tüm korumalı endpoint'ler için:

```http
Authorization: Bearer <access_token>
```

**Token Alma**:
1. `/api/auth/register` veya `/api/auth/login` endpoint'lerini kullan
2. Response'dan `accessToken` al
3. Her istekte `Authorization` header'ına ekle

**Token Yenileme**:
- Access token süresi dolduğunda `/api/auth/refresh` endpoint'ini kullan
- `refreshToken` ile yeni `accessToken` al

---

## 📝 Notlar

1. **Tarih Formatı**: ISO8601 formatı kullanılır (`YYYY-MM-DD` veya `YYYY-MM-DDTHH:mm:ss.sssZ`)
2. **Para Formatı**: Decimal (ondalıklı) sayılar kullanılır (örneğin: `150.50`)
3. **UUID Formatı**: Tüm ID'ler UUID formatındadır
4. **Pagination**: Varsayılan sayfa başına 20 kayıt
5. **Response Format**: Tüm başarılı yanıtlar `{ success: true, data: ... }` formatındadır
6. **Error Format**: Tüm hata yanıtları `{ success: false, error: ... }` formatındadır

---

**Sonraki Adım**: [CORE.md](./CORE.md) dosyasını okuyarak core modül bileşenlerini öğrenin.

