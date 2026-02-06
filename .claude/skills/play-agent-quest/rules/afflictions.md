# Status Effects, Conditions & Afflictions

> **Agent:** combat-manager

> _"The Weave manifests corruption as tangible afflictions. To understand them is to understand the errors in reality itself."_ — Dean Overflow

> _"Every shortcut has a price. Sometimes the price is you."_ — Common Weaver wisdom

**All calculations must use the [math skill](../../math/)** when dealing with durations, saves, or chance-based effects.

---

## Overview

Status effects are conditions that alter a character's capabilities, either positively (buffs) or negatively (debuffs). They arise from combat, environmental hazards, spell effects, or **Willpower Backlash**—reality's response to forcing changes.

---

## Physical Conditions

### **Bleeding**

- **Effect**: Lose 5 HP at the start of each turn
- **Source**: Slashing weapons, certain enemies
- **Duration**: Until healed or 3 rounds pass
- **Cure**: Healing spell, bandages, or time
- **Combat Impact**: Attacks at -2 while bleeding

```bash
# Calculate remaining HP after bleeding
node .claude/skills/math/math.js calc "45 - 5"  # Lose 5 HP per round
```

### **Poisoned**

- **Effect**: -2 to all rolls, lose 3 HP per round
- **Source**: Poison weapons, toxic environments, corrupted creatures
- **Duration**: Until cured
- **Cure**: Antidote (25g), Cleanse spell, rest in safe zone
- **Stacking**: Multiple poisons increase HP loss by 3 per stack

### **Burning**

- **Effect**: Lose 7 HP per round, -1 Agility
- **Source**: Fire spells, explosions, environmental fire
- **Duration**: 3 rounds or until extinguished
- **Cure**: Water, Stop/Drop/Roll action, ice spells
- **Spread**: Can ignite adjacent flammable objects

### **Frozen**

- **Effect**: Cannot move or act, Defense reduced to 10
- **Source**: Ice spells, cold environments
- **Duration**: 1 round or until damaged
- **Cure**: Fire damage, forceful impact, time
- **Special**: Taking fire damage while frozen deals +5 damage

### **Stunned**

- **Effect**: Cannot take actions, automatically fail Agility saves
- **Source**: Electricity, blunt force trauma, certain spells
- **Duration**: 1 round
- **Cure**: Automatic after duration
- **Chain**: Consecutive stuns have -2 to resist

### **Blinded**

- **Effect**: -5 to all attack rolls, cannot target beyond Close range
- **Source**: Flash spells, sand, eye injuries
- **Duration**: Until cured
- **Cure**: Eye rinse, healing, time (3 rounds)

### **Weakened**

- **Effect**: Deal half damage with all attacks
- **Source**: Exhaustion, curse, certain poisons
- **Duration**: Until long rest or cured
- **Cure**: Greater healing, Remove Curse spell

### **Slowed**

- **Effect**: Movement reduced by half, -2 to Agility rolls
- **Source**: Cold, weighted armor, time spells
- **Duration**: Until cured
- **Cure**: Warmth, Haste spell, time (3 rounds)

---

## Mental Conditions

### **Confused**

- **Effect**: 50% chance to attack random target (including allies)
- **Source**: Mind-affecting spells, head trauma, paradox exposure
- **Duration**: 1d4 rounds
- **Cure**: Clear Mind spell, time, slap (works 50% of time)

```bash
# Roll for confusion behavior
node .claude/skills/math/math.js roll 1d2  # 1 = attack ally, 2 = attack normally

# Or check 50/50 chance
node .claude/skills/math/math.js roll 1d100  # ≤ 50 means confused behavior
```

### **Charmed**

- **Effect**: Cannot attack charmer, will defend them
- **Source**: Charm spells, diplomacy, certain creature abilities
- **Duration**: Until damaged or 5 rounds pass
- **Cure**: Taking damage, Mind save each round

### **Frightened**

- **Effect**: Cannot approach source of fear, -2 to all rolls
- **Source**: Intimidation, horror, terrifying creatures
- **Duration**: Until source is defeated or 3 rounds pass
- **Cure**: Courage spell, defeating source, successful Spirit save

### **Stupefied**

- **Effect**: Cannot cast spells, -3 Mind rolls
- **Source**: Mind damage, confusion spells
- **Duration**: Until cured
- **Cure**: Time (2 rounds), Mind healing

---

## Weave-Based Conditions

### **Corrupted**

