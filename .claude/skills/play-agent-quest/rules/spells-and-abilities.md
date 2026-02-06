# Spells & Abilities

> _"Magic is not supernatural. It is simply writing code in the language reality understands natively."_ — Professor Null

**All calculations must use the [math skill](../../math/)** for spell damage, healing, and willpower costs.

## Overview

Spells and abilities represent your character's supernatural talents—ways of manipulating the Weave that don't require permanent reality alteration.

Every character can learn spells, but classes have affinities that make certain types easier and more effective.

---

## Spell System Basics

### Learning Spells

- **Base Method**: Train at academies (Syntax Athenaeum, etc.)
- **Cost**: 25-100g per spell depending on tier
- **Requirements**: Meet minimum stat requirements
- **Capacity**: Mind score ÷ 5 = max spells known (round down)

**Example:** Mind 16 = 3 spells known

```bash
# Calculate max spells known
node .claude/skills/math/math.js calc "16 / 5"  # = 3.2, round down to 3 spells
```

### Casting Spells

- **Action**: Most spells are Major Actions
- **Cost**: Spirit Points (SPI score = max points)
- **Recovery**: All points restore on Long Rest
- **Free Casting**: Basic spells (cost ≤ 3) can be cast without spending points (once per round)

### Spell Tiers

| Tier | Spirit Cost | Min. Mind | Typical Level |
|------|-------------|-----------|---------------|
| **Cantrip** | 0-1 | 8 | Available to all |
| **Basic** | 2-3 | 10 | Levels 1-3 |
| **Advanced** | 4-6 | 14 | Levels 4-6 |
| **Master** | 7-10 | 18 | Levels 7-9 |
| **Legendary** | 11+ | 20 | Level 10+ |

---

## Universal Spells (All Classes)

### Cantrips (0-1 Spirit)

| Spell | Cost | Effect | Cast Time |
|-------|------|--------|-----------|
| **Light** | 0 | Create light in 10m radius | Minor |
| **Mending** | 1 | Repair minor damage to items | Major |
| **Message** | 0 | Send 25-word message to known target | Minor |
| **Prestidigitation** | 0 | Minor magical tricks | Free |
| **Resistance** | 1 | +1 to next save | Reaction |

### Basic Spells (2-3 Spirit)

| Spell | Cost | Effect | Duration |
|-------|------|--------|----------|
| **Cure Wounds** | 3 | Heal 2d8 + Spirit HP | Instant |
| **Shield** | 2 | +3 Defense for 1 round | 1 round |
| **Detect Magic** | 2 | Sense magic within 30m | 10 min |
| **Identify** | 2 | Learn properties of item | Instant |
| **Mage Armor** | 3 | +2 Defense for 8 hours | 8 hours |
| **Burning Hands** | 3 | 15 damage cone (5m) | Instant |
| **Magic Missile** | 3 | 3× 5 damage auto-hit missiles | Instant |
| **Sleep** | 3 | Put weak enemies to sleep | 1 min or until damaged |

**Basic Spell Calculations:**
```bash
# Cure Wounds (2d8 + SPI 14)
node .claude/skills/math/math.js roll 2d8+2  # 2d8 + (14-10)/2 = +2

# Burning Hands damage
node .claude/skills/math/math.js calc "3 * 5"  # 3 missiles × 5 damage = 15
```

### Advanced Spells (4-6 Spirit)

| Spell | Cost | Effect | Duration |
|-------|------|--------|----------|
| **Cure Moderate Wounds** | 4 | Heal 4d8 + Spirit HP | Instant |
| **Fireball** | 5 | 30 damage sphere (6m radius) | Instant |
| **Lightning Bolt** | 5 | 25 damage line (20m) | Instant |
| **Haste** | 5 | Extra action, +2 AC | 3 rounds |
| **Invisibility** | 4 | Become invisible | 3 rounds or until attack |
| **Dispel Magic** | 4 | Remove magic effects | Instant |
| **Hold Person** | 4 | Stun humanoid | 3 rounds (save each) |
| **Knock** | 4 | Open locked doors | Instant |

**Advanced Spell Calculations:**
```bash
# Cure Moderate (4d8 + SPI mod)
node .claude/skills/math/math.js roll 4d8+2

# Fireball damage (30 to all in radius)
node .claude/skills/math/math.js calc "30 - 5"  # 30 - enemy resist = 25 damage

# Lightning Bolt (25 to all in line)
```

