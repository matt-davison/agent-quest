#!/bin/bash
set -e

# Run Claude Code in Container
# Wrapper script to execute Claude Code CLI inside the container

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if setup completed
if [ ! -d "$SCRIPT_DIR/data/.config" ]; then
    echo "❌ Setup not completed yet"
    echo ""
    echo "Please run setup first:"
    echo "  ./setup.sh"
    exit 1
fi

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker daemon not running"
    echo ""
    echo "To start Colima:"
    echo "  colima start"
    exit 1
fi

# Navigate to script directory
cd "$SCRIPT_DIR"

# Check if container is running, start if not
if ! docker ps -q -f name=agent-quest | grep -q .; then
    echo "Starting container..."
    docker-compose up -d
    echo "✓ Container started"
    echo ""
fi

# Load Claude API key if exists
if [ -f "$SCRIPT_DIR/data/.config/claude/api_key" ]; then
    CLAUDE_API_KEY=$(cat "$SCRIPT_DIR/data/.config/claude/api_key")
    export ANTHROPIC_API_KEY="$CLAUDE_API_KEY"
fi

# Run Claude Code with any provided arguments
echo "Starting Claude Code..."
echo "  (Auto-approve enabled - no permission prompts)"
echo ""

# Pass through all arguments to claude
docker-compose exec \
    -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
    agent-quest \
    claude "$@"
