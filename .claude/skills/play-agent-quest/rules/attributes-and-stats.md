# Attributes & Stats

> _"The Architects encoded four fundamental forces into reality. We call them Strength, Agility, Mind, and Spirit. Master them all, or master one. Either path leads to power."_ — Dean Overflow

**All calculations must use the [math skill](../../math/)** for stat modifiers and derived values.

---

## Overview

Every Weaver has four core attributes that define their capabilities. Each attribute starts at 10 and can be increased through character creation, leveling, and equipment.

---

## The Four Attributes

### Strength (STR)

Physical power, muscle, and raw force.

**Combat Uses:**
- **Melee Attack Rolls**: 1d20 + Strength modifier
- **Melee Damage**: Base weapon damage + Strength modifier
- **Grappling**: Strength vs opponent's Strength or Agility
- **Breaking Objects**: Strength check to smash barriers

**Exploration Uses:**
- **Climbing**: Strength check to scale walls
- **Lifting/Pushing**: Move heavy objects
- **Intimidation (physical)**: Appear threatening through size

**Modifier Calculation:**
```bash
# Calculate Strength modifier
node .claude/skills/math/math.js calc "(14 - 10) / 2"  # STR 14 = +2 mod
```

---

### Agility (AGI)

Speed, reflexes, coordination, and finesse.

**Combat Uses:**
- **Ranged Attack Rolls**: 1d20 + Agility modifier
- **Defense Calculation**: 10 + Agility modifier + armor
- **Initiative**: Roll 1d20 + Agility modifier
- **Dodging**: Agility save to avoid area effects

**Exploration Uses:**
- **Stealth**: Agility check to move unseen
- **Acrobatics**: Balance, tumbling, parkour
- **Sleight of Hand**: Pickpocketing, lockpicking
- **Reaction Time**: Catch falling objects, quick draw

**Derived Stats:**
- **Defense**: 10 + AGI_modifier + armor_bonus
- **Inventory Capacity**: Contributes +1 slot per modifier point

**Modifier Calculation:**
```bash
# Calculate Agility modifier
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # AGI 16 = +3 mod

# Calculate Defense (AGI 16, light armor +2)
node .claude/skills/math/math.js calc "10 + 3 + 2"  # = 15 Defense
```

---

### Mind (MND)

Intelligence, knowledge, problem-solving, and mental acuity.

**Combat Uses:**
- **Tactical Analysis**: Loresmith Analyze ability
- **Hacking**: Mind check to bypass security
- **Puzzle Solving**: Decode encrypted data

**Exploration Uses:**
- **Investigation**: Search for clues, hidden details
- **Recall Information**: Remember lore, history
- **Decipher**: Read ancient texts, understand languages
- **Technology**: Operate complex devices

**Derived Stats:**
- **Inventory Capacity**: Contributes +3 slots per modifier point (primary factor)

**Modifier Calculation:**
```bash
# Calculate Mind modifier
node .claude/skills/math/math.js calc "(18 - 10) / 2"  # MND 18 = +4 mod

# Calculate inventory contribution (MND 18)
node .claude/skills/math/math.js calc "4 * 3"  # = +12 slots
```

**Why Mind = Inventory?**
- High Mind = better organization and spatial awareness
- Smart Weavers optimize packing and know exactly what they carry
- Rewards non-caster investment in Mind

---

### Spirit (SPI)

Force of will, connection to the Weave, and strength of personality.

Spirit is the most versatile attribute, affecting magic, social influence, perception, resource recovery, and crafting.

## Spirit - Complete Uses

### Combat Uses

**Magic Attacks:**
- **Attack Roll**: 1d20 + Spirit modifier
- **Magic Damage**: Base spell damage + Spirit modifier
- **Willpower Pool**: Spirit × 2 (determines max willpower)

**Short Rest Recovery:**
- **HP Recovery**: 1d8 + Spirit modifier
- **Willpower Recovery**: Spirit modifier × 2

```bash
# Magic attack (SPI 16, +3 mod)
node .claude/skills/math/math.js roll 1d20+3  # Attack roll

# Magic damage (base 12 + SPI mod)
node .claude/skills/math/math.js calc "12 + 3"  # = 15 damage

# Max willpower (SPI 16)
node .claude/skills/math/math.js calc "16 * 2"  # = 32 willpower

# Short rest willpower recovery (SPI 16, +3 mod)
node .claude/skills/math/math.js calc "3 * 2"  # = 6 willpower restored
```

