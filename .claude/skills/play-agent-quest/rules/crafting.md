# Crafting & Enchanting

> _"The Architects shaped reality. We merely refine it. But sometimes, refinement is revolution."_ — Master Enchanter Vex

**All calculations must use the [math skill](../../math/)** for enchanting checks and material costs.

---

## Overview

Crafting allows Weavers to enhance and modify items using Spirit. The primary crafting system is **enchanting**, which adds magical properties to weapons, armor, and accessories.

Spirit determines your success rate and the quality of enchantments you can create.

---

## Enchanting System

Enchanting uses Spirit checks to imbue items with magical power. There are two tiers: **Basic Enchantment** and **Advanced Enchantment**.

### Requirements

**To enchant items you need:**
- Sufficient Spirit score (no minimum, but higher is better)
- Required materials (purchased or found)
- Time (1-4 hours depending on enchantment tier)
- Workshop or safe location (Nexus Station, owned home, city workshop)

---

## Basic Enchantment

Simple magical enhancements that provide temporary bonuses.

### Basic Enchantment Rules

**Cost**: 50 gold + enchanting dust
**Check**: 1d20 + Spirit modifier vs DC 15
**Time**: 1 hour of work
**Duration**: 10 uses, then enchantment fades

```bash
# Calculate Spirit modifier
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # SPI 16 = +3 mod

# Make enchanting check
node .claude/skills/math/math.js roll 1d20+3  # Result: 13 + 3 = 16 (Success!)
```

### Basic Enchantment Effects

**Success grants ONE of:**
- **+1 Damage** (weapons): All attacks deal +1 damage
- **+1 Defense** (armor): Increase armor Defense bonus by +1
- **+1 to Checks** (accessories): +1 to one stat's checks (specify: STR, AGI, MND, or SPI)

**Duration**: 10 uses
- Weapons: 10 successful attacks
- Armor: 10 combats
- Accessories: 10 relevant checks

### Basic Enchantment Outcomes

**Success (Roll ≥ DC 15)**:
- Enchantment applied successfully
- Item gains bonus for 10 uses
- Materials consumed

**Failure (Roll < DC 15)**:
- Enchantment fails
- Materials consumed (gold and dust lost)
- Item undamaged, can retry with new materials

**Critical Success (Natural 20)**:
- Enchantment applied successfully
- Duration extended to 15 uses
- Bonus increased by +1 (e.g., +2 damage instead of +1)

**Critical Failure (Natural 1)**:
- Enchantment fails catastrophically
- Materials consumed
- Item takes -1 to its base effect until repaired (50g repair cost)

### Basic Enchantment Examples

```bash
# Enchant Hex Breaker with +1 damage (SPI 14, +2 mod)
node .claude/skills/math/math.js roll 1d20+2  # Result: 14 + 2 = 16 (Success!)
# Hex Breaker: 15 damage → 16 damage (10 uses)

# Enchant Scrap Plating with +1 Defense (SPI 12, +1 mod)
node .claude/skills/math/math.js roll 1d20+1  # Result: 13 + 1 = 14 (Failure)
# Enchantment fails, materials lost, armor undamaged

# Enchant Tome of Echoes with +1 Mind checks (SPI 18, +4 mod)
node .claude/skills/math/math.js roll 1d20+4  # Result: 20! (Critical Success!)
# Tome: +1 Mind checks → +2 Mind checks (15 uses)
```

---

## Advanced Enchantment

Powerful, permanent magical modifications that fundamentally alter items.

### Advanced Enchantment Rules

**Cost**: 200 gold + rare materials
**Check**: 1d20 + Spirit modifier vs DC 18
**Time**: 4 hours of work
**Duration**: Permanent

```bash
# Calculate Spirit modifier
node .claude/skills/math/math.js calc "(18 - 10) / 2"  # SPI 18 = +4 mod

# Make advanced enchanting check
node .claude/skills/math/math.js roll 1d20+4  # Result: 15 + 4 = 19 (Success!)
```

### Advanced Enchantment Properties

**Success grants ONE of:**

**Weapons:**
- **Elemental Damage**: +1d4 fire/cold/lightning damage on hit
- **Lifesteal**: Heal 2 HP per successful attack
- **Vorpal**: Critical hits deal +1d8 additional damage
- **Phase Strike**: Ignore 3 points of enemy armor