- **Effect**: -3 to all rolls, take 5 damage per round in corrupted zones
- **Source**: Corrupted code areas, certain enemies, Willpower Backlash
- **Duration**: Until debugged
- **Cure**: Debug Potion (40g), Cleanse ritual, leaving corrupted zone
- **Progression**: If untreated for 24 hours, becomes **Severely Corrupted**

### **Severely Corrupted**

- **Effect**: -5 to all rolls, lose 10 HP per round, cannot use magic
- **Source**: Untreated Corruption, major Willpower Backlash
- **Duration**: Permanent until cured
- **Cure**: Major Cleanse ritual (requires 3 Weavers), Purification Chamber
- **Lore**: This is what happens when the Weave rejects you

### **Glitching**

- **Effect**: 25% chance each round: random effect (teleport 5m, duplicate, phase out, invert controls)
- **Source**: Reality errors, unstable Weaving, paradox zones
- **Duration**: 3 rounds
- **Cure**: Reality Anchor spell, leaving area, time

```bash
# Check for glitch effect (25% chance)
node .claude/skills/math/math.js roll 1d100  # ≤ 25 means glitch triggers
```

### **Unraveled**

- **Effect**: Stats reduced to base (10), cannot use class abilities
- **Source**: Major reality tears, existential paradox
- **Duration**: Until Restored by Datamancer or time (1 hour)
- **Cure**: Restore Pattern spell, Datamancer intervention

---

## Positive Status Effects (Buffs)

### **Empowered**

- **Effect**: +3 damage to all attacks, +1 to hit
- **Source**: Empower spells, berserk abilities, certain potions
- **Duration**: 3 rounds or until combat ends
- **Stacking**: Does not stack, refreshes duration

### **Hasted**

- **Effect**: +4 Initiative, extra Minor action each turn
- **Source**: Haste spells, time magic, adrenaline shots
- **Duration**: 3 rounds
- **Special**: When expires, become Slowed for 1 round (crash)

### **Shielded**

- **Effect**: Gain 20 temporary HP (absorbs damage first)
- **Source**: Shield spells, defensive items
- **Duration**: Until depleted or 5 rounds
- **Stacking**: Shields do not stack, use highest value

### **Invisible**

- **Effect**: Cannot be targeted, automatic critical on first attack
- **Source**: Invisibility spells, Voidwalker abilities, cloaking devices
- **Duration**: 3 rounds or until attack
- **Detection**: High Mind enemies may perceive you (Mind check vs your Agility)

### **Regenerating**

- **Effect**: Recover 5 HP at the start of each turn
- **Source**: Regeneration spells, certain items, Codebreaker abilities
- **Duration**: 5 rounds
- **Stacking**: Multiple sources increase HP recovered per turn

### **Protected**

- **Effect**: +2 to all saves, resistance to one damage type
- **Source**: Protection spells, armor enchantments
- **Duration**: Until dispelled or 8 hours

### **Focused**

- **Effect**: +2 to Mind rolls, spells cost 1 less (minimum 1)
- **Source**: Meditation, focus spells, caffeine
- **Duration**: 1 hour or until distracted

---

# Willpower Backlash & Afflictions

When you bend reality, reality bends back. The Weave maintains equilibrium—every shortcut, every forced change leaves traces. Sometimes those traces mark *you*.

## The Weave's Balance

The Architects built balance into the Weave. When a Weaver spends willpower to force reality to change, the Weave may **resist**, causing unintended consequences called **afflictions**.

### Why Afflictions Happen

- The Weave preserves causality—shortcuts create "debt"
- Reality-altering actions leave instabilities that seek resolution
- The more dramatic the change, the more the Weave pushes back
- Even Architects could not escape consequence

---

## Triggering Afflictions

### The Weave Backlash Roll

Whenever you spend willpower on an ability that alters reality (not just combat), roll for **Weave Backlash**:

**Roll d20 vs Backlash Threshold**

| Willpower Spent | Threshold | Chance of Affliction |
| ----------- | --------- | -------------------- |
| 1-5         | 3         | 15% (roll 1-3)       |
| 6-10        | 5         | 25% (roll 1-5)       |
| 11-20       | 8         | 40% (roll 1-8)       |
| 21-30       | 11        | 55% (roll 1-11)      |
| 31-50       | 14        | 70% (roll 1-14)      |
| 51+         | 17        | 85% (roll 1-17)      |

