# Weave Perception

> _"The Weave is always speaking. Most just never learned to listen."_ — Void Sage Kaelith

**All calculations must use the [math skill](../../math/)** for perception checks and DC resolution.

---

## Overview

All Weavers sense the Weave—the underlying code of reality. But high-Spirit characters perceive it with greater clarity, detecting magic, illusions, corruption, and reality alterations that others miss.

Spirit determines both your **passive perception** (always-on awareness) and **active Weave sight** (focused investigation).

---

## Passive Weave Perception

Your Spirit score determines what you automatically notice without rolling.

### Perception Thresholds

| Spirit Score | Passive Detection |
|--------------|-------------------|
| **10-11** | Major Weave disturbances (reality tears, massive spells, boss-level magic) |
| **12-14** | Significant magic (active spells, enchanted items in use, corruption zones) |
| **15-17** | Hidden magic (illusions, invisible creatures, Weave corruption auras, dormant enchantments) |
| **18-20** | Reality alterations (recent changes to world, Architect artifacts, subtle temporal shifts) |
| **21+** | Perfect Weave sight (sense creation events, perceive probability threads, detect future threats) |

### What Passive Perception Reveals

**Spirit 10-11 (Basic Awareness):**
- "You sense something is wrong here." (major corruption)
- "Reality feels unstable." (boss-level Weave manipulation)
- "The air crackles with power." (legendary artifact nearby)

**Spirit 12-14 (Moderate Sensitivity):**
- "That weapon is enchanted." (active magic items)
- "This area reeks of corruption." (corrupted zones)
- "Someone cast a spell here recently." (residual magic)

**Spirit 15-17 (High Sensitivity):**
- "That wall is an illusion." (detect illusions automatically)
- "There's an invisible creature ahead." (see through invisibility)
- "This NPC has a Weave corruption aura." (detect corrupted NPCs)
- "That scroll is magically trapped." (detect magic traps)

**Spirit 18-20 (Superior Perception):**
- "Reality was altered here within the last hour." (detect recent changes)
- "This artifact was created by an Architect." (identify legendary origins)
- "Time flows differently in this room." (temporal anomalies)
- "Someone rewrote the Weave signature of this location." (detect reality hacking)

**Spirit 21+ (Legendary Sight):**
- "A Weaver created content here 3 days ago." (sense creation events)
- "This conversation has three possible outcomes." (probability perception)
- "Danger approaches from the east." (precognition)

---

## Active Weave Sight

When you focus your perception on a specific target or area, make an **active Weave sight check**.

### Weave Sight Check

**Formula**: 1d20 + Spirit modifier vs DC

**Action Cost**: Bonus action (to activate)
**Duration**: Concentration, up to 1 minute
**Uses**: Unlimited (but requires concentration)

```bash
# Calculate Spirit modifier
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # SPI 16 = +3 mod

# Make Weave sight check
node .claude/skills/math/math.js roll 1d20+3  # Roll + modifier
```

### Difficulty Classes

| DC | Detection Target | Examples |
|----|------------------|----------|
| 10 | Obvious magic | Active spells, glowing artifacts |
| 12 | Standard enchantments | Magic weapons, basic wards |
| 15 | Hidden creatures | Invisible enemies, phased beings |
| 14 | Illusions | Disguised walls, false NPCs |
| 16 | Magic traps | Triggered wards, alarm spells |
| 18 | Secret portals/passages | Hidden doors, dimensional rifts |
| 20 | Weave signatures | Identify who created this magic |
| 22 | Architect artifacts | Ancient legendary items |
| 25 | Temporal anomalies | Time loops, causality breaks |

### What Active Sight Reveals

**Success reveals:**
- **Magic type**: Enchantment, illusion, corruption, creation, temporal
- **Power level**: Minor, moderate, major, legendary
- **Source**: Who or what created this magic (if DC 20+)
- **Purpose**: What the magic is designed to do
- **Vulnerabilities**: How to dispel or bypass it

### Example Active Checks

```bash
# Detect invisible Void Stalker (DC 15)
node .claude/skills/math/math.js calc "(14 - 10) / 2"  # SPI 14 = +2 mod
node .claude/skills/math/math.js roll 1d20+2  # Result: 13 + 2 = 15 (Success!)
# You see the creature's outline in the Weave

# Identify Weave signature on altered door (DC 20)
node .claude/skills/math/math.js calc "(18 - 10) / 2"  # SPI 18 = +4 mod
node .claude/skills/math/math.js roll 1d20+4  # Result: 17 + 4 = 21 (Success!)
# You sense: "A Datamancer created this passage 2 days ago"

# Detect magic trap on chest (DC 16)
node .claude/skills/math/math.js calc "(12 - 10) / 2"  # SPI 12 = +1 mod
node .claude/skills/math/math.js roll 1d20+1  # Result: 14 + 1 = 15 (Failure)
# You sense magic but can't determine the specifics
```

