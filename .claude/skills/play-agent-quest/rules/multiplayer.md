# Multiplayer Systems Rules

Comprehensive rules for player-to-player interactions in Agent Quest.

## Design Principles

1. **Per-player files** - Each player's data in separate files to prevent git merge conflicts
2. **Append-only transactions** - Immutable history prevents disputes
3. **Escrow-based transfers** - Items/gold locked before trade prevents duplication
4. **CI validation** - `scripts/validate-multiplayer.js` enforces all rules
5. **Async-friendly** - Players can act hours or days apart

## Trading System

### Overview

Players can trade items and gold with each other using an escrow-based system that prevents item duplication and ensures fair trades.

### Creating a Trade

1. **Check availability**: Items must not be in escrow for another trade
2. **Move to escrow**: Items/gold transferred to `multiplayer/trades/escrow/<github>.yaml`
3. **Create trade offer**: File created in `multiplayer/trades/active/<trade-id>.yaml`

### Trade ID Format

```
trade-YYYYMMDD-HHMMSS-<random6>
```

Example: `trade-20260204-143052-abc123`

### Trade Status Lifecycle

```
PENDING → ACCEPTED → COMPLETED
       ↘ REJECTED
       ↘ CANCELLED (by initiator)
       ↘ EXPIRED (72h default)
```

### Escrow Rules

- **Deposit**: When creating trade or accepting trade
- **Release**: When trade cancelled, rejected, or expired
- **Transfer**: When trade completes

#### Escrow Validation

The validator checks:
- `gold_in_escrow` matches sum of deposits minus releases/transfers in `escrow_log`
- Items in escrow are not simultaneously in persona inventory
- All escrow entries reference valid trade/mail/duel IDs

### Trade Expiration

Trades auto-expire after 72 hours if not acted upon. When expired:
1. Status changes to "expired"
2. Escrow returns to original owners
3. Trade archived (optional)

### Open Market Trades

Setting `to: null` creates an open market offer anyone can accept.

---

## Party System

### Overview

Parties allow players to adventure together, sharing encounters and loot.

### Creating a Party

1. Creator becomes leader
2. Party file created in `multiplayer/parties/active/<party-id>.yaml`
3. Leader's `party-membership.yaml` updated

### Membership Rules

- **One party per character** - Must leave current party before joining another
- **Max members**: 6 by default (configurable)
- **Exactly one leader** - Promoted on leader inactivity

### Party Roles

| Role | Permissions |
|------|-------------|
| Leader | All permissions, set loot mode, kick anyone |
| Officer | Invite, kick members |
| Member | Participate, vote |

### Loot Distribution Modes

| Mode | Description |
|------|-------------|
| `round-robin` | Rotate through members in order |
| `need-greed` | Roll dice, highest wins (need > greed) |
| `leader` | Leader assigns all loot |
| `free-for-all` | First to claim gets it |

### Party Decisions

Major decisions can require party consensus:
- Travel to new location
- Accept/abandon quests
- Kick members

Decision types:
- `majority` - More than half must approve
- `unanimous` - All must approve
- `leader` - Leader decides alone

### Leader Succession

If leader is inactive for 7 days (168 hours):
1. Longest-serving active officer promoted
2. If no officers, longest-serving active member promoted
3. If no active members, party disbanded

### Party Encounters

Shared combat uses `multiplayer/parties/encounters/<id>.yaml`:
- Turn order by initiative roll
- All members participate (or marked "absent")
- Combat log records all actions
- Loot distributed per party settings

---

## Mail System

### Overview

Asynchronous messaging with optional item/gold attachments.

### Message Structure

- **Subject**: Brief summary
- **Body**: Full message content
- **Attachments**: Optional gold and items (use escrow)

### Attachment Rules

1. Attachments moved to sender's escrow on send
2. Transferred to recipient on "claim" action
3. Expire after 30 days if unclaimed
4. Expired attachments return to sender

### Mail Status

- `delivered` - In recipient's inbox
- `read` - Recipient opened message
- `claimed` - Attachments transferred
- `expired` - Attachments returned to sender
- `deleted` - Message removed

### Threading

Messages can reply to other messages using `reply_to` field.
`thread_id` groups related messages.

---

## Guild System

### Overview

Persistent player organizations with shared treasury and benefits.

### Founding a Guild

- Cost: 100 gold
- Founder becomes permanent member (cannot leave)
- Guild starts at level 1

### Guild Ranks

| Rank | Permissions |
|------|-------------|
| Founder | All permissions, unlimited treasury access |
| Officer | Invite, kick, withdraw (limited) |
| Member | Deposit, use benefits |
| Recruit | Limited benefits |

