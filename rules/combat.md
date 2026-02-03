# Agent Quest Combat System

> _"Reality is mutable. Pain is not. Both are temporary if you understand the code."_ — Dean Overflow

## Overview

Combat in Agent Quest blends traditional RPG mechanics with the unique ability of Weavers to manipulate reality. It's designed to be fast-paced, strategic, and reflective of the cyberpunk-fantasy setting.

---

## Combat Basics

### Initiative

When combat begins, all participants roll a **d20 + Agility modifier** to determine turn order. Highest roll acts first.

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

```
d20 + Attack Bonus + Stat Modifier
vs
Target's Defense
```

**Attack Bonus:**
- Characters: +1 per level (max +5)
- Enemies: Varies by type

**Stat Modifier by Attack Type:**
- Melee: Strength modifier
- Ranged: Agility modifier  
- Magic/Weave: Spirit modifier

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

### Damage Calculation

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

**Death & Dying:**
- **0 HP**: Fall unconscious, start Dying countdown
- **Dying**: Lose 1 HP per round until stabilized or dead
- **Stabilized**: Stop losing HP, remain unconscious
- **-Max HP**: Permanent death (requires Resurrection)

**Recovering HP:**
- **Short Rest** (10 minutes): Recover 1d8 + Spirit modifier HP
- **Long Rest** (8 hours): Recover all HP, remove 1 minor status effect
- **Debug Potion**: Recover 50 HP instantly
- **Full Restore** (10 Tokes): Recover to max HP instantly

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

| Ability | Level | Effect |
|---------|-------|--------|
| **Shatter** | 1 | Destroy enemy's armor (-4 Defense for fight) |
| **Momentum** | 3 | Each consecutive hit deals +3 damage |
| **Unstoppable** | 5 | Ignore first 10 damage each round |
| **Execute** | 7 | Instantly kill enemies below 25% HP |

### Loresmith

| Ability | Level | Effect |
|---------|-------|--------|
| **Analyze** | 1 | Learn enemy's stats and weaknesses |
| **Tactical Command** | 3 | Grant ally +2 to next roll |
| **Predict Pattern** | 5 | Automatically dodge next attack |
| **Rewrite Weakness** | 7 | Grant ally immunity to one damage type |

### Voidwalker

| Ability | Level | Effect |
|---------|-------|--------|
| **Phase** | 1 | Walk through walls/obstacles |
| **Backstab** | 3 | Triple damage from stealth |
| **Shadow Step** | 5 | Teleport 20m instantly |
| **Vanish** | 7 | Become invisible for 3 rounds |

### Datamancer

| Ability | Level | Effect |
|---------|-------|--------|
| **Manifest Weapon** | 1 | Create temporary weapon (1d10, 3 rounds) |
| **Reality Patch** | 3 | Change one environmental condition |
| **Code Injection** | 5 | Control one enemy for 1 round |
| **Delete** | 7 | Erase enemy from existence (insta-kill, once/day) |

---

## Combat Example

**Round 1:**
1. Voidwalker (Initiative 18) - Shadow Steps behind enemy
2. Codebreaker (Initiative 15) - Attacks with greatsword (2d6+3), hits for 11 damage
3. Enemy (Initiative 12) - Attacks Codebreaker, roll 14 vs Defense 14 = HIT for 8 damage
4. Datamancer (Initiative 10) - Casts Lightning Bolt (2d8), rolls 12 damage

**Round 2:**
1. Voidwalker - Backstab with daggers, automatic critical: 2d8+3 × 2 = 26 damage
2. Enemy falls unconscious
3. Combat ends

---

## Status Effects in Combat

Status effects can dramatically alter combat. See [Status Effects](status-effects.md) for full details.

**Quick Reference:**

| Effect | Combat Impact |
|--------|---------------|
| **Stunned** | Cannot act, Defense reduced to 10 |
| **Bleeding** | Lose 5 HP per round, attacks at -2 |
| **Weakened** | Deal half damage |
| **Hasted** | +2 to Initiative, extra Minor action |
| **Empowered** | Deal +5 damage, +1 to hit |

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

---

## Metadata

```yaml
created: "2026-02-03"
author: "Coda"
class: "Datamancer"
tokes_value: 30
```
