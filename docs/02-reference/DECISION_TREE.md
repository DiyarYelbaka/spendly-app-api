# 🌳 AI Decision Tree - Ne Zaman Ne Yapmalı?

> ⚠️ **KRİTİK**: Bu dosya AI için çok önemlidir! Bir işlem yapmadan önce buraya bak ve doğru yolu seç!

## 🎯 Yeni Bir İstek Geldiğinde

```
Kullanıcı bir şey istedi
    ↓
PROGRESS.md'yi oku ✅
    ↓
NEXT_STEPS.md'yi oku ✅
    ↓
Ne tür bir işlem?
    ├─→ Yeni Modül Oluşturma
    │   └─→ ARCHITECTURE.md oku
    │   └─→ QUICK_REFERENCE.md'den template kopyala
    │   └─→ NEW_FEATURE.md checklist'ini takip et
    │
    ├─→ Yeni Endpoint Ekleme
    │   └─→ API_SPECIFICATION.md kontrol et
    │   └─→ FRONTEND_ANALYSIS.md oku
    │   └─→ QUICK_REFERENCE.md'den template kopyala
    │
    ├─→ Database Değişikliği
    │   └─→ DATABASE_SCHEMA.md oku
    │   └─→ Migration stratejisi kontrol et
    │
    ├─→ Bug Fix
    │   └─→ COMMON_MISTAKES.md kontrol et
    │   └─→ PROGRESS.md'de ilgili bölümü bul
    │
    └─→ Dokümantasyon Güncelleme
        └─→ GUIDE_FOR_UPDATING.md oku
```

## 📝 Yeni Modül Oluştururken (Adım Adım)

```
1. ARCHITECTURE.md oku ✅
   └─→ Modül yapısını anla
   
2. API_SPECIFICATION.md kontrol et ✅
   └─→ Endpoint'ler belirlenmiş mi?
   
3. FRONTEND_ANALYSIS.md oku ✅
   └─→ Frontend formatlarını öğren
   
4. QUICK_REFERENCE.md'den template kopyala ✅
   └─→ Module, Controller, Service, DTO template'leri
   
5. NEW_FEATURE.md checklist'ini takip et ✅
   └─→ Her adımı işaretle
   
6. Kod yaz ✅
   └─→ Template'leri kullan
   └─→ Validation ekle
   └─→ Error handling ekle
   
7. Test et ✅
   └─→ Swagger'dan test et
   
8. PROGRESS.md güncelle ✅
   └─→ Tamamlanan işi işaretle
   
9. NEXT_STEPS.md güncelle ✅
   └─→ Sonraki adıma geç
   
10. API_SPECIFICATION.md güncelle ✅
    └─→ Yeni endpoint'leri ekle
```

## 🔍 Kod Yazmadan Önce Kontrol Listesi

```
Kod yazmadan önce MUTLAKA kontrol et:

□ PROGRESS.md okudum mu? ✅
□ NEXT_STEPS.md okudum mu? ✅
□ ARCHITECTURE.md okudum mu? ✅
□ FRONTEND_ANALYSIS.md okudum mu? ✅
□ API_SPECIFICATION.md kontrol ettim mi? ✅
□ QUICK_REFERENCE.md'den template aldım mı? ✅
□ COMMON_MISTAKES.md'deki hataları kontrol ettim mi? ✅
```

## ⚠️ Kod Yazarken Kontrol Listesi

```
Her kod satırında kontrol et:

□ userId kontrolü var mı? (Kullanıcı sadece kendi verilerine erişebilmeli)
□ DTO validation var mı? (@IsString(), @IsNotEmpty() vb.)
□ Error handling var mı? (NotFoundException, BadRequestException)
□ Swagger decorator'ları var mı? (@ApiOperation, @ApiResponse)
□ @CurrentUser() decorator'ı kullandım mı? (request.user yerine)
□ Response formatı doğru mu? ({ success, data, message })
□ Error formatı doğru mu? ({ success, error, message_key, fields })
□ Pagination var mı? (List endpoint'leri için)
□ Prisma query doğru mu? (userId kontrolü, include, select)
```

## ✅ Kod Yazdıktan Sonra Kontrol Listesi

```
Kod yazdıktan sonra MUTLAKA kontrol et:

□ Linter hataları var mı? (yarn lint)
□ TypeScript hataları var mı?
□ Server hatasız çalışıyor mu?
□ Swagger'dan test ettim mi?
□ Response formatı doğru mu?
□ Error formatı doğru mu?
□ PROGRESS.md güncelledim mi?
□ NEXT_STEPS.md güncelledim mi?
□ API_SPECIFICATION.md güncelledim mi? (yeni endpoint varsa)
□ ARCHITECTURE.md güncelledim mi? (yeni modül varsa)
```

## 🚨 Hata Yapmamak İçin 10 Altın Kural

1. **❌ ASLA userId kontrolü yapmadan database query yapma!**
   ```typescript
   // ❌ YANLIŞ
   await this.prisma.category.findMany();
   
   // ✅ DOĞRU
   await this.prisma.category.findMany({ where: { userId } });
   ```