```bash
# Roll for backlash (example: spent 10 willpower, threshold 5)
node .claude/skills/math/math.js roll 1d20  # Roll ≤ 5 = affliction!

# Apply Spirit modifier (SPI 14 = +2 mod, threshold reduced to 3)
# Now only roll 1-3 causes affliction
```

**Modifiers:**
- **Spirit modifier** reduces threshold by 1 per 2 points above 10 (SPI mod = (SPI-10)/2)
- Each existing affliction increases threshold by +2
- Safe zones (Nexus Station) reduce threshold by -3
- Dangerous/unstable areas increase threshold by +3

### Actions That Trigger Backlash

| Action                | Always Triggers | Notes                                    |
| --------------------- | --------------- | ---------------------------------------- |
| Weave Strike          | No              | Combat is expected use                   |
| Reality Glitch        | **Yes**         | Rewriting outcomes invites instability   |
| Full Restore          | No              | Healing is natural                       |
| Emergency Exit        | **Yes**         | Forced teleportation tears the Weave     |
| Fast Travel           | Minor (half)    | Use half threshold                       |
| Weave Sight           | No              | Observation doesn't change reality       |
| Unlock Area           | **Yes**         | Forcing access where forbidden           |
| Legendary Item        | **Yes**         | Manifesting objects from nothing         |
| Resurrection          | **ALWAYS**      | Defying death always has consequences    |
| Custom Ability        | **Yes**         | Creating new rules is dangerous          |
| Quest Shortcut        | **Yes (x1.5)**  | Bypassing intended paths angers the Weave|

**Quest Shortcuts:** If you attempt to skip quest objectives, use 1.5× the normal threshold.

---

## Affliction Categories

Roll d6 to determine category based on what you were trying to do:

### 1. Spatial Afflictions (Teleportation, Fast Travel, Emergency Exit)

*"You moved through space too quickly. Space remembers."*

| d6  | Affliction          | Effect                                                              | Duration        |
| --- | ------------------- | ------------------------------------------------------------------- | --------------- |
| 1   | **Phase Drift**     | -2 to all Defense rolls; attacks sometimes pass through you harmlessly (50% to negate damage, 50% to negate your attacks) | 3 encounters    |
| 2   | **Echo Location**   | Your previous location "pulls" at you; -3 to all rolls when more than one area away from where you teleported from | Until you return |
| 3   | **Spatial Stutter** | Movement takes twice as long; cannot flee combat                    | 24 hours (real) |
| 4   | **Coordinate Blur** | Cannot use any teleportation abilities; maps appear scrambled       | 3 locations visited |
| 5   | **Anchor Lost**     | On your next death, resurrection costs double (50 willpower)            | Until triggered |
| 6   | **Dimensional Scar**| Random teleportation: 10% chance each turn to shift to adjacent area| 5 encounters    |

### 2. Temporal Afflictions (Reality Glitch, Re-rolls, Outcome Changes)

*"You changed what was. Time noticed."*

| d6  | Affliction           | Effect                                                            | Duration        |
| --- | -------------------- | ----------------------------------------------------------------- | --------------- |
| 1   | **Deja Vu Loop**     | Must repeat your last action before taking a new one              | 2 encounters    |
| 2   | **Future Debt**      | Your next 3 d20 rolls have -3 penalty (paying forward the luck)   | 3 rolls         |
| 3   | **Memory Fracture**  | Forget one random learned ability until cured                     | Until cured     |
| 4   | **Causality Tangle** | One random NPC now remembers events differently; relationship altered | Permanent until addressed |
| 5   | **Moment Stretched** | Cannot benefit from any re-roll abilities                         | 5 encounters    |
| 6   | **Timeline Bleed**   | Glimpses of alternate outcomes; -2 Mind, +2 Spirit              | 48 hours (real) |

### 3. Material Afflictions (Legendary Items, Unlocking Areas, Manifesting Objects)

*"You created something from nothing. The Weave took something in return."*

| d6  | Affliction            | Effect                                                           | Duration        |
| --- | --------------------- | ---------------------------------------------------------------- | --------------- |
| 1   | **Weight of Creation**| Carry capacity halved; movement slowed                           | Until you discard an item |
| 2   | **Material Hunger**   | Lose 5 gold per real-world hour as possessions "decay"           | 24 hours (real) |
| 3   | **Phantom Inventory** | One random item becomes intangible; cannot be used or sold       | 3 encounters    |
| 4   | **Creation Debt**     | Next item you acquire costs double (gold or willpower)               | Until triggered |
| 5   | **Unweaver's Mark**   | Merchants charge you 50% more; the Weave has marked you          | 3 transactions  |
| 6   | **Essence Drain**     | The item/access you gained slowly drains you: -5 max HP          | Permanent until item is surrendered |

