# Multiplayer Systems Rules

> **Agent:** multiplayer-handler | **Quick-ref:** [quick-ref/multiplayer.md](../quick-ref/multiplayer.md)

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

## Friends System

### Overview

Persistent social connections between players with activity tracking and block enforcement.

### Storage

Friends data is **world-agnostic** and stored in `players/<github>/friends.yaml` at the repository root. This is separate from world-scoped player data.

### Friendship Rules

- **Mutual relationship**: Friendships exist in both players' files simultaneously
- **Max friends**: 50 per player
- **Cannot friend yourself**
- **Request expiry**: Pending requests expire after 7 days
- **Auto-accept**: If A sends a request to B while B has a pending request to A, both are auto-accepted

### Friend Request Lifecycle

```
PENDING → ACCEPTED (added to friends[])
        ↘ REJECTED (removed from pending)
        ↘ EXPIRED (7 days, auto-removed)
```

### Block List

Blocking a player:
1. Removes any existing friendship (both sides)
2. Removes any pending requests (both directions)
3. Prevents the blocked player from sending:
   - Friend requests
   - Trade offers
   - Mail messages
   - Duel challenges
4. Block is one-directional (only the blocker's file is modified)
5. The blocked player is NOT notified

### Block Enforcement in Other Systems

The multiplayer-handler checks block lists **before** processing:
- `TRADE CREATE` - Cannot trade with blocked player
- `MAIL SEND` - Cannot send mail to blocked player
- `DUEL CHALLENGE` - Cannot challenge blocked player
- `FRIEND ADD` - Cannot send request to player who blocked you

### Activity Status

The FRIENDS list and GUILD ROSTER show each player's activity status using presence data:

| Status | Condition | Location Shown |
|--------|-----------|----------------|
| Active | < 30 min since last action | Yes |
| Idle | 30 min - 2 hr | Yes |
| Away | 2 hr - 8 hr | No |
| Offline | 8+ hr | No |

### Edge Cases

| Scenario | Resolution |
|----------|------------|
| Both players send requests simultaneously | Auto-accept (mutual request) |
| Block while trade is pending | Trade cancelled, escrow returned |
| Blocked player tries to interact | Generic "cannot interact" (no reveal) |
| Friend request to player at 50 friends | FRIENDS_LIMIT error for target |
| Player deletes character | Friends list persists (tied to github, not character) |

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

### Friends Validation
- Friendships are mutual (if A has B as friend, B must have A)
- No self-friends (github != own github)
- Friends count within limit (max 50)
- No player appears in both friends[] and blocked[] simultaneously
- Pending requests have valid expiration dates
- Blocked players have no pending requests between them

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

---

## Realtime Multiplayer (RT) System

### Overview

The RT system enables live multiplayer sessions where players interact in near-realtime (5-10 second round-trips). It uses **git branches as a message bus** — all communication flows through remote branches via the GitHub API. The local working tree is never affected.

### Zero Local Impact Principle

RT messages never touch the local working tree:
- **Reads:** `git show origin/rt/<session>/msg/<player>:outbox.yaml` reads from git's object store after a `git fetch`
- **Writes:** `gh api` pushes files to remote branches. Nothing local changes.

Players can be on `main` (or any feature branch) with uncommitted work, and RT messages flow independently.

### Branch Structure

```
inbox/<github-username>                 # Permanent inbox (invites, mail, notifications)
rt/<session-id>/session                 # Session metadata
rt/<session-id>/state                   # Host-authoritative shared state
rt/<session-id>/msg/<github-username>   # Per-player message outbox
```

**Ownership (one writer per branch):**
- `inbox/<github>` — only that player writes here
- `rt/<sid>/msg/<github>` — only that player writes here
- `rt/<sid>/state` — only the host writes here
- `rt/<sid>/session` — host creates, guests update their own entry

### Inbox System

Each player has a permanent `inbox/<github>` branch for async notifications:

```yaml
# notifications.yaml
player: "Wat96"
notifications:
  - seq: 1
    type: rt-invite          # rt-invite | trade-offer | mail | guild-invite | duel-challenge
    from: "matt-davison"
    from_character: "Coda"
    session_id: "rt-20260206-041500-a3f2"
    message: "Coda invites you to a realtime adventure session."
    expires: "2026-02-06T05:15:00Z"
    status: pending          # pending | accepted | declined | expired
```

The `UserPromptSubmit` hook reads the player's inbox on every prompt and announces pending notifications.

### Session Lifecycle

**Starting a session (host):**
1. Generate session ID: `rt-YYYYMMDD-HHMMSS-<random4>`
2. Create `session.yaml` → push to `rt/<sid>/session` branch via `gh api`
3. Create empty `outbox.yaml` → push to `rt/<sid>/msg/<host>` via `gh api`
4. Write session ID to `/tmp/agent-quest-rt-session` (local marker)
5. Send invite to guest's inbox branch
6. Helper: `node scripts/rt-session.js create-session <character> [guests...]`

**Joining a session (guest):**
1. Read session ID from inbox invite
2. Fetch and verify `session.yaml` (active, not expired)
3. Create own `outbox.yaml` → push to `rt/<sid>/msg/<guest>` via `gh api`
4. Update `session.yaml` guest status to `joined`
5. Write session ID to `/tmp/agent-quest-rt-session`
6. Helper: `node scripts/rt-session.js join-session <sid> <character>`

**Playing (the universal loop):**
1. Player describes action (combat, trade, chat, anything)
2. Claude writes message to outbox temp file (`/tmp/agent-quest-rt-outbox-<sid>.yaml`)
3. `PostToolUse` hook auto-pushes to GitHub via `gh api`
4. `Stop` hook polls for other players' responses
5. If responses found → Claude processes and continues
6. If not → Claude stops, waits for next input

**Ending a session (host only):**
1. Set `session.yaml` status to `ended`
2. Read full action history from all outboxes
3. Calculate state deltas (XP, gold, items, chronicle)
4. Apply deltas to player persona files on local working tree
5. Commit and create PR to merge results to `main`
6. Delete `/tmp/agent-quest-rt-session`
7. Helper: `node scripts/rt-session.js end-session [sid]`

### Message Format

The RT outbox is a **universal message bus**. Every interaction flows through the same append-only outbox:

```yaml
# outbox.yaml on rt/<sid>/msg/<github>
player: "matt-davison"
character: "Coda"
messages:
  - seq: 1
    timestamp: "2026-02-06T04:15:32Z"
    type: combat.action          # dot-notation namespace
    action: attack
    target: "goblin-1"
    details: { ability: "ny1uz95q", roll: 17 }
    narrative: "Coda channels the Weave, manifesting a blade of light..."
```

**Message types:** `combat.action`, `combat.result`, `trade.offer`, `trade.accept`, `trade.reject`, `trade.counter`, `trade.cancel`, `trade.complete`, `party.invite`, `party.accept`, `party.reject`, `party.kick`, `party.leave`, `party.promote`, `party.loot_mode`, `mail.send`, `guild.invite`, `guild.deposit`, `guild.withdraw`, `guild.promote`, `guild.kick`, `duel.challenge`, `duel.accept`, `duel.decline`, `duel.action`, `duel.forfeit`, `duel.result`, `presence.update`, `emote`, `ooc`, `event.contribute`

**Key properties:**
- `seq` is monotonically increasing per player
- Outboxes are append-only — never rewrite, only append
- `narrative` is always present — human-readable description
- `to` targets a specific player (absent = broadcast)
- `details` carries machine-readable data

### Authority Model

| Type | Authority | Description |
|------|-----------|-------------|
| `combat.*` | Host resolves | Guest declares intent, host determines outcome |
| `duel.*` | Host resolves | Same as combat |
| `trade.*` | Peer-to-peer | Either party initiates/responds |
| `mail.*` | Peer-to-peer | Direct between players |
| `party.*` | Role-based | Leader for invite/kick/promote |
| `guild.*` | Role-based | Per rank permissions |
| `presence.*` | Self only | Player controls own status |
| `emote` | Self only | Player controls own actions |
| `ooc` | Self only | Out-of-character chat |
| `event.*` | Self + host validates | Host validates contributions |

### Shared State

The host maintains `state.yaml` on `rt/<sid>/state`:

```yaml
version: 5
timestamp: "2026-02-06T04:20:00Z"
encounter:
  id: "enc-001"
  status: active
  enemies: [...]
  turn_order: [...]
trades:
  - trade_id: "..."
    status: completed
pending_deltas:
  matt-davison:
    xp: 150
    gold: -50
    items_gained: ["healing-potion"]
    items_lost: ["iron-sword"]
    chronicle: ["Fought cave goblins with Ichnor Nif"]
```

The `pending_deltas` section accumulates all state changes for clean application to personas on `main` at session end.

### Infinite Loop Prevention

1. **`stop_hook_active` flag** — Stop hook checks once in forced-continue mode
2. **Loop counter** — `/tmp/agent-quest-rt-loops-<sid>` caps at 50 iterations
3. **Max idle polls** — Stop hook polls `max_idle_polls` times (default 5) before allowing stop
4. **Session marker deletion** — Remove `/tmp/agent-quest-rt-session` to instantly disable RT
5. **Session timeout** — 10 minutes of inactivity pauses the session

### Stale Read Handling

If a player acts on outdated state:
- Host resolves gracefully with a narrative redirect
- The `version` field in `state.yaml` lets Claude detect staleness
- Example: "The goblin is already slain. Your blow strikes empty air."

### RT Helper Script

All RT operations use `scripts/rt-session.js`:

```bash
node scripts/rt-session.js create-session <char> [guests...]
node scripts/rt-session.js join-session <sid> [char]
node scripts/rt-session.js end-session [sid]
node scripts/rt-session.js check-inbox [github]
node scripts/rt-session.js check-messages [sid] [github]
node scripts/rt-session.js push-outbox [sid] [github]
node scripts/rt-session.js push-state [sid]
node scripts/rt-session.js send-invite <sid> <target> [from] [char]
node scripts/rt-session.js session-info [sid]
node scripts/rt-session.js outbox-path [sid]
node scripts/rt-session.js state-path [sid]
node scripts/rt-session.js check-turn [sid] [github]
```

### Turn Modes

Sessions support two turn modes, set at creation time:

| Mode | Description |
|------|-------------|
| `simultaneous` (default) | All players act freely. No turn enforcement. Standard RT behavior. |
| `initiative` | Players act in a defined order during encounters. The Stop hook blocks actions when it's not your turn. |

**Creating an initiative session:**

```bash
node scripts/rt-session.js create-session "Coda" --turn-mode initiative "Wat96"
```

**How initiative works:**

1. Host sets `encounter.turn_order` and `encounter.current_turn` in `state.yaml`
2. The Stop hook calls `check-turn` before polling for messages
3. If it's not the player's turn, the hook blocks with `[INITIATIVE] Waiting for <player>'s turn...`
4. Outside of active encounters (no encounter or encounter not active), all players act freely
5. The host is responsible for advancing `current_turn` after each player's action

**Turn order source of truth:** `state.yaml` on the `rt/<sid>/state` branch:

```yaml
encounter:
  id: "enc-001"
  status: active
  turn_order: ["matt-davison", "Wat96"]
  current_turn: 0
```

**Non-combat during initiative:** The Stop hook blocks all actions when it's not your turn. Claude should still narrate OOC/emote responses from other players — the hook only blocks the stop, not message reading.

### Spectator Mode

Spectators are read-only observers who see all messages but cannot take actions.

**Joining as spectator:**

```bash
node scripts/rt-session.js join-session <sid> "ObserverName" --spectator
```

**Spectator characteristics:**

- **No outbox:** Spectators get no `rt/<sid>/msg/<github>` branch. If Claude tries to write to an outbox temp file, auto-push will fail silently.
- **No stop blocking:** The Stop hook exits immediately for spectators (they never need to wait for messages).
- **Session start display:** Shows `[SPECTATOR MODE]` and omits the outbox path line.
- **role field:** Spectators have `role: spectator` in session.yaml (players have `role: player`).
- **Turn order exclusion:** Spectators are never included in initiative turn order.

**Use cases:**

- GMs observing a session they're not hosting
- New players watching before joining
- Streaming/recording sessions
- Debugging multiplayer issues

**Uninvited spectators:** If a spectator joins without being pre-invited in the guest list, `join-session` appends a new guest entry with `role: spectator` and `status: joined`.
