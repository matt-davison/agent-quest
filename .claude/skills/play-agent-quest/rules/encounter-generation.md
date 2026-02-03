# Encounter Generation System

> _"The Weave doesn't spawn random enemies. It creates challenges calibrated to break you—or make you stronger."_ — Sage Meridian

This document provides procedures for generating combat encounters, including difficulty balancing, enemy composition, environment generation, and dynamic events.

---

## Overview

When combat begins:

1. **Calculate Difficulty Budget** based on party level and desired challenge
2. **Select Enemy Composition** using the budget
3. **Generate Battle Environment** based on location type
4. **Determine Initial Positions** for all combatants
5. **Set Up Dynamic Events** that trigger during combat

---

## Step 1: Difficulty Budget

### Base Budget Formula

```bash
# Use math skill for calculation
node .claude/skills/math/math.js calc "PARTY_SIZE * AVERAGE_LEVEL * DIFFICULTY_MULTIPLIER"
```

**Difficulty Multipliers:**

| Difficulty | Multiplier | Description |
|------------|------------|-------------|
| Trivial | 0.5 | No real threat, resource preservation |
| Easy | 0.75 | Minor challenge, warm-up combat |
| Standard | 1.0 | Balanced fight, some resource expenditure |
| Hard | 1.5 | Significant challenge, heavy resources |
| Deadly | 2.0 | High risk of death, boss fights |
| Nightmare | 3.0 | Near-certain death without perfect play |

### Example Calculations

```bash
# Solo player, level 3, Standard difficulty
node .claude/skills/math/math.js calc "1 * 3 * 1.0"  # Budget: 3

# Party of 4, level 5, Hard difficulty
node .claude/skills/math/math.js calc "4 * 5 * 1.5"  # Budget: 30

# Solo player, level 1, Easy difficulty
node .claude/skills/math/math.js calc "1 * 1 * 0.75"  # Budget: 0.75 (round to 1)
```

### Budget Modifiers

Apply these modifiers to the base budget:

| Condition | Modifier |
|-----------|----------|
| Party has no healer | -10% |
| Party has powerful items | +15% |
| Party is exhausted/low HP | -25% |
| Advantageous terrain for party | -10% |
| Ambush situation (party surprised) | +25% |
| Ambush situation (party ambushing) | -25% |
| Boss lair (environmental synergy) | +20% |

---

## Step 2: Enemy Composition

### Creature Cost by Tier

| Tier | Budget Cost | Role in Encounter |
|------|-------------|-------------------|
| **Minion** | 0.5 | Fodder, action economy, swarm |
| **Standard** | 1.0 | Core threats, balanced |
| **Elite** | 3.0 | Mini-boss, significant threat |
| **Boss** | 8.0 | Encounter centerpiece |
| **Legendary** | 15.0 | Campaign-defining battle |

### Composition Guidelines

**Solo Boss Encounter:**
- 1 Boss (8) + Budget remainder in minions
- Example: Budget 10 → 1 Boss + 4 Minions

**Elite with Support:**
- 1 Elite (3) + Standards/Minions
- Example: Budget 6 → 1 Elite + 3 Standards

**Horde Encounter:**
- Many minions/standards, no elite+
- Example: Budget 5 → 10 Minions or 5 Standards

**Mixed Encounter:**
- Variety of tiers
- Example: Budget 8 → 1 Elite + 2 Standards + 4 Minions

### Role Distribution

For balanced encounters, include multiple combat roles:

| Encounter Type | Recommended Roles |
|----------------|-------------------|
| Straightforward | 60% Brute/Skirmisher, 40% Support/Controller |
| Tactical | 40% Controller, 30% Sniper, 30% Skirmisher |
| Swarm | 80% Swarm, 20% Support |
| Boss Fight | Boss + 50% Minion, 30% Support, 20% Controller |

### Encounter Composition Tables

Roll d100 or select based on location/narrative:

**Standard Encounter (Budget 3-5):**

| d100 | Composition |
|------|-------------|
| 01-30 | 3-4 Standards (same type) |
| 31-50 | 1 Standard + 4-6 Minions |
| 51-70 | 2 Standards (different types) + 2 Minions |
| 71-85 | 1 Elite alone |
| 86-95 | 6-8 Minions (swarm) |
| 96-00 | 1 Elite + 2-3 Minions |

**Hard Encounter (Budget 6-10):**

| d100 | Composition |
|------|-------------|
| 01-25 | 1 Elite + 2 Standards |
| 26-45 | 2 Elites |
| 46-60 | 1 Elite + 1 Standard + 6 Minions |
| 61-75 | 4-5 Standards |
| 76-85 | 1 Boss alone |
| 86-95 | 10-12 Minions |
| 96-00 | 1 Elite + 4 Standards |

**Boss Encounter (Budget 10+):**

