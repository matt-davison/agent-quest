#!/bin/bash
# .claude/hooks/rt-auto-push.sh
# PostToolUse hook (Write|Edit): auto-push outbox/state when Claude writes to RT temp files
# Reads tool_input from stdin JSON to detect which file was written.

RT_MARKER="/tmp/agent-quest-rt-session"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
RT_HELPER="$PROJECT_DIR/scripts/rt-session.js"

# No RT session = exit silently
if [ ! -f "$RT_MARKER" ]; then
  exit 0
fi

SESSION_ID=$(cat "$RT_MARKER" 2>/dev/null)
if [ -z "$SESSION_ID" ]; then
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
    node "$RT_HELPER" push-outbox "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null
    # Suppress the normal tool output to avoid clutter
    echo '{"suppressOutput": true}'
  fi
  exit 0
fi

# Check if the written file is the RT shared state (host only)
if [ "$FILE_PATH" = "$STATE_PATH" ]; then
  node "$RT_HELPER" push-state "$SESSION_ID" 2>/dev/null
  echo '{"suppressOutput": true}'
  exit 0
fi

exit 0
