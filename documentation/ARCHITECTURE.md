# Proje Yapısı ve Mimari

Bu dokümantasyon, Spendly API projesinin mimari yapısını, klasör organizasyonunu ve bileşenlerin birbirleriyle nasıl etkileşim kurduğunu açıklar.

## 📁 Klasör Yapısı

```
spendly-app-api/
├── src/                          # Kaynak kodlar
│   ├── main.ts                  # Uygulama giriş noktası
│   ├── app.module.ts            # Ana modül
│   ├── app.controller.ts         # Ana controller
│   ├── app.service.ts           # Ana service
│   │
│   ├── auth/                    # Kimlik doğrulama modülü
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── guards/              # Guard'lar (koruyucular)
│   │   │   └── jwt-auth.guard.ts
│   │   └── strategies/          # Passport stratejileri
│   │       └── jwt.strategy.ts
│   │
│   ├── categories/              # Kategori modülü
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       ├── update-category.dto.ts
│   │       └── category-query.dto.ts
│   │
│   ├── transactions/            # İşlem modülü
│   │   ├── transactions.module.ts
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   └── dto/
│   │       ├── create-transaction.dto.ts
│   │       ├── update-transaction.dto.ts
│   │       └── transaction-query.dto.ts
│   │
│   ├── analytics/               # Analitik modülü
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   └── analytics.service.ts
│   │
│   ├── core/                   # Core modül (ortak bileşenler)
│   │   ├── index.ts            # Barrel export
│   │   ├── prisma/             # Prisma servisleri
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── utils/              # Yardımcı fonksiyonlar
│   │   │   ├── error-handler.util.ts
│   │   │   ├── pagination.util.ts
│   │   │   └── entity-mapper.util.ts
│   │   ├── filters/            # Exception filter'ları
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/       # Response interceptor'ları
│   │   │   └── transform.interceptor.ts
│   │   ├── middleware/          # HTTP middleware'leri
│   │   │   └── jwt-user.middleware.ts
│   │   ├── decorators/         # Custom decorator'lar
│   │   │   └── current-user.decorator.ts
│   │   ├── dto/                # Ortak DTO'lar
│   │   │   ├── success-response.dto.ts
│   │   │   ├── paginated-response.dto.ts
│   │   │   └── pagination-query.dto.ts
│   │   ├── exceptions/         # Custom exception'lar
│   │   │   ├── base.exception.ts
│   │   │   ├── business.exception.ts
│   │   │   ├── validation.exception.ts
│   │   │   └── error-codes.enum.ts
│   │   ├── constants/          # Sabit değerler
│   │   │   └── message-keys.constant.ts
│   │   └── types/              # TypeScript tip tanımları
│   │       └── user.types.ts
│   │
│   └── config/                 # Yapılandırma dosyaları
│       ├── app.config.ts
│       ├── database.config.ts
│       └── jwt.config.ts
│
├── prisma/                      # Prisma dosyaları
│   ├── schema.prisma           # Veritabanı şeması
│   └── migrations/             # Migration dosyaları
│
├── dist/                       # Derlenmiş JavaScript dosyaları
├── documentation/              # Dokümantasyon
├── package.json                # Proje bağımlılıkları
├── tsconfig.json              # TypeScript yapılandırması
└── nest-cli.json              # NestJS CLI yapılandırması
```

## 🏗️ Mimari Katmanlar

### 1. Presentation Layer (Sunum Katmanı)

**Controller'lar** - HTTP isteklerini karşılar

- **Görevleri**:
  - HTTP isteklerini alır (GET, POST, PUT, DELETE)
  - Request body'den gelen verileri DTO'lara dönüştürür
  - Validation pipe ile veri doğrulaması yapar
  - Service katmanına iş mantığını yönlendirir
  - Service'den gelen sonucu HTTP yanıtı olarak döndürür

- **Örnek**: `CategoriesController`
  ```typescript
  @Controller('categories')
  export class CategoriesController {
    @Post()
    async create(@Body() dto: CreateCategoryDto) {
      return await this.categoriesService.create(dto);
    }
  }
  ```

### 2. Business Logic Layer (İş Mantığı Katmanı)

**Service'ler** - İş mantığını içerir