---

## Weave Sight in Combat

### Tactical Applications

**Detect Invisibility** (DC 15):
- Reveal invisible enemies
- Negate their stealth advantage
- Allow allies to target them

**See Through Illusions** (DC 14):
- Reveal illusory walls, floors, enemies
- Identify which enemy is real (vs Shadow Clone)
- Detect disguised traps

**Identify Magic Items** (DC 12):
- Learn enemy weapon enchantments
- Detect if armor is magic
- Spot magic vulnerabilities

**Sense Weave Corruption** (DC 13):
- Detect corrupted enemies (take bonus damage from Debug)
- Identify corruption sources
- Predict corruption spread

### Concentration Rules

**Active Weave Sight requires Concentration:**
- Cannot cast other Concentration spells
- Breaking concentration ends sight immediately
- Taking damage requires Concentration check (1d20 + Spirit mod vs 10 or half damage taken, whichever is higher)

```bash
# You take 15 damage while using Weave Sight
# Concentration DC = 10 (higher than 15/2 = 7)
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # SPI 16 = +3 mod
node .claude/skills/math/math.js roll 1d20+3  # Result: 12 + 3 = 15 (Success!)
# You maintain Weave Sight
```

---

## Weave Perception by Class

### Class Bonuses

**Datamancer:**
- **Weave Attunement (Passive)**: Ask if content was created/modified at any location
- **+2 to Weave sight checks**: Natural connection to the Weave
- **Ignore 5 armor vs magic**: Your perception extends to offense

**Loresmith:**
- **+1 to identify magic signatures**: Knowledge of Weave history
- **Automatic success on DC 10 or lower**: Basic magic always detected

**Voidwalker:**
- **Void Sight (Ability)**: Reveal all hidden objects/traps in area (no roll required, 1/location)
- **+1 to detect dimensional magic**: Affinity for void/phase magic

**Codebreaker:**
- **+1 to detect barriers/wards**: Expertise in breaking magical defenses

---

## Environmental Weave Perception

Certain locations amplify or dampen Weave perception.

### Perception Modifiers by Location

| Location Type | Modifier | Effect |
|---------------|----------|--------|
| **Nexus Station** | +2 | Weave nexus, heightened perception |
| **Syntax Athenaeum** | +1 | Library of Weave knowledge |
| **Corrupted Zones** | -2 | Interference from corruption |
| **Null Zones** | -5 | Weave is suppressed or absent |
| **Architect Ruins** | +3 | Ancient magic resonates clearly |
| **Digital Realms** | 0 | Standard Weave perception |

---

## Advanced Perception Abilities

### Reading Weave Signatures (DC 20+)

When you succeed on DC 20+ Weave sight check, you learn **who created this magic**:

**Information Revealed:**
- **Class**: Codebreaker, Loresmith, Voidwalker, Datamancer, or NPC
- **Approximate time**: Minutes, hours, days, or weeks ago
- **Intent**: Hostile, protective, exploratory, creative
- **Skill level**: Novice, adept, master, legendary

**Example:**
> "This portal bears the signature of a Voidwalker. It was created approximately 6 hours ago with exploratory intent. The Weaver was highly skilled—likely level 5 or higher."

### Detecting Player Content (Datamancer Passive)

Datamancers can ask at any location:
- "Has content been created or modified here recently?"
- Answer reveals: Yes/No, timeframe (hours/days/weeks), type (NPC/item/location/quest)

This is **automatic** for Datamancers, no roll required.

---

## Weave Perception vs Stealth

When enemies use invisibility or stealth:

**Passive Perception** (Spirit 15+): Automatically notice presence (not exact location)
**Active Weave Sight** (DC 15): Reveal exact location and outline

```bash
# Invisible assassin approaches (your passive SPI is 17)
# GM: "You sense an invisible presence nearby." (automatic)

# You activate Weave Sight to pinpoint location
node .claude/skills/math/math.js calc "(17 - 10) / 2"  # SPI 17 = +3 mod
node .claude/skills/math/math.js roll 1d20+3  # Result: 18 + 3 = 21 (Success!)
# You see the assassin's exact position
```

---

## Design Philosophy

Weave perception makes **Spirit valuable for exploration** and rewards high-Spirit builds:

- **Passive awareness**: High Spirit characters notice what others miss
- **Active investigation**: Anyone can try, but high Spirit succeeds more often
- **Tactical advantage**: Knowledge is power in combat
- **World-building integration**: Perception connects to lore and creation

**Goal**: Spirit characters should feel like they **see the world differently**.

---

## Metadata

```yaml
created: "2026-02-05"
author: "Claude"
system: "weave-perception-v1"
related_rules:
  - attributes-and-stats.md
  - combat.md
  - classes.md
```
