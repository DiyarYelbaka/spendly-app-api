# Kurulum ve Yapılandırma Rehberi

Bu dokümantasyon, Spendly API projesini yerel ortamınızda çalıştırmak için gereken tüm adımları içerir.

## 📋 Gereksinimler

### Sistem Gereksinimleri
- **Node.js**: v25.1.0 veya üzeri (Volta ile yönetiliyor)
- **Yarn**: v4.11.0 veya üzeri
- **PostgreSQL**: v14 veya üzeri
- **Git**: Projeyi klonlamak için

### Geliştirme Araçları (Opsiyonel)
- **Postman** veya **Insomnia**: API testleri için
- **Prisma Studio**: Veritabanı görüntüleme için
- **VS Code**: Önerilen IDE

## 🚀 Kurulum Adımları

### 1. Projeyi Klonlama

```bash
git clone <repository-url>
cd spendly-app-api
```

### 2. Bağımlılıkları Yükleme

```bash
yarn install
```

Bu komut, `package.json` dosyasındaki tüm bağımlılıkları yükler:
- NestJS framework ve modülleri
- Prisma ORM
- JWT authentication kütüphaneleri
- Diğer yardımcı kütüphaneler

### 3. Environment Değişkenlerini Ayarlama

Proje kök dizininde `.env` dosyası oluşturun:

```bash
cp .env.example .env  # Eğer .env.example varsa
# veya
touch .env
```

`.env` dosyasına aşağıdaki değişkenleri ekleyin:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/spendly_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Application Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
```

#### Environment Değişkenleri Açıklaması

| Değişken | Açıklama | Örnek Değer |
|----------|----------|-------------|
| `DATABASE_URL` | PostgreSQL bağlantı string'i | `postgresql://user:pass@localhost:5432/dbname` |
| `JWT_SECRET` | JWT token'ları imzalamak için gizli anahtar | Güçlü bir rastgele string |
| `JWT_EXPIRES_IN` | Access token geçerlilik süresi | `7d` (7 gün), `24h` (24 saat) |
| `PORT` | Uygulamanın çalışacağı port | `3001` |
| `NODE_ENV` | Ortam tipi | `development`, `production`, `test` |
| `CORS_ORIGIN` | CORS izin verilen origin | `http://localhost:3000` |

**ÖNEMLİ**: Production ortamında `JWT_SECRET` için güçlü, rastgele bir string kullanın!

### 4. PostgreSQL Veritabanı Oluşturma

PostgreSQL'de veritabanı oluşturun:

```bash
# PostgreSQL'e bağlan
psql -U postgres

# Veritabanı oluştur
CREATE DATABASE spendly_db;

# Çıkış
\q
```

Alternatif olarak, PostgreSQL komut satırından:

```bash
createdb -U postgres spendly_db
```

### 5. Prisma Migration'ları Çalıştırma

Veritabanı şemasını oluşturmak için:

```bash
# Prisma Client'ı generate et
yarn prisma:generate

# Migration'ları çalıştır
yarn prisma:migrate
```

Bu komutlar:
1. Prisma Client'ı oluşturur (TypeScript tip tanımları)
2. Veritabanı tablolarını oluşturur (User, Category, Transaction)
3. İlişkileri kurar

### 6. Uygulamayı Başlatma

#### Development Modu (Hot Reload)

```bash
yarn start:dev
```

Bu komut:
- Uygulamayı başlatır
- Dosya değişikliklerini izler (hot reload)
- Hataları konsola yazdırır

#### Production Modu

```bash
# Önce build et
yarn build

# Sonra başlat
yarn start:prod
```

### 7. Uygulamanın Çalıştığını Doğrulama

Tarayıcıda veya terminal'de:

```bash
# Health check
curl http://localhost:3001/api

# Swagger dokümantasyonu
# Tarayıcıda aç: http://localhost:3001/api/docs
```

Başarılı bir başlatma sonrası konsolda şunu görmelisiniz:

```
🚀 Application is running on: http://localhost:3001/api
📚 Swagger documentation: http://localhost:3001/api/docs
```

## 🛠️ Geliştirme Araçları

### Prisma Studio

Veritabanını görselleştirmek için:

```bash
yarn prisma:studio
```

