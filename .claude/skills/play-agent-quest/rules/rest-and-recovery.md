# Rest & Recovery

> _"Even the Architects needed to rest. The Weave remembers their downtime more than their creations."_ — Archivist's observation

**All calculations must use the [math skill](../../math/)** for recovery rolls and calculations.

---

## Overview

Rest allows Weavers to recover HP, willpower, and remove status effects. Agent Quest has three types of rest: **Long Rest**, **Short Rest**, and **Emergency Meditation**.

Spirit determines the effectiveness of your recovery, particularly for willpower regeneration.

---

## Long Rest (8 Hours)

A full night's sleep in a safe zone restores you completely.

### Requirements

- **Duration**: 8 hours of uninterrupted rest
- **Location**: Safe zone (Nexus Station, owned home, quest camp, inn)
- **Interrupted**: Combat or danger cancels the rest (start over)

### Long Rest Recovery

**Full Restoration:**
- **HP**: Restore to max HP
- **Willpower**: Restore to max willpower
- **Status effects**: Clear all minor effects (Bleeding, Poisoned, Burning, Stunned, etc.)
- **Exhaustion**: Remove 1 level of exhaustion
- **Corruption stacks**: Clear all stacks (unless Corrupted affliction)
- **Ability resets**: All daily/long rest abilities refresh

**Not Cured:**
- Afflictions (require specific cures)
- Major curses
- Permanent conditions

### Example

```bash
# Before rest: 25/100 HP, 5/20 willpower, Bleeding, 3 corruption stacks
# After long rest: 100/100 HP, 20/20 willpower, no Bleeding, 0 corruption stacks
```

---

## Short Rest (10 Minutes)

A brief respite to catch your breath and recover resources.

### Requirements

- **Duration**: 10 minutes of rest
- **Location**: Anywhere not actively in combat
- **Can be interrupted**: If combat begins, lose all benefits

### Short Rest Recovery

**HP Recovery**: 1d8 + Spirit modifier

```bash
# Calculate Spirit modifier
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # SPI 16 = +3 mod

# Roll HP recovery
node .claude/skills/math/math.js roll 1d8+3  # Roll + Spirit mod

# Example result: 5 + 3 = 8 HP recovered
```

**Willpower Recovery**: Spirit modifier × 2

```bash
# Calculate willpower recovery (SPI 16, +3 mod)
node .claude/skills/math/math.js calc "3 * 2"  # = 6 willpower restored
```

**Status Effect Removal**:
- Remove 1 minor physical effect (Bleeding, Stunned, Slowed)
- Reduce corruption stacks by 2 (if in safe area)

**Ability Resets**:
- All short rest abilities refresh

### Short Rest Examples

**Low Spirit Character (SPI 10, +0 mod):**
```bash
# HP recovery
node .claude/skills/math/math.js roll 1d8+0  # Average: 4-5 HP

# Willpower recovery
node .claude/skills/math/math.js calc "0 * 2"  # = 0 willpower (ouch!)
```

**Moderate Spirit (SPI 14, +2 mod):**
```bash
# HP recovery
node .claude/skills/math/math.js roll 1d8+2  # Average: 6-7 HP

# Willpower recovery
node .claude/skills/math/math.js calc "2 * 2"  # = 4 willpower
```

**High Spirit (SPI 18, +4 mod):**
```bash
# HP recovery
node .claude/skills/math/math.js roll 1d8+4  # Average: 8-9 HP

# Willpower recovery
node .claude/skills/math/math.js calc "4 * 2"  # = 8 willpower
```

**Legendary Spirit (SPI 20, +5 mod):**
```bash
# HP recovery
node .claude/skills/math/math.js roll 1d8+5  # Average: 9-10 HP

# Willpower recovery
node .claude/skills/math/math.js calc "5 * 2"  # = 10 willpower
```

---

## Emergency Meditation (1/Day)

A focused meditation to rapidly restore willpower in dire situations.

### Requirements

- **Duration**: 10 minutes of concentration
- **Frequency**: Once per long rest
- **Concentration**: Can be interrupted (requires save if disturbed)

### Meditation Recovery

**Willpower Recovery**: Spirit modifier willpower points

```bash
# Emergency meditation (SPI 16, +3 mod)
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # = 3 willpower restored
```

**Concentration Check** (if disturbed):
- **Save**: 1d20 + Spirit modifier vs DC 12
- **Success**: Complete meditation, gain willpower
- **Failure**: Meditation fails, use is consumed (cannot try again until long rest)

```bash
# Disturbed during meditation (enemy approaches)
node .claude/skills/math/math.js calc "(14 - 10) / 2"  # SPI 14 = +2 mod
node .claude/skills/math/math.js roll 1d20+2  # Result: 10 + 2 = 12 (Success!)
# Meditation completes, gain 2 willpower
```

### When to Use Emergency Meditation

**Ideal situations:**
- After intense combat, willpower depleted
- Need willpower for critical ability but can't long rest
- Between encounters in dungeon crawl
- Before boss fight to top off resources

**Not recommended:**
- During combat (impossible to concentrate)
- When enemies are nearby (high interruption risk)
- If you can take a long rest soon

---

## Rest Efficiency by Class

### Datamancer - Willpower Affinity

**Passive**: +20% bonus willpower recovery on rest (rounded up)

