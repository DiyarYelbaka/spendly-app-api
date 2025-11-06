# Veritabanı Şeması

> Bu dosya, Prisma schema ve veritabanı yapısını detaylandırır.

## 🗄️ Database: PostgreSQL

**Neden PostgreSQL?**
- İlişkisel veriler için ideal
- ACID uyumlu (finansal veriler için önemli)
- Güçlü analitik sorgular
- Prisma ile mükemmel uyum

## 📊 Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ email       │
│ password    │
│ name        │
│ created_at  │
└──────┬──────┘
       │
       │ 1:N
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐   ┌──────────────┐
│  Category   │   │ Transaction  │
│─────────────│   │──────────────│
│ id (PK)     │   │ id (PK)      │
│ user_id (FK)│   │ user_id (FK)  │
│ name        │   │ category_id   │
│ type        │   │   (FK)        │
│ icon        │   │ amount        │
│ color       │   │ type          │
│ is_default  │   │ description   │
│ created_at  │   │ date          │
└─────────────┘   │ notes         │
                 │ created_at    │
                 └───────────────┘
```

## 📝 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MODEL
// ============================================
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String        // bcrypt hashed
  name         String
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  
  // Relations
  categories   Category[]
  transactions Transaction[]
  
  @@map("users")
}

// ============================================
// CATEGORY MODEL
// ============================================
model Category {
  id          String        @id @default(uuid())
  userId      String        @map("user_id")
  name        String
  type        String        // 'income' | 'expense'
  icon        String?       // Emoji veya string
  color       String?       // Hex color (#FF5733)
  description String?       @db.Text
  sortOrder   Int           @default(0) @map("sort_order")
  isActive    Boolean       @default(true) @map("is_active")
  isDefault   Boolean       @default(false) @map("is_default")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  
  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  
  @@index([userId])
  @@index([userId, type])
  @@map("categories")
}

// ============================================
// TRANSACTION MODEL
// ============================================
model Transaction {
  id          String        @id @default(uuid())
  userId      String        @map("user_id")
  categoryId  String        @map("category_id")
  amount      Decimal       @db.Decimal(10, 2)
  type        String        // 'income' | 'expense'
  description String        @db.VarChar(500)
  date        DateTime      @db.Date
  notes       String?       @db.Text
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")
  
  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category      @relation(fields: [categoryId], references: [id])
  
  @@index([userId])
  @@index([userId, date])
  @@index([userId, type])
  @@index([categoryId])
  @@map("transactions")
}
```

## 🔑 Field Açıklamaları

### User Model
- `id`: UUID, primary key
- `email`: Unique, email formatında
- `password`: bcrypt ile hash'lenmiş şifre
- `name`: Kullanıcı adı (2-100 karakter)

### Category Model
- `id`: UUID, primary key
- `userId`: Foreign key to User
- `name`: Kategori adı (2-20 karakter)
- `type`: 'income' veya 'expense'
- `icon`: Emoji veya string (opsiyonel)
- `color`: Hex color code (opsiyonel)
- `isDefault`: Sistem varsayılan kategorileri için true
- `isActive`: Soft delete için kullanılabilir

### Transaction Model
- `id`: UUID, primary key
- `userId`: Foreign key to User
- `categoryId`: Foreign key to Category
- `amount`: Decimal(10, 2) - Para miktarı
- `type`: 'income' veya 'expense'
- `description`: İşlem açıklaması (1-500 karakter)
- `date`: İşlem tarihi (Date only, time yok)
- `notes`: Ek notlar (opsiyonel, max 1000 karakter)

## 📊 Index'ler

Performans için şu index'ler tanımlanmıştır:

1. **Category:**
   - `userId` - Kullanıcının kategorilerini hızlı bulmak için
   - `userId + type` - Kullanıcının gelir/gider kategorilerini filtrelemek için

2. **Transaction:**
   - `userId` - Kullanıcının işlemlerini hızlı bulmak için
   - `userId + date` - Tarih bazlı sorgular için
   - `userId + type` - Gelir/gider filtreleme için
   - `categoryId` - Kategori bazlı sorgular için

## 🔄 Migration Stratejisi

1. **Initial Migration**: İlk şema oluşturma
   ```bash
   yarn prisma migrate dev --name init
   ```

2. **Schema Değişiklikleri**: Her değişiklikte yeni migration
   ```bash
   yarn prisma migrate dev --name add_field_name
   ```

3. **Production**: Migration'lar production'da çalıştırılmalı
   ```bash
   yarn prisma migrate deploy
   ```

## 🎯 Varsayılan Kategoriler

İlk kullanıcı kaydında veya sistem başlatıldığında, varsayılan kategoriler oluşturulabilir:

### Gelir Kategorileri
- Maaş 💰
- Freelance 💼
- Yatırım 📈
- Diğer ➕

### Gider Kategorileri
- Market 🛒
- Ulaşım 🚗
- Faturalar 💡
- Eğlence 🎮
- Sağlık 🏥
- Diğer ➖

Bu kategoriler `isDefault: true` ile oluşturulur ve silinemez.

## 🔐 Güvenlik Notları

1. **Password**: bcrypt ile hash'lenmeli (salt rounds: 10)
2. **User Isolation**: Her kullanıcı sadece kendi verilerine erişebilir
3. **Cascade Delete**: User silindiğinde, kategoriler ve işlemler de silinir
4. **Soft Delete**: Kategoriler için `isActive` field'ı kullanılabilir

## 📈 Performans Optimizasyonları

1. **Index'ler**: Sık kullanılan sorgular için index'ler tanımlanmış
2. **Pagination**: List endpoint'lerinde pagination zorunlu
3. **Select Optimization**: Sadece gerekli field'ları çek
4. **Query Optimization**: N+1 problem'ini önlemek için Prisma `include` kullan

## 🧪 Seed Data (Development)

Development için seed script:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Varsayılan kategoriler oluştur
  // Test kullanıcıları oluştur
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```json
// package.json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## 🔄 Schema Güncelleme Kuralları

1. Schema değişikliği yapıldığında:
   - `schema.prisma` dosyası güncellenir
   - Migration oluşturulur: `yarn prisma migrate dev`
   - Prisma Client yeniden generate edilir: `yarn prisma generate`
   - Bu dokümantasyon güncellenir

2. Breaking changes:
   - Migration'lar geri alınabilir olmalı
   - Production'da dikkatli uygulanmalı
   - Backup alınmalı

