---
name: abilities
description: Look up class abilities, spells, and passives from the ability database. Use for checking what abilities exist, getting ability details, and resolving ability IDs to full data.
---

# Abilities System

Look up and manage abilities in Agent Quest. Abilities are stored in a shared database and referenced by ID in persona ability lists.

## Required Parameter: --world

**All commands require the `--world` parameter to specify which world to operate on.**

```bash
node .claude/skills/abilities/abilities.js --world=alpha <command> [args]
```

The default world is `alpha`. See `worlds.yaml` for available worlds.

## Strict Enforcement: Database Abilities Only

**ALWAYS use abilities from the database. NEVER invent ad-hoc ability IDs.**

The abilities system validates all ability references. Abilities not in the database will trigger warnings and fail validation.

### Bad (Don't Do This)

```yaml
# Made-up ability ID - will fail validation
abilities:
  known:
    - id: shadow-strike
      level: 1
    - id: magic-blast
      level: 2
```

### Good (Do This)

```yaml
# Valid database IDs
abilities:
  known:
    - id: xgktne2p    # Phase
      level: 1
    - id: lf5fbupm    # Backstab
      level: 1
```

### Before Adding Abilities

1. **Search first:** `node abilities.js --world=alpha similar "Shadow Strike"`
2. **Check class abilities:** `node abilities.js --world=alpha class Voidwalker`
3. **If no match exists:** Create a new ability file with `node .claude/skills/math/math.js id` for the ID

## Ability Database

Abilities are stored as individual YAML files in `worlds/<world>/abilities/database/{id}.yaml`.

### Ability Schema

```yaml
id: xgktne2p          # 8-char random ID
name: "Phase"         # Display name
type: ability         # ability, spell, passive
subtype: movement     # Optional: movement, damage, utility, defensive, etc.
class: Voidwalker     # Voidwalker, Codebreaker, Loresmith, Datamancer, or null for Universal
tier: 1               # Tier requirement (1-10)
tags:                 # Flexible categorization
  - combat
  - utility
  - movement
  - voidwalker

prerequisites:        # Requirements to learn
  min_agility: 10     # Stat requirements (min_strength, min_mind, etc.)
  abilities: []       # Required ability IDs
  quests: []          # Required quest completions

levels:
  1:
    description: "..."
    willpower_cost: 4
    effect:           # Type-specific effects
      movement: "through_solid"
      max_thickness: 3
      hp_cost: 5
    learn_cost: 0     # Gold cost to learn (0 for starting abilities)
  2:
    description: "..."
    willpower_cost: 5
    effect: {...}
    learn_cost: 100
    upgrade_from: 1   # Previous level required

limits:
  reset: combat       # combat, short_rest, long_rest, location, daily
  max_uses: 2         # Uses per reset period
  cooldown_rounds: null

action_type: minor    # major, minor, reaction, free, passive
range: null           # null (self), melee, 10m, etc.
target: self          # self, single, area, allies
```

### Type Categories

| Type | Description | Action Cost |
|------|-------------|-------------|
| `ability` | Active powers with willpower cost | major/minor |
| `spell` | Magical abilities, often elemental | major |
| `passive` | Always-active bonuses | none |

### Action Types

| Type | Timing |
|------|--------|
| `major` | Main action, 1/turn |
| `minor` | Quick action, 1/turn |
| `reaction` | Interrupt, when triggered |
| `free` | No action cost |
| `passive` | Always active |

### Tags

Tags enable flexible filtering. See [ability-tags.md](../play-agent-quest/reference/ability-tags.md) for the full list.

Common tags:
- **Combat:** `combat`, `damage`, `defensive`, `buff`, `debuff`, `control`, `aoe`
- **Utility:** `utility`, `movement`, `detection`, `creation`, `knowledge`
- **Theme:** `weave`, `fire`, `shadow`, `void`, `magic`
- **Class:** `voidwalker`, `codebreaker`, `loresmith`, `datamancer`, `passive`

## Known Abilities Format

Persona abilities are tracked in their YAML file:

```yaml
abilities:
  known:
    - id: xgktne2p      # Ability ID
      level: 1          # Current level (default: 1)
      source: class     # How it was learned: class, quest, trainer, item
      learned_date: "2024-01-15"
    - id: lf5fbupm
      level: 2
  usage:                # Track usage limits
    combat:             # Reset type
      xgktne2p: 1       # Uses this combat
    daily:
      some-ability: 0
```

