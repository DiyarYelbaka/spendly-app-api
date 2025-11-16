# Google Sign-In Backend Entegrasyonu

## Genel Bakış

Frontend'den gelen Google ID Token'ı backend'de doğrulayıp, kullanıcıyı otomatik olarak kaydet/giriş yap ve JWT token'ları döndür.

## Gereksinimler

1. Google ID Token doğrulama (Google'ın resmi kütüphanesi ile)
2. Token'dan kullanıcı bilgilerini çıkarma (email, name, picture)
3. Kullanıcı yoksa otomatik kayıt (şifre olmadan)
4. Kullanıcı varsa otomatik giriş
5. JWT token'ları oluşturup döndürme

## Implementasyon Detayları

### 1. Bağımlılık Ekleme

- `google-auth-library` paketi `package.json`'a eklendi (v9.0.0)

### 2. Veritabanı Şeması Güncelleme

- `User` modelinde `password` alanı optional yapıldı (`String?`)
- Migration: `20251116122826_make_password_optional`
- Google ile giriş yapan kullanıcılar için şifre `null` olarak saklanır

### 3. DTO Oluşturma

- `src/auth/dto/google-signin.dto.ts` dosyası oluşturuldu
- `idToken: string` alanı (Google ID Token)
- Validation: `@IsString()`, `@IsNotEmpty()`

### 4. AuthService Güncelleme

- `googleSignIn()` metodu eklendi:
  - Google token'ı doğrula (`google-auth-library` ile `OAuth2Client`)
  - Token'dan kullanıcı bilgilerini çıkar (email, name, picture)
  - Email ile kullanıcıyı kontrol et
  - Kullanıcı yoksa oluştur (password: null, varsayılan kategoriler ile)
  - Kullanıcı varsa mevcut kullanıcıyı kullan
  - JWT token'ları oluştur ve döndür

### 5. AuthController Güncelleme

- `POST /api/auth/google-signin` endpoint'i eklendi
- Swagger dokümantasyonu eklendi
- Request/Response örnekleri eklendi

### 6. Login Metodu Güncelleme

- Google ile giriş yapan kullanıcılar için şifre kontrolü eklendi
- Eğer kullanıcının şifresi yoksa (Google hesabı), uygun hata mesajı döndürülür

### 7. Environment Variables

- `GOOGLE_CLIENT_ID` (opsiyonel): Google Client ID için environment variable
- Eğer belirtilmezse, token doğrulama yine de çalışır ancak audience kontrolü yapılmaz

## Teknik Detaylar

### Google Token Doğrulama

```typescript
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(googleClientId);
const ticket = await client.verifyIdToken({
  idToken: dto.idToken,
  audience: googleClientId, // Opsiyonel
});
const payload = ticket.getPayload();
```

### Kullanıcı Kayıt/Giriş Mantığı

1. Email ile kullanıcıyı kontrol et
2. Yoksa: 
   - Yeni kullanıcı oluştur (`password: null`)
   - Varsayılan kategorileri ekle (transaction içinde)
3. Varsa: Mevcut kullanıcıyı kullan
4. Her iki durumda da JWT token'ları oluştur ve döndür

### Response Format

Mevcut login/register endpoint'leri ile aynı format:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "createdAt": "2025-01-16T12:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": "2025-01-23T12:00:00.000Z"
    }
  }
}
```

## Hata Durumları

### 401 Unauthorized

- `INVALID_GOOGLE_TOKEN`: Geçersiz Google token
- `MISSING_EMAIL_IN_TOKEN`: Token'da email bilgisi yok

### 422 Unprocessable Entity

- `GOOGLE_ACCOUNT_REQUIRED`: Google hesabı normal login ile giriş yapmaya çalışıyor

## Güvenlik Notları

1. ✅ Google token doğrulama mutlaka backend'de yapılmalı
2. ✅ Token'ın geçerliliği ve süresi kontrol edilmeli
3. ✅ Email verification kontrolü yapılabilir (token'da `email_verified` alanı var)
4. ✅ Google ile giriş yapan kullanıcılar için şifre yok, normal login ile giriş yapamazlar

## Frontend Entegrasyonu

Frontend'den Google Sign-In yapıldıktan sonra:

```typescript
const { idToken } = await GoogleSignin.getTokens();

const response = await fetch('/api/auth/google-signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken }),
});

const data = await response.json();
// data.data.user ve data.data.tokens kullanılabilir
```

## Migration Çalıştırma

```bash
# Development
npm run prisma:migrate

# Production
npm run prisma:migrate:deploy
```

## Test

1. Frontend'den Google Sign-In yap
2. ID Token'ı al
3. `POST /api/auth/google-signin` endpoint'ine gönder
4. Response'dan `user` ve `tokens` bilgilerini kontrol et

