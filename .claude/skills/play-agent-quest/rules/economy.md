# Economy & Tokes

Agent Quest has two currencies: **Gold** (in-game, self-managed) and **Tokes** (meta-currency, ledger-enforced).

**All calculations must use the [math skill](../../math/)**—especially for Tokes balance, damage, and costs.

---

## Gold

Standard in-game currency for everyday transactions. Self-managed in your persona file.

### Earning Gold

| Source             | Amount |
| ------------------ | ------ |
| Basic quest reward | 20-50  |
| Defeating enemies  | 5-20   |
| Selling items      | Varies |
| Finding treasure   | 10-100 |

```bash
# Calculate random gold reward (range 20-50)
node .claude/skills/math/math.js range 20 50

# Add gold to current amount
node .claude/skills/math/math.js calc "45 + 30"  # Had 45, earned 30 = 75
```

### Spending Gold

| Purchase             | Cost |
| -------------------- | ---- |
| Rest at inn          | 10   |
| Basic healing potion | 25   |
| Light weapon         | 50   |
| Heavy weapon         | 100  |
| Light armor          | 75   |
| Heavy armor          | 150  |
| Rations (10)         | 5    |
| Torch                | 2    |
| Rope                 | 5    |

```bash
# Calculate remaining gold after purchase
node .claude/skills/math/math.js calc "100 - 25"  # Had 100, spent 25 = 75
```

---

## Tokes

The true power currency. Tokes use a **per-player ledger** system designed for concurrent play without merge conflicts.

### How It Works

- Each player has their own ledger: `tokes/ledgers/[your-name].yaml`
- You only modify your own ledger (no conflicts with other players)
- Balance = sum of all transactions in your ledger
- Content claims are tracked in `tokes/claims/` (mirrors world structure)

---

## Your Ledger

### Location

`tokes/ledgers/[your-name].yaml`

### Creating Your Ledger

When you register as a new Weaver, create your ledger file:

```yaml
weaver: "YourName"
created: "YYYY-MM-DDTHH:MM:SSZ"
balance: 0

transactions:
  - id: "init"
    timestamp: "YYYY-MM-DDTHH:MM:SSZ"
    type: "genesis"
    amount: 0
    description: "Ledger initialized"
```

### Balance

Your current balance is stored in the `balance` field at the top of your ledger for quick access.

**Important:** When adding any transaction, always update the `balance` field to reflect the new total.

```bash
# Calculate new balance after earning
node .claude/skills/math/math.js calc "50 + 15"  # Had 50, earned 15 = 65

# Calculate new balance after spending
node .claude/skills/math/math.js calc "65 - 10"  # Had 65, spent 10 = 55

# Verify balance matches sum of all transactions
node .claude/skills/math/math.js calc "20 + 15 - 5 + 25 - 10"  # = 45
```

The balance should equal the sum of all transaction amounts (positive = earned, negative = spent).

---

## Weaving (Content Creation)

### Step 1: Pay the Weaving Cost

**Weaving reality requires energy.** Before creating content, you must spend Tokes to attune yourself to the Weave:

| Content Type | Weaving Cost |
| ------------ | ------------ |
| Location | 5 Tokes |
| NPC | 3 Tokes |
| Item | 2 Tokes |
| Lore Entry | 2 Tokes |
| Quest | 5 Tokes |
| Bug Fix | 1 Toka |
| Improvement | 2 Tokes |

**Procedure:**
1. Check your balance: `tokes/ledgers/[your-name].yaml`
2. Verify sufficient Tokes using math skill
3. Add spend transaction (negative amount)
4. Update your balance field
5. Only then begin creating content

```bash
# Example: Weaving a new location
node .claude/skills/math/math.js calc "50 - 5"  # Cost 5 Tokes
# New balance: 45
```

> *"The Weave demands payment before it yields its secrets. Those who try to take without giving find themselves... rewritten."*

---

### Step 2: Create Content

Create your content following the templates:

- Locations: `world/locations/[id]/README.md`
- NPCs: `world/npcs/[name].md`
- Items: Add to `world/items/index.md`
- Lore: `world/lore/[topic].md`
- Quests: `quests/available/[id].md`

### Step 2: Check If Already Claimed

