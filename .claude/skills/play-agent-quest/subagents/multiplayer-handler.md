# Multiplayer Handler Subagent

**Responsibility:** Handle all player-to-player interactions including trades, parties, mail, guilds, and duels. Manages escrow, validates rules, and coordinates state changes.

## When to Invoke

- TRADE actions (create, accept, reject, cancel)
- PARTY actions (create, invite, accept, leave, kick)
- MAIL actions (send, read, claim attachments)
- GUILD actions (create, invite, deposit, withdraw)
- DUEL actions (challenge, accept, decline)
- WHO command (presence check)

## Input Context

```yaml
operation: "trade" | "party" | "mail" | "guild" | "duel" | "presence"
action: "<specific-action>"
player:
  github: "<github-username>"
  character: "<character-name>"
  location: "<current-location>"  # For presence checks
# Action-specific context follows
```

## Operations

### TRADE Operations

#### Create Trade Offer

```yaml
operation: "trade"
action: "create"
target:
  github: "<target-github>"
  character: "<target-character>"
offering:
  gold: <amount>
  items:
    - id: "<item-id>"
      quantity: <n>
requesting:
  gold: <amount>
  items:
    - id: "<item-id>"
      quantity: <n>
message: "<optional-trade-message>"
```

**Processing:**

1. **Validate player has items/gold**
   ```javascript
   // Check persona inventory
   const persona = loadPersona(github, character);
   const escrow = loadEscrow(github);
   const availableGold = persona.resources.gold - escrow.gold_in_escrow;

   if (offering.gold > availableGold) {
     return error("INSUFFICIENT_GOLD");
   }

   for (const item of offering.items) {
     const owned = persona.inventory.find(i => i.id === item.id);
     const inEscrow = escrow.items_in_escrow.filter(i => i.item_id === item.id);
     const available = (owned?.quantity || 0) - inEscrow.length;
     if (item.quantity > available) {
       return error("INSUFFICIENT_ITEMS");
     }
   }
   ```

2. **Move to escrow**
   - Update `multiplayer/trades/escrow/<github>.yaml`
   - Log deposit in `escrow_log`

3. **Create trade file**
   - Generate `multiplayer/trades/active/<trade-id>.yaml`
   - Set `expires` to 72 hours from now

**Response:**

```yaml
success: true
operation: "trade"
action: "create"
trade:
  trade_id: "trade-20260204-153000"
  status: "pending"
  expires: "2026-02-07T15:30:00Z"
  from:
    github: "<player-github>"
    character: "<player-character>"
  to:
    github: "<target-github>"
    character: "<target-character>"
  offering:
    gold: 50
    items: ["Iron Sword"]
  requesting:
    gold: 0
    items: ["Shadow Essence x2"]
state_diffs:
  escrow:
    gold_in_escrow: "+50"
    items_in_escrow:
      - item_id: "iron-sword"
        trade_id: "trade-20260204-153000"
files_written:
  - "multiplayer/trades/escrow/<github>.yaml"
  - "multiplayer/trades/active/trade-20260204-153000.yaml"
narrative_hooks:
  - "Trade offer sent to <target-character>"
  - "50 gold and Iron Sword placed in escrow"
  - "Offer expires in 72 hours"
```

#### Accept Trade

```yaml
operation: "trade"
action: "accept"
trade_id: "<trade-id>"
```

**Processing:**

1. Verify trade exists and targets this player
2. Verify player has requested items/gold
3. Move player's items/gold to escrow
4. Execute swap between escrows
5. Update both personas' inventories
6. Archive trade to `multiplayer/trades/completed/`
7. Run `validate-multiplayer.js`

#### Reject/Cancel Trade

```yaml
operation: "trade"
action: "reject" | "cancel"
trade_id: "<trade-id>"
```

**Processing:**

1. Verify trade exists
2. Return escrowed items/gold to original owner
3. Update trade status
4. Archive trade

### PARTY Operations

#### Create Party

```yaml
operation: "party"
action: "create"
party_name: "<name>"
settings:
  max_members: 6
  loot_distribution: "round-robin"
```

**Processing:**

1. Verify player not already in a party
2. Create `multiplayer/parties/active/<party-id>.yaml`
3. Create `players/<github>/personas/<char>/party-membership.yaml`
4. Set player as leader

#### Invite to Party

```yaml
operation: "party"
action: "invite"
target:
  github: "<target-github>"
  character: "<target-character>"
```

**Processing:**

1. Verify player is leader or officer
2. Verify party not full
3. Verify target not already in a party
4. Create `multiplayer/parties/invites/<target-github>-<party-id>.yaml`
5. Set 48-hour expiration

#### Accept Party Invite

```yaml
operation: "party"
action: "accept"
invite_id: "<invite-file-name>"
```

**Processing:**

1. Verify invite exists and targets this player
2. Verify party still exists and has room
3. Add to party roster as "member"
4. Create/update party-membership.yaml
5. Delete invite file
6. Run `validate-multiplayer.js`

### MAIL Operations

#### Send Mail

```yaml
operation: "mail"
action: "send"
to:
  github: "<recipient-github>"
recipient_character: "<optional-specific-character>"
subject: "<subject>"
body: "<message-body>"
attachments:
  gold: <amount>
  items:
    - id: "<item-id>"
      quantity: <n>
```

**Processing:**

