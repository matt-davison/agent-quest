# Item Tags Reference

Tags provide flexible categorization for items, enabling powerful filtering and discovery.

## Usage

```bash
# Find items with any of the specified tags (OR logic)
node inventory.js list --tags=healing,consumable

# Find items with ALL specified tags (AND logic)
node inventory.js list --tags-all=magic,starter

# Show all tags and their usage counts
node inventory.js tags
```

---

## Standard Tags

### Category Tags

These describe the item's primary purpose or audience.

| Tag | Description | Example Items |
|-----|-------------|---------------|
| `starter` | Available to new players, tier 1 | Iron Sword, Healing Potion, Student Robes |
| `combat` | Used in combat situations | Weapons, armor, damage consumables |
| `utility` | Provides non-combat benefits | Pattern Lens, Memory Crystal, Textbook |
| `magic` | Involves magical/arcane properties | Scrolls, crystals, magical items |
| `tech` | Technology/cyberpunk themed | Data Spike, Debug Potion |
| `quest` | Tied to a specific quest | Architect's Fragment |

### Effect Tags

These describe what the item does when used.

| Tag | Description | Example Items |
|-----|-------------|---------------|
| `healing` | Restores HP | Healing Potion, Greater Healing Potion |
| `restoration` | Restores Spirit/mana | Mana Crystal |
| `buff` | Temporarily enhances stats | Weave Amplifier |
| `debuff` | Reduces enemy stats | (future items) |
| `detection` | Reveals hidden things | Pattern Lens |
| `protection` | Prevents negative effects | Reality Anchor |

### Combat Role Tags

These describe how items are used in battle.

| Tag | Description | Example Items |
|-----|-------------|---------------|
| `melee` | Close-range weapons | Iron Sword, Steel Sword |
| `ranged` | Long-range weapons | Data Spike |
| `armor` | Provides protection | Leather Armor, Chain Mail, Student Robes |
| `consumable` | Single-use items | Potions, scrolls |

### Theme Tags

These describe the item's aesthetic or lore connection.

| Tag | Description | Example Items |
|-----|-------------|---------------|
| `weave` | Connected to the Weave | Memory Crystal, Scrolls, Pattern Lens |
| `legendary` | Legendary rarity items | Architect's Fragment |

---

## Future Tags (Reserved)

These tags are reserved for future item types:

### Elemental
- `fire`, `ice`, `lightning`, `shadow`, `void`

### Faction
- `athenaeum`, `chromedome`, `nexus`

### Special Properties
- `cursed`, `blessed`, `sentient`, `bound`

---

## Adding New Tags

When creating items, follow these guidelines:

1. **Use existing tags** when they fit
2. **Keep tags lowercase** with no spaces
3. **Prefer specific over general** - `healing` over `helpful`
4. **Limit to 3-5 tags** per item
5. **Document new tags** in this file if they'll be reused

### Tag Naming Conventions

- Use singular form: `armor` not `armors`
- Use descriptive verbs for effects: `healing`, `detection`
- Use nouns for categories: `combat`, `quest`
