#!/bin/bash
# .claude/hooks/rt-sync.sh
# UserPromptSubmit hook: check inbox + RT messages before each prompt
# Replaces sync-multiplayer.sh — handles both async and RT multiplayer.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
RT_MARKER="/tmp/agent-quest-rt-session"
RT_HELPER="$PROJECT_DIR/scripts/rt-session.js"

# --- Get player's GitHub username ---
PLAYER_GITHUB=$(gh api user -q '.login' 2>/dev/null)
if [ -z "$PLAYER_GITHUB" ]; then
  # Not authenticated; fall back to basic sync
  echo "[Hook] GitHub not authenticated, skipping multiplayer sync"
  exit 0
fi

# --- Always check inbox branch for notifications ---
INBOX_OUTPUT=$(node "$RT_HELPER" check-inbox "$PLAYER_GITHUB" 2>/dev/null)
if [ -n "$INBOX_OUTPUT" ]; then
  echo "$INBOX_OUTPUT"
fi

# --- Reset dream loop counter on user input ---
DREAM_MARKER="/tmp/agent-quest-dreaming.json"
DREAM_HELPER="$PROJECT_DIR/scripts/dream-session.js"
if [ -f "$DREAM_MARKER" ]; then
  node "$DREAM_HELPER" reset-loop-counter 2>/dev/null
fi

# --- Check if we're in RT mode ---
if [ -f "$RT_MARKER" ]; then
  SESSION_ID=$(cat "$RT_MARKER" 2>/dev/null)

  if [ -n "$SESSION_ID" ]; then
    # Reset loop counter on user prompt (prevents infinite loops)
    node "$RT_HELPER" reset-loop-counter "$SESSION_ID" 2>/dev/null

    # Check for new RT messages
    RT_OUTPUT=$(node "$RT_HELPER" check-messages "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null)
    if [ -n "$RT_OUTPUT" ]; then
      echo "$RT_OUTPUT"
    fi
  fi
else
  # --- Not in RT mode: do async sync from main (existing behavior) ---
  git fetch origin 2>/dev/null

  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  BEHIND_COUNT=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo "0")

  if [ "$BEHIND_COUNT" -gt 0 ]; then
    if [ -f "$PROJECT_DIR/scripts/sync-multiplayer.sh" ]; then
      "$PROJECT_DIR/scripts/sync-multiplayer.sh" 2>&1 | grep -E "(SUCCESS|WARNING|ERROR)" || true
    else
      git merge origin/main --no-edit -m "Auto-sync multiplayer updates" 2>/dev/null || true
    fi
    echo "Synced $BEHIND_COUNT multiplayer update(s) from main branch"
  fi
fi

exit 0
