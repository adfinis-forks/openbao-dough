#!/bin/bash

# Script to generate OpenAPI specification from a running OpenBao instance
# Usage: ./scripts/generate-openapi-spec.sh [OPENBAO_ADDR] [TOKEN]

set -e

# Configuration
DEFAULT_ADDR="http://127.0.0.1:8200"
OPENBAO_ADDR="${1:-${OPENBAO_ADDR:-$DEFAULT_ADDR}}"
TOKEN="${2:-${OPENBAO_TOKEN:-}}"
OUTPUT_FILE="api/oapi.yaml"

echo "🔄 Generating OpenAPI spec from OpenBao instance..."
echo "   Address: $OPENBAO_ADDR"
echo "   Output: $OUTPUT_FILE"

# Create api directory if it doesn't exist
mkdir -p api

# Prepare curl command
CURL_CMD="curl -s"

# Add token header if provided
if [ -n "$TOKEN" ]; then
    CURL_CMD="$CURL_CMD -H 'X-Vault-Token: $TOKEN'"
    echo "   Using provided token"
else
    echo "   No token provided (some endpoints may not be available)"
fi

# Fetch the OpenAPI spec
echo "📥 Fetching OpenAPI specification..."

# Try with generic_mount_paths parameter for better coverage
SPEC_URL="${OPENBAO_ADDR}/v1/sys/internal/specs/openapi?generic_mount_paths=true"

if [ -n "$TOKEN" ]; then
    curl -s -H "X-Vault-Token: $TOKEN" "$SPEC_URL" | \
        python3 -m json.tool > "$OUTPUT_FILE"
else
    curl -s "$SPEC_URL" | \
        python3 -m json.tool > "$OUTPUT_FILE"
fi

# Check if we got an empty paths object (indicating auth is required)
if grep -q '"paths": {}' "$OUTPUT_FILE"; then
    echo "⚠️  Empty API specification received - authentication may be required"
    echo "   💡 Try providing a root token: make spec OPENBAO_TOKEN=your_token"
    echo "   💡 Or check if OpenBao is running in dev mode"
fi

# Check if the request was successful
if [ $? -eq 0 ] && [ -s "$OUTPUT_FILE" ]; then
    echo "✅ OpenAPI spec generated successfully: $OUTPUT_FILE"
    
    # Show some stats
    ENDPOINTS=$(grep -c '"/' "$OUTPUT_FILE" || echo "0")
    echo "   📊 Found ~$ENDPOINTS endpoints"
    
    # Check file size
    SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    echo "   📁 File size: $SIZE"
else
    echo "❌ Failed to generate OpenAPI spec"
    echo "   Make sure OpenBao is running at $OPENBAO_ADDR"
    echo "   Try providing a valid token if authentication is required"
    exit 1
fi

echo "🎉 Done! You can now run 'make codegen' to generate TypeScript types"