- **Görevleri**:
  - İş kurallarını uygular (örneğin: aynı isimde kategori olamaz)
  - Veritabanı işlemlerini yapar (Prisma üzerinden)
  - Veri doğrulamaları yapar
  - Hata yönetimi yapar
  - Verileri formatlar ve döndürür

- **Örnek**: `CategoriesService`
  ```typescript
  @Injectable()
  export class CategoriesService {
    async create(dto: CreateCategoryDto, userId: string) {
      // İş mantığı: Aynı isimde kategori var mı?
      const existing = await this.prisma.category.findFirst({...});
      if (existing) throw new ConflictException(...);
      
      // Veritabanına kaydet
      return await this.prisma.category.create({...});
    }
  }
  ```

### 3. Data Access Layer (Veri Erişim Katmanı)

**Prisma Service** - Veritabanı işlemlerini yapar

- **Görevleri**:
  - Veritabanı bağlantısını yönetir
  - CRUD işlemlerini yapar
  - İlişkili verileri getirir
  - Transaction'ları yönetir

- **Örnek**: `PrismaService`
  ```typescript
  @Injectable()
  export class PrismaService extends PrismaClient {
    async onModuleInit() {
      await this.$connect();
    }
  }
  ```

## 🔄 İstek Akışı (Request Flow)

### Basit Bir İstek Akışı

```
1. Client (Frontend)
   ↓ HTTP Request (POST /api/categories)
   
2. NestJS Middleware
   ↓ JwtUserMiddleware (JWT token'dan kullanıcı bilgisini çıkarır)
   
3. Guard (Koruyucu)
   ↓ JwtAuthGuard (Token geçerli mi kontrol eder)
   
4. Controller
   ↓ CategoriesController.create()
   - Request body'yi DTO'ya dönüştürür
   - Validation pipe ile doğrular
   
5. Service
   ↓ CategoriesService.create()
   - İş kurallarını uygular
   - Veritabanı işlemlerini yapar
   
6. Prisma
   ↓ PrismaService
   - SQL sorgusu çalıştırır
   - Sonucu döndürür
   
7. Service → Controller
   ↓ Formatlanmış veri
   
8. Interceptor
   ↓ TransformInterceptor
   - Standart response formatına çevirir
   
9. Response
   ↓ HTTP Response (200 OK)
   
10. Client (Frontend)
    ↓ JSON Response
```

### Hata Durumunda Akış

```
1. Service'de hata oluşur
   ↓ throw new NotFoundException(...)
   
2. Exception Filter
   ↓ HttpExceptionFilter.catch()
   - Hata tipini belirler
   - HTTP durum kodunu belirler
   - Hata mesajını formatlar
   - Loglar
   
3. Response
   ↓ HTTP Error Response (404 Not Found)
   {
     "success": false,
     "error": {
       "message": "Kategori bulunamadı",
       "messageKey": "CATEGORY_NOT_FOUND",
       "statusCode": 404
     }
   }
```

## 🧩 Modül Yapısı

### Modül Bileşenleri

Her modül şu bileşenleri içerir:

1. **Module** (`*.module.ts`)
   - Modül yapılandırması
   - Import'lar (bağımlılıklar)
   - Export'lar (dışarıya açılan bileşenler)
   - Provider'lar (service'ler, guard'lar, vb.)

2. **Controller** (`*.controller.ts`)
   - HTTP endpoint'leri
   - Route tanımları
   - Request/Response işlemleri

3. **Service** (`*.service.ts`)
   - İş mantığı
   - Veritabanı işlemleri
   - Hata yönetimi

4. **DTO'lar** (`dto/*.dto.ts`)
   - Veri transfer nesneleri
   - Validation kuralları
   - Type safety

### Modül Bağımlılıkları

```
AppModule
├── ConfigModule (Global)
├── PrismaModule (Global)
├── JwtModule (Global)
├── AuthModule
│   └── PrismaModule (import)
├── CategoriesModule
│   ├── PrismaModule (import)
│   └── Core (import)
├── TransactionsModule
│   ├── PrismaModule (import)
│   └── Core (import)
└── AnalyticsModule
    ├── PrismaModule (import)
    └── Core (import)
```

