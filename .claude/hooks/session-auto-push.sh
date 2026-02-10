#!/bin/bash
# .claude/hooks/session-auto-push.sh
# PostToolUse hook (Write|Edit): auto-push outbox/state when Claude writes to RT temp files
# Replaces rt-auto-push.sh — checks unified marker, skips for pure local sessions.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
SESSION_HELPER="$PROJECT_DIR/scripts/multiplayer-session.js"
LEGACY_RT_HELPER="$PROJECT_DIR/scripts/rt-session.js"

# --- Determine session ID and remote status ---
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

# No session or pure local = exit silently (no git pushes needed)
if [ -z "$SESSION_ID" ] || [ "$REMOTE_ENABLED" != "true" ]; then
  exit 0
fi

# Read stdin for tool input JSON
INPUT=$(cat)

# Extract file_path from the tool input
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"//;s/"$//')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

OUTBOX_PATH="/tmp/agent-quest-rt-outbox-$SESSION_ID.yaml"
STATE_PATH="/tmp/agent-quest-rt-state-$SESSION_ID.yaml"
PLAYER_GITHUB=$(gh api user -q '.login' 2>/dev/null)

# Check if the written file is the RT outbox
if [ "$FILE_PATH" = "$OUTBOX_PATH" ]; then
  if [ -n "$PLAYER_GITHUB" ]; then
    node "$SESSION_HELPER" push-outbox "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null || \
      node "$LEGACY_RT_HELPER" push-outbox "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null
    echo '{"suppressOutput": true}'
  fi
  exit 0
fi

# Check if the written file is the RT shared state (host only)
if [ "$FILE_PATH" = "$STATE_PATH" ]; then
  node "$SESSION_HELPER" push-state "$SESSION_ID" 2>/dev/null || \
    node "$LEGACY_RT_HELPER" push-state "$SESSION_ID" 2>/dev/null
  echo '{"suppressOutput": true}'
  exit 0
fi

exit 0