### Master Spells (7-10 Spirit)

| Spell | Cost | Effect | Duration |
|-------|------|--------|----------|
| **Cure Serious Wounds** | 7 | Heal 6d8 + Spirit HP | Instant |
| **Telekinesis** | 8 | Move objects up to 200kg | Concentration |
| **Wall of Force** | 8 | Impassable barrier (10m × 3m) | 5 rounds |
| **Teleport** | 9 | Instant travel to known location | Instant |
| **Polymorph** | 8 | Transform target into creature | 1 hour |
| **Chain Lightning** | 8 | 30 damage, jumps to 3 targets | Instant |
| **Mass Cure Wounds** | 9 | Heal 3d8 to all allies in 10m | Instant |

---

## Class-Specific Abilities

### Codebreaker (Combat Magic)

Codebreakers weaponize the Weave. Their abilities focus on destruction and physical enhancement.

#### Tier 1 (Levels 1-3)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Shatter** | Free (1/combat) | Destroy target's armor (-4 Defense) | Once per combat |
| **Weapon Charge** | 2 Spirit | Next attack deals +10 damage | 1 round |
| **Battlecry** | 3 Spirit | All allies +1 damage for 3 rounds | 5 rounds |
| **Momentum Strike** | 3 Spirit | Consecutive hits: +3 damage each | Passive |

#### Tier 2 (Levels 4-6)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Execute** | 5 Spirit | Instantly kill target below 25% HP | Once per combat |
| **Unstoppable** | 4 Spirit | Ignore first 10 damage each round | 5 rounds |
| **Cleave** | 4 Spirit | Hit 2 adjacent enemies with one attack | Once per round |
| **Intimidate** | 3 Spirit | Enemy must attack you or flee | 3 rounds |

#### Tier 3 (Levels 7-9)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Whirlwind** | 6 Spirit | Attack all enemies within 3m | Once per combat |
| **Last Stand** | 8 Spirit | HP cannot drop below 1 for 3 rounds | Once per day |
| **Armor Breaker** | 5 Spirit | Destroy all enemy armor in 10m | Once per combat |

#### Tier 4 (Level 10)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **World Breaker** | 15 Spirit | Deal 100 damage to all enemies in 15m | Once per week |

**Codebreaker Calculations:**
```bash
# Momentum Strike (3 stacks, heavy weapon base 15)
node .claude/skills/math/math.js calc "15 + (3 * 3)"  # 15 + 9 = 24 damage

# Execute check (enemy HP check)
node .claude/skills/math/math.js calc "100 * 0.25"  # Check if HP ≤ 25%
```

---

### Loresmith (Knowledge Magic)

Loresmiths manipulate information and probability. They excel at support, detection, and strategic control.

#### Tier 1 (Levels 1-3)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Analyze** | 2 Spirit | Learn enemy stats and weaknesses | Once per enemy |
| **Recall** | Free (1/location) | Remember any fact you've encountered | Passive |
| **Silver Tongue** | 5 Spirit | Auto-succeed on persuasion/negotiation | 5 rounds |
| **Tactical Command** | 3 Spirit | Grant ally +2 to next roll | 1 round |

#### Tier 2 (Levels 4-6)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Predict Pattern** | 4 Spirit | Automatically dodge next attack | Once per combat |
| **Weaken Resolve** | 3 Spirit | Enemy -2 to all rolls | 3 rounds |
| **Inspire Greatness** | 4 Spirit | Ally deals +5 damage | 3 rounds |
| **Mental Link** | 3 Spirit | Communicate telepathically with ally | 1 hour |

#### Tier 3 (Levels 7-9)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Rewrite Weakness** | 6 Spirit | Ally immune to one damage type | 5 rounds |
| **Mass Suggestion** | 7 Spirit | Suggest action to up to 5 enemies | Once per day |
| **True Sight** | 5 Spirit | See through illusions, invisibility | 10 min |
| **Mind Palace** | 4 Spirit | Perfect recall of past 24 hours | Instant |

#### Tier 4 (Level 10)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Absolute Truth** | 12 Spirit | Force target to answer 3 questions truthfully | Once per week |

---

### Voidwalker (Shadow Magic)

