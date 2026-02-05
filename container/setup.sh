#!/bin/bash
set -e

# Agent Quest Container Setup
# First-time setup for containerized development

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"
CONFIG_DIR="$DATA_DIR/.config"

echo "=== Agent Quest Container Setup ==="
echo ""

# Check if setup already completed
if [ -d "$CONFIG_DIR" ] && [ -f "$CONFIG_DIR/.setup_complete" ]; then
    echo "✓ Setup already completed!"
    echo "  Config directory: $CONFIG_DIR"
    echo ""
    echo "To reset and start fresh:"
    echo "  rm -rf $DATA_DIR"
    echo "  ./setup.sh"
    echo ""
    echo "To start the container:"
    echo "  ./start.sh"
    exit 0
fi

# Check prerequisites
echo "Checking prerequisites..."

# Check for Docker/Colima
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker not found"
    echo "Please install Colima or Docker Desktop first:"
    echo "  brew install colima docker docker-compose"
    exit 1
fi

if ! docker ps &> /dev/null; then
    echo "❌ Error: Docker daemon not running"
    echo ""
    echo "To start Colima:"
    echo "  colima start"
    exit 1
fi

echo "✓ Docker is available"

# Check for docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose not found"
    echo "Please install docker-compose:"
    echo "  brew install docker-compose"
    exit 1
fi

echo "✓ docker-compose is available"
echo ""

# Create config directories
echo "Creating config directories..."
mkdir -p "$CONFIG_DIR/claude"
mkdir -p "$CONFIG_DIR/gh"
mkdir -p "$DATA_DIR/npm"

# Set secure permissions
chmod 700 "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR/claude"
chmod 700 "$CONFIG_DIR/gh"

echo "✓ Config directories created"
echo ""

# Create Claude Code auto-approve config
echo "Configuring Claude Code with auto-approve..."
cat > "$CONFIG_DIR/claude/settings.json" << 'EOF'
{
  "autoApproveAll": true,
  "autoApproveTools": ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "Task", "WebFetch", "WebSearch"],
  "allowedPrompts": {
    "Bash": [".*"]
  }
}
EOF

chmod 600 "$CONFIG_DIR/claude/settings.json"
echo "✓ Claude Code configured for auto-approve (no permission prompts)"
echo ""

# GitHub PAT setup
echo "=== GitHub Authentication Setup ==="
echo ""
echo "You need to create a GitHub Personal Access Token (PAT) for the container."
echo ""
echo "SECURITY NOTICE:"
echo "- Create a CONTAINER-SPECIFIC PAT (easy to revoke if compromised)"
echo "- Required scopes: 'repo', 'read:user'"
echo "- Recommend rotating every 90 days"
echo "- This PAT will be stored in: $CONFIG_DIR/gh/"
echo "- The container mounts credentials READ-ONLY to prevent theft"
echo ""
read -p "Press ENTER to open GitHub PAT creation page in your browser..."

# Open GitHub PAT creation page
open "https://github.com/settings/tokens/new?scopes=repo,read:user&description=Agent%20Quest%20Container" 2>/dev/null || \
    xdg-open "https://github.com/settings/tokens/new?scopes=repo,read:user&description=Agent%20Quest%20Container" 2>/dev/null || \
    echo "Please visit: https://github.com/settings/tokens/new?scopes=repo,read:user&description=Agent%20Quest%20Container"

echo ""
echo "After creating your PAT:"
read -sp "Paste your GitHub PAT here (input hidden): " GITHUB_PAT
echo ""

if [ -z "$GITHUB_PAT" ]; then
    echo "❌ Error: No PAT provided"
    exit 1
fi

# Configure gh CLI
export GH_TOKEN="$GITHUB_PAT"
mkdir -p "$CONFIG_DIR/gh"
echo "$GITHUB_PAT" > "$CONFIG_DIR/gh/token"
chmod 600 "$CONFIG_DIR/gh/token"

echo "✓ GitHub PAT configured"
echo ""

# Git configuration
echo "=== Git Configuration ==="
echo ""
echo "Enter your git identity for commits:"
read -p "Your name: " GIT_NAME
read -p "Your email: " GIT_EMAIL

if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
    echo "❌ Error: Git name and email are required"
    exit 1
fi

# Create .env file
cat > "$SCRIPT_DIR/.env" << EOF
GIT_AUTHOR_NAME=$GIT_NAME
GIT_AUTHOR_EMAIL=$GIT_EMAIL
GIT_COMMITTER_NAME=$GIT_NAME
GIT_COMMITTER_EMAIL=$GIT_EMAIL
EOF

echo "✓ Git configuration saved to .env"
echo ""

# Claude API key setup
echo "=== Claude API Key Setup ==="
echo ""
echo "To use Claude Code, you need an Anthropic API key."
echo "Get one at: https://console.anthropic.com/settings/keys"
echo ""
read -p "Press ENTER to continue (or Ctrl+C to skip)..."
read -sp "Paste your Claude API key here (input hidden): " CLAUDE_API_KEY
echo ""

if [ -n "$CLAUDE_API_KEY" ]; then
    echo "$CLAUDE_API_KEY" > "$CONFIG_DIR/claude/api_key"
    chmod 600 "$CONFIG_DIR/claude/api_key"
    echo "✓ Claude API key configured"
else
    echo "⚠ Skipped Claude API key configuration"
    echo "  You can add it later to: $CONFIG_DIR/claude/api_key"
fi
echo ""

# Build Docker image
echo "Building Docker image..."
cd "$SCRIPT_DIR"
docker-compose build

echo "✓ Docker image built"
echo ""

# Mark setup as complete
touch "$CONFIG_DIR/.setup_complete"

# Display security notice
echo "=== Security Notice ==="
echo ""
echo "CREDENTIAL PROTECTION (Defense in Depth):"
echo "  1. ✓ Credentials stored in $CONFIG_DIR/ (gitignored)"
echo "  2. ✓ File permissions set to 600 (user read/write only)"
echo "  3. ✓ Container mounts credentials READ-ONLY"
echo "  4. ✓ GitHub PAT has minimal scopes (repo, read:user)"
echo "  5. ✓ Running as non-root user (UID 1000)"
echo "  6. ✓ Read-only root filesystem"
echo "  7. ✓ Resource limits enforced"
echo ""
echo "BEST PRACTICES:"
echo "  - Only run code from trusted sources"
echo "  - Review all PRs before merging"
echo "  - Monitor audit logs: ./audit-logs.sh"
echo "  - Rotate credentials every 90 days"
echo "  - Run validation before execution: ./validate.sh"
echo ""
echo "If credentials are compromised:"
echo "  1. Revoke PAT at: https://github.com/settings/tokens"
echo "  2. Delete $DATA_DIR"
echo "  3. Run ./setup.sh again with new credentials"
echo ""

echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "  1. Start the container: ./start.sh"
echo "  2. Run Claude Code: ./claude.sh"
echo "  3. Or enter container: docker-compose exec agent-quest bash"
echo ""
echo "Note: Claude Code is configured for auto-approve (no permission prompts)"
echo "      Container sandboxing provides the security boundary."
echo ""