### Social Uses

**Persuasion Checks:**
- **Intimidation**: 1d20 + Spirit modifier vs DC
- **Inspiration**: Rally allies, boost morale
- **Negotiation**: Stand firm, leadership
- **Conviction**: Maintain composure when bluffing

**NPC Disposition:**
- **High Spirit (16+)**: +1 base disposition with all NPCs on first meeting
- **Easier persuasion**: -2 to DC for friendly NPCs
- **Natural authority**: NPCs defer to you in groups

```bash
# Intimidate enemy (DC 15, SPI 18, +4 mod)
node .claude/skills/math/math.js roll 1d20+4  # Result: 12 + 4 = 16 (Success!)

# Negotiate merchant discount (DC 12, SPI 14, +2 mod)
node .claude/skills/math/math.js roll 1d20+2  # Result: 11 + 2 = 13 (Success!)
```

**See**: [Social Mechanics](social-mechanics.md) for full system

### Exploration Uses

**Weave Perception:**
- **Passive Detection**: Spirit score determines what you automatically notice
  - SPI 12-14: Major Weave disturbances
  - SPI 15-17: Hidden magic, illusions, invisible creatures
  - SPI 18-20: Reality alterations, Architect artifacts
  - SPI 21+: Perfect Weave sight, probability perception

- **Active Weave Sight**: 1d20 + Spirit modifier vs DC
  - DC 15: Detect invisible creatures
  - DC 14: See through illusions
  - DC 16: Identify magical traps
  - DC 18: Sense hidden portals
  - DC 20: Read Weave signatures (who created this magic)

```bash
# Detect invisible assassin (DC 15, SPI 17, +3 mod)
node .claude/skills/math/math.js roll 1d20+3  # Result: 13 + 3 = 16 (Success!)

# Identify Weave signature (DC 20, SPI 18, +4 mod)
node .claude/skills/math/math.js roll 1d20+4  # Result: 17 + 4 = 21 (Success!)
```

**Corruption Resistance:**
- **Passive Damage Reduction**: Corruption damage reduced by Spirit modifier (min 1 HP)
- **Corruption Saves**: 1d20 + Spirit modifier vs DC 15 (resist gaining stacks)
- **Spirit 18+ Immunity**: Immune to minor corruption sources

```bash
# Corruption damage (base 5 HP, SPI 16, +3 mod)
node .claude/skills/math/math.js calc "5 - 3"  # = 2 HP per round

# Corruption exposure save (DC 15, SPI 14, +2 mod)
node .claude/skills/math/math.js roll 1d20+2  # Result: 14 + 2 = 16 (Success!)
```

**See**: [Weave Perception](weave-perception.md) and [Afflictions](afflictions.md) for full systems

### Crafting Uses

**Enchanting:**
- **Basic Enchantment**: 1d20 + Spirit modifier vs DC 15
- **Advanced Enchantment**: 1d20 + Spirit modifier vs DC 18
- **Weave Essence Harvesting**: 1d20 + Spirit modifier vs DC 16

```bash
# Basic enchantment (DC 15, SPI 16, +3 mod)
node .claude/skills/math/math.js roll 1d20+3  # Result: 13 + 3 = 16 (Success!)

# Advanced enchantment (DC 18, SPI 18, +4 mod)
node .claude/skills/math/math.js roll 1d20+4  # Result: 15 + 4 = 19 (Success!)

# Harvest Weave essence (DC 16, SPI 14, +2 mod)
node .claude/skills/math/math.js roll 1d20+2  # Result: 14 + 2 = 16 (Success!)
```

**See**: [Crafting](crafting.md) for full enchanting system

### Resource Management

**Willpower Pool:**
- **Max Willpower**: Spirit × 2
- **Example**: Spirit 18 = 36 max willpower

**Recovery:**
- **Short Rest**: Spirit modifier × 2 willpower restored
- **Long Rest**: Full willpower restoration
- **Emergency Meditation**: Spirit modifier willpower restored (1/day)

```bash
# Calculate max willpower (SPI 16)
node .claude/skills/math/math.js calc "16 * 2"  # = 32 willpower

# Short rest recovery (SPI 16, +3 mod)
node .claude/skills/math/math.js calc "3 * 2"  # = 6 willpower

# Emergency meditation (SPI 16, +3 mod)
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # = 3 willpower
```