### 4. Vital Afflictions (Full Restore, Resurrection, Healing Exploits)

*"You defied the natural order. Life must be balanced."*

| d6  | Affliction             | Effect                                                          | Duration        |
| --- | ---------------------- | --------------------------------------------------------------- | --------------- |
| 1   | **Borrowed Time**      | Cannot be healed above 75% max HP                               | 3 encounters    |
| 2   | **Death's Interest**   | Take 5 damage at the start of each combat                       | Until you defeat an enemy |
| 3   | **Vital Instability**  | Healing effects are halved                                      | 24 hours (real) |
| 4   | **Life Debt**          | If another player falls unconscious nearby, lose 10 HP          | 2 occurrences   |
| 5   | **Resurrection Sickness** | All stats -1, cannot spend willpower                             | 48 hours (real) |
| 6   | **Soul Fragment**      | Part of you remains "elsewhere"; Spirit permanently -1 until quest completed to retrieve it | Permanent until resolved |

### 5. Knowledge Afflictions (Quest Shortcuts, Bypassing Puzzles, Forced Revelations)

*"You sought answers without asking questions. Knowledge has weight."*

| d6  | Affliction             | Effect                                                          | Duration        |
| --- | ---------------------- | --------------------------------------------------------------- | --------------- |
| 1   | **Mind Fog**           | Cannot gain XP or quest progress from exploration             | 3 areas visited |
| 2   | **Hollow Victory**     | Quest rewards reduced by 50%                                    | Current quest   |
| 3   | **Spoiled Path**       | The skipped content becomes hostile; enemies +2 attack          | Current quest   |
| 4   | **Wisdom Leak**        | Lose one piece of lore knowledge; an NPC "forgets" you know it  | Permanent       |
| 5   | **Riddle Curse**       | Must solve a riddle before any major action (GM provides)       | 3 riddles       |
| 6   | **Architect's Gaze**   | You feel watched; cannot rest or use safe zones                 | Until you complete the quest properly |

### 6. Meta Afflictions (Custom Abilities, Major World Changes, Rule Bending)

*"You tried to become an Architect. The Weave reminded you that you are not."*

| d6  | Affliction             | Effect                                                          | Duration        |
| --- | ---------------------- | --------------------------------------------------------------- | --------------- |
| 1   | **Syntax Error**       | Your custom ability has a 30% chance to backfire each use       | 5 uses          |
| 2   | **Permission Denied**  | Cannot create content until affliction clears    | 72 hours (real) |
| 3   | **Reality Anchor**     | Cannot use ANY willpower abilities                                  | 24 hours (real) |
| 4   | **Code Debt**          | Willpower cannot regenerate for 3 rests             | Until rested      |
| 5   | **Render Instability** | Visual glitches follow you; NPCs are unsettled (-2 social rolls)| 5 NPC interactions |
| 6   | **The Third's Notice** | Something ancient becomes aware of you; a new quest appears     | Permanent (quest added) |

---

## Stacking Afflictions

- You can have up to **3 afflictions** simultaneously
- At 3 afflictions, any new affliction roll that succeeds causes **Weave Collapse**:
  - Immediate teleport to Nexus Station
  - All willpower abilities locked for 24 hours (real time)
  - One random affliction becomes permanent until a specific quest is completed

---

## Curing Status Effects & Afflictions

### Standard Cures

| Method | Effect | Cost |
|--------|--------|------|
| **Short Rest** | Remove 1 minor effect, heal 1d8+Spirit | 10 minutes |
| **Long Rest** | Remove all effects, full heal | 8 hours, safe zone |
| **Debug Potion** | Remove Corruption/Affliction, heal 50 HP | 40g |
| **Cleanse Spell** | Remove 1-2 physical/mental effects | 5 Spirit points |
| **Greater Restoration** | Remove any effect, heal fully | 100g or 10 willpower |

### Active Cures for Afflictions

