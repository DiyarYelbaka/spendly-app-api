#!/bin/bash

# ============================================================================
# SPENDLY API - KAPSAMLI TEST SUITE
# ============================================================================
# Bu script tüm API endpoint'lerini profesyonel bir şekilde test eder
# Kullanım: bash test-api.sh veya ./test-api.sh
# ============================================================================

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3001/api"

# Test sonuçları
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
ERRORS=()

# Token ve ID'ler
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
USER_EMAIL=""
CATEGORY_ID=""
INCOME_CATEGORY_ID=""
EXPENSE_CATEGORY_ID=""
NEW_CATEGORY_ID=""
EXPENSE_TRANSACTION_ID=""
INCOME_TRANSACTION_ID=""
USER2_TOKEN=""
USER2_CATEGORY_ID=""

# ============================================================================
# Yardımcı Fonksiyonlar
# ============================================================================

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${CYAN}TEST #${TOTAL_TESTS}: $1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}Method:${NC} $2"
    echo -e "${BLUE}URL:${NC} $BASE_URL$3"
    if [ ! -z "$4" ]; then
        echo -e "${BLUE}Body:${NC} $4"
    fi
}

test_endpoint() {
    local method=$1
    local endpoint=$2
    local body=$3
    local expected_status=$4
    local description=$5
    local auth_header=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    print_header "$description" "$method" "$endpoint" "$body"
    
    # Headers
    local headers=(-H "Content-Type: application/json")
    if [ ! -z "$auth_header" ]; then
        headers+=(-H "Authorization: Bearer $auth_header")
    fi
    
    # Request
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" "${headers[@]}" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" "${headers[@]}" -d "$body" 2>/dev/null)
    fi
    
    # Parse response
    http_code=$(echo "$response" | tail -n1)
    body_response=$(echo "$response" | sed '$d' | tr -d '\r')
    
    # Check status code
    if [ "$http_code" = "$expected_status" ]; then
        if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
            # Check success field
            success=$(echo "$body_response" | grep -o '"success":[^,]*' | cut -d':' -f2 | tr -d ' ')
            if [ "$success" = "true" ]; then
                echo -e "${GREEN}✅ Status: $http_code (Expected: $expected_status)${NC}"
                echo -e "${GREEN}✅ Success: true${NC}"
                message=$(echo "$body_response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
                if [ ! -z "$message" ]; then
                    echo -e "${GREEN}✅ Message: $message${NC}"
                fi
                PASSED_TESTS=$((PASSED_TESTS + 1))
                echo "$body_response"
                return 0
            else
                echo -e "${RED}❌ FAILED: Response success is false${NC}"
                echo -e "${RED}   Response: $body_response${NC}"
                FAILED_TESTS=$((FAILED_TESTS + 1))
                ERRORS+=("TEST #$TOTAL_TESTS: $description - Response success is false")
                return 1
            fi
        else
            # Error status as expected
            echo -e "${YELLOW}✅ Status: $http_code (Expected: $expected_status) - Error as expected${NC}"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        fi
    else
        echo -e "${RED}❌ FAILED: Status $http_code (Expected: $expected_status)${NC}"
        echo -e "${RED}   Response: $body_response${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        ERRORS+=("TEST #$TOTAL_TESTS: $description - Status $http_code (Expected: $expected_status)")
        return 1
    fi
}

# ============================================================================
# BAŞLIK
# ============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                    SPENDLY API - KAPSAMLI TEST SUITE                       ║"
echo "║                         Profesyonel API Testleri                            ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# 1. HEALTH CHECK
# ============================================================================

echo -e "${MAGENTA}📋 BÖLÜM 1: HEALTH CHECK${NC}"
health_response=$(test_endpoint "GET" "/health" "" "200" "Health Check Endpoint" "")

# ============================================================================
# 2. AUTH MODÜLÜ TESTLERİ
# ============================================================================

echo -e "\n${MAGENTA}📋 BÖLÜM 2: AUTH MODÜLÜ TESTLERİ${NC}"

# 2.1. Register
timestamp=$(date +%Y%m%d%H%M%S)
register_data="{\"email\":\"test_${timestamp}@test.com\",\"password\":\"Test123!\",\"confirmPassword\":\"Test123!\",\"name\":\"Test User\"}"
register_response=$(test_endpoint "POST" "/auth/register" "$register_data" "201" "Register - Yeni kullanıcı kaydı" "")

