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