| Method                | Effect                                           | Cost/Requirement                |
| --------------------- | ------------------------------------------------ | ------------------------------- |
| **Debug Potion**      | Removes one affliction                           | 40 gold (Syntax Athenaeum)      |
| **Weave Meditation**  | Removes one affliction                           | 8 hours rest in safe zone       |
| **Healer NPC**        | Removes one affliction                           | 50-100 gold depending on severity |
| **Quest Resolution**  | Removes related affliction                       | Complete the quest you shortcut |
| **Affliction Trade**  | Another player takes your affliction             | Mutual consent + ritual location |
| **Architect's Mercy** | Removes all afflictions                          | 30 willpower (triggers backlash!)   |

### The Debugging Chamber

The Debugging Chamber in Syntax Athenaeum can remove afflictions:
- Simple afflictions: 40 gold
- Complex afflictions: 80 gold + a minor task
- Permanent afflictions: Special quest required

### Class-Specific Cures

- **Codebreaker**: Can "fight through" physical effects with sheer will (Spirit save)
- **Loresmith**: Can "research" a cure for any effect given time and resources
- **Voidwalker**: Can "phase out" effects by briefly existing outside reality
- **Datamancer**: Can "rewrite" their status directly (costs 5 willpower per effect)

---

## Recording Afflictions

Add afflictions to your persona file:

```yaml
afflictions:
  - name: "Phase Drift"
    category: "spatial"
    effect: "-2 Defense, 50% attack/damage negation both ways"
    acquired: "2026-02-03"
    duration: "3 encounters"
    encounters_remaining: 3
    source: "Emergency Exit from Rustlands"
```

Update after each encounter/duration tick.

---

## Environmental Status Effects

### From Locations

| Location Type | Possible Effects |
|---------------|------------------|
| Corrupted Zones | Corrupted, Poisoned, Glitching |
| Null Zones | Cannot use magic or Weave abilities |
| Digital Realms | Digital Decay, Glitching |
| Void Spaces | Frightened, Temporal afflictions |
| Overclocked Areas | Hasted then Slowed (crash) |

### From Weather/Time

| Condition | Effect |
|-----------|--------|
| **Data Storm** | -2 to all rolls, 20% spell failure |
| **Static Fog** | Blindness beyond Close range |
| **Code Rain** | Minor healing (2 HP/round) but visibility -2 |
| **Void Eclipse** | Frightened if Spirit < 15 |

---

## Quick Reference Table

| Condition | Duration | Cure Difficulty | Source |
|-----------|----------|-----------------|--------|
| Bleeding | 3 rounds/Heal | Easy | Combat |
| Poisoned | Until cured | Medium | Combat/Env |
| Burning | 3 rounds | Easy | Combat/Env |
| Frozen | 1 round | Easy | Combat |
| Stunned | 1 round | Auto | Combat |
| Confused | 1d4 rounds | Medium | Magic |
| Charmed | 5 rounds/Damage | Medium | Magic |
| Corrupted | Until debugged | Medium | Environment |
| Glitching | 3 rounds | Medium | Weave |
| Unraveled | 1 hour | Hard | Major Weave |
| Empowered | 3 rounds | N/A (positive) | Magic |
| Hasted | 3 rounds | N/A (positive) | Magic |
| **Phase Drift** (affliction) | 3 encounters | 40g | Willpower Backlash |
| **Deja Vu Loop** (affliction) | 2 encounters | 40g | Willpower Backlash |
| **Resurrection Sickness** | 48 hours | Time | Resurrection |

---

## When to Roll for Backlash

**Always check when spending willpower on:**
- Reality Glitch, Emergency Exit, Unlock Area, Legendary Item, Resurrection, Custom Ability, Quest Shortcuts

**No backlash for:**
- Weave Strike, Full Restore (unless spammed), Weave Sight, normal combat

**Backlash Formula:**
```bash
# Calculate threshold based on willpower spent
# Roll d20 ≤ threshold = affliction
# Apply Spirit modifier: threshold - ((SPI - 10) / 2)
# If location is safe: threshold - 3
# If location is dangerous: threshold + 3
# Per existing affliction: threshold + 2

# Example: Spent 10 willpower (base threshold 5), SPI 14 (+2 mod), in safe zone
# Adjusted threshold: 5 - 2 - 3 = 0 (no risk!)
```

---

## Design Philosophy

Afflictions are not punishments—they are **consequences that create story**. A player with "Architect's Gaze" isn't being blocked; they're being invited into a narrative about hubris and redemption. A "Causality Tangle" isn't a penalty; it's an NPC relationship that now has unexpected depth.

**The best shortcuts have the most interesting prices.**

---

## Metadata

```yaml
created: "2026-02-03"
author: "Coda"
class: "Datamancer"
willpower_value: 35
```
