# Frontend Developer için Backend Rehberi

> Bu rehber, frontend developer olarak backend projesini sağlam götürmek için pratik tavsiyeler içerir.

## 🎯 Genel Strateji

### 1. Dokümantasyonu Canlı Tut
- ✅ Her yeni endpoint eklediğinde `04_API_SPECIFICATION.md` güncelle
- ✅ Her modül eklediğinde `02_ARCHITECTURE.md` güncelle
- ✅ Önemli kararları `06_TECHNICAL_DECISIONS.md`'ye yaz
- ✅ Kod yorumları ekle (karmaşık iş mantığı için)

### 2. AI ile Çalışma Stratejisi
- ✅ Her yeni özellik eklemeden önce AI'ya plan sor
- ✅ Kod yazdıktan sonra AI'ya review yaptır
- ✅ Hata aldığında AI'ya göster, çözüm öner
- ✅ Best practice'leri AI'ya sor

### 3. Test Et, Test Et, Test Et
- ✅ Her endpoint'i Postman/Swagger'dan test et
- ✅ Frontend'den gerçek request at
- ✅ Edge case'leri düşün (null, empty, invalid data)
- ✅ Error durumlarını test et

## 📋 Checklist: Yeni Özellik Eklerken

### 1. Planlama
- [ ] Frontend'in ne beklediğini anla (`03_FRONTEND_ANALYSIS.md`)
- [ ] API spesifikasyonunu yaz (`04_API_SPECIFICATION.md`)
- [ ] Database şemasını kontrol et (`05_DATABASE_SCHEMA.md`)
- [ ] AI'ya plan sor, feedback al

### 2. Kod Yazma
- [ ] DTO oluştur (validation ile)
- [ ] Service'de business logic yaz
- [ ] Controller'da endpoint oluştur
- [ ] Swagger decorator'ları ekle
- [ ] Error handling ekle

### 3. Test
- [ ] Swagger'dan test et
- [ ] Postman'den test et
- [ ] Frontend'den test et
- [ ] Edge case'leri test et
- [ ] Error case'leri test et

### 4. Dokümantasyon
- [ ] API spesifikasyonunu güncelle
- [ ] Kod yorumları ekle
- [ ] Önemli kararları dokümante et

## 🔒 Güvenlik Checklist

