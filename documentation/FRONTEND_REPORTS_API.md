# Raporlar API - Frontend Dokümantasyonu

Bu dokümantasyon, Raporlar sayfası için kullanılacak 3 yeni API endpoint'inin kullanımını açıklar.

## 📋 Genel Bilgiler

**Base URL**: `http://localhost:3001/api/analytics` (development)  
**Authentication**: Tüm endpoint'ler JWT token gerektirir  
**Headers**: `Authorization: Bearer <token>`

---

## 1. GET /api/analytics/reports/summary

### 📍 Kullanım Yeri
**Finans Kartları** bölümünde kullanılır:
- Toplam Gelir kartı
- Toplam Gider kartı
- Net Bakiye kartı
- Tasarruf Oranı kartı

### 📤 Request (Gönderilecekler)

**Method**: `GET`  
**URL**: `/api/analytics/reports/summary`

**Query Parameters**:
```
start_date=2025-01-01&end_date=2025-01-31
```

| Parametre | Tip | Zorunlu | Açıklama | Örnek |
|-----------|-----|---------|----------|-------|
| `start_date` | string | ✅ Evet | Başlangıç tarihi (YYYY-MM-DD) | `2025-01-01` |
| `end_date` | string | ✅ Evet | Bitiş tarihi (YYYY-MM-DD) | `2025-01-31` |

**Örnek Request**:
```
GET /api/analytics/reports/summary?start_date=2025-01-01&end_date=2025-01-31
Headers: Authorization: Bearer <token>
```

### 📥 Response (Dönen Veri)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message_key": "SUCCESS",
  "data": {
    "total_income": 50000.00,
    "total_expense": 30000.00,
    "net_balance": 20000.00,
    "savings_rate": 40.00
  }
}
```

**Response Alanları**:
- `total_income` (number): Seçilen tarih aralığındaki toplam gelir
- `total_expense` (number): Seçilen tarih aralığındaki toplam gider
- `net_balance` (number): Net bakiye (gelir - gider)
- `savings_rate` (number): Tasarruf oranı yüzdesi (0-100 arası)

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": {
    "message": "Başlangıç tarihi bitiş tarihinden büyük olamaz",
    "messageKey": "VALIDATION_ERROR",
    "statusCode": 400
  }
}
```

---

## 2. GET /api/analytics/reports/categories

### 📍 Kullanım Yeri
**Kategori Tab'ı** bölümünde kullanılır:
- Kullanıcı "Gelir" veya "Gider" seçer
- Seçilen tipe göre kategoriler listelenir
- Her kategorinin yanında toplam tutar gösterilir
- Kategoriler tutarlarına göre büyükten küçüğe sıralıdır

### 📤 Request (Gönderilecekler)

**Method**: `GET`  
**URL**: `/api/analytics/reports/categories`

**Query Parameters**:
```
start_date=2025-01-01&end_date=2025-01-31&type=expense&page=1&results=20
```

| Parametre | Tip | Zorunlu | Açıklama | Örnek |
|-----------|-----|---------|----------|-------|
| `start_date` | string | ✅ Evet | Başlangıç tarihi (YYYY-MM-DD) | `2025-01-01` |
| `end_date` | string | ✅ Evet | Bitiş tarihi (YYYY-MM-DD) | `2025-01-31` |
| `type` | string | ✅ Evet | İşlem tipi: `income` veya `expense` | `expense` |
| `page` | number | ❌ Hayır | Sayfa numarası (varsayılan: 1) | `1` |
| `results` | number | ❌ Hayır | Sayfa başına kayıt (varsayılan: 20, max: 100) | `20` |

**Örnek Request**:
```
GET /api/analytics/reports/categories?start_date=2025-01-01&end_date=2025-01-31&type=expense&page=1&results=20
Headers: Authorization: Bearer <token>
```

