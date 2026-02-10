#!/bin/bash
# .claude/hooks/session-start.sh
# SessionStart hook: restore session context (local, remote, or hybrid)
# Replaces rt-session-start.sh — handles all session types via unified marker.

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
SESSION_HELPER="$PROJECT_DIR/scripts/multiplayer-session.js"
LEGACY_RT_HELPER="$PROJECT_DIR/scripts/rt-session.js"

# === DREAMING CHECK (before multiplayer) ===
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

# === UNIFIED SESSION CHECK ===
UNIFIED_MARKER="/tmp/agent-quest-session.yaml"
LEGACY_RT_MARKER="/tmp/agent-quest-rt-session"

# Determine which marker is active
SESSION_DATA=""
SESSION_ID=""
SESSION_TYPE=""

if [ -f "$UNIFIED_MARKER" ]; then
  SESSION_DATA=$(cat "$UNIFIED_MARKER" 2>/dev/null)
  SESSION_ID=$(echo "$SESSION_DATA" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));process.stdout.write(d.session_id||'')" 2>/dev/null)
  SESSION_TYPE=$(echo "$SESSION_DATA" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));process.stdout.write(d.session_type||'')" 2>/dev/null)
elif [ -f "$LEGACY_RT_MARKER" ]; then
  # Backward compat: legacy RT session still active
  SESSION_ID=$(cat "$LEGACY_RT_MARKER" 2>/dev/null)
  SESSION_TYPE="remote"
else
  # No session = exit silently
  exit 0
fi

if [ -z "$SESSION_ID" ]; then
  exit 0
fi

# --- For remote/hybrid: fetch and display remote session info ---
if [ "$SESSION_TYPE" = "remote" ] || [ "$SESSION_TYPE" = "hybrid" ]; then
  git fetch origin "refs/heads/rt/$SESSION_ID/session" 2>/dev/null

  SESSION_YAML=$(git show "origin/rt/$SESSION_ID/session:session.yaml" 2>/dev/null)
  if [ -z "$SESSION_YAML" ] && [ "$SESSION_TYPE" = "remote" ]; then
    echo "[SESSION] Warning: Session marker exists for $SESSION_ID but session branch not found."
    echo "[SESSION] Remove /tmp/agent-quest-session.yaml to disable session mode."
    exit 0
  fi

  # Check if session is ended
  if [ -n "$SESSION_YAML" ]; then
    STATUS=$(echo "$SESSION_YAML" | grep "^status:" | head -1 | awk '{print $2}')
    if [ "$STATUS" = "ended" ]; then
      echo "[SESSION] Session $SESSION_ID has ended. Cleaning up marker."
      rm -f "$UNIFIED_MARKER" "$LEGACY_RT_MARKER"
      exit 0
    fi
  fi
fi

# --- Extract session info from unified marker ---
PLAYER_GITHUB=$(gh api user -q '.login' 2>/dev/null)

if [ -f "$UNIFIED_MARKER" ]; then
  # Parse unified marker for HUD
  HOST_GITHUB=$(echo "$SESSION_DATA" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));process.stdout.write(d.host?.github||'')" 2>/dev/null)

  PARTICIPANTS_INFO=$(echo "$SESSION_DATA" | node -e "
    const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    const ps = d.participants || [];
    for (const p of ps) {
      const tag = p.transport === 'remote' ? ' @' + p.github : '';
      const statusTag = p.status === 'invited' ? ' (invited)' : '';
      console.log('  ' + (p.name || p.id) + (p.class ? ' [' + p.class + ' ' + (p.level||'?') + ']' : '') + tag + statusTag);
    }
  " 2>/dev/null)

  TURN_INFO=$(echo "$SESSION_DATA" | node -e "
    const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    process.stdout.write('Round ' + (d.turn?.round || 1) + ' | Mode: ' + (d.turn?.mode || 'group'));
  " 2>/dev/null)

  echo "[REALTIME SESSION ACTIVE: $SESSION_ID]"
  echo "  Host: ($HOST_GITHUB)"
  echo "  Type: $SESSION_TYPE"
  if [ -n "$PARTICIPANTS_INFO" ]; then
    echo "  Participants:"
    echo "$PARTICIPANTS_INFO"
  fi
  echo "  Turn: $TURN_INFO"
else
  # Legacy RT: use old-style display
  HOST_GITHUB=$(echo "$SESSION_YAML" | grep -A1 "^host:" | grep "github:" | head -1 | sed 's/.*github: *["]*//;s/["]*$//')
  HOST_CHAR=$(echo "$SESSION_YAML" | grep -A2 "^host:" | grep "character:" | head -1 | sed 's/.*character: *["]*//;s/["]*$//')

  TURN_MODE=$(echo "$SESSION_YAML" | grep "turn_mode:" | head -1 | awk '{print $2}')
  TURN_MODE=${TURN_MODE:-simultaneous}

  echo "[REALTIME SESSION ACTIVE: $SESSION_ID]"
  echo "  Host: $HOST_CHAR ($HOST_GITHUB)"
  echo "  Status: active"
  echo "  Turn Mode: $TURN_MODE"
fi

# --- Remote-specific output ---
if [ "$SESSION_TYPE" = "remote" ] || [ "$SESSION_TYPE" = "hybrid" ]; then
  OUTBOX_PATH="/tmp/agent-quest-rt-outbox-$SESSION_ID.yaml"
  STATE_PATH="/tmp/agent-quest-rt-state-$SESSION_ID.yaml"

  # Check player role (spectator check)
  PLAYER_ROLE="player"
  if [ -f "$UNIFIED_MARKER" ]; then
    PLAYER_ROLE=$(echo "$SESSION_DATA" | node -e "
      const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
      const me = (d.participants||[]).find(p => p.github === '$PLAYER_GITHUB');
      process.stdout.write(me?.role || 'player');
    " 2>/dev/null)
  fi

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
fi

# --- Local/hybrid HUD hint ---
if [ "$SESSION_TYPE" = "local" ] || [ "$SESSION_TYPE" = "hybrid" ]; then
  LOCAL_CHARS=$(echo "$SESSION_DATA" | node -e "
    const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
    const local = (d.participants||[]).filter(p => p.transport === 'local');
    process.stdout.write(local.map(p => p.name || p.id).join(', '));
  " 2>/dev/null)
  echo ""
  echo "Local characters: $LOCAL_CHARS"
  echo "Session marker: /tmp/agent-quest-session.yaml"
fi

exit 0
