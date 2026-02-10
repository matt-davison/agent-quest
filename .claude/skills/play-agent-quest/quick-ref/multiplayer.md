# Multiplayer Quick Reference

Fast lookup for player-to-player interactions during gameplay.

## Syncing Multiplayer Updates

**AUTOMATIC**: The `UserPromptSubmit` hook (`.claude/hooks/rt-sync.sh`) runs before each prompt and handles both modes:

- **Async mode** (no RT session): Fetches `origin/main`, merges new commits, and shows a notification if updates were pulled. This surfaces new trade offers, party invites, guild updates, mail, and world events.
- **RT mode** (active session): Checks the player's `inbox/<github>` branch for notifications and fetches new messages from other players' outboxes via `scripts/rt-session.js`.

## Friends Commands

| Command | Action |
|---------|--------|
| FRIENDS | Show friends list with activity status |
| FRIEND ADD @player | Send friend request (auto-accept if mutual) |
| FRIEND ACCEPT @player | Accept pending request |
| FRIEND REJECT @player | Reject pending request |
| FRIEND REMOVE @player | Remove from friends list |
| FRIEND BLOCK @player | Block player (auto-removes, rejects requests) |
| FRIEND UNBLOCK @player | Unblock player |

### Friends Rules
- Friends data stored in `players/<github>/friends.yaml` (world-agnostic)
- Friendships are mutual (both files updated)
- Max 50 friends per player
- Requests expire after 7 days
- Mutual pending requests auto-accept
- Blocked players cannot send friend requests, trades, mail, or duel challenges
- Blocking auto-removes existing friendship

### Activity Status
FRIENDS output shows each friend's status + location (if active/idle).

| Status | Condition |
|--------|-----------|
| Active | Recent action (< 30 min) |
| Idle | No action for 30 minutes |
| Away | No action for 2 hours |
| Offline | No action for 8+ hours |

## Trading

### Create Trade Offer
1. Verify player has items/gold available (persona.yaml - escrow)
2. Move items/gold to `multiplayer/trades/escrow/<github>.yaml`
3. Create trade file in `multiplayer/trades/active/<trade-id>.yaml`

### Accept Trade
1. Target moves their items/gold to escrow
2. Update trade status to "accepted"
3. Transfer items between escrows
4. Archive to `multiplayer/trades/completed/<YYYY-MM>/`

### Trade Expires
Auto-expire after 72 hours. Return escrow to original owners.

## Party Commands

| Command | Action |
|---------|--------|
| PARTY CREATE | Create new party (you become leader) |
| PARTY INVITE @player | Send party invite |
| PARTY ACCEPT | Accept pending invite |
| PARTY LEAVE | Leave current party |
| PARTY KICK @player | Remove member (leader/officer only) |
| PARTY STATUS | Show roster and shared state |

### Party Rules
- One party per character
- Max 6 members (default)
- Leader promotes on 7-day inactivity
- Loot distribution modes: round-robin, need-greed, leader, free-for-all

## Mail Commands

| Command | Action |
|---------|--------|
| MAIL | Check inbox |
| MAIL READ [id] | Read specific message |
| MAIL SEND @player | Compose message |
| MAIL ATTACH [item] | Add item attachment |
| MAIL CLAIM [id] | Claim attachments |

### Mail Rules
- Attachments use escrow (same as trades)
- Unclaimed attachments expire after 30 days
- Expired attachments return to sender

## Guild Commands

| Command | Action |
|---------|--------|
| GUILD | View your guild |
| GUILD CREATE [name] | Found new guild (100g) |
| GUILD INVITE @player | Invite to guild |
| GUILD DEPOSIT [amount] | Add gold to treasury |
| GUILD ROSTER | View member list with activity status |

### Guild Roster Activity
GUILD ROSTER shows each member's activity status (active/idle/away/offline) and current location (if active/idle), using the same presence system as the FRIENDS list.

### Guild Ranks
- **Founder**: All permissions, cannot leave
- **Officer**: Invite, kick, withdraw (100g/day limit)
- **Member**: Deposit, access benefits
- **Recruit**: Limited benefits

### Guild Benefits by Level
| Level | Requirement | Benefit |
|-------|-------------|---------|
| 1 | Founded | Shared roster |
| 2 | 500g treasury | 5% shop discount |
| 3 | 2000g treasury | Guild bank |
| 4 | 5000g treasury | 10% XP bonus |
| 5 | 10000g treasury | Guild hall |

## Duel Commands

| Command | Action |
|---------|--------|
| DUEL @player | Challenge to duel |
| DUEL ACCEPT | Accept challenge |
| DUEL WAGER [amount] | Add gold wager |

