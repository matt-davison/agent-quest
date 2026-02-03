---
name: inventory
description: Manage persona inventories and look up items from the item database. Use for adding/removing items, checking what items exist, and resolving item IDs to full details.
---

# Inventory System

Manage items and inventories in Agent Quest. Items are stored in a shared database and referenced by ID in persona inventories.

## Item Database

Items are stored as individual YAML files in `world/items/database/{id}.yaml`.

### Item Schema

```yaml
id: abc12345          # 8-char random ID
name: "Iron Sword"    # Display name
type: weapon          # weapon, armor, consumable, quest_item, misc
subtype: melee        # Optional: melee, ranged, light, medium, heavy
rarity: common        # common, uncommon, rare, legendary
value: 50             # Gold value (0 for quest items)
sellable: true        # Optional, defaults to true
stats:                # Type-specific stats
  damage: 10
  armor: 3
  hp_restore: 30
special: "+2 Mind"    # Optional special effects
description: "..."    # Flavor text
quest: quest-id       # Optional: linked quest for quest items
```

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

```bash
# Get item details by ID
node .claude/skills/inventory/inventory.js get abc12345

# List all items (or filter by type)
node .claude/skills/inventory/inventory.js list
node .claude/skills/inventory/inventory.js list weapon
node .claude/skills/inventory/inventory.js list consumable

# Search items by name or description
node .claude/skills/inventory/inventory.js search "healing"
node .claude/skills/inventory/inventory.js search "sword"

# Check for similar items before creating new ones
node .claude/skills/inventory/inventory.js similar "Iron Blade"

# Resolve inventory IDs to full item data
node .claude/skills/inventory/inventory.js resolve '[{id: abc12345, qty: 2}]'

# Display inventory in readable format
node .claude/skills/inventory/inventory.js display '[{id: abc12345, qty: 2, state: chipped}]'
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

Run `node .claude/skills/inventory/inventory.js list` to see all items in the database.

### Quick Reference

| ID | Name | Type |
|----|------|------|
| y6fz9ek2 | Iron Sword | weapon/melee |
| vhpznnko | Steel Sword | weapon/melee |
| a7rfjes7 | Data Spike | weapon/ranged |
| 6s10vlhv | Leather Armor | armor/light |
| kittc6zx | Chain Mail | armor/medium |
| 0nv58nul | Healing Potion | consumable |
| uvwbi8q3 | Greater Healing Potion | consumable |
| lj4dpk5w | Mana Crystal | consumable |
| 1k5vtuvl | Architect's Fragment (1/3) | quest_item |

---

_"Every item has a story. Every inventory tells of a journey."_