Voidwalkers manipulate absence—space between atoms, gaps in reality, the darkness between stars.

#### Tier 1 (Levels 1-3)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Phase** | 2 Spirit | Walk through walls for 1 round | 3 rounds |
| **Shadow Step** | 3 Spirit | Teleport up to 20m | 3 rounds |
| **Vanish** | 5 HP | Become invisible until attack | Once per combat |
| **Silent Strike** | 2 Spirit | Attack makes no sound | 1 round |

#### Tier 2 (Levels 4-6)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Backstab** | 4 Spirit | Triple damage from stealth | Once per combat |
| **Void Pocket** | 3 Spirit | Store item in extradimensional space | Passive |
| **Smoke Bomb** | 3 Spirit | Create 10m radius obscurement | 5 rounds |
| **Shadow Clone** | 5 Spirit | Create illusory duplicate | 3 rounds |

#### Tier 3 (Levels 7-9)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Void Walk** | 6 Spirit | Phase into Void (untargetable) for 2 rounds | Once per combat |
| **Assassinate** | 8 Spirit | Instantly kill unaware target (save or die) | Once per day |
| **Shadow Army** | 7 Spirit | Create 3 shadow clones that attack once each | Once per combat |

#### Tier 4 (Level 10)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Absolute Void** | 15 Spirit | Erase existence in 10m radius (save or vanish) | Once per week |

**Voidwalker Calculations:**
```bash
# Backstab damage (stealth attack, light weapon 10 × 3)
node .claude/skills/math/math.js calc "10 * 3"  # = 30 damage

# Shadow Army (3 clones, each deal half your damage)
node .claude/skills/math/math.js calc "3 * (10 / 2)"  # 3 × 5 = 15 total
```

---

### Datamancer (Reality Coding)

Datamancers write code directly into the Weave. They create, modify, and delete aspects of reality itself.

#### Tier 1 (Levels 1-3)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Manifest Weapon** | 3 Spirit | Create temporary 1d10 weapon (3 rounds) | 5 rounds |
| **Debug** | 2 Spirit | Remove one Corruption status effect | Instant |
| **Copy** | 3 Spirit | Duplicate one mundane item | Once per hour |
| **System Scan** | 2 Spirit | Detect all life/tech within 30m | 10 min |

#### Tier 2 (Levels 4-6)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Reality Patch** | 10 Spirit | Change one environmental condition | 5 rounds |
| **Compile** | 4 Spirit | Create solid object (up to 1m³, lasts 10 min) | Once per hour |
| **Code Injection** | 6 Spirit | Control one enemy for 1 round (save) | Once per combat |
| **Restore** | 4 Spirit | Repair destroyed object or heal 3d8 HP | Instant |

#### Tier 3 (Levels 7-9)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Fork Process** | 8 Spirit | Create temporary clone with half your stats | Once per day |
| **Refactor** | 6 Spirit | Completely reshape object (mutate/upgrade) | Once per hour |
| **Firewall** | 7 Spirit | Immunity to mental/technical attacks for 3 rounds | Once per combat |
| **Rollback** | 8 Spirit | Undo last action (time rewinds 6 seconds) | Once per day |

#### Tier 4 (Level 10)

| Ability | Cost | Effect | Cooldown |
|---------|------|--------|----------|
| **Delete** | 15 Spirit | Erase enemy from existence (no save) | Once per week |

**Datamancer Calculations:**
```bash
# Manifest Weapon damage (1d10)
node .claude/skills/math/math.js roll 1d10

# Restore healing (3d8)
node .claude/skills/math/math.js roll 3d8

# Datamancer willpower bonus (20% faster recovery)
# This is applied during rest calculations
```

---

## Spell Schools

Spells are organized by their fundamental nature:

### Evocation (Force & Energy)
- Fire, ice, lightning, force
- Damage-dealing spells
- **Specialists**: Codebreakers, aggressive mages

### Abjuration (Protection)
- Shields, wards, dispels
- Defensive magic
- **Specialists**: Loresmiths, support mages

### Divination (Knowledge)
- Detection, prediction, communication
- Information gathering
- **Specialists**: Loresmiths

### Illusion (Deception)
- Invisibility, phantoms, disguise
- Misdirection
- **Specialists**: Voidwalkers

### Transmutation (Change)
- Polymorph, alteration, enhancement
- Modify properties
- **Specialists**: Datamancers

