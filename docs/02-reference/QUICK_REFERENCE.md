# ⚡ Hızlı Referans - AI için

> Bu dosya, AI'ın sık sık ihtiyaç duyacağı bilgileri hızlıca bulması için hazırlanmıştır. Kod yazarken buraya bak!

## 📋 Response Formatları (Copy-Paste Ready)

### ✅ Başarılı Response
```typescript
// Service'den döndür
return {
  id: 1,
  name: "Category Name",
  // ... diğer alanlar
};

// TransformInterceptor otomatik olarak şu formata çevirir:
// {
//   success: true,
//   data: { id: 1, name: "Category Name" },
//   message: "İşlem başarılı",
//   message_key: "SUCCESS"
// }
```

### ❌ Hata Response (Exception Throw)
```typescript
// Validation hatası
throw new BadRequestException({
  message: 'Doğrulama hatası',
  messageKey: 'VALIDATION_ERROR',
  fields: {
    email: [{
      message: 'Email geçersiz',
      value: 'invalid-email',
      location: 'body'
    }]
  }
});

// Not found hatası
throw new NotFoundException({
  message: 'Kategori bulunamadı',
  messageKey: 'NOT_FOUND',
  error: 'NOT_FOUND'
});

// Unauthorized hatası
throw new UnauthorizedException({
  message: 'Yetkisiz erişim',
  messageKey: 'UNAUTHORIZED',
  error: 'UNAUTHORIZED'
});
```

## 🏗️ Modül Template (Copy-Paste Ready)

### Module File
```typescript
// src/module-name/module-name.module.ts
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

### Controller File
```typescript
// src/module-name/module-name.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ModuleNameService } from './module-name.service';
import { CreateModuleNameDto } from './dto/create-module-name.dto';
import { UpdateModuleNameDto } from './dto/update-module-name.dto';

