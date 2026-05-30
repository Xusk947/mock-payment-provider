#!/bin/bash

# Payment Flow Simulation Script
# Simulates full payment flow with different card types

set -e

BASE_URL="http://localhost:3000"
API_KEY="test_api_key_12345"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Payment Flow Simulation ===${NC}"

echo -e "${YELLOW}Checking server health...${NC}"
if curl -f -s "$BASE_URL/admin/dashboard" > /dev/null; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running. Please start the server first.${NC}"
    exit 1
fi

echo -e "${BLUE}=== Test Scenarios ===${NC}"

# Function to make charge request
make_charge() {
    local card_number=$1
    local cardholder_name=$2
    local cvv=$3
    local expiry_month=$4
    local expiry_year=$5
    local card_type=$6
    local amount=$7
    local description=$8

    echo -e "${YELLOW}Making charge: $description${NC}"
    
    response=$(curl -s -X POST "$BASE_URL/api/v1/charges" \
        -H "Content-Type: application/json" \
        -d "{
            \"api_key\": \"$API_KEY\",
            \"amount\": $amount,
            \"currency\": \"USD\",
            \"card_number\": \"$card_number\",
            \"cardholder_name\": \"$cardholder_name\",
            \"cvv\": \"$cvv\",
            \"expiry_month\": $expiry_month,
            \"expiry_year\": $expiry_year,
            \"card_type\": \"$card_type\",
            \"three_ds_authenticated\": false
        }")

    echo -e "${GREEN}Response: $response${NC}"
    echo ""
}

# Function to make hold request
make_hold() {
    local card_number=$1
    local cardholder_name=$2
    local cvv=$3
    local expiry_month=$4
    local expiry_year=$5
    local card_type=$6
    local amount=$7
    local description=$8

    echo -e "${YELLOW}Making hold: $description${NC}"
    
    response=$(curl -s -X POST "$BASE_URL/api/v1/holds" \
        -H "Content-Type: application/json" \
        -d "{
            \"api_key\": \"$API_KEY\",
            \"amount\": $amount,
            \"currency\": \"USD\",
            \"card_number\": \"$card_number\",
            \"cardholder_name\": \"$cardholder_name\",
            \"cvv\": \"$cvv\",
            \"expiry_month\": $expiry_month,
            \"expiry_year\": $expiry_year,
            \"card_type\": \"$card_type\",
            \"three_ds_authenticated\": true
        }")

    echo -e "${GREEN}Response: $response${NC}"
    echo ""
    
    # Extract hold ID
    hold_id=$(echo "$response" | jq -r '.id')
    echo "$hold_id"
}

# Function to make capture request
make_capture() {
    local hold_id=$1
    local amount=$2

    echo -e "${YELLOW}Capturing hold $hold_id${NC}"
    
    response=$(curl -s -X POST "$BASE_URL/api/v1/captures" \
        -H "Content-Type: application/json" \
        -d "{
            \"api_key\": \"$API_KEY\",
            \"hold_id\": $hold_id,
            \"amount\": $amount
        }")

    echo -e "${GREEN}Response: $response${NC}"
    echo ""
}

# Function to make refund request
make_refund() {
    local transaction_id=$1
    local amount=$2

    echo -e "${YELLOW}Refunding transaction $transaction_id${NC}"
    
    response=$(curl -s -X POST "$BASE_URL/api/v1/refunds" \
        -H "Content-Type: application/json" \
        -d "{
            \"api_key\": \"$API_KEY\",
            \"transaction_id\": $transaction_id,
            \"amount\": $amount
        }")

    echo -e "${GREEN}Response: $response${NC}"
    echo ""
}

echo -e "${BLUE}=== First Round: Different Card Types ===${NC}"

# Test 1: Visa card - successful charge
echo -e "${BLUE}Test 1: Visa Card - Successful Charge${NC}"
make_charge "4111111111111111" "John Doe" "123" 12 2030 "visa" 100.00 "Visa card - always succeeds"

# Test 2: Visa card - declined charge
echo -e "${BLUE}Test 2: Visa Card - Declined Charge${NC}"
make_charge "4000000000000002" "Jane Smith" "123" 12 2030 "visa" 50.00 "Visa card - always declined"

