# Character Classes - Alpha World

*Cyberpunk-Fantasy Setting*

Each class in Alpha offers a distinct playstyle with unique abilities, passives, and progression paths tailored to the neon-lit, code-infused world.

**All calculations must use the [math skill](../../.claude/skills/math/)**—especially for damage and HP.

## Quick Reference

| Class | Combat | Exploration | Social | Weaving | Durability |
|-------|--------|-------------|--------|---------|------------|
| **Codebreaker** | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ | ★★★★★ |
| **Loresmith** | ★★☆☆☆ | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |
| **Voidwalker** | ★★★☆☆ | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★★☆☆ |
| **Datamancer** | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★★☆☆☆ |

---

## Codebreaker

> *"Every wall is just code waiting to be rewritten."*

**Role:** Frontline combatant, barrier destroyer, brute-force problem solver

### Stats
- **+3 Strength, +2 Agility**
- Base HP: **120** (instead of 100)

```bash
# Calculate starting HP
node .claude/skills/math/math.js calc "100 + 20"  # = 120

# Calculate stat after class bonus (example: STR 14)
node .claude/skills/math/math.js calc "14 + 3"  # = 17 STR
```

### Passive: Momentum
After winning a combat round, your next attack deals **+5 bonus damage**. Stacks up to 3 times.

```bash
# Calculate momentum damage (3 stacks)
node .claude/skills/math/math.js calc "15 + (5 * 3)"  # Base 15 + 15 bonus = 30 damage
```

### Class Abilities

| Tier | Ability | Cost | Effect |
|------|---------|------|--------|
| **1** | **Shatter** | Free (1/combat) | Destroy barrier/lock or -4 enemy Defense |
| **1** | **Weapon Charge** | 2 Spirit | Next attack deals +10 damage |
| **3** | **Momentum** | Passive | Consecutive hits: +3 damage each (stacks to 3×) |
| **3** | **Berserker Surge** | 10 HP | Double damage next attack, take +5 if hit |
| **5** | **Unstoppable** | 4 Spirit | Ignore first 10 damage each round |
| **7** | **Execute** | 5 Spirit | Instantly kill enemies below 25% HP |
| **9** | **Code Crash** | 15 willpower | Instantly defeat one non-boss enemy |
| **10** | **World Breaker** | 15 Spirit | Deal 100 damage to all enemies in 15m |

### Combat Style
- Excels at melee combat and heavy weapons
- Can break through obstacles others must puzzle around
- Gains bonus damage from momentum in extended fights
- Higher base HP makes them durable frontliners

### Starting Equipment
- **Hex Breaker** (Heavy Weapon, 15 damage) - A crackling maul that disrupts magical barriers
- **Scrap Plating** (Light Armor, -3 damage taken) - Salvaged tech welded into wearable protection
- **Barrier Charge x2** - Consumable: Destroy one physical barrier

### Weaknesses
- Lower Mind/Spirit means harder Weave manipulation
- Brute-force solutions may miss hidden paths
- Struggles with puzzles requiring finesse

---

## Loresmith

> *"Knowledge is the source code of power."*

**Role:** Scholar, diplomat, information broker

### Stats
- **+3 Mind, +2 Spirit**
- Starting Gold: **100** (instead of 50)

```bash
# Calculate starting gold
node .claude/skills/math/math.js calc "50 + 50"  # = 100 gold
```

### Passive: Deep Memory
When you encounter any NPC, location, or lore element you've interacted with before, you may ask the GM one free question about hidden information related to it.

### Class Abilities

