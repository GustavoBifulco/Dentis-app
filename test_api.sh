#!/bin/bash

echo "🧪 Testing API Endpoints..."
echo ""

# Test health endpoint
echo "1️⃣ Testing Health Endpoint:"
curl -s http://localhost:3001/health | jq .
echo ""

# Note: These endpoints require authentication
# We'll check if they return 401 (which means auth is working)
# or if they return data (if DISABLE_AUTH is set)

echo "2️⃣ Testing Patients Endpoint (should require auth):"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/patients)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "HTTP Code: $HTTP_CODE"
echo "Response: $BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo "3️⃣ Testing Procedures Endpoint (should require auth):"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/procedures)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "HTTP Code: $HTTP_CODE"
echo "Response: $BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo "4️⃣ Testing Inventory Endpoint (should require auth):"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/inventory)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
echo "HTTP Code: $HTTP_CODE"
echo "Response: $BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo "✅ If you see 401 errors, authentication is working correctly."
echo "   The frontend needs to send proper Bearer tokens."
echo ""
echo "🔍 Check browser console for actual errors when logged in."