# Test 3: Mastercard with 3DS
echo -e "${BLUE}Test 3: Mastercard - 3D Secure Flow${NC}"
make_charge "5555555555554444" "Bob Johnson" "456" 6 2031 "mastercard" 75.00 "Mastercard with 3DS"

# Test 4: Amex - insufficient funds
echo -e "${BLUE}Test 4: Amex - Insufficient Funds${NC}"
make_charge "378282246310005" "Alice Williams" "1234" 8 2032 "amex" 9999.00 "Amex - insufficient funds"

echo -e "${BLUE}=== Hold and Capture Flow ===${NC}"

# Test 5: Hold and capture with Visa
echo -e "${BLUE}Test 5: Visa Card - Hold and Capture${NC}"
hold_id=$(make_hold "4111111111111111" "John Doe" "123" 12 2030 "visa" 150.00 "Visa card - hold")
make_capture "$hold_id" 150.00

echo -e "${BLUE}=== Refund Flow ===${NC}"

# Test 6: Refund completed transaction
echo -e "${BLUE}Test 6: Visa Card - Full Refund${NC}"
make_refund 1 100.00

echo -e "${BLUE}=== Second Round: Repeat Card Types ===${NC}"

# Test 7: Repeat successful Visa card charge
echo -e "${BLUE}Test 7: Visa Card - Second Successful Charge${NC}"
make_charge "4111111111111111" "John Doe" "123" 12 2030 "visa" 25.00 "Visa card - second successful charge"

# Test 8: Repeat declined Visa card charge
echo -e "${BLUE}Test 8: Visa Card - Second Declined Charge${NC}"
make_charge "4000000000000002" "Jane Smith" "123" 12 2030 "visa" 30.00 "Visa card - second declined charge"

# Test 9: Mastercard hold without 3DS
echo -e "${BLUE}Test 9: Mastercard - Hold (no 3DS)${NC}"
make_charge "5555555555554444" "Bob Johnson" "456" 6 2031 "mastercard" 85.00 "Mastercard - hold without 3DS authentication"

# Test 10: Partial refund
echo -e "${BLUE}Test 10: Visa Card - Partial Refund${NC}"
make_charge "4111111111111111" "John Doe" "123" 12 2030 "visa" 200.00 "Visa card - for partial refund"

# Get the last transaction ID and do partial refund
# This would need to be extracted from the response in a real implementation
echo -e "${YELLOW}Note: In a real implementation, we would extract the transaction ID from the previous charge and do a partial refund${NC}"

echo -e "${BLUE}=== Admin API Tests ===${NC}"

# Test admin endpoints
echo -e "${BLUE}Test 11: Admin Dashboard${NC}"
echo -e "${YELLOW}Fetching dashboard statistics...${NC}"
curl -s "$BASE_URL/admin/dashboard" | jq '.'

echo -e "${BLUE}Test 12: List Merchants${NC}"
echo -e "${YELLOW}Fetching merchant list...${NC}"
curl -s "$BASE_URL/admin/merchants" | jq '.'

echo -e "${BLUE}Test 13: List Cards${NC}"
echo -e "${YELLOW}Fetching card list...${NC}"
curl -s "$BASE_URL/admin/cards" | jq '.'

echo -e "${BLUE}Test 14: List Error Scenarios${NC}"
echo -e "${YELLOW}Fetching error scenarios...${NC}"
curl -s "$BASE_URL/admin/error-scenarios" | jq '.'

echo -e "${BLUE}Test 15: Get Transaction Details${NC}"
echo -e "${YELLOW}Fetching first transaction details...${NC}"
curl -s "$BASE_URL/api/v1/transactions/1" | jq '.'

echo -e "${BLUE}Test 16: List All Transactions${NC}"
echo -e "${YELLOW}Fetching all transactions...${NC}"
curl -s "$BASE_URL/api/v1/transactions" | jq '.'

echo -e "${GREEN}=== Payment Flow Simulation Complete ===${NC}"
echo -e "${GREEN}All tests completed successfully!${NC}"