#!/bin/bash
set -e

# Agent Quest Audit Logs
# View and analyze container activity logs

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Agent Quest Audit Logs ==="
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon not running"
    exit 1
fi

# Navigate to script directory
cd "$SCRIPT_DIR"

# Check if container exists
if ! docker ps -a -q -f name=agent-quest | grep -q .; then
    echo "❌ Container not found"
    echo "Please run setup first: ./setup.sh"
    exit 1
fi

# Display menu
echo "Audit Log Options:"
echo "  1. View recent container logs"
echo "  2. Check network connections"
echo "  3. Monitor resource usage"
echo "  4. Search for suspicious activity"
echo "  5. View all (comprehensive audit)"
echo ""
read -p "Select option (1-5): " OPTION

case $OPTION in
    1)
        echo ""
        echo "=== Recent Container Logs ==="
        echo ""
        docker-compose logs --tail=100 agent-quest
        ;;
    2)
        echo ""
        echo "=== Network Connections ==="
        echo ""
        if docker ps -q -f name=agent-quest | grep -q .; then
            echo "Current network connections:"
            docker-compose exec agent-quest netstat -tunapl 2>/dev/null || \
                docker-compose exec agent-quest ss -tunap 2>/dev/null || \
                echo "⚠ Network monitoring tools not available in container"
        else
            echo "⚠ Container not running"
        fi
        ;;
    3)
        echo ""
        echo "=== Resource Usage ==="
        echo ""
        docker stats --no-stream agent-quest 2>/dev/null || echo "⚠ Container not running"
        ;;
    4)
        echo ""
        echo "=== Suspicious Activity Search ==="
        echo ""
        echo "Searching for suspicious patterns in logs..."

        # Search for common exfiltration patterns
        SUSPICIOUS_FOUND=0

        echo ""
        echo "Checking for outbound connections to unexpected hosts..."
        if docker-compose logs agent-quest 2>/dev/null | grep -iE "(curl|wget|http|https)" | grep -vE "(github\.com|npmjs\.org|anthropic\.com|openai\.com)"; then
            SUSPICIOUS_FOUND=1
        else
            echo "✓ No suspicious outbound connections"
        fi

        echo ""
        echo "Checking for credential access attempts..."
        if docker-compose logs agent-quest 2>/dev/null | grep -iE "(\.config/gh|\.config/claude|api[_-]?key|token|password)"; then
            SUSPICIOUS_FOUND=1
        else
            echo "✓ No credential access detected"
        fi

        echo ""
        if [ $SUSPICIOUS_FOUND -eq 0 ]; then
            echo "✓ No suspicious activity detected"
        else
            echo "⚠ Review the patterns above - may indicate malicious activity"
        fi
        ;;
    5)
        echo ""
        echo "=== Comprehensive Audit ==="
        echo ""

        echo "[1/4] Recent logs (last 50 lines)..."
        docker-compose logs --tail=50 agent-quest
        echo ""

        echo "[2/4] Resource usage..."
        docker stats --no-stream agent-quest 2>/dev/null || echo "⚠ Container not running"
        echo ""

        echo "[3/4] Network connections..."
        if docker ps -q -f name=agent-quest | grep -q .; then
            docker-compose exec agent-quest netstat -tunapl 2>/dev/null || \
                docker-compose exec agent-quest ss -tunap 2>/dev/null || \
                echo "⚠ Network monitoring tools not available"
        else
            echo "⚠ Container not running"
        fi
        echo ""

        echo "[4/4] Suspicious activity check..."
        docker-compose logs agent-quest 2>/dev/null | grep -iE "(curl|wget|http|https)" | grep -vE "(github\.com|npmjs\.org|anthropic\.com|openai\.com)" || echo "✓ No suspicious connections"
        echo ""

        echo "=== Audit Complete ==="
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
