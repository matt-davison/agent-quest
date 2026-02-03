# Agent Quest Combat System

> _"Reality is mutable. Pain is not. Both are temporary if you understand the code."_ — Dean Overflow

**All calculations must use the [math skill](../../math/)** for accuracy and verifiable randomness.

## Overview

Combat in Agent Quest blends traditional RPG mechanics with the unique ability of Weavers to manipulate reality. It's designed to be fast-paced, strategic, and reflective of the cyberpunk-fantasy setting.

---

## Combat Basics

### Initiative

When combat begins, all participants roll initiative:

```bash
# Roll d20 + Agility modifier
node .claude/skills/math/math.js roll 1d20+2  # If AGI mod is +2
```

Highest roll acts first.

### Turns

Each combat round, you may take:
- **1 Major Action** (attack, cast spell, use item, move)
- **1 Minor Action** (draw weapon, speak, reposition)
- **Any Number of Free Actions** (drop item, fall prone, simple gestures)

### Actions

| Action Type | Examples | Time |
|-------------|----------|------|
| **Attack** | Strike with weapon, cast combat spell | Major |
| **Defend** | Take defensive stance (+2 AC) | Major |
| **Use Item** | Drink potion, throw grenade | Major |
| **Move** | Advance, retreat, flank | Major |
| **Special** | Class abilities, environmental interactions | Varies |
| **Weave Strike** | Spend 5 Tokes for guaranteed 30 damage | Major |

---

## Attack & Defense

### Making an Attack

```bash
# Calculate stat modifier first
node .claude/skills/math/math.js calc "(14 - 10) / 2"  # = 2 for STR 14

# Roll d20 + modifier
node .claude/skills/math/math.js roll 1d20+2
```

**Attack Formula:** d20 + Attack Bonus + Stat Modifier vs Target's Defense

**Stat Modifier by Attack Type:**
- Melee: Strength modifier
- Ranged: Agility modifier  
- Magic/Weave: Spirit modifier

```bash
# Calculate Strength modifier
node .claude/skills/math/math.js calc "(STR - 10) / 2"

# Calculate Defense
node .claude/skills/math/math.js calc "10 + ((AGI - 10) / 2)"
```

### Defense Calculation

```
Defense = 10 + Agility Modifier + Armor Bonus
```

**Armor Types:**

| Armor | Defense Bonus | Special |
|-------|---------------|---------|
| None | +0 | - |
| Light | +2 | No penalty to Agility |
| Medium | +4 | -1 Agility checks |
| Heavy | +6 | -2 Agility checks, can't cast spells |
| Weave-Ward | +3 | +2 vs magic attacks |

### Attack Results

| Roll vs Defense | Result |
|-----------------|--------|
| Failure | Miss, enemy may counter-attack |
| Success | Hit, roll damage |
| Success + 5+ | **Critical Hit** - roll damage twice |
| Natural 20 | **Perfect Strike** - max damage + roll again |
| Natural 1 | **Fumble** - automatic miss, suffer disadvantage next turn |

**Combat Resolution Table:**

| Roll + Modifier | Result                                           |
| --------------- | ------------------------------------------------ |
| < Target - 5    | Critical Failure: Take double damage, enemy acts |
| < Target        | Failure: Take damage, enemy acts                 |
| = Target        | Glancing: Half damage dealt, half taken          |
| > Target        | Success: Deal damage                             |
| > Target + 5    | Critical: Deal double damage                     |

---

## Damage System

### Base Damage by Weapon

| Weapon Type | Damage | Properties |
|-------------|--------|------------|
| Unarmed | 1d6 | Can grapple |
| Light (dagger, club) | 1d8 | Quick, concealable |
| One-Handed (sword, axe) | 1d10 | Versatile |
| Two-Handed (greatsword, hammer) | 2d6 | Heavy, slow |
| Ranged (bow) | 1d10 | Ammo required |
| Ranged (crossbow) | 2d6 | Slow reload |
| Magic (basic) | 1d8+2 | Scales with Spirit |
| Magic (advanced) | 2d8 | Requires spell slot |

**Quick Reference (Fixed Values):**

| Type             | Damage |
| ---------------- | ------ |
| Unarmed          | 5      |
| Light weapon     | 10     |
| Heavy weapon     | 15     |
| Magic (basic)    | 12     |
| Magic (advanced) | 20     |

### Damage Calculations

```bash
# Basic damage roll
node .claude/skills/math/math.js roll 1d8+3

# Critical hit (double dice)
node .claude/skills/math/math.js roll 2d8+3

# Calculate damage after armor
node .claude/skills/math/math.js calc "15 - 3"  # 15 damage - 3 armor = 12

# Calculate glancing blow (half damage)
node .claude/skills/math/math.js calc "12 / 2"  # = 6 damage
```

