updat# 🚂 Railway Deployment Rehberi

Bu dokümantasyon, Spendly API projesini Railway'a deploy etmek için adım adım rehber içerir.

## 📋 Ön Gereksinimler

1. **Railway Hesabı**: [railway.app](https://railway.app) üzerinden hesap oluşturun
2. **GitHub/GitLab Repository**: Projeniz bir Git repository'sinde olmalı
3. **Railway CLI** (Opsiyonel): Komut satırından deploy için

## 🚀 Adım Adım Deployment

### 1. Railway'a Giriş ve Proje Oluşturma

1. [railway.app](https://railway.app) adresine gidin ve giriş yapın
2. **"New Project"** butonuna tıklayın
3. **"Deploy from GitHub repo"** seçeneğini seçin
4. GitHub hesabınızı bağlayın (ilk kez ise)
5. `spendly-app-api` repository'sini seçin
6. **"Deploy Now"** butonuna tıklayın

### 2. PostgreSQL Database Ekleme

1. Railway dashboard'da projenize gidin
2. **"+ New"** butonuna tıklayın
3. **"Database"** → **"Add PostgreSQL"** seçin
4. Database otomatik olarak oluşturulur ve `DATABASE_URL` environment variable olarak eklenir

### 3. Environment Variables Ayarlama

Railway dashboard'da projenize gidin ve **"Variables"** sekmesine tıklayın. Aşağıdaki environment variable'ları ekleyin:

#### Zorunlu Environment Variables

```env
# Database (Otomatik eklenir - PostgreSQL eklendiğinde)
DATABASE_URL=postgresql://... (Railway otomatik ekler)

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
MAIL_KEY=your-app-password
EMAIL_FROM=your-email@gmail.com

# Application Settings (Opsiyonel - appConfig.js'de varsayılanlar var)
NODE_ENV=production
PORT=3000 (Railway otomatik ayarlar, genelde değiştirmeye gerek yok)
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Environment Variables Nasıl Eklenir?

1. Railway dashboard'da projenize gidin
2. **"Variables"** sekmesine tıklayın
3. **"+ New Variable"** butonuna tıklayın
4. Variable name ve value'yu girin
5. **"Add"** butonuna tıklayın

### 4. Build ve Deploy Ayarları

Railway otomatik olarak şunları yapar:
- `package.json`'daki `build` script'ini çalıştırır
- `postinstall` script'ini çalıştırır (Prisma generate)
- `start:prod` script'ini çalıştırır

**Not**: Railway otomatik olarak `PORT` environment variable'ını ayarlar. Uygulama bu port'u kullanır.

### 5. Database Migration Çalıştırma

İlk deploy'dan sonra database migration'ları çalıştırmanız gerekir:

#### Yöntem 1: Railway CLI ile (Önerilen)

```bash
# Railway CLI'yi yükleyin
npm i -g @railway/cli

# Railway'a login olun
railway login

# Projeye bağlanın
railway link

# Migration'ları çalıştırın
railway run yarn prisma:migrate:deploy
```

#### Yöntem 2: Railway Dashboard'dan

1. Railway dashboard'da projenize gidin
2. **"Deployments"** sekmesine tıklayın
3. Son deployment'ın yanındaki **"..."** menüsüne tıklayın
4. **"Open in Shell"** seçeneğini seçin
5. Terminal'de şu komutu çalıştırın:
   ```bash
   yarn prisma:migrate:deploy
   ```

### 6. Domain ve HTTPS Ayarlama

1. Railway dashboard'da projenize gidin
2. **"Settings"** sekmesine tıklayın
3. **"Generate Domain"** butonuna tıklayın (ücretsiz Railway domain)
4. Veya **"Custom Domain"** ekleyerek kendi domain'inizi kullanabilirsiniz
5. HTTPS otomatik olarak etkinleştirilir

### 7. CORS Ayarları

Frontend'iniz farklı bir domain'de ise, `CORS_ORIGIN` environment variable'ını frontend domain'inize ayarlayın:

```env
CORS_ORIGIN=https://your-frontend-domain.com
```

Birden fazla domain için:
```env
CORS_ORIGIN=https://domain1.com,https://domain2.com
```

**Not**: `appConfig.js`'de varsayılan olarak `http://localhost:3000` var. Production'da mutlaka değiştirin!

## 🔧 Railway Özel Ayarları

### Build Command (Opsiyonel)

Railway otomatik olarak `yarn build` komutunu çalıştırır. Özel bir build komutu istiyorsanız:

1. Railway dashboard'da projenize gidin
2. **"Settings"** → **"Build & Deploy"** sekmesine gidin
3. **"Build Command"** alanına özel komutunuzu yazın:
   ```
   yarn install && yarn prisma:generate && yarn build
   ```

### Start Command

Railway otomatik olarak `yarn start:prod` komutunu çalıştırır. Değiştirmek isterseniz:

1. Railway dashboard'da projenize gidin
2. **"Settings"** → **"Build & Deploy"** sekmesine gidin
3. **"Start Command"** alanına komutunuzu yazın:
   ```
   yarn start:prod
   ```

## 📝 Environment Variables Kontrol Listesi

Deploy etmeden önce şu environment variable'ların ayarlandığından emin olun:

- [ ] `DATABASE_URL` (PostgreSQL eklendiğinde otomatik)
- [ ] `JWT_SECRET` (Güçlü bir secret key)
- [ ] `OPENAI_API_KEY` (OpenAI API key'iniz)
- [ ] `EMAIL_USER` (Gmail adresiniz)
- [ ] `MAIL_KEY` (Gmail App Password)
- [ ] `EMAIL_FROM` (Gönderen email adresi)
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` (Frontend domain'iniz)

## 🐛 Sorun Giderme

### Database Bağlantı Hatası

- `DATABASE_URL` environment variable'ının doğru ayarlandığından emin olun
- PostgreSQL service'inin çalıştığından emin olun
- Migration'ların çalıştırıldığından emin olun

### Port Hatası

- Railway otomatik olarak `PORT` environment variable'ını ayarlar
- Uygulama `process.env.PORT` değerini kullanır (zaten yapılandırılmış)

### Build Hatası

- Railway loglarını kontrol edin
- `package.json`'daki `build` script'inin doğru olduğundan emin olun
- Node.js versiyonunun uyumlu olduğundan emin olun (Railway otomatik algılar)

### Migration Hatası

- `prisma:migrate:deploy` komutunu çalıştırdığınızdan emin olun
- Database'in erişilebilir olduğundan emin olun
- Migration dosyalarının doğru olduğundan emin olun

## 🔗 Faydalı Linkler

- [Railway Dokümantasyonu](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

## ✅ Deployment Sonrası Kontrol

1. **Health Check**: `https://your-domain.railway.app/api/health` endpoint'ine istek atın
2. **Swagger Docs**: `https://your-domain.railway.app/api/docs` adresinden API dokümantasyonunu kontrol edin
3. **Database**: Prisma Studio ile database'i kontrol edin (local'de)
4. **Logs**: Railway dashboard'dan logları kontrol edin

## 🎉 Başarılı Deployment!

Deployment başarılı olduğunda:
- API'niz `https://your-domain.railway.app/api` adresinde çalışır
- Swagger dokümantasyonu `https://your-domain.railway.app/api/docs` adresinde erişilebilir
- Tüm endpoint'ler çalışır durumda olmalı

