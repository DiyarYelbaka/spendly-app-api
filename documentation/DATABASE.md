# Veritabanı Şeması ve Modeller

Bu dokümantasyon, Spendly API'nin veritabanı yapısını, modelleri ve ilişkileri detaylı olarak açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Modeller](#modeller)
3. [İlişkiler](#ilişkiler)
4. [Index'ler](#indexler)
5. [Migration'lar](#migrations)

## 🗄️ Genel Bakış

**Veritabanı**: PostgreSQL  
**ORM**: Prisma  
**Schema Dosyası**: `prisma/schema.prisma`

### Tablolar

1. **users** - Kullanıcılar
2. **categories** - Kategoriler
3. **transactions** - İşlemler

## 👤 User Model

### Tablo: `users`

Kullanıcı bilgilerini saklar.

### Alanlar

| Alan | Tip | Açıklama | Kısıtlamalar |
|------|-----|----------|--------------|
| `id` | String (UUID) | Benzersiz kullanıcı ID'si | Primary Key, Default: uuid() |
| `email` | String | Email adresi | Unique, Not Null |
| `password` | String | Hash'lenmiş şifre | Not Null |
| `name` | String | Kullanıcı adı | Not Null |
| `created_at` | DateTime | Oluşturulma tarihi | Default: now() |
| `updated_at` | DateTime | Güncellenme tarihi | Auto-update |

### Prisma Schema

```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String
  name         String
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  categories   Category[]
  transactions Transaction[]

  @@map("users")
}
```

### İlişkiler

- **One-to-Many** → `Category` (Bir kullanıcının birden fazla kategorisi olabilir)
- **One-to-Many** → `Transaction` (Bir kullanıcının birden fazla işlemi olabilir)

### Örnek Veri

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "password": "$2b$10$hashedpassword...",
  "name": "John Doe",
  "created_at": "2025-01-08T10:30:00.000Z",
  "updated_at": "2025-01-08T10:30:00.000Z"
}
```

## 📁 Category Model

### Tablo: `categories`

Kategori bilgilerini saklar (gelir ve gider kategorileri).

### Alanlar

| Alan | Tip | Açıklama | Kısıtlamalar |
|------|-----|----------|--------------|
| `id` | String (UUID) | Benzersiz kategori ID'si | Primary Key |
| `user_id` | String (UUID) | Kullanıcı ID'si | Foreign Key → users.id, Cascade Delete |
| `name` | String | Kategori adı | Not Null |
| `type` | String | Kategori tipi | Not Null, "income" veya "expense" |
| `icon` | String? | Kategori ikonu (emoji) | Optional |
| `color` | String? | Kategori rengi (hex) | Optional |
| `description` | String? | Kategori açıklaması | Optional |
| `sort_order` | Int | Sıralama sırası | Default: 0 |
| `is_active` | Boolean | Aktif mi? | Default: true |
| `is_default` | Boolean | Varsayılan kategori mi? | Default: false |
| `created_at` | DateTime | Oluşturulma tarihi | Default: now() |
| `updated_at` | DateTime | Güncellenme tarihi | Auto-update |

### Prisma Schema

```prisma
model Category {
  id           String        @id @default(uuid())
  userId       String        @map("user_id")
  name         String
  type         String
  icon         String?
  color        String?
  description  String?
  sortOrder    Int           @default(0) @map("sort_order")
  isActive     Boolean       @default(true) @map("is_active")
  isDefault    Boolean       @default(false) @map("is_default")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@index([userId, type])
  @@map("categories")
}
```

### İlişkiler

- **Many-to-One** → `User` (Bir kategori bir kullanıcıya aittir)
- **One-to-Many** → `Transaction` (Bir kategorinin birden fazla işlemi olabilir)

### Index'ler

- `userId` - Kullanıcıya göre hızlı arama
- `[userId, type]` - Kullanıcı ve tip kombinasyonuna göre hızlı arama

### Örnek Veri

```json
{
  "id": "category-uuid",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Yemek",
  "type": "expense",
  "icon": "🍔",
  "color": "#FF5733",
  "description": "Yemek ve içecek giderleri",
  "sort_order": 1,
  "is_active": true,
  "is_default": true,
  "created_at": "2025-01-08T10:30:00.000Z",
  "updated_at": "2025-01-08T10:30:00.000Z"
}
```

## 💰 Transaction Model

### Tablo: `transactions`

İşlem bilgilerini saklar (gelir ve gider işlemleri).

### Alanlar

| Alan | Tip | Açıklama | Kısıtlamalar |
|------|-----|----------|--------------|
| `id` | String (UUID) | Benzersiz işlem ID'si | Primary Key |
| `user_id` | String (UUID) | Kullanıcı ID'si | Foreign Key → users.id, Cascade Delete |
| `category_id` | String (UUID) | Kategori ID'si | Foreign Key → categories.id |
| `amount` | Decimal(10,2) | İşlem tutarı | Not Null, Min: 0.01 |
| `type` | String | İşlem tipi | Not Null, "income" veya "expense" |
| `description` | String (VarChar 500) | İşlem açıklaması | Not Null, Max: 500 karakter |
| `date` | Date | İşlem tarihi | Not Null |
| `notes` | String? | İşlem notları | Optional, Max: 1000 karakter |
| `created_at` | DateTime | Oluşturulma tarihi | Default: now() |
| `updated_at` | DateTime | Güncellenme tarihi | Auto-update |

### Prisma Schema

```prisma
model Transaction {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  categoryId  String   @map("category_id")
  amount      Decimal  @db.Decimal(10, 2)
  type        String
  description String   @db.VarChar(500)
  date        DateTime @db.Date
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  category    Category @relation(fields: [categoryId], references: [id])
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, date])
  @@index([userId, type])
  @@index([categoryId])
  @@map("transactions")
}
```

### İlişkiler

- **Many-to-One** → `User` (Bir işlem bir kullanıcıya aittir)
- **Many-to-One** → `Category` (Bir işlem bir kategoriye aittir)

### Index'ler

- `userId` - Kullanıcıya göre hızlı arama
- `[userId, date]` - Kullanıcı ve tarih kombinasyonuna göre hızlı arama
- `[userId, type]` - Kullanıcı ve tip kombinasyonuna göre hızlı arama
- `categoryId` - Kategoriye göre hızlı arama

### Örnek Veri

```json
{
  "id": "transaction-uuid",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "category_id": "category-uuid",
  "amount": 150.50,
  "type": "expense",
  "description": "Market alışverişi",
  "date": "2025-01-05",
  "notes": "Haftalık alışveriş",
  "created_at": "2025-01-05T10:30:00.000Z",
  "updated_at": "2025-01-05T10:30:00.000Z"
}
```

## 🔗 İlişkiler Diyagramı

```
User (1) ────────< (Many) Category
  │
  │ (1)
  │
  └───────< (Many) Transaction
            │
            │ (Many)
            │
            └───────> (1) Category