@ApiTags('module-name')
@Controller('module-name')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ModuleNameController {
  constructor(private readonly moduleNameService: ModuleNameService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni kayıt oluştur' })
  @ApiResponse({ status: 201, description: 'Başarılı' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  create(@Body() dto: CreateModuleNameDto, @CurrentUser() user: any) {
    return this.moduleNameService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Tüm kayıtları listele' })
  findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.moduleNameService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tek kayıt getir' })
  @ApiResponse({ status: 404, description: 'Bulunamadı' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.moduleNameService.findOne(+id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kayıt güncelle' })
  update(@Param('id') id: string, @Body() dto: UpdateModuleNameDto, @CurrentUser() user: any) {
    return this.moduleNameService.update(+id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kayıt sil' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.moduleNameService.remove(+id, user.id);
  }
}
```

### Service File
```typescript
// src/module-name/module-name.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateModuleNameDto } from './dto/create-module-name.dto';
import { UpdateModuleNameDto } from './dto/update-module-name.dto';

@Injectable()
export class ModuleNameService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateModuleNameDto, userId: number) {
    return this.prisma.moduleName.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(query: any, userId: number) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.moduleName.findMany({
        where: { userId },
        skip,
        take: limit,
      }),
      this.prisma.moduleName.count({ where: { userId } }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(id: number, userId: number) {
    const item = await this.prisma.moduleName.findFirst({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException({
        message: 'Kayıt bulunamadı',
        messageKey: 'NOT_FOUND',
        error: 'NOT_FOUND',
      });
    }

    return item;
  }

  async update(id: number, dto: UpdateModuleNameDto, userId: number) {
    await this.findOne(id, userId); // Check if exists

    return this.prisma.moduleName.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId); // Check if exists

    return this.prisma.moduleName.delete({
      where: { id },
    });
  }
}
```

### DTO File (Create)
```typescript
// src/module-name/dto/create-module-name.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateModuleNameDto {
  @ApiProperty({ example: 'Category Name', description: 'Kategori adı' })
  @IsString()
  @IsNotEmpty({ message: 'Ad alanı zorunludur' })
  @MinLength(2, { message: 'Ad en az 2 karakter olmalıdır' })
  @MaxLength(50, { message: 'Ad en fazla 50 karakter olmalıdır' })
  name: string;

  @ApiProperty({ example: 'Description', description: 'Açıklama', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Açıklama en fazla 255 karakter olmalıdır' })
  description?: string;
}
```

### DTO File (Update)
```typescript
// src/module-name/dto/update-module-name.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateModuleNameDto } from './create-module-name.dto';

export class UpdateModuleNameDto extends PartialType(CreateModuleNameDto) {}
```

## 🗄️ Prisma Query Patterns

### Find Many (List) with Pagination
```typescript
const [items, total] = await Promise.all([
  this.prisma.modelName.findMany({
    where: { userId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  this.prisma.modelName.count({ where: { userId } }),
]);

return {
  items,
  pagination: { total, page, limit },
};
```

### Find One with Relations
```typescript
const item = await this.prisma.modelName.findFirst({
  where: { id, userId },
  include: {
    relationName: true,
  },
});
```

### Create with Relations
```typescript
const item = await this.prisma.modelName.create({
  data: {
    name: 'Name',
    userId,
    relationName: {
      connect: { id: relationId },
    },
  },
  include: {
    relationName: true,
  },
});
```

### Update
```typescript
const item = await this.prisma.modelName.update({
  where: { id },
  data: {
    name: 'Updated Name',
  },
});
```

### Delete
```typescript
await this.prisma.modelName.delete({
  where: { id },
});
```

## 🔐 Authentication Patterns

### Protected Endpoint
```typescript
@Controller('protected')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProtectedController {
  @Get()
  getData(@CurrentUser() user: any) {
    // user.id, user.email, user.name kullanılabilir
    return this.service.getData(user.id);
  }
}
```

## 📝 Error Codes Reference

| HTTP Status | Error Code | Message Key | Kullanım |
|------------|-----------|-------------|----------|
| 400 | BAD_REQUEST | VALIDATION_ERROR | Validation hataları |
| 401 | UNAUTHORIZED | UNAUTHORIZED | Yetkisiz erişim |
| 403 | FORBIDDEN | FORBIDDEN | Yetki yetersiz |
| 404 | NOT_FOUND | NOT_FOUND | Kayıt bulunamadı |
| 409 | CONFLICT | CONFLICT | Çakışma (örn: email zaten var) |
| 500 | INTERNAL_SERVER_ERROR | SERVER_ERROR | Sunucu hatası |

## ✅ Validation Decorators (Sık Kullanılanlar)

```typescript
@IsString()                    // String olmalı
@IsNotEmpty()                  // Boş olmamalı
@IsOptional()                   // Opsiyonel
@IsEmail()                     // Email formatı
@MinLength(6)                   // Min uzunluk
@MaxLength(50)                  // Max uzunluk
@IsNumber()                     // Number olmalı
@IsInt()                        // Integer olmalı
@IsPositive()                   // Pozitif sayı
@IsEnum(EnumType)               // Enum değeri
@IsDateString()                 // Date string
@IsBoolean()                    // Boolean
@IsArray()                      // Array
@ArrayMinSize(1)                // Array min eleman
```

## 🎯 Swagger Decorators

```typescript
@ApiTags('module-name')                    // Controller için
@ApiOperation({ summary: 'Açıklama' })     // Endpoint için
@ApiResponse({ status: 200, description: 'Başarılı' })
@ApiResponse({ status: 400, description: 'Hata' })
@ApiBearerAuth()                           // JWT için
@ApiProperty({ example: 'value' })         // DTO için
```

## 📦 Import Patterns

```typescript
// NestJS Core
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

// Swagger
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';

// Validation
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

// Common
import { PrismaService } from '../common/prisma.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
```

## 🚀 App Module'e Ekleme

```typescript
// src/app.module.ts
import { ModuleNameModule } from './module-name/module-name.module';

@Module({
  imports: [
    // ... diğer modüller
    ModuleNameModule,
  ],
})
export class AppModule {}
```

## ⚠️ ÖNEMLİ NOTLAR

1. **Her zaman `userId` kontrolü yap!** - Kullanıcı sadece kendi verilerine erişebilmeli
2. **Her zaman `@CurrentUser()` decorator'ını kullan!** - `request.user` yerine
3. **Her zaman DTO validation kullan!** - `@IsString()`, `@IsNotEmpty()` vb.
4. **Her zaman Swagger decorator'ları ekle!** - API dokümantasyonu için
5. **Her zaman error handling yap!** - `NotFoundException`, `BadRequestException` vb.
6. **Her zaman pagination ekle!** - List endpoint'leri için
7. **Her zaman `PROGRESS.md` ve `NEXT_STEPS.md` güncelle!** - İşlem sonrası

---

**Unutma**: Bu template'leri kullanırken proje spesifikasyonlarına uy! (API_SPECIFICATION.md, FRONTEND_ANALYSIS.md)

