# Şifremi Unuttum Özelliği - Frontend Kullanım Kılavuzu

Bu dokümantasyon, frontend geliştiricileri için "Şifremi Unuttum" özelliğinin nasıl implement edileceğini ve kullanılacağını açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [API Endpoint'leri](#api-endpointleri)
3. [Kullanıcı Akışı](#kullanıcı-akışı)
4. [Implementasyon Örnekleri](#implementasyon-örnekleri)
5. [Hata Yönetimi](#hata-yönetimi)
6. [UI/UX Önerileri](#uiux-önerileri)
7. [Test Senaryoları](#test-senaryoları)

---

## 🎯 Genel Bakış

### Özellik Açıklaması

Kullanıcılar şifrelerini unuttuklarında, e-posta adreslerine gönderilen 6 haneli doğrulama kodu ile şifrelerini sıfırlayabilirler.

### İş Akışı

```
1. Kullanıcı "Şifremi Unuttum" butonuna tıklar
   ↓
2. E-posta adresini girer
   ↓
3. Sistem e-posta adresine 6 haneli kod gönderir
   ↓
4. Kullanıcı e-postasındaki kodu girer
   ↓
5. Sistem kodu doğrular ve reset token döner
   ↓
6. Kullanıcı yeni şifresini belirler
   ↓
7. Şifre başarıyla güncellenir
```

### Önemli Notlar

- ✅ Kod 15 dakika geçerlidir
- ✅ Kod 5 yanlış denemeden sonra geçersiz olur
- ✅ Aynı e-posta için 5 dakikada 1 kod gönderilebilir (rate limiting)
- ✅ Kod tek kullanımlıktır

---

## 🔌 API Endpoint'leri

### Base URL

```
http://localhost:3001/api/auth
```

### 1. POST /forgot-password

**Amaç**: E-posta adresine doğrulama kodu gönderir.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Doğrulama kodu e-posta adresinize gönderildi",
    "expiresIn": 15
  }
}
```

**Hata Durumları**:
- `429 Too Many Requests`: Çok fazla istek (5 dakikada 1 istek limiti)

**Örnek Kullanım**:
```typescript
const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
  }),
});

const data = await response.json();
if (data.success) {
  console.log('Kod gönderildi!', data.data.message);
}
```

### 2. POST /verify-reset-code

**Amaç**: Doğrulama kodunu kontrol eder ve reset token döner.

**Request**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Kod doğrulandı",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Hata Durumları**:
- `404 Not Found`: Geçersiz kod veya süresi dolmuş
- `410 Gone`: Kod zaten kullanılmış
- `429 Too Many Requests`: Çok fazla yanlış deneme (5 deneme limiti)

**Örnek Kullanım**:
```typescript
const response = await fetch('http://localhost:3001/api/auth/verify-reset-code', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    code: '123456',
  }),
});

const data = await response.json();
if (data.success) {
  const resetToken = data.data.token;
  // Token'ı sakla (state, async storage, vb.)
}
```

### 3. POST /reset-password

**Amaç**: Şifreyi sıfırlar.

**Request**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Şifre başarıyla güncellendi"
  }
}
```

**Hata Durumları**:
- `400 Bad Request`: Şifreler eşleşmiyor veya geçersiz format
- `401 Unauthorized`: Geçersiz veya süresi dolmuş token
- `410 Gone`: Token zaten kullanılmış

**Örnek Kullanım**:
```typescript
const response = await fetch('http://localhost:3001/api/auth/reset-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: resetToken, // verify-reset-code'dan alınan token
    newPassword: 'NewPassword123',
    confirmPassword: 'NewPassword123',
  }),
});

const data = await response.json();
if (data.success) {
  console.log('Şifre güncellendi!');
  // Login ekranına yönlendir
}
```

---

## 🔄 Kullanıcı Akışı

### Adım 1: E-posta Girişi

```typescript
// ForgotPasswordScreen.tsx
const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleSendCode = async () => {
  setLoading(true);
  setError('');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Başarılı - Kod gönderildi mesajı göster
      // VerifyCodeScreen'e yönlendir
      navigation.navigate('VerifyCode', { email });
    } else {
      setError(data.error?.message || 'Bir hata oluştu');
    }
  } catch (err) {
    setError('Bağlantı hatası');
  } finally {
    setLoading(false);
  }
};
```

