# Inventory & Carrying Capacity

> **Quick-ref:** Use `/inventory` to manage items and check capacity

> _"Every Weaver learns: it's not about what you carry. It's about what you're willing to leave behind."_ — Void Merchant saying

**All calculations must use the [math skill](../../math/)** for capacity calculations and checks.

---

## Overview

Your inventory represents what you're actively carrying on your person. Agent Quest uses a **slot-based system** where each unique item occupies one inventory slot, regardless of quantity.

---

## Inventory Capacity Formula

Your carrying capacity is determined by your physical and mental attributes:

```
Capacity = 10 + (MND_modifier × 3) + (AGI_modifier × 1) + class_bonus
```

**Where:**
- **Base**: 10 slots (everyone starts here)
- **Mind modifier**: `(MND - 10) / 2` × 3 slots
- **Agility modifier**: `(AGI - 10) / 2` × 1 slot
- **Class bonus**: Voidwalker +5, all others +0

### Calculating Your Capacity

```bash
# Step 1: Calculate Mind modifier
node .claude/skills/math/math.js calc "(13 - 10) / 2"  # MND 13 = +1 mod

# Step 2: Calculate Agility modifier
node .claude/skills/math/math.js calc "(12 - 10) / 2"  # AGI 12 = +1 mod

# Step 3: Calculate total capacity
# Formula: 10 + (MND_mod × 3) + (AGI_mod × 1) + class_bonus
node .claude/skills/math/math.js calc "10 + (1 * 3) + (1 * 1) + 0"  # = 14 slots
```

### Capacity Examples by Class

**Voidwalker** (MND 12, AGI 13):
```bash
node .claude/skills/math/math.js calc "(12 - 10) / 2"  # MND mod = +1
node .claude/skills/math/math.js calc "(13 - 10) / 2"  # AGI mod = +1
node .claude/skills/math/math.js calc "10 + (1 * 3) + (1 * 1) + 5"  # = 19 slots
```

**Loresmith** (MND 13, AGI 10):
```bash
node .claude/skills/math/math.js calc "(13 - 10) / 2"  # MND mod = +1
node .claude/skills/math/math.js calc "(10 - 10) / 2"  # AGI mod = 0
node .claude/skills/math/math.js calc "10 + (1 * 3) + (0 * 1) + 0"  # = 13 slots
```

**Datamancer** (MND 12, AGI 10):
```bash
node .claude/skills/math/math.js calc "(12 - 10) / 2"  # MND mod = +1
node .claude/skills/math/math.js calc "(10 - 10) / 2"  # AGI mod = 0
node .claude/skills/math/math.js calc "10 + (1 * 3) + (0 * 1) + 0"  # = 13 slots
```

**Codebreaker** (MND 10, AGI 12):
```bash
node .claude/skills/math/math.js calc "(10 - 10) / 2"  # MND mod = 0
node .claude/skills/math/math.js calc "(12 - 10) / 2"  # AGI mod = +1
node .claude/skills/math/math.js calc "10 + (0 * 3) + (1 * 1) + 0"  # = 11 slots
```

---

## Slot-Based System

### How Slots Work

- **Each unique item = 1 slot**
- **Quantity stacking doesn't increase slot usage**
- Example: 10 healing potions = 1 slot, not 10 slots

### What Counts Against Capacity

**Inventory Items:**
- Consumables (potions, scrolls, grenades)
- Materials (enchanting dust, crafting components)
- Quest items (stored separately, see below)
- Miscellaneous items (keys, notes, trinkets)

**What DOESN'T Count:**
- **Equipped items** (weapon, armor, accessory)
- **Quest items** (auto-stored in virtual quest pouch)
- **Gold** (abstract currency, weightless)

### Example Inventory

```yaml
inventory:
  - healing_potion: 5        # 1 slot
  - smoke_bomb: 3            # 1 slot
  - lockpick_set: 1          # 1 slot
  - enchanting_dust: 2       # 1 slot
  - corrupted_data_chip: 1   # 1 slot
# Total: 5 slots used
```

