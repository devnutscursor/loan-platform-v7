#!/bin/bash

# Local Logic IO Reports API Test Script
# This script tests the Local Logic API authentication and report generation

CLIENT_ID="033e02864fa954ad6224aec1d7f53578"
CLIENT_SECRET="XWZSSRP8kQGbr9vwSuCpgsAz7D_No5htxxLHC4qNa0l"

echo "🔐 Step 1: Getting Access Token..."
echo "-----------------------------------"

# Get access token (NOTE: Token endpoint uses GET, not POST)
TOKEN_RESPONSE=$(curl -s -X GET "https://api.locallogic.co/oauth/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&audience=reports-api")

echo "Token Response:"
echo "$TOKEN_RESPONSE" | jq '.' 2>/dev/null || echo "$TOKEN_RESPONSE"

# Extract access token (if jq is available)
ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    echo ""
    echo "❌ Failed to get access token. Response:"
    echo "$TOKEN_RESPONSE"
    exit 1
fi

echo ""
echo "✅ Access Token obtained!"
echo "Token: ${ACCESS_TOKEN:0:50}..."
echo ""

echo "📊 Step 2: Generating Neighborhood Report..."
echo "-----------------------------------"

# Generate a report (using example coordinates from Philadelphia)
REPORT_RESPONSE=$(curl -s -X POST "https://reports-api.locallogic.co/v1/reports" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 39.92422,
    "lng": -75.15548,
    "address_label": "500 Dudley St, Philadelphia, PA 19148",
    "language": "en",
    "type": "ni"
  }')

echo "Report Response:"
echo "$REPORT_RESPONSE" | jq '.' 2>/dev/null || echo "$REPORT_RESPONSE"

# Extract report URL
REPORT_URL=$(echo "$REPORT_RESPONSE" | jq -r '.report_url' 2>/dev/null)

if [ -n "$REPORT_URL" ] && [ "$REPORT_URL" != "null" ]; then
    echo ""
    echo "✅ Report generated successfully!"
    echo "Report URL: $REPORT_URL"
    echo ""
    echo "You can view the report at: $REPORT_URL"
else
    echo ""
    echo "❌ Failed to generate report. Response:"
    echo "$REPORT_RESPONSE"
fi