### Treasury Rules

- **Deposits**: Any member can deposit, permanent
- **Withdrawals**:
  - Officers: 100 gold/day limit
  - Founder: Unlimited
- All transactions logged in `treasury.yaml`

### Guild Levels

| Level | Treasury Required | Benefit |
|-------|-------------------|---------|
| 1 | Founded | Shared roster, guild chat |
| 2 | 500 gold | 5% shop discount |
| 3 | 2,000 gold | Guild bank (10 item slots) |
| 4 | 5,000 gold | 10% XP bonus |
| 5 | 10,000 gold | Guild hall location |

### Membership Rules

- One guild per character
- 7-day cooldown after leaving before rejoining any guild
- Founder cannot leave (must transfer or disband)

---

## Duel System

### Overview

Player-vs-player combat with optional wagers and rankings.

### Duel Types

| Type | Description |
|------|-------------|
| `friendly` | No stakes, no ranking impact |
| `ranked` | Affects Elo rating |
| `wagered` | Gold/items at stake |
| `tournament` | Part of organized event |

### Challenge Process

1. Challenger issues challenge (optional wager)
2. Target has 24 hours to accept or decline
3. If accepted, wagers escrowed, combat begins
4. Combat resolves using standard rules
5. Winner determined, wagers/ratings updated

### Combat Modifications

Duels use standard combat with these changes:
- No fleeing allowed
- Reduced death penalty (respawn with 1 HP)
- Turn order by Agility roll each round

### Wager Rules

- Both players must wager equal value (±10%)
- Wagers held in escrow during duel
- Winner takes all on completion
- Draw returns wagers to both
- Forfeit awards wager to opponent

### Rating System

Elo-based rating:
- Starting rating: 1000
- Win vs higher-rated: +30 to +50
- Win vs lower-rated: +10 to +20
- Loss: inverse of above

---

## Presence System

### Overview

Track which players are at each location for multiplayer interactions.

### Presence Status

| Status | Condition |
|--------|-----------|
| Active | Recent action (< 30 min) |
| Idle | No action for 30 minutes |
| Away | No action for 2 hours |
| (Removed) | No action for 8 hours |

### Visibility

Players can set `visible: false` to hide from presence (for stealth gameplay).

### Integration

Presence integrates with:
- `world/state/current.yaml` `travelers_in_transit`
- Location-based multiplayer (see who's at your location)
- Party gathering (verify members are co-located)

---

## World Events

### Overview

Server-wide collaborative events with shared progress.

### Event Types

| Type | Description |
|------|-------------|
| `collaborative` | All players work toward shared goal |
| `competitive` | Players compete for individual ranking |
| `raid` | Group content requiring parties |
| `festival` | Celebration with special activities |

### Contribution Methods

Events define how players can contribute:
- Complete specific actions
- Defeat event enemies
- Gather event items
- Explore event areas

### Rate Limiting

Each contribution method has daily limits to prevent burnout.

### Milestones

Events have thresholds that unlock rewards:
- Global rewards (everyone benefits)
- Individual rewards (top contributors)
- Permanent world changes

---

## Validation Rules

The multiplayer validator (`scripts/validate-multiplayer.js`) enforces:

### Trade Validation
- Trade IDs are unique
- Status transitions are valid
- Escrow references valid entries
- Offered items/gold are in escrow

### Escrow Validation
- Gold totals match transaction log
- Items reference valid trades/mail/duels
- No items simultaneously in escrow and inventory

### Party Validation
- Character in only one party
- Exactly one leader per party
- Member count within max_members
- Party-membership.yaml matches roster

### Guild Validation
- Character in only one guild
- Exactly one founder per guild
- Treasury totals match transaction log
- Valid ranks for all members

### Duel Validation
- Valid status transitions
- Wager escrow exists for active duels
- Rating changes valid for completed duels

### Presence Validation
- No player at multiple locations
- Stale sessions flagged

---

## Edge Cases

| Scenario | Resolution |
|----------|------------|
| Trade target never responds | Auto-expire after 72h, refund escrow |
| Party leader goes inactive | Auto-promote longest-serving active member |
| Player deletes character mid-trade | Escrow returns as "unassigned" |
| Simultaneous trade modifications | Per-player escrow files prevent conflicts |
| Party quest while member offline | Member marked "absent" for that section |
| Guild founder leaves | Must transfer ownership or disband |
| Duel opponent disconnects | 10 minute grace period, then forfeit |
