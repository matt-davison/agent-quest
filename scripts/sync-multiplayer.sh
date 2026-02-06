#!/bin/bash

# sync-multiplayer.sh
# Safely fetch and merge multiplayer updates from main branch
# This allows async multiplayer by incorporating other players' changes

set -e  # Exit on error (but we'll handle errors explicitly)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    log_error "Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
log_info "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    HAS_CHANGES=true
    log_warning "Found uncommitted changes"
else
    HAS_CHANGES=false
    log_info "Working directory is clean"
fi

# Track whether we stashed changes
STASHED=false

# If we have changes, stash them
if [ "$HAS_CHANGES" = true ]; then
    log_info "Stashing local changes..."
    if git stash push -u -m "sync-multiplayer auto-stash $(date +%Y-%m-%d-%H:%M:%S)"; then
        STASHED=true
        log_success "Changes stashed successfully"
    else
        log_error "Failed to stash changes"
        exit 1
    fi
fi

# Fetch latest changes from origin
log_info "Fetching latest changes from origin..."
if git fetch origin; then
    log_success "Fetch completed"
else
    log_error "Failed to fetch from origin"
    # Restore stashed changes if we stashed them
    if [ "$STASHED" = true ]; then
        log_info "Restoring stashed changes..."
        git stash pop
    fi
    exit 1
fi

# Check if we're behind origin/main
BEHIND_COUNT=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")

if [ "$BEHIND_COUNT" -eq 0 ]; then
    log_success "Already up to date with origin/main"
else
    log_info "Behind origin/main by $BEHIND_COUNT commit(s)"

    # Merge origin/main into current branch
    log_info "Merging origin/main into $CURRENT_BRANCH..."
    if git merge origin/main --no-edit -m "Sync multiplayer updates from main"; then
        log_success "Merged origin/main successfully"
    else
        log_error "Merge failed - conflicts detected"
        log_warning "Please resolve conflicts manually"

        # Don't pop stash yet - let user resolve conflicts first
        if [ "$STASHED" = true ]; then
            log_warning "Your changes are safely stashed"
            log_info "After resolving conflicts, run: git stash pop"
        fi
        exit 1
    fi
fi

# Restore stashed changes if we stashed them
if [ "$STASHED" = true ]; then
    log_info "Restoring your local changes..."
    if git stash pop; then
        log_success "Local changes restored successfully"
    else
        log_error "Failed to restore stashed changes"
        log_warning "Your changes are still in the stash"
        log_info "Run 'git stash list' to see your stash"
        log_info "Run 'git stash pop' to manually restore when ready"
        exit 1
    fi
fi

log_success "Multiplayer sync complete!"

# Show summary of what changed
if [ "$BEHIND_COUNT" -gt 0 ]; then
    echo ""
    log_info "Recent multiplayer updates:"
    git log --oneline -n 5 --color=always
fi
