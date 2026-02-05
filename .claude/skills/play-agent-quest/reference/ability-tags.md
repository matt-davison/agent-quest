# Ability Tags Reference

Tags provide flexible categorization for abilities, enabling powerful filtering and discovery.

## Usage

```bash
# Find abilities with any of the specified tags (OR logic)
node abilities.js --world=alpha list --tags=combat,damage

# Find abilities with ALL specified tags (AND logic)
node abilities.js --world=alpha list --tags-all=combat,utility

# Show all tags and their usage counts
node abilities.js --world=alpha tags
```

---

## Standard Tags

### Combat Role Tags

These describe how abilities function in battle.

| Tag | Description | Example Abilities |
|-----|-------------|-------------------|
| `combat` | Used primarily in combat | Backstab, Shatter, Flame Strike |
| `damage` | Deals direct damage | Backstab, Flame Strike, Shadow Claw |
| `defensive` | Provides protection | Iron Skin, Smoke Screen |
| `buff` | Enhances player stats | Iron Skin |
| `debuff` | Reduces enemy stats | Expose Weakness |
| `control` | Restricts enemy movement/actions | Gravity Well |
| `tank` | Designed for absorbing damage | Iron Skin |
| `aoe` | Affects multiple targets | Flame Strike, Gravity Well |

### Utility Tags

These describe non-combat uses.

| Tag | Description | Example Abilities |
|-----|-------------|-------------------|
| `utility` | General-purpose usefulness | Phase, Reality Patch, Recall |
| `movement` | Enables special movement | Phase, Shadow Step |
| `environmental` | Affects the environment | Reality Patch, Smoke Screen |
| `detection` | Reveals hidden information | Recall |
| `creation` | Creates objects or effects | Manifest |
| `knowledge` | Information gathering | Recall, Basic Weave Theory |
| `social` | Affects NPC interactions | Silver Tongue |
| `persuasion` | Improves persuasion checks | Silver Tongue |

### Combat Mechanic Tags

These describe specific combat interactions.

| Tag | Description | Example Abilities |
|-----|-------------|-------------------|
| `combo` | Part of the combo system | Expose Weakness |
| `tactical` | Enables tactical positioning | Expose Weakness |
| `counter` | Counters enemy abilities | Dispel |
| `stealth` | Requires or grants stealth | Backstab |
| `positioning` | Moves enemies or self | Gravity Well |
| `drain` | Steals HP or resources | Void Hunger |

### Class Tags

These indicate class-specific abilities.

| Tag | Description | Example Abilities |
|-----|-------------|-------------------|
| `voidwalker` | Voidwalker class ability | Phase, Backstab |
| `codebreaker` | Codebreaker class ability | Shatter, Momentum |
| `loresmith` | Loresmith class ability | Silver Tongue, Recall |
| `datamancer` | Datamancer class ability | Manifest, Reality Patch, Weave Attunement |
| `passive` | Always-active abilities | Momentum, Silver Tongue, Weave Attunement |

### Theme Tags

These describe the ability's aesthetic or lore connection.

| Tag | Description | Example Abilities |
|-----|-------------|-------------------|
| `weave` | Connected to the Weave | Manifest, Reality Patch, Basic Weave Theory |
| `void` | Void/shadow themed | Phase |
| `shadow` | Shadow magic | Shadow Claw, Shadow Step |
| `fire` | Fire elemental | Flame Strike |
| `magic` | General magical | Dispel |
| `tokes` | Costs or grants Tokes | Weave Attunement |

### Weapon Tags

These describe weapon-related abilities.

| Tag | Description | Example Abilities |
|-----|-------------|-------------------|
| `weapons` | Affects weapon use | Basic Weapon Expertise |
| `melee` | Close-range combat | Shadow Claw |
| `destruction` | Destroys objects/barriers | Shatter |

### Enemy Tags

These identify abilities used by enemies.

| Tag | Description | Example Abilities |
|-----|-------------|-------------------|
| `enemy` | Used by enemy NPCs | Shadow Claw, Shadow Step, Void Hunger |
| `shadow-stalker` | Shadow Stalker enemy | Shadow Claw, Shadow Step, Void Hunger |

---

## Future Tags (Reserved)

These tags are reserved for future ability types:

### Elemental
- `ice`, `lightning`, `earth`, `wind`, `arcane`

### Advanced Combat
- `channel`, `concentration`, `ritual`, `interrupt`

### Faction
- `athenaeum`, `chromedome`, `nexus`

### Special Properties
- `cursed`, `blessed`, `legendary`, `ultimate`

---

## Adding New Tags

When creating abilities, follow these guidelines:

1. **Use existing tags** when they fit
2. **Keep tags lowercase** with no spaces
3. **Prefer specific over general** - `damage` over `offensive`
4. **Limit to 4-6 tags** per ability
5. **Document new tags** in this file if they'll be reused
6. **Always include class tag** for class-specific abilities

### Tag Naming Conventions

- Use singular form: `buff` not `buffs`
- Use descriptive verbs for effects: `damage`, `healing`
- Use nouns for categories: `combat`, `utility`
- Use adjectives for themes: `void`, `shadow`, `fire`

### Required Tags by Type

| Ability Type | Required Tags |
|--------------|---------------|
| Class ability | `<class-name>` (e.g., `voidwalker`) |
| Combat ability | `combat` |
| Passive ability | `passive` |
| Enemy ability | `enemy`, `<enemy-type>` |
