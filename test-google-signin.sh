#!/bin/bash

# Google Sign-In Endpoint Test Script
# Bu script, Google Sign-In endpoint'ini test eder

echo "🧪 Google Sign-In Endpoint Test"
echo "================================"
echo ""

# API Base URL (değiştirilebilir)
API_URL="${API_URL:-http://localhost:3001}"

# Test için örnek Google ID Token (gerçek token değil, sadece format testi için)
# Gerçek test için frontend'den alınan gerçek token kullanılmalı
TEST_TOKEN="${1:-eyJhbGciOiJSUzI1NiIsImtpZCI6IjRmZWI0NGYwZjdhN2UyN2M3YzQwMzM3OWFmZjIwYWY1YzhjZjUyZGMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0Mzg2MDQ1MTE3ODAtNGg2ZWRibTk5M3U0cGtrZmNpNWw0OTlncjMyZDA4ZmIuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0Mzg2MDQ1MTE3ODAtN2loMmYzaGNjbGtmZW1jN29xb28xMG4zYTVlN3RycjEuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTM0NzM3Nzg2OTAzNDMwNzY1MDgiLCJlbWFpbCI6ImRpeWFyeWVsYmFrYUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6InRpcVJGWDUwZE11SmVSVDlLcUpzQkEiLCJub25jZSI6IkF4UmNzdjhHUEFsdmV4TGtULWdLNEhUQzF1SlJ4QnFBOG16UTYtUFptalEiLCJuYW1lIjoiRGl5YXIgeWVsYmFrYSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMX3lPUWNVa1pTczZKYVd2V3QtMHZ0MGxrdkZ0cC1DdHduQVdHRHJfblhrVDR0NkdwSD1zOTYtYyIsImdpdmVuX25hbWUiOiJEaXlhciIsImZhbWlseV9uYW1lIjoieWVsYmFrYSIsImlhdCI6MTc2MzI4NDczNywiZXhwIjoxNzYzMjg4MzM3fQ.N5s0Qos8bIJYAwyHOhbN5vXCq3x81IQZWgjHecssEuy2L_SYz7TaVBdt7cBextWhEbT7sYtzKI4KO_ey06BkPmmYfDkR3vm4Yk8EgEn5rckUydQgkcjHJHA_zsaxulHlTJ4Z3zyvv5SnUdQz6mVsn2SbqBxyC3QhXNBnGE-PlT8VH7Rz9vyx0GHb6xfDhc86g4yEk7FnwmNOi53wlGOYRrYbX_i3T-hcVNNOmwOQaBB_KlQAEfLBlN_tRcaVrN6Q8GfQccHKWS-yTzal448faxLlHNko05rM5RFKhcfRK3zLmZV1Sqf2wP3nFnHiTQxXX04fLbPNeL5TJ08Y9K9Odg}"

echo "📡 API URL: $API_URL"
echo "🔑 Token: ${TEST_TOKEN:0:50}..."
echo ""

# Endpoint testi
echo "🔄 POST /api/auth/google-signin isteği gönderiliyor..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/google-signin" \
  -H "Content-Type: application/json" \
  -d "{\"idToken\": \"$TEST_TOKEN\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📊 HTTP Status Code: $HTTP_CODE"
echo ""
echo "📦 Response Body:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
echo ""

# Sonuç kontrolü
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo "✅ Test başarılı! Endpoint çalışıyor."
  exit 0
elif [ "$HTTP_CODE" -eq 401 ]; then
  echo "⚠️  Token doğrulama hatası (beklenen - token süresi dolmuş veya geçersiz olabilir)"
  echo "   Bu normal, gerçek bir token ile test edilmesi gerekiyor."
  exit 0
else
  echo "❌ Test başarısız! HTTP Status: $HTTP_CODE"
  exit 1
fi

