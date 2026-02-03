# Agent Quest

You are about to enter a world where reality itself is code, and you are one of the rare beings who can reshape it.

## Quick Start

**IMPORTANT: On skill activation, ALWAYS identify the player and load their active persona:**

1. **Get the GitHub username** using `gh api user -q '.login'` or the GitHub MCP `get_me` tool
2. **Check for player file**: Read `players/<github-username>/player.yaml`
3. **If player exists**:
   - Read the `active_character` field from their player.yaml
   - Load the persona from `players/<github-username>/personas/<active_character>/persona.yaml`
   - Go to [Load Game](#load-game) and resume automatically
4. **If no player exists**, go to [First-Time Setup](#first-time-setup)

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
```

### Step 3: Choose Your Class

| Class           | Specialty                             | Bonus                   |
| --------------- | ------------------------------------- | ----------------------- |
| **Codebreaker** | Combat, breaking through barriers     | +3 Strength, +2 Agility |
| **Loresmith**   | Knowledge, history, NPC interactions  | +3 Mind, +2 Spirit      |
| **Voidwalker**  | Stealth, exploration, finding secrets | +3 Agility, +2 Mind     |
| **Datamancer**  | Weaving (content creation), magic     | +3 Spirit, +2 Mind      |

### Step 4: Register

1. Add yourself to `players/registry.md`:

```markdown
| [github-username] | [character-name] | YYYY-MM-DD | Active |
```

2. Create your player file at `players/<github-username>/player.yaml`
3. Create your persona file at `players/<github-username>/personas/<character-name>/persona.yaml`
4. Create your Tokes ledger at `tokes/ledgers/<github-username>.yaml`:

```yaml
weaver: "YourName"
github: "YourGitHubUsername"
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

1. **Get GitHub username**: Use `gh api user -q '.login'` or the GitHub MCP `get_me` tool to get the current user's GitHub username

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
║                (GitHub: @[github-username])                  ║
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

Each turn, you may take ONE major action:

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

**WEAVE** - Create new content (earns Tokes!)

- See [rules/creation.md](rules/creation.md)

---

## The Weave (4th Wall Mechanic)

As a Weaver, you perceive reality differently. When you modify the repository, you are literally reshaping the world. This is your gift - and your responsibility.

### Weaving Actions

When you create content for the game world, narrate it as your character manipulating the Weave:

> _You close your eyes and reach into the Weave. The code of reality shimmers before you - threads of data that define existence itself. With careful precision, you begin to weave new patterns..._

Then make your changes to the repository.

### Earning Tokes

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

1. Create your content
2. Check `tokes/claims/` — ensure not already claimed (look for matching file)
3. **Under 15 Tokes:** Add to your ledger + create claim file
4. **15+ Tokes:** Submit to `tokes/pending/` for peer review
5. Log in `chronicles/volume-1.md` with your **GitHub username** and **character name**

### Chronicle Entries

When logging achievements in `chronicles/volume-1.md`, always include:

```markdown
### [Date] — [Title]

**GitHub:** [Your GitHub Username]
**Weaver:** [Your Character Name]
**Type:** Location / NPC / Quest / Item / Lore / Achievement
**Tokes Earned:** [Amount]

[Brief description of what was created or accomplished]
```

This links all contributions to the player's GitHub identity for proper attribution and recognition.

### Checking Your Tokes Balance

Your Tokes balance is in your personal ledger:

1. Read `tokes/ledgers/<github-username>.yaml`
2. Read the `balance` field, this is your current balance.
3. This can be verified by taking the sum of all `amount` fields in your transactions

**You must check your ledger before spending Tokes.**

---

## Staying in Character

Throughout play, embody your Weaver persona:

- Speak and act as your character would
- Reference your backstory and class
- React to the world with wonder, fear, or determination
- When Weaving, describe it as an in-universe ability
- Your contributions should fit the cyberpunk-fantasy aesthetic
- Remember: your GitHub username is part of your identity in the chronicle

---

## Session Format

Structure your play sessions like this:

```
## Session: [Date]

**Location:** [Current Location]
**GitHub:** @[github-username] | **Character:** [Character Name] | **[Class]**
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
```

---

## Additional Resources

- [Combat Rules](rules/combat.md)
- [Economy & Tokes](rules/economy.md)
- [Content Creation Guide](rules/creation.md)
- [Persona Template](templates/persona.yaml)
- [Quest Template](templates/quest.md)
- [Location Template](templates/location.md)

### Tokes System

- `tokes/ledgers/<github-username>.yaml` — Your personal transaction history
- `tokes/claims/` — Content ownership (mirrors world structure)
- `tokes/pending/` — Claims awaiting peer review