### Duel Types
- **Friendly**: No stakes, no ranking
- **Ranked**: Affects Elo rating
- **Wagered**: Gold/items at stake

### Duel Rules
- Uses standard combat system
- No fleeing allowed
- Wagers held in escrow
- Challenges expire after 24h

## Presence Commands

| Command | Action |
|---------|--------|
| WHO | List players at your location |
| WHO [location] | List players at specific location |

### Presence Status
- **Active**: Currently playing
- **Idle**: No action for 30 minutes
- **Away**: No action for 2 hours

## World Events

Check `world/state/events/active/` for current server-wide events.

### Participating
1. Travel to event region
2. Complete contribution actions
3. Earn contribution points
4. Unlock milestone rewards

## Escrow Reference

All item/gold transfers use escrow to prevent duplication:

```
multiplayer/trades/escrow/<github>.yaml
├── gold_in_escrow: [total]
├── items_in_escrow: [list]
└── escrow_log: [append-only history]
```

### Available Balance
```
persona.gold - escrow.gold_in_escrow = available_gold
persona.inventory - escrow.items = available_items
```

## Files to Update

| Action | Files Changed |
|--------|---------------|
| Friend add/accept/remove/block | players/<github>/friends.yaml (both players, top-level) |
| Create trade | escrow/<github>.yaml, trades/active/<id>.yaml |
| Complete trade | Both escrows, persona.yaml (x2), archive trade |
| Join party | party.yaml, party-membership.yaml |
| Send mail | escrow (if attach), mail/<to>/inbox/, mail/<from>/sent/ |
| Guild deposit | treasury.yaml, persona.yaml |
| Start duel | escrow (x2), duels/<id>.yaml |
| Update presence | world/state/presence.yaml |

---

## Multiplayer Sessions (Unified)

Live multiplayer sessions supporting local (couch co-op), remote (RT), and hybrid play. Uses `scripts/multiplayer-session.js` as the unified helper.

**Full reference:** See [quick-ref/multiplayer-session.md](multiplayer-session.md) for complete session documentation.

### Session Commands

| Command | Action |
|---------|--------|
| "Start session with [characters]" | Create local session (2-4 chars, same user) |
| "Start session with @player" | Create remote session, send invite |
| "Start session with [chars] and @player" | Create hybrid session |
| "Join session" / "Join session <id>" | Join from inbox invite |
| "Join session as spectator" | Join as read-only observer |
| "End session" | End session, create PR with deltas |

### How It Works

1. Single marker at `/tmp/agent-quest-session.yaml` tracks all session types
2. Session type (`local`/`remote`/`hybrid`) is computed from participant transports
3. Remote messages flow through git branches (`rt/<sid>/msg/<github>`)
4. Hooks auto-sync: `session-sync.sh` fetches, `session-auto-push.sh` pushes, `session-stop.sh` polls
5. Local sessions skip all git operations (fast, no network)

### RT Message Types

| Type | Example |
|------|---------|
| `combat.action` | Attack, heal, ability use |
| `combat.result` | Host's resolution |
| `trade.offer/accept/reject` | In-session trading |
| `party.invite/accept/kick` | Party management |
| `mail.send` | Direct messages |
| `duel.challenge/action/result` | PvP |
| `emote` | Roleplay actions |
| `ooc` | Out-of-character chat |

### Inbox Notifications

All async notifications go to `inbox/<github>` branch (checked on every prompt):
- Session invites
- Trade offers (outside sessions)
- Mail messages
- Guild/duel invitations

### Session Helper

```bash
node scripts/multiplayer-session.js create --github <gh> --char <c> [--char <c>] [--remote-guest <gh>]
node scripts/multiplayer-session.js join <sid> <char> [--spectator]
node scripts/multiplayer-session.js end
node scripts/multiplayer-session.js send-invite <sid> <target> [from] [char]
node scripts/multiplayer-session.js check-messages [sid] [github]
node scripts/multiplayer-session.js outbox-path [sid]
node scripts/multiplayer-session.js state-path [sid]
node scripts/multiplayer-session.js check-turn [sid] [github]
```

### Spectator Mode

- Join as spectator: `node scripts/multiplayer-session.js join <sid> "Name" --spectator`
- No outbox (read-only), Stop hook never blocks, excluded from turn order
- `role: spectator` in session data (default `role: player`)

### Authority Model

- **Host resolves:** Combat, duels, world events (single source of truth)
- **Peer-to-peer:** Trades, mail, duel challenges (no host needed)
- **Role-based:** Party/guild management (leader/officer permissions)
- **Self only:** Presence, emotes, OOC chat

### Emergency Kill Switch

Delete `/tmp/agent-quest-session.yaml` to instantly disable all session hooks and return to normal async mode.