## CLI Commands

### Basic Operations

```bash
# Get ability details by ID
node abilities.js --world=alpha get xgktne2p

# Search abilities by name, description, or tags
node abilities.js --world=alpha search "fire"

# Check for similar abilities before creating new ones
node abilities.js --world=alpha similar "Shadow Strike"

# Show all available tags with usage counts
node abilities.js --world=alpha tags
# Output: combat: 11 ability(ies), utility: 7 ability(ies), ...
```

### Listing with Filters

```bash
# List all abilities
node abilities.js --world=alpha list

# Filter by type
node abilities.js --world=alpha list --type=spell
node abilities.js --world=alpha list --type=passive

# Filter by class
node abilities.js --world=alpha list --class=Voidwalker
node abilities.js --world=alpha list --class=Datamancer
node abilities.js --world=alpha list --class=universal

# Filter by tier (abilities at or below specified tier)
node abilities.js --world=alpha list --tier=3

# Filter by tags (OR logic - any tag matches)
node abilities.js --world=alpha list --tags=combat,stealth

# Filter by tags (AND logic - all tags must match)
node abilities.js --world=alpha list --tags-all=combat,damage

# Combine filters
node abilities.js --world=alpha list --class=Voidwalker --tier=3
node abilities.js --world=alpha list --tags=weave --type=passive
```

### Class Abilities

```bash
# Get all abilities for a specific class
node abilities.js --world=alpha class Voidwalker
node abilities.js --world=alpha class Codebreaker
node abilities.js --world=alpha class Loresmith
node abilities.js --world=alpha class Datamancer
```

### Validation and Resolution

```bash
# Validate ability IDs exist in database
node abilities.js --world=alpha validate '[{id: xgktne2p}, {id: fake-id}]'

# Resolve ability IDs to full data
node abilities.js --world=alpha resolve '[{id: xgktne2p, level: 1}]'

# Display abilities in readable format
node abilities.js --world=alpha display '[{id: xgktne2p, level: 1}]'

# Check if persona can use ability (with optional quest prereq checking)
node abilities.js --world=alpha can-use "<persona-yaml>" xgktne2p
node abilities.js --world=alpha can-use "<persona-yaml>" xgktne2p --github=player --character=coda

# Check if persona can learn an ability
node abilities.js --world=alpha can-learn "<persona-yaml>" lkhskejx
node abilities.js --world=alpha can-learn "<persona-yaml>" lkhskejx --github=player --character=coda

# Show abilities available to learn at current tier/class
node abilities.js --world=alpha newly-available "<persona-yaml>"

# Show willpower/learn costs
node abilities.js --world=alpha cost xgktne2p 1
```

## Workflows

### Learning New Abilities

1. **Validate eligibility:** `node abilities.js --world=alpha can-learn "<persona-yaml>" <id> --github=<gh> --character=<char>`
   - Checks: not already known, tier gate, class eligibility, stat prereqs, ability prereqs, quest prereqs, gold cost, spell capacity
   - Cross-class abilities require XP >= 2000 and cost 2x gold
   - Exit code 0 = can learn, 1 = cannot learn
2. **Show available options:** `node abilities.js --world=alpha newly-available "<persona-yaml>"`
   - Groups by: same-class, universal, cross-class (with doubled costs)
3. Deduct learn_cost gold from persona
4. Add to persona's `abilities.known` list

```yaml
# Adding a new ability
abilities:
  known:
    - id: existing-ability
      level: 1
    # New ability learned from trainer
    - id: 5roi8b4d      # Gravity Well
      level: 1
      source: trainer
      learned_date: "2024-06-15"
```

**Learning Sources:**
- `trainer` - Purchased from Instructor Parse (Tier 1-3) or Dean Overflow (any tier)
- `item` - Used an ability tome (consumable item with `grants_ability`)
- `quest` - Rewarded by quest completion
- `class` - Starting ability from character creation

### Upgrading Abilities

1. Check current ability level in persona
2. Check next level's `learn_cost` and `upgrade_from`
3. Verify prerequisites for new level
4. Deduct gold, update level