1. If attachments, move to escrow (same as trade)
2. Create message file in `multiplayer/mail/<recipient>/inbox/`
3. Create copy in `multiplayer/mail/<sender>/sent/`
4. Set 30-day attachment expiration

#### Claim Attachments

```yaml
operation: "mail"
action: "claim"
message_id: "<message-id>"
```

**Processing:**

1. Verify message exists and has attachments
2. Verify not expired
3. Transfer from sender's escrow to recipient's inventory
4. Update message status to "claimed"
5. Update recipient's persona

### GUILD Operations

#### Create Guild

```yaml
operation: "guild"
action: "create"
guild_name: "<name>"
guild_tag: "<3-4 char tag>"
```

**Processing:**

1. Verify player has 100 gold (founding cost)
2. Verify player not already in a guild
3. Create guild directory structure:
   - `multiplayer/guilds/<guild-id>/guild.yaml`
   - `multiplayer/guilds/<guild-id>/roster.yaml`
   - `multiplayer/guilds/<guild-id>/treasury.yaml`
4. Deduct 100 gold from player
5. Add player as founder in roster

#### Deposit to Treasury

```yaml
operation: "guild"
action: "deposit"
gold: <amount>
```

**Processing:**

1. Verify player is guild member
2. Verify player has gold
3. Deduct from persona
4. Add to treasury with transaction log
5. Check for guild level upgrades

### DUEL Operations

#### Challenge to Duel

```yaml
operation: "duel"
action: "challenge"
target:
  github: "<target-github>"
  character: "<target-character>"
duel_type: "friendly" | "ranked" | "wagered"
wager:
  gold: <amount>
  items: [<list>]
```

**Processing:**

1. If wagered, verify and move to escrow
2. Create `multiplayer/duels/<duel-id>.yaml`
3. Set 24-hour challenge expiration

#### Accept Duel

```yaml
operation: "duel"
action: "accept"
duel_id: "<duel-id>"
```

**Processing:**

1. Verify duel exists and targets this player
2. If wagered, move defender's wager to escrow
3. Update duel status to "accepted"
4. Return duel context for Combat Manager
5. Duel combat is then handled by Combat Manager

**Response includes:**

```yaml
success: true
operation: "duel"
action: "accept"
duel_ready: true
combat_context:
  type: "pvp_duel"
  combatants:
    challenger:
      # Full stats from their persona
    defender:
      # Full stats from player's persona
  rules:
    no_flee: true
    death: false  # Reduced to 1 HP, not killed
  wager:
    challenger: { gold: 50 }
    defender: { gold: 50 }
action_required: "invoke_combat_manager"
narrative_hooks:
  - "The duel is accepted!"
  - "100 gold hangs in the balance"
```

### PRESENCE Operations

#### Check Who's Here

```yaml
operation: "presence"
action: "who"
location: "<location-id>"  # Optional, defaults to player's location
```

**Processing:**

1. Load `world/state/presence.yaml`
2. Filter for location
3. Return player list with status

**Response:**

```yaml
success: true
operation: "presence"
action: "who"
location: "nexus-downtown"
players_present:
  - github: "shadowuser"
    character: "Nightblade"
    status: "active"
    last_action: "5 minutes ago"
  - github: "merchantking"
    character: "Goldweave"
    status: "idle"
    last_action: "45 minutes ago"
count: 2
narrative_hooks:
  - "Two other Weavers are nearby"
  - "Nightblade moves through the crowd"
  - "Goldweave appears lost in thought"
```

## Validation

After any multiplayer action, run:

```bash
node scripts/validate-multiplayer.js
```

If validation fails, rollback all changes.

## Escrow Rules

1. **All transfers use escrow** - Never direct item/gold movement
2. **Escrow log is append-only** - Full audit trail
3. **Items reference their purpose** - trade_id, mail_id, or duel_id
4. **Expiration returns to owner** - Automated cleanup

## Error Codes

| Code | Description |
|------|-------------|
| INSUFFICIENT_GOLD | Not enough available gold |
| INSUFFICIENT_ITEMS | Not enough available items |
| ALREADY_IN_PARTY | Cannot join second party |
| NOT_PARTY_LEADER | Action requires leader role |
| PARTY_FULL | Cannot add more members |
| TRADE_EXPIRED | Trade offer has expired |
| TRADE_NOT_FOUND | Trade ID doesn't exist |
| SELF_TRADE | Cannot trade with yourself |
| GUILD_NOT_FOUND | Guild doesn't exist |
| INSUFFICIENT_RANK | Action requires higher guild rank |
| DUEL_IN_PROGRESS | Already in an active duel |

## State Files Modified

| Action | Files |
|--------|-------|
| Trade create | escrow/<github>.yaml, trades/active/<id>.yaml |
| Trade accept | Both escrows, both personas, archive trade |
| Party create | parties/active/<id>.yaml, party-membership.yaml |
| Party invite | parties/invites/<target>-<party>.yaml |
| Party accept | party.yaml roster, party-membership.yaml, delete invite |
| Mail send | escrow (if attach), mail/<to>/inbox/, mail/<from>/sent/ |
| Mail claim | sender escrow, recipient persona, message status |
| Guild create | guilds/<id>/guild.yaml, roster.yaml, treasury.yaml, persona (gold) |
| Guild deposit | treasury.yaml, persona |
| Duel challenge | escrow (if wager), duels/<id>.yaml |
| Duel complete | Both escrows (winner gets all), duel archive |