| Tier | Ability | Cost | Effect |
|------|---------|------|--------|
| **1** | **Recall** | Free (1/location) | Learn one secret about current location |
| **1** | **Analyze** | 2 Spirit | Learn enemy stats and weaknesses |
| **3** | **Silver Tongue** | 5 willpower | Auto-succeed on persuasion/negotiation |
| **3** | **Tactical Command** | 3 Spirit | Grant ally +2 to next roll |
| **5** | **Predict Pattern** | 4 Spirit | Automatically dodge next attack |
| **7** | **Chronicle's Ward** | 10 willpower | Rewind time 1 turn—undo last action |
| **7** | **Rewrite Weakness** | 6 Spirit | Ally immune to one damage type |
| **10** | **Absolute Truth** | 12 Spirit | Force target to answer 3 questions truthfully |

### Social Style
- NPCs offer better prices and more information
- Can unlock dialogue options others cannot
- Quest rewards increased by 25% (gold)
- Knowledge checks automatically succeed

```bash
# Calculate quest reward bonus (example: 20 base gold)
node .claude/skills/math/math.js calc "20 * 1.25"  # = 25 gold
```

### Starting Equipment
- **Tome of Echoes** (Accessory) - +2 to all Mind checks, can store one spell
- **Diplomat's Attire** (Light Armor, -2 damage) - Grants +1 to NPC disposition
- **Scholar's Lens** - Consumable x3: Reveal hidden text or invisible markings
- **100 Gold** (instead of 50)

### Weaknesses
- Lowest combat effectiveness
- Must rely on others or cleverness in fights
- Physical obstacles are genuine challenges

---

## Voidwalker

> *"The shadows between the code are my domain."*

**Role:** Scout, infiltrator, secret-finder

### Stats
- **+3 Agility, +2 Mind**
- **Inventory Capacity**: Base capacity + 5 slots
  - This bonus is added after attribute modifiers
  - Example: With MND 12 (+1) and AGI 13 (+1), capacity = 10 + (1×3) + (1×1) + 5 = 19 slots

### Passive: Shadow Step
Once per location, you may automatically evade one attack or trap without rolling. Additionally, enemies require a roll of 15+ to detect you when you're hiding.

### Class Abilities

| Tier | Ability | Cost | Effect |
|------|---------|------|--------|
| **1** | **Phase** | 2 Spirit | Walk through walls/obstacles |
| **1** | **Shadow Step** | 3 Spirit | Teleport up to 20m |
| **3** | **Vanish** | 5 HP | Become invisible until attack |
| **3** | **Void Sight** | Free | Reveal all hidden objects/traps |
| **5** | **Backstab** | 4 Spirit | Triple damage from stealth |
| **5** | **Shadow Clone** | 5 Spirit | Create illusory duplicate |
| **7** | **Void Walk** | 6 Spirit | Phase into Void (untargetable) for 2 rounds |
| **9** | **Assassinate** | 8 Spirit | Instantly kill unaware target |
| **10** | **Absolute Void** | 15 Spirit | Erase existence in 10m radius |

```bash
# Calculate backstab damage (stealth attack)
node .claude/skills/math/math.js calc "10 * 3"  # Light weapon (10) * 3 = 30 damage

# With +5 stealth bonus:
node .claude/skills/math/math.js calc "(10 + 5) * 3"  # = 45 damage
```

### Exploration Style
- Can access areas others cannot reach
- Automatically notices secret passages (GM reveals them)
- First strike in combat if undetected
- Can flee any combat without rolling

### Starting Equipment
- **Null Blade** (Light Weapon, 10 damage) - Attacks from stealth deal +5 damage
- **Shadowweave Cloak** (Light Armor, -2 damage) - +3 to stealth checks
- **Lockpick Set** - Bypass non-magical locks without rolling
- **Smoke Bomb x3** - Consumable: Create cover, break line of sight

### Weaknesses
- Lower HP and durability
- Straight fights are dangerous
- Less effective when stealth isn't an option

---

## Datamancer

> *"I don't just perceive the Weave—I am its architect."*

**Role:** Reality manipulator, content creator, magical powerhouse

### Stats
- **+3 Spirit, +2 Mind**
- **Willpower Affinity:** Recover **+20%** bonus willpower on rest (rounded up)

