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
