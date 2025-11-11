#!/bin/bash

# ============================================================================
# KATEGORİ EŞLEŞTİRME TEST SCRIPTİ
# ============================================================================
# Farklı kategori isimleri ve ifadelerle kategori eşleştirmesini test eder

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3001/api"

# Token
ACCESS_TOKEN=""

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    KATEGORİ EŞLEŞTİRME TESTLERİ                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# 1. Kullanıcı oluştur ve token al
# ============================================================================

echo -e "${CYAN}📋 1. Kullanıcı Oluşturma${NC}"
timestamp=$(date +%Y%m%d%H%M%S)
register_data="{\"email\":\"category_test_${timestamp}@test.com\",\"password\":\"Test123!\",\"confirmPassword\":\"Test123!\",\"name\":\"Category Test User\"}"

register_response=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$register_data")

ACCESS_TOKEN=$(echo "$register_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Token alınamadı!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Kullanıcı oluşturuldu ve token alındı${NC}"
echo ""

# ============================================================================
# 2. Test Kategorileri Oluştur
# ============================================================================

echo -e "${CYAN}📋 2. Test Kategorileri Oluşturuluyor${NC}"

create_category() {
    local name=$1
    local type=$2
    local icon=$3
    local color=$4
    
    response=$(curl -s -X POST "$BASE_URL/categories" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "{\"name\":\"$name\",\"type\":\"$type\",\"icon\":\"$icon\",\"color\":\"$color\"}")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}  ✅ $name ($type)${NC}"
        return 0
    else
        echo -e "${RED}  ❌ $name - Oluşturulamadı${NC}"
        return 1
    fi
}

# Gider kategorileri
create_category "Market" "expense" "🛒" "#FF5733"
create_category "Yemek" "expense" "🍔" "#FF5722"
create_category "TestA" "expense" "🔤" "#FF0000"
create_category "Petrol" "expense" "⛽" "#000000"
create_category "Kira" "expense" "🏠" "#9C27B0"
create_category "Ulaşım" "expense" "🚗" "#2196F3"
create_category "Eğlence" "expense" "🎮" "#FF9800"
create_category "Sağlık" "expense" "🏥" "#4CAF50"
create_category "A" "expense" "🔤" "#FF0000" || echo -e "${YELLOW}  ⚠️  'A' kategorisi oluşturulamadı (min 2 karakter gerekli)${NC}"

# Gelir kategorileri
create_category "Maaş" "income" "💰" "#00C853"
create_category "Yatırım" "income" "📈" "#00BCD4"
create_category "Bonus" "income" "🎁" "#FFC107"

echo ""

# ============================================================================
# 3. Sesli Transaction Testleri
# ============================================================================

echo -e "${CYAN}📋 3. Sesli Transaction Testleri${NC}"
echo ""

