#!/bin/bash
# .claude/hooks/session-stop.sh
# Stop hook: poll for messages before allowing Claude to stop
# Replaces rt-stop.sh — handles local (immediate exit), remote (poll), and hybrid (group-ready + poll).

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
SESSION_HELPER="$PROJECT_DIR/scripts/multiplayer-session.js"
LEGACY_RT_HELPER="$PROJECT_DIR/scripts/rt-session.js"

# === DREAMING CHECK (before multiplayer) ===
DREAM_MARKER="/tmp/agent-quest-dreaming.json"
DREAM_HELPER="$PROJECT_DIR/scripts/dream-session.js"

if [ -f "$DREAM_MARKER" ]; then
  INPUT=$(cat)

  # Safety cap - emergency stop after too many loops
  LOOP_COUNT=$(node "$DREAM_HELPER" get-loop-counter 2>/dev/null || echo "0")
  if [ "$LOOP_COUNT" -gt 200 ]; then
    node "$DREAM_HELPER" wake 2>/dev/null
    exit 0
  fi

  # Increment turn + loop counter
  node "$DREAM_HELPER" increment-turn 2>/dev/null

  # Check wake conditions
  SHOULD_WAKE=$(node "$DREAM_HELPER" should-wake 2>/dev/null)
  if [ "$SHOULD_WAKE" = "true" ]; then
    exit 0
  fi

  # Check if checkpoint is due
  CHECKPOINT_DUE=$(node "$DREAM_HELPER" checkpoint-due 2>/dev/null)
  TURN_COUNT=$(node -e "const d=JSON.parse(require('fs').readFileSync('$DREAM_MARKER','utf8'));process.stdout.write(String(d.turn_count))" 2>/dev/null)

  REASON="[DREAM CONTINUES - Echo Turn $TURN_COUNT]"
  if [ "$CHECKPOINT_DUE" = "true" ]; then
    REASON="$REASON [CHECKPOINT: Save all changes silently via repo-sync save. Do NOT display summary. Continue immediately.]"
  fi
  REASON="$REASON Continue The Dreaming. Execute the next Echo turn. After acting, update game state via state-writer and call: node scripts/dream-session.js set-summary \"<brief summary of this turn>\""

  echo "{\"decision\": \"block\", \"reason\": \"$REASON\"}"
  exit 0
fi

# === MULTIPLAYER SESSION CHECK ===
UNIFIED_MARKER="/tmp/agent-quest-session.yaml"
LEGACY_RT_MARKER="/tmp/agent-quest-rt-session"

SESSION_ID=""
SESSION_TYPE=""
REMOTE_ENABLED="false"

if [ -f "$UNIFIED_MARKER" ]; then
  SESSION_ID=$(node -e "const d=JSON.parse(require('fs').readFileSync('$UNIFIED_MARKER','utf8'));process.stdout.write(d.session_id||'')" 2>/dev/null)
  SESSION_TYPE=$(node -e "const d=JSON.parse(require('fs').readFileSync('$UNIFIED_MARKER','utf8'));process.stdout.write(d.session_type||'')" 2>/dev/null)
  REMOTE_ENABLED=$(node -e "const d=JSON.parse(require('fs').readFileSync('$UNIFIED_MARKER','utf8'));process.stdout.write(String(d.remote?.enabled||false))" 2>/dev/null)
elif [ -f "$LEGACY_RT_MARKER" ]; then
  SESSION_ID=$(cat "$LEGACY_RT_MARKER" 2>/dev/null)
  SESSION_TYPE="remote"
  REMOTE_ENABLED="true"
fi

# No session = allow stop immediately
if [ -z "$SESSION_ID" ]; then
  exit 0
fi

# Pure local session = allow stop immediately (no remote polling needed)
if [ "$SESSION_TYPE" = "local" ] && [ "$REMOTE_ENABLED" != "true" ]; then
  exit 0
fi

# --- From here: remote or hybrid session ---
PLAYER_GITHUB=$(gh api user -q '.login' 2>/dev/null)
if [ -z "$PLAYER_GITHUB" ]; then
  exit 0
fi

# --- Safety: prevent infinite loops ---
LOOP_COUNT=$(node "$SESSION_HELPER" get-loop-counter "$SESSION_ID" 2>/dev/null || \
  node "$LEGACY_RT_HELPER" get-loop-counter "$SESSION_ID" 2>/dev/null || echo "0")
if [ "$LOOP_COUNT" -gt 50 ]; then
  exit 0
fi

# Increment loop counter
node "$SESSION_HELPER" increment-loop-counter "$SESSION_ID" 2>/dev/null || \
  node "$LEGACY_RT_HELPER" increment-loop-counter "$SESSION_ID" 2>/dev/null

# --- Read session settings from remote ---
git fetch origin "refs/heads/rt/$SESSION_ID/session" 2>/dev/null
SESSION_YAML=$(git show "origin/rt/$SESSION_ID/session:session.yaml" 2>/dev/null)

