# Multiplayer Session Quick Reference

Unified multiplayer sessions replace the separate Local Party and RT systems. One session system handles local (couch co-op), remote (realtime), and hybrid (mixed) play.

## Session Types

| Type | Description | Remote Hooks | Git Syncing |
|------|-------------|-------------|-------------|
| **local** | All participants `transport: local` (same user, 2-4 chars) | No | No |
| **remote** | All participants `transport: remote` (cross-user RT) | Yes | Yes |
| **hybrid** | Mix of local + remote participants | Yes | Yes |

Session type is **computed** from participant transports, not configured. A local session becomes hybrid when a remote player joins.

## Session Marker

Single marker file: `/tmp/agent-quest-session.yaml` (JSON format)

Replaces both `/tmp/agent-quest-local-party.yaml` and `/tmp/agent-quest-rt-session`.

## Commands

### Session Lifecycle

```bash
# Pure local (was: local-party.js create)
node scripts/multiplayer-session.js create --github matt-davison --char coda --char steve-strong

# Pure remote (was: rt-session.js create-session)
node scripts/multiplayer-session.js create --github matt-davison --char coda --remote-guest Wat96

# Hybrid: local party + remote friend
node scripts/multiplayer-session.js create --github matt-davison --char coda --char steve-strong --remote-guest Wat96

# Join existing session
node scripts/multiplayer-session.js join <session-id> <character> [--spectator]

# End session
node scripts/multiplayer-session.js end

# Check status
node scripts/multiplayer-session.js status
```

### Groups / Turns

```bash
node scripts/multiplayer-session.js next-turn
node scripts/multiplayer-session.js split <character> [--to-group <id>]
node scripts/multiplayer-session.js merge <group-a> <group-b>
node scripts/multiplayer-session.js update-location <character> <location-id>
node scripts/multiplayer-session.js update-groups
```

### Remote Transport

```bash
node scripts/multiplayer-session.js check-messages [sid] [github]
node scripts/multiplayer-session.js check-inbox [github]
node scripts/multiplayer-session.js push-outbox [sid] [github]
node scripts/multiplayer-session.js push-state [sid]
node scripts/multiplayer-session.js send-invite <sid> <target> [from] [char]
node scripts/multiplayer-session.js send-notification <type> <target> <from> <char> <msg> [json]
node scripts/multiplayer-session.js check-turn [sid] [github]
```

### Hybrid-Specific

```bash
node scripts/multiplayer-session.js submit-local-actions '<json>'
node scripts/multiplayer-session.js check-group-ready
node scripts/multiplayer-session.js resolve-group-turn
```

## HUD Format

Display at the start of each round (all session types):

```
======== MULTIPLAYER SESSION ======== Round 3 ========
 GROUP A - Outpost Greyspire
  > Coda [Datamancer 2] HP:100/100 WP:36/36 40g
    Steve [Ironclad 3] HP:85/120 WP:18/20 200g
    Ichnor Nif [Voidwalker 4] HP:94/100 WP:28/30 50g  @Wat96
=======================================================
 Coda and Steve: What do they do?
 Ichnor Nif (@Wat96): awaiting remote action...
```

- `>` marks the active group's characters
- `@github` tag shows remote players
- One HUD per round, not per character

## Hybrid Turn Resolution

When a group has both local and remote characters:

**Phase 1 — Local declaration (immediate):**
Host declares local character actions. Buffered via `submit-local-actions`.

**Phase 2 — Wait for remote + resolve:**
Stop hook polls for remote player's outbox message. Once received (or after timeout), all actions resolve as one group scene.

**Timeout:** If remote player doesn't respond within `max_idle_polls * poll_interval_sec`, local actions resolve immediately. Remote player catches up next round.

## Hook Behavior by Session Type

| Hook | Local | Remote | Hybrid |
|------|-------|--------|--------|
| **session-start.sh** | Show HUD + local chars | Show RT info + temp paths | Both |
| **session-sync.sh** | Skip remote checks | Check RT messages | Check RT messages |
| **session-auto-push.sh** | Skip entirely | Push outbox/state | Push outbox/state |
| **session-stop.sh** | Allow stop immediately | Poll for messages | Group-ready check + poll |

## Emergency Kill Switch

Delete `/tmp/agent-quest-session.yaml` to instantly disable all session hooks and return to normal async mode.

## Backward Compatibility

During transition, hooks check for both the unified marker (`/tmp/agent-quest-session.yaml`) and the legacy RT marker (`/tmp/agent-quest-rt-session`). Existing RT sessions finish normally.

## Migration from Old Scripts

| Old | New |
|-----|-----|
| `node scripts/local-party.js create ...` | `node scripts/multiplayer-session.js create ...` |
| `node scripts/rt-session.js create-session ...` | `node scripts/multiplayer-session.js create ... --remote-guest ...` |
| `node scripts/local-party.js next-turn` | `node scripts/multiplayer-session.js next-turn` |
| `node scripts/rt-session.js check-messages` | `node scripts/multiplayer-session.js check-messages` |
| `node scripts/rt-session.js end-session` | `node scripts/multiplayer-session.js end` |
