# Abilities Quick Reference

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

## Usage Limits

| Reset Type | When It Resets |
|------------|----------------|
| `combat` | End of combat |
| `short_rest` | After 10-min rest |
| `long_rest` | After 8-hour rest |
| `location` | On location change |
| `daily` | At dawn |

## Action Types

| Type | Timing |
|------|--------|
| `major` | Main action, 1/turn |
| `minor` | Quick action, 1/turn |
| `reaction` | Interrupt, when triggered |
| `free` | No action cost |
| `passive` | Always active |

## Class Abilities Quick Lookup

### Codebreaker

| ID | Name | Type | WP | Description |
|----|------|------|-----|-------------|
| `iklvbklj` | Shatter | ability | 3 | Break barriers, debris damages nearby |
| `fayrdef5` | Momentum | passive | 0 | +1 damage per consecutive hit (max +5) |

### Loresmith

| ID | Name | Type | WP | Description |
|----|------|------|-----|-------------|
| `8xshjib3` | Silver Tongue | passive | 0 | +5 to persuasion/deception |
| `rztv8f8w` | Recall | ability | 2 | Remember lore, detect patterns |

### Voidwalker

| ID | Name | Type | WP | Description |
|----|------|------|-----|-------------|
| `xgktne2p` | Phase | ability | 4 | Pass through walls (costs 5 HP) |
| `lf5fbupm` | Backstab | ability | 3 | 3x damage when undetected |

### Datamancer

| ID | Name | Type | WP | Description |
|----|------|------|-----|-------------|
| `ny1uz95q` | Manifest | ability | 5 | Create temporary item (5 willpower) |
| `2xa2x78z` | Reality Patch | ability | 8 | Modify terrain (10 willpower) |
| `htl7wy2h` | Weave Attunement | passive | 0 | +20% willpower recovery |

## Universal Abilities

| ID | Name | Type | Tier | WP | Description |
|----|------|------|------|-----|-------------|
| `8q85yzih` | Smoke Screen | ability | 1 | 3 | Create smoke, blocks ranged |
| `po5wumfb` | Iron Skin | ability | 1 | 4 | +4 defense, -2 speed |
| `pwd0gz91` | Expose Weakness | ability | 1 | 3 | -3 defense, marks Vulnerable |
| `xwikynd1` | Dispel | ability | 1 | 4 | Remove buffs, interrupt spells |
| `lkhskejx` | Flame Strike | spell | 1 | 5 | 15 fire damage, applies Burning |
| `tmdelr3q` | Basic Weapon Expertise | passive | 1 | 0 | +2 damage with weapons |
| `5roi8b4d` | Gravity Well | ability | 3 | 6 | Pull enemies, apply Slowed |
| `cbsy0ksp` | Basic Weave Theory | passive | 1 | 0 | +2 to Weave interactions |

## Combo System

Abilities with `combo_tag` mark targets. Other abilities can check for these tags.

| Tag | Applier | Exploiter |
|-----|---------|-----------|
| `vulnerable` | Expose Weakness | +5-8 damage |
| `burning` | Flame Strike | Fire abilities +50% |
| `slowed` | Gravity Well | Easy to hit (-2 defense) |

## Ability Commands

```bash
# List all abilities
node .claude/skills/abilities/abilities.js list

# Filter by class
node .claude/skills/abilities/abilities.js list --class=Datamancer

# Filter by type
node .claude/skills/abilities/abilities.js list --type=passive

# Get ability details
node .claude/skills/abilities/abilities.js get <id>

# Check willpower cost
node .claude/skills/abilities/abilities.js cost <id> [level]

# Check if usable
node .claude/skills/abilities/abilities.js can-use "<persona-yaml>" <id>
```

## When to Load Full Rules

Load [world/abilities/index.md](../../../world/abilities/index.md) for:
- Creating new abilities
- Advanced ability effects
- Enemy ability creation
- Full ability schema
