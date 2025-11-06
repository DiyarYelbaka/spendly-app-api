# Mimari ve Proje Yapısı

## 🏗️ Mimari Kararlar

### Framework: NestJS

**Neden NestJS?**
- TypeScript-first yaklaşım (frontend ile uyumlu)
- Modüler yapı (her feature ayrı modül)
- Built-in dependency injection
- Otomatik API dokümantasyonu (Swagger)
- Enterprise-ready, ölçeklenebilir
- Express tabanlı (esnek)

### ORM: Prisma

**Neden Prisma?**
- TypeScript ile mükemmel entegrasyon
- Otomatik tip üretimi
- SQL bilgisi gerektirmez
- Migration yönetimi kolay
- Güçlü query API
- Type-safe database client

### Database: PostgreSQL

**Neden PostgreSQL?**
- İlişkisel veriler için ideal
- ACID uyumlu (finansal veriler için önemli)
- Güçlü analitik sorgular
- Production-ready
- Prisma ile mükemmel uyum

## ⚠️ KRİTİK: AI İÇİN MİMARİ KURALLAR

> **ÖNEMLİ**: Bu proje TAMAMEN AI ile yazılıyor. Aşağıdaki kurallara MUTLAKA uy!

### 🚫 YAPILMAMASI GEREKENLER

1. **❌ Bu mimari yapıya uymayan modül oluşturma!**
2. **❌ Standart dosya organizasyonunu değiştirme!**
3. **❌ Common modülündeki utility'leri tekrar yazma!**
4. **❌ Global filter ve interceptor'ları bypass etme!**
5. **❌ Frontend'in beklediği response formatı dışında response döndürme!**

### ✅ YAPILMASI GEREKENLER

1. **✅ Her modül için standart yapıyı kullan!**
2. **✅ Common modülündeki utility'leri kullan!**
3. **✅ Global filter ve interceptor'ları kullan!**
4. **✅ Frontend formatına uygun response döndür!**
5. **✅ Her yeni modül sonrası ARCHITECTURE.md'yi güncelle!**

## 📁 Detaylı Proje Yapısı

```
spendly-app-api/
├── src/
│   ├── main.ts                    # Uygulama giriş noktası
│   ├── app.module.ts              # Ana modül
│   │
│   ├── auth/                      # Authentication Modülü
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   │
│   ├── categories/                # Kategori Modülü
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   │
│   ├── transactions/               # İşlem Modülü
│   │   ├── transactions.module.ts
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   └── dto/
│   │       ├── create-transaction.dto.ts
│   │       └── update-transaction.dto.ts
│   │
│   ├── analytics/                 # Analitik Modülü
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   └── analytics.service.ts
│   │
│   ├── users/                     # Kullanıcı Modülü
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   └── users.service.ts
│   │
│   └── common/                    # Ortak Modüller
│       ├── decorators/
│       │   └── current-user.decorator.ts
│       ├── guards/
│       │   └── roles.guard.ts
│       ├── filters/
│       │   └── http-exception.filter.ts
│       ├── interceptors/
│       │   └── transform.interceptor.ts
│       └── pipes/
│           └── validation.pipe.ts
│
├── prisma/
│   ├── schema.prisma              # Database şeması
│   └── migrations/                # Migration dosyaları
│
├── test/                          # Test dosyaları
│   ├── unit/
│   └── e2e/
│
├── docs/                          # Dokümantasyon
│   └── ...
│
└── mobile-app/                    # Frontend (referans)
    └── ...
```

## 🔄 Modül Yapısı (NestJS Pattern)

Her modül şu yapıyı takip eder:

```
module-name/
├── module-name.module.ts          # Modül tanımı
├── module-name.controller.ts      # HTTP endpoint'leri
├── module-name.service.ts         # İş mantığı
└── dto/                           # Data Transfer Objects
    ├── create-module-name.dto.ts
    └── update-module-name.dto.ts
```

### Örnek: Categories Modülü

```typescript
// categories.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}

// categories.controller.ts
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query() query: FindCategoriesDto) {
    return this.categoriesService.findAll(query);
  }
}

// categories.service.ts
@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: FindCategoriesDto) {
    // İş mantığı
  }
}
```

## 🔐 Authentication Flow

1. Kullanıcı `/api/auth/register` veya `/api/auth/login` endpoint'ini çağırır
2. AuthService işlemi yapar ve JWT token üretir
3. Token response'da döner
4. Frontend token'ı saklar ve her request'te `Authorization: Bearer {token}` header'ı ile gönderir
5. `JwtAuthGuard` token'ı doğrular
6. `@CurrentUser()` decorator ile kullanıcı bilgisi controller'a enjekte edilir

## 📊 Database İlişkileri

```
User (1) ──< (N) Category
User (1) ──< (N) Transaction
Category (1) ──< (N) Transaction
```

Detaylı şema için `05_DATABASE_SCHEMA.md` dosyasına bakınız.

## 🎯 API Route Yapısı

```
/api/v1/
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /refresh
│   ├── POST   /logout
│   └── GET    /me
├── /categories
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /
│   ├── PUT    /:id
│   └── DELETE /:id
├── /transactions
│   ├── GET    /
│   ├── GET    /:id
│   ├── POST   /income
│   ├── POST   /expense
│   ├── PUT    /:id
│   └── DELETE /:id
└── /analytics
    ├── GET    /dashboard
    └── GET    /summary
```

## 🔒 Güvenlik

- **Authentication**: JWT Bearer Token
- **Password Hashing**: bcrypt (salt rounds: 10)
- **Validation**: class-validator (tüm DTO'larda)
- **Rate Limiting**: (gelecekte eklenecek)
- **CORS**: Frontend domain'ine izin verilecek

## 📝 Kod Standartları

- **Naming Convention**: camelCase (değişkenler), PascalCase (sınıflar)
- **File Naming**: kebab-case (dosya isimleri)
- **TypeScript**: Strict mode açık
- **ESLint**: NestJS recommended config
- **Prettier**: Code formatting

## 🧪 Test Stratejisi

- **Unit Tests**: Service ve utility fonksiyonları
- **Integration Tests**: API endpoint'leri
- **E2E Tests**: Kritik user flow'ları

## 📦 Dependency Yönetimi

- **Package Manager**: yarn
- **Lock File**: yarn.lock commit edilmeli
- **Version Control**: Semantic versioning

## 🚀 Deployment (Gelecek)

- **Environment**: Development, Staging, Production
- **Database**: PostgreSQL (managed service veya Docker)
- **API**: NestJS uygulaması (Node.js server)
- **CI/CD**: (gelecekte eklenecek)