### 📥 Response (Dönen Veri)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message_key": "SUCCESS",
  "data": {
    "items": [
      {
        "id": "category-uuid-1",
        "name": "Yemek",
        "type": "expense",
        "icon": "🍔",
        "color": "#FF5733",
        "description": null,
        "sort_order": 1,
        "is_active": true,
        "is_default": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z",
        "total_amount": 5000.00,
        "transaction_count": 15,
        "percentage": 16.67
      },
      {
        "id": "category-uuid-2",
        "name": "Ulaşım",
        "type": "expense",
        "icon": "🚗",
        "color": "#00C853",
        "description": null,
        "sort_order": 2,
        "is_active": true,
        "is_default": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z",
        "total_amount": 3000.00,
        "transaction_count": 10,
        "percentage": 10.00
      }
    ],
    "pagination": {
      "totalResults": 50,
      "totalPages": 3,
      "currentPage": 1,
      "perPage": 20
    }
  }
}
```

**Response Alanları**:
- `items` (array): Kategori listesi (tutarlara göre DESC sıralı)
  - Her kategori objesi:
    - `id`: Kategori ID'si
    - `name`: Kategori adı
    - `type`: `income` veya `expense`
    - `icon`: Kategori ikonu (emoji)
    - `color`: Kategori rengi (hex)
    - `total_amount`: Bu kategoriye ait toplam tutar
    - `transaction_count`: Bu kategoriye ait işlem sayısı
    - `percentage`: Toplam içindeki yüzdesi
- `pagination`: Sayfalama bilgileri
  - `totalResults`: Toplam kategori sayısı
  - `totalPages`: Toplam sayfa sayısı
  - `currentPage`: Mevcut sayfa numarası
  - `perPage`: Sayfa başına kayıt sayısı

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": {
    "message": "İşlem tipi zorunludur",
    "messageKey": "VALIDATION_ERROR",
    "statusCode": 400
  }
}
```

---

## 3. GET /api/analytics/reports/trends

### 📍 Kullanım Yeri
**Trend Tab'ı** bölümünde kullanılır:
- Gelir-Gider karşılaştırması çizgi grafiği
- **Hourly mod**: Tarih aralığındaki her günün her saati için veri
- **Daily mod**: Tarih aralığındaki her gün için günlük özet
- **Weekly mod**: Tarih aralığındaki her hafta için haftalık özet
- **Monthly mod**: Tarih aralığındaki her ay için aylık özet

### 📤 Request (Gönderilecekler)

**Method**: `GET`  
**URL**: `/api/analytics/reports/trends`

**Query Parameters**:
```
start_date=2025-01-01&end_date=2025-01-31&period=hourly&page=1&results=20
```

| Parametre | Tip | Zorunlu | Açıklama | Örnek |
|-----------|-----|---------|----------|-------|
| `start_date` | string | ✅ Evet | Başlangıç tarihi (YYYY-MM-DD) | `2025-01-01` |
| `end_date` | string | ✅ Evet | Bitiş tarihi (YYYY-MM-DD) | `2025-01-31` |
| `period` | string | ✅ Evet | Rapor periyodu: `hourly`, `daily`, `weekly`, `monthly` | `hourly` |
| `page` | number | ❌ Hayır | Sayfa numarası (varsayılan: 1) | `1` |
| `results` | number | ❌ Hayır | Sayfa başına kayıt (varsayılan: 20, max: 10000) | `20` |

**Period Açıklamaları**:
- `hourly`: Tarih aralığındaki her günün her saati için veri (örn: 2025-01-01 00:00, 2025-01-01 01:00, ...)
- `daily`: Tarih aralığındaki her gün için günlük özet (örn: 2025-01-01, 2025-01-02, ...)
- `weekly`: Tarih aralığındaki her hafta için haftalık özet (örn: 2025-W01, 2025-W02, ...)
- `monthly`: Tarih aralığındaki her ay için aylık özet (örn: 2025-01, 2025-02, ...)

**Önemli Notlar**:
- Tüm period'lar tarih aralığı kabul eder (artık sadece daily için aynı gün zorunluluğu yok)
- Tarih aralığı maksimum **1 yıl** olabilir
- Pagination desteklenir (büyük veri setleri için)

