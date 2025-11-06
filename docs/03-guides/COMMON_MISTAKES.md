# ⚠️ Yaygın Hatalar ve Çözümleri

> ⚠️ **KRİTİK**: Bu dosya AI için çok önemlidir! Bu hataları yapma! Her hatanın açıklaması ve doğru kullanımı burada!

Frontend developer olarak backend yazarken yapılan yaygın hatalar.

## 1. ❌ any Type Kullanma

```typescript
// ❌ Kötü
@Post()
async create(@Body() body: any) {
  return this.service.create(body);
}

// ✅ İyi
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.service.create(dto);
}
```

**Neden:** Type safety kaybolur, hatalar runtime'da ortaya çıkar.

## 2. ❌ Validation Eksik

```typescript
// ❌ Kötü
export class RegisterDto {
  email: string;
  password: string;
}

// ✅ İyi
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

**Neden:** Invalid data database'e gidebilir, güvenlik riski.

## 3. ❌ Password'u Hash'lemeden Saklama

```typescript
// ❌ Kötü
const user = await this.prisma.user.create({
  data: {
    email: dto.email,
    password: dto.password, // Plain text!
  },
});

// ✅ İyi
const hashedPassword = await bcrypt.hash(dto.password, 10);
const user = await this.prisma.user.create({
  data: {
    email: dto.email,
    password: hashedPassword,
  },
});
```

**Neden:** Güvenlik açığı, password'lar açıkta kalır.

## 4. ❌ Error Handling Eksik

```typescript
// ❌ Kötü
async findUser(id: string) {
  return this.prisma.user.findUnique({ where: { id } });
}

// ✅ İyi
async findUser(id: string) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
}
```

**Neden:** Kullanıcı null döner, frontend'de hata olur.

## 5. ❌ Raw SQL Kullanma

```typescript
// ❌ Kötü
await this.prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;

// ✅ İyi
await this.prisma.user.findUnique({
  where: { email },
});
```

**Neden:** SQL injection riski, type safety yok.

## 6. ❌ Response Formatı Tutarsız

```typescript
// ❌ Kötü
@Get()
findAll() {
  return this.service.findAll(); // Direkt data döner
}

// ✅ İyi
@Get()
findAll() {
  return this.service.findAll(); // Interceptor formatlar
}
```

**Neden:** Frontend farklı formatlar bekler, hata olur.

## 7. ❌ Authentication Eksik

```typescript
// ❌ Kötü
@Get('profile')
getProfile() {
  return this.service.getProfile(); // Herkes erişebilir!
}

// ✅ İyi
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) {
  return this.service.getProfile(user.id);
}
```

**Neden:** Güvenlik açığı, herkes verilere erişebilir.

## 8. ❌ Logging Eksik

```typescript
// ❌ Kötü
async createUser(dto: CreateUserDto) {
  return this.prisma.user.create({ data: dto });
}

// ✅ İyi
async createUser(dto: CreateUserDto) {
  this.logger.log(`Creating user with email: ${dto.email}`);
  try {
    const user = await this.prisma.user.create({ data: dto });
    this.logger.log(`User created successfully: ${user.id}`);
    return user;
  } catch (error) {
    this.logger.error(`Failed to create user: ${error.message}`);
    throw error;
  }
}
```

**Neden:** Debugging zorlaşır, production'da sorun çözmek zor olur.

## 9. ❌ Database İlişkilerini Yanlış Kullanma

```typescript
// ❌ Kötü
const user = await this.prisma.user.findUnique({ where: { id } });
const categories = await this.prisma.category.findMany({ where: { userId: id } });
// N+1 problem!

// ✅ İyi
const user = await this.prisma.user.findUnique({
  where: { id },
  include: { categories: true },
});
```

**Neden:** Performans sorunu, çok fazla query.

## 10. ❌ Environment Variables Kullanmama

```typescript
// ❌ Kötü
const jwtSecret = 'my-secret-key'; // Hardcoded!

// ✅ İyi
const jwtSecret = process.env.JWT_SECRET;
```

**Neden:** Güvenlik riski, secret'lar kodda kalır.

## 🎯 Genel Kural

**Eğer emin değilsen:**
1. AI'ya sor
2. Dokümantasyona bak
3. Örnek kodlara bak
4. Test et

**Unutma:** Hata yapmak normal, önemli olan öğrenmek ve düzeltmek! 🚀