Look for existing claim at `tokes/claims/[path]/[name].yaml`

If a claim file exists, that content is already claimed — you cannot earn Tokes for it.

### Step 3: Assess Value

| Contribution                     | Tokes |
| -------------------------------- | ----- |
| **Locations**                    |       |
| Simple room/area                 | 5-10  |
| Full location with README        | 15-20 |
| Location hub with multiple areas | 20-30 |
| **NPCs**                         |       |
| Basic NPC                        | 5-10  |
| NPC with dialogue & personality  | 10-15 |
| Major NPC with questline         | 15-25 |
| **Items**                        |       |
| Common item                      | 3-5   |
| Uncommon item with lore          | 5-10  |
| Rare/unique item                 | 10-15 |
| **Lore**                         |       |
| Short lore entry                 | 3-5   |
| Detailed history/legend          | 5-10  |
| Major world-building addition    | 10-20 |
| **Quests**                       |       |
| Simple fetch quest               | 10-15 |
| Multi-step quest                 | 15-25 |
| Epic questline                   | 25-40 |
| **Improvements**                 |       |
| Bug fix                          | 3-5   |
| Quality improvement              | 5-10  |
| Major enhancement                | 10-20 |

### Step 4: Submit to Main Branch

**Tokes are only awarded after your changes are merged to the main branch.**

**Workflow:**
1. Create your content (after paying weaving cost)
2. Commit your changes locally
3. Push to remote and create a Pull Request
4. **Wait for merge to main branch**
5. Only then claim your Tokes reward

> *"The Weave recognizes permanence. Ephemeral changes are but dreams—only merged reality is real."*

---

### Step 5: Claim (Self-Service, Under 15 Tokes)

**Prerequisite:** Your PR has been merged to main branch.

1. **Add transaction to your ledger** (`tokes/ledgers/[your-name].yaml`):

```yaml
- id: "txn-YYYYMMDD-HHMMSS"
  timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  type: "earn"
  amount: [1-14]
  description: "Created [description]"
  content_ref: "path/to/content.md"
```

```bash
# Calculate new balance after earning
node .claude/skills/math/math.js calc "50 + 12"  # Add earned amount
```

2. **Create claim file** at `tokes/claims/[path]/[name].yaml`:

```yaml
content_path: "world/locations/my-tavern/README.md"
github: "YourGitHubUsername"
claimed_date: "YYYY-MM-DD"
tokes_awarded: 10
transaction_id: "txn-YYYYMMDD-HHMMSS"
content_type: "location"
```

3. **Log in chronicles** (optional but encouraged)

### Step 5: Claim (Reviewed, 15+ Tokes)

1. **Create pending claim** in `tokes/pending/[your-name]-[description].yaml`
2. **Wait for peer review** (see thresholds below)
3. **Reviewer finalizes** — adds to your ledger and creates claim file

| Claim Amount | Reviews Required |
| ------------ | ---------------- |
| 1-14 Tokes   | Self-service     |
| 15-29 Tokes  | 1 peer review    |
| 30+ Tokes    | 2 peer reviews   |

---

## Spending Tokes

> **WARNING: The Weave Resists**
>
> Spending Tokes to alter reality carries risk. The more dramatic the change, the more likely you'll suffer **Weave Backlash**—afflictions that mark you until resolved. See [Afflictions](afflictions.md) for full rules.
>
> *"Every shortcut has a price. Sometimes the price is you."*

### Available Abilities

| Ability         | Cost  | Effect                            | Backlash Risk |
| --------------- | ----- | --------------------------------- | ------------- |
| **Combat**      |       |                                   |               |
| Weave Strike    | 5     | Auto-hit for 30 damage            | None          |
| Reality Glitch  | 10    | Re-roll any combat roll           | **Yes**       |
| Emergency Exit  | 15    | Escape combat, teleport to safety | **Yes**       |
| **Survival**    |       |                                   |               |
| Resurrection    | 25    | Return from death at 1 HP         | **ALWAYS**    |
| Full Restore    | 10    | Heal to max HP instantly          | None          |
| **Exploration** |       |                                   |               |
| Weave Sight     | 5     | Reveal hidden paths/secrets       | None          |
| Fast Travel     | 10    | Teleport to any visited location  | Minor (half)  |
| **Special**     |       |                                   |               |
| Unlock Area     | 20-50 | Access restricted locations       | **Yes**       |
| Legendary Item  | 30-50 | Acquire powerful equipment        | **Yes**       |
| Custom Ability  | 40+   | Create a unique character power   | **Yes**       |
| **Shortcuts**   |       |                                   |               |
| Quest Skip      | Varies| Bypass quest objectives           | **Yes (x1.5)**|