**Örnek Request (Hourly Mod)**:
```
GET /api/analytics/reports/trends?start_date=2025-01-01&end_date=2025-01-03&period=hourly&page=1&results=20
Headers: Authorization: Bearer <token>
```

**Örnek Request (Daily Mod)**:
```
GET /api/analytics/reports/trends?start_date=2025-01-01&end_date=2025-01-31&period=daily&page=1&results=20
Headers: Authorization: Bearer <token>
```

**Örnek Request (Weekly Mod)**:
```
GET /api/analytics/reports/trends?start_date=2025-01-01&end_date=2025-12-31&period=weekly&page=1&results=20
Headers: Authorization: Bearer <token>
```

**Örnek Request (Monthly Mod)**:
```
GET /api/analytics/reports/trends?start_date=2025-01-01&end_date=2025-12-31&period=monthly&page=1&results=20
Headers: Authorization: Bearer <token>
```

### 📥 Response (Dönen Veri)

**Tüm period'lar için ortak response formatı**:

```json
{
  "success": true,
  "message_key": "SUCCESS",
  "data": {
    "granularity": "hourly",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "items": [...],
    "pagination": {
      "totalResults": 100,
      "totalPages": 5,
      "currentPage": 1,
      "perPage": 20
    }
  }
}
```

**Ortak Response Alanları**:
- `granularity`: Veri detay seviyesi (`hourly`, `daily`, `weekly`, `monthly`)
- `start_date`: Tarih aralığının başlangıcı (YYYY-MM-DD)
- `end_date`: Tarih aralığının bitişi (YYYY-MM-DD)
- `items`: Veri noktaları array'i (period'a göre format değişir)
- `pagination`: Sayfalama bilgileri
  - `totalResults`: Toplam kayıt sayısı
  - `totalPages`: Toplam sayfa sayısı
  - `currentPage`: Mevcut sayfa numarası
  - `perPage`: Sayfa başına kayıt sayısı

#### Hourly Mod Response (`period=hourly`)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message_key": "SUCCESS",
  "data": {
    "granularity": "hourly",
    "start_date": "2025-01-01",
    "end_date": "2025-01-03",
    "items": [
      {
        "datetime": "2025-01-01 10:00",
        "income": 5000.00,
        "expense": 0.00,
        "net": 5000.00
      },
      {
        "datetime": "2025-01-01 14:00",
        "income": 0.00,
        "expense": 2000.00,
        "net": -2000.00
      },
      {
        "datetime": "2025-01-02 18:00",
        "income": 3000.00,
        "expense": 1500.00,
        "net": 1500.00
      }
    ],
    "pagination": {
      "totalResults": 50,
      "totalPages": 3,
      "currentPage": 1,
      "perPage": 20
    }
  }
}
```

**Hourly Mod Response Alanları**:
- `items`: Saatlik veri array'i
  - `datetime`: Tam tarih+saat formatı (YYYY-MM-DD HH:00) - **Grafik kütüphaneleri için kullanılır**
  - `income`: O saatteki toplam gelir
  - `expense`: O saatteki toplam gider
  - `net`: Net bakiye (gelir - gider)
  - **Not**: Sadece veri olan saatler döndürülür (boş saatler döndürülmez)

#### Daily Mod Response (`period=daily`)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message_key": "SUCCESS",
  "data": {
    "granularity": "daily",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "items": [
      {
        "date": "2025-01-01",
        "income": 5000.00,
        "expense": 3000.00,
        "net": 2000.00
      },
      {
        "date": "2025-01-15",
        "income": 0.00,
        "expense": 150.50,
        "net": -150.50
      },
      {
        "date": "2025-01-20",
        "income": 10000.00,
        "expense": 5000.00,
        "net": 5000.00
      }
    ],
    "pagination": {
      "totalResults": 29,
      "totalPages": 2,
      "currentPage": 1,
      "perPage": 20
    }
  }
}
```