```bash
# Calculate willpower recovery bonus (example: 15 base willpower)
node .claude/skills/math/math.js calc "ceil(15 * 1.2)"  # = 18 willpower (20% bonus, rounded up)

# Enhanced passive at 1000 XP:
node .claude/skills/math/math.js calc "ceil(15 * 1.3)"  # = 20 willpower (30% bonus)
```

### Passive: Weave Attunement
You can sense Weave disturbances. At any location, you may ask if any content was recently created or modified there. Additionally, your magic attacks ignore 5 points of enemy armor.

### Class Abilities

| Tier | Ability | Cost | Effect |
|------|---------|------|--------|
| **1** | **Manifest Weapon** | 3 Spirit | Create temporary 1d10 weapon (3 rounds) |
| **1** | **Debug** | 2 Spirit | Remove one Corruption status effect |
| **3** | **Copy** | 3 Spirit | Duplicate one mundane item |
| **3** | **System Scan** | 2 Spirit | Detect all life/tech within 30m |
| **5** | **Reality Patch** | 10 willpower | Alter one minor detail in location |
| **5** | **Compile** | 4 Spirit | Create solid object (1m³, 10 min) |
| **7** | **Code Injection** | 6 Spirit | Control one enemy for 1 round |
| **7** | **Restore** | 4 Spirit | Repair object or heal 3d8 HP |
| **9** | **Fork Process** | 8 Spirit | Create temporary clone (half stats) |
| **10** | **Delete** | 15 Spirit | Erase enemy from existence |

### Creation Style
- All willpower recovery increased by +20%
- Can sense corrupted data from greater distance
- Magic is their primary combat approach
- Can solve problems by literally changing reality

### Starting Equipment
- **Weave Focus** (Accessory) - +2 to all Spirit checks, magic damage +3
- **Data Robes** (Light Armor, -2 damage) - Regenerate 5 HP on willpower recovery
- **Reality Anchor x2** - Consumable: Prevent one Weave-based attack or effect
- **Blank Scroll x3** - Required component for Manifest ability

### Weaknesses
- Physically fragile
- Abilities often cost willpower (resource management)
- Direct combat without magic is very difficult

---

## Class Comparison

| Aspect | Codebreaker | Loresmith | Voidwalker | Datamancer |
|--------|-------------|-----------|------------|------------|
| **Combat** | ★★★★★ | ★★☆☆☆ | ★★★☆☆ | ★★★★☆ |
| **Exploration** | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★★★☆☆ |
| **Social** | ★★☆☆☆ | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| **Weaving** | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ | ★★★★★ |
| **Durability** | ★★★★★ | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ |

## Multi-Class Synergies

When playing with other Weavers:

- **Codebreaker + Voidwalker:** Break in together—one smashes, one sneaks
- **Loresmith + Datamancer:** Information + creation = powerful world-building
- **Voidwalker + Loresmith:** Scout ahead, then talk your way through
- **Codebreaker + Datamancer:** Raw power enhanced by magical support

---

## Progression

As you complete quests and gain XP, your class abilities grow:

### Milestones

| XP Milestone | Unlock |
|--------------|--------|
| 500 | Class ability cooldowns reduced (free abilities: 2/location instead of 1) |
| 1000 | Passive ability enhanced (see class description) |
| 2000 | Unlock one ability from another class (costs double) |
| 5000 | Ascended Form: Major class-specific power upgrade |

### Enhanced Passives (at 1000 XP)

- **Codebreaker:** Momentum stacks to 5, max bonus +25 damage
  ```bash
  node .claude/skills/math/math.js calc "15 + (5 * 5)"  # Max: 15 + 25 = 40 damage
  ```
- **Loresmith:** Deep Memory works on things you've only read about, not just encountered
- **Voidwalker:** Shadow Step works twice per location
- **Datamancer:** +30% willpower recovery instead of +20%
  ```bash
  node .claude/skills/math/math.js calc "ceil(15 * 1.3)"  # 30% bonus
  ```
