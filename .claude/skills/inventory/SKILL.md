---
name: inventory
description: Manage persona inventories and look up items from the item database. Use for adding/removing items, checking what items exist, and resolving item IDs to full details.
---

# Inventory System

Manage items and inventories in Agent Quest. Items are stored in a shared database and referenced by ID in persona inventories.

## ⚠️ Strict Enforcement: Database Items Only

**ALWAYS use items from the database. NEVER invent ad-hoc item IDs.**

The inventory system validates all item references. Items not in the database will trigger warnings and fail validation.

### Bad (Don't Do This)

```yaml
# ❌ Made-up item ID - will fail validation
inventory:
  - id: magic-sword
    qty: 1
  - id: healing-thing
    qty: 3
```

### Good (Do This)

```yaml
# ✅ Valid database IDs
inventory:
  - id: vhpznnko    # Steel Sword
    qty: 1
  - id: 0nv58nul    # Healing Potion
    qty: 3
```

### Before Adding Items

1. **Search first:** `node inventory.js search "sword"`
2. **Check similar:** `node inventory.js similar "Magic Blade"`
3. **If no match exists:** Create a new item file with `node math.js id` for the ID

## Item Database

Items are stored as individual YAML files in `world/items/database/{id}.yaml`.

### Item Schema

```yaml
id: abc12345          # 8-char random ID
name: "Iron Sword"    # Display name
type: weapon          # weapon, armor, consumable, quest_item, misc
subtype: melee        # Optional: melee, ranged, light, medium, heavy
rarity: common        # common, uncommon, rare, legendary
tier: 1               # Level requirement (1-10)
value: 50             # Gold value (0 for quest items)
sellable: true        # Optional, defaults to true
tags:                 # Flexible categorization
  - combat
  - starter
  - melee
stats:                # Type-specific stats
  damage: 10
  armor: 3
  hp_restore: 30
special: "+2 Mind"    # Optional special effects
description: "..."    # Flavor text
quest: quest-id       # Optional: linked quest for quest items
```

### Tags

Tags enable flexible filtering. See `reference/tags.md` for the full list.

Common tags:
- **Category:** `starter`, `combat`, `utility`, `magic`, `tech`, `quest`
- **Effect:** `healing`, `restoration`, `buff`, `debuff`, `detection`, `protection`
- **Theme:** `weave`, `fire`, `ice`, `shadow`

## Inventory Format

Persona inventories are lists of item references:

```yaml
inventory:
  - id: abc12345      # Item ID
    qty: 1            # Quantity (default: 1)
  - id: def67890
    qty: 3
    state: chipped    # Optional: item condition/state
```

### Item States

Items can have states to track condition or modifications:

- **Weapons:** pristine, used, chipped, broken, enchanted
- **Armor:** pristine, dented, cracked, broken, reinforced
- **Consumables:** fresh, stale, expired
- **General:** cursed, blessed, attuned

## CLI Commands

### Basic Operations

```bash
# Get item details by ID
node inventory.js get abc12345

# Search items by name, description, or tags
node inventory.js search "healing"

# Check for similar items before creating new ones
node inventory.js similar "Iron Blade"

# Show all available tags
node inventory.js tags
```

### Listing with Filters

```bash
# List all items
node inventory.js list

# Filter by type
node inventory.js list --type=weapon
node inventory.js list --type=consumable

# Filter by rarity
node inventory.js list --rarity=rare
node inventory.js list --rarity=legendary

# Filter by tier (items at or below specified tier)
node inventory.js list --tier=3

# Filter by tags (OR logic - any tag matches)
node inventory.js list --tags=healing,consumable

# Filter by tags (AND logic - all tags must match)
node inventory.js list --tags-all=magic,starter

# Combine filters
node inventory.js list --type=weapon --rarity=uncommon
node inventory.js list --tags=weave --tier=5
```

### Inventory Operations

```bash
# Resolve inventory IDs to full item data
node inventory.js resolve '[{id: abc12345, qty: 2}]'

# Display inventory in readable format
node inventory.js display '[{id: abc12345, qty: 2, state: chipped}]'

# Validate inventory items exist in database
node inventory.js validate '[{id: abc12345}, {id: fake-item}]'
```

## Workflows

### Adding Items to Inventory

1. Search for existing item: `inventory.js similar "item name"`
2. If exists, use that ID. If not, generate new ID: `math.js id`
3. Create item file in `world/items/database/{id}.yaml`
4. Add to persona's inventory list

### Giving Items to Players

```yaml
# Before
inventory:
  - id: abc12345
    qty: 1

# After receiving 2 healing potions (id: 0nv58nul)
inventory:
  - id: abc12345
    qty: 1
  - id: 0nv58nul
    qty: 2
```

### Item State Changes

When an item is damaged or modified:

```yaml
# Sword becomes chipped after heavy combat
inventory:
  - id: y6fz9ek2
    qty: 1
    state: chipped
```

---

## Existing Items

Run `node inventory.js list` to see all items in the database.

### Quick Reference

| ID | Name | Type | Tier | Tags |
|----|------|------|------|------|
| y6fz9ek2 | Iron Sword | weapon/melee | 1 | combat, starter, melee |
| vhpznnko | Steel Sword | weapon/melee | 2 | combat, melee |
| a7rfjes7 | Data Spike | weapon/ranged | 1 | combat, ranged, tech, weave |
| 6s10vlhv | Leather Armor | armor/light | 1 | armor, starter, combat |
| kittc6zx | Chain Mail | armor/medium | 2 | armor, combat |
| 41mkxjwo | Student Robes | armor/light | 1 | armor, starter, magic |
| 0nv58nul | Healing Potion | consumable | 1 | healing, consumable, starter |
| uvwbi8q3 | Greater Healing Potion | consumable | 2 | healing, consumable |
| lj4dpk5w | Mana Crystal | consumable | 2 | restoration, magic, consumable |
| w4kv0kd5 | Debug Potion | consumable | 2 | healing, tech, consumable |
| 6giny4t3 | Scroll of Minor Syntax | consumable | 1 | magic, weave, consumable, starter |
| se8pk6td | Scroll of Greater Syntax | consumable | 3 | magic, weave, consumable |
| 2gsjetvy | Weave Amplifier | consumable | 5 | buff, magic, weave, consumable |
| 1k5vtuvl | Architect's Fragment (1/3) | quest_item | 1 | quest, legendary, weave |
| 0j2sntea | Memory Crystal | misc | 1 | magic, utility, weave |
| b85w4dyo | Pattern Lens | misc | 3 | detection, utility, weave |
| 160n7ppo | Reality Anchor | misc | 5 | protection, magic, weave |
| yna34yv7 | Textbook: Reality 101 | misc | 1 | utility, starter, weave |

---

_"Every item has a story. Every inventory tells of a journey."_
