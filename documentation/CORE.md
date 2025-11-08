# Core Modül - Detaylı Açıklamalar

Bu dokümantasyon, Spendly API'nin core modülündeki tüm bileşenleri detaylı olarak açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Utils (Yardımcı Fonksiyonlar)](#utils-yardımcı-fonksiyonlar)
3. [Filters (Exception Filter'ları)](#filters-exception-filterları)
4. [Interceptors (Response Interceptor'ları)](#interceptors-response-interceptorları)
5. [Middleware](#middleware)
6. [Decorators](#decorators)
7. [Exceptions](#exceptions)
8. [DTOs](#dtos)
9. [Prisma Service](#prisma-service)

## 🎯 Genel Bakış

**Core Module**, projedeki tüm modüller tarafından kullanılan ortak bileşenleri içerir. Bu modül:

- ✅ Kod tekrarını önler
- ✅ Tutarlılık sağlar
- ✅ Bakımı kolaylaştırır
- ✅ Test edilebilirliği artırır

**Dosya**: `src/core/index.ts` (Barrel export)

## 🛠️ Utils (Yardımcı Fonksiyonlar)

### ErrorHandler

**Dosya**: `src/core/utils/error-handler.util.ts`

**Amaç**: Prisma ve diğer hataları yakalayıp anlamlı exception'lara dönüştürür.

**Fonksiyonlar**:

#### `handleError()`

Hataları yönetir ve uygun exception fırlatır.

```typescript
ErrorHandler.handleError(
  error,
  logger,
  'create category',
  'Kategori oluşturulurken bir hata oluştu'
);
```

**İşlevi**:
1. NestJS exception'larını kontrol eder (direkt fırlatır)
2. Prisma hatalarını işler (koduna göre)
3. Diğer hataları genel server error olarak işler

**Prisma Hata Kodları**:
- `P2002`: Unique constraint violation
- `P2003`: Foreign key constraint violation
- `P2025`: Record not found
- `P2014`: Required relation violation

### Pagination Utils

**Dosya**: `src/core/utils/pagination.util.ts`

**Amaç**: Sayfalama işlemlerini kolaylaştırır.

**Fonksiyonlar**:

#### `parsePagination()`

Sayfalama parametrelerini işler.

```typescript
const { page, limit, skip } = parsePagination(query.page, query.limit);
// page: 1, limit: 20, skip: 0
```

**Parametreler**:
- `page`: Sayfa numarası (varsayılan: 1)
- `limit`: Sayfa başına kayıt (varsayılan: 20)

**Dönüş**:
- `page`: Sayfa numarası
- `limit`: Sayfa başına kayıt
- `skip`: Atlanacak kayıt sayısı

#### `createPaginationResult()`

Sayfalama sonuçlarını oluşturur.

```typescript
const pagination = createPaginationResult(total, page, limit);
// {
//   page: 1,
//   limit: 20,
//   total: 50,
//   totalPages: 3
// }
```

### Entity Mapper

**Dosya**: `src/core/utils/entity-mapper.util.ts`

**Amaç**: Veritabanı entity'lerini frontend formatına çevirir.

**Fonksiyonlar**:

#### `formatCategory()`

Kategori verilerini formatlar (camelCase → snake_case).

```typescript
const formatted = formatCategory(category);
// sortOrder → sort_order
```

#### `formatTransaction()`

İşlem verilerini formatlar.

## 🔍 Filters (Exception Filter'ları)

### HttpExceptionFilter

**Dosya**: `src/core/filters/http-exception.filter.ts`

**Amaç**: Tüm exception'ları yakalayıp standart formatta döndürür.

**Kullanım**: Global olarak tüm uygulamada aktif

**İşlevi**:
1. Exception tipini belirler
2. HTTP durum kodunu belirler
3. Hata mesajını çıkarır
4. Validation hatalarını özel formatta işler
5. Hataları loglar
6. Standart hata formatında döndürür

**Response Formatı**:
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

## 🔄 Interceptors (Response Interceptor'ları)

### TransformInterceptor

**Dosya**: `src/core/interceptors/transform.interceptor.ts`

**Amaç**: Tüm başarılı yanıtları standart formatta döndürür.

**Kullanım**: Global olarak tüm uygulamada aktif

**İşlevi**:
1. Başarılı yanıtları yakalar
2. Standart formata çevirir
3. `success: true` ekler
4. `data` içine sarar

**Response Formatı**:
```json
{
  "success": true,
  "data": {
    // Orijinal response
  }
}
```

## 🔐 Middleware

### JwtUserMiddleware

**Dosya**: `src/core/middleware/jwt-user.middleware.ts`

**Amaç**: Her HTTP isteğinde JWT token'ı kontrol eder ve kullanıcı bilgisini `request.user`'a ekler.

**Kullanım**: Global olarak tüm route'larda çalışır

**İşlevi**:
1. Authorization header'dan token alır
2. Token'ı doğrular
3. Token geçerliyse kullanıcı bilgisini `request.user`'a ekler
4. Token yoksa veya geçersizse hata fırlatmaz

## 🎨 Decorators

### @CurrentUser()

**Dosya**: `src/core/decorators/current-user.decorator.ts`

**Amaç**: Controller'da mevcut kullanıcı bilgisini almak için kullanılır.

**Kullanım**:
```typescript
@Get('me')
async getProfile(@CurrentUser() user: UserPayload) {
  return await this.authService.getProfile(user.id);
}
```

**Dönüş**: `UserPayload` tipinde kullanıcı bilgisi
- `id`: Kullanıcı ID'si
- `email`: Email adresi

## ⚠️ Exceptions

### BaseException

**Dosya**: `src/core/exceptions/base.exception.ts`

**Amaç**: Tüm custom exception'ların temel sınıfı.

### BusinessException

**Dosya**: `src/core/exceptions/business.exception.ts`

**Amaç**: İş mantığı hataları için.

### ValidationException

**Dosya**: `src/core/exceptions/validation.exception.ts`

**Amaç**: Validation hataları için.

### ErrorCodes

**Dosya**: `src/core/exceptions/error-codes.enum.ts`

**Amaç**: Hata kodlarını enum olarak tanımlar.

**Örnek Kodlar**:
- `EMAIL_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`
- `CATEGORY_NOT_FOUND`
- `TRANSACTION_NOT_FOUND`

## 📦 DTOs

### SuccessResponseDto

**Dosya**: `src/core/dto/success-response.dto.ts`

**Amaç**: Başarılı yanıt formatını tanımlar.

```typescript
{
  success: true,
  data: T
}
```

### PaginatedResponseDto

**Dosya**: `src/core/dto/paginated-response.dto.ts`

**Amaç**: Sayfalanmış yanıt formatını tanımlar.

```typescript
{
  success: true,
  data: {
    items: T[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

### PaginationQueryDto

**Dosya**: `src/core/dto/pagination-query.dto.ts`

**Amaç**: Sayfalama query parametrelerini tanımlar.

```typescript
{
  page?: number,
  limit?: number
}
```

## 🗄️ Prisma Service

### PrismaService

**Dosya**: `src/core/prisma/prisma.service.ts`

**Amaç**: Veritabanı bağlantısını yönetir.

**Özellikler**:
- Prisma Client'ı extend eder
- Lifecycle hook'ları ile bağlantıyı yönetir
- `onModuleInit`: Veritabanına bağlanır
- `onModuleDestroy`: Bağlantıyı kapatır

**Kullanım**:
```typescript
constructor(private prisma: PrismaService) {}

async findUser(id: string) {
  return await this.prisma.user.findUnique({
    where: { id }
  });
}
```

## 📝 Constants

### MessageKeys

**Dosya**: `src/core/constants/message-keys.constant.ts`

**Amaç**: Hata mesajı anahtarlarını tanımlar.

**Kullanım**: Frontend'de çoklu dil desteği için

## 🎯 Types

### UserPayload

**Dosya**: `src/core/types/user.types.ts`

**Amaç**: JWT token'dan çıkarılan kullanıcı bilgisi tipini tanımlar.

```typescript
interface UserPayload {
  id: string;
  email: string;
}
```

---

**Sonraki Adım**: [ERRORS.md](./ERRORS.md) dosyasını okuyarak hata yönetimini detaylı öğrenin.

