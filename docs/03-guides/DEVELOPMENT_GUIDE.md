# Geliştirme Rehberi

> Bu dosya, projeyi geliştirirken takip edilmesi gereken kuralları ve best practice'leri içerir.

## 🚀 Proje Kurulumu

### Gereksinimler
- Node.js 18+ 
- PostgreSQL 15+
- yarn

### Adımlar

```bash
# 1. Projeyi klonla (eğer repo varsa)
git clone <repo-url>
cd spendly-app-api

# 2. Dependencies yükle
yarn install

# 3. Environment variables ayarla
cp .env.example .env
# .env dosyasını düzenle

# 4. PostgreSQL'i başlat (Docker ile)
docker run --name spendly-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=spendly \
  -p 5432:5432 \
  -d postgres:15

# 5. Database migration'ları çalıştır
yarn prisma migrate dev

# 6. Prisma Client generate et
yarn prisma generate

# 7. Uygulamayı başlat
yarn start:dev
```

## 📁 Proje Yapısı

```
src/
├── main.ts                 # Uygulama giriş noktası
├── app.module.ts          # Ana modül
├── auth/                   # Authentication modülü
├── categories/            # Kategori modülü
├── transactions/          # İşlem modülü
├── analytics/             # Analitik modülü
├── users/                 # Kullanıcı modülü
└── common/                # Ortak utilities
```

## 🎯 Yeni Modül Ekleme

### 1. Modül Klasörü Oluştur
```bash
mkdir src/module-name
cd src/module-name
```

### 2. Dosyaları Oluştur
```typescript
// module-name.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { ModuleNameController } from './module-name.controller';
import { ModuleNameService } from './module-name.service';

@Module({
  imports: [PrismaModule],
  controllers: [ModuleNameController],
  providers: [ModuleNameService],
  exports: [ModuleNameService],
})
export class ModuleNameModule {}
```

```typescript
// module-name.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ModuleNameService } from './module-name.service';

@Controller('module-name')
@UseGuards(JwtAuthGuard)
export class ModuleNameController {
  constructor(private readonly moduleNameService: ModuleNameService) {}

  @Get()
  findAll() {
    return this.moduleNameService.findAll();
  }
}
```

```typescript
// module-name.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ModuleNameService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.modelName.findMany();
  }
}
```

### 3. DTO'ları Oluştur
```typescript
// dto/create-module-name.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateModuleNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 4. Ana Modüle Ekle
```typescript
// app.module.ts
import { ModuleNameModule } from './module-name/module-name.module';

@Module({
  imports: [
    // ... diğer modüller
    ModuleNameModule,
  ],
})
export class AppModule {}
```

## 📝 Kod Standartları

### 1. Naming Conventions
- **Variables**: `camelCase`
- **Classes**: `PascalCase`
- **Files**: `kebab-case.ts`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `IPascalCase` veya `PascalCase`

### 2. TypeScript
```typescript
// ✅ İyi
interface User {
  id: string;
  email: string;
}

const user: User = { id: '1', email: 'test@test.com' };

// ❌ Kötü
const user: any = { id: '1', email: 'test@test.com' };
```

### 3. DTO Validation
```typescript
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### 4. Error Handling
```typescript
// Service'de
throw new NotFoundException('User not found');

// Controller'da otomatik handle edilir
```

### 5. Response Format
```typescript
// ✅ Tutarlı response
return {
  success: true,
  message_key: 'SUCCESS',
  data: result,
  message: 'İşlem başarılı'
};

// ❌ Farklı formatlar
return result; // Kötü
```

## 🔐 Authentication Kullanımı

### Guard Kullanımı
```typescript
@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  getData(@CurrentUser() user: User) {
    // user otomatik enjekte edilir
    return this.service.getData(user.id);
  }
}
```

### CurrentUser Decorator
```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

## 🗄️ Database İşlemleri

### Prisma Service
```typescript
// common/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

### Query Örnekleri
```typescript
// Basit query
const users = await this.prisma.user.findMany();

// İlişkili query
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  include: {
    categories: true,
    transactions: true,
  },
});

// Filtreleme
const transactions = await this.prisma.transaction.findMany({
  where: {
    userId: user.id,
    type: 'expense',
    date: {
      gte: startDate,
      lte: endDate,
    },
  },
  include: {
    category: true,
  },
});
```

## 🧪 Test Yazma

### Unit Test
```typescript
// module-name.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ModuleNameService } from './module-name.service';

describe('ModuleNameService', () => {
  let service: ModuleNameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModuleNameService],
    }).compile();

    service = module.get<ModuleNameService>(ModuleNameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

## 📊 API Dokümantasyonu (Swagger)

### Swagger Setup
```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Spendly API')
  .setDescription('Gelir-Gider Takip API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

### Endpoint Dokümantasyonu
```typescript
@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  @Get()
  @ApiOperation({ summary: 'Kategorileri listele' })
  @ApiResponse({ status: 200, description: 'Başarılı' })
  findAll() {
    return this.categoriesService.findAll();
  }
}
```

## 🔄 Git Workflow

### Branch Strategy
- `main`: Production branch
- `develop`: Development branch
- `feature/feature-name`: Feature branch'leri
- `fix/bug-name`: Bug fix branch'leri

### Commit Messages
```
feat: add category creation endpoint
fix: fix transaction date validation
docs: update API documentation
refactor: improve error handling
test: add unit tests for auth service
```

## 🐛 Debugging

### Logging
```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('ModuleName');

logger.log('Info message');
logger.error('Error message', error.stack);
logger.warn('Warning message');
logger.debug('Debug message');
```

### Environment Variables
```typescript
// .env
DATABASE_URL="postgresql://user:password@localhost:5432/spendly"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
```

## 📦 Deployment Checklist

- [ ] Environment variables ayarlandı
- [ ] Database migration'ları çalıştırıldı
- [ ] Prisma Client generate edildi
- [ ] Test'ler geçti
- [ ] API dokümantasyonu güncel
- [ ] Logging yapılandırıldı
- [ ] Error handling test edildi
- [ ] Security headers eklendi
- [ ] Rate limiting aktif
- [ ] CORS ayarları yapıldı

## 🆘 Sorun Giderme

### Database Connection Error
```bash
# PostgreSQL'in çalıştığını kontrol et
docker ps

# Connection string'i kontrol et
echo $DATABASE_URL
```

### Prisma Client Error
```bash
# Prisma Client'i yeniden generate et
yarn prisma generate
```

### Migration Error
```bash
# Migration'ları reset et (sadece development)
yarn prisma migrate reset
```

## 📚 Kaynaklar

- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