Her yeni endpoint için:
- [ ] Authentication gerekli mi? (JWT Guard ekle)
- [ ] Input validation var mı? (DTO validation)
- [ ] SQL injection riski var mı? (Prisma kullan, raw SQL'den kaçın)
- [ ] XSS riski var mı? (Helmet zaten var)
- [ ] Rate limiting gerekli mi? (Gelecekte ekle)

## 🐛 Debugging Stratejisi

### 1. Hata Aldığında
```typescript
// 1. Terminal log'larına bak
// 2. Swagger'dan test et
// 3. Postman'den test et
// 4. Frontend console'a bak
// 5. Database'i kontrol et (Prisma Studio)
```

### 2. Yaygın Hatalar

**Database Connection Error:**
```bash
# PostgreSQL çalışıyor mu?
docker ps

# .env dosyası doğru mu?
cat .env
```

**Validation Error:**
```typescript
// DTO'da validation rule'ları kontrol et
// Frontend'in gönderdiği data formatını kontrol et
```

**401 Unauthorized:**
```typescript
// Token gönderiliyor mu?
// Token geçerli mi?
// JWT_SECRET doğru mu?
```

## 📚 Öğrenme Kaynakları

### NestJS
- [NestJS Docs](https://docs.nestjs.com/) - Resmi dokümantasyon
- [NestJS Best Practices](https://github.com/nestjs/awesome-nestjs) - Best practices
- YouTube: "NestJS Tutorial" - Video dersler

### Prisma
- [Prisma Docs](https://www.prisma.io/docs) - Resmi dokümantasyon
- [Prisma Examples](https://www.prisma.io/docs/getting-started) - Örnekler

### PostgreSQL
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/) - Temel SQL
- Prisma kullanıyorsun, SQL bilgisi çok gerekmez ama temel bilgi iyi olur

## 🎨 Kod Yazma Best Practices

### 1. DTO Kullan (Her Zaman)
```typescript
// ✅ İyi
@Post('register')
async register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}

// ❌ Kötü
@Post('register')
async register(@Body() body: any) {
  return this.authService.register(body);
}
```

### 2. Service'de Business Logic
```typescript
// ✅ Controller sadece HTTP handling
@Controller('users')
export class UsersController {
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}

// ✅ Service'de iş mantığı
@Injectable()
export class UsersService {
  async findAll() {
    // Business logic burada
    return this.prisma.user.findMany();
  }
}
```

### 3. Error Handling
```typescript
// ✅ Try-catch kullan
try {
  const user = await this.prisma.user.findUnique({...});
  if (!user) {
    throw new NotFoundException('User not found');
  }
  return user;
} catch (error) {
  // Global exception filter handle edecek
  throw error;
}
```

### 4. Logging
```typescript
// ✅ Önemli işlemleri logla
this.logger.log('User created successfully');
this.logger.error('Failed to create user', error.stack);
```

## 🔄 Git Workflow

### Commit Mesajları
```
feat: add user registration endpoint
fix: fix validation error in login
docs: update API documentation
refactor: improve error handling
test: add unit tests for auth service
```

### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/feature-name` - Yeni özellikler
- `fix/bug-name` - Bug fix'ler

## 🚨 Red Flags (Dikkat Et)

### 1. Raw SQL Kullanma
```typescript
// ❌ Kötü
await this.prisma.$queryRaw`SELECT * FROM users`;

// ✅ İyi
await this.prisma.user.findMany();
```

### 2. any Type Kullanma
```typescript
// ❌ Kötü
function process(data: any) { ... }

// ✅ İyi
function process(data: UserDto) { ... }
```

### 3. Password'u Plain Text Saklama
```typescript
// ❌ Kötü
password: userData.password

// ✅ İyi
password: await bcrypt.hash(userData.password, 10)
```

### 4. Error'u Kullanıcıya Gösterme
```typescript
// ❌ Kötü
throw new Error('Database connection failed');

// ✅ İyi
throw new InternalServerErrorException('Bir hata oluştu');
```

## 📊 Monitoring ve Debugging

### 1. Prisma Studio
```bash
# Database'i görsel olarak incele
yarn prisma studio
```

### 2. Swagger
```bash
# API'yi test et
http://localhost:3001/api/docs
```

### 3. Terminal Logs
- Her request loglanıyor
- Error'lar detaylı loglanıyor
- Database connection durumu loglanıyor

## 🎯 Production'a Hazırlık

### Checklist
- [ ] Environment variables production için ayarlandı
- [ ] Database migration'ları çalıştırıldı
- [ ] Error handling test edildi
- [ ] Security headers aktif (Helmet)
- [ ] CORS ayarları yapıldı
- [ ] Rate limiting eklendi (gelecekte)
- [ ] Logging yapılandırıldı
- [ ] API dokümantasyonu güncel

## 💡 Pro Tips

### 1. AI Kullan
- Kod yazmadan önce plan sor
- Kod yazdıktan sonra review yaptır
- Hata aldığında çözüm sor
- Best practice'leri sor

### 2. Dokümantasyonu Canlı Tut
- Her değişiklikte güncelle
- Kod yorumları ekle
- Önemli kararları yaz

### 3. Test Et
- Her endpoint'i test et
- Edge case'leri düşün
- Error durumlarını test et

### 4. Frontend ile İletişim
- Frontend'in ne beklediğini anla
- Response formatını kontrol et
- Error formatını kontrol et

### 5. Küçük Adımlarla İlerle
- Büyük özellikleri parçalara böl
- Her parçayı test et
- Dokümante et

## 🆘 Yardım İhtiyacın Olduğunda

1. **Dokümantasyona Bak**
   - `docs/` klasöründeki dosyalar
   - `PROFESSIONAL_REVIEW.md`

2. **AI'ya Sor**
   - Plan sor
   - Kod review yaptır
   - Hata çözümü sor

3. **NestJS Docs**
   - Resmi dokümantasyon
   - Örnekler

4. **Prisma Docs**
   - Query örnekleri
   - Schema örnekleri

## ✅ Sonuç

Frontend developer olarak backend yazmak zor değil, sadece:
- ✅ Dokümantasyonu canlı tut
- ✅ AI'dan yardım al
- ✅ Test et, test et, test et
- ✅ Küçük adımlarla ilerle
- ✅ Best practice'leri takip et

**Unutma:** Mükemmel olmak zorunda değilsin, ama sağlam ve çalışan kod yazmak zorundasın! 🚀

