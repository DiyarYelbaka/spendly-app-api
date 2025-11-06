# 📝 Dokümantasyon Güncelleme Rehberi

> Bu rehber, dokümantasyonun nasıl güncelleneceğini açıklar. **AI ve kullanıcı için**.

## ⚠️ ÖNEMLİ: Otomatik Güncelleme YOK

**Maalesef AI otomatik olarak dokümantasyonu güncellemez.** Her işlem sonrası manuel güncelleme gereklidir.

## 🔄 Güncelleme Akışı

### Senaryo 1: AI Bir İşlem Yaptığında

**AI şunları yapmalı:**
1. İşlemi tamamla
2. **Hemen PROGRESS.md'yi güncelle**
3. **Hemen NEXT_STEPS.md'yi güncelle**
4. Kullanıcıya "Dokümantasyon güncellendi" de

**Kullanıcı şunları yapabilir:**
- AI'ya "PROGRESS.md'yi güncelle" de
- AI'ya "NEXT_STEPS.md'yi güncelle" de
- Veya AI otomatik yapsın (README_FOR_AI.md'de talimat var)

### Senaryo 2: Kullanıcı Bir İşlem Yaptığında

**Kullanıcı şunları yapmalı:**
1. İşlemi tamamla
2. AI'ya "PROGRESS.md'yi güncelle" de
3. AI'ya "NEXT_STEPS.md'yi güncelle" de

## 📋 Güncelleme Checklist

### PROGRESS.md Güncelleme

Her önemli işlem sonrası:

- [ ] "Son Yapılan İşlemler" bölümüne ekle
- [ ] Tarihi ekle
- [ ] "Tamamlanan İşler" bölümündeki ilgili checkbox'ı işaretle
- [ ] "Mevcut Proje Yapısı" bölümünü güncelle (yeni dosya/klasör varsa)

**Örnek:**
```markdown
## 🔄 Son Yapılan İşlemler

1. ✅ NestJS projesi kuruldu
2. ✅ Auth modülü oluşturuldu  ← YENİ
3. ✅ Register endpoint test edildi  ← YENİ
```

### NEXT_STEPS.md Güncelleme

Her adım tamamlandığında:

- [ ] Tamamlanan adımın durumunu "✅ Tamamlandı" yap
- [ ] İlgili checklist'teki maddeleri işaretle
- [ ] Yeni adımları ekle (gerekirse)
- [ ] Tarihi güncelle

**Örnek:**
```markdown
#### 1. PostgreSQL Kurulumu
**Durum**: ✅ Tamamlandı  ← GÜNCELLE

#### 2. Auth Modülü Oluşturma
**Durum**: ✅ Tamamlandı  ← GÜNCELLE
```

## 💬 AI'ya Nasıl Söylenir?

### Yöntem 1: Direkt Talimat
```
"Auth modülünü oluşturduk, PROGRESS.md ve NEXT_STEPS.md'yi güncelle"
```

### Yöntem 2: İşlem Sonrası
```
"İşlem tamamlandı, dokümantasyonu güncelle"
```

### Yöntem 3: Otomatik (AI'nın Yapması Gereken)
AI, README_FOR_AI.md'deki talimatlara göre otomatik güncellemeli.

## 🎯 Best Practice

**Her önemli işlem sonrası:**
1. İşi tamamla
2. Test et
3. **Dokümantasyonu güncelle** ← UNUTMA!
4. Kullanıcıya bildir

**Unutma:** Dokümantasyon güncel değilse, yeni bir chat açıldığında proje durumu anlaşılamaz!

## 📝 Örnek Güncelleme

**Örnek:** Auth modülü oluşturuldu

**PROGRESS.md'ye ekle:**
```markdown
## 🔄 Son Yapılan İşlemler

1. ✅ NestJS projesi kuruldu
2. ✅ Prisma schema oluşturuldu
3. ✅ Auth modülü oluşturuldu  ← YENİ
4. ✅ Register ve Login endpoint'leri test edildi  ← YENİ
```

**NEXT_STEPS.md'de güncelle:**
```markdown
#### 2. Auth Modülü Oluşturma
**Durum**: ✅ Tamamlandı  ← GÜNCELLE

- [x] Database bağlantısı var mı?
- [x] Auth modülü klasör yapısı oluşturuldu mu?
- [x] DTO'lar oluşturuldu mu?
...
```

---

**Not**: Bu dosya hem AI hem de kullanıcı için bir rehberdir. Güncellemeleri unutma!

