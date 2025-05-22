#!/bin/bash

# Test script for SplitReceipt API integrations

API_KEY="gAAAAABoLUv0nscRwEHh52j4UBq5raY-iqtzaQ_N5-3dUlTuIUFTXWPZ_wezWrPfUqqtqVOTs1aGwr_q4v7vUO4c1uemDU47db6XEAKFODe4nbBoJazK4VE="
API_URL="https://api.gibsonai.com/"
OPENAPI_URL="https://api.gibsonai.com/-/openapi/b25nmnXIjGxhi"

echo "Testing API connectivity..."

# Test the OpenAPI spec
echo "Testing OpenAPI spec..."
curl -s -H "X-Gibson-API-Key: $API_KEY" $OPENAPI_URL

# Test endpoint for authentication
echo -e "\n\nTesting authentication endpoints..."
curl -s -H "X-Gibson-API-Key: $API_KEY" "${API_URL}v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser1", "email": "test1@example.com", "password": "password123"}'

echo -e "\n\nRegister test user 2..."
curl -s -H "X-Gibson-API-Key: $API_KEY" "${API_URL}v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser2", "email": "test2@example.com", "password": "password123"}'

# Try logging in
echo -e "\n\nTesting login..."
TOKEN=$(curl -s -H "X-Gibson-API-Key: $API_KEY" "${API_URL}v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test1@example.com", "password": "password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

if [ -n "$TOKEN" ]; then
  echo "Login successful, token obtained."
  
  # Test trip creation
  echo -e "\n\nCreating test trip..."
  TRIP_RESPONSE=$(curl -s -H "X-Gibson-API-Key: $API_KEY" -H "Authorization: Bearer $TOKEN" \
    "${API_URL}v1/trip" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test Vacation", "description": "API test trip", "start_date": "2025-05-20", "end_date": "2025-05-25"}')
  
  echo "Trip Response: $TRIP_RESPONSE"
  
  # Extract trip ID from response
  TRIP_ID=$(echo $TRIP_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  
  if [ -n "$TRIP_ID" ]; then
    echo "Trip created successfully with ID: $TRIP_ID"
    
    # Test adding a receipt
    echo -e "\n\nAdding test receipt..."
    RECEIPT_RESPONSE=$(curl -s -H "X-Gibson-API-Key: $API_KEY" -H "Authorization: Bearer $TOKEN" \
      "${API_URL}v1/receipt" \
      -H "Content-Type: application/json" \
      -d "{\"trip_id\": $TRIP_ID, \"payer_id\": 1, \"title\": \"Dinner\", \"date\": \"2025-05-21\", \"total_amount\": 75.50, \"merchant\": \"Restaurant\", \"split_type\": \"full\"}")
    
    echo "Receipt Response: $RECEIPT_RESPONSE"
    
    # Extract receipt ID
    RECEIPT_ID=$(echo $RECEIPT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    
    if [ -n "$RECEIPT_ID" ]; then
      echo "Receipt created successfully with ID: $RECEIPT_ID"
      
      # Test adding a line item
      echo -e "\n\nAdding line item to receipt..."
      curl -s -H "X-Gibson-API-Key: $API_KEY" -H "Authorization: Bearer $TOKEN" \
        "${API_URL}v1/receipt-line-item" \
        -H "Content-Type: application/json" \
        -d "{\"receipt_id\": $RECEIPT_ID, \"description\": \"Main Course\", \"amount\": 45.50, \"quantity\": 2}"
    else
      echo "Failed to create receipt"
    fi
  else
    echo "Failed to create trip"
  fi
else
  echo "Login failed, no token received"
fi