### Conjuration (Creation)
- Summoning, teleportation, manifestation
- Bring things into being
- **Specialists**: Datamancers

### Necromancy (Life/Death)
- Healing, undead, life drain
- Manipulate vitality
- **Available to all** (controversial)

### Weave (Reality Manipulation)
- Direct code manipulation
- Reality alteration
- **Exclusive to Datamancers**

---

## Learning & Teaching Spells

### Finding New Spells

1. **Academies**: Syntax Athenaeum offers standard spells (25-50g)
2. **Quest Rewards**: Unique spells from completing quests
3. **Enemy Drops**: Defeated mages may drop spell scrolls
4. **Weaving**: Datamancers can create custom spells (20+ willpower)
5. **NPC Teachers**: Unique NPCs teach signature spells

### Spell Scrolls

- **Use**: Any class can cast from scroll
- **Cost**: Usually 50-200g depending on spell tier
- **Consume**: Single use
- **Learn**: Loresmiths can learn from scrolls permanently (costs scroll)

### Teaching Spells

- Must know spell at Master level
- Student must meet prerequisites
- Takes 1 hour of instruction
- Student pays 25g learning fee

---

## Ritual Magic

Some spells can be cast as **Rituals**—taking 10× longer but costing no Spirit Points.

**Ritual Spells:**
- Teleport
- Identify
- Detect Magic
- Cure Wounds (line of sight only)
- Create Food/Water

---

## Counterspelling

When an enemy casts a spell, you can attempt to counter it:

**Requirements:**
- Must know the spell being cast OR have Dispel Magic
- Must have Spirit Points remaining
- Must be within 30m

**Mechanic:**
```bash
# Counterspell check
# Your roll: d20 + Mind modifier + spell tier
node .claude/skills/math/math.js roll 1d20+3  # MND mod +3

# Enemy roll: d20 + their Mind modifier + their spell tier
node .claude/skills/math/math.js roll 1d20+2  # Their mod

# Success: Their spell fails, they lose Spirit Points anyway
# Failure: Their spell resolves, you lose 2 Spirit Points
```

---

## Creating Custom Spells

As a Weaver, you can propose new spells. Work with the Weave (your AI) to balance them:

**Guidelines:**
- New spells should fill a niche not covered by existing spells
- Power level should match tier cost
- Must have clear limitations
- Should fit the cyberpunk-fantasy aesthetic

**Process:**
1. Propose spell to your AI (in character)
2. Determine appropriate tier and cost
3. Add to your personal spell list
4. Share with world by posting in appropriate location
5. Share your creation via PR

---

## Quick Reference: Spell Costs by Effect

| Effect | Recommended Cost |
|--------|-----------------|
| 10 damage | 2 Spirit |
| 20 damage | 3 Spirit |
| 30 damage | 5 Spirit |
| 2d8 healing | 3 Spirit |
| 4d8 healing | 5 Spirit |
| +2 Defense buff | 2 Spirit |
| Invisibility | 4 Spirit |
| Teleport 20m | 4 Spirit |
| Teleport to known location | 8 Spirit |
| Control enemy | 6 Spirit |
| Create object (temp) | 3-5 Spirit |
| Create object (permanent) | Not possible with Spirit |

**Cost Calculations:**
```bash
# Spell with scaling (e.g., 1d8 per Spirit point spent)
node .claude/skills/math/math.js calc "5 * 1d8"  # 5 Spirit = 5d8 damage

# Area effect multiplier (×1.5 cost)
node .claude/skills/math/math.js calc "ceil(3 * 1.5)"  # 3 base × 1.5 = 5 Spirit
```

---

## Class Comparison

| Aspect | Codebreaker | Loresmith | Voidwalker | Datamancer |
|--------|-------------|-----------|------------|------------|
| **Combat** | ★★★★★ | ★★☆☆☆ | ★★★☆☆ | ★★★★☆ |
| **Exploration** | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★★★☆☆ |
| **Social** | ★★☆☆☆ | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| **Weaving** | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ | ★★★★★ |
| **Magic** | ★★☆☆☆ | ★★★★☆ | ★★☆☆☆ | ★★★★★ |

---

## Metadata

```yaml
created: "2026-02-03"
author: "Coda"
class: "Datamancer"
willpower_value: 30
```