if [ $? -eq 0 ]; then
    ACCESS_TOKEN=$(echo "$register_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$register_response" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
    USER_ID=$(echo "$register_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    USER_EMAIL="test_${timestamp}@test.com"
    
    echo -e "${GREEN}✅ Register başarılı!${NC}"
    echo -e "${BLUE}   User ID: $USER_ID${NC}"
    echo -e "${BLUE}   Email: $USER_EMAIL${NC}"
    echo -e "${BLUE}   Access Token alındı: ${ACCESS_TOKEN:0:30}...${NC}"
else
    echo -e "${RED}❌ Register başarısız! Testler durduruluyor.${NC}"
    exit 1
fi

# 2.2. Register - Duplicate Email
test_endpoint "POST" "/auth/register" "$register_data" "409" "Register - Duplicate email - 409 expected" ""

# 2.3. Register - Validation Error
invalid_register_data="{\"email\":\"invalid-email\",\"password\":\"123\",\"confirmPassword\":\"456\",\"name\":\"A\"}"
test_endpoint "POST" "/auth/register" "$invalid_register_data" "400" "Register - Validation error - 400 expected" ""

# 2.4. Login
login_data="{\"email\":\"$USER_EMAIL\",\"password\":\"Test123!\"}"
login_response=$(test_endpoint "POST" "/auth/login" "$login_data" "200" "Login - Kullanıcı girişi" "")

if [ $? -eq 0 ]; then
    ACCESS_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$login_response" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login başarılı! Token güncellendi.${NC}"
fi

# 2.5. Login - Invalid Credentials
wrong_login_data="{\"email\":\"$USER_EMAIL\",\"password\":\"WrongPassword123!\"}"
test_endpoint "POST" "/auth/login" "$wrong_login_data" "401" "Login - Invalid credentials - 401 expected" ""

# 2.6. Get Profile (Me)
me_response=$(test_endpoint "GET" "/auth/me" "" "200" "Get Profile - Me endpoint" "$ACCESS_TOKEN")

# 2.7. Get Profile - Unauthorized
test_endpoint "GET" "/auth/me" "" "401" "Get Profile - Unauthorized - 401 expected" ""

# 2.8. Refresh Token
refresh_data="{\"refreshToken\":\"$REFRESH_TOKEN\"}"
refresh_response=$(test_endpoint "POST" "/auth/refresh" "$refresh_data" "200" "Refresh Token - Token yenileme" "")

if [ $? -eq 0 ]; then
    NEW_ACCESS_TOKEN=$(echo "$refresh_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$NEW_ACCESS_TOKEN" ]; then
        ACCESS_TOKEN=$NEW_ACCESS_TOKEN
        echo -e "${GREEN}✅ Refresh token başarılı! Yeni token alındı.${NC}"
    fi
fi

# 2.9. Logout
test_endpoint "POST" "/auth/logout" "$refresh_data" "201" "Logout - Kullanıcı çıkışı" ""

# ============================================================================
# 3. CATEGORIES MODÜLÜ TESTLERİ
# ============================================================================

echo -e "\n${MAGENTA}📋 BÖLÜM 3: CATEGORIES MODÜLÜ TESTLERİ${NC}"

# 3.1. Get All Categories
categories_response=$(test_endpoint "GET" "/categories" "" "200" "Get All Categories - Tüm kategorileri listele" "$ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    # Extract category IDs (expense ve income kategorilerini ayır)
    # jq kullan (eğer varsa)
    if command -v jq &> /dev/null; then
        EXPENSE_CATEGORY_ID=$(echo "$categories_response" | jq -r '.data.categories[] | select(.type=="expense") | .id' | head -1)
        INCOME_CATEGORY_ID=$(echo "$categories_response" | jq -r '.data.categories[] | select(.type=="income") | .id' | head -1)
    else
        # jq yoksa grep ile parse et
        # Expense kategorilerini bul
        EXPENSE_CATEGORY_ID=$(echo "$categories_response" | grep -oE '"type":"expense"[^}]*"id":"[a-f0-9-]{36}"' | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
        # Income kategorilerini bul
        INCOME_CATEGORY_ID=$(echo "$categories_response" | grep -oE '"type":"income"[^}]*"id":"[a-f0-9-]{36}"' | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
    fi
    category_count=$(echo "$categories_response" | grep -o '"categories":\[' | wc -l)
    echo -e "${GREEN}✅ Kategoriler bulundu (default kategoriler dahil)${NC}"
    if [ ! -z "$EXPENSE_CATEGORY_ID" ]; then
        echo -e "${BLUE}   Test için expense kategori seçildi: $EXPENSE_CATEGORY_ID${NC}"
    fi
    if [ ! -z "$INCOME_CATEGORY_ID" ]; then
        echo -e "${BLUE}   Test için income kategori seçildi: $INCOME_CATEGORY_ID${NC}"
    fi
fi

# 3.2. Create Category
timestamp=$(date +%H%M%S)
new_category_data="{\"name\":\"Test Kategori $timestamp\",\"type\":\"expense\",\"icon\":\"🧪\",\"color\":\"#FF0000\",\"description\":\"Test kategorisi\",\"sort_order\":100}"
create_category_response=$(test_endpoint "POST" "/categories" "$new_category_data" "201" "Create Category - Yeni kategori oluştur" "$ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    NEW_CATEGORY_ID=$(echo "$create_category_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Yeni kategori oluşturuldu: $NEW_CATEGORY_ID${NC}"
fi

# 3.3. Create Category - Duplicate Name
test_endpoint "POST" "/categories" "$new_category_data" "409" "Create Category - Duplicate name - 409 expected" "$ACCESS_TOKEN"

# 3.4. Create Category - Validation Error
invalid_category_data="{\"name\":\"A\",\"type\":\"invalid\"}"
test_endpoint "POST" "/categories" "$invalid_category_data" "400" "Create Category - Validation error - 400 expected" "$ACCESS_TOKEN"

# 3.5. Get Category By ID
if [ ! -z "$NEW_CATEGORY_ID" ]; then
    test_endpoint "GET" "/categories/$NEW_CATEGORY_ID" "" "200" "Get Category By ID - Tek kategori getir" "$ACCESS_TOKEN"
fi

# 3.6. Get Category - Not Found
test_endpoint "GET" "/categories/00000000-0000-0000-0000-000000000000" "" "404" "Get Category - Not found - 404 expected" "$ACCESS_TOKEN"

# 3.7. Update Category
if [ ! -z "$NEW_CATEGORY_ID" ]; then
    # Önce kategoriyi kontrol et (silinmiş olabilir)
    check_category=$(test_endpoint "GET" "/categories/$NEW_CATEGORY_ID" "" "200" "Check Category Before Update" "$ACCESS_TOKEN" 2>/dev/null)
    if [ $? -eq 0 ]; then
        update_category_data="{\"name\":\"Updated Test Category\",\"icon\":\"🎯\",\"color\":\"#00FF00\",\"description\":\"Updated description\"}"
        test_endpoint "PUT" "/categories/$NEW_CATEGORY_ID" "$update_category_data" "200" "Update Category - Kategori güncelle" "$ACCESS_TOKEN"
    else
        echo -e "${YELLOW}⚠️  Kategori bulunamadı, update test atlandı${NC}"
    fi
fi

# 3.8. Get Categories with Filters
test_endpoint "GET" "/categories?type=expense" "" "200" "Get Categories - Expense kategorileri filtrele" "$ACCESS_TOKEN"
test_endpoint "GET" "/categories?type=income" "" "200" "Get Categories - Income kategorileri filtrele" "$ACCESS_TOKEN"
test_endpoint "GET" "/categories?include_defaults=false" "" "200" "Get Categories - Default kategoriler hariç" "$ACCESS_TOKEN"

# 3.9. Delete Category
if [ ! -z "$NEW_CATEGORY_ID" ]; then
    test_endpoint "DELETE" "/categories/$NEW_CATEGORY_ID" "" "200" "Delete Category - Kategori sil" "$ACCESS_TOKEN"
fi

# ============================================================================
# 4. TRANSACTIONS MODÜLÜ TESTLERİ
# ============================================================================

echo -e "\n${MAGENTA}📋 BÖLÜM 4: TRANSACTIONS MODÜLÜ TESTLERİ${NC}"

# Expense ve Income kategorilerini al
if [ -z "$EXPENSE_CATEGORY_ID" ] || [ -z "$INCOME_CATEGORY_ID" ]; then
    categories_list=$(test_endpoint "GET" "/categories?type=expense" "" "200" "Get Categories - Expense kategorileri (transaction için)" "$ACCESS_TOKEN")
    if [ $? -eq 0 ]; then
        EXPENSE_CATEGORY_ID=$(echo "$categories_list" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    
    income_categories_list=$(test_endpoint "GET" "/categories?type=income" "" "200" "Get Categories - Income kategorileri (transaction için)" "$ACCESS_TOKEN")
    if [ $? -eq 0 ]; then
        INCOME_CATEGORY_ID=$(echo "$income_categories_list" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
fi

# 4.1. Create Expense Transaction
today=$(date +%Y-%m-%d)
expense_transaction_data="{\"amount\":150.50,\"description\":\"Test gider işlemi\",\"category_id\":\"$EXPENSE_CATEGORY_ID\",\"date\":\"$today\",\"notes\":\"Test notları\"}"
expense_transaction_response=$(test_endpoint "POST" "/transactions/expense" "$expense_transaction_data" "201" "Create Expense Transaction - Gider işlemi oluştur" "$ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    # Response'dan transaction ID'yi al (data.id - en üst seviyedeki id)
    # JSON format: {"success":true,"data":{"id":"...","amount":...}}
    if command -v jq &> /dev/null; then
        EXPENSE_TRANSACTION_ID=$(echo "$expense_transaction_response" | jq -r '.data.id' 2>/dev/null)
    else
        # jq yoksa grep ile parse et
        # Önce data.id'yi bul (data objesi içindeki ilk id)
        EXPENSE_TRANSACTION_ID=$(echo "$expense_transaction_response" | grep -oE '"data":\{[^}]*"id":"[a-f0-9-]{36}"' | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
        if [ -z "$EXPENSE_TRANSACTION_ID" ]; then
            # Son çare: tüm UUID'leri bul ve ilkini al
            EXPENSE_TRANSACTION_ID=$(echo "$expense_transaction_response" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
        fi
    fi
    echo -e "${GREEN}✅ Expense transaction oluşturuldu: $EXPENSE_TRANSACTION_ID${NC}"
fi

# 4.2. Create Income Transaction
if [ ! -z "$INCOME_CATEGORY_ID" ]; then
    income_transaction_data="{\"amount\":5000.00,\"description\":\"Test gelir işlemi\",\"category_id\":\"$INCOME_CATEGORY_ID\",\"date\":\"$today\",\"notes\":\"Maaş ödemesi\"}"
    income_transaction_response=$(test_endpoint "POST" "/transactions/income" "$income_transaction_data" "201" "Create Income Transaction - Gelir işlemi oluştur" "$ACCESS_TOKEN")
    
    if [ $? -eq 0 ]; then
        # Response'dan transaction ID'yi al (data.id)
        if command -v jq &> /dev/null; then
            INCOME_TRANSACTION_ID=$(echo "$income_transaction_response" | jq -r '.data.id' 2>/dev/null)
        else
            # jq yoksa grep ile parse et
            INCOME_TRANSACTION_ID=$(echo "$income_transaction_response" | grep -oE '"data":\{[^}]*"id":"[a-f0-9-]{36}"' | grep -oE '"id":"[a-f0-9-]{36}"' | head -1 | cut -d'"' -f4)
            if [ -z "$INCOME_TRANSACTION_ID" ]; then
                # Son çare: tüm UUID'leri bul ve ilkini al
                INCOME_TRANSACTION_ID=$(echo "$income_transaction_response" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
            fi
        fi
        echo -e "${GREEN}✅ Income transaction oluşturuldu: $INCOME_TRANSACTION_ID${NC}"
    fi
fi

# 4.3. Create Transaction - Invalid Category Type
if [ ! -z "$EXPENSE_CATEGORY_ID" ]; then
    invalid_type_data="{\"amount\":100,\"description\":\"Test\",\"category_id\":\"$EXPENSE_CATEGORY_ID\"}"
    test_endpoint "POST" "/transactions/income" "$invalid_type_data" "400" "Create Transaction - Invalid category type - 400 expected" "$ACCESS_TOKEN"
fi

# 4.4. Create Transaction - Validation Error
invalid_transaction_data="{\"amount\":-100,\"description\":\"\",\"category_id\":\"invalid-uuid\"}"
test_endpoint "POST" "/transactions/expense" "$invalid_transaction_data" "400" "Create Transaction - Validation error - 400 expected" "$ACCESS_TOKEN"

# 4.5. Get All Transactions
transactions_response=$(test_endpoint "GET" "/transactions" "" "200" "Get All Transactions - Tüm işlemleri listele" "$ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    transaction_count=$(echo "$transactions_response" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ $transaction_count transaction bulundu${NC}"
fi

# 4.6. Get Transactions with Filters
test_endpoint "GET" "/transactions?type=expense" "" "200" "Get Transactions - Expense filtrele" "$ACCESS_TOKEN"
test_endpoint "GET" "/transactions?type=income" "" "200" "Get Transactions - Income filtrele" "$ACCESS_TOKEN"
if [ ! -z "$EXPENSE_CATEGORY_ID" ]; then
    test_endpoint "GET" "/transactions?category_id=$EXPENSE_CATEGORY_ID" "" "200" "Get Transactions - Category filtrele" "$ACCESS_TOKEN"
fi

# 4.7. Get Transaction By ID
if [ ! -z "$EXPENSE_TRANSACTION_ID" ]; then
    test_endpoint "GET" "/transactions/$EXPENSE_TRANSACTION_ID" "" "200" "Get Transaction By ID - Tek işlem getir" "$ACCESS_TOKEN"
fi

# 4.8. Get Transaction - Not Found
test_endpoint "GET" "/transactions/00000000-0000-0000-0000-000000000000" "" "404" "Get Transaction - Not found - 404 expected" "$ACCESS_TOKEN"

# 4.9. Update Transaction
if [ ! -z "$EXPENSE_TRANSACTION_ID" ]; then
    update_transaction_data="{\"amount\":200.00,\"description\":\"Güncellenmiş gider açıklaması\",\"notes\":\"Güncellenmiş notlar\"}"
    test_endpoint "PUT" "/transactions/$EXPENSE_TRANSACTION_ID" "$update_transaction_data" "200" "Update Transaction - İşlem güncelle" "$ACCESS_TOKEN"
fi

# 4.10. Delete Transaction
if [ ! -z "$EXPENSE_TRANSACTION_ID" ]; then
    test_endpoint "DELETE" "/transactions/$EXPENSE_TRANSACTION_ID" "" "200" "Delete Transaction - İşlem sil" "$ACCESS_TOKEN"
fi

# ============================================================================
# 5. ANALYTICS MODÜLÜ TESTLERİ
# ============================================================================

echo -e "\n${MAGENTA}📋 BÖLÜM 5: ANALYTICS MODÜLÜ TESTLERİ${NC}"

# 5.1. Get Dashboard Data
dashboard_response=$(test_endpoint "GET" "/analytics/dashboard" "" "200" "Get Dashboard Data - Dashboard verileri" "$ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dashboard verileri alındı:${NC}"
    total_income=$(echo "$dashboard_response" | grep -o '"total_income":[0-9.]*' | cut -d':' -f2)
    total_expense=$(echo "$dashboard_response" | grep -o '"total_expense":[0-9.]*' | cut -d':' -f2)
    net_balance=$(echo "$dashboard_response" | grep -o '"net_balance":[0-9.-]*' | cut -d':' -f2)
    if [ ! -z "$total_income" ]; then
        echo -e "${BLUE}   Total Income: $total_income${NC}"
    fi
    if [ ! -z "$total_expense" ]; then
        echo -e "${BLUE}   Total Expense: $total_expense${NC}"
    fi
    if [ ! -z "$net_balance" ]; then
        echo -e "${BLUE}   Net Balance: $net_balance${NC}"
    fi
fi

# 5.2. Get Summary Data
summary_response=$(test_endpoint "GET" "/analytics/summary" "" "200" "Get Summary Data - Finansal özet" "$ACCESS_TOKEN")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Summary verileri alındı:${NC}"
    current_balance=$(echo "$summary_response" | grep -o '"current_balance":[0-9.-]*' | cut -d':' -f2)
    monthly_income=$(echo "$summary_response" | grep -o '"monthly_income":[0-9.]*' | cut -d':' -f2)
    monthly_expense=$(echo "$summary_response" | grep -o '"monthly_expense":[0-9.]*' | cut -d':' -f2)
    savings_rate=$(echo "$summary_response" | grep -o '"savings_rate":[0-9.-]*' | cut -d':' -f2)
    if [ ! -z "$current_balance" ]; then
        echo -e "${BLUE}   Current Balance: $current_balance${NC}"
    fi
    if [ ! -z "$monthly_income" ]; then
        echo -e "${BLUE}   Monthly Income: $monthly_income${NC}"
    fi
    if [ ! -z "$monthly_expense" ]; then
        echo -e "${BLUE}   Monthly Expense: $monthly_expense${NC}"
    fi
    if [ ! -z "$savings_rate" ]; then
        echo -e "${BLUE}   Savings Rate: $savings_rate%${NC}"
    fi
fi

# 5.3. Analytics - Unauthorized
test_endpoint "GET" "/analytics/dashboard" "" "401" "Analytics - Unauthorized - 401 expected" ""

# ============================================================================
# 6. SECURITY TESTLERİ (User Isolation)
# ============================================================================

echo -e "\n${MAGENTA}📋 BÖLÜM 6: SECURITY TESTLERİ (User Isolation)${NC}"

# 6.1. İkinci bir kullanıcı oluştur
timestamp2=$(date +%Y%m%d%H%M%S)
user2_register_data="{\"email\":\"test2_${timestamp2}@test.com\",\"password\":\"Test123!\",\"confirmPassword\":\"Test123!\",\"name\":\"Test User 2\"}"
user2_register_response=$(test_endpoint "POST" "/auth/register" "$user2_register_data" "201" "Register User 2 - İkinci kullanıcı kaydı" "")

if [ $? -eq 0 ]; then
    USER2_TOKEN=$(echo "$user2_register_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ User 2 oluşturuldu ve token alındı${NC}"
fi

# 6.2. User 1'in kategorilerini User 2 göremez
user1_categories=$(test_endpoint "GET" "/categories" "" "200" "Get User 1 Categories" "$ACCESS_TOKEN")
if [ $? -eq 0 ]; then
    USER2_CATEGORY_ID=$(echo "$user1_categories" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

# User 2, User 1'in kategorisini göremez
if [ ! -z "$USER2_CATEGORY_ID" ] && [ ! -z "$USER2_TOKEN" ]; then
    test_endpoint "GET" "/categories/$USER2_CATEGORY_ID" "" "404" "User Isolation - User 2 cannot see User 1 category - 404 expected" "$USER2_TOKEN"
fi

# ============================================================================
# TEST SONUÇLARI
# ============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                         TEST SONUÇLARI ÖZETİ                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Başarı oranı hesapla (bc yoksa awk kullan)
if command -v bc &> /dev/null; then
    pass_rate=$(echo "scale=2; ($PASSED_TESTS/$TOTAL_TESTS)*100" | bc)
else
    # bc yoksa awk kullan
    pass_rate=$(awk "BEGIN {printf \"%.2f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
fi

echo -e "${BLUE}📊 Toplam Test:${NC} $TOTAL_TESTS"
echo -e "${GREEN}✅ Başarılı:${NC} $PASSED_TESTS"
echo -e "${RED}❌ Başarısız:${NC} $FAILED_TESTS"

# Başarı oranına göre renk seç (bc yoksa awk ile karşılaştır)
if command -v bc &> /dev/null; then
    if (( $(echo "$pass_rate >= 90" | bc -l) )); then
        color=$GREEN
    elif (( $(echo "$pass_rate >= 70" | bc -l) )); then
        color=$YELLOW
    else
        color=$RED
    fi
else
    # bc yoksa awk ile karşılaştır
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

if [ ${#ERRORS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ HATALAR:${NC}"
    for error in "${ERRORS[@]}"; do
        echo -e "${RED}   - $error${NC}"
    done
fi

echo ""
echo -e "${CYAN}🎉 Test suite tamamlandı!${NC}"
echo ""

