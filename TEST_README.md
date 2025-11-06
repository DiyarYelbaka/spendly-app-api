# 🧪 API Test Suite

Bu klasörde API'yi test etmek için kullanabileceğiniz test scriptleri bulunmaktadır.

## 📋 Test Scripti

### `test-api.sh` - Bash/Curl Test Suite

Kapsamlı bir test scripti. Tüm endpoint'leri test eder:

- ✅ Health Check
- ✅ Auth Modülü (Register, Login, Refresh, Logout, Me)
- ✅ Categories Modülü (CRUD + Filters)
- ✅ Transactions Modülü (CRUD + Income/Expense)
- ✅ Analytics Modülü (Dashboard + Summary)
- ✅ Security Testleri (User Isolation)

## 🚀 Kullanım

### Windows (Git Bash veya WSL)

```bash
# Git Bash'te
bash test-api.sh

# WSL'de
bash test-api.sh
```

### Linux/Mac

```bash
# Çalıştırılabilir yap
chmod +x test-api.sh

# Çalıştır
./test-api.sh
```

## 📊 Test Sonuçları

Script çalıştığında:

1. Her test için detaylı bilgi gösterir
2. Başarılı/başarısız testleri renkli olarak gösterir
3. Sonunda özet istatistikler sunar:
   - Toplam test sayısı
   - Başarılı test sayısı
   - Başarısız test sayısı
   - Başarı oranı (%)
   - Hata listesi (varsa)

## ⚙️ Gereksinimler

- `curl` komutu (genellikle sistemde yüklü)
- `bash` (Git Bash, WSL veya Linux/Mac)
- Server çalışıyor olmalı (`yarn start:dev`)

## 🔧 Özelleştirme

Script'i özelleştirmek için:

1. `BASE_URL` değişkenini değiştirin (varsayılan: `http://localhost:3001/api`)
2. Test edilecek endpoint'leri ekleyin/çıkarın
3. Beklenen status kodlarını değiştirin

## 📝 Notlar

- Script her çalıştırıldığında yeni test kullanıcıları oluşturur
- Test verileri database'de kalır (temizlemek için manuel silme gerekir)
- Bazı testler önceki testlere bağımlıdır (örn: transaction testleri için kategori gerekir)

## 🐛 Sorun Giderme

### "curl: command not found"
- Windows: Git Bash veya WSL kullanın
- Linux/Mac: `curl` yükleyin: `sudo apt-get install curl` (Linux) veya `brew install curl` (Mac)

### "Connection refused"
- Server'ın çalıştığından emin olun: `yarn start:dev`
- Port'un doğru olduğundan emin olun (varsayılan: 3001)

### "Permission denied"
- Linux/Mac: `chmod +x test-api.sh` çalıştırın
- Windows: Git Bash veya WSL kullanın

## 📚 Alternatif Test Yöntemleri

1. **Swagger UI**: `http://localhost:3001/api/docs` - Tüm endpoint'leri interaktif olarak test edebilirsiniz
2. **Postman**: Postman collection oluşturulabilir (isteğe bağlı)
3. **Manuel Test**: Her endpoint'i tek tek curl ile test edebilirsiniz

## 🎯 Test Kapsamı

### ✅ Test Edilen Senaryolar

- ✅ Başarılı işlemler (200, 201)
- ✅ Validation hataları (400)
- ✅ Authentication hataları (401)
- ✅ Not found hataları (404)
- ✅ Conflict hataları (409)
- ✅ User isolation (güvenlik)
- ✅ Token refresh
- ✅ Filtreleme ve pagination

### 📋 Test Edilen Endpoint'ler

**Auth:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me

**Categories:**
- GET /api/categories
- GET /api/categories/:id
- POST /api/categories
- PUT /api/categories/:id
- DELETE /api/categories/:id

**Transactions:**
- POST /api/transactions/income
- POST /api/transactions/expense
- GET /api/transactions
- GET /api/transactions/:id
- PUT /api/transactions/:id
- DELETE /api/transactions/:id

**Analytics:**
- GET /api/analytics/dashboard
- GET /api/analytics/summary

**Health:**
- GET /api/health

---

**Toplam: ~40+ test senaryosu**

