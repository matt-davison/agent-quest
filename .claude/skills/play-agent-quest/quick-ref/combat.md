# Combat Quick Reference

**Use math skill for ALL calculations.**

## Initiative
```bash
node .claude/skills/math/math.js roll 1d20+AGI_MOD
```
Highest acts first.

## Turn Actions
- **1 Major**: Attack, spell, item, move
- **1 Minor**: Draw weapon, speak
- **Free**: Drop item, simple gestures

## Attack Roll
```bash
# Stat modifier
node .claude/skills/math/math.js calc "(STAT - 10) / 2"

# Attack roll
node .claude/skills/math/math.js roll 1d20+MODIFIER
```

**Hit if:** Roll ≥ Target Defense

**Defense:** `10 + AGI_MOD + Armor`

## Results
- **Miss**: No damage
- **Hit**: Roll damage
- **Hit by 5+**: Critical - double damage dice
- **Natural 20**: Max damage + roll again
- **Natural 1**: Miss + disadvantage next turn

## Damage
```bash
# Weapon damage + stat modifier
node .claude/skills/math/math.js roll 1d8+STR_MOD  # Example: longsword
```

**Weapon Types:**
- Melee: STR mod
- Ranged: AGI mod
- Magic: SPI mod

## Common Weapons
| Weapon | Damage | Type |
|--------|--------|------|
| Dagger | 1d4 | Melee/Ranged |
| Sword | 1d8 | Melee |
| Greatsword | 2d6 | Melee |
| Bow | 1d8 | Ranged |
| Staff | 1d6 | Melee/Magic |

## HP & Death
- **0 HP**: Unconscious, make death saves
- **-10 HP**: Dead
- **Healing**: Potions, rest, or abilities

## Special Actions
- **Defend**: +2 Defense this round (Major)
- **Weave Strike**: 5 Tokes = 30 guaranteed damage (Major)

## Difficulty Modifiers

| Setting | Take | Deal | XP | Loot |
|---------|------|------|-----|------|
| Easy | 0.6× | 1.1× | 0.8× | 1.0× |
| Normal | 1.0× | 1.0× | 1.0× | 1.0× |
| Hard | 1.3× | 0.95× | 1.2× | 1.15× |
| Nightmare | 1.6× | 0.85× | 1.4× | 1.3× |

## Creature Scaling (vs lower-level)
Per level below player: HP -5%, Def -0.5, Atk -0.3, Dmg -5%

## When to Load Full Rules
Load [rules/combat.md](../rules/combat.md) for:
- Class-specific abilities
- Complex maneuvers
- Environmental hazards
- Special combat types

Load [rules/afflictions.md](../rules/afflictions.md) for:
- Status effects
- Conditions
- Debuffs

Load [rules/spells-and-abilities.md](../rules/spells-and-abilities.md) for:
- Spell casting
- Ability details

Load [rules/difficulty.md](../rules/difficulty.md) for:
- Personal difficulty settings
- Location level ranges
- Creature level scaling