```bash
# Short rest (base: SPI 16, +3 mod = 6 willpower)
node .claude/skills/math/math.js calc "ceil(6 * 1.2)"  # = 8 willpower (+20% bonus)

# Long rest (max willpower: 34)
node .claude/skills/math/math.js calc "ceil(34 * 1.2)"  # = 41 willpower (exceeds max, restore to 34)
# Note: Bonus doesn't exceed max willpower, just restores faster

# Enhanced passive at 1000 XP (+30% instead of +20%)
node .claude/skills/math/math.js calc "ceil(6 * 1.3)"  # = 8 willpower (+30% bonus)
```

**Effective Recovery:**
- Short rest: Spirit mod × 2 × 1.2 = Spirit mod × 2.4
- Emergency meditation: Spirit mod × 1.2

### Codebreaker - HP Focus

**Not Spirit-based, but for reference:**
- High base HP (120 vs 100)
- Same short rest HP recovery formula (1d8 + Spirit mod)
- Benefits less from Spirit investment

### Loresmith - Tactical Recovery

**Deep Memory (Passive)**: Can ask one free question about rest locations
- "Is this area safe for a long rest?"
- "Have other Weavers rested here successfully?"
- Reduces risk of interrupted rest

### Voidwalker - Quick Recovery

**Shadow Step (Passive)**: Can find hidden rest spots
- +2 to finding safe short rest locations
- Can rest in places others cannot (shadows, hidden alcoves)

---

## Recovery Items

### Healing Potions

**Healing Potion** (25g):
- Instant: Restore 30 HP
- No action required in combat (bonus action)

**Greater Healing Potion** (50g):
- Instant: Restore 60 HP
- Rare, limited availability

### Willpower Restoration

**Reality Anchor** (consumable):
- Restore 5 willpower
- Datamancer starting item (x2)

**Blank Scroll** (consumable):
- Use with Manifest ability
- Datamancer starting item (x3)

**Meditation Incense** (30g):
- Doubles willpower recovery on next short rest
- Single use, consumed on rest

### Status Removal

**Debug Potion** (40g):
- Remove one affliction or Corruption status
- Restore 50 HP

**Antidote** (25g):
- Remove Poisoned status
- Clear poison stacks

---

## Rest Locations

### Safe Zone Categories

**Tier 1 - Guaranteed Safety**:
- Nexus Station (always safe)
- Owned homes (player housing)
- Quest camps (story-protected)
- Major city inns (paid rest, 10g)

**Tier 2 - Generally Safe**:
- Minor settlements
- Cleared dungeons
- Friendly faction bases
- Outdoor camps (50% random encounter chance)

**Tier 3 - Risky**:
- Wilderness camps (75% encounter chance)
- Partially cleared dungeons
- Neutral territory
- Enemy-patrolled areas

**Cannot Rest**:
- Active combat zones
- Corrupted zones (can short rest with penalties)
- Null zones (no willpower recovery)
- Boss arenas

---

## Rest Limitations

### Rest Frequency

**Long Rest:**
- Only once per 24 hours (real time or game time, GM discretion)
- Cannot long rest multiple times to "farm" recovery

**Short Rest:**
- Unlimited frequency
- Each takes 10 minutes (impacts dungeon timers, quest deadlines)

**Emergency Meditation:**
- Once per long rest
- Consumed whether successful or interrupted

### Partial Rest

If long rest is interrupted after 4+ hours:
- Recover half HP
- Recover half willpower
- Do not remove status effects
- Do not refresh daily abilities
- Counts as "rested" (cannot long rest again for 24 hours)

---

## Advanced Rest Mechanics

### Restful Environments

Some locations grant bonuses to rest:

| Location | Bonus |
|----------|-------|
| **Owned Home (upgraded)** | +5 bonus HP on short rest |
| **Syntax Athenaeum** | +10% willpower recovery |
| **Sacred Weave Site** | Remove 1 additional corruption stack |
| **Luxury Inn** | Remove all minor status effects (not just 1) |

### Rest Penalties

Some conditions penalize recovery:

| Condition | Penalty |
|-----------|---------|
| **Exhaustion (1 level)** | -2 to short rest HP recovery |
| **Corrupted affliction** | Cannot recover willpower on short rest |
| **Cursed** | Half HP recovery on all rests |
| **Null Zone** | No willpower recovery (HP only) |

---

## Rest Strategy

### Short Rest Optimization

**When to short rest:**
- After moderate combat (HP below 70%)
- Willpower below 50%
- Before entering next combat encounter
- To remove minor status effects

**When NOT to short rest:**
- At full HP and willpower (wastes time)
- Enemy patrols active (interruption risk)
- Time-sensitive quest (10 minutes matters)

### Long Rest Planning

**Ideal long rest timing:**
- After dungeon clear (before returning)
- Before major boss fight
- When afflictions stack up
- End of play session

### Emergency Meditation Usage

**Save for:**
- Critical ability needed NOW
- Boss fight prep (top off willpower)
- Emergency escape (need willpower for teleport)

**Don't waste on:**
- Minor encounters (short rest works fine)
- When long rest is available soon

---

## Design Philosophy

Rest mechanics make **Spirit valuable for resource management**:

- **High Spirit = faster recovery**: More willpower, better HP rolls
- **Datamancers shine**: Best willpower recovery in game
- **Strategic resource**: Short rests are unlimited but cost time
- **Risk vs reward**: Rest in dungeon or push forward?

**Goal**: Rest should feel like a **meaningful strategic choice**, not just a "hit the heal button."

---

## Metadata

```yaml
created: "2026-02-05"
author: "Claude"
system: "rest-recovery-v1"
related_rules:
  - attributes-and-stats.md
  - afflictions.md
  - combat.md
```