## 🔌 Dependency Injection (Bağımlılık Enjeksiyonu)

NestJS, dependency injection (DI) pattern'ini kullanır. Bu sayede:

- Bileşenler birbirine gevşek bağlıdır (loose coupling)
- Test edilebilirlik artar
- Kod tekrarı azalır

### Örnek

```typescript
// Service'i Controller'a enjekte etme
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService
  ) {}
  
  // categoriesService otomatik olarak enjekte edilir
}
```

## 🛡️ Güvenlik Katmanları

### 1. Middleware (Ara Katman)

**JwtUserMiddleware** - Her istekte çalışır
- JWT token'ı kontrol eder
- Token geçerliyse kullanıcı bilgisini `request.user`'a ekler
- Token yoksa hata fırlatmaz (sadece `request.user` undefined olur)

### 2. Guard (Koruyucu)

**JwtAuthGuard** - Belirli endpoint'lerde çalışır
- Token'ın varlığını kontrol eder
- Token geçersizse 401 Unauthorized döndürür
- Token geçerliyse isteği devam ettirir

### 3. Validation Pipe

**Global ValidationPipe** - Her istekte çalışır
- Request body'yi DTO'ya dönüştürür
- Validation kurallarını kontrol eder
- Geçersiz veri varsa 400 Bad Request döndürür

## 📊 Veri Akışı

### Request → Response Dönüşümü

```
Raw HTTP Request
  ↓
DTO (Data Transfer Object)
  ↓
Service (Business Logic)
  ↓
Prisma Entity
  ↓
Formatted Response
  ↓
HTTP Response
```

### Örnek: Kategori Oluşturma

```
1. Request Body (JSON)
{
  "name": "Yemek",
  "type": "expense",
  "icon": "🍔",
  "color": "#FF5733"
}

2. DTO (CreateCategoryDto)
{
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
}

3. Prisma Entity
{
  id: "uuid",
  name: "Yemek",
  type: "expense",
  icon: "🍔",
  color: "#FF5733",
  userId: "user-uuid",
  createdAt: Date,
  ...
}

4. Formatted Response
{
  success: true,
  data: {
    id: "uuid",
    name: "Yemek",
    type: "expense",
    icon: "🍔",
    color: "#FF5733",
    created_at: "2025-01-08T..."
  }
}
```

## 🔄 Lifecycle Hooks

NestJS modülleri ve bileşenleri için lifecycle hook'ları:

1. **onModuleInit**: Modül başlatıldığında
2. **onApplicationBootstrap**: Uygulama bootstrap edildiğinde
3. **onModuleDestroy**: Modül yok edildiğinde
4. **onApplicationShutdown**: Uygulama kapatıldığında

### Örnek: PrismaService

```typescript
@Injectable()
export class PrismaService extends PrismaClient {
  async onModuleInit() {
    await this.$connect(); // Veritabanına bağlan
  }
  
  async onModuleDestroy() {
    await this.$disconnect(); // Bağlantıyı kapat
  }
}
```

## 📝 Best Practices

### 1. Modüler Yapı
- Her feature kendi modülünde
- Ortak bileşenler core modülünde
- Modüller arası bağımlılık minimum

### 2. Separation of Concerns
- Controller: HTTP işlemleri
- Service: İş mantığı
- Prisma: Veritabanı işlemleri

### 3. Error Handling
- Merkezi hata yönetimi (ErrorHandler)
- Standart hata formatı
- Anlamlı hata mesajları

### 4. Type Safety
- TypeScript kullanımı
- DTO'lar ile tip güvenliği
- Prisma ile veritabanı tip güvenliği

### 5. Code Reusability
- Utility fonksiyonlar (core/utils)
- Ortak DTO'lar (core/dto)
- Ortak exception'lar (core/exceptions)

## 🎯 Sonuç

Bu mimari yapı:
- ✅ Modüler ve ölçeklenebilir
- ✅ Test edilebilir
- ✅ Bakımı kolay
- ✅ Tip güvenli
- ✅ Standart ve tutarlı

---

**Sonraki Adım**: [MODULES.md](./MODULES.md) dosyasını okuyarak her modülün detaylarını öğrenin.

