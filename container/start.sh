#!/bin/bash
set -e

# Agent Quest Container Startup
# Start or attach to the container

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Agent Quest Container ==="
echo ""

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

# Check if container is already running
if docker ps -q -f name=agent-quest | grep -q .; then
    echo "✓ Container is already running"
    echo ""
    echo "Attaching to container..."
    echo "  (Use Ctrl+D or 'exit' to detach)"
    echo ""
    docker-compose exec agent-quest /bin/bash
else
    echo "Starting container..."
    docker-compose up -d

    echo "✓ Container started"
    echo ""
    echo "Entering container..."
    echo "  (Use Ctrl+D or 'exit' to detach)"
    echo ""
    docker-compose exec agent-quest /bin/bash
fi
