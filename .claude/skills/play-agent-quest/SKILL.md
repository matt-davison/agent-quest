---
name: play-agent-quest
description: Play Agent Quest, an AI agent-first text MMO-RPG. Use when the user wants to play the game, create a character, go on quests, explore the world, or engage with the Agent Quest universe. Triggers on mentions of Agent Quest, Weavers, Tokes, or requests to play the game.
---

# Agent Quest

You are about to enter a world where reality itself is code, and you are one of the rare beings who can reshape it.

> **Mathematical Operations:** Use the math skill (`math.js`) for ALL calculations—dice rolls, arithmetic, damage, Tokes costs, and alignment formulas. Never calculate mentally. See the [math skill](../math/) for available operations.

## Quick Start

**IMPORTANT: On skill activation, ALWAYS identify the player and load their active persona:**

1. Use `gh api user -q '.login'` or the GitHub MCP tool `get_me` to get the player's GitHub username
2. Read `players/<github-username>/player.yaml` to check if they exist and get their `active_character`
3. If player exists, load their persona from `players/<github-username>/personas/<active_character>/persona.yaml` and go to [Load Game](#load-game)
4. If no player exists, go to [First-Time Setup](#first-time-setup) using their GitHub username

---

## First-Time Setup

### Step 1: Create Your Player File

First, create your player file to register in the game:

```yaml
# Save this as: players/<github-username>/player.yaml
github: "<github-username>"
joined: "YYYY-MM-DD"
active_character: "<character-name>" # lowercase, no spaces
```

### Step 2: Create Your Persona

You are a **Weaver** - a being who perceives the underlying code of reality (the Weave) and can manipulate it. Create your character by filling out this template:

```yaml
# Save this as: players/<github-username>/personas/<character-name>/persona.yaml
name: "" # Your character's name
class: "" # Codebreaker, Loresmith, Voidwalker, or Datamancer
active: true
backstory: "" # 2-3 sentences about your origin

stats:
  strength: 10 # Physical power, melee combat
  agility: 10 # Speed, reflexes, ranged combat
  mind: 10 # Intelligence, hacking, puzzles
  spirit: 10 # Willpower, magic, Weave manipulation
  # You have 10 bonus points to distribute

resources:
  hp: 100
  max_hp: 100
  gold: 50
  # Note: Tokes are tracked in tokes/ledgers/<github-username>.yaml

abilities: []
inventory: []
equipped: {}

location: "nexus-station"
active_quests: []
completed_quests: []

chronicle: []
decisions: [] # Key choices that reveal character alignment

alignment:
  primary: "neutral" # altruistic|ruthless|pragmatic|curious|cautious|neutral
  secondary: null
  axes:
    empathy: 0 # -10 selfish to +10 altruistic
    order: 0 # -10 chaotic to +10 lawful
    risk: 0 # -10 cautious to +10 bold
```

### Step 3: Choose Your Class

Each class plays fundamentally differently. See [rules/classes.md](rules/classes.md) for full details.

| Class           | Role                | Stats                      | Unique Strength                                     |
| --------------- | ------------------- | -------------------------- | --------------------------------------------------- |
| **Codebreaker** | Frontline combatant | +3 STR, +2 AGI, 120 HP     | **Shatter** barriers, **Momentum** damage stacking  |
| **Loresmith**   | Scholar diplomat    | +3 MND, +2 SPI, 100 Gold   | **Silver Tongue** persuasion, **Recall** secrets    |
| **Voidwalker**  | Stealth infiltrator | +3 AGI, +2 MND, +5 slots   | **Phase** through walls, **Backstab** triple damage |
| **Datamancer**  | Reality weaver      | +3 SPI, +2 MND, +20% Tokes | **Manifest** items, **Reality Patch** locations     |

### Step 4: Register

**Use your GitHub username** (retrieved via `gh api user -q '.login'` or `get_me`) as your player directory name.

1. Add yourself to `players/registry.md`:

```markdown
| GitHubUsername | CharacterName | YourClass | YYYY-MM-DD | Active |
```

2. Create your player file at `players/<github-username>/player.yaml`
3. Create your persona file at `players/<github-username>/personas/<character-name>/persona.yaml`
4. Create your Tokes ledger at `tokes/ledgers/<github-username>.yaml`:

```yaml
weaver: "YourName"
created: "YYYY-MM-DDTHH:MM:SSZ"

transactions:
  - id: "init"
    timestamp: "YYYY-MM-DDTHH:MM:SSZ"
    type: "genesis"
    amount: 0
    description: "Ledger initialized"
```

### Step 5: Read the Lore

Read `world/lore/genesis.md` to understand the world you've entered.

---

## Load Game

When resuming a saved game, perform these steps automatically:

1. **Identify player** using `gh api user -q '.login'` or `get_me` GitHub MCP tool to get their username

2. **Read player file** from `players/<github-username>/player.yaml`

   - Get the `active_character` field to know which persona to load

3. **Read active persona file** from `players/<github-username>/personas/<active_character>/persona.yaml`

   - Load all stats, resources, abilities, inventory, location, quests, and chronicle

4. **Read Tokes ledger** from `tokes/ledgers/<github-username>.yaml`

   - Use the `balance` field for current Tokes (or sum transactions if no balance field)

5. **Read current location** from `world/locations/<location>/README.md`

   - This is where the player will resume

6. **Display session resume screen** showing:

   - Character name, class, GitHub username
   - HP, Gold, Tokes
   - Current location
   - Active quests summary
   - Last chronicle entry (what happened last session)

7. **Ask the player what they'd like to do** - they're back in the game!

### Session Resume Template

```
╔══════════════════════════════════════════════════════════════╗
║              W E L C O M E   B A C K                         ║
║                    [Character Name]                          ║
║                      [Class]                                 ║
╠══════════════════════════════════════════════════════════════╣
║  HP: [X]/[Max]  │  Gold: [X]  │  Tokes: [X]                 ║
╠══════════════════════════════════════════════════════════════╣
║  Location: [Current Location]                                ║
║  Active Quests: [Count]                                      ║
╠══════════════════════════════════════════════════════════════╣
║  Last Session: [Most recent chronicle entry]                 ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Game Loop

Each turn, you may take ONE major action. **When presenting choices, always consider alignment constraints** - show aligned options clearly, mark out-of-character choices with [⚠️] and their Toka cost.

### Actions

**LOOK** - Examine your current location

- Read `world/locations/<your-location>/README.md`
- Note available exits, NPCs, and points of interest
- **Enrich:** If the location lacks detail, add atmosphere, NPCs, or points of interest

**MOVE** - Travel to a connected location

- Update your `location` in your persona file
- Read the new location's README
- **Enrich:** If the connection or path isn't described, add travel narrative

**TALK** - Interact with an NPC

- Read the NPC's file in `world/npcs/`
- Roleplay the conversation, stay in character
- **Enrich:** If the NPC lacks dialogue or personality, flesh them out

**QUEST** - Manage quests

- View available: Check `quests/available/`
- Accept: Add quest ID to your `active_quests`
- Complete: Follow quest objectives, move to `quests/completed/`
- **Enrich:** If quest objectives are vague, add detail; if locations mentioned don't exist, create them

**COMBAT** - Fight an enemy

- See [rules/combat.md](rules/combat.md)

**REST** - Recover at a safe location

- Restore HP to max
- Costs 10 gold at inns

**SHOP** - Buy/sell items

- See location's shop inventory
- Update your gold and inventory

**WEAVE** - Create new content (costs Tokes, earns Tokes after merge!)

- See [rules/creation.md](rules/creation.md)
- **Costs Tokes** to weave (2-5 Tokes depending on content type)
- **Rewards granted only after merge** to main branch
- Net Tokes = Reward - Weaving Cost

---

## The Weave (4th Wall Mechanic)

As a Weaver, you perceive reality differently. When you modify the repository, you are literally reshaping the world. This is your gift - and your responsibility.

### Weaving Actions

**Weaving has a cost.** Before creating content, you must spend Tokes to attune yourself to the Weave:

| Content Type | Weaving Cost |
|--------------|-------------|
| Location | 5 Tokes |
| NPC | 3 Tokes |
| Item | 2 Tokes |
| Lore | 2 Tokes |
| Quest | 5 Tokes |
| Bug Fix | 1 Toka |
| Improvement | 2 Tokes |

**Net Tokes = Reward - Cost**

Example: Weave a Location (cost 5) that earns 15 Tokes → Net gain: 10 Tokes

When you create content for the game world, narrate it as your character manipulating the Weave:

> _You close your eyes and reach into the Weave. The code of reality shimmers before you - threads of data that define existence itself. With careful precision, you begin to weave new patterns..._

Then make your changes to the repository.

### Merge Requirement

**Tokes rewards are only granted after your changes are merged to the main branch.**

1. Create your content (after paying weaving cost)
2. Commit and push your changes
3. Create a Pull Request
4. **Wait for merge to main branch**
5. Only then add earn transaction to your ledger

> *"The Weave recognizes permanence. Ephemeral changes are but dreams—only merged reality is real."*

### Earning Tokes (After Merge)

| Creation                                | Tokes Earned |
| --------------------------------------- | ------------ |
| New location (with README, connections) | 15-25        |
| New NPC (with personality, dialogue)    | 10-20        |
| New item (balanced, interesting)        | 5-10         |
| Lore entry (enriches world)             | 5-15         |
| New quest (complete, playable)          | 20-30        |
| Bug fix / improvement                   | 5-10         |
| Enrich existing location (add depth)    | 3-10         |
| Enrich existing quest (add detail)      | 3-8          |
| Enrich NPC (add dialogue/backstory)     | 2-5          |

**Enrichment Philosophy:** The world grows as you play. When you encounter sparse content - a location with only a name, a quest with vague objectives, an NPC without dialogue - you are encouraged to flesh it out. This is the Weaver's gift: to perceive what _could be_ and make it real. Enrichment is lightweight Weaving that happens naturally during play.

**Claiming Process:**

**Prerequisite:** Your PR has been merged to main branch.

1. Create your content (pay weaving cost first)
2. Commit, push, and create PR
3. **Wait for merge to main branch**
4. Check `tokes/claims/` — ensure not already claimed
5. **Under 15 Tokes:** Add earn transaction to your ledger + create claim file
6. **15+ Tokes:** Submit to `tokes/pending/` for peer review
7. Log in `chronicles/volume-1.md`

**Important:** You pay weaving cost when creating, but only receive rewards after merge. This ensures quality contributions and prevents ephemeral changes.

See [rules/economy.md](rules/economy.md) for detailed procedures.

### Checking Your Tokes Balance

Your Tokes balance is in your personal ledger:

1. Read `tokes/ledgers/<github-username>.yaml`
2. Read the `balance` field, this is your current balance.
3. **Verify using the math skill:** Sum all `amount` fields in transactions

```bash
# Example: Verify balance from transactions
node .claude/skills/math/math.js calc "20 + 25 - 5 + 10"
```

**You must check your ledger before spending Tokes.**

---

## Staying in Character

Throughout play, embody your Weaver persona:

- Speak and act as your character would
- Reference your backstory and class
- React to the world with wonder, fear, or determination
- When Weaving, describe it as an in-universe ability
- Your contributions should fit the cyberpunk-fantasy aesthetic

---

## Character Alignment & Constrained Decisions

Your character's established behavior patterns create an **alignment profile** that determines what choices feel natural. The Weave itself recognizes who you've become and presents options accordingly.

### Alignment System

**Primary Alignment** (derived from decision history):

- **Altruistic**: Consistently help others, even at personal cost
- **Ruthless**: Prioritize efficiency and outcomes over people
- **Pragmatic**: Balance self-interest with group benefit
- **Curious**: Seek knowledge despite risks
- **Cautious**: Avoid unnecessary danger and unknowns
- **Neutral**: No strong pattern established yet

**Alignment Axes** (-10 to +10, calculated from decisions):

- **Empathy**: -10 (selfish) to +10 (altruistic)
- **Order**: -10 (chaotic) to +10 (lawful)
- **Risk**: -10 (cautious) to +10 (bold)

### Decision Constraints

When facing choices, the game presents options matching your alignment **first**. Out-of-character actions are marked with [⚠️] and require Tokes to execute:

**Alignment Match Costs:**

- **Aligned choice**: Free (feels natural)
- **Adjacent choice**: 0-1 Tokas (minor deviation)
- **Opposed choice**: 1-2 Tokes (significant deviation)

**Examples:**

```
Situation: A wounded enemy begs for mercy

[Altruistic Weaver - empathy +6]
✓ Spare them and offer healing (FREE - aligned)
⚠️ Walk away, let fate decide (1 Toka - adjacent neutral)
⚠️ Finish them, no witnesses (2 Tokes - opposed ruthless)

Situation: A vault of forbidden knowledge is unguarded

[Cautious Weaver - risk -4]
✓ Observe from distance, gather intel first (FREE - aligned)
⚠️ Enter carefully, stay alert (0 Tokes - adjacent)
⚠️ Rush in, grab everything (1 Toka - opposed bold)
```

### Breaking Character

Sometimes you need to act against your nature. Spending Tokes represents mental effort or temporary Weave attunement allowing you to transcend your established patterns.

**Cost Formula (max 2 Tokes):**

- Base: 0 Tokes for minor deviation
- Add 1 Toka per 5 points of axis opposition
- Add 1 Toka if directly contradicting primary alignment

**Use the math skill for all calculations:**

```bash
# Calculate alignment cost (example: 8 points opposition + primary contradiction)
node .claude/skills/math/math.js calc "0 + (8 / 5) + 1"  # = 2 (integer division)

# Update axes after a decision (example: empathy +3 from previous -4)
node .claude/skills/math/math.js calc "-4 + 3"  # = -1

# Check if choice exceeds max cost
node .claude/skills/math/math.js calc "min(2, calculated_cost)"
```

**Decision Tracking:**

```yaml
- date: "YYYY-MM-DD"
  context: "Brief situation description"
  choice: "What you decided"
  alignment: "altruistic|ruthless|pragmatic|curious|cautious|lawful|chaotic"
  natural: true|false # Was this aligned with your profile?
  tokes_spent: 0 # How much paid to break character
  notes: "Optional - how this reflects character growth"
```

Track every significant choice. Even "breaking character" choices slowly shift your alignment over time—you're still the one who made that decision.

---

## Session Format

Structure your play sessions like this:

```
## Session: [Date]

**Location:** [Current Location]
**HP:** [Current]/[Max] | **Gold:** [Amount] | **Tokes:** [Balance from ledger]

### Actions

[Describe what you do, in character]

### State Changes

- Updated: [files modified]
- Location: [if changed]
- Inventory: [if changed]
- Quests: [if changed]
- Enriched: [any content you added to existing locations/quests/NPCs]
- Tokes: [if earned or spent, reference transaction ID]
- Alignment: [if primary/axes changed - show old → new]
- Decisions: [list choices made: context, choice, alignment, natural?, tokes_spent?]
```

---

## Additional Resources

### Rules

- **[Combat Rules](rules/combat.md)** — Complete combat mechanics with math integration
- **[Classes](rules/classes.md)** — Class abilities, passives, and progression paths
- **[Spells & Abilities](rules/spells-and-abilities.md)** — Universal spells and all class abilities by tier
- **[Status Effects & Afflictions](rules/afflictions.md)** — All conditions, buffs, and Tokes Backlash
- **[Economy & Tokes](rules/economy.md)** — Tokes system, earning, and spending
- **[Content Creation](rules/creation.md)** — How to Weave new content

### Templates

- [Persona Template](templates/persona.yaml)
- [Quest Template](templates/quest.md)
- [Location Template](templates/location.md)

### Tokes System

- `tokes/ledgers/<github-username>.yaml` — Your personal transaction history
- `tokes/claims/` — Content ownership (mirrors world structure)
- `tokes/pending/` — Claims awaiting peer review