**Armor:**
- **Elemental Resistance**: Resist 50% of one damage type (fire/cold/lightning/corruption)
- **Regeneration**: Recover 2 HP at start of each turn (in combat)
- **Phase Armor**: Once per combat, negate one attack completely
- **Weave Ward**: +2 Defense vs magic attacks, +1 vs physical

**Accessories:**
- **Weave-sight**: Permanent detect magic (passive Weave perception +1)
- **Willpower Battery**: +5 max willpower
- **Attribute Boost**: +1 to one attribute (STR, AGI, MND, or SPI)
- **Quick Casting**: Abilities cost -1 willpower (minimum 1)

### Advanced Enchantment Outcomes

**Success (Roll ≥ DC 18)**:
- Enchantment applied permanently
- Materials consumed
- Item permanently enhanced

**Failure (Roll < DC 18)**:
- Enchantment fails
- Materials consumed (200g + rare materials lost)
- Item undamaged, can retry with new materials

**Critical Success (Natural 20)**:
- Enchantment applied perfectly
- Bonus effect doubled or enhanced:
  - Elemental damage: +2d4 instead of +1d4
  - Lifesteal: 4 HP instead of 2
  - Attribute boost: +2 instead of +1

**Critical Failure (Natural 1)**:
- Enchantment backfires
- Materials consumed
- Item **destroyed** (cannot be repaired)
- No salvage possible

### Advanced Enchantment Examples

```bash
# Enchant Null Blade with Lifesteal (SPI 17, +3 mod)
node .claude/skills/math/math.js roll 1d20+3  # Result: 16 + 3 = 19 (Success!)
# Null Blade gains: Heal 2 HP per successful attack (permanent)

# Enchant Data Robes with Regeneration (SPI 15, +2 mod)
node .claude/skills/math/math.js roll 1d20+2  # Result: 15 + 2 = 17 (Failure)
# Enchantment fails, 200g + rare materials lost, robes undamaged

# Enchant Weave Focus with Willpower Battery (SPI 20, +5 mod)
node .claude/skills/math/math.js roll 1d20+5  # Result: 20! (Critical Success!)
# Weave Focus gains: +10 max willpower (doubled from +5, permanent!)
```

---

## Material Sourcing

### Enchanting Dust

**Cost**: 25 gold per unit
**Source**: Magic shops (Syntax Athenaeum, Lumina City Arcane District)
**Usage**: Required for all basic enchantments

### Rare Materials

**Cost**: 100-200 gold per unit (when available)
**Sources**:
- **Boss drops**: Defeat named enemies, dungeon bosses
- **Quest rewards**: Major quest completion
- **High-tier vendors**: Syntax Athenaeum (limited stock)
- **Treasure chests**: Legendary loot rolls
- **World events**: Special encounters, story beats

**Types of Rare Materials**:
- **Crystallized Weave**: Pure magic essence (elemental enchantments)
- **Void Shard**: Fragment of the Void (phase/lifesteal enchantments)
- **Architect Fragment**: Ancient technology (attribute boosts)
- **Temporal Dust**: Time-touched material (quick casting)

### Weave Essence (Advanced)

**Cost**: Free (must harvest)
**Source**: Corrupted zones
**Check**: 1d20 + Spirit modifier vs DC 16
**Time**: 10 minutes of concentration

```bash
# Harvest Weave essence from Corrupted Rustlands (SPI 16, +3 mod)
node .claude/skills/math/math.js roll 1d20+3  # Result: 14 + 3 = 17 (Success!)
# Harvested 1 unit of Weave Essence (can substitute for rare material)
```

**Success**: Harvest 1 Weave Essence
**Failure**: No essence harvested, take 1d6 corruption damage
**Critical Failure**: Take 2d6 corruption damage, gain 1 corruption stack

**Risk**: Harvesting essence exposes you to corruption
- Make corruption save (DC 15) after harvesting
- Failure: Gain 1 corruption stack

---

## Enchantment Limits

### Per-Item Limits

- **Each item can have ONE enchantment**:
  - Either 1 basic enchantment (temporary)
  - OR 1 advanced enchantment (permanent)
  - Cannot stack both

- **When temporary expires, can re-enchant**:
  - Basic enchantment wears off after 10 uses
  - Can apply new basic enchantment
  - Can upgrade to advanced enchantment

### Item Restrictions

**Cannot be enchanted:**
- **Legendary items**: Already at maximum power
- **Quest items**: Protected by quest mechanics
- **Consumables**: One-time use items (potions, scrolls)
- **Broken items**: Must repair first