```

### İlişki Detayları

1. **User → Category** (One-to-Many)
   - Bir kullanıcının birden fazla kategorisi olabilir
   - Kullanıcı silinirse kategorileri de silinir (Cascade Delete)

2. **User → Transaction** (One-to-Many)
   - Bir kullanıcının birden fazla işlemi olabilir
   - Kullanıcı silinirse işlemleri de silinir (Cascade Delete)

3. **Category → Transaction** (One-to-Many)
   - Bir kategorinin birden fazla işlemi olabilir
   - Kategori silinirse işlemler silinmez (referential integrity korunur)

## 📊 Index Stratejisi

Index'ler, sorgu performansını artırmak için kullanılır:

1. **userId Index**: Kullanıcıya ait verileri hızlı getirmek için
2. **Composite Index'ler**: Karmaşık sorgular için (userId + type, userId + date)
3. **categoryId Index**: Kategoriye göre işlemleri hızlı getirmek için

## 🔄 Migration'lar

### Migration Oluşturma

```bash
yarn prisma migrate dev --name <migration-name>
```

### Migration Uygulama

```bash
# Development
yarn prisma migrate dev

# Production
yarn prisma migrate deploy
```

### Migration Durumu

```bash
yarn prisma migrate status
```

## 🛠️ Prisma Client

### Generate

```bash
yarn prisma generate
```

Bu komut, TypeScript tip tanımlarını oluşturur.

### Kullanım Örneği

```typescript
// PrismaService kullanımı
const user = await this.prisma.user.findUnique({
  where: { id: userId },
  include: {
    categories: true,
    transactions: true
  }
});
```

## 📝 Notlar

1. **Cascade Delete**: User silinirse, kategorileri ve işlemleri de silinir
2. **Decimal Tipi**: Para miktarları için `Decimal(10,2)` kullanılır (hassasiyet için)
3. **Soft Delete**: Kategoriler için `is_active` alanı ile soft delete yapılır
4. **Hard Delete**: İşlemler için hard delete yapılır (tamamen silinir)
5. **UUID**: Tüm ID'ler UUID formatındadır (güvenlik ve dağıtık sistemler için)

---

**Sonraki Adım**: [AUTHENTICATION.md](./AUTHENTICATION.md) dosyasını okuyarak kimlik doğrulama sistemini öğrenin.