**Daily Mod Response Alanları**:
- `items`: Günlük veri array'i
  - `date`: Tarih (YYYY-MM-DD)
  - `income`: O gündeki toplam gelir
  - `expense`: O gündeki toplam gider
  - `net`: Net bakiye (gelir - gider)
  - **Not**: Sadece veri olan günler döndürülür (boş günler döndürülmez)

#### Weekly Mod Response (`period=weekly`)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message_key": "SUCCESS",
  "data": {
    "granularity": "weekly",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "items": [
      {
        "week": "2025-W01",
        "income": 35000.00,
        "expense": 21000.00,
        "net": 14000.00
      },
      {
        "week": "2025-W02",
        "income": 28000.00,
        "expense": 15000.00,
        "net": 13000.00
      },
      {
        "week": "2025-W03",
        "income": 42000.00,
        "expense": 25000.00,
        "net": 17000.00
      }
    ],
    "pagination": {
      "totalResults": 53,
      "totalPages": 3,
      "currentPage": 1,
      "perPage": 20
    }
  }
}
```

**Weekly Mod Response Alanları**:
- `items`: Haftalık veri array'i
  - `week`: Hafta formatı (YYYY-WW) - ISO 8601 standardı (Pazartesi başlangıç)
  - `income`: O haftadaki toplam gelir
  - `expense`: O haftadaki toplam gider
  - `net`: Net bakiye (gelir - gider)
  - **Not**: Sadece veri olan haftalar döndürülür (boş haftalar döndürülmez)

#### Monthly Mod Response (`period=monthly`)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message_key": "SUCCESS",
  "data": {
    "granularity": "monthly",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "items": [
      {
        "month": "2025-01",
        "income": 150000.00,
        "expense": 90000.00,
        "net": 60000.00
      },
      {
        "month": "2025-02",
        "income": 140000.00,
        "expense": 85000.00,
        "net": 55000.00
      },
      {
        "month": "2025-03",
        "income": 160000.00,
        "expense": 95000.00,
        "net": 65000.00
      }
    ],
    "pagination": {
      "totalResults": 12,
      "totalPages": 1,
      "currentPage": 1,
      "perPage": 20
    }
  }
}
```

