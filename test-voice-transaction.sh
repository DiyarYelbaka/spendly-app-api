#!/bin/bash

# ============================================================================
# SESLİ GELİR/GİDER KAYDETME ÖZELLİĞİ TEST SCRIPTİ
# ============================================================================

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
echo "║              SESLİ GELİR/GİDER KAYDETME ÖZELLİĞİ TESTLERİ                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# 1. API'nin çalışıp çalışmadığını kontrol et
# ============================================================================

echo -e "${CYAN}📋 1. API Health Check${NC}"
health_response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/health" 2>/dev/null)
http_code=$(echo "$health_response" | tail -n1)

if [ "$http_code" != "200" ]; then
    echo -e "${RED}❌ API çalışmıyor! Lütfen API'yi başlatın: yarn start:dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ API çalışıyor${NC}"
echo ""

# ============================================================================
# 2. Kullanıcı oluştur ve token al
# ============================================================================

echo -e "${CYAN}📋 2. Kullanıcı Oluşturma ve Token Alma${NC}"
timestamp=$(date +%Y%m%d%H%M%S)
register_data="{\"email\":\"voice_test_${timestamp}@test.com\",\"password\":\"Test123!\",\"confirmPassword\":\"Test123!\",\"name\":\"Voice Test User\"}"

register_response=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$register_data")

http_code=$(echo "$register_response" | grep -o '"success":true' > /dev/null && echo "200" || echo "error")

if [ "$http_code" = "error" ]; then
    echo -e "${RED}❌ Kullanıcı oluşturulamadı!${NC}"
    echo "$register_response"
    exit 1
fi

ACCESS_TOKEN=$(echo "$register_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Token alınamadı!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Kullanıcı oluşturuldu ve token alındı${NC}"
echo -e "${BLUE}   Token: ${ACCESS_TOKEN:0:30}...${NC}"
echo ""

# ============================================================================
# 3. SESLİ TRANSACTION TESTLERİ
# ============================================================================

echo -e "${CYAN}📋 3. Sesli Transaction Testleri${NC}"
echo ""

test_voice_endpoint() {
    local text=$1
    local description=$2
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Test: $description${NC}"
    echo -e "${BLUE}Text:${NC} \"$text\""
    echo ""
    
    voice_data="{\"text\":\"$text\"}"
    
    response=$(curl -s -X POST "$BASE_URL/transactions/voice" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "$voice_data")
    
    # Response'u formatla
    echo -e "${CYAN}Response:${NC}"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    
    # Başarı kontrolü
    success=$(echo "$response" | grep -o '"success":true' > /dev/null && echo "true" || echo "false")
    
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✅ Başarılı!${NC}"
        
        # Transaction bilgilerini çıkar
        if echo "$response" | grep -q '"transaction"'; then
            amount=$(echo "$response" | grep -o '"amount":[0-9.]*' | cut -d':' -f2)
            type=$(echo "$response" | grep -o '"type":"[^"]*"' | cut -d'"' -f4)
            description=$(echo "$response" | grep -o '"description":"[^"]*"' | cut -d'"' -f4)
            category_found=$(echo "$response" | grep -o '"category_found":[^,}]*' | cut -d':' -f2 | tr -d ' ')
            confidence=$(echo "$response" | grep -o '"confidence":[0-9.]*' | cut -d':' -f2)
            
            echo -e "${GREEN}   📊 İşlem Detayları:${NC}"
            echo -e "${BLUE}      - Tutar: $amount${NC}"
            echo -e "${BLUE}      - Tip: $type${NC}"
            echo -e "${BLUE}      - Açıklama: $description${NC}"
            echo -e "${BLUE}      - Kategori Bulundu: $category_found${NC}"
            if [ ! -z "$confidence" ]; then
                echo -e "${BLUE}      - Confidence: $confidence${NC}"
            fi
        fi
        
        # Needs confirmation kontrolü
        if echo "$response" | grep -q '"needsConfirmation":true'; then
            echo -e "${YELLOW}   ⚠️  Kullanıcı onayı gerekli${NC}"
        fi
    else
        echo -e "${RED}❌ Başarısız!${NC}"
        error_message=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        if [ ! -z "$error_message" ]; then
            echo -e "${RED}   Hata: $error_message${NC}"
        fi
    fi
    
    echo ""
}

# Test Senaryoları

# 3.1. Basit Gider (Kategori bulunabilir)
test_voice_endpoint "500 tl lik market alışverişi yaptım" "Basit Gider - Market Alışverişi"

# 3.2. Basit Gelir
test_voice_endpoint "3000 maaş aldım" "Basit Gelir - Maaş"

# 3.3. Karmaşık Gider
test_voice_endpoint "dün gece arkadaşımla dışarıda yemek yedik, 250 lira harcadım" "Karmaşık Gider - Yemek"

# 3.4. Kategori bulunamayan (Default kategori kullanılmalı)
test_voice_endpoint "500 tl harcadım" "Kategori Bulunamayan - Default Kategori"

# 3.5. Tarih içeren
test_voice_endpoint "bugün 1000 lira gelir kazandım" "Tarih İçeren - Bugün"

# 3.6. Belirsiz (düşük confidence)
test_voice_endpoint "bir şeyler aldım" "Belirsiz Durum - Düşük Confidence"

# 3.7. İngilizce test
test_voice_endpoint "I spent 200 dollars on groceries" "İngilizce Test - Groceries"

# 3.8. Karmaşık gelir
test_voice_endpoint "geçen hafta 5000 lira yatırım geliri kazandım" "Karmaşık Gelir - Yatırım"

# 3.9. Dolaylı ifade - Para çarptılar
test_voice_endpoint "500 tl paramı çarptılar" "Dolaylı İfade - Para Çarptılar"

# 3.10. Zorla harcatma - Restorantta ödettirdi
test_voice_endpoint "kadının biri restorantta bana 500 tl ödettirdi" "Zorla Harcatma - Restorantta Ödettirdi"

# 3.11. Kayıp ifadesi
test_voice_endpoint "dün 1000 lira kaybettim" "Kayıp İfadesi - Para Kaybettim"

# 3.12. Mizahi ifade
test_voice_endpoint "cüzdanımı boşalttı, 200 lira harcadım" "Mizahi İfade - Cüzdan Boşaldı"

# 3.13. Dolaylı gelir
test_voice_endpoint "hesabıma 3000 lira yattı" "Dolaylı Gelir - Hesaba Yattı"

echo ""
echo -e "${GREEN}🎉 Tüm testler tamamlandı!${NC}"
echo ""