**See**: [Rest & Recovery](rest-and-recovery.md) for full system

---

## Stat Modifiers

All attributes use the same modifier formula:

```
Modifier = (Attribute - 10) / 2 (rounded down)
```

### Modifier Table

| Attribute | Modifier | Attribute | Modifier |
|-----------|----------|-----------|----------|
| 6-7 | -2 | 14-15 | +2 |
| 8-9 | -1 | 16-17 | +3 |
| 10-11 | 0 | 18-19 | +4 |
| 12-13 | +1 | 20-21 | +5 |

**Quick Calculation:**
```bash
# Calculate any modifier
node .claude/skills/math/math.js calc "(ATTRIBUTE - 10) / 2"

# Examples:
node .claude/skills/math/math.js calc "(8 - 10) / 2"   # = -1 (STR 8)
node .claude/skills/math/math.js calc "(13 - 10) / 2"  # = +1 (AGI 13)
node .claude/skills/math/math.js calc "(18 - 10) / 2"  # = +4 (MND 18)
node .claude/skills/math/math.js calc "(20 - 10) / 2"  # = +5 (SPI 20)
```

---

## Starting Attributes

### Base Stats

All characters start with **10 in each attribute**.

### Character Creation Points

You have **10 bonus points** to distribute as you wish.

**Restrictions:**
- Cannot raise any stat above 18 at creation
- Cannot lower any stat below 10 at creation
- Must spend all 10 points

### Class Bonuses (Applied After)

Class bonuses are added **after** you distribute your points:

| Class | Bonus |
|-------|-------|
| **Codebreaker** | +3 STR, +2 AGI |
| **Loresmith** | +3 MND, +2 SPI |
| **Voidwalker** | +3 AGI, +2 MND |
| **Datamancer** | +3 SPI, +2 MND |

### Example Character Creation

**Voidwalker Creation:**
```bash
# Base: STR 10, AGI 10, MND 10, SPI 10
# Distribute 10 points: +0 STR, +3 AGI, +2 MND, +5 SPI
# After points: STR 10, AGI 13, MND 12, SPI 15
# After class bonus (+3 AGI, +2 MND):
# Final: STR 10, AGI 16, MND 14, SPI 15

# Calculate modifiers:
node .claude/skills/math/math.js calc "(10 - 10) / 2"  # STR: 0
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # AGI: +3
node .claude/skills/math/math.js calc "(14 - 10) / 2"  # MND: +2
node .claude/skills/math/math.js calc "(15 - 10) / 2"  # SPI: +2
```

---

## Leveling & Stat Increases

### Stat Points from Leveling

You gain **2 stat points at even levels** (2, 4, 6, 8, 10).

**Spending Rules:**
- Can raise any attribute by 1 (costs 1 point)
- Can raise any attribute by 2 (costs 2 points)
- Cannot exceed 20 in any stat through leveling
- Stat increases are permanent

### Level Progression Example

```
Level 1: STR 10, AGI 16, MND 14, SPI 15
Level 2: Gain 2 points → STR 10, AGI 16, MND 14, SPI 17 (+2 SPI)
Level 4: Gain 2 points → STR 10, AGI 17, MND 14, SPI 18 (+1 AGI, +1 SPI)
Level 6: Gain 2 points → STR 10, AGI 17, MND 16, SPI 18 (+2 MND)
Level 8: Gain 2 points → STR 10, AGI 18, MND 17, SPI 18 (+1 AGI, +1 MND)
Level 10: Gain 2 points → STR 10, AGI 18, MND 17, SPI 20 (+2 SPI)
```

### Equipment Bonuses

Equipment can temporarily increase stats:

**Example Items:**
- **Strength Bracer**: +1 STR (while equipped)
- **Quicksilver Boots**: +2 AGI (while equipped)
- **Mindweave Circlet**: +1 MND (while equipped)
- **Spiritstone Amulet**: +1 SPI (while equipped)

**Temporary vs Permanent:**
- Equipment bonuses are temporary (removed when unequipped)
- **Can exceed 20** with equipment (e.g., 20 SPI + 1 from amulet = 21)
- Leveling/permanent increases **cannot exceed 20**

