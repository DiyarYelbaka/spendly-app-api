# ⏭️ Sonraki Adımlar

> ⚠️ **KRİTİK**: Bu dosya AI için çok önemlidir! PROGRESS.md'den sonra MUTLAKA BUNU OKU! Projenin bir sonraki adımlarını ve yapılacak işleri içerir. Her önemli adım tamamlandığında bu dosya güncellenmelidir.

**Son Güncelleme**: 2025-11-06

## 🎯 Öncelik Sırası

### 🔴 Yüksek Öncelik (Şimdi Yapılmalı)

#### 1. PostgreSQL Kurulumu ve Database Bağlantısı
**Durum**: ⏳ Beklemede

**Adımlar**:
1. PostgreSQL kurulumu (Docker önerilir)
   ```bash
   docker run --name spendly-db \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=spendly \
     -p 5432:5432 \
     -d postgres:15
   ```

2. `.env` dosyasında `DATABASE_URL` ayarlama
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/spendly?schema=public"
   ```

3. Migration çalıştırma
   ```bash
   yarn prisma migrate dev --name init
   ```

4. Database bağlantısını test etme
   - Server'ı yeniden başlat
   - Terminal'de "✅ Database connected successfully" mesajını kontrol et

**Dokümantasyon**: [02-reference/DATABASE_SCHEMA.md](./02-reference/DATABASE_SCHEMA.md)

---

#### 2. Auth Modülü Oluşturma
**Durum**: ⏳ Beklemede

**Gereksinimler**:
- Database bağlantısı olmalı (yukarıdaki adım tamamlanmalı)

**Yapılacaklar**:
1. Auth modülü klasör yapısı oluştur
   ```
   src/auth/
   ├── auth.module.ts
   ├── auth.controller.ts
   ├── auth.service.ts
   ├── dto/
   │   ├── register.dto.ts
   │   ├── login.dto.ts
   │   └── refresh-token.dto.ts
   ├── guards/
   │   └── jwt-auth.guard.ts
   └── strategies/
       └── jwt.strategy.ts
   ```

2. DTO'lar oluştur (validation ile)
3. AuthService yaz (register, login, JWT)
4. AuthController yaz (endpoint'ler)
5. JWT Strategy ve Guard oluştur
6. Password hashing (bcrypt)

**Endpoint'ler**:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

**Dokümantasyon**: 
- [02-reference/API_SPECIFICATION.md](./02-reference/API_SPECIFICATION.md) - Auth endpoint'leri
- [03-guides/NEW_FEATURE.md](./03-guides/NEW_FEATURE.md) - Checklist'i kullan

---

### 🟡 Orta Öncelik (Auth'dan Sonra)

#### 3. Categories Modülü
**Durum**: ⏳ Beklemede

**Endpoint'ler**:
- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

**Dokümantasyon**: [02-reference/API_SPECIFICATION.md](./02-reference/API_SPECIFICATION.md)

---

#### 4. Transactions Modülü
**Durum**: ⏳ Beklemede

**Endpoint'ler**:
- `POST /api/transactions/income`
- `POST /api/transactions/expense`
- `GET /api/transactions`
- `GET /api/transactions/:id`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

**Dokümantasyon**: [02-reference/API_SPECIFICATION.md](./02-reference/API_SPECIFICATION.md)

---

#### 5. Analytics Modülü
**Durum**: ⏳ Beklemede

**Endpoint'ler**:
- `GET /api/analytics/dashboard`
- `GET /api/analytics/summary`

**Dokümantasyon**: [02-reference/API_SPECIFICATION.md](./02-reference/API_SPECIFICATION.md)

---

### 🟢 Düşük Öncelik (Gelecek)

- Rate limiting
- Advanced logging (Winston)
- Testing (Unit, Integration, E2E)
- CI/CD setup
- Docker containerization
- API versioning (`/api/v1/`)

---

## 📋 Checklist: İlk Adım (Database)

- [ ] Docker kurulu mu? (`docker --version`)
- [ ] PostgreSQL container çalışıyor mu? (`docker ps`)
- [ ] `.env` dosyası oluşturuldu mu?
- [ ] `DATABASE_URL` doğru mu?
- [ ] Migration çalıştırıldı mı? (`yarn prisma migrate dev`)
- [ ] Database bağlantısı test edildi mi?
- [ ] Prisma Studio çalışıyor mu? (`yarn prisma studio`)

---

## 📋 Checklist: Auth Modülü

- [ ] Database bağlantısı var mı?
- [ ] Auth modülü klasör yapısı oluşturuldu mu?
- [ ] DTO'lar oluşturuldu mu? (validation ile)
- [ ] AuthService yazıldı mı?
- [ ] AuthController yazıldı mı?
- [ ] JWT Strategy oluşturuldu mu?
- [ ] JWT Guard oluşturuldu mu?
- [ ] Password hashing çalışıyor mu?
- [ ] Register endpoint test edildi mi?
- [ ] Login endpoint test edildi mi?
- [ ] Swagger'da görünüyor mu?
- [ ] Frontend'den test edildi mi?

---

## 🔄 Güncelleme Kuralları

Bu dosya her önemli adım tamamlandığında güncellenmelidir:

1. Tamamlanan adımı "✅ Tamamlandı" olarak işaretle
2. Yeni adımları ekle
3. Öncelik sırasını güncelle
4. Tarihi güncelle

---

## 💡 Notlar

- **Database olmadan Auth modülü yazılabilir** ama test edilemez
- **Önce database kurulumu yapılmalı** çünkü tüm modüller database gerektirir
- **Her modül için checklist kullan** → [03-guides/NEW_FEATURE.md](./03-guides/NEW_FEATURE.md)
- **Her endpoint için API spesifikasyonuna bak** → [02-reference/API_SPECIFICATION.md](./02-reference/API_SPECIFICATION.md)

---

**Sonraki Adım**: PostgreSQL kurulumu ve database bağlantısı 🚀