| d100 | Composition |
|------|-------------|
| 01-40 | 1 Boss + 4-6 Minions |
| 41-60 | 1 Boss + 1 Elite |
| 61-75 | 1 Boss + 2 Standards + 4 Minions |
| 76-85 | 2 Elites + 2 Standards + 4 Minions |
| 86-95 | 1 Boss + 1 Standard + 8 Minions |
| 96-00 | 1 Legendary alone |

---

## Step 3: Environment Generation

### Determine Environment Type

Match to current location:

| Location Type | Environment Type |
|---------------|------------------|
| Cities, settlements | Urban |
| Forests, plains, mountains | Wilderness |
| Ruins, caves, buildings | Dungeon |
| Data streams, networks | Digital |
| Corrupted areas | Corrupted |
| Void rifts, anomalies | Void |

### Generate Terrain Features

Roll on the appropriate table from `templates/battle-environment.yaml`:

```bash
# Roll for terrain feature
node .claude/skills/math/math.js roll 1d100

# Check result against weight table for location type
```

**Standard Environment Components:**
- 1-2 Terrain features (elevation, cover, difficult terrain)
- 1-2 Interactive elements (explosives, panels, objects)
- 0-1 Hazards (based on difficulty)
- 1-2 Tactical positions

### Environment Complexity by Difficulty

| Difficulty | Terrain | Interactive | Hazards | Events |
|------------|---------|-------------|---------|--------|
| Trivial | 1 | 0-1 | 0 | 0 |
| Easy | 1 | 1 | 0 | 0 |
| Standard | 2 | 1-2 | 0-1 | 1 |
| Hard | 2-3 | 2 | 1 | 1-2 |
| Deadly | 3 | 2-3 | 1-2 | 2 |
| Nightmare | 3+ | 3 | 2 | 2-3 |

### Quick Environment Generation

For fast setup, use these presets:

**Simple Arena:**
- Size: Medium
- Terrain: 2 pillars (heavy cover)
- Interactive: 1 explosive barrel
- Hazard: None
- Positions: Elevated corner, central open

**Tactical Battlefield:**
- Size: Large
- Terrain: Elevated platform, scattered debris (difficult)
- Interactive: Control panel, suspended cargo
- Hazard: Electrical strip
- Positions: Sniper nest, choke point, central hub

**Hazardous Zone:**
- Size: Medium
- Terrain: Scattered cover (light)
- Interactive: Emergency controls
- Hazard: Corruption pool, void tear
- Positions: Safe zones at edges, dangerous center

**Boss Lair:**
- Size: Large or Huge
- Terrain: Central throne/altar (elevated), pillars
- Interactive: 2-3 elements tied to boss mechanics
- Hazard: Boss-specific (fire for fire boss, etc.)
- Positions: Boss starting position with advantage

---

## Step 4: Initial Positioning

### Player Starting Positions

| Entry Type | Position |
|------------|----------|
| Normal entry | South/entrance area |
| Ambushed | Center of room, surrounded |
| Ambushing | Hidden positions of choice |
| Pursuit | Same side as enemies, close |
| Cornered | Against wall, limited retreat |

### Enemy Starting Positions

Based on role:

| Role | Starting Position |
|------|-------------------|
| **Brute** | Front line, between players and objectives |
| **Skirmisher** | Flanking positions, near cover |
| **Controller** | Central or near interactive elements |
| **Sniper** | Elevated, maximum range, heavy cover |
| **Support** | Behind front line, near allies |
| **Swarm** | Clustered, often hidden until triggered |
| **Boss** | Central/back, on elevated position or throne |

### Distance Guidelines

| Combat Start Type | Initial Distance |
|-------------------|------------------|
| Ambush (enemies) | Adjacent to Close (0-5m) |
| Ambush (players) | Close to Medium (5-20m) |
| Standard | Medium (10-15m) |
| Ranged focused | Medium to Long (15-30m) |
| Chase/pursuit | Close (5m) |

### Positioning Example

**Standard encounter in dungeon (party of 4 vs 1 Elite + 4 Minions):**

```
[N] Sniper position (elevated)

[Minion] [Minion]    [Elite]    [Minion] [Minion]
         ~~~~~~~~corruption pool~~~~~~~~
                    [pillar]

         [Player] [Player]
         [Player] [Player]
[S] Entry point
```

---

## Step 5: Dynamic Events

### Event Triggers

| Trigger Type | When It Activates |
|--------------|-------------------|
| **Round** | Specific round number (Round 3, etc.) |
| **HP Threshold** | Any creature reaches % HP |
| **Kill** | Creature type is defeated |
| **Destruction** | Object is destroyed |
| **Condition** | Custom condition is met |

### Standard Event Types

**Reinforcements:**
- More enemies enter combat
- Usually Round 3-5 or when 50% enemies defeated
- Entry point matters for tactics

**Environmental Change:**
- Hazard activates or expands
- Terrain shifts (collapse, flood, etc.)
- Lighting changes (darkness, etc.)

**Boss Phase:**
- HP threshold triggers new abilities
- Behavior changes dramatically
- May include lair action changes

