# Şifremi Unuttum Özelliği - Implementasyon Planı

Bu dokümantasyon, Spendly API'ye "Şifremi Unuttum" (Password Reset) özelliğinin eklenmesi için detaylı implementasyon planını içerir.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Gereksinimler](#gereksinimler)
3. [Mimari Yaklaşım](#mimari-yaklaşım)
4. [Veritabanı Değişiklikleri](#veritabanı-değişiklikleri)
5. [E-posta Servisi Entegrasyonu](#e-posta-servisi-entegrasyonu)
6. [API Endpoint'leri](#api-endpointleri)
7. [DTO'lar](#dtolar)
8. [Service Metodları](#service-metodları)
9. [Güvenlik Önlemleri](#güvenlik-önlemleri)
10. [Adım Adım Implementasyon](#adım-adım-implementasyon)
11. [Test Planı](#test-planı)

---

## 🎯 Genel Bakış

### Özellik Açıklaması

Kullanıcılar şifrelerini unuttuklarında, e-posta adreslerine gönderilen doğrulama kodu ile şifrelerini sıfırlayabilecekler.

### İş Akışı

```
1. Kullanıcı "Şifremi Unuttum" butonuna tıklar
   ↓
2. E-posta adresini girer
   ↓
3. Sistem e-posta adresine 6 haneli doğrulama kodu gönderir
   ↓
4. Kullanıcı e-postasındaki kodu girer
   ↓
5. Sistem kodu doğrular
   ↓
6. Kullanıcı yeni şifresini belirler
   ↓
7. Şifre başarıyla güncellenir
```

### Özellikler

- ✅ E-posta doğrulama kodu gönderimi
- ✅ 6 haneli rastgele kod üretimi
- ✅ Kod geçerlilik süresi (15 dakika)
- ✅ Kod deneme limiti (5 deneme)
- ✅ Güvenli şifre sıfırlama
- ✅ Kullanılmayan kodların otomatik temizlenmesi

---

## 📦 Gereksinimler

### Teknik Gereksinimler

1. **E-posta Servisi**
   - Nodemailer kütüphanesi
   - SMTP yapılandırması (Gmail, SendGrid, vb.)

2. **Veritabanı**
   - PasswordReset modeli (yeni tablo)
   - Index'ler (performans için)

3. **Environment Variables**
   - SMTP ayarları
   - E-posta gönderen adres
   - Kod geçerlilik süresi

### Fonksiyonel Gereksinimler

1. E-posta adresine doğrulama kodu gönderme
2. Doğrulama kodunu kontrol etme
3. Şifre sıfırlama
4. Rate limiting (spam önleme)
5. Kod geçerlilik kontrolü

---

## 🏗️ Mimari Yaklaşım

### Yeni Modül Yapısı

```
src/
├── auth/
│   ├── auth.module.ts          # EmailService import edilecek
│   ├── auth.controller.ts      # Yeni endpoint'ler eklenecek
│   ├── auth.service.ts          # Yeni metodlar eklenecek
│   └── dto/
│       ├── forgot-password.dto.ts      # YENİ
│       ├── verify-code.dto.ts         # YENİ
│       └── reset-password.dto.ts       # YENİ
│
├── core/
│   └── email/
│       ├── email.module.ts      # YENİ
│       ├── email.service.ts     # YENİ
│       └── email.templates.ts   # YENİ (opsiyonel)
```

### Katmanlı Mimari

```
Request → Controller → Service → EmailService → SMTP
         ↓
      Prisma (PasswordReset)
         ↓
      Response
```

---

## 🗄️ Veritabanı Değişiklikleri

### Yeni Model: PasswordReset

**Dosya**: `prisma/schema.prisma`

```prisma
model PasswordReset {
  id          String   @id @default(uuid())
  email       String
  code        String   @db.VarChar(6)  // 6 haneli kod
  expiresAt   DateTime                 // Kod geçerlilik süresi
  attempts    Int      @default(0)     // Deneme sayısı
  isUsed      Boolean  @default(false) // Kod kullanıldı mı?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([email])
  @@index([email, code])
  @@index([expiresAt])
  @@map("password_resets")
}
```

### Migration

```bash
yarn prisma migrate dev --name add_password_reset
```

### Model Özellikleri

- **code**: 6 haneli rastgele sayısal kod
- **expiresAt**: Kod geçerlilik süresi (varsayılan: 15 dakika)
- **attempts**: Yanlış deneme sayısı (max: 5)
- **isUsed**: Kod kullanıldı mı? (tek kullanımlık)

---

## 📧 E-posta Servisi Entegrasyonu

### Nodemailer Kurulumu

```bash
yarn add nodemailer
yarn add -D @types/nodemailer
```

### EmailService Yapısı

**Dosya**: `src/core/email/email.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    // Gmail SMTP yapılandırması
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('MAIL_KEY'), // App Password (boşluklar dahil)
      },
    });
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: `"${this.configService.get<string>('EMAIL_FROM_NAME', 'Spendly')}" <${this.configService.get<string>('EMAIL_FROM')}>`,
      to: email,
      subject: 'Şifre Sıfırlama Kodu - Spendly',
      html: this.getPasswordResetTemplate(code),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private getPasswordResetTemplate(code: string): string {
    return `
      <h2>Şifre Sıfırlama Kodu</h2>
      <p>Merhaba,</p>
      <p>Şifre sıfırlama talebiniz için doğrulama kodunuz:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${code}</h1>
      <p>Bu kod 15 dakika geçerlidir.</p>
      <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
      <p>Saygılarımızla,<br>Spendly Ekibi</p>
    `;
  }
}
```

### Environment Variables

**.env** dosyasına eklenecek:

```env
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=yelbaka2002@gmail.com
MAIL_KEY=qfnq gnhn svqw fwlk
EMAIL_FROM=yelbaka2002@gmail.com
EMAIL_FROM_NAME=Spendly

# Password Reset Configuration
PASSWORD_RESET_CODE_EXPIRES_IN=15m  # 15 dakika
PASSWORD_RESET_MAX_ATTEMPTS=5        # Maksimum deneme sayısı
PASSWORD_RESET_RATE_LIMIT_MINUTES=5  # Rate limiting (5 dakikada 1 istek)
```

**Not**: 
- `MAIL_KEY` Gmail App Password'dur (boşluklar dahil)
- `EMAIL_USER` gönderen e-posta adresidir
- Gmail için App Password kullanılması gereklidir (2FA aktifse)

### E-posta Şablonu

**Basit HTML şablon**:

```html
<h2>Şifre Sıfırlama Kodu</h2>
<p>Merhaba,</p>
<p>Şifre sıfırlama talebiniz için doğrulama kodunuz:</p>
<h1 style="font-size: 32px; letter-spacing: 5px;">{CODE}</h1>
<p>Bu kod 15 dakika geçerlidir.</p>
<p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
```

---

## 🔌 API Endpoint'leri

### 1. POST /api/auth/forgot-password

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
    "expiresIn": 15  // dakika
  }
}
```

**Hata Durumları**:
- `404 Not Found`: E-posta adresi kayıtlı değil
- `429 Too Many Requests`: Çok fazla istek (rate limiting)
- `500 Internal Server Error`: E-posta gönderilemedi

### 2. POST /api/auth/verify-reset-code

**Amaç**: Doğrulama kodunu kontrol eder.

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
    "token": "reset-token-uuid"  // Şifre sıfırlama için geçici token
  }
}
```

**Hata Durumları**:
- `400 Bad Request`: Geçersiz kod formatı
- `404 Not Found`: Kod bulunamadı veya süresi dolmuş
- `429 Too Many Requests`: Çok fazla deneme
- `410 Gone`: Kod zaten kullanılmış

### 3. POST /api/auth/reset-password

**Amaç**: Şifreyi sıfırlar.

**Request**:
```json
{
  "token": "reset-token-uuid",
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
- `404 Not Found`: Token bulunamadı

---

## 📝 DTO'lar

### 1. ForgotPasswordDto

**Dosya**: `src/auth/dto/forgot-password.dto.ts`

```typescript
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email alanı zorunludur' })
  email: string;
}
```

### 2. VerifyCodeDto

**Dosya**: `src/auth/dto/verify-code.dto.ts`

```typescript
export class VerifyCodeDto {
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email alanı zorunludur' })
  email: string;

  @IsString({ message: 'Kod string olmalıdır' })
  @IsNotEmpty({ message: 'Kod alanı zorunludur' })
  @Length(6, 6, { message: 'Kod 6 haneli olmalıdır' })
  @Matches(/^\d+$/, { message: 'Kod sadece rakamlardan oluşmalıdır' })
  code: string;
}
```

### 3. ResetPasswordDto

**Dosya**: `src/auth/dto/reset-password.dto.ts`

```typescript
export class ResetPasswordDto {
  @IsString({ message: 'Token string olmalıdır' })
  @IsNotEmpty({ message: 'Token alanı zorunludur' })
  @IsUUID('4', { message: 'Geçersiz token formatı' })
  token: string;

  @IsString({ message: 'Şifre string olmalıdır' })
  @IsNotEmpty({ message: 'Şifre alanı zorunludur' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermelidir',
  })
  newPassword: string;

  @IsString({ message: 'Şifre tekrarı string olmalıdır' })
  @IsNotEmpty({ message: 'Şifre tekrarı alanı zorunludur' })
  confirmPassword: string;
}
```

---

## 🔧 Service Metodları

### AuthService'e Eklenecek Metodlar

**Dosya**: `src/auth/auth.service.ts`

#### 1. forgotPassword()

```typescript
async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; expiresIn: number }> {
  // 1. Kullanıcı var mı kontrol et
  // 2. Rate limiting kontrolü (aynı email için 5 dakikada 1 istek)
  // 3. 6 haneli kod oluştur
  // 4. PasswordReset kaydı oluştur
  // 5. E-posta gönder
  // 6. Başarı mesajı döndür
}
```

#### 2. verifyResetCode()

```typescript
async verifyResetCode(dto: VerifyCodeDto): Promise<{ message: string; token: string }> {
  // 1. Kod kaydını bul
  // 2. Kod geçerliliğini kontrol et (süre, kullanılmış mı?)
  // 3. Deneme sayısını kontrol et
  // 4. Kodu doğrula
  // 5. Geçici reset token oluştur (JWT, 10 dakika)
  // 6. Deneme sayısını sıfırla veya artır
  // 7. Token döndür
}
```

#### 3. resetPassword()

```typescript
async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
  // 1. Reset token'ı doğrula
  // 2. PasswordReset kaydını bul
  // 3. Şifreleri eşleşme kontrolü
  // 4. Yeni şifreyi hash'le
  // 5. Kullanıcı şifresini güncelle
  // 6. PasswordReset kaydını işaretle (isUsed = true)
  // 7. Başarı mesajı döndür
}
```

#### 4. Yardımcı Metodlar

```typescript
private generateResetCode(): string {
  // 6 haneli rastgele sayı üret (100000-999999)
}

private async checkRateLimit(email: string): Promise<void> {
  // Son 5 dakikada istek var mı kontrol et
}

private async cleanupExpiredCodes(): Promise<void> {
  // Süresi dolmuş kodları temizle (cron job veya manuel)
}
```

---

## 🔒 Güvenlik Önlemleri

### 1. Rate Limiting

- **E-posta gönderme**: Aynı e-posta için 5 dakikada 1 istek
- **Kod doğrulama**: 5 yanlış denemeden sonra kod geçersiz olur
- **IP bazlı**: Aynı IP'den çok fazla istek engellenir

### 2. Kod Güvenliği

- **6 haneli rastgele sayı**: 100000-999999 arası
- **Tek kullanımlık**: Kod kullanıldıktan sonra geçersiz
- **Zaman sınırı**: 15 dakika geçerlilik
- **Hash'lenmiş saklama**: Kodlar hash'lenerek saklanabilir (opsiyonel)

### 3. Token Güvenliği

- **JWT reset token**: Kod doğrulandıktan sonra 10 dakika geçerli
- **Tek kullanımlık**: Reset token kullanıldıktan sonra geçersiz

### 4. E-posta Güvenliği

- **Kullanıcı kontrolü**: E-posta adresi kayıtlı mı kontrol edilir
- **Hata mesajları**: Güvenlik nedeniyle belirsiz mesajlar (email kayıtlı değilse bile "kod gönderildi" denir)

---

## 📋 Adım Adım Implementasyon

### Faz 1: Altyapı Hazırlığı

1. ✅ Nodemailer kurulumu
2. ✅ Environment variables ekleme
3. ✅ EmailService modülü oluşturma
4. ✅ EmailModule oluşturma

### Faz 2: Veritabanı

1. ✅ PasswordReset modeli ekleme
2. ✅ Migration oluşturma
3. ✅ Prisma Client generate

### Faz 3: DTO'lar

1. ✅ ForgotPasswordDto oluşturma
2. ✅ VerifyCodeDto oluşturma
3. ✅ ResetPasswordDto oluşturma

### Faz 4: Service Metodları

1. ✅ EmailService implementasyonu
2. ✅ AuthService'e forgotPassword() ekleme
3. ✅ AuthService'e verifyResetCode() ekleme
4. ✅ AuthService'e resetPassword() ekleme
5. ✅ Yardımcı metodlar ekleme

### Faz 5: Controller

1. ✅ POST /forgot-password endpoint'i
2. ✅ POST /verify-reset-code endpoint'i
3. ✅ POST /reset-password endpoint'i
4. ✅ Swagger dokümantasyonu

### Faz 6: Güvenlik ve Optimizasyon

1. ✅ Rate limiting implementasyonu
2. ✅ Kod temizleme job'u (opsiyonel)
3. ✅ Hata yönetimi iyileştirmeleri
4. ✅ Logging ekleme

### Faz 7: Test

1. ✅ Unit testler
2. ✅ Integration testler
3. ✅ E2E testler
4. ✅ Manuel testler

---

## 🧪 Test Planı

### Unit Testler

- `generateResetCode()`: Kod formatı ve uzunluk kontrolü
- `checkRateLimit()`: Rate limiting kontrolü
- `verifyResetCode()`: Kod doğrulama mantığı

### Integration Testler

- E-posta gönderme akışı
- Veritabanı işlemleri
- Token oluşturma ve doğrulama

### E2E Testler

1. **Başarılı Akış**:
   - E-posta gönderme → Kod doğrulama → Şifre sıfırlama

2. **Hata Senaryoları**:
   - Geçersiz e-posta
   - Yanlış kod
   - Süresi dolmuş kod
   - Çok fazla deneme
   - Şifreler eşleşmiyor

### Manuel Testler

- [ ] E-posta gönderimi çalışıyor mu?
- [ ] Kod doğru formatta mı? (6 haneli)
- [ ] Kod 15 dakika sonra geçersiz oluyor mu?
- [ ] 5 yanlış denemeden sonra kod geçersiz oluyor mu?
- [ ] Şifre başarıyla güncelleniyor mu?
- [ ] Rate limiting çalışıyor mu?

---

## 📊 Veritabanı İndex Stratejisi

### Önerilen Index'ler

```prisma
@@index([email])              // E-posta ile hızlı arama
@@index([email, code])         // E-posta + kod kombinasyonu
@@index([expiresAt])           // Süresi dolmuş kodları temizleme
```

### Performans Notları

- `expiresAt` index'i ile süresi dolmuş kayıtlar hızlı bulunur
- `email, code` composite index ile kod doğrulama hızlı yapılır

---

## 🔄 Temizleme Stratejisi

### Süresi Dolmuş Kodları Temizleme

**Yöntem 1: Cron Job** (Önerilen)

```typescript
// Her saat başı çalışacak
@Cron('0 * * * *')
async cleanupExpiredCodes() {
  await this.prisma.passwordReset.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
      OR: [
        { isUsed: true },
        { attempts: { gte: 5 } }
      ]
    }
  });
}
```

**Yöntem 2: Manuel Temizleme**

```typescript
// Her kod doğrulama denemesinde
async verifyResetCode() {
  // Önce süresi dolmuş kodları temizle
  await this.cleanupExpiredCodes();
  // Sonra işleme devam et
}
```

---

## 📝 Environment Variables Özeti

```env
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=yelbaka2002@gmail.com
MAIL_KEY=qfnq gnhn svqw fwlk
EMAIL_FROM=yelbaka2002@gmail.com
EMAIL_FROM_NAME=Spendly

# Password Reset Configuration
PASSWORD_RESET_CODE_EXPIRES_IN=15m
PASSWORD_RESET_MAX_ATTEMPTS=5
PASSWORD_RESET_RATE_LIMIT_MINUTES=5
```

**Önemli Notlar**:
- `MAIL_KEY` değeri Gmail App Password'dur ve boşluklar dahil tam olarak yazılmalıdır
- `EMAIL_USER` ve `EMAIL_FROM` aynı e-posta adresi olmalıdır (Gmail için)
- Gmail App Password almak için: Google Account → Security → 2-Step Verification → App Passwords

---

## ✅ Kontrol Listesi

### Geliştirme

- [ ] Nodemailer kuruldu
- [ ] EmailService oluşturuldu
- [ ] PasswordReset modeli eklendi
- [ ] Migration çalıştırıldı
- [ ] DTO'lar oluşturuldu
- [ ] Service metodları implement edildi
- [ ] Controller endpoint'leri eklendi
- [ ] Swagger dokümantasyonu güncellendi

### Test

- [ ] Unit testler yazıldı
- [ ] Integration testler yazıldı
- [ ] E2E testler yazıldı
- [ ] Manuel testler yapıldı

### Dokümantasyon

- [ ] ENDPOINTS.md güncellendi
- [ ] AUTHENTICATION.md güncellendi
- [ ] README.md güncellendi (opsiyonel)

---

## 🚀 Sonraki Adımlar

1. **Implementasyon**: Bu plana göre kod yazımı
2. **Test**: Tüm test senaryolarının çalıştırılması
3. **Dokümantasyon**: API dokümantasyonunun güncellenmesi
4. **Deployment**: Production'a deploy

---

**Not**: Bu plan, mevcut proje yapısını bozmadan, modüler ve güvenli bir şekilde "Şifremi Unuttum" özelliğini eklemek için hazırlanmıştır. Tüm adımlar projenin mevcut mimarisine uygun olarak tasarlanmıştır.

---

**Son Güncelleme**: 2025-01-08