2. **❌ ASLA request.user kullanma, @CurrentUser() kullan!**
   ```typescript
   // ❌ YANLIŞ
   const user = request.user;
   
   // ✅ DOĞRU
   getData(@CurrentUser() user: any) { ... }
   ```

3. **❌ ASLA DTO validation olmadan endpoint yazma!**
   ```typescript
   // ❌ YANLIŞ
   create(@Body() body: any) { ... }
   
   // ✅ DOĞRU
   create(@Body() dto: CreateDto) { ... }
   ```

4. **❌ ASLA standart response formatı dışında response döndürme!**
   ```typescript
   // ❌ YANLIŞ
   return { id: 1, name: "test" };
   
   // ✅ DOĞRU
   return { id: 1, name: "test" }; // TransformInterceptor otomatik formatlar
   ```

5. **❌ ASLA error formatı dışında exception throw etme!**
   ```typescript
   // ❌ YANLIŞ
   throw new Error("Hata");
   
   // ✅ DOĞRU
   throw new NotFoundException({
     message: 'Kayıt bulunamadı',
     messageKey: 'NOT_FOUND',
     error: 'NOT_FOUND'
   });
   ```

6. **❌ ASLA pagination olmadan list endpoint yazma!**
   ```typescript
   // ❌ YANLIŞ
   findAll() {
     return this.prisma.item.findMany();
   }
   
   // ✅ DOĞRU
   findAll(query, userId) {
     const { page = 1, limit = 10 } = query;
     const [items, total] = await Promise.all([...]);
     return { items, pagination: { total, page, limit } };
   }
   ```

7. **❌ ASLA Swagger decorator'ları olmadan endpoint yazma!**
   ```typescript
   // ❌ YANLIŞ
   @Get()
   findAll() { ... }
   
   // ✅ DOĞRU
   @Get()
   @ApiOperation({ summary: 'Listele' })
   @ApiResponse({ status: 200 })
   findAll() { ... }
   ```

8. **❌ ASLA PROGRESS.md ve NEXT_STEPS.md güncellemeden işlem yapma!**
   - Her önemli işlem sonrası MUTLAKA güncelle!

9. **❌ ASLA template kullanmadan modül oluşturma!**
   - QUICK_REFERENCE.md'den template kopyala!

10. **❌ ASLA COMMON_MISTAKES.md'deki hataları yapma!**
    - Her kod yazmadan önce kontrol et!

## 🎯 Senaryo Bazlı Karar Ağacı

### Senaryo 1: "Yeni bir kategori endpoint'i ekle"
```
1. API_SPECIFICATION.md kontrol et → Endpoint spesifikasyonu var mı?
   ├─→ VAR: Spesifikasyona göre yaz
   └─→ YOK: Önce spesifikasyonu yaz, sonra kod yaz

2. FRONTEND_ANALYSIS.md oku → Frontend formatını öğren

3. QUICK_REFERENCE.md'den Controller template kopyala

4. DTO oluştur (QUICK_REFERENCE.md'den template)

5. Service method yaz (QUICK_REFERENCE.md'den pattern)

6. Test et

7. PROGRESS.md güncelle

8. API_SPECIFICATION.md güncelle (yeni endpoint ekle)
```

### Senaryo 2: "Auth modülü oluştur"
```
1. ARCHITECTURE.md oku → Modül yapısını anla

2. API_SPECIFICATION.md kontrol et → Auth endpoint'leri var mı?

3. QUICK_REFERENCE.md'den Module template kopyala

4. NEW_FEATURE.md checklist'ini takip et

5. Her adımı işaretle

6. Test et

7. PROGRESS.md güncelle

8. NEXT_STEPS.md güncelle

9. ARCHITECTURE.md güncelle (yeni modül ekle)
```

### Senaryo 3: "Database şemasını değiştir"
```
1. DATABASE_SCHEMA.md oku → Mevcut şemayı anla

2. Migration stratejisini kontrol et

3. Prisma schema'yı güncelle

4. Migration oluştur (yarn prisma migrate dev)

5. Test et

6. DATABASE_SCHEMA.md güncelle

7. PROGRESS.md güncelle
```

## 💡 Hızlı Karar Tablosu

| Durum | Ne Yapmalı? | Hangi Dosyayı Oku? |
|-------|-------------|-------------------|
| Yeni modül | ARCHITECTURE.md + QUICK_REFERENCE.md | ARCHITECTURE.md, QUICK_REFERENCE.md |
| Yeni endpoint | API_SPECIFICATION.md + FRONTEND_ANALYSIS.md | API_SPECIFICATION.md, FRONTEND_ANALYSIS.md |
| Database değişikliği | DATABASE_SCHEMA.md | DATABASE_SCHEMA.md |
| Bug fix | COMMON_MISTAKES.md | COMMON_MISTAKES.md |
| Kod yazma | QUICK_REFERENCE.md | QUICK_REFERENCE.md |
| Test etme | NEW_FEATURE.md | NEW_FEATURE.md |
| Dokümantasyon | GUIDE_FOR_UPDATING.md | GUIDE_FOR_UPDATING.md |

---

**Unutma**: Her işlem öncesi bu decision tree'ye bak! Doğru yolu seç!