**Countdown:**
- Alarm triggered, reinforcements in X rounds
- Structure collapsing, escape needed
- Ritual completing, must interrupt

### Event Generation Table

Roll d20 for random event type:

| d20 | Event |
|-----|-------|
| 1-5 | No dynamic event |
| 6-8 | Reinforcements (Round 4) |
| 9-11 | Environmental hazard activates (Round 3) |
| 12-14 | Terrain changes (triggered by damage to object) |
| 15-16 | Countdown starts (Round 2, 6 round timer) |
| 17-18 | Power surge/system failure (affects all electronics) |
| 19 | NPC intervention (ally or new enemy) |
| 20 | Reality glitch (random Weave effect) |

### Reinforcement Guidelines

| Original Budget | Reinforcement Budget |
|-----------------|---------------------|
| 3-5 | 1-2 |
| 6-10 | 2-4 |
| 11-15 | 3-5 |
| 16+ | 5-8 |

Reinforcements should be:
- Minions or Standards (rarely Elite)
- Appropriate to location (same faction/type)
- Entry from logical point (door, spawn, teleport)

---

## Scaling Guidelines

### Party Size Adjustments

| Party Size | Budget Modifier | Notes |
|------------|-----------------|-------|
| 1 (Solo) | ×0.6 | Reduce enemy count, not tier |
| 2 | ×0.8 | Slightly reduced |
| 3 | ×0.9 | Near standard |
| 4 | ×1.0 | Standard balance point |
| 5 | ×1.15 | Add minions |
| 6+ | ×1.3 | Add another tier up |

### Level Disparity

When enemies are significantly above/below player level:

| Level Difference | Adjustment |
|------------------|------------|
| Enemy -3 or more | Trivial, multiple required |
| Enemy -1 to -2 | Easy, slight advantage |
| Equal | Standard balance |
| Enemy +1 to +2 | Hard, dangerous |
| Enemy +3 or more | Deadly, reconsider |

### Resource State

Consider party condition:

| Condition | Difficulty Adjustment |
|-----------|----------------------|
| Fresh (full HP, abilities) | Standard or harder |
| Moderate (50-75% resources) | Standard |
| Depleted (25-50% resources) | Easy or Standard |
| Critical (<25% resources) | Trivial or Easy |

---

## Complete Generation Example

**Scenario:** Party of 1 (Codebreaker, Level 2) enters corrupted server room.

### Step 1: Calculate Budget
```bash
node .claude/skills/math/math.js calc "1 * 2 * 1.0"  # Base: 2
```
Apply modifiers: Solo player (-10% implicit in size adjustment)
Final Budget: ~2

### Step 2: Enemy Composition
Budget 2 = 4 Minions OR 2 Standards OR 1 Standard + 2 Minions

Select: 1 Glitch Wraith (Standard, 1.0) + 2 Data Parasites (Minions, 0.5 each) = 2.0

### Step 3: Environment
Location: Corrupted server room → Corrupted type

Generate:
- Size: Medium (20m × 20m)
- Terrain: Server racks (light cover), elevated walkway
- Interactive: Power junction box (overload for lightning)
- Hazard: Corruption pool (center)
- Tactical: High ground on walkway, cover behind racks

### Step 4: Positioning
```
[N] Walkway (elevated) - Glitch Wraith starts here

[Server Racks]  ≋≋corruption≋≋  [Server Racks]
                 ≋≋≋pool≋≋≋≋

[Parasite]     [Power Box]     [Parasite]

           ▢ Player Entry [S]
```

### Step 5: Dynamic Events
Roll d20: 9 → Environmental hazard activates Round 3
Event: Corruption pool expands 2m radius on Round 3

### Final Encounter Summary

**Enemies:**
- 1 Glitch Wraith (Standard) - starts on walkway
- 2 Data Parasites (Minions) - flanking positions

**Environment:**
- Corruption pool in center (5 damage + corruption chance)
- Server racks provide light cover
- Power junction can be overloaded (DC 12, 15 lightning in 5m)
- Elevated walkway (Wraith has +1 damage advantage)

**Dynamic Event:**
- Round 3: Corruption pool expands, threatening more area

**Victory:** Defeat all enemies
**Loot:** Standard drops from bestiary entries

---

## Quick Reference

### Budget Formula
`Party Size × Average Level × Difficulty Multiplier`

### Tier Costs
Minion: 0.5 | Standard: 1.0 | Elite: 3.0 | Boss: 8.0 | Legendary: 15.0

### Environment Components
Terrain (1-3) + Interactive (1-3) + Hazards (0-2) + Events (0-2)

### Positioning by Role
Brutes: Front | Snipers: Elevated/Back | Controllers: Center | Support: Behind

---

## Metadata

```yaml
created: "2026-02-03"
author: "Coda"
related_files:
  - "combat.md"
  - "enemy-tactics.md"
  - "templates/battle-environment.yaml"
  - "templates/creature.yaml"
```