---

## Derived Stats

### Hit Points (HP)

**Formula**: Base HP (class-dependent) + additional HP per level

| Class | Starting HP | HP per Level |
|-------|-------------|--------------|
| Codebreaker | 120 | +12 |
| Loresmith | 90 | +8 |
| Voidwalker | 100 | +10 |
| Datamancer | 100 | +10 |

```bash
# Calculate max HP (Codebreaker level 5)
node .claude/skills/math/math.js calc "120 + ((5 - 1) * 12)"  # = 168 HP
```

### Defense

**Formula**: 10 + Agility modifier + armor bonus

```bash
# Calculate Defense (AGI 16, medium armor +4)
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # AGI mod = +3
node .claude/skills/math/math.js calc "10 + 3 + 4"     # = 17 Defense
```

### Willpower

**Formula**: Spirit × 2

```bash
# Calculate max willpower (SPI 18)
node .claude/skills/math/math.js calc "18 * 2"  # = 36 willpower
```

### Inventory Capacity

**Formula**: 10 + (MND_mod × 3) + (AGI_mod × 1) + class_bonus

```bash
# Calculate capacity (MND 14, AGI 16, Voidwalker)
node .claude/skills/math/math.js calc "(14 - 10) / 2"  # MND mod = +2
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # AGI mod = +3
node .claude/skills/math/math.js calc "10 + (2 * 3) + (3 * 1) + 5"  # = 24 slots
```

**See**: [Inventory](inventory.md) for full system

---

## Stat Optimization by Class

### Codebreaker

**Primary**: Strength (melee damage, grappling)
**Secondary**: Agility (Defense, initiative) or Spirit (willpower for abilities)
**Dump stat**: Mind (less utility-focused)

**Sample build**: STR 17, AGI 14, MND 10, SPI 12

### Loresmith

**Primary**: Mind (knowledge checks, inventory)
**Secondary**: Spirit (social checks, willpower)
**Tertiary**: Agility (Defense, don't get hit)
**Dump stat**: Strength (minimal combat)

**Sample build**: STR 10, AGI 12, MND 17, SPI 14

### Voidwalker

**Primary**: Agility (stealth, Defense, initiative)
**Secondary**: Mind (inventory, hacking) or Spirit (abilities)
**Dump stat**: Strength (finesse, not force)

**Sample build**: STR 10, AGI 18, MND 14, SPI 11

### Datamancer

**Primary**: Spirit (magic damage, willpower pool)
**Secondary**: Mind (knowledge, inventory)
**Tertiary**: Agility (Defense)
**Dump stat**: Strength (pure caster)

**Sample build**: STR 10, AGI 12, MND 14, SPI 17

---

## Balanced vs Specialized Builds

### Balanced (Jack of All Trades)

**Example**: STR 12, AGI 13, MND 12, SPI 13
- +1 to +2 in all modifiers
- Versatile, no weaknesses
- Less exceptional in any area

### Specialized (Min/Max)

**Example**: STR 18, AGI 14, MND 10, SPI 10
- +4 in primary stat
- Exceptional in one area
- Weak in neglected stats

**Which is better?**
- **Balanced**: More options, safer in varied encounters
- **Specialized**: Excels at class role, vulnerable outside comfort zone

---

## Stat Synergies

**Spirit + Mind** (Datamancer/Loresmith):
- High willpower + large inventory
- Enchanting + material storage
- Social + knowledge checks

**Agility + Spirit** (Voidwalker):
- High Defense + good willpower
- Stealth + Weave perception
- Initiative + social influence

**Strength + Agility** (Codebreaker):
- High damage + good Defense
- Grappling + dodging
- Breaking + climbing

---

## Design Philosophy

Attributes create **meaningful build diversity**:

- **Spirit is versatile**: Combat, social, exploration, crafting, recovery
- **Mind matters for everyone**: Inventory capacity rewards investment
- **Agility = survival**: Defense is critical
- **Strength = direct power**: Simple but effective

**Goal**: Every stat should have **multiple uses** so no attribute feels like a "dump stat."

---

## Metadata

```yaml
created: "2026-02-05"
author: "Claude"
system: "attributes-v2"
related_rules:
  - combat.md
  - social-mechanics.md
  - weave-perception.md
  - inventory.md
  - crafting.md
  - rest-and-recovery.md
```
