#!/bin/bash
# .claude/hooks/rt-session-start.sh
# SessionStart hook: restore RT context when a session resumes
# If no active RT session, exits silently.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"

# === DREAMING CHECK (before RT) ===
DREAM_MARKER="/tmp/agent-quest-dreaming.json"
if [ -f "$DREAM_MARKER" ]; then
  DREAM_FIELDS=$(node -e "
    const d=JSON.parse(require('fs').readFileSync('$DREAM_MARKER','utf8'));
    console.log(d.character||'');
    console.log(d.mode||'');
    console.log(d.turn_count||0);
    console.log(d.last_turn_summary||'');
    console.log(d.persona_path||'');
  " 2>/dev/null)
  CHAR=$(echo "$DREAM_FIELDS" | sed -n '1p')
  MODE=$(echo "$DREAM_FIELDS" | sed -n '2p')
  TURN=$(echo "$DREAM_FIELDS" | sed -n '3p')
  SUMMARY=$(echo "$DREAM_FIELDS" | sed -n '4p')
  PERSONA=$(echo "$DREAM_FIELDS" | sed -n '5p')

  echo "[DREAMING SESSION ACTIVE]"
  echo "  Character: $CHAR | Mode: $MODE | Turn: $TURN"
  echo "  Last action: $SUMMARY"
  echo "  Reload state from: $PERSONA/persona.yaml"
  echo "  Continue The Dreaming. The Stop hook will drive the loop."
  exit 0
fi

# === RT MULTIPLAYER CHECK ===
RT_MARKER="/tmp/agent-quest-rt-session"
RT_HELPER="$PROJECT_DIR/scripts/rt-session.js"

# No marker = no RT session = exit silently
if [ ! -f "$RT_MARKER" ]; then
  exit 0
fi

SESSION_ID=$(cat "$RT_MARKER" 2>/dev/null)
if [ -z "$SESSION_ID" ]; then
  exit 0
fi

# Fetch and display session info
git fetch origin "refs/heads/rt/$SESSION_ID/session" 2>/dev/null

SESSION_YAML=$(git show "origin/rt/$SESSION_ID/session:session.yaml" 2>/dev/null)
if [ -z "$SESSION_YAML" ]; then
  echo "[RT] Warning: Session marker exists for $SESSION_ID but session branch not found."
  echo "[RT] Remove /tmp/agent-quest-rt-session to disable RT mode."
  exit 0
fi

# Check if session is ended
STATUS=$(echo "$SESSION_YAML" | grep "^status:" | head -1 | awk '{print $2}')
if [ "$STATUS" = "ended" ]; then
  echo "[RT] Session $SESSION_ID has ended. Cleaning up marker."
  rm -f "$RT_MARKER"
  exit 0
fi

# Extract session details
HOST_GITHUB=$(echo "$SESSION_YAML" | grep -A1 "^host:" | grep "github:" | head -1 | sed 's/.*github: *["]*//;s/["]*$//')
HOST_CHAR=$(echo "$SESSION_YAML" | grep -A2 "^host:" | grep "character:" | head -1 | sed 's/.*character: *["]*//;s/["]*$//')

# Get guest list (including role)
GUESTS=$(echo "$SESSION_YAML" | grep -A4 "- github:" | grep -E "(github|character|status|role):" | paste - - - - | while read line; do
  g=$(echo "$line" | sed 's/.*github: *["]*//;s/["]*\s*character:.*//')
  c=$(echo "$line" | sed 's/.*character: *["]*//;s/["]*\s*status:.*//')
  s=$(echo "$line" | sed 's/.*status: *//;s/\s*role:.*//')
  r=$(echo "$line" | sed 's/.*role: *//')
  if [ "$r" = "spectator" ]; then
    echo "    $c ($g) - $s [spectator]"
  else
    echo "    $c ($g) - $s"
  fi
done)

# Get current player's github
PLAYER_GITHUB=$(gh api user -q '.login' 2>/dev/null)

# Get player's role
PLAYER_ROLE=$(echo "$SESSION_YAML" | grep -A4 "github: \"$PLAYER_GITHUB\"" | grep "role:" | head -1 | awk '{print $2}')
PLAYER_ROLE=${PLAYER_ROLE:-player}

# Get turn mode
TURN_MODE=$(echo "$SESSION_YAML" | grep "turn_mode:" | head -1 | awk '{print $2}')
TURN_MODE=${TURN_MODE:-simultaneous}

OUTBOX_PATH="/tmp/agent-quest-rt-outbox-$SESSION_ID.yaml"
STATE_PATH="/tmp/agent-quest-rt-state-$SESSION_ID.yaml"

echo "[REALTIME SESSION ACTIVE: $SESSION_ID]"
echo "  Host: $HOST_CHAR ($HOST_GITHUB)"
if [ -n "$GUESTS" ]; then
  echo "  Guests:"
  echo "$GUESTS"
fi
echo "  Status: $STATUS"
echo "  Turn Mode: $TURN_MODE"

# Initiative mode: show whose turn it is
if [ "$TURN_MODE" = "initiative" ]; then
  TURN_JSON=$(node "$PROJECT_DIR/scripts/rt-session.js" check-turn "$SESSION_ID" "$PLAYER_GITHUB" 2>/dev/null)
  if [ -n "$TURN_JSON" ]; then
    IS_MY_TURN=$(echo "$TURN_JSON" | grep -o '"is_my_turn"[[:space:]]*:[[:space:]]*\(true\|false\)' | grep -o '\(true\|false\)')
    CURRENT_PLAYER=$(echo "$TURN_JSON" | grep -o '"current_player"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"current_player"[[:space:]]*:[[:space:]]*"//;s/"$//')
    if [ "$IS_MY_TURN" = "true" ]; then
      echo "  Current Turn: YOUR TURN"
    elif [ -n "$CURRENT_PLAYER" ]; then
      echo "  Current Turn: $CURRENT_PLAYER"
    fi
  fi
fi

# Spectator mode display
if [ "$PLAYER_ROLE" = "spectator" ]; then
  echo ""
  echo "[SPECTATOR MODE] You are observing this session (read-only)."
  echo "You can see all messages but cannot take actions."
else
  echo ""
  echo "You are in a realtime multiplayer session."
  echo "Write player actions to: $OUTBOX_PATH"
  echo "Write shared state to: $STATE_PATH (host only)"
fi
echo "Other players' messages appear via the sync hook."

exit 0