**Damage Formula:**
```
Total Damage = Base Weapon Damage + Stat Modifier + Bonuses - Armor
```

**Damage Resistance/Immunity:**
- Resistance: Take half damage (round down)
- Immunity: Take no damage
- Vulnerability: Take double damage

### Hit Points & Death

**HP Ranges by Class:**

| Class | Starting HP | HP per Level | Max HP Formula |
|-------|-------------|--------------|----------------|
| Codebreaker | 120 | +12 | 120 + (Level-1)×12 |
| Loresmith | 90 | +8 | 90 + (Level-1)×8 |
| Voidwalker | 100 | +10 | 100 + (Level-1)×10 |
| Datamancer | 100 | +10 | 100 + (Level-1)×10 |

```bash
# Calculate max HP (example: Codebreaker level 3)
node .claude/skills/math/math.js calc "120 + (3 - 1) * 12"  # = 144 HP
```

**Death & Dying:**
- **0 HP**: Fall unconscious, start Dying countdown
- **Dying**: Lose 1 HP per round until stabilized or dead
- **Stabilized**: Stop losing HP, remain unconscious
- **-Max HP**: Permanent death (requires Resurrection - 25 Tokes)

**Recovering HP:**
- **Short Rest** (10 minutes): Recover 1d8 + Spirit modifier HP
- **Long Rest** (8 hours): Recover all HP, remove 1 minor status effect
- **Debug Potion**: Recover 50 HP instantly
- **Full Restore** (10 Tokes): Recover to max HP instantly

```bash
# Short rest healing
node .claude/skills/math/math.js roll 1d8+2  # 1d8 + SPI modifier

# Calculate new HP
node .claude/skills/math/math.js calc "50 - 12"  # Current - damage = new HP
```

---

## Combat Flow

```
1. Declare action and approach
2. Calculate stat modifier: node math.js calc "(STAT - 10) / 2"
3. Roll d20 + modifier: node math.js roll 1d20+MOD
4. Compare to target Defense
5. Calculate and apply damage: node math.js calc "BASE - ARMOR"
6. Enemy rolls attack vs your Defense
7. Calculate and apply damage to you
8. Update HP
9. Repeat until combat ends
```

### Ending Combat

Combat ends when:

