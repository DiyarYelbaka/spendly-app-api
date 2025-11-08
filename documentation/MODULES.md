# Modüller - Detaylı Açıklamalar

Bu dokümantasyon, Spendly API projesindeki tüm modüllerin detaylı açıklamalarını içerir. Her modülün amacı, bileşenleri, fonksiyonları ve kullanım örnekleri bulunmaktadır.

## 📑 İçindekiler

1. [App Module](#app-module) - Ana modül
2. [Auth Module](#auth-module) - Kimlik doğrulama
3. [Categories Module](#categories-module) - Kategori yönetimi
4. [Transactions Module](#transactions-module) - İşlem yönetimi
5. [Analytics Module](#analytics-module) - Analitik ve raporlama
6. [Core Module](#core-module) - Ortak bileşenler (ayrı dosyada detaylı)

---

## App Module

### Genel Bakış

**App Module**, uygulamanın ana modülüdür. Tüm diğer modüller burada birleşir ve uygulama bu modül üzerinden başlatılır.

**Dosya**: `src/app.module.ts`

### Bileşenler

#### 1. AppController

**Dosya**: `src/app.controller.ts`

**Amaç**: Health check (sağlık kontrolü) endpoint'lerini sağlar.

**Endpoint'ler**:

| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api` | Ana health check endpoint'i |
| GET | `/api/health` | Açık health check endpoint'i |

**Örnek Response**:
```json
{
  "success": true,
  "message": "Hesap Asistan API is running",
  "timestamp": "2025-01-08T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

#### 2. AppService

**Dosya**: `src/app.service.ts`

**Amaç**: Health check iş mantığını içerir.

**Fonksiyonlar**:

- `getHealth()`: Uygulama durumu bilgilerini döndürür

### Modül Yapılandırması

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    AnalyticsModule,
    JwtModule.register({...})
  ],
  controllers: [AppController],
  providers: [AppService, JwtUserMiddleware]
})
```

---

## Auth Module

### Genel Bakış

**Auth Module**, kullanıcı kimlik doğrulama işlemlerini yönetir. Kullanıcı kaydı, girişi, token yenileme ve profil yönetimi gibi işlemleri içerir.

**Dosya**: `src/auth/auth.module.ts`

### Bileşenler

#### 1. AuthController

**Dosya**: `src/auth/auth.controller.ts`

**Amaç**: Kimlik doğrulama ile ilgili HTTP isteklerini karşılar.

**Endpoint'ler**:

| Method | URL | Açıklama | Auth Gerekli |
|--------|-----|----------|--------------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı | ❌ |
| POST | `/api/auth/login` | Kullanıcı girişi | ❌ |
| POST | `/api/auth/refresh` | Access token yenileme | ❌ |
| POST | `/api/auth/logout` | Kullanıcı çıkışı | ❌ |
| GET | `/api/auth/me` | Mevcut kullanıcı profili | ✅ |

**Detaylı Açıklamalar**:

##### POST /api/auth/register

Yeni kullanıcı hesabı oluşturur.

**Request Body**:
```json
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
      "id": "uuid",
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

**İş Akışı**:
1. Email kontrolü (aynı email'de kullanıcı var mı?)
2. Şifre ve confirmPassword eşleşme kontrolü
3. Şifre hash'leme (bcrypt)
4. Kullanıcı veritabanına kaydetme
5. Varsayılan kategoriler oluşturma
6. JWT token'lar oluşturma

**Hata Durumları**:
- `400 Bad Request`: Validation hatası veya şifreler eşleşmiyor
- `409 Conflict`: Email zaten kullanılıyor

##### POST /api/auth/login

Mevcut kullanıcının giriş yapmasını sağlar.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK)**: Register ile aynı format

**İş Akışı**:
1. Email ile kullanıcı bulma
2. Şifre kontrolü (hash'lenmiş şifre ile karşılaştırma)
3. JWT token'lar oluşturma

**Hata Durumları**:
- `401 Unauthorized`: Email veya şifre hatalı

##### POST /api/auth/refresh

Süresi dolmuş access token'ı yeniler.

**Request Body**:
```json
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
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

**Hata Durumları**:
- `401 Unauthorized`: Geçersiz refresh token

##### GET /api/auth/me

Giriş yapmış kullanıcının profil bilgilerini getirir.

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-01-08T10:30:00.000Z"
    },
    "userContext": {
      "preferences": {},
      "firstName": "John",
      "initials": "JD"
    }
  }
}
```

#### 2. AuthService

**Dosya**: `src/auth/auth.service.ts`

**Amaç**: Kimlik doğrulama iş mantığını içerir.

**Fonksiyonlar**:

- `register(dto: RegisterDto)`: Yeni kullanıcı kaydı
- `login(dto: LoginDto)`: Kullanıcı girişi
- `refresh(dto: RefreshTokenDto)`: Token yenileme
- `logout(dto: RefreshTokenDto)`: Kullanıcı çıkışı
- `getProfile(userId: string)`: Kullanıcı profili getirme
- `generateTokens(userId: string)`: JWT token oluşturma (private)

**Önemli Detaylar**:

1. **Şifre Hash'leme**: bcrypt kullanılır (10 salt rounds)
2. **Varsayılan Kategoriler**: Yeni kullanıcı kaydında otomatik oluşturulur
3. **Transaction**: Kullanıcı ve kategoriler aynı transaction içinde oluşturulur

#### 3. JWT Strategy

**Dosya**: `src/auth/strategies/jwt.strategy.ts`

**Amaç**: JWT token doğrulama stratejisini tanımlar.

**İşlevi**: Passport JWT stratejisini kullanarak token'ları doğrular ve kullanıcı bilgisini çıkarır.

#### 4. JWT Auth Guard

**Dosya**: `src/auth/guards/jwt-auth.guard.ts`

**Amaç**: Endpoint'leri JWT token ile korur.

**Kullanım**: Controller veya endpoint seviyesinde `@UseGuards(JwtAuthGuard)` decorator'ı ile kullanılır.

---

## Categories Module

### Genel Bakış

**Categories Module**, kullanıcı kategorilerini yönetir. Gelir ve gider kategorileri için CRUD işlemleri sağlar.

**Dosya**: `src/categories/categories.module.ts`

### Bileşenler

#### 1. CategoriesController

**Dosya**: `src/categories/categories.controller.ts`

**Amaç**: Kategori ile ilgili HTTP isteklerini karşılar.

**Tüm Endpoint'ler JWT Auth Gerektirir**

**Endpoint'ler**:

| Method | URL | Açıklama |
|--------|-----|----------|
| POST | `/api/categories` | Yeni kategori oluştur |
| GET | `/api/categories` | Kategorileri listele |
| GET | `/api/categories/:id` | Tek kategori detayı |
| PUT | `/api/categories/:id` | Kategori güncelle |
| DELETE | `/api/categories/:id` | Kategori sil |

**Detaylı Açıklamalar**:

##### POST /api/categories

Yeni kategori oluşturur.

**Request Body**:
```json
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
    "id": "uuid",
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

**İş Kuralları**:
- Aynı kullanıcının, aynı tipte ve aynı isimde kategorisi olamaz
- `type` sadece `"income"` veya `"expense"` olabilir

##### GET /api/categories

Kategorileri listeler (sayfalama, filtreleme, arama destekler).

**Query Parameters**:
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına kayıt (varsayılan: 20)
- `type`: Kategori tipi filtresi (`income` veya `expense`)
- `search`: Arama terimi (kategori adında ara)
- `include_defaults`: Varsayılan kategorileri dahil et (varsayılan: true)
- `include_stats`: İstatistikleri dahil et (varsayılan: false)

**Örnek Request**:
```
GET /api/categories?type=expense&search=yemek&page=1&limit=20
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
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

##### GET /api/categories/:id

Tek kategori detayını getirir.

**Query Parameters**:
- `include_stats`: İstatistikleri dahil et (`true` veya `false`)

**Response (200 OK)**: Tek kategori objesi

##### PUT /api/categories/:id

Kategori bilgilerini günceller.

**Request Body** (Tüm alanlar opsiyonel):
```json
{
  "name": "Yeni İsim",
  "icon": "🍕",
  "color": "#00FF00",
  "description": "Yeni açıklama",
  "sort_order": 2,
  "is_active": true
}
```

**İş Kuralları**:
- `type` güncellenemez
- `is_default` kategoriler güncellenebilir (şimdilik)
- Aynı isimde başka kategori olamaz

##### DELETE /api/categories/:id

Kategoriyi siler (soft delete - `is_active = false`).

**İş Kuralları**:
- Varsayılan kategoriler (`is_default = true`) silinemez
- Üzerinde işlem yapılmış kategoriler silinemez

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Kategori başarıyla silindi"
  }
}
```

#### 2. CategoriesService

**Dosya**: `src/categories/categories.service.ts`

**Fonksiyonlar**:

- `create(dto: CreateCategoryDto, userId: string)`: Yeni kategori oluştur
- `findAll(userId: string, query: CategoryQueryDto)`: Kategorileri listele
- `findOne(id: string, userId: string, includeStats?: boolean)`: Tek kategori getir
- `update(id: string, dto: UpdateCategoryDto, userId: string)`: Kategori güncelle
- `remove(id: string, userId: string)`: Kategori sil
- `createDefaultCategories(userId: string)`: Varsayılan kategoriler oluştur (private)

---

## Transactions Module

### Genel Bakış

**Transactions Module**, gelir ve gider işlemlerini yönetir. Kullanıcıların finansal işlemlerini kaydetmesini, görüntülemesini, güncellemesini ve silmesini sağlar.

**Dosya**: `src/transactions/transactions.module.ts`

### Bileşenler

#### 1. TransactionsController

**Dosya**: `src/transactions/transactions.controller.ts`

**Amaç**: İşlem ile ilgili HTTP isteklerini karşılar.

**Tüm Endpoint'ler JWT Auth Gerektirir**

**Endpoint'ler**:

| Method | URL | Açıklama |
|--------|-----|----------|
| POST | `/api/transactions/income` | Gelir ekle |
| POST | `/api/transactions/expense` | Gider ekle |
| GET | `/api/transactions` | İşlemleri listele |
| GET | `/api/transactions/:id` | Tek işlem detayı |
| PUT | `/api/transactions/:id` | İşlem güncelle |
| DELETE | `/api/transactions/:id` | İşlem sil |

**Detaylı Açıklamalar**:

##### POST /api/transactions/income

Yeni gelir işlemi ekler.

**Request Body**:
```json
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
    "id": "uuid",
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

**İş Kuralları**:
- Kategori mutlaka `income` tipinde olmalı
- Kategori kullanıcıya ait olmalı
- `date` gönderilmezse bugünün tarihi kullanılır

##### POST /api/transactions/expense

Yeni gider işlemi ekler. `income` endpoint'i ile aynı format, ancak kategori `expense` tipinde olmalı.

##### GET /api/transactions

İşlemleri listeler (sayfalama, filtreleme, arama destekler).

**Query Parameters**:
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına kayıt (varsayılan: 20)
- `type`: İşlem tipi (`income` veya `expense`)
- `category_id`: Kategori ID filtresi
- `start_date`: Başlangıç tarihi (ISO8601)
- `end_date`: Bitiş tarihi (ISO8601)
- `search`: Arama terimi (açıklamada ara)

**Örnek Request**:
```
GET /api/transactions?type=expense&start_date=2025-01-01&end_date=2025-01-31&page=1&limit=20
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
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

##### PUT /api/transactions/:id

İşlem bilgilerini günceller.

**Request Body** (Tüm alanlar opsiyonel):
```json
{
  "amount": 6000.00,
  "description": "Güncellenmiş açıklama",
  "category_id": "new-category-uuid",
  "date": "2025-01-02",
  "notes": "Güncellenmiş notlar"
}
```

**İş Kuralları**:
- İşlem tipi (`type`) değiştirilemez
- Kategori değiştirilirse, yeni kategori aynı tipte olmalı

##### DELETE /api/transactions/:id

İşlemi siler (hard delete - veritabanından tamamen silinir).

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "İşlem başarıyla silindi"
  }
}
```

#### 2. TransactionsService

**Dosya**: `src/transactions/transactions.service.ts`

**Fonksiyonlar**:

- `createIncome(dto: CreateTransactionDto, userId: string)`: Gelir işlemi oluştur
- `createExpense(dto: CreateTransactionDto, userId: string)`: Gider işlemi oluştur
- `findAll(userId: string, query: TransactionQueryDto)`: İşlemleri listele
- `findOne(id: string, userId: string)`: Tek işlem getir
- `update(id: string, dto: UpdateTransactionDto, userId: string)`: İşlem güncelle
- `remove(id: string, userId: string)`: İşlem sil

---

## Analytics Module

### Genel Bakış

**Analytics Module**, kullanıcının finansal verilerini analiz eder ve raporlar sunar. Dashboard verileri, finansal özet ve istatistikler sağlar.

**Dosya**: `src/analytics/analytics.module.ts`

### Bileşenler

#### 1. AnalyticsController

**Dosya**: `src/analytics/analytics.controller.ts`

**Amaç**: Analitik ile ilgili HTTP isteklerini karşılar.

**Tüm Endpoint'ler JWT Auth Gerektirir**

**Endpoint'ler**:

| Method | URL | Açıklama |
|--------|-----|----------|
| GET | `/api/analytics/dashboard` | Dashboard verileri |
| GET | `/api/analytics/summary` | Finansal özet |

**Detaylı Açıklamalar**:

##### GET /api/analytics/dashboard

Dashboard için gerekli tüm analitik verileri getirir.

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
      // ... son 6 ay
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
      // ... tüm kategoriler
    ]
  }
}
```

**İçerik**:
- `summary`: Tüm zamanlar toplam gelir, gider, net bakiye
- `monthly_trends`: Son 6 ayın aylık gelir/gider trendleri
- `category_breakdown`: Kategori bazında dağılım (yüzde ile)

##### GET /api/analytics/summary

Finansal özet bilgilerini getirir.

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
      // ... top 5 kategori
    ]
  }
}
```

