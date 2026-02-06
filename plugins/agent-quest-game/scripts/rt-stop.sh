#!/bin/bash
# plugins/agent-quest-game/scripts/rt-stop.sh
# Stop hook: poll for new RT messages before allowing Claude to stop
# Blocks stop if other players have new actions, injecting them for processing.

RT_MARKER="/tmp/agent-quest-rt-session"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
RT_HELPER="$PROJECT_DIR/scripts/rt-session.js"

# No RT session = allow stop immediately
if [ ! -f "$RT_MARKER" ]; then
  exit 0
fi

SESSION_ID=$(cat "$RT_MARKER" 2>/dev/null)
if [ -z "$SESSION_ID" ]; then
  exit 0
fi

PLAYER_GITHUB=$(gh api user -q '.login' 2>/dev/null)
if [ -z "$PLAYER_GITHUB" ]; then
  exit 0
fi

# --- Safety: prevent infinite loops ---
LOOP_COUNT=$(node "$RT_HELPER" get-loop-counter "$SESSION_ID" 2>/dev/null || echo "0")
if [ "$LOOP_COUNT" -gt 50 ]; then
  # Emergency stop - too many loops
  exit 0
fi

# Increment loop counter
node "$RT_HELPER" increment-loop-counter "$SESSION_ID" 2>/dev/null

# --- Read session settings ---
git fetch origin "refs/heads/rt/$SESSION_ID/session" 2>/dev/null
SESSION_YAML=$(git show "origin/rt/$SESSION_ID/session:session.yaml" 2>/dev/null)

# Check session status
SESSION_STATUS=$(echo "$SESSION_YAML" | grep "^status:" | head -1 | awk '{print $2}')
if [ "$SESSION_STATUS" = "ended" ] || [ "$SESSION_STATUS" = "paused" ]; then
  exit 0
fi

# --- Spectator bypass: spectators never block ---
PLAYER_ROLE=$(echo "$SESSION_YAML" | grep -A4 "github: \"$PLAYER_GITHUB\"" | grep "role:" | head -1 | awk '{print $2}')
if [ "$PLAYER_ROLE" = "spectator" ]; then
  exit 0
fi

# Parse settings
MAX_POLLS=$(echo "$SESSION_YAML" | grep "max_idle_polls:" | head -1 | awk '{print $2}')
POLL_INTERVAL=$(echo "$SESSION_YAML" | grep "poll_interval_sec:" | head -1 | awk '{print $2}')
MAX_POLLS=${MAX_POLLS:-5}
POLL_INTERVAL=${POLL_INTERVAL:-3}

# --- Initiative turn check ---
TURN_MODE=$(echo "$SESSION_YAML" | grep "turn_mode:" | head -1 | awk '{print $2}')
if [ "$TURN_MODE" = "initiative" ]; then
  TURN_JSON=$(node "$RT_HELPER" check-turn "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null)
  if [ -n "$TURN_JSON" ]; then
    IS_MY_TURN=$(echo "$TURN_JSON" | grep -o '"is_my_turn"[[:space:]]*:[[:space:]]*\(true\|false\)' | grep -o '\(true\|false\)')
    CURRENT_PLAYER=$(echo "$TURN_JSON" | grep -o '"current_player"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"current_player"[[:space:]]*:[[:space:]]*"//;s/"$//')
    if [ "$IS_MY_TURN" = "false" ]; then
      echo "{\"decision\": \"block\", \"reason\": \"[INITIATIVE] Waiting for ${CURRENT_PLAYER}'s turn...\"}"
      exit 0
    fi
  fi
fi

# --- Read stop_hook_active from stdin ---
INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | grep -o '"stop_hook_active"[[:space:]]*:[[:space:]]*\(true\|false\)' | grep -o '\(true\|false\)')

# --- Poll for messages ---
check_messages() {
  RT_OUTPUT=$(node "$RT_HELPER" check-messages "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null)
  if [ -n "$RT_OUTPUT" ]; then
    echo "{\"decision\": \"block\", \"reason\": \"$RT_OUTPUT\"}"
    return 0
  fi
  return 1
}

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  # Already in a forced-continue cycle. Check once and allow stop if no messages.
  if check_messages; then
    exit 0
  fi
  # No messages in forced-continue — allow stop
  exit 0
else
  # First stop after a turn. Poll a few times for fast responses.
  for i in $(seq 1 "$MAX_POLLS"); do
    if check_messages; then
      exit 0
    fi
    sleep "$POLL_INTERVAL"
  done

  # No messages after polling. Allow stop.
  exit 0
fi