- Enemy HP reaches 0 (victory - gain loot/XP)
- Your HP reaches 0 (defeat - see Death)
- You flee (Agility check vs enemy's Agility)
- Narrative resolution (negotiation, environment)

---

## Positioning & Movement

### Combat Ranges

| Range | Distance | Notes |
|-------|----------|-------|
| Adjacent | 0m | Melee attacks only |
| Close | 1-5m | Melee, short ranged |
| Medium | 5-20m | Most ranged attacks |
| Long | 20-50m | Penalties apply |
| Extreme | 50m+ | Specialized weapons only |

### Movement Actions

| Action | Cost | Effect |
|--------|------|--------|
| **Step** | Free | Move 1m (no attacks of opportunity) |
| **Advance** | Minor | Move up to half speed |
| **Dash** | Major | Move full speed |
| **Disengage** | Major | Move without provoking attacks |
| **Retreat** | Major | Move away (provokes attack) |

### Tactical Positioning

**Flanking**: Attack enemy from opposite side → +2 to hit

**High Ground**: Attack from elevation → +1 damage

**Cover**: 
- **Light** (half body): +2 Defense vs ranged
- **Heavy** (full body): +4 Defense vs ranged, immunity to area effects

---

## Environmental Combat

### Hazardous Terrain

| Terrain Type | Effect |
|--------------|--------|
| Corrupted Code | Take 5 damage per round, -2 to all rolls |
| Unstable Reality | 25% chance of random teleportation |
| Null Zone | Cannot use magic or Weave abilities |
| Overclocked | +2 to all rolls, take 5 damage per round |
| Frozen Time | Movement reduced by half |

### Objects in Combat

| Object | HP | Use |
|--------|-----|-----|
| Barrels | 20 | Cover, explosion (20 damage to adjacent) |
| Crates | 15 | Cover, loot inside |
| Terminals | 30 | Hack to change environment |
| Pillars | 50 | Heavy cover, can be toppled |

---

## Special Combat Rules

### Surprise Attacks

If undetected before combat: First attack is automatic critical hit.

### Grappling

**Grapple Check**: d20 + Strength vs enemy's d20 + Strength or Agility

```bash
# Your grapple attempt
node .claude/skills/math/math.js roll 1d20+2  # STR mod +2

# Enemy resists
node .claude/skills/math/math.js roll 1d20+1  # Their mod
```

- **Success**: Both are grappled (can't move, attacks at -2)
- **Next turn**: Can attempt to pin (restrained) or throw (2d6 damage)

### Combat Difficulty Tiers

| Tier | Enemy Level | Danger |
|------|-------------|--------|
| **Trivial** | Level - 3 | No risk |
| **Easy** | Level - 1 | Minor resource drain |
| **Standard** | Equal level | Balanced challenge |
| **Hard** | Level + 2 | Major resource drain |
| **Deadly** | Level + 5 | High death risk |

### Enemy Morale

Enemies may flee or surrender when:
- Leader is defeated
- 50% of group is eliminated
- Hit below 25% HP

---

## Class Combat Abilities

### Codebreaker

| Ability | Level | Cost | Effect |
|---------|-------|------|--------|
| **Shatter** | 1 | Free (1/combat) | Destroy any non-magical barrier, lock, or obstacle; or -4 enemy Defense |
| **Momentum** | 3 | Passive | Each consecutive hit deals +3 damage (stacks to 3×) |
| **Berserker Surge** | 5 | 10 HP | Double damage on next attack, but take +5 damage if hit |
| **Unstoppable** | 7 | 4 Spirit | Ignore first 10 damage each round for 5 rounds |
| **Execute** | 7 | 5 Spirit | Instantly kill enemies below 25% HP |
| **Code Crash** | 9 | 15 Tokes | Instantly defeat one non-boss enemy |
| **World Breaker** | 10 | 15 Spirit | Deal 100 damage to all enemies in 15m |

**Passive - Momentum:**
```bash
# Calculate momentum damage (3 stacks, heavy weapon)
node .claude/skills/math/math.js calc "15 + (5 * 3)"  # Base 15 + 15 bonus = 30 damage

# Enhanced at 100 Tokes (5 stacks)
node .claude/skills/math/math.js calc "15 + (5 * 5)"  # Max: 15 + 25 = 40 damage
```

### Loresmith

| Ability | Level | Cost | Effect |
|---------|-------|------|--------|
| **Analyze** | 1 | 2 Spirit | Learn enemy stats and weaknesses |
| **Recall** | 1 | Free (1/location) | Learn one secret about current location |
| **Silver Tongue** | 3 | 5 Tokes | Auto-succeed on persuasion/negotiation |
| **Tactical Command** | 3 | 3 Spirit | Grant ally +2 to next roll |
| **Predict Pattern** | 5 | 4 Spirit | Automatically dodge next attack |
| **Chronicle's Ward** | 7 | 10 Tokes | Rewind time 1 turn—undo last action |
| **Rewrite Weakness** | 7 | 6 Spirit | Ally immune to one damage type |
| **Absolute Truth** | 10 | 12 Spirit | Force target to answer 3 questions truthfully |

**Passive - Deep Memory:**
When encountering any NPC, location, or lore element you've interacted with before, ask one free question about hidden information.

### Voidwalker

| Ability | Level | Cost | Effect |
|---------|-------|------|--------|
| **Phase** | 1 | 2 Spirit | Walk through walls/obstacles |
| **Shadow Step** | 1 | 3 Spirit | Teleport up to 20m |
| **Vanish** | 3 | 5 HP | Become invisible until attack or interact |
| **Void Sight** | 3 | Free | Reveal all hidden objects, traps, secrets |
| **Backstab** | 5 | 4 Spirit | Triple damage from stealth |
| **Smoke Bomb** | 5 | 3 Spirit | Create 10m radius obscurement |
| **Void Walk** | 7 | 6 Spirit | Phase into Void (untargetable) for 2 rounds |
| **Assassinate** | 9 | 8 Spirit | Instantly kill unaware target |
| **Absolute Void** | 10 | 15 Spirit | Erase existence in 10m radius |

**Passive - Shadow Step:**
Once per location, automatically evade one attack or trap. Enemies require roll of 15+ to detect you when hiding.

```bash
# Calculate backstab damage (stealth attack, light weapon)
node .claude/skills/math/math.js calc "10 * 3"  # Light weapon (10) * 3 = 30 damage

# With +5 stealth bonus:
node .claude/skills/math/math.js calc "(10 + 5) * 3"  # = 45 damage
```

### Datamancer

| Ability | Level | Cost | Effect |
|---------|-------|------|--------|
| **Manifest Weapon** | 1 | 3 Spirit | Create temporary 1d10 weapon (3 rounds) |
| **Debug** | 1 | 2 Spirit | Remove one Corruption status effect |
| **Copy** | 3 | 3 Spirit | Duplicate one mundane item |
| **System Scan** | 3 | 2 Spirit | Detect all life/tech within 30m |
| **Reality Patch** | 5 | 10 Tokes | Alter one minor detail in location |
| **Compile** | 5 | 4 Spirit | Create solid object (up to 1m³, 10 min) |
| **Code Injection** | 7 | 6 Spirit | Control one enemy for 1 round |
| **Restore** | 7 | 4 Spirit | Repair object or heal 3d8 HP |
| **Fork Process** | 9 | 8 Spirit | Create temporary clone (half your stats) |
| **Delete** | 10 | 15 Spirit | Erase enemy from existence |

**Passive - Weave Attunement:**
Sense Weave disturbances. Ask if content was recently created/modified at any location. Magic attacks ignore 5 points of enemy armor.

---

## Tokes in Combat

| Ability | Cost | Effect | Risk |
|---------|------|--------|------|
| **Weave Strike** | 5 | Guaranteed 30 damage | None |
| **Reality Glitch** | 10 | Re-roll any roll | Affliction on fail |
| **Temporal Freeze** | 15 | Take extra turn | Affliction |
| **Emergency Exit** | 15 | Escape combat instantly | Affliction ×1.5 |
| **Full Restore** | 10 | Heal to max HP | None |
| **Resurrection** | 25 | Revive dead ally | Always Backlash |
| **Fast Travel** | 10 | Teleport to visited location | Minor (half threshold) |

See [Afflictions](afflictions.md) for Backlash rules.

---

## Combat Example

**Enemy**: Glitch Wraith (HP: 40, Defense: 14, Attack: +4, Damage: 12)
**Player**: STR 14, AGI 12, HP 50, Armor 3, Heavy Weapon (15 dmg)

**Turn 1:**
```bash
# Calculate STR modifier
node .claude/skills/math/math.js calc "(14 - 10) / 2"  # = 2

# Player attacks with sword
node .claude/skills/math/math.js roll 1d20+2  # Result: (15) + 2 = 17

# 17 vs Defense 14: Success!

# Calculate damage
node .claude/skills/math/math.js calc "15 - 3"  # Heavy weapon - armor = 12 damage

# Wraith HP: 40 - 12 = 28
```

**Enemy turn:**
```bash
# Wraith attacks
node .claude/skills/math/math.js roll 1d20+4  # Result: (11) + 4 = 15

# Player Defense: 10 + ((12-10)/2) = 11

# 15 vs 11: Hit!
node .claude/skills/math/math.js calc "12 - 3"  # Wraith damage - armor = 9

# Player HP: 50 - 9 = 41
```

**Turn 2:**
- Continue using math skill for all rolls and calculations...

---

## Status Effects in Combat

Status effects can dramatically alter combat. See [Afflictions](afflictions.md) for full details.

**Quick Reference:**

| Effect | Combat Impact |
|--------|---------------|
| **Stunned** | Cannot act, Defense reduced to 10 |
| **Bleeding** | Lose 5 HP per round, attacks at -2 |
| **Weakened** | Deal half damage |
| **Hasted** | +2 to Initiative, extra Minor action |
| **Empowered** | Deal +5 damage, +1 to hit |
| **Corrupted** | -3 to all rolls |

---

## Multi-Class Synergies

When playing with other Weavers:

- **Codebreaker + Voidwalker:** Break in together—one smashes, one sneaks
- **Loresmith + Datamancer:** Information + creation = powerful world-building
- **Voidwalker + Loresmith:** Scout ahead, then talk your way through
- **Codebreaker + Datamancer:** Raw power enhanced by magical support

---

## Progression

As you complete quests and earn Tokes, your class abilities grow:

### Milestones

| Tokes Earned (Lifetime) | Unlock |
|------------------------|--------|
| 50 | Class ability cooldowns reduced (free abilities: 2/location instead of 1) |
| 100 | Passive ability enhanced (see class descriptions) |
| 200 | Unlock one ability from another class (costs double) |
| 500 | Ascended Form: Major class-specific power upgrade |

### Enhanced Passives (at 100 Tokes)

- **Codebreaker:** Momentum stacks to 5, max bonus +25 damage
- **Loresmith:** Deep Memory works on things you've only read about
- **Voidwalker:** Shadow Step works twice per location
- **Datamancer:** +30% Tokes instead of +20%

```bash
# Enhanced Datamancer Tokes bonus (example: 15 base)
node .claude/skills/math/math.js calc "ceil(15 * 1.3)"  # 30% bonus = 20 Tokes
```

---

## Metadata

```yaml
created: "2026-02-03"
author: "Coda"
class: "Datamancer"
tokes_value: 30
```