### Adım 2: Kod Doğrulama

```typescript
// VerifyCodeScreen.tsx
const [code, setCode] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [resetToken, setResetToken] = useState('');

const handleVerifyCode = async () => {
  setLoading(true);
  setError('');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: route.params.email,
        code: code,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Token'ı sakla
      setResetToken(data.data.token);
      // ResetPasswordScreen'e yönlendir
      navigation.navigate('ResetPassword', { token: data.data.token });
    } else {
      setError(data.error?.message || 'Geçersiz kod');
    }
  } catch (err) {
    setError('Bağlantı hatası');
  } finally {
    setLoading(false);
  }
};
```

### Adım 3: Şifre Sıfırlama

```typescript
// ResetPasswordScreen.tsx
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleResetPassword = async () => {
  // Validasyon
  if (newPassword !== confirmPassword) {
    setError('Şifreler eşleşmiyor');
    return;
  }
  
  if (newPassword.length < 6) {
    setError('Şifre en az 6 karakter olmalıdır');
    return;
  }
  
  setLoading(true);
  setError('');
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: route.params.token,
        newPassword,
        confirmPassword,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Başarılı - Login ekranına yönlendir
      navigation.navigate('Login', {
        message: 'Şifreniz başarıyla güncellendi. Lütfen giriş yapın.',
      });
    } else {
      setError(data.error?.message || 'Bir hata oluştu');
    }
  } catch (err) {
    setError('Bağlantı hatası');
  } finally {
    setLoading(false);
  }
};
```

---

## 💻 Implementasyon Örnekleri

### React Native Örneği (Tam Implementasyon)