# Check session status
if [ -n "$SESSION_YAML" ]; then
  SESSION_STATUS=$(echo "$SESSION_YAML" | grep "^status:" | head -1 | awk '{print $2}')
  if [ "$SESSION_STATUS" = "ended" ] || [ "$SESSION_STATUS" = "paused" ]; then
    exit 0
  fi
fi

# --- Spectator bypass ---
PLAYER_ROLE="player"
if [ -f "$UNIFIED_MARKER" ]; then
  PLAYER_ROLE=$(node -e "
    const d=JSON.parse(require('fs').readFileSync('$UNIFIED_MARKER','utf8'));
    const me = (d.participants||[]).find(p => p.github === '$PLAYER_GITHUB');
    process.stdout.write(me?.role || 'player');
  " 2>/dev/null)
elif [ -n "$SESSION_YAML" ]; then
  PLAYER_ROLE=$(echo "$SESSION_YAML" | grep -A4 "github: \"$PLAYER_GITHUB\"" | grep "role:" | head -1 | awk '{print $2}')
fi
PLAYER_ROLE=${PLAYER_ROLE:-player}
if [ "$PLAYER_ROLE" = "spectator" ]; then
  exit 0
fi

# Parse polling settings
MAX_POLLS=5
POLL_INTERVAL=3
if [ -n "$SESSION_YAML" ]; then
  YAML_POLLS=$(echo "$SESSION_YAML" | grep "max_idle_polls:" | head -1 | awk '{print $2}')
  YAML_INTERVAL=$(echo "$SESSION_YAML" | grep "poll_interval_sec:" | head -1 | awk '{print $2}')
  MAX_POLLS=${YAML_POLLS:-$MAX_POLLS}
  POLL_INTERVAL=${YAML_INTERVAL:-$POLL_INTERVAL}
fi

# --- Initiative turn check ---
TURN_MODE="simultaneous"
if [ -n "$SESSION_YAML" ]; then
  TURN_MODE=$(echo "$SESSION_YAML" | grep "turn_mode:" | head -1 | awk '{print $2}')
  TURN_MODE=${TURN_MODE:-simultaneous}
fi

if [ "$TURN_MODE" = "initiative" ]; then
  TURN_JSON=$(node "$SESSION_HELPER" check-turn "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null || \
    node "$LEGACY_RT_HELPER" check-turn "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null)
  if [ -n "$TURN_JSON" ]; then
    IS_MY_TURN=$(echo "$TURN_JSON" | grep -o '"is_my_turn"[[:space:]]*:[[:space:]]*\(true\|false\)' | grep -o '\(true\|false\)')
    CURRENT_PLAYER=$(echo "$TURN_JSON" | grep -o '"current_player"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"current_player"[[:space:]]*:[[:space:]]*"//;s/"$//')
    if [ "$IS_MY_TURN" = "false" ]; then
      echo "{\"decision\": \"block\", \"reason\": \"[INITIATIVE] Waiting for ${CURRENT_PLAYER}'s turn...\"}"
      exit 0
    fi
  fi
fi

# --- Hybrid: check group readiness before polling ---
if [ "$SESSION_TYPE" = "hybrid" ] && [ -f "$UNIFIED_MARKER" ]; then
  GROUP_READY=$(node "$SESSION_HELPER" check-group-ready 2>/dev/null)
  if [ -n "$GROUP_READY" ]; then
    READY=$(echo "$GROUP_READY" | grep -o '"ready"[[:space:]]*:[[:space:]]*\(true\|false\)' | grep -o '\(true\|false\)')
    REMOTE_AWAITING=$(echo "$GROUP_READY" | grep -o '"remote_awaiting"[[:space:]]*:[[:space:]]*\[[^]]*\]' | sed 's/.*\[//;s/\]//')
    if [ "$READY" = "false" ] && [ -n "$REMOTE_AWAITING" ]; then
      # Remote players haven't submitted yet — block to wait
      echo "{\"decision\": \"block\", \"reason\": \"[HYBRID] Waiting for remote player actions: $REMOTE_AWAITING\"}"
      exit 0
    fi
  fi
fi

# --- Read stop_hook_active from stdin ---
INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | grep -o '"stop_hook_active"[[:space:]]*:[[:space:]]*\(true\|false\)' | grep -o '\(true\|false\)')

# --- Poll for messages ---
check_messages() {
  RT_OUTPUT=$(node "$SESSION_HELPER" check-messages "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null)
  if [ -z "$RT_OUTPUT" ]; then
    RT_OUTPUT=$(node "$LEGACY_RT_HELPER" check-messages "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null)
  fi
  if [ -n "$RT_OUTPUT" ]; then
    echo "{\"decision\": \"block\", \"reason\": \"$RT_OUTPUT\"}"
    return 0
  fi
  return 1
}

if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  if check_messages; then
    exit 0
  fi
  exit 0
else
  for i in $(seq 1 "$MAX_POLLS"); do
    if check_messages; then
      exit 0
    fi
    sleep "$POLL_INTERVAL"
  done
  exit 0
fi