**İçerik**:
- `current_balance`: Mevcut bakiye (tüm zamanlar net bakiye)
- `monthly_income`: Bu ayki toplam gelir
- `monthly_expense`: Bu ayki toplam gider
- `savings_rate`: Tasarruf oranı (%)
- `top_categories`: En çok kullanılan kategoriler (top 5)

#### 2. AnalyticsService

**Dosya**: `src/analytics/analytics.service.ts`

**Fonksiyonlar**:

- `getDashboard(userId: string)`: Dashboard verilerini hesapla
- `getSummary(userId: string)`: Finansal özet hesapla
- `getMonthlyTrends(userId: string, months: number)`: Aylık trendleri hesapla (private)
- `getCategoryBreakdown(userId: string)`: Kategori dağılımını hesapla (private)
- `getTopCategories(userId: string, limit: number)`: En çok kullanılan kategorileri getir (private)

**Hesaplama Detayları**:

1. **Toplam Gelir/Gider**: Tüm işlemlerin toplamı (Prisma aggregate)
2. **Net Bakiye**: Toplam gelir - Toplam gider
3. **Aylık Trendler**: Son N ayın her biri için gelir/gider toplamları
4. **Kategori Dağılımı**: Her kategori için toplam tutar ve yüzde
5. **Tasarruf Oranı**: ((Aylık Gelir - Aylık Gider) / Aylık Gelir) * 100

---

## Core Module

Core modül detayları için [CORE.md](./CORE.md) dosyasına bakın.

---

## Modül İlişkileri

```
AppModule
├── ConfigModule (Global)
├── PrismaModule (Global)
├── JwtModule (Global)
│
├── AuthModule
│   └── PrismaModule (import)
│
├── CategoriesModule
│   ├── PrismaModule (import)
│   └── Core (import)
│
├── TransactionsModule
│   ├── PrismaModule (import)
│   └── Core (import)
│
└── AnalyticsModule
    ├── PrismaModule (import)
    └── Core (import)
```

---

**Sonraki Adım**: [ENDPOINTS.md](./ENDPOINTS.md) dosyasını okuyarak tüm API endpoint'lerini detaylı öğrenin.

