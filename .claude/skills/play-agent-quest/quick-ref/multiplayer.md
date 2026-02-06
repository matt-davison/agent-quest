# Multiplayer Quick Reference

Fast lookup for player-to-player interactions during gameplay.

## Syncing Multiplayer Updates

**AUTOMATIC**: This project is configured with a `UserPromptSubmit` hook that automatically syncs multiplayer updates before each user prompt. You'll see output like:

```
📬 Synced 3 multiplayer update(s) from main branch
```

The hook runs `.claude/hooks/sync-multiplayer.sh` which:
- Fetches latest changes from origin/main
- Safely merges updates (with stashing if needed)
- Shows a notification if updates were pulled

This ensures you automatically see:
- New trade offers
- Party invites
- Guild updates
- Mail messages
- World events
- Other players' actions

**Manual sync** (if needed):
```bash
# From command line
./scripts/sync-multiplayer.sh

# Or with Node.js
node scripts/sync-multiplayer.js
```

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
| GUILD ROSTER | View member list |

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
| Create trade | escrow/<github>.yaml, trades/active/<id>.yaml |
| Complete trade | Both escrows, persona.yaml (x2), archive trade |
| Join party | party.yaml, party-membership.yaml |
| Send mail | escrow (if attach), mail/<to>/inbox/, mail/<from>/sent/ |
| Guild deposit | treasury.yaml, persona.yaml |
| Start duel | escrow (x2), duels/<id>.yaml |
| Update presence | world/state/presence.yaml |

---

## Realtime Multiplayer (RT)

Live multiplayer sessions where players interact in 5-10 second round-trips. Uses git branches as a message bus — zero local working tree impact.

### RT Session Commands

| Command | Action |
|---------|--------|
| "Start RT session with @player" | Create session, send invite |
| "Join session" / "Join RT session <id>" | Join from inbox invite |
| "End RT session" | End session, create PR with deltas (host only) |

### How It Works

1. All messages flow through remote branches (`rt/<sid>/msg/<github>`)
2. Hooks auto-sync: `UserPromptSubmit` fetches, `PostToolUse` pushes, `Stop` polls
3. Claude writes actions to `/tmp/agent-quest-rt-outbox-<sid>.yaml` (auto-pushed by hook)
4. Host writes shared state to `/tmp/agent-quest-rt-state-<sid>.yaml` (auto-pushed)
5. Session marker at `/tmp/agent-quest-rt-session` — delete to instantly disable RT

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
- RT session invites
- Trade offers (outside RT)
- Mail messages
- Guild/duel invitations

### RT Helper

```bash
node scripts/rt-session.js create-session <char> [guests...]
node scripts/rt-session.js join-session <sid> [char]
node scripts/rt-session.js end-session [sid]
node scripts/rt-session.js send-invite <sid> <target> [from] [char]
node scripts/rt-session.js check-messages [sid] [github]
node scripts/rt-session.js outbox-path [sid]
node scripts/rt-session.js state-path [sid]
```

### Authority Model

- **Host resolves:** Combat, duels, world events (single source of truth)
- **Peer-to-peer:** Trades, mail, duel challenges (no host needed)
- **Role-based:** Party/guild management (leader/officer permissions)
- **Self only:** Presence, emotes, OOC chat

### Emergency Kill Switch

Delete `/tmp/agent-quest-rt-session` to instantly disable all RT hooks and return to normal async mode.
