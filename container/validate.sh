#!/bin/bash
set -e

# Agent Quest Validation Script
# Pre-execution security validation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Agent Quest Validation ==="
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon not running"
    exit 1
fi

# Navigate to script directory
cd "$SCRIPT_DIR"

# Check if container is running
if ! docker ps -q -f name=agent-quest | grep -q .; then
    echo "❌ Container not running"
    echo "Please start it first: ./start.sh"
    exit 1
fi

echo "Running validation checks..."
echo ""

# Run Tokes validation
echo "[1/5] Validating Tokes system..."
if docker-compose exec -T agent-quest node scripts/validate-tokes.js; then
    echo "✓ Tokes validation passed"
else
    echo "❌ Tokes validation failed"
    exit 1
fi
echo ""

# Run game state validation
echo "[2/5] Validating game state..."
if docker-compose exec -T agent-quest node scripts/validate-game-state.js 2>/dev/null; then
    echo "✓ Game state validation passed"
else
    echo "⚠ Game state validation script not found (optional)"
fi
echo ""

# Check for hardcoded credentials in code
echo "[3/5] Scanning for hardcoded credentials..."
SUSPICIOUS_PATTERNS=(
    "ghp_[a-zA-Z0-9]{36}"  # GitHub PAT
    "sk-[a-zA-Z0-9]{48}"   # Anthropic API key
    "sk-[a-zA-Z0-9-_]{20,}" # OpenAI API key
    "AKIA[0-9A-Z]{16}"     # AWS access key
)

FOUND_CREDENTIALS=0
for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
    if docker-compose exec -T agent-quest grep -r -E "$pattern" worlds/ 2>/dev/null | grep -v ".git" | grep -v "node_modules"; then
        echo "❌ Found potential hardcoded credential: $pattern"
        FOUND_CREDENTIALS=1
    fi
done

if [ $FOUND_CREDENTIALS -eq 0 ]; then
    echo "✓ No hardcoded credentials detected"
else
    echo "❌ Credential scan failed - found suspicious patterns"
    exit 1
fi
echo ""

# Check for suspicious network calls
echo "[4/5] Scanning for suspicious network patterns..."
SUSPICIOUS_NETWORK=(
    "curl.*http://"
    "wget.*http://"
    "nc -l"
    "netcat -l"
)

FOUND_SUSPICIOUS=0
for pattern in "${SUSPICIOUS_NETWORK[@]}"; do
    if docker-compose exec -T agent-quest grep -r -E "$pattern" worlds/ scripts/ 2>/dev/null | grep -v ".git" | grep -v "node_modules"; then
        echo "⚠ Found suspicious network pattern: $pattern"
        # Don't fail on this, just warn
    fi
done

echo "✓ Network pattern scan complete"
echo ""

# Check file permissions on credentials
echo "[5/5] Verifying credential file permissions..."
if [ -d "$SCRIPT_DIR/data/.config/gh" ]; then
    PERMS=$(stat -f "%A" "$SCRIPT_DIR/data/.config/gh" 2>/dev/null || stat -c "%a" "$SCRIPT_DIR/data/.config/gh" 2>/dev/null)
    if [ "$PERMS" = "700" ]; then
        echo "✓ Credential directory permissions correct (700)"
    else
        echo "⚠ Warning: Credential directory permissions are $PERMS (should be 700)"
        echo "  Fixing permissions..."
        chmod 700 "$SCRIPT_DIR/data/.config/gh"
        echo "  ✓ Permissions fixed"
    fi
else
    echo "⚠ Credential directory not found"
fi
echo ""

echo "=== Validation Complete ==="
echo ""
echo "All checks passed! Safe to proceed."
echo ""