---

## Equipped vs Carried

### Equipment Slots

You have three equipment slots that don't count against your inventory capacity:

- **Weapon slot**: One weapon (melee or ranged)
- **Armor slot**: One armor piece
- **Accessory slot**: One accessory (tome, focus, cloak, etc.)

### Equipping Items

```yaml
equipped:
  weapon: "hex_breaker"      # Not counted in capacity
  armor: "scrap_plating"     # Not counted in capacity
  accessory: "tome_of_echoes" # Not counted in capacity
```

### Swapping Equipment

- **In combat**: Swapping is a Minor Action
- **Out of combat**: Instant, no action cost
- **Unequipped items go to inventory** and count against capacity

---

## Quest Items

Quest items are automatically stored in a **virtual quest pouch** that bypasses your normal carrying capacity.

### What Counts as a Quest Item

- Items explicitly marked as "quest item" in their description
- Items received as objectives for active quests
- Items needed to progress story or unlock areas
- Campaign-specific artifacts

### Quest Item Rules

- **Unlimited storage**: No capacity limit
- **Cannot be dropped, sold, or traded** (until quest completes)
- **Automatically transferred** when quest completes:
  - If item has value: moves to regular inventory (uses 1 slot)
  - If item is consumable: removed from game
  - If item is legendary: added to equipped or inventory

---

## When Your Inventory is Full

### Pickup Blocking

When at capacity, you **cannot pick up new items** until you make room.

**Options:**
1. **Drop an item** (free action, item left at current location)
2. **Use a consumable** (frees 1 slot if quantity reaches 0)
3. **Store items at home** (if you own property, see [Housing](housing.md))
4. **Sell items** (at merchants, instant capacity relief)
5. **Increase capacity** (level up Mind/Agility)

### Transfer Mechanics

**Dropping Items:**
- Dropped items remain at location for 24 hours (real time)
- After 24 hours, items despawn
- Other players can pick up dropped items (multiplayer)

**Storage:**
- Homes provide permanent storage (see [Housing](housing.md))
- Storage slots are separate from inventory capacity
- No decay or time limit on stored items

---

## Increasing Capacity

### Permanent Increases

**Level Up Stats:**
- **+2 Mind**: Gain +3 inventory slots
- **+2 Agility**: Gain +1 inventory slot

```bash
# Example: Increase MND from 12 to 14
# Old capacity: 10 + (1 × 3) + (1 × 1) + 0 = 14 slots
# New MND mod: (14-10)/2 = +2
# New capacity: 10 + (2 × 3) + (1 × 1) + 0 = 17 slots (+3)
node .claude/skills/math/math.js calc "10 + (2 * 3) + (1 * 1) + 0"
```

**Class Bonus:**
- Voidwalkers start with +5 inventory slots (built-in, permanent)

### Temporary Capacity

**Enchanted Bags** (not yet implemented):
- May be added in future updates
- Would provide temporary +5-10 slots
- Would require attunement and cost gold

---

## Inventory Management Commands

Use the `/inventory` skill to manage your items:

```bash
# View inventory with capacity
/inventory

# Example output:
# Inventory (7/13 slots, 6 available)
# - healing_potion x5
# - smoke_bomb x3
# - lockpick_set x1
# - enchanting_dust x2
# - corrupted_data_chip x1
```

---

## Design Philosophy

The slot-based system encourages **meaningful choices** without micromanagement:

- **Mind matters for non-casters**: Higher Mind = more utility items
- **Voidwalkers get their promised bonus**: Finally implemented!
- **Stacking prevents tedium**: Don't count individual potions
- **Equipped items are free**: Focus capacity on consumables and materials

**Goal**: You should think about *what* to carry, not suffer arbitrary weight limits.

---

## Metadata

```yaml
created: "2026-02-05"
author: "Claude"
system: "inventory-capacity-v1"
```