test_voice_transaction() {
    local text=$1
    local expected_category=$2
    local description=$3
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Test: $description${NC}"
    echo -e "${BLUE}Text:${NC} \"$text\""
    echo -e "${BLUE}Beklenen Kategori:${NC} $expected_category"
    echo ""
    
    voice_data="{\"text\":\"$text\"}"
    
    response=$(curl -s -X POST "$BASE_URL/transactions/voice" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "$voice_data")
    
    # Başarı kontrolü
    success=$(echo "$response" | grep -o '"success":true' > /dev/null && echo "true" || echo "false")
    category_found=$(echo "$response" | grep -o '"category_found":[^,}]*' | cut -d':' -f2 | tr -d ' ')
    actual_category=$(echo "$response" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    amount=$(echo "$response" | grep -o '"amount":[0-9.]*' | cut -d':' -f2)
    
    if [ "$success" = "true" ]; then
        if [ "$category_found" = "true" ] && [ "$actual_category" = "$expected_category" ]; then
            echo -e "${GREEN}✅ BAŞARILI!${NC}"
            echo -e "${GREEN}   📊 Kategori: $actual_category${NC}"
            echo -e "${GREEN}   💰 Tutar: $amount${NC}"
            echo -e "${GREEN}   ✅ Kategori bulundu: $category_found${NC}"
            return 0
        elif [ "$category_found" = "false" ]; then
            echo -e "${YELLOW}⚠️  Kategori bulunamadı (default kullanıldı: $actual_category)${NC}"
            echo -e "${YELLOW}   Beklenen: $expected_category${NC}"
            return 1
        else
            echo -e "${RED}❌ BAŞARISIZ!${NC}"
            echo -e "${RED}   Beklenen: $expected_category${NC}"
            echo -e "${RED}   Bulunan: $actual_category${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ İşlem başarısız!${NC}"
        error_message=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        if [ ! -z "$error_message" ]; then
            echo -e "${RED}   Hata: $error_message${NC}"
        fi
        return 1
    fi
    
    echo ""
}

# Test senaryoları
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test 1: Standart kategori - Market
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "500 tl Market alışverişi yaptım" "Market" "Standart Kategori - Market Alışverişi"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 2: Standart kategori - Yemek
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "250 lira Yemek için harcama yaptım" "Yemek" "Standart Kategori - Yemek"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 3: Özel kategori - TestA
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "300 tl TestA harcaması yaptım" "TestA" "Özel Kategori - TestA"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 4: Özel kategori - Petrol
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "500 lira Petrol için ödeme yaptım" "Petrol" "Özel Kategori - Petrol"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 5: Özel kategori - Kira
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "2000 tl Kira ödemesi yaptım" "Kira" "Özel Kategori - Kira"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 6: Ulaşım
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "100 lira Ulaşım gideri yaptım" "Ulaşım" "Ulaşım Kategorisi"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 7: Eğlence
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "150 tl Eğlence için harcama yaptım" "Eğlence" "Eğlence Kategorisi"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 8: Sağlık
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "400 lira Sağlık gideri yaptım" "Sağlık" "Sağlık Kategorisi"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 9: Gelir - Maaş
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "5000 lira Maaş aldım" "Maaş" "Gelir Kategorisi - Maaş"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 10: Gelir - Yatırım
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "1000 lira Yatırım geliri kazandım" "Yatırım" "Gelir Kategorisi - Yatırım"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 11: Gelir - Bonus
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "500 lira Bonus aldım" "Bonus" "Gelir Kategorisi - Bonus"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 12: Karmaşık ifade - Market
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "dün 600 lira Market alışverişi yaptım" "Market" "Karmaşık İfade - Market (tarih ile)"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# Test 13: Farklı ekler - Petrol
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if test_voice_transaction "800 tl Petrol gideri yaptım" "Petrol" "Farklı Ekler - Petrol Gideri"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# ============================================================================
# TEST SONUÇLARI
# ============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                         TEST SONUÇLARI ÖZETİ                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Başarı oranı hesapla
if command -v bc &> /dev/null; then
    pass_rate=$(echo "scale=2; ($PASSED_TESTS/$TOTAL_TESTS)*100" | bc)
else
    pass_rate=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
fi

echo -e "${BLUE}📊 Toplam Test:${NC} $TOTAL_TESTS"
echo -e "${GREEN}✅ Başarılı:${NC} $PASSED_TESTS"
echo -e "${RED}❌ Başarısız:${NC} $FAILED_TESTS"

# Başarı oranına göre renk seç
if command -v bc &> /dev/null; then
    if (( $(echo "$pass_rate >= 90" | bc -l) )); then
        color=$GREEN
    elif (( $(echo "$pass_rate >= 70" | bc -l) )); then
        color=$YELLOW
    else
        color=$RED
    fi
else
    pass_rate_num=$(echo "$pass_rate" | awk '{print int($1)}')
    if [ "$pass_rate_num" -ge 90 ]; then
        color=$GREEN
    elif [ "$pass_rate_num" -ge 70 ]; then
        color=$YELLOW
    else
        color=$RED
    fi
fi

echo -e "${color}📈 Başarı Oranı: $pass_rate%${NC}"
echo ""
echo -e "${CYAN}🎉 Test suite tamamlandı!${NC}"
echo ""

