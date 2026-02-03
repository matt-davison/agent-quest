#!/bin/bash
# Setup git hooks for Agent Quest
# Run this script after cloning the repository

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

echo "Setting up Agent Quest git hooks..."

# Make scripts executable
chmod +x "$SCRIPT_DIR/get-github-user.sh"
chmod +x "$SCRIPT_DIR/pre-commit"

# Install pre-commit hook
ln -sf "$SCRIPT_DIR/pre-commit" "$HOOKS_DIR/pre-commit"

echo "Hooks installed successfully!"
echo ""

# Test GitHub authentication
echo "Testing GitHub authentication..."
GITHUB_USER=$("$SCRIPT_DIR/get-github-user.sh" 2>&1) || true

if [[ "$GITHUB_USER" == ERROR* ]]; then
    echo ""
    echo "WARNING: GitHub authentication not configured."
    echo "The pre-commit hook requires GitHub authentication."
    echo ""
    echo "Please configure one of these methods:"
    echo "  1. Install gh CLI and run: gh auth login"
    echo "  2. Set GITHUB_TOKEN environment variable"
    echo ""
else
    echo "Authenticated as: $GITHUB_USER"
    echo ""
    echo "Your player directory: players/$GITHUB_USER/"
    echo "Your ledger file: tokes/ledgers/$GITHUB_USER.yaml"
fi
