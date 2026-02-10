#!/bin/bash
# .claude/hooks/session-sync.sh
# UserPromptSubmit hook: check inbox + messages before each prompt
# Replaces rt-sync.sh — handles local, remote, and hybrid sessions.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
SESSION_HELPER="$PROJECT_DIR/scripts/multiplayer-session.js"
LEGACY_RT_HELPER="$PROJECT_DIR/scripts/rt-session.js"

# --- Get player's GitHub username ---
PLAYER_GITHUB=$(gh api user -q '.login' 2>/dev/null)
if [ -z "$PLAYER_GITHUB" ]; then
  echo "[Hook] GitHub not authenticated, skipping multiplayer sync"
  exit 0
fi

# --- Always check inbox branch for notifications ---
INBOX_OUTPUT=$(node "$SESSION_HELPER" check-inbox "$PLAYER_GITHUB" 2>/dev/null)
if [ -z "$INBOX_OUTPUT" ]; then
  # Fallback to legacy helper
  INBOX_OUTPUT=$(node "$LEGACY_RT_HELPER" check-inbox "$PLAYER_GITHUB" 2>/dev/null)
fi
if [ -n "$INBOX_OUTPUT" ]; then
  echo "$INBOX_OUTPUT"
fi

# --- Reset dream loop counter on user input ---
DREAM_MARKER="/tmp/agent-quest-dreaming.json"
DREAM_HELPER="$PROJECT_DIR/scripts/dream-session.js"
if [ -f "$DREAM_MARKER" ]; then
  node "$DREAM_HELPER" reset-loop-counter 2>/dev/null
fi

# --- Check for active session ---
UNIFIED_MARKER="/tmp/agent-quest-session.yaml"
LEGACY_RT_MARKER="/tmp/agent-quest-rt-session"

SESSION_ID=""
REMOTE_ENABLED="false"

if [ -f "$UNIFIED_MARKER" ]; then
  SESSION_ID=$(node -e "const d=JSON.parse(require('fs').readFileSync('$UNIFIED_MARKER','utf8'));process.stdout.write(d.session_id||'')" 2>/dev/null)
  REMOTE_ENABLED=$(node -e "const d=JSON.parse(require('fs').readFileSync('$UNIFIED_MARKER','utf8'));process.stdout.write(String(d.remote?.enabled||false))" 2>/dev/null)
elif [ -f "$LEGACY_RT_MARKER" ]; then
  SESSION_ID=$(cat "$LEGACY_RT_MARKER" 2>/dev/null)
  REMOTE_ENABLED="true"
fi

if [ -n "$SESSION_ID" ]; then
  if [ "$REMOTE_ENABLED" = "true" ]; then
    # Remote/hybrid session: reset loop counter and check for RT messages
    node "$SESSION_HELPER" reset-loop-counter "$SESSION_ID" 2>/dev/null || \
      node "$LEGACY_RT_HELPER" reset-loop-counter "$SESSION_ID" 2>/dev/null

    RT_OUTPUT=$(node "$SESSION_HELPER" check-messages "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null)
    if [ -z "$RT_OUTPUT" ]; then
      RT_OUTPUT=$(node "$LEGACY_RT_HELPER" check-messages "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null)
    fi
    if [ -n "$RT_OUTPUT" ]; then
      echo "$RT_OUTPUT"
    fi
  fi
  # Pure local session: no remote checks needed (skip git fetches for performance)
else
  # --- Not in any session: do async sync from main ---
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
