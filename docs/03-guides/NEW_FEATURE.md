# ✅ Yeni Özellik Ekleme Checklist

> ⚠️ **KRİTİK**: AI için zorunlu checklist! Yeni bir özellik eklerken MUTLAKA bu checklist'i takip et! Hiçbir adımı atlama!

Bu checklist'i her yeni özellik eklerken kullan.

## 📋 Planlama

- [ ] Frontend'in ne beklediğini anladım (`docs/03_FRONTEND_ANALYSIS.md`)
- [ ] API spesifikasyonunu yazdım (`docs/04_API_SPECIFICATION.md`)
- [ ] Database şemasını kontrol ettim (`docs/05_DATABASE_SCHEMA.md`)
- [ ] AI'ya plan sordum, feedback aldım

## 💻 Kod Yazma

### DTO
- [ ] DTO oluşturdum (`dto/create-*.dto.ts`)
- [ ] Validation rules ekledim (`@IsEmail()`, `@MinLength()`, vb.)
- [ ] Swagger decorator'ları ekledim (`@ApiProperty()`)

### Service
- [ ] Service method'u yazdım
- [ ] Business logic'i ekledim
- [ ] Error handling ekledim (`throw new NotFoundException()`)
- [ ] Logging ekledim (`this.logger.log()`)

### Controller
- [ ] Endpoint oluşturdum (`@Get()`, `@Post()`, vb.)
- [ ] DTO kullandım (`@Body() dto: CreateDto`)
- [ ] Swagger decorator'ları ekledim (`@ApiOperation()`, `@ApiResponse()`)
- [ ] Authentication guard ekledim (gerekirse) (`@UseGuards(JwtAuthGuard)`)

### Database
- [ ] Prisma query yazdım
- [ ] İlişkileri doğru kullandım (`include`, `select`)
- [ ] Index'leri kontrol ettim (performans için)

## 🧪 Test

- [ ] Swagger'dan test ettim (`http://localhost:3001/api/docs`)
- [ ] Postman'den test ettim
- [ ] Frontend'den test ettim
- [ ] Başarılı case'i test ettim
- [ ] Error case'lerini test ettim (invalid data, not found, vb.)
- [ ] Edge case'leri test ettim (null, empty, max length, vb.)

## 🔒 Güvenlik

- [ ] Authentication gerekli mi? (JWT Guard)
- [ ] Input validation var mı? (DTO validation)
- [ ] SQL injection riski var mı? (Prisma kullan)
- [ ] Sensitive data expose ediliyor mu? (password, token, vb.)

## 📝 Dokümantasyon

- [ ] API spesifikasyonunu güncelledim (`docs/04_API_SPECIFICATION.md`)
- [ ] Kod yorumları ekledim (karmaşık logic için)
- [ ] Önemli kararları dokümante ettim (`docs/06_TECHNICAL_DECISIONS.md`)

## 🎯 Son Kontrol

- [ ] Linter hataları yok (`yarn lint`)
- [ ] TypeScript hataları yok
- [ ] Server hatasız çalışıyor
- [ ] Response formatı doğru (`{ success, data, message }`)
- [ ] Error formatı doğru (`{ success, error, message_key, fields }`)

## ✅ Tamamlandı!

Özellik production'a hazır! 🚀

