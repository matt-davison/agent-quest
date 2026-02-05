# Ability Catalog

> _"Power flows through form. Master the forms, master the power."_

## Overview

Abilities in Agent Quest are stored as individual YAML files in `/world/abilities/database/`. Each ability has a unique 8-character ID and follows a standardized schema.

## Ability Types

| Type | Description | Examples |
|------|-------------|----------|
| **spell** | Magical abilities cast through the Weave | Flame Strike, Reality Patch |
| **ability** | Physical or mental techniques | Shatter, Backstab, Recall |
| **passive** | Always-active bonuses | Momentum, Silver Tongue, Weave Attunement |

## Classes

| Class | Focus | Core Abilities |
|-------|-------|----------------|
| **Codebreaker** | Physical combat, destruction | Shatter, Momentum |
| **Loresmith** | Knowledge, social | Silver Tongue, Recall |
| **Voidwalker** | Stealth, mobility | Phase, Backstab |
| **Datamancer** | Weave manipulation, creation | Manifest, Reality Patch |

Universal abilities (class: null) can be learned by any class.

## Tiers

Abilities unlock at character tiers:

| Tier | Level Required | Ability Examples |
|------|----------------|------------------|
| 1 | 1 | Basic class abilities, simple tactics |
| 3 | 3 | Intermediate abilities, combo starters |
| 5 | 5 | Advanced abilities, powerful effects |
| 7 | 7 | Expert abilities, multi-target |
| 9 | 9 | Master abilities, reality-altering |
| 10 | 10 | Legendary abilities, unique effects |

## Ability Design Guidelines

**Core principle**: Abilities should encourage tactical variety, not damage spam.

### Required Effect Categories

Every ability should have 1+ of these:

| Category | Examples |
|----------|----------|
| **Environmental** | Create cover, hazard zones, light/darkness |
| **Buffs** | Defense boost, haste, damage amplify |
| **Debuffs** | Slow, blind, vulnerable, taunt |
| **Utility** | Reveal hidden, dispel, interrupt |
| **Positioning** | Push, pull, teleport, swap |

### Damage Abilities Must Include Secondary Effects

- **Wrong**: "Deal 30 fire damage"
- **Right**: "Deal 20 fire damage and apply Burning (5 dmg/round for 3 rounds)"
- **Right**: "Deal 15 damage and Push target 5m back"

### Combo Design

Design abilities that synergize:
- **Debuff → Exploit**: "Expose Weakness" (-3 defense) + "Precise Strike" (+10 vs debuffed)
- **Setup → Payoff**: "Oil Splash" (creates hazard) + "Ignite" (fire in oil = explosion)
- **Crowd Control Chains**: "Slow" → "Freeze" → "Shatter"

## Creating New Abilities

### 1. Generate ID

```bash
node .claude/skills/math/math.js id 8
```

### 2. Check for Duplicates

```bash
node .claude/skills/abilities/abilities.js similar "Ability Name"
```

### 3. Create File

```yaml
# Ability Name
id: <8-char-id>
name: "Ability Name"
type: spell | ability | passive
subtype: <category>
class: null | Codebreaker | Loresmith | Voidwalker | Datamancer
tier: 1 | 3 | 5 | 7 | 9 | 10
tags:
  - combat
  - relevant
  - tags

prerequisites:
  min_stat: <value>          # Optional stat requirement
  abilities: []              # IDs of required abilities
  quests: []                 # Quest IDs that must be completed

levels:
  1:
    description: "What the ability does at level 1"
    willpower_cost: <number>
    effect:
      # Structured effect data
    learn_cost: <gold>
  2:
    description: "Upgraded version"
    willpower_cost: <number>
    effect:
      # Enhanced effects
    learn_cost: <gold>
    upgrade_from: 1

limits:
  reset: null | combat | short_rest | long_rest | location | daily
  max_uses: null | <number>
  cooldown_rounds: null | <number>

action_type: major | minor | reaction | free | passive
range: null | <number in meters>
target: self | single | area | cone | line
```

### 4. Validate

```bash
node .claude/skills/abilities/abilities.js get <id>
```

## Passive Abilities

Passives are always active when known. Key differences:
- `action_type: passive`
- `willpower_cost: 0`
- `limits.reset: null`
- No usage tracking needed

### Passive Effect Types

| Type | Example |
|------|---------|
| `stat_bonus` | `{stat: "agility", bonus: 2}` |
| `damage_bonus` | `{damage_bonus: 3, applies_to: "weapon_attacks"}` |
| `defense_bonus` | `{defense_bonus: 2}` |
| `resistance` | `{damage_type: "fire", reduction: 5}` |
| `triggered` | `{trigger: "on_hit", effect: "bleed"}` |
| `resource_bonus` | `{willpower_multiplier_bonus: 0.5}` |

## Enemy Abilities

Same schema as player abilities, with:
- `class: null` (enemies don't have player classes)
- Tags include: `enemy`, `<enemy-type>` (e.g., `shadow-stalker`, `goblin`)

Example tags: `[enemy, shadow-stalker, shadow, melee]`

## Willpower System

### Willpower Pool

```
max_willpower = spirit × willpower_multiplier
```

- Base multiplier: 2 (Spirit 18 = 36 willpower)
- Increases through progression, items, training

### Willpower Costs by Tier

| Tier | Typical Cost Range |
|------|-------------------|
| 1 | 2-5 |
| 3 | 4-7 |
| 5 | 6-10 |
| 7 | 8-12 |
| 9 | 10-15 |
| 10 | 12-20 |

### Recovery

- **Short Rest**: Recover 25% max willpower
- **Long Rest**: Recover 100% max willpower
- **Mana Crystal**: Restore 20 willpower (consumable)

## Usage Limits

| Reset Type | When |
|------------|------|
| `combat` | End of combat encounter |
| `short_rest` | After 10-minute rest |
| `long_rest` | After 8-hour rest |
| `location` | When moving to new location |
| `daily` | At dawn each day |

## Current Abilities

Run to see all abilities:
```bash
node .claude/skills/abilities/abilities.js list
```

Filter by class:
```bash
node .claude/skills/abilities/abilities.js list --class=Datamancer
```

Filter by tags:
```bash
node .claude/skills/abilities/abilities.js list --tags=combat,passive
```
