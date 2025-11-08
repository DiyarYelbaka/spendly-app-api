# Kimlik Doğrulama Sistemi

Bu dokümantasyon, Spendly API'nin JWT tabanlı kimlik doğrulama sistemini detaylı olarak açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [JWT Token Sistemi](#jwt-token-sistemi)
3. [Authentication Flow](#authentication-flow)
4. [Middleware ve Guard'lar](#middleware-ve-guardlar)
5. [Token Yönetimi](#token-yönetimi)
6. [Güvenlik](#güvenlik)

## 🔐 Genel Bakış

Spendly API, **JWT (JSON Web Tokens)** tabanlı stateless authentication kullanır. Bu sistem:

- ✅ Stateless (sunucuda session saklanmaz)
- ✅ Ölçeklenebilir (load balancer ile çalışır)
- ✅ Güvenli (token imzalama ile)
- ✅ Refresh token desteği

## 🎫 JWT Token Sistemi

### Token Tipleri

1. **Access Token**
   - Kısa süreli (varsayılan: 7 gün)
   - Her istekte gönderilir
   - API endpoint'lerine erişim için kullanılır

2. **Refresh Token**
   - Uzun süreli (30 gün)
   - Access token yenilemek için kullanılır
   - Güvenlik için daha uzun süreli

### Token Yapısı

JWT token üç bölümden oluşur:

```
header.payload.signature
```

**Header**:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload** (Access Token):
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1704708000,
  "exp": 1705312800
}
```

**Signature**: Header ve payload'un secret key ile imzalanmış hali

### Token Oluşturma

```typescript
// AuthService.generateTokens()
const accessToken = this.jwtService.sign(
  { sub: userId },
  {
    secret: JWT_SECRET,
    expiresIn: '7d'
  }
);

const refreshToken = this.jwtService.sign(
  { sub: userId },
  {
    secret: JWT_SECRET,
    expiresIn: '30d'
  }
);
```

## 🔄 Authentication Flow

### 1. Kayıt (Register)

```
1. Client → POST /api/auth/register
   {
     email, password, confirmPassword, name
   }

2. Server:
   - Email kontrolü
   - Şifre hash'leme (bcrypt)
   - Kullanıcı oluşturma
   - Varsayılan kategoriler oluşturma
   - JWT token'lar oluşturma

3. Server → Client
   {
     user: {...},
     tokens: {
       accessToken,
       refreshToken,
       expiresAt
     }
   }
```

### 2. Giriş (Login)

```
1. Client → POST /api/auth/login
   {
     email, password
   }

2. Server:
   - Email ile kullanıcı bulma
   - Şifre kontrolü (bcrypt.compare)
   - JWT token'lar oluşturma

3. Server → Client
   {
     user: {...},
     tokens: {...}
   }
```

### 3. Token Yenileme (Refresh)

```
1. Client → POST /api/auth/refresh
   {
     refreshToken
   }

2. Server:
   - Refresh token doğrulama
   - Kullanıcı kontrolü
   - Yeni access token oluşturma

3. Server → Client
   {
     accessToken,
     user: {...}
   }
```

### 4. Korunan Endpoint'e Erişim

```
1. Client → GET /api/categories
   Headers: {
     Authorization: Bearer <access_token>
   }

2. Middleware (JwtUserMiddleware):
   - Token'ı header'dan alır
   - Token'ı doğrular
   - Kullanıcı bilgisini request.user'a ekler

3. Guard (JwtAuthGuard):
   - Token varlığını kontrol eder
   - Geçersizse 401 döndürür

4. Controller:
   - @CurrentUser() decorator ile kullanıcı bilgisini alır
   - İşlemi yapar

5. Server → Client
   {
     success: true,
     data: {...}
   }
```

## 🛡️ Middleware ve Guard'lar

### JwtUserMiddleware

**Dosya**: `src/core/middleware/jwt-user.middleware.ts`

**Amaç**: Her HTTP isteğinde JWT token'ı kontrol eder ve kullanıcı bilgisini `request.user`'a ekler.

**Özellikler**:
- Token yoksa hata fırlatmaz (sadece `request.user` undefined olur)
- Token geçersizse hata fırlatmaz
- Token geçerliyse kullanıcı bilgisini ekler

**Kullanım**: Global olarak tüm route'larda çalışır

### JwtAuthGuard

**Dosya**: `src/auth/guards/jwt-auth.guard.ts`

**Amaç**: Belirli endpoint'leri JWT token ile korur.

**Özellikler**:
- Token yoksa 401 Unauthorized döndürür
- Token geçersizse 401 Unauthorized döndürür
- Token geçerliyse isteği devam ettirir

**Kullanım**:
```typescript
@Controller('categories')
@UseGuards(JwtAuthGuard)  // Tüm endpoint'ler korumalı
export class CategoriesController {
  // ...
}
```

### JWT Strategy

**Dosya**: `src/auth/strategies/jwt.strategy.ts`

**Amaç**: Passport JWT stratejisini tanımlar.

**İşlevi**:
- Token'ı doğrular
- Payload'dan kullanıcı bilgisini çıkarır
- Kullanıcıyı veritabanından bulur
- `request.user`'a ekler

## 🔑 Token Yönetimi

### Token Saklama (Frontend)

**Önerilen Yöntem**: Secure storage (React Native için AsyncStorage, Web için localStorage)

```typescript
// Token kaydetme
await AsyncStorage.setItem('accessToken', accessToken);
await AsyncStorage.setItem('refreshToken', refreshToken);

// Token okuma
const accessToken = await AsyncStorage.getItem('accessToken');

// Token silme (logout)
await AsyncStorage.removeItem('accessToken');
await AsyncStorage.removeItem('refreshToken');
```

### Token Gönderme

Her korumalı istekte:

```typescript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

### Token Yenileme Stratejisi

```typescript
// Token süresi dolduğunda
async function refreshAccessToken() {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const { accessToken } = await response.json();
  await AsyncStorage.setItem('accessToken', accessToken);
  
  return accessToken;
}
```

## 🔒 Güvenlik

### Şifre Hash'leme

**Kütüphane**: bcrypt  
**Salt Rounds**: 10

```typescript
// Şifre hash'leme
const hashedPassword = await bcrypt.hash(password, 10);

// Şifre kontrolü
const isValid = await bcrypt.compare(password, hashedPassword);
```

### JWT Secret

**ÖNEMLİ**: Production'da güçlü, rastgele bir secret kullanın!

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### Token Süreleri

```env
JWT_EXPIRES_IN="7d"  # Access token: 7 gün
# Refresh token: 30 gün (kod içinde sabit)
```

### Güvenlik Best Practices

1. ✅ HTTPS kullanın (production'da)
2. ✅ Güçlü JWT secret kullanın
3. ✅ Token'ları secure storage'da saklayın
4. ✅ Token süresi dolduğunda yenileyin
5. ✅ Logout'ta token'ları silin
6. ✅ CORS yapılandırması yapın

## 📝 Örnek Kullanım

### Frontend'den Login

```typescript
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Token'ları sakla
    await AsyncStorage.setItem('accessToken', data.data.tokens.accessToken);
    await AsyncStorage.setItem('refreshToken', data.data.tokens.refreshToken);
    
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
}
```

### Korunan Endpoint'e İstek

```typescript
async function getCategories() {
  const accessToken = await AsyncStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:3001/api/categories', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Token yenile ve tekrar dene
    const newToken = await refreshAccessToken();
    return getCategories(); // Recursive call
  }
  
  return await response.json();
}
```

---

**Sonraki Adım**: [CORE.md](./CORE.md) dosyasını okuyarak core modül bileşenlerini öğrenin.

