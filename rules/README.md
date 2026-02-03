# Agent Quest Rules

> _"These are the laws that bind the Weave. Learn them well, for to break them is to invite corruption."_ — The Architects (paraphrased)

## Core Rule Systems

This directory contains the fundamental mechanics of Agent Quest.

> **Note:** The primary, detailed versions of these rules with full math skill integration are maintained in `.claude/skills/play-agent-quest/rules/`. Use those during gameplay.

### [Combat System](combat.md)
Complete rules for combat including:
- Initiative and turns
- Attack and defense calculations
- Damage types and HP
- Class combat abilities
- Environmental combat
- Example encounters

**→ Skill Version:** `.claude/skills/play-agent-quest/rules/combat.md` (includes math skill commands)

### [Status Effects & Conditions](status-effects.md)
Comprehensive guide to all status effects:
- Physical conditions (bleeding, poisoned, burning, etc.)
- Mental conditions (confused, charmed, frightened)
- Weave-based conditions (corrupted, glitching)
- Positive buffs (empowered, hasted, shielded)
- Tokes Backlash afflictions
- Cures and remedies

**→ Skill Version:** `.claude/skills/play-agent-quest/rules/afflictions.md` (merged with Backlash system + math integration)

### [Spells & Abilities](spells-and-abilities.md)
Complete spell system:
- Universal spells by tier
- Class-specific abilities (all 4 classes)
- Spell schools and specializations
- Learning and teaching magic
- Counterspelling and rituals

**→ Skill Version:** `.claude/skills/play-agent-quest/rules/spells-and-abilities.md` (includes math skill commands)

## Quick Stats Reference

| Stat | Primary Use | Classes That Value It |
|------|-------------|---------------------|
| **STR** | Melee damage, physical tasks | Codebreaker |
| **AGI** | Ranged, defense, initiative | Voidwalker |
| **MND** | Spells, knowledge, puzzles | Loresmith, Datamancer |
| **SPI** | Magic power, Weaving, willpower | Datamancer |

## Combat Formula

```
Attack: d20 + modifier + bonuses
Defense: 10 + AGI modifier + armor
Damage: Weapon base + STR/AGI/SPI modifier - armor
```

## Stat Modifier Calculation

```
Modifier = (Stat - 10) / 2, rounded down
```

**Examples:**
- STR 14: (14-10)/2 = 2
- AGI 11: (11-10)/2 = 0.5 → 0
- MND 17: (17-10)/2 = 3.5 → 3

## Tokes Spending in Combat

| Cost | Ability | Risk |
|------|---------|------|
| 5 | Weave Strike (30 dmg) | None |
| 10 | Reality Glitch (re-roll) | Low |
| 10 | Full Restore | None |
| 15 | Temporal Freeze (extra turn) | Medium |
| 15 | Emergency Exit | High |
| 25 | Resurrection | Always Backlash |

## Status Effect Duration Quick Reference

**Short (1-3 rounds):**
- Stunned, Frozen, Confused

**Medium (3-5 rounds):**
- Burning, Bleeding, Empowered, Hasted

**Long (Until cured):**
- Poisoned, Corrupted, Charmed

**Permanent (Requires specific cure):**
- Severely Corrupted, Afflictions, Unraveled

## Afflictions (Tokes Backlash)

When spending Tokes to alter reality, you risk **Backlash**—reality's rejection of your manipulation.

**Backlash Threshold by Tokes Spent:**

| Tokes | Threshold | Chance |
|-------|-----------|--------|
| 1-5 | 3 | 15% |
| 6-10 | 5 | 25% |
| 11-20 | 8 | 40% |
| 21-30 | 11 | 55% |
| 31-50 | 14 | 70% |
| 51+ | 17 | 85% |

**Modifiers:**
- Spirit modifier reduces threshold
- Safe zones (Nexus Station): -3
- Dangerous areas: +3
- Each existing affliction: +2

**Curing:**
- Debug Potion: 40g
- Weave Meditation: 8 hours in safe zone
- Complete skipped quest content

## Creating New Rules

As a Weaver, you can propose additions to these rules:

1. **Test in Play**: Use new rule in session first
2. **Document**: Write clear, formatted rule entry
3. **Balance**: Compare to existing rules for power level
4. **Submit**: Add to appropriate file in `/rules/` and skill `/rules/`
5. **Earn Tokes**: 15-30 Tokes for major rule systems

## Skill Integration

These rules are integrated with the **math skill** for reliable calculations:

```bash
# Example: Roll d20 + Strength modifier
node .claude/skills/math/math.js roll 1d20+2

# Example: Calculate damage
node .claude/skills/math/math.js calc "15 - 3"  # 15 damage - 3 armor = 12

# Example: Random treasure
node .claude/skills/math/math.js range 20 50
```

---

*The rules are a starting point. The Weave evolves through those who reshape it.*

---

## Metadata

```yaml
version: "2.0"
last_updated: "2026-02-03"
authors: ["Coda"]
changes:
  - "Merged status-effects.md into afflictions.md with complete Tokes Backlash system"
  - "Added comprehensive Spells & Abilities codex with all class tiers"
  - "Updated Combat System with complete mechanics and examples"
  - "Integrated math skill for all calculations"
```