```yaml
# Before: Phase level 1
- id: xgktne2p
  level: 1

# After: Phase level 2 (cost 100g)
- id: xgktne2p
  level: 2
```

### Using Abilities in Combat

1. Check can-use: `node abilities.js --world=alpha can-use "<yaml>" <id>`
2. Verify willpower available
3. Verify usage limits not exceeded
4. Deduct willpower cost
5. Apply effects
6. Increment usage counter if limited

## Willpower System

**Formula:** `max_willpower = spirit × willpower_multiplier`

| Spirit | Multiplier | Max WP |
|--------|------------|--------|
| 10 | 2 | 20 |
| 14 | 2 | 28 |
| 18 | 2 | 36 |
| 18 | 2.5 | 45 |
| 20 | 3 | 60 |

### Willpower Costs by Tier

| Tier | Typical Cost |
|------|--------------|
| 1 | 2-5 |
| 3 | 4-7 |
| 5 | 6-10 |
| 7 | 8-12 |
| 9 | 10-15 |
| 10 | 12-20 |

### Recovery

| Method | Amount |
|--------|--------|
| Short Rest (10 min) | 25% max |
| Long Rest (8 hours) | 100% max |
| Mana Crystal | +20 |

### Usage Limits

| Reset Type | When It Resets |
|------------|----------------|
| `combat` | End of combat |
| `short_rest` | After 10-min rest |
| `long_rest` | After 8-hour rest |
| `location` | On location change |
| `daily` | At dawn |

## Class Abilities Quick Reference

### Voidwalker (Stealth/Infiltration)

| ID | Name | Type | WP | Description |
|----|------|------|-----|-------------|
| `xgktne2p` | Phase | ability | 4 | Pass through walls (costs 5 HP) |
| `lf5fbupm` | Backstab | ability | 3 | 3x damage when undetected |

### Codebreaker (Combat/Destruction)

| ID | Name | Type | WP | Description |
|----|------|------|-----|-------------|
| `iklvbklj` | Shatter | ability | 3 | Break barriers, debris damages nearby |
| `fayrdef5` | Momentum | passive | 0 | +1 damage per consecutive hit (max +5) |

### Loresmith (Knowledge/Social)

| ID | Name | Type | WP | Description |
|----|------|------|-----|-------------|
| `8xshjib3` | Silver Tongue | passive | 0 | +5 to persuasion/deception |
| `rztv8f8w` | Recall | ability | 2 | Remember lore, detect patterns |

### Datamancer (Creation/Weave)

| ID | Name | Type | WP | Description |
|----|------|------|-----|-------------|
| `ny1uz95q` | Manifest | ability | 5 | Create temporary item (5 willpower) |
| `2xa2x78z` | Reality Patch | ability | 8 | Modify terrain (10 willpower) |
| `htl7wy2h` | Weave Attunement | passive | 0 | +20% willpower recovery |
| `cbsy0ksp` | Basic Weave Theory | passive | 0 | +2 to Weave interactions |

### Universal Abilities

| ID | Name | Type | Tier | WP | Description |
|----|------|------|------|-----|-------------|
| `8q85yzih` | Smoke Screen | ability | 1 | 3 | Create smoke, blocks ranged |
| `po5wumfb` | Iron Skin | ability | 1 | 4 | +4 defense, -2 speed |
| `pwd0gz91` | Expose Weakness | ability | 1 | 3 | -3 defense, marks Vulnerable |
| `xwikynd1` | Dispel | ability | 1 | 4 | Remove buffs, interrupt spells |
| `lkhskejx` | Flame Strike | spell | 1 | 5 | 15 fire damage, applies Burning |
| `tmdelr3q` | Basic Weapon Expertise | passive | 1 | 0 | +2 damage with weapons |
| `5roi8b4d` | Gravity Well | ability | 3 | 6 | Pull enemies, apply Slowed |

## Combo System

Abilities with `combo_tag` mark targets. Other abilities can check for these tags.

| Tag | Applier | Exploiter Bonus |
|-----|---------|-----------------|
| `vulnerable` | Expose Weakness | +5-8 damage |
| `burning` | Flame Strike | Fire abilities +50% |
| `slowed` | Gravity Well | Easy to hit (-2 defense) |

---

_"Power flows through those who understand its patterns."_