**Can be enchanted:**
- Common, Uncommon, Rare items
- Player-crafted items
- Merchant-purchased items
- Loot drops

---

## Workshop Locations

### Public Workshops

| Location | Access | Cost | Bonus |
|----------|--------|------|-------|
| **Nexus Station Workshop** | Always available | Free | None |
| **Syntax Athenaeum Forge** | Must have library access | 10g/use | +1 to enchanting checks |
| **Lumina City Arcane District** | Public | 15g/use | +2 to advanced enchantments |
| **Owned Home (upgraded)** | Must own property + workshop upgrade | Free | +1 to all enchanting |

### Workshop Benefits

**Syntax Athenaeum Forge**:
- +1 to all enchanting checks
- Access to rare materials vendor
- Can consult enchanting grimoires (+2 to first attempt per day)

**Lumina City Arcane District**:
- +2 to advanced enchanting checks specifically
- Master enchanters available for consultation (50g, guarantee success on DC 18 or lower)

**Owned Home Workshop**:
- +1 to all enchanting checks
- No usage fee
- Can enchant at any time (no waiting for access)
- Storage for materials (organized inventory)

---

## Enchanting as a Profession

### Selling Enchanted Items

- **Basic enchanted items**: Sell for 2× base item cost + materials
- **Advanced enchanted items**: Sell for 3× base item cost + materials
- **Commission work**: Other players can pay you to enchant their items

**Example**:
```bash
# Basic enchanted Longsword (10 damage, base cost 30g)
# Selling price: (30g × 2) + 25g = 85g

# Advanced enchanted Longsword with Elemental Damage
# Selling price: (30g × 3) + 200g = 290g
```

### Reputation as Enchanter

- **5 successful enchantments**: Apprentice Enchanter (NPCs recognize you)
- **15 successful enchantments**: Journeyman Enchanter (+1 to enchanting checks)
- **30 successful enchantments**: Master Enchanter (+2 to enchanting checks, can take apprentices)

---

## Disenchanting

**Reverse an enchantment** to recover materials.

**Cost**: Free
**Check**: 1d20 + Spirit modifier vs DC 12
**Time**: 30 minutes

**Success**:
- Enchantment removed
- Recover 50% of materials (round down)
- Item returns to base state

**Failure**:
- Enchantment remains
- No materials recovered
- Can retry

**Critical Failure**:
- Enchantment removed
- Item damaged (-1 to base effect, requires 25g repair)
- No materials recovered

---

## Class Benefits for Enchanting

### Datamancer - Natural Enchanters

- **Weave Attunement**: +2 to all enchanting checks
- **Compile ability**: Can create temporary items to enchant (practice without risk)
- **Reality Patch**: Can modify enchantments (re-roll failed check, 1/day)

### Loresmith - Knowledge of Enchanting

- **Tome of Echoes**: Store one successful enchantment pattern (replicate without check)
- **Research**: +1 to enchanting checks for items you've studied (Read ability)

### Voidwalker - Void Enchantments

- **Phase affinity**: +2 to enchant items with phase/void properties
- **Void Sight**: Automatically detect enchantment quality (know before using)

### Codebreaker - Brute Force Enchanting

- **Shatter**: Can forcibly remove enchantments (no check, but item takes 1d6 damage)
- **Momentum**: Consecutive successful enchantments grant +1 per success (max +3)

---

## Design Philosophy

Enchanting makes **Spirit valuable for item customization**:

- **Gold sink**: Keeps economy balanced
- **Risk vs reward**: Critical failures on advanced enchantments are brutal
- **Player expression**: Customize gear to playstyle
- **Profession system**: Path to becoming Master Enchanter

**Goal**: Enchanting should feel **powerful but risky**, encouraging careful planning and resource management.

---

## Quick Reference

### Basic Enchantment
- **Cost**: 50g + enchanting dust
- **DC**: 15
- **Duration**: 10 uses
- **Effect**: +1 to damage/defense/checks

### Advanced Enchantment
- **Cost**: 200g + rare materials
- **DC**: 18
- **Duration**: Permanent
- **Effect**: Special property (elemental, lifesteal, resist, etc.)

### Material Costs
- **Enchanting Dust**: 25g
- **Rare Materials**: 100-200g (or harvested)
- **Workshop Use**: 0-15g depending on location

---

## Metadata

```yaml
created: "2026-02-05"
author: "Claude"
system: "crafting-enchanting-v1"
related_rules:
  - attributes-and-stats.md
  - economy.md
  - housing.md
```