**Monthly Mod Response Alanları**:
- `items`: Aylık veri array'i
  - `month`: Ay formatı (YYYY-MM)
  - `income`: O aydaki toplam gelir
  - `expense`: O aydaki toplam gider
  - `net`: Net bakiye (gelir - gider)
  - **Not**: Sadece veri olan aylar döndürülür (boş aylar döndürülmez)

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": {
    "message": "Rapor periyodu hourly, daily, weekly veya monthly olmalıdır",
    "messageKey": "VALIDATION_ERROR",
    "statusCode": 400
  }
}
```

---

## 🔍 Önemli Notlar

### Tarih Formatı
- Tüm tarihler **YYYY-MM-DD** formatında string olarak gönderilir
- Örnek: `2025-01-15` (15 Ocak 2025)
- Timezone sorunlarını önlemek için sadece tarih kısmı kullanılır

### Boş Veri Yönetimi
- **Trends API**: Veri olmayan saatler/günler/haftalar/aylar döndürülmez
  - Hourly mod: Sadece işlem olan saatler döndürülür
  - Daily mod: Sadece işlem olan günler döndürülür
  - Weekly mod: Sadece işlem olan haftalar döndürülür
  - Monthly mod: Sadece işlem olan aylar döndürülür
- **Summary API**: Veri yoksa tüm değerler `0` döner
- **Categories API**: Veri yoksa `items` boş array `[]` döner

### Validation Kuralları
1. `start_date <= end_date` (başlangıç tarihi bitiş tarihinden küçük veya eşit olmalı)
2. Tarih aralığı maksimum **1 yıl** olabilir
3. `period` değeri: `hourly`, `daily`, `weekly`, veya `monthly` olmalıdır
4. Tüm period'lar tarih aralığı kabul eder (artık sadece daily için aynı gün zorunluluğu yok)
5. Tüm zorunlu parametreler gönderilmelidir

### Error Handling
- **400 Bad Request**: Validation hatası (geçersiz parametreler)
- **401 Unauthorized**: Token geçersiz veya eksik
- **500 Internal Server Error**: Sunucu hatası

---

## 📊 Örnek Kullanım Senaryoları

### Senaryo 1: Finans Kartları (Summary API)
```
Kullanıcı: "Ocak 2025" seçer
Request: GET /api/analytics/reports/summary?start_date=2025-01-01&end_date=2025-01-31
Response: { total_income: 50000, total_expense: 30000, net_balance: 20000, savings_rate: 40 }
Kullanım: 4 kartta gösterilir
```

### Senaryo 2: Kategori Listesi (Categories API)
```
Kullanıcı: "Ocak 2025" + "Gider" seçer
Request: GET /api/analytics/reports/categories?start_date=2025-01-01&end_date=2025-01-31&type=expense
Response: { items: [...], pagination: {...} }
Kullanım: Kategori tab'ında listelenir, tutarlara göre sıralı
```

### Senaryo 3: Saatlik Trend (Trends API - Hourly)
```
Kullanıcı: "Saatlik" tab + "1-3 Ocak 2025" tarih aralığı seçer
Request: GET /api/analytics/reports/trends?start_date=2025-01-01&end_date=2025-01-03&period=hourly&page=1&results=20
Response: { granularity: "hourly", start_date: "2025-01-01", end_date: "2025-01-03", items: [{ datetime: "2025-01-01 10:00", ... }, ...], pagination: {...} }
Kullanım: Çizgi grafikte saatlik veri gösterilir (her saat bir nokta)
```

### Senaryo 4: Günlük Trend (Trends API - Daily)
```
Kullanıcı: "Günlük" tab + "Ocak 2025" seçer
Request: GET /api/analytics/reports/trends?start_date=2025-01-01&end_date=2025-01-31&period=daily&page=1&results=20
Response: { granularity: "daily", start_date: "2025-01-01", end_date: "2025-01-31", items: [{ date: "2025-01-01", ... }, ...], pagination: {...} }
Kullanım: Çizgi grafikte günlük veri gösterilir (her gün bir nokta)
```

### Senaryo 5: Haftalık Trend (Trends API - Weekly)
```
Kullanıcı: "Haftalık" tab + "2025 Yılı" seçer
Request: GET /api/analytics/reports/trends?start_date=2025-01-01&end_date=2025-12-31&period=weekly&page=1&results=20
Response: { granularity: "weekly", start_date: "2025-01-01", end_date: "2025-12-31", items: [{ week: "2025-W01", ... }, ...], pagination: {...} }
Kullanım: Çizgi grafikte haftalık veri gösterilir (her hafta bir nokta)
```

### Senaryo 6: Aylık Trend (Trends API - Monthly)
```
Kullanıcı: "Aylık" tab + "2025 Yılı" seçer
Request: GET /api/analytics/reports/trends?start_date=2025-01-01&end_date=2025-12-31&period=monthly&page=1&results=20
Response: { granularity: "monthly", start_date: "2025-01-01", end_date: "2025-12-31", items: [{ month: "2025-01", ... }, ...], pagination: {...} }
Kullanım: Çizgi grafikte aylık veri gösterilir (her ay bir nokta)
```

---

**Son Güncelleme**: 2025-01-20

## 🔄 Değişiklik Geçmişi

### 2025-01-20
- ✅ Trends API'ye `hourly` period eklendi
- ✅ Tüm period'lar artık tarih aralığı kabul ediyor (artık sadece daily için aynı gün zorunluluğu yok)
- ✅ Pagination desteği eklendi (tüm period'lar için)
- ✅ Response formatı güncellendi: `data_points` → `items`, `pagination` eklendi
- ✅ `weekly` ve `monthly` period'lar için detaylı açıklamalar eklendi

