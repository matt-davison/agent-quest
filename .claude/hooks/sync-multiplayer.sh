#!/bin/bash
# .claude/hooks/sync-multiplayer.sh
# Automatically sync multiplayer updates before each user prompt

# Debug: Show hook is running
echo "🔄 [Hook] Checking for multiplayer updates..."

# Silently fetch latest changes
git fetch origin 2>/dev/null

# Get current branch and check if behind
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
BEHIND_COUNT=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")

# If behind, pull updates (this uses the safer sync script)
if [ "$BEHIND_COUNT" -gt 0 ]; then
    # Use our safe sync script if available
    if [ -f "$(git rev-parse --show-toplevel)/scripts/sync-multiplayer.sh" ]; then
        "$(git rev-parse --show-toplevel)/scripts/sync-multiplayer.sh" 2>&1 | grep -E "(SUCCESS|WARNING|ERROR)" || true
    else
        # Fallback to simple merge
        git merge origin/main --no-edit -m "Auto-sync multiplayer updates" 2>/dev/null || true
    fi

    # Output context for Claude
    echo "📬 Synced $BEHIND_COUNT multiplayer update(s) from main branch"
else
    echo "✓ [Hook] No multiplayer updates to sync (branch: $CURRENT_BRANCH, up to date with origin/main)"
fi

exit 0
