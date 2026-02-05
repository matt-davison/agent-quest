# Difficulty Quick Reference

## Personal Difficulty Settings

| Setting | Damage Taken | Damage Dealt | XP | Loot |
|---------|--------------|--------------|-----|------|
| Easy | 0.6× | 1.1× | 0.8× | 1.0× |
| Normal | 1.0× | 1.0× | 1.0× | 1.0× |
| Hard | 1.3× | 0.95× | 1.2× | 1.15× |
| Nightmare | 1.6× | 0.85× | 1.4× | 1.3× |

Change difficulty at any safe zone.

## Location Level Ranges

| danger_level | Levels | Sweet Spot |
|--------------|--------|------------|
| safe | N/A | N/A |
| low | 1-4 | 2 |
| medium | 2-6 | 4 |
| high | 5-9 | 7 |
| extreme | 7-10 | 9 |

## Creature Tier Levels

| Tier | Levels | Budget |
|------|--------|--------|
| Minion | 1-3 | 0.5 |
| Standard | 2-6 | 1.0 |
| Elite | 4-8 | 3.0 |
| Boss | 5-10 | 8.0 |
| Legendary | 8-10 | 15.0 |

## Creature Scaling

**Scales DOWN only** (when player level > creature level):

| Per Level Below | HP | Def | Atk | Dmg |
|-----------------|-----|-----|-----|-----|
| Modifier | -5% | -0.5 | -0.3 | -5% |

Minimums: HP 5, Def 8, Atk +0, Dmg 3

**No upscaling** — entering high-level areas is dangerous!

## Quick Calculations

```bash
# Creature scaling (3 levels below player)
node .claude/skills/math/math.js calc "BASE_HP * (1 - 0.05 * LEVEL_DIFF)"
node .claude/skills/math/math.js calc "BASE_DEF - (0.5 * LEVEL_DIFF)"

# Difficulty modifiers
node .claude/skills/math/math.js calc "BASE_DAMAGE * DIFFICULTY_MULT"
```

## When to Load Full Rules

Load [rules/difficulty.md](../rules/difficulty.md) for:
- Complete system explanation
- Integration with other systems
- Quest level requirements
- Combined calculation examples