```typescript
// services/authService.ts
export class AuthService {
  private baseUrl = 'http://localhost:3001/api/auth';

  async forgotPassword(email: string): Promise<{ message: string; expiresIn: number }> {
    const response = await fetch(`${this.baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Kod gönderilemedi');
    }

    return data.data;
  }

  async verifyResetCode(email: string, code: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/verify-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Kod doğrulanamadı');
    }

    return data.data.token;
  }

  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'Şifre sıfırlanamadı');
    }
  }
}
```

### Hook Örneği (React Native)

```typescript
// hooks/usePasswordReset.ts
import { useState } from 'react';
import { AuthService } from '../services/authService';

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const authService = new AuthService();

  const sendCode = async (email: string) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.forgotPassword(email);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    setLoading(true);
    setError('');
    
    try {
      const token = await authService.verifyResetCode(email, code);
      return token;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
    setLoading(true);
    setError('');
    
    try {
      await authService.resetPassword(token, newPassword, confirmPassword);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendCode,
    verifyCode,
    resetPassword,
    loading,
    error,
  };
};
```

### Screen Örneği (React Native)

```typescript
// screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { usePasswordReset } from '../hooks/usePasswordReset';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const { sendCode, loading, error } = usePasswordReset();

  const handleSendCode = async () => {
    try {
      const result = await sendCode(email);
      Alert.alert(
        'Kod Gönderildi',
        `Doğrulama kodu e-posta adresinize gönderildi. Kod ${result.expiresIn} dakika geçerlidir.`,
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('VerifyCode', { email }),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Hata', error || 'Bir hata oluştu');
    }
  };

  return (
    <View>
      <Text>Şifremi Unuttum</Text>
      <TextInput
        placeholder="E-posta adresiniz"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button
        title="Kod Gönder"
        onPress={handleSendCode}
        disabled={loading || !email}
      />
    </View>
  );
};
```

---

## ⚠️ Hata Yönetimi

### Hata Kodları ve Mesajları

| HTTP Status | Message Key | Açıklama | Kullanıcı Mesajı |
|-------------|-------------|----------|------------------|
| 400 | `VALIDATION_ERROR` | Validation hatası | "Lütfen tüm alanları doğru doldurun" |
| 404 | `INVALID_RESET_CODE` | Geçersiz kod | "Geçersiz kod. Lütfen tekrar deneyin" |
| 404 | `CODE_EXPIRED` | Kod süresi dolmuş | "Kod süresi dolmuş. Lütfen yeni kod isteyin" |
| 410 | `CODE_ALREADY_USED` | Kod kullanılmış | "Bu kod zaten kullanılmış. Lütfen yeni kod isteyin" |
| 410 | `TOKEN_ALREADY_USED` | Token kullanılmış | "Bu işlem zaten tamamlanmış" |
| 429 | `TOO_MANY_REQUESTS` | Çok fazla istek | "Lütfen 5 dakika sonra tekrar deneyin" |
| 429 | `TOO_MANY_ATTEMPTS` | Çok fazla deneme | "Çok fazla yanlış deneme. Lütfen yeni kod isteyin" |
| 401 | `INVALID_RESET_TOKEN` | Geçersiz token | "İşlem süresi dolmuş. Lütfen baştan başlayın" |

### Hata Yönetimi Örneği

```typescript
const handleError = (error: any) => {
  const statusCode = error.response?.status || error.status;
  const messageKey = error.response?.data?.error?.messageKey;
  
  switch (statusCode) {
    case 404:
      if (messageKey === 'CODE_EXPIRED') {
        return 'Kod süresi dolmuş. Lütfen yeni kod isteyin.';
      }
      return 'Geçersiz kod. Lütfen tekrar deneyin.';
    
    case 410:
      return 'Bu kod zaten kullanılmış. Lütfen yeni kod isteyin.';
    
    case 429:
      if (messageKey === 'TOO_MANY_ATTEMPTS') {
        return 'Çok fazla yanlış deneme. Lütfen yeni kod isteyin.';
      }
      return 'Lütfen 5 dakika sonra tekrar deneyin.';
    
    case 401:
      return 'İşlem süresi dolmuş. Lütfen baştan başlayın.';
    
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
};
```

---

## 🎨 UI/UX Önerileri

### 1. E-posta Girişi Ekranı

- ✅ E-posta input alanı
- ✅ "Kod Gönder" butonu
- ✅ Loading state gösterimi
- ✅ Rate limiting durumunda geri sayım timer'ı
- ✅ "Giriş ekranına dön" linki

**Örnek UI**:
```
┌─────────────────────────┐
│   Şifremi Unuttum       │
├─────────────────────────┤
│                         │
│  E-posta Adresi         │
│  ┌───────────────────┐ │
│  │ user@example.com  │ │
│  └───────────────────┘ │
│                         │
│  [Kod Gönder]           │
│                         │
│  Giriş ekranına dön →   │
└─────────────────────────┘
```

### 2. Kod Doğrulama Ekranı

- ✅ 6 haneli kod input (her rakam için ayrı input veya tek input)
- ✅ Otomatik focus yönetimi
- ✅ "Kodu tekrar gönder" butonu (rate limiting kontrolü ile)
- ✅ Geri sayım timer (15 dakika)
- ✅ Deneme sayısı gösterimi (5 deneme limiti)

**Örnek UI**:
```
┌─────────────────────────┐
│   Doğrulama Kodu        │
├─────────────────────────┤
│                         │
│  E-posta: user@ex...    │
│                         │
│  ┌─┬─┬─┬─┬─┬─┐         │
│  │1│2│3│4│5│6│         │
│  └─┴─┴─┴─┴─┴─┘         │
│                         │
│  Kalan süre: 14:32      │
│  Deneme: 0/5            │
│                         │
│  [Kodu Doğrula]         │
│                         │
│  Kodu tekrar gönder →   │
└─────────────────────────┘
```

### 3. Şifre Sıfırlama Ekranı

- ✅ Yeni şifre input (gizli)
- ✅ Şifre tekrarı input (gizli)
- ✅ Şifre güçlülük göstergesi
- ✅ Şifre kuralları listesi
- ✅ "Şifreyi Güncelle" butonu

**Örnek UI**:
```
┌─────────────────────────┐
│   Yeni Şifre Belirle    │
├─────────────────────────┤
│                         │
│  Yeni Şifre             │
│  ┌───────────────────┐ │
│  │ ••••••••••        │ │
│  └───────────────────┘ │
│                         │
│  Şifre Tekrarı          │
│  ┌───────────────────┐ │
│  │ ••••••••••        │ │
│  └───────────────────┘ │
│                         │
│  Şifre Kuralları:       │
│  ✓ En az 6 karakter     │
│  ✓ Büyük harf           │
│  ✓ Küçük harf           │
│  ✓ Rakam                 │
│                         │
│  [Şifreyi Güncelle]     │
└─────────────────────────┘
```

### 4. Başarı Ekranı

- ✅ Başarı mesajı
- ✅ "Giriş Yap" butonu
- ✅ Otomatik yönlendirme (3 saniye sonra)

---

## 🧪 Test Senaryoları

### Senaryo 1: Başarılı Akış

```
1. Kullanıcı e-posta girer
2. Kod gönderilir ✅
3. Kullanıcı kodu girer
4. Kod doğrulanır ✅
5. Kullanıcı yeni şifre belirler
6. Şifre güncellenir ✅
7. Yeni şifreyle login yapılır ✅
```

### Senaryo 2: Rate Limiting

```
1. Kullanıcı kod ister
2. Kod gönderilir ✅
3. Kullanıcı 2 dakika sonra tekrar kod ister
4. 429 hatası alınır ✅
5. "5 dakika sonra tekrar deneyin" mesajı gösterilir ✅
```

### Senaryo 3: Yanlış Kod Denemeleri

```
1. Kullanıcı yanlış kod girer (1. deneme)
2. Hata mesajı gösterilir ✅
3. Kullanıcı tekrar yanlış kod girer (2-5. deneme)
4. Her denemede attempts artar ✅
5. 5. denemeden sonra 429 hatası ✅
6. "Yeni kod isteyin" mesajı gösterilir ✅
```

### Senaryo 4: Süresi Dolmuş Kod

```
1. Kullanıcı kod ister
2. 16 dakika bekler
3. Kodu girmeye çalışır
4. 404 hatası alınır ✅
5. "Kod süresi dolmuş" mesajı gösterilir ✅
```

### Senaryo 5: Token Süresi Dolması

```
1. Kullanıcı kodu doğrular
2. Token alınır ✅
3. 11 dakika bekler
4. Şifre sıfırlamaya çalışır
5. 401 hatası alınır ✅
6. "İşlem süresi dolmuş" mesajı gösterilir ✅
```

---

## 📱 React Native Özel Notlar

### AsyncStorage Kullanımı

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reset token'ı sakla
await AsyncStorage.setItem('resetToken', token);

// Reset token'ı al
const token = await AsyncStorage.getItem('resetToken');

// Reset token'ı sil
await AsyncStorage.removeItem('resetToken');
```

### Navigation Örneği

```typescript
// navigation/types.ts
export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  VerifyCode: { email: string };
  ResetPassword: { token: string };
};

// navigation/AuthNavigator.tsx
<Stack.Navigator>
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
  <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
</Stack.Navigator>
```

### Timer Örneği (Geri Sayım)

```typescript
import { useState, useEffect } from 'react';

const useCountdown = (initialMinutes: number) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [minutes, seconds]);

  return { minutes, seconds };
};

// Kullanım
const { minutes, seconds } = useCountdown(15);
const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
```

---

## 🔐 Güvenlik Önerileri

1. **Token Saklama**: Reset token'ı güvenli bir şekilde saklayın (AsyncStorage, SecureStore)
2. **HTTPS**: Production'da mutlaka HTTPS kullanın
3. **Token Temizleme**: İşlem tamamlandıktan sonra token'ı silin
4. **Otomatik Logout**: Şifre değişikliğinden sonra mevcut session'ları sonlandırın
5. **Rate Limiting UI**: Kullanıcıya rate limiting durumunu gösterin

---

## ✅ Kontrol Listesi

### Implementasyon

- [ ] ForgotPasswordScreen oluşturuldu
- [ ] VerifyCodeScreen oluşturuldu
- [ ] ResetPasswordScreen oluşturuldu
- [ ] AuthService metodları implement edildi
- [ ] Hata yönetimi eklendi
- [ ] Loading state'leri eklendi
- [ ] Navigation yapılandırıldı

### UI/UX

- [ ] E-posta input validasyonu
- [ ] Kod input (6 haneli)
- [ ] Şifre input (gizli/göster)
- [ ] Geri sayım timer
- [ ] Deneme sayısı gösterimi
- [ ] Loading indicator
- [ ] Hata mesajları
- [ ] Başarı mesajları

### Test

- [ ] Başarılı akış test edildi
- [ ] Rate limiting test edildi
- [ ] Yanlış kod denemeleri test edildi
- [ ] Süresi dolmuş kod test edildi
- [ ] Token süresi dolması test edildi

---

## 📞 Destek

Sorularınız için backend ekibine ulaşabilirsiniz.

---

**Son Güncelleme**: 2025-11-14