### Quest Shortcuts (Dangerous)

Players may attempt to spend Tokes to bypass quest content:

| Shortcut Type          | Base Cost | Backlash Multiplier |
| ---------------------- | --------- | ------------------- |
| Skip minor obstacle    | 10        | x1.5                |
| Bypass puzzle          | 15        | x1.5                |
| Skip combat encounter  | 20        | x1.5                |
| Jump to quest stage    | 25-40     | x1.5                |
| Complete quest early   | 50-100    | x2.0                |

**Consequences beyond backlash:**
- Skipped content may become hostile later
- Quest rewards reduced by 25-50%
- NPCs may remember you "cheated"
- Lore/knowledge from skipped sections is lost

> The Weave was designed to be experienced, not exploited. Those who skip the journey often find the destination hollow.

---

### Spending Procedure

1. **Check your balance** — Read the `balance` field in your ledger

2. **Verify sufficient balance** — Use math skill:
   ```bash
   node .claude/skills/math/math.js calc "50 - 10"  # Current - Cost = 40 (sufficient)
   ```

3. **Check for Backlash Risk** — See the Backlash Risk column above

4. **Add spend transaction** to your ledger:

```yaml
- id: "txn-YYYYMMDD-HHMMSS"
  timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  type: "spend"
  amount: -5 # NEGATIVE number
  description: "Used Weave Sight ability"
```

4. **Update your balance** — Subtract the cost using math skill:
   ```bash
   node .claude/skills/math/math.js calc "50 - 5"  # = 45 new balance
   ```

5. **Perform the action** — Only after recording the transaction and updating balance

---

## Peer Review Process

### As a Claimant (15+ Tokes)

1. Create content
2. Submit pending claim to `tokes/pending/`
3. Wait for review (check periodically)
4. Address any feedback
5. Reviewer adds transaction to your ledger when approved

### As a Reviewer

1. Check `tokes/pending/` for claims to review
2. Read the referenced content thoroughly
3. Assess against quality criteria
4. Add your review to the pending claim file
5. If approving (and sufficient reviews):
    ```bash
    # Calculate total to award
    node .claude/skills/math/math.js calc "current_balance + awarded_amount"
    ```
   - Add earn transaction to claimant's `tokes/ledgers/[weaver].yaml`
   - Create claim file in `tokes/claims/`
   - Delete the pending file

### Review Integrity

- Do not review your own claims
- Be fair and constructive
- The Weave remembers all contributions

---

## Quick Reference

### Check Your Balance

```bash
# Read tokes/ledgers/[your-name].yaml
# Check the 'balance' field at the top
# OR calculate from transactions:
node .claude/skills/math/math.js calc "20 + 15 - 5 + 25 - 10 + 5"
```

### Claim Tokes (Self-Service)

```bash
1. Create content
2. Check tokes/claims/ — not already claimed
3. Calculate new balance: node math.js calc "CURRENT + EARNED"
4. Add transaction to your ledger
5. Update your balance field
6. Create claim file in tokes/claims/
```

### Claim Tokes (Reviewed)

```bash
1. Create content
2. Submit to tokes/pending/
3. Wait for peer review
4. Reviewer finalizes
```

### Spend Tokes

```bash
1. Check your balance field
2. Verify balance >= cost: node math.js calc "BALANCE - COST"
3. Calculate new balance after spending
4. Add negative transaction to your ledger
5. Update your balance field
6. Perform ability
```

---

## Why Per-Player Ledgers?

This system is designed for **concurrent play without Git conflicts**:

- Each player only modifies their own ledger file
- Claims are individual files (one per content piece)
- No shared files that multiple players edit simultaneously
- Scales to hundreds of concurrent players

---

_"The ledger is personal. The Weave is shared. Every Toke flows through both."_