Bu komut, `http://localhost:5555` adresinde Prisma Studio'yu açar. Buradan:
- Veritabanı tablolarını görüntüleyebilirsiniz
- Veri ekleyebilir, düzenleyebilir, silebilirsiniz
- İlişkileri inceleyebilirsiniz

### Swagger UI

API dokümantasyonu ve test için:

```
http://localhost:3001/api/docs
```

Swagger UI'de:
- Tüm endpoint'leri görebilirsiniz
- Request/response örneklerini inceleyebilirsiniz
- API'yi direkt test edebilirsiniz
- JWT token ile authenticated istekler yapabilirsiniz

### Linting ve Formatting

```bash
# Kod formatını düzelt
yarn format

# Lint hatalarını kontrol et ve düzelt
yarn lint
```

## 🧪 Test

### Unit Testler

```bash
# Tüm testleri çalıştır
yarn test

# Watch modu (dosya değişikliklerinde otomatik test)
yarn test:watch

# Coverage raporu
yarn test:cov
```

### E2E Testler

```bash
yarn test:e2e
```

## 🐛 Sorun Giderme

### Port Zaten Kullanılıyor

Eğer port 3001 zaten kullanılıyorsa:

1. `.env` dosyasında `PORT` değişkenini değiştirin
2. Veya kullanan process'i bulun ve durdurun:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill
```

### Veritabanı Bağlantı Hatası

1. PostgreSQL'in çalıştığından emin olun
2. `DATABASE_URL` değişkenini kontrol edin
3. Kullanıcı adı ve şifrenin doğru olduğundan emin olun
4. Veritabanının oluşturulduğundan emin olun

### Prisma Client Hatası

```bash
# Prisma Client'ı yeniden generate et
yarn prisma:generate
```

### Migration Hataları

```bash
# Migration durumunu kontrol et
yarn prisma migrate status

# Migration'ları sıfırla (DİKKAT: Veri kaybına neden olur!)
yarn prisma migrate reset
```

## 📦 Production Deployment

### Build

```bash
yarn build
```

Bu komut, `dist/` klasörüne derlenmiş JavaScript dosyalarını oluşturur.

### Environment Variables (Production)

Production ortamında şu değişkenleri ayarlayın:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://..."
JWT_SECRET="<güçlü-rastgele-string>"
CORS_ORIGIN="https://your-frontend-domain.com"
```

### PM2 ile Çalıştırma (Önerilen)

```bash
# PM2'yi global olarak yükle
npm install -g pm2

# Uygulamayı başlat
pm2 start dist/main.js --name spendly-api

# Logları görüntüle
pm2 logs spendly-api

# Durumu kontrol et
pm2 status
```

## 🔄 Güncelleme

### Bağımlılıkları Güncelleme

```bash
# Tüm bağımlılıkları güncelle
yarn upgrade

# Belirli bir paketi güncelle
yarn upgrade <package-name>
```

### Migration'ları Güncelleme

Veritabanı şeması değiştiğinde:

```bash
# Yeni migration oluştur
yarn prisma migrate dev --name <migration-name>

# Production'da migration uygula
yarn prisma migrate deploy
```

## 📝 Notlar

- Development modunda hot reload aktif, dosya değişiklikleri otomatik algılanır
- `.env` dosyasını git'e commit etmeyin (`.gitignore`'da olmalı)
- Production'da mutlaka güçlü bir `JWT_SECRET` kullanın
- Veritabanı yedeklemelerini düzenli olarak alın

## ✅ Kurulum Kontrol Listesi

- [ ] Node.js ve Yarn yüklü
- [ ] PostgreSQL çalışıyor
- [ ] `.env` dosyası oluşturuldu ve yapılandırıldı
- [ ] Veritabanı oluşturuldu
- [ ] Prisma migration'ları çalıştırıldı
- [ ] Uygulama başlatıldı (`yarn start:dev`)
- [ ] Swagger UI erişilebilir (`http://localhost:3001/api/docs`)
- [ ] Health check başarılı (`http://localhost:3001/api`)

---

**Sonraki Adım**: [ARCHITECTURE.md](./ARCHITECTURE.md) dosyasını okuyarak proje yapısını anlayın.

