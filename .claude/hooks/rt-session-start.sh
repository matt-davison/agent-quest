#!/bin/bash
# .claude/hooks/rt-session-start.sh
# SessionStart hook: restore RT context when a session resumes
# If no active RT session, exits silently.

RT_MARKER="/tmp/agent-quest-rt-session"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-.}"
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

# Get guest list
GUESTS=$(echo "$SESSION_YAML" | grep -A3 "- github:" | grep -E "(github|character|status):" | paste - - - | while read line; do
  g=$(echo "$line" | sed 's/.*github: *["]*//;s/["]*\s*character:.*//')
  c=$(echo "$line" | sed 's/.*character: *["]*//;s/["]*\s*status:.*//')
  s=$(echo "$line" | sed 's/.*status: *//;s/["]*$//')
  echo "    $c ($g) - $s"
done)

OUTBOX_PATH="/tmp/agent-quest-rt-outbox-$SESSION_ID.yaml"
STATE_PATH="/tmp/agent-quest-rt-state-$SESSION_ID.yaml"

echo "[REALTIME SESSION ACTIVE: $SESSION_ID]"
echo "  Host: $HOST_CHAR ($HOST_GITHUB)"
if [ -n "$GUESTS" ]; then
  echo "  Guests:"
  echo "$GUESTS"
fi
echo "  Status: $STATUS"
echo ""
echo "You are in a realtime multiplayer session."
echo "Write player actions to: $OUTBOX_PATH"
echo "Write shared state to: $STATE_PATH (host only)"
echo "Other players' messages appear via the sync hook."

exit 0
