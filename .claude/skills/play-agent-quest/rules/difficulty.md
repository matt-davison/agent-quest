# Level and Difficulty System

> _"The Weave calibrates itself to the Weaver. Some seek challenge. Some seek story. The code adapts."_ — Dean Overflow

This document defines the level and difficulty systems for Agent Quest, including location level ranges, creature levels, per-character difficulty settings, and stat scaling formulas.

---

## Overview

Agent Quest uses a multi-layered difficulty system:

1. **Location Levels** — Areas have level ranges based on danger
2. **Creature Levels** — Enemies have fixed levels with dynamic scaling
3. **Personal Difficulty** — Each character chooses their challenge level
4. **Encounter Budget** — Party composition affects challenge (see [encounter-generation.md](encounter-generation.md))

---

## Location Level Ranges

Each location has a level range based on its `danger_level`. Safe zones have no combat and thus no level range.

### Danger Level to Level Range Mapping

| danger_level | Level Range | Sweet Spot | Notes |
|--------------|-------------|------------|-------|
| safe | N/A | N/A | No combat encounters |
| low | 1-4 | 2 | Starting areas, tutorial zones |
| medium | 2-6 | 4 | Varied threats, standard exploration |
| high | 5-9 | 7 | Experienced players, serious danger |
| extreme | 7-10 | 9 | Endgame content, near-death expected |

### Location Level Assignments

| Location | danger_level | Level Range | Sweet Spot | Rationale |
|----------|--------------|-------------|------------|-----------|
| Nexus Station | safe | N/A | N/A | Hub, sanctuary |
| Syntax Athenaeum | safe | N/A | N/A | Academy, protected |
| Lumina City | medium | 2-6 | 4 | Urban variety, gang threats |
| The Elderwood | medium | 3-7 | 5 | Ancient forest, magical beasts |
| The Rustlands | high | 5-9 | 7 | Wasteland, corrupted tech |
| The Undercrypt | high | 6-10 | 8 | Deep dungeon, boss encounters |

### Level Range Schema

```yaml
# In location.yaml
level_range:
  min: 2        # Lowest-level creatures spawn here
  max: 6        # Highest-level creatures spawn here
  sweet_spot: 4 # Optimal challenge level for this area
```

**Sweet Spot**: The level at which the location provides ideal challenge — not trivial, not deadly. Players at the sweet spot will face Standard difficulty encounters naturally.

---

## Creature Levels

Creatures have a fixed `level` that determines their baseline stats. The tier indicates their role in encounters, while level determines their power within that tier.

### Tier-Level Ranges

| Tier | Typical Levels | Budget Cost | Role |
|------|----------------|-------------|------|
| Minion | 1-3 | 0.5 | Fodder, swarm threats |
| Standard | 2-6 | 1.0 | Core enemies |
| Elite | 4-8 | 3.0 | Mini-bosses, significant threats |
| Boss | 5-10 | 8.0 | Encounter centerpieces |
| Legendary | 8-10 | 15.0 | Campaign-defining battles |

### Creature Level Assignments

| Creature | Tier | Level | Notes |
|----------|------|-------|-------|
| Data Parasite | Minion | 1 | Entry-level swarm threat |
| Glitch Wraith | Standard | 3 | Mid-tier corrupted enemy |
| Guardian Automaton | Elite | 5 | Facility guardian |
| Corruption Amalgam | Boss | 8 | Major corrupted boss |

### Creature Level Schema

```yaml
# In creature.yaml
level: 5  # Creature's designed combat level

# Stats remain as fixed values
stats:
  hp: 85
  defense: 16
  attack_bonus: +6
  damage: 20
```

---

## Personal Difficulty Settings

Each character can choose a difficulty setting that affects combat mechanics. This is stored in their persona file.

### Difficulty Options

| Setting | Damage Taken | Damage Dealt | XP Modifier | Loot Chance |
|---------|--------------|--------------|-------------|-------------|
| Easy | 0.6× | 1.1× | 0.8× | 1.0× |
| Normal | 1.0× | 1.0× | 1.0× | 1.0× |
| Hard | 1.3× | 0.95× | 1.2× | 1.15× |
| Nightmare | 1.6× | 0.85× | 1.4× | 1.3× |

### Design Notes

- **Easy**: Forgiving but not trivial — players still engage with mechanics
- **Normal**: Baseline balance, recommended for first playthroughs
- **Hard**: Meaningful challenge, rewards strategic play
- **Nightmare**: For mastery-seeking players, high risk/high reward

### Persona Schema

```yaml
# In persona.yaml
difficulty:
  setting: normal  # easy | normal | hard | nightmare
```

**Default Behavior**: Characters without a difficulty field default to `normal`.

### Changing Difficulty

Players can change difficulty at any **safe zone**. Changes take effect immediately. There is no penalty for adjusting difficulty.

---

## Creature Level Scaling

When a player encounters a creature, its stats may be scaled based on the level difference.

### Core Rule

**Creatures scale DOWN when the player is higher level, but NEVER scale UP.**

This preserves the challenge of entering high-level areas while preventing trivial fights in lower-level zones.

### Scaling Formula

When player level > creature level, apply scaling per level difference:

| Stat | Scale per Level Below Player |
|------|------------------------------|
| HP | -5% |
| Defense | -0.5 |
| Attack Bonus | -0.3 |
| Damage | -5% |

### Example Calculation

**Player Level 6** vs **Glitch Wraith (Level 3)**:
- Level difference: 3 levels below player
- HP: 40 × (1 - 0.05 × 3) = 40 × 0.85 = **34 HP**
- Defense: 14 - (0.5 × 3) = 14 - 1.5 = **12.5 → 12 Defense**
- Attack: +4 - (0.3 × 3) = +4 - 0.9 = **+3 Attack**
- Damage: 12 × (1 - 0.05 × 3) = 12 × 0.85 = **10 Damage**

```bash
# Using math skill for scaling
node .claude/skills/math/math.js calc "40 * (1 - 0.05 * 3)"  # HP: 34
node .claude/skills/math/math.js calc "14 - (0.5 * 3)"       # Def: 12.5
```

### Minimum Stats

Scaling cannot reduce stats below these minimums:

| Stat | Minimum Value |
|------|---------------|
| HP | 5 |
| Defense | 8 |
| Attack Bonus | +0 |
| Damage | 3 |

### No Upscaling

**Player Level 2** vs **Guardian Automaton (Level 5)**:
- Level difference: 3 levels above player
- **No scaling applied** — creature uses base stats
- This is intended to be a very dangerous encounter

---

## Item Wear System (Hard+ Only)

On Hard and Nightmare difficulty, weapons and armor degrade with use. This adds strategic depth around equipment management.

### When Wear Applies

- **Hard difficulty**: 1× wear rate
- **Nightmare difficulty**: 2× wear rate
- **Easy/Normal**: No wear mechanics

### Wear Events

**Weapons** lose durability when:
- Used to make an attack (hit or miss)

**Armor** loses durability when:
- Player takes damage that the armor reduces

### Durability States

| Durability % | State | Weapon Effect | Armor Effect |
|--------------|-------|---------------|--------------|
| 75-100% | Good | Full damage | Full armor value |
| 50-74% | Worn | -1 damage | -1 armor |
| 25-49% | Damaged | -2 damage | -2 armor |
| 1-24% | Failing | -3 damage, 25% fail | -3 armor, 25% fail |
| 0% | Broken | Unusable | Unusable |

### Calculating Durability State

```bash
# Example: Iron Sword with 28/40 durability
node .claude/skills/math/math.js calc "(28 / 40) * 100"  # = 70%
# 70% is in "Worn" range (50-74%), so -1 damage penalty
```

### Failing State

When an item is in "Failing" state (1-24% durability):
- Roll 1d4 before use
- On a 1, the item fails:
  - Weapon: Attack automatically misses
  - Armor: Provides no protection for this hit

### Broken Items

At 0% durability:
- Item cannot be used
- Must be repaired before use
- Appears in inventory with [broken] state

### Repairing Items

Items can be repaired at:
- **Blacksmiths** in safe zones (costs gold)
- **Repair kits** (consumable item, partial repair)
- **Long rest** with appropriate skills

Repair costs scale with item tier and damage:
```
repair_cost = item_value × (1 - durability_percent) × 0.5
```

### Example Combat with Wear

**Player (Hard difficulty) attacks with Iron Sword (30/40 durability = 75% Good):**

1. Attack roll succeeds
2. Base damage: 10
3. Durability state: Good (no penalty)
4. Final damage: 10
5. Apply 1 wear to sword
6. New durability: 29/40 (72.5% → now "Worn")

**Next attack (29/40 = 72.5% Worn):**

1. Attack roll succeeds
2. Base damage: 10
3. Durability state: Worn (-1 penalty)
4. Final damage: 9
5. Apply 1 wear to sword
6. New durability: 28/40

### Strategic Implications

- **Carry backup weapons** for extended dungeons
- **Repair before difficult fights**
- **Higher quality items** have more durability
- **Magic items** may have special durability properties

### Tracking in Inventory

```yaml
inventory:
  - id: y6fz9ek2      # Iron Sword
    qty: 1
    durability: 28    # Current durability (40 max)
  - id: 6s10vlhv      # Leather Armor
    qty: 1
    durability: 45    # Current durability (50 max)
```

---

## Combined Example

**Scenario**: A level 4 Codebreaker with Hard difficulty enters The Rustlands (level 5-9) and encounters a Guardian Automaton (level 5).

1. **Location Check**: Rustlands is level 5-9, sweet spot 7. Player is level 4, below the range — encounter will be challenging.

2. **Creature Level**: Guardian Automaton is level 5. Player is level 4, so creature is 1 level above. **No downscaling applies.**

3. **Difficulty Modifiers (Hard)**:
   - Player takes 1.3× damage
   - Player deals 0.95× damage
   - Player earns 1.2× XP on victory
   - 1.15× loot drop chance

4. **Combat Resolution**:
   - Guardian deals 20 base damage → Player takes 20 × 1.3 = **26 damage**
   - Player deals 15 base damage → Automaton takes 15 × 0.95 = **14 damage**

5. **Victory Rewards**:
   - Base XP: 150 → Player earns 150 × 1.2 = **180 XP**
   - Loot roll at 1.15× chance modifier

---

## Integration with Existing Systems

### Party Size Modifier

Personal difficulty and party size are separate multipliers:

```bash
# Solo player on Easy
Damage taken = Base × 0.6 (solo) × 0.6 (easy) = 0.36× damage

# Full party on Hard
Damage taken = Base × 1.0 (party) × 1.3 (hard) = 1.3× damage
```

See [encounter-generation.md](encounter-generation.md) for party size tables.

### Safe Zones

Locations with `is_safe_zone: true` have `level_range: null`. No combat occurs in safe zones regardless of player level.

### Quest Level Requirements

Quests have level requirements:

```yaml
level:
  required: 3      # Minimum level to accept quest
  recommended: 5   # Level for optimal challenge
  scaling: true    # Whether rewards scale with level
```

---

## Quick Reference Tables

### Difficulty at a Glance

| Setting | You Take | You Deal | XP | Loot |
|---------|----------|----------|-----|------|
| Easy | 60% | 110% | 80% | 100% |
| Normal | 100% | 100% | 100% | 100% |
| Hard | 130% | 95% | 120% | 115% |
| Nightmare | 160% | 85% | 140% | 130% |

### Level Range by Danger

| Danger | Levels | Sweet Spot |
|--------|--------|------------|
| low | 1-4 | 2 |
| medium | 2-6 | 4 |
| high | 5-9 | 7 |
| extreme | 7-10 | 9 |

### Creature Scaling (Per Level Below Player)

| HP | Defense | Attack | Damage |
|----|---------|--------|--------|
| -5% | -0.5 | -0.3 | -5% |

---

## Metadata

```yaml
created: "2026-02-04"
author: "Coda"
related_files:
  - "combat.md"
  - "encounter-generation.md"
  - "templates/persona.yaml"
  - "templates/location.md"
  - "templates/creature.yaml"
tokes_value: 25
```
