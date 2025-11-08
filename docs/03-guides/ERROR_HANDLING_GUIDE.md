# 🛡️ Error Handling Guide

## Profesyonel Try-Catch Kullanımı

Projede iki farklı yaklaşım kullanılıyor:

### 1. ✅ Error Handler Utility (Önerilen)

**Ne zaman kullanılır:**
- Business logic içinde özel hata kontrolü gerektiğinde
- Try-catch bloğu içinde özel işlemler yapılması gerektiğinde

**Kullanım:**

```typescript
import { ErrorHandler } from '../common/utils/error-handler.util';

async create(dto: CreateCategoryDto, userId: string) {
  try {
    // Business logic
    const existing = await this.prisma.category.findFirst({...});
    
    if (existing) {
      throw new ConflictException({...});
    }

    const category = await this.prisma.category.create({...});
    return this.formatCategory(category);
  } catch (error) {
    // Tek satırda tüm hataları handle et!
    ErrorHandler.handleError(
      error,
      this.logger,
      'create category',
      'Kategori oluşturulurken bir hata oluştu'
    );
  }
}
```

**Avantajları:**
- ✅ Merkezi error handling
- ✅ Prisma error code'ları otomatik map ediliyor
- ✅ Logging otomatik
- ✅ Kod tekrarı yok

---

### 2. ✅ Method Decorator (En Pratik)

**Ne zaman kullanılır:**
- Basit CRUD işlemlerinde
- Try-catch bloğuna sadece error handling gerektiğinde
- Kod tekrarını minimuma indirmek istediğinde

**Kullanım:**

```typescript
import { CatchError } from '../common/decorators/catch-error.decorator';

@CatchError('Kategori oluşturulurken bir hata oluştu')
async create(dto: CreateCategoryDto, userId: string) {
  // Try-catch'e gerek yok! Decorator hallediyor
  
  const existing = await this.prisma.category.findFirst({...});
  
  if (existing) {
    throw new ConflictException({...}); // Bu direkt fırlatılır
  }

  const category = await this.prisma.category.create({...});
  return this.formatCategory(category);
}
```

**Avantajları:**
- ✅ Kod çok temiz
- ✅ Try-catch yazmaya gerek yok
- ✅ Otomatik error handling
- ✅ Decorator pattern (NestJS best practice)

---

## 🔄 Refactor Örneği

### ❌ Eski Yöntem (Manuel Try-Catch)

```typescript
async create(dto: CreateCategoryDto, userId: string) {
  try {
    const existing = await this.prisma.category.findFirst({...});
    
    if (existing) {
      throw new ConflictException({...});
    }

    const category = await this.prisma.category.create({...});
    return this.formatCategory(category);
  } catch (error) {
    if (error instanceof ConflictException || ...) {
      throw error;
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(`Prisma error: ${error.message}`, error.stack);
      if (error.code === 'P2002') {
        throw new ConflictException({...});
      }
      throw new InternalServerErrorException({...});
    }
    
    this.logger.error(`Unexpected error: ${error.message}`, error.stack);
    throw new InternalServerErrorException({...});
  }
}
```

**Sorunlar:**
- ❌ 30+ satır kod tekrarı
- ❌ Her metodda aynı kod
- ❌ Bakım zorluğu
- ❌ Hata yapma riski yüksek

---

### ✅ Yeni Yöntem 1: Utility Function

```typescript
import { ErrorHandler } from '../common/utils/error-handler.util';

async create(dto: CreateCategoryDto, userId: string) {
  try {
    const existing = await this.prisma.category.findFirst({...});
    
    if (existing) {
      throw new ConflictException({...});
    }

    const category = await this.prisma.category.create({...});
    return this.formatCategory(category);
  } catch (error) {
    ErrorHandler.handleError(
      error,
      this.logger,
      'create category',
      'Kategori oluşturulurken bir hata oluştu'
    );
  }
}
```

**Avantajlar:**
- ✅ 1 satır error handling
- ✅ Merkezi yönetim
- ✅ Prisma error code'ları otomatik

---

### ✅ Yeni Yöntem 2: Decorator (En Temiz)

```typescript
import { CatchError } from '../common/decorators/catch-error.decorator';

@CatchError('Kategori oluşturulurken bir hata oluştu')
async create(dto: CreateCategoryDto, userId: string) {
  const existing = await this.prisma.category.findFirst({...});
  
  if (existing) {
    throw new ConflictException({...});
  }

  const category = await this.prisma.category.create({...});
  return this.formatCategory(category);
}
```

**Avantajlar:**
- ✅ Try-catch yok
- ✅ Çok temiz kod
- ✅ Decorator pattern

---

## 📋 Prisma Error Code Mapping

ErrorHandler otomatik olarak şu Prisma hatalarını map ediyor:

| Prisma Code | HTTP Status | Error Code | Açıklama |
|------------|-------------|------------|----------|
| P2002 | 409 | CONFLICT | Unique constraint violation |
| P2003 | 400 | INVALID_INPUT | Foreign key constraint violation |
| P2025 | 404 | NOT_FOUND | Record not found |
| P2014 | 400 | INVALID_INPUT | Required relation violation |
| Other | 500 | DATABASE_ERROR | Diğer Prisma hataları |

---

## 🎯 Hangi Yöntemi Kullanmalıyım?

### Decorator Kullan (@CatchError):
- ✅ Basit CRUD işlemleri
- ✅ Tek bir database query
- ✅ Minimal business logic

### Utility Function Kullan (ErrorHandler.handleError):
- ✅ Karmaşık business logic
- ✅ Try-catch içinde özel işlemler
- ✅ Multiple database queries
- ✅ Transaction'lar

---

## 📝 Örnekler

### Decorator ile:

```typescript
@CatchError('Kategoriler getirilirken bir hata oluştu')
async findAll(userId: string, query: any) {
  const categories = await this.prisma.category.findMany({...});
  return categories;
}
```

### Utility ile:

```typescript
async createWithTransaction(dto: CreateDto, userId: string) {
  try {
    // Transaction içinde multiple operations
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({...});
      await tx.category.createMany({...});
      return user;
    });
    return result;
  } catch (error) {
    ErrorHandler.handleError(
      error,
      this.logger,
      'createWithTransaction',
      'İşlem sırasında bir hata oluştu'
    );
  }
}
```

---

## ⚠️ Önemli Notlar

1. **NestJS Exception'ları direkt fırlatılır:**
   - `ConflictException`, `NotFoundException` gibi exception'lar decorator/utility tarafından yakalanmaz, direkt fırlatılır

2. **Business Logic Exception'ları:**
   - Business logic içindeki exception'lar (örn: `if (existing) throw new ConflictException()`) direkt fırlatılır
   - Sadece beklenmeyen hatalar (Prisma, network, vs.) handle edilir

3. **Logging:**
   - Her hata otomatik loglanır (context ve stack trace ile)

4. **Error Messages:**
   - Türkçe, kullanıcı dostu mesajlar kullan
   - Teknik detaylar log'da, kullanıcıya basit mesaj

---

## 🚀 Migration Guide

Mevcut try-catch'leri refactor etmek için:

1. **Basit metodlar için:** Decorator ekle
2. **Karmaşık metodlar için:** Utility function kullan
3. **Test et:** Her refactor sonrası test et

**Örnek Migration:**

```typescript
// ÖNCE
async create(dto: CreateDto) {
  try {
    // ... kod
  } catch (error) {
    // 30 satır error handling
  }
}

// SONRA (Decorator)
@CatchError('Oluşturulurken hata oluştu')
async create(dto: CreateDto) {
  // ... kod (try-catch yok!)
}
```

