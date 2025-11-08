# Hata Yönetimi ve Hata Kodları

Bu dokümantasyon, Spendly API'nin hata yönetimi sistemini, hata kodlarını ve hata formatlarını detaylı olarak açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Hata Formatı](#hata-formatı)
3. [HTTP Durum Kodları](#http-durum-kodları)
4. [Hata Kodları](#hata-kodları)
5. [Hata Yönetimi Akışı](#hata-yönetimi-akışı)
6. [Örnek Hatalar](#örnek-hatalar)

## 🎯 Genel Bakış

Spendly API, merkezi ve tutarlı bir hata yönetimi sistemi kullanır:

- ✅ Standart hata formatı
- ✅ Anlamlı hata mesajları
- ✅ Hata kodları (frontend için)
- ✅ Validation hataları için detaylı bilgi
- ✅ Otomatik loglama

## 📦 Hata Formatı

### Başarılı Yanıt

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Hata Yanıtı

```json
{
  "success": false,
  "error": {
    "message": "Hata mesajı",
    "messageKey": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2025-01-08T10:30:00.000Z",
    "path": "/api/categories"
  }
}
```

### Validation Hataları

```json
{
  "success": false,
  "error": {
    "message": "Validation hatası",
    "messageKey": "VALIDATION_ERROR",
    "statusCode": 400,
    "fields": {
      "email": [
        {
          "message": "Email geçerli bir email adresi olmalıdır",
          "value": "invalid-email",
          "location": "body"
        }
      ],
      "password": [
        {
          "message": "Şifre en az 6 karakter olmalıdır",
          "value": "123",
          "location": "body"
        }
      ]
    }
  }
}
```

## 🔢 HTTP Durum Kodları

| Kod | Açıklama | Kullanım |
|-----|----------|----------|
| 200 | OK | Başarılı GET, PUT, DELETE istekleri |
| 201 | Created | Başarılı POST istekleri (yeni kayıt oluşturma) |
| 400 | Bad Request | Validation hataları, geçersiz istek |
| 401 | Unauthorized | Kimlik doğrulama hatası, token geçersiz |
| 403 | Forbidden | Yetkilendirme hatası, yetki yok |
| 404 | Not Found | Kayıt bulunamadı |
| 409 | Conflict | Çakışma hatası (örneğin: email zaten mevcut) |
| 422 | Unprocessable Entity | İş mantığı hatası |
| 500 | Internal Server Error | Sunucu hatası |

## 🏷️ Hata Kodları

### Validation Errors (400)

| Kod | Açıklama |
|-----|----------|
| `VALIDATION_ERROR` | Genel doğrulama hatası |
| `INVALID_INPUT` | Geçersiz girdi |

### Authentication Errors (401)

| Kod | Açıklama |
|-----|----------|
| `UNAUTHORIZED` | Yetkisiz erişim |
| `AUTH_TOKEN_INVALID` | Token geçersiz |
| `AUTH_TOKEN_EXPIRED` | Token süresi dolmuş |
| `INVALID_CREDENTIALS` | Email veya şifre hatalı |
| `INVALID_REFRESH_TOKEN` | Geçersiz refresh token |

### Authorization Errors (403)

| Kod | Açıklama |
|-----|----------|
| `FORBIDDEN` | Yasak erişim |
| `INSUFFICIENT_PERMISSIONS` | Yetersiz yetki |

### Not Found Errors (404)

| Kod | Açıklama |
|-----|----------|
| `NOT_FOUND` | Genel bulunamadı hatası |
| `USER_NOT_FOUND` | Kullanıcı bulunamadı |
| `CATEGORY_NOT_FOUND` | Kategori bulunamadı |
| `TRANSACTION_NOT_FOUND` | İşlem bulunamadı |

### Conflict Errors (409)

| Kod | Açıklama |
|-----|----------|
| `CONFLICT` | Genel çakışma hatası |
| `EMAIL_ALREADY_EXISTS` | Email zaten mevcut |
| `CATEGORY_NAME_EXISTS` | Kategori adı zaten mevcut |

### Business Logic Errors (422)

| Kod | Açıklama |
|-----|----------|
| `CANNOT_DELETE_DEFAULT_CATEGORY` | Varsayılan kategori silinemez |
| `CANNOT_DELETE_CATEGORY_WITH_TRANSACTIONS` | Üzerinde işlem olan kategori silinemez |
| `INVALID_CATEGORY` | Geçersiz kategori (tip uyuşmazlığı) |
| `PASSWORD_MISMATCH` | Şifreler eşleşmiyor |

### Server Errors (500)

| Kod | Açıklama |
|-----|----------|
| `SERVER_ERROR` | Genel sunucu hatası |
| `DATABASE_ERROR` | Veritabanı hatası |
| `INTERNAL_ERROR` | İç hata |

## 🔄 Hata Yönetimi Akışı

### 1. Hata Oluşumu

```typescript
// Service'de hata fırlatma
if (!category) {
  throw new NotFoundException({
    message: 'Kategori bulunamadı',
    messageKey: 'CATEGORY_NOT_FOUND',
    error: 'NOT_FOUND'
  });
}
```

### 2. Exception Filter Yakalama

```typescript
// HttpExceptionFilter.catch()
catch(exception: unknown, host: ArgumentsHost) {
  // Hata tipini belirle
  // HTTP durum kodunu belirle
  // Hata mesajını çıkar
  // Standart formatta döndür
}
```

### 3. ErrorHandler İşleme

```typescript
// ErrorHandler.handleError()
static handleError(error, logger, context, defaultMessage) {
  // Prisma hatalarını işle
  // NestJS exception'larını işle
  // Diğer hataları genel server error olarak işle
}
```

### 4. Response

```json
{
  "success": false,
  "error": {
    "message": "Kategori bulunamadı",
    "messageKey": "CATEGORY_NOT_FOUND",
    "statusCode": 404
  }
}
```

## 📝 Örnek Hatalar

### 400 Bad Request - Validation Error

**Request**:
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "invalid-email",
  "password": "123",
  "confirmPassword": "456",
  "name": ""
}
```

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Validation hatası",
    "messageKey": "VALIDATION_ERROR",
    "statusCode": 400,
    "fields": {
      "email": [
        {
          "message": "Email geçerli bir email adresi olmalıdır",
          "value": "invalid-email",
          "location": "body"
        }
      ],
      "password": [
        {
          "message": "Şifre en az 6 karakter olmalıdır",
          "value": "123",
          "location": "body"
        }
      ],
      "confirmPassword": [
        {
          "message": "Şifreler eşleşmiyor",
          "value": "456",
          "location": "body"
        }
      ],
      "name": [
        {
          "message": "İsim boş olamaz",
          "value": "",
          "location": "body"
        }
      ]
    }
  }
}
```

### 401 Unauthorized - Invalid Credentials

**Request**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "wrong-password"
}
```

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Email veya şifre hatalı",
    "messageKey": "INVALID_CREDENTIALS",
    "statusCode": 401,
    "timestamp": "2025-01-08T10:30:00.000Z",
    "path": "/api/auth/login"
  }
}
```

### 404 Not Found - Category Not Found

**Request**:
```http
GET /api/categories/invalid-uuid
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Kategori bulunamadı",
    "messageKey": "CATEGORY_NOT_FOUND",
    "statusCode": 404,
    "timestamp": "2025-01-08T10:30:00.000Z",
    "path": "/api/categories/invalid-uuid"
  }
}
```

### 409 Conflict - Email Already Exists

**Request**:
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "existing@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Bu email adresi zaten kullanılıyor",
    "messageKey": "EMAIL_ALREADY_EXISTS",
    "statusCode": 409,
    "timestamp": "2025-01-08T10:30:00.000Z",
    "path": "/api/auth/register"
  }
}
```

### 403 Forbidden - Cannot Delete Default Category

**Request**:
```http
DELETE /api/categories/default-category-uuid
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Varsayılan kategoriler silinemez",
    "messageKey": "CANNOT_DELETE_DEFAULT_CATEGORY",
    "statusCode": 403,
    "timestamp": "2025-01-08T10:30:00.000Z",
    "path": "/api/categories/default-category-uuid"
  }
}
```

### 500 Internal Server Error

**Response**:
```json
{
  "success": false,
  "error": {
    "message": "Sunucu hatası oluştu",
    "messageKey": "SERVER_ERROR",
    "statusCode": 500,
    "timestamp": "2025-01-08T10:30:00.000Z",
    "path": "/api/categories"
  }
}
```

**Not**: Production'da detaylı hata mesajları gösterilmez (güvenlik için).

## 🛠️ Frontend'de Hata Yönetimi

### Hata Yakalama Örneği

```typescript
async function createCategory(data: CreateCategoryDto) {
  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!result.success) {
      // Hata yönetimi
      if (result.error.messageKey === 'CATEGORY_NAME_EXISTS') {
        // Kategori adı zaten mevcut
        showError('Bu isimde bir kategori zaten mevcut');
      } else if (result.error.statusCode === 401) {
        // Token geçersiz, yenile
        await refreshToken();
        return createCategory(data); // Retry
      } else {
        // Genel hata
        showError(result.error.message);
      }
      return null;
    }
    
    return result.data;
  } catch (error) {
    // Network hatası
    showError('Bağlantı hatası');
    return null;
  }
}
```

## 📊 Hata Loglama

Tüm hatalar otomatik olarak loglanır:

- **Development**: Konsola detaylı log
- **Production**: Sadece önemli hatalar loglanır
- **Stack Trace**: Server error'lar için stack trace loglanır

## ✅ Best Practices

1. ✅ Anlamlı hata mesajları kullanın
2. ✅ Hata kodlarını enum'dan kullanın
3. ✅ Validation hatalarında detaylı bilgi verin
4. ✅ Production'da hassas bilgileri göstermeyin
5. ✅ Hataları loglayın
6. ✅ Frontend'de hata kodlarına göre işlem yapın

---

**Dokümantasyon Tamamlandı!** Tüm dosyaları okudunuz. Artık projeyi tam olarak anlayabilir ve geliştirebilirsiniz.

