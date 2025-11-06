# ✅ Pre-Commit Checklist - Kod Commit Etmeden Önce

> ⚠️ **KRİTİK**: Bu checklist'i kod commit etmeden ÖNCE MUTLAKA kontrol et! Her maddeyi işaretle!

## 🔍 Kod Kontrolü

- [ ] **Linter hataları yok mu?**
  ```bash
  yarn lint
  ```
  - Tüm hataları düzelt!

- [ ] **TypeScript hataları yok mu?**
  ```bash
  yarn build
  ```
  - Tüm type hatalarını düzelt!

- [ ] **Server hatasız çalışıyor mu?**
  ```bash
  yarn start:dev
  ```
  - Server başlatıldı mı?
  - Terminal'de hata var mı?

## 🎯 Mimari Kontrolü

- [ ] **Modül yapısı doğru mu?**
  - [ ] `.module.ts` dosyası var mı?
  - [ ] `.controller.ts` dosyası var mı?
  - [ ] `.service.ts` dosyası var mı?
  - [ ] `dto/` klasörü var mı?
  - [ ] ARCHITECTURE.md'ye uygun mu?

- [ ] **Common modülü kullanıldı mı?**
  - [ ] PrismaService kullanıldı mı?
  - [ ] @CurrentUser() decorator kullanıldı mı?
  - [ ] Global filter/interceptor kullanıldı mı?

## 🔐 Güvenlik Kontrolü

- [ ] **userId kontrolü var mı?**
  - [ ] Tüm database query'lerde `where: { userId }` var mı?
  - [ ] Kullanıcı sadece kendi verilerine erişebiliyor mu?

- [ ] **Authentication var mı?**
  - [ ] Protected endpoint'lerde `@UseGuards(JwtAuthGuard)` var mı?
  - [ ] `@ApiBearerAuth()` decorator'ı var mı?

- [ ] **Input validation var mı?**
  - [ ] Tüm DTO'larda validation decorator'ları var mı?
  - [ ] `@IsString()`, `@IsNotEmpty()`, `@MinLength()` vb. var mı?

## 📝 Response Format Kontrolü

- [ ] **Başarılı response formatı doğru mu?**
  ```typescript
  // Service'den döndürülen format
  return { id: 1, name: "test" };
  // TransformInterceptor otomatik formatlar
  ```

- [ ] **Error formatı doğru mu?**
  ```typescript
  throw new NotFoundException({
    message: 'Kayıt bulunamadı',
    messageKey: 'NOT_FOUND',
    error: 'NOT_FOUND'
  });
  ```

- [ ] **Validation error formatı doğru mu?**
  ```typescript
  // Global filter otomatik formatlar
  // Manuel throw gerekmez
  ```

## 🗄️ Database Kontrolü

- [ ] **Prisma query doğru mu?**
  - [ ] `userId` kontrolü var mı?
  - [ ] `include` veya `select` doğru mu?
  - [ ] Pagination var mı? (List endpoint'leri için)

- [ ] **Migration yapıldı mı?** (Database değişikliği varsa)
  ```bash
  yarn prisma migrate dev
  ```

## 📚 Dokümantasyon Kontrolü

- [ ] **PROGRESS.md güncellendi mi?**
  - [ ] Tamamlanan iş işaretlendi mi?
  - [ ] "Son Yapılan İşlemler" bölümüne eklendi mi?
  - [ ] Tarih güncellendi mi?

- [ ] **NEXT_STEPS.md güncellendi mi?**
  - [ ] Tamamlanan adım işaretlendi mi?
  - [ ] Checklist'teki maddeler işaretlendi mi?

- [ ] **API_SPECIFICATION.md güncellendi mi?** (Yeni endpoint varsa)
  - [ ] Yeni endpoint eklendi mi?
  - [ ] Request/Response formatları dokümante edildi mi?

- [ ] **ARCHITECTURE.md güncellendi mi?** (Yeni modül varsa)
  - [ ] Yeni modül eklendi mi?
  - [ ] Modül yapısı dokümante edildi mi?

- [ ] **DATABASE_SCHEMA.md güncellendi mi?** (Database değişikliği varsa)
  - [ ] Yeni model/field eklendi mi?
  - [ ] İlişkiler güncellendi mi?

## 🧪 Test Kontrolü

- [ ] **Swagger'dan test edildi mi?**
  - [ ] Endpoint çalışıyor mu?
  - [ ] Response formatı doğru mu?
  - [ ] Error handling çalışıyor mu?

- [ ] **Manuel test yapıldı mı?**
  - [ ] Başarılı case test edildi mi?
  - [ ] Error case'leri test edildi mi?
  - [ ] Edge case'ler test edildi mi?

## 🎨 Kod Kalitesi Kontrolü

- [ ] **Kod standartlarına uygun mu?**
  - [ ] DEVELOPMENT_GUIDE.md'ye uygun mu?
  - [ ] COMMON_MISTAKES.md'deki hatalar yapılmadı mı?

- [ ] **Swagger decorator'ları var mı?**
  - [ ] `@ApiTags()` var mı?
  - [ ] `@ApiOperation()` var mı?
  - [ ] `@ApiResponse()` var mı?
  - [ ] `@ApiProperty()` var mı? (DTO'larda)

## ⚠️ Son Kontrol

- [ ] **Tüm checklist maddeleri işaretlendi mi?**
- [ ] **Hiçbir "❌" kuralı ihlal edilmedi mi?**
- [ ] **README_FOR_AI.md'deki kurallara uyuldu mu?**
- [ ] **DECISION_TREE.md'ye göre doğru yol seçildi mi?**

---

## 🚨 Eğer Bir Madde İşaretlenmediyse:

**❌ COMMIT ETME!** Önce o maddeyi tamamla!

---

**Unutma**: Bu checklist'i her commit öncesi kontrol et! %0 hata için zorunlu!

