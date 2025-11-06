# Teknik Kararlar ve Gerekçeleri

> Bu dosya, projede alınan önemli teknik kararları ve nedenlerini dokümante eder.

## 🎯 Alınan Kararlar

### 1. Framework: NestJS

**Karar**: NestJS kullanılacak.

**Gerekçe**:
- TypeScript-first yaklaşım (frontend ile uyumlu)
- Modüler yapı (her feature ayrı modül)
- Built-in dependency injection
- Otomatik API dokümantasyonu (Swagger)
- Enterprise-ready, ölçeklenebilir
- Express tabanlı (esnek)

**Alternatifler Değerlendirildi**:
- **Express**: Daha basit ama modüler yapıyı kendin kurman gerekir
- **Fastify**: Hızlı ama daha az olgun ekosistem
- **FastAPI (Python)**: Farklı dil, tip paylaşımı yok

**Sonuç**: NestJS seçildi çünkü TypeScript, modüler yapı ve built-in özellikler sağlıyor.

---

### 2. ORM: Prisma

**Karar**: Prisma kullanılacak.

**Gerekçe**:
- TypeScript ile mükemmel entegrasyon
- Otomatik tip üretimi
- SQL bilgisi gerektirmez
- Migration yönetimi kolay
- Güçlü query API
- Type-safe database client

**Alternatifler Değerlendirildi**:
- **TypeORM**: Daha esnek ama daha karmaşık
- **Sequelize**: Eski, TypeScript desteği zayıf
- **Raw SQL**: Type-safe değil, hata riski yüksek

**Sonuç**: Prisma seçildi çünkü modern, type-safe ve kolay kullanımlı.

---

### 3. Database: PostgreSQL

**Karar**: PostgreSQL kullanılacak.

**Gerekçe**:
- İlişkisel veriler için ideal
- ACID uyumlu (finansal veriler için önemli)
- Güçlü analitik sorgular
- Production-ready
- Prisma ile mükemmel uyum

**Alternatifler Değerlendirildi**:
- **MongoDB**: NoSQL, ilişkisel veriler için uygun değil
- **MySQL**: PostgreSQL kadar gelişmiş değil
- **SQLite**: Production için uygun değil

**Sonuç**: PostgreSQL seçildi çünkü ilişkisel veriler, ACID garantisi ve güçlü sorgular sağlıyor.

---

### 4. Authentication: JWT

**Karar**: JWT (JSON Web Token) kullanılacak.

**Gerekçe**:
- Stateless (server'da session tutmaya gerek yok)
- Scalable (load balancer ile kolay)
- Mobile uygulamalar için uygun
- Refresh token mekanizması ile güvenli

**Alternatifler Değerlendirildi**:
- **Session-based**: Stateful, scaling zor
- **OAuth2**: Overkill, bu proje için gereksiz

**Sonuç**: JWT seçildi çünkü stateless, scalable ve mobile-friendly.

---

### 5. Response Format: Snake Case

**Karar**: Backend response'larında field isimleri **snake_case** olacak.

**Gerekçe**:
- Frontend kodları snake_case bekliyor (`is_default`, `created_at`)
- Database'de de snake_case kullanılıyor
- Tutarlılık için

**Alternatifler Değerlendirildi**:
- **camelCase**: Frontend'de transform gerekir
- **PascalCase**: JavaScript convention'a uygun değil

**Sonuç**: Snake_case seçildi çünkü frontend ve database ile uyumlu.

---

### 6. Validation: class-validator

**Karar**: class-validator kullanılacak.

**Gerekçe**:
- NestJS ile built-in entegrasyon
- Decorator-based (temiz kod)
- TypeScript ile uyumlu
- Detaylı hata mesajları

**Alternatifler Değerlendirildi**:
- **Joi**: NestJS ile entegrasyon zor
- **Zod**: Modern ama NestJS desteği sınırlı

**Sonuç**: class-validator seçildi çünkü NestJS ile native entegrasyon var.

---

### 7. Password Hashing: bcrypt

**Karar**: bcrypt kullanılacak (salt rounds: 10).

**Gerekçe**:
- Industry standard
- Güvenli ve yavaş (brute force'a karşı)
- Kolay kullanım
- Node.js'de yaygın

**Alternatifler Değerlendirildi**:
- **argon2**: Daha güvenli ama daha yavaş
- **scrypt**: bcrypt'ten daha yeni ama daha az yaygın

**Sonuç**: bcrypt seçildi çünkü güvenli, yaygın ve yeterli.

---

### 8. API Documentation: Swagger

**Karar**: @nestjs/swagger kullanılacak.

**Gerekçe**:
- NestJS ile built-in entegrasyon
- Otomatik dokümantasyon
- Test edilebilir API
- Frontend geliştiriciler için kolay

**Alternatifler Değerlendirildi**:
- **Manuel dokümantasyon**: Zaman alıcı, güncel tutmak zor
- **Postman**: Swagger kadar entegre değil

**Sonuç**: Swagger seçildi çünkü otomatik, güncel ve kullanışlı.

---

### 9. Error Handling: Custom Exception Filter

**Karar**: Custom exception filter kullanılacak.

**Gerekçe**:
- Tutarlı error response formatı
- Frontend'in beklediği format
- Detaylı hata mesajları
- Validation error'ları için özel format

**Format**:
```json
{
  "success": false,
  "message_key": "ERROR_CODE",
  "error": "ERROR_CODE",
  "fields": { ... },
  "message": "Hata mesajı"
}
```

---

### 10. Date Format: ISO8601

**Karar**: Tarihler ISO8601 formatında (`YYYY-MM-DD` veya `YYYY-MM-DDTHH:mm:ssZ`).

**Gerekçe**:
- Frontend moment.js kullanıyor
- Standard format
- Timezone desteği
- Database'de Date/DateTime olarak saklanır

---

## 🚫 Yapılmayacaklar

1. **GraphQL**: REST API yeterli, frontend REST bekliyor
2. **Microservices**: Monolith yeterli, gereksiz karmaşıklık
3. **Redis Cache**: Şimdilik gerek yok, gelecekte eklenebilir
4. **Message Queue**: Şimdilik gerek yok
5. **File Upload**: Şimdilik gerek yok

---

## 🔮 Gelecek İçin Notlar

1. **Rate Limiting**: Production'da eklenmeli
2. **Caching**: Redis ile response caching
3. **Monitoring**: Logging ve monitoring (Sentry, DataDog vb.)
4. **Testing**: Unit, integration, e2e testler
5. **CI/CD**: GitHub Actions veya benzeri
6. **Docker**: Containerization
7. **API Versioning**: `/api/v1/` prefix'i

---

## 📝 Kod Standartları

1. **Naming**:
   - Variables: `camelCase`
   - Classes: `PascalCase`
   - Files: `kebab-case`
   - Constants: `UPPER_SNAKE_CASE`

2. **TypeScript**:
   - Strict mode: `true`
   - No `any` type (mümkün olduğunca)
   - Interface vs Type: Interface tercih edilir

3. **NestJS Patterns**:
   - Her feature ayrı modül
   - Service'lerde business logic
   - Controller'lar sadece HTTP handling
   - DTO'lar validation için

---

## 🔄 Değişiklik Yapılması Gerektiğinde

Bu kararlardan biri değiştirilmek istenirse:

1. Bu dosyayı güncelle
2. Değişiklik gerekçesini yaz
3. Alternatifleri değerlendir
4. Team ile görüş (eğer varsa)
5. Migration planı yap

---

## 📚 Referanslar

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

