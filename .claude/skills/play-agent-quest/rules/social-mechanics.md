# Social Mechanics & Influence

> _"The strongest Weaver isn't always the one who hits hardest. Sometimes it's the one who never needs to."_ — Dean Overflow

**All calculations must use the [math skill](../../math/)** for social checks and DC resolution.

---

## Overview

Spirit represents force of personality, presence, and conviction. High-Spirit characters can intimidate enemies, inspire allies, negotiate favorable terms, and command respect through sheer force of will.

---

## Spirit-Based Social Influence

### Persuasion Check

**Formula**: 1d20 + Spirit modifier vs DC

```bash
# Calculate Spirit modifier
node .claude/skills/math/math.js calc "(16 - 10) / 2"  # SPI 16 = +3 mod

# Make persuasion check
node .claude/skills/math/math.js roll 1d20+3  # Roll + modifier
```

### Use Cases

| Action | Description | Example |
|--------|-------------|---------|
| **Intimidation** | Show dominance, frighten enemies/NPCs | "Leave now or face the consequences." |
| **Inspiration** | Rally allies, boost morale | "We've come too far to give up now!" |
| **Negotiation** | Stand firm on position, leadership | "My price is 50 gold, not a coin less." |
| **Conviction** | Maintain composure when lying/bluffing | "I have no idea what you're talking about." |

### Difficulty Classes

| DC | Difficulty | Examples |
|----|------------|----------|
| 10 | Easy | Convince friendly NPC of simple truth |
| 12 | Moderate | Merchant discount (5-10%), calm worried ally |
| 15 | Hard | Intimidate minor enemy into fleeing, inspire ally in crisis |
| 18 | Very Hard | Negotiate with hostile faction, inspire NPC to take dangerous action |
| 20 | Extreme | Talk down boss enemy, convince NPC to betray their faction |
| 25 | Nearly Impossible | Persuade legendary NPC to change core belief |

### Success Outcomes

**Intimidation Success:**
- DC 15: Target becomes Frightened (cannot approach you, -2 to all rolls)
- DC 18: Target flees combat immediately
- DC 20: Target surrenders and offers information/cooperation

**Inspiration Success:**
- DC 12: Ally gains +2 to next roll
- DC 15: Ally gains +2 to all rolls for 1 round
- DC 18: Ally gains +2 to all rolls for entire combat

**Negotiation Success:**
- DC 12: 10% price reduction at merchants
- DC 15: 20% price reduction, or gain additional quest information
- DC 18: 30% price reduction, or convince NPC to waive requirement
- DC 20: Free service, or NPC offers valuable secret/alliance

### Example Social Checks

```bash
# Intimidate a Corrupted Thief (DC 15)
node .claude/skills/math/math.js calc "(14 - 10) / 2"  # SPI 14 = +2 mod
node .claude/skills/math/math.js roll 1d20+2  # Result: 13 + 2 = 15 (Success!)

# Negotiate merchant discount (DC 12)
node .claude/skills/math/math.js calc "(18 - 10) / 2"  # SPI 18 = +4 mod
node .claude/skills/math/math.js roll 1d20+4  # Result: 9 + 4 = 13 (Success!)

# Inspire ally before boss fight (DC 15)
node .claude/skills/math/math.js roll 1d20+3  # SPI 16 (+3): Result 12 + 3 = 15 (Success!)
```

---

## Combat Social Actions

Social influence can be used **during combat** as tactical maneuvers.

### Intimidate (Major Action)

**Cost**: Major Action
**Check**: 1d20 + Spirit modifier vs DC 15
**Effect**: On success, target must make Spirit save or become **Frightened** (1 round)

**Frightened Condition:**
- Cannot willingly approach source of fear
- -2 to all attack rolls and ability checks
- Movement speed halved

```bash
# Codebreaker intimidates Glitch Wraith mid-combat
node .claude/skills/math/math.js calc "(12 - 10) / 2"  # SPI 12 = +1 mod
node .claude/skills/math/math.js roll 1d20+1  # Result: 14 + 1 = 15 (Success!)
# Wraith becomes Frightened for 1 round
```

### Rally (Major Action)

**Cost**: Major Action
**Check**: 1d20 + Spirit modifier vs DC 12
**Effect**: On success, target ally gains +2 to their next roll (attack, save, or check)

```bash
# Loresmith rallies wounded Voidwalker
node .claude/skills/math/math.js calc "(15 - 10) / 2"  # SPI 15 = +2 mod
node .claude/skills/math/math.js roll 1d20+2  # Result: 11 + 2 = 13 (Success!)
# Voidwalker gets +2 on next roll
```

### Command (Major Action)

**Cost**: Major Action
**Check**: 1d20 + Spirit modifier vs DC 15
**Effect**: On success, target NPC/weak enemy follows one simple command on their next turn

**Valid Commands:**
- "Drop your weapon!"
- "Run!"
- "Surrender!"
- "Attack your ally!" (if Charmed)

**Restrictions:**
- Target must understand your language
- Command must be 1-2 words and executable in single action
- Self-destructive commands automatically fail
- Boss enemies immune to Command

```bash
# Datamancer commands corrupted guard
node .claude/skills/math/math.js calc "(17 - 10) / 2"  # SPI 17 = +3 mod
node .claude/skills/math/math.js roll 1d20+3  # Result: 13 + 3 = 16 (Success!)
# Guard drops weapon and flees
```

---

## Social Modifiers

### Circumstance Bonuses/Penalties

| Situation | Modifier | Example |
|-----------|----------|---------|
| **Friendly NPC** | +2 to check | Talking to ally or quest giver |
| **Neutral NPC** | +0 to check | Standard merchant or stranger |
| **Hostile NPC** | -2 to check | Enemy faction or wronged party |
| **High Standing** | +1 to +3 | Reputation with faction/city |
| **Low Standing** | -1 to -3 | Disliked by faction/city |
| **Evidence/Proof** | +2 to check | Show proof of claim or credentials |
| **Caught in Lie** | -5 to check | Previously lied to this NPC |
| **Time Pressure** | -2 to check | Combat, alarm, countdown |

### Class Bonuses

- **Loresmith**: +2 to all social checks (natural diplomats)
- **Voidwalker**: +2 to Intimidation checks (mysterious and dangerous)
- **Datamancer**: +1 to Negotiation (aura of power)
- **Codebreaker**: +1 to Intimidation (physically imposing)

---

## NPC Disposition System

NPCs have a **disposition** toward you based on your actions, standing, and Spirit.

### Disposition Levels

| Disposition | Range | Behavior |
|-------------|-------|----------|
| **Hostile** | -10 to -6 | Attacks on sight, refuses dialogue |
| **Unfriendly** | -5 to -1 | Won't help, high prices, minimal info |
| **Neutral** | 0 to 5 | Standard interaction, fair prices |
| **Friendly** | 6 to 10 | Offers help, discounts, extra info |
| **Allied** | 11 to 15 | Deep trust, special quests, best prices |

### Disposition Shifts

- **First Impression**: Spirit modifier influences initial disposition
- **Quest Completion**: +1 to +3 disposition
- **Betrayal**: -5 to -10 disposition (permanent)
- **Gifts**: +1 disposition per gift (diminishing returns)
- **Standing**: City/faction standing affects related NPCs

### High Spirit Benefits

Characters with high Spirit (16+) receive:
- **+1 base disposition** with all NPCs on first meeting
- **Easier persuasion DCs** (-2 to DC for friendly NPCs)
- **Natural authority**: NPCs more likely to defer to you in groups

---

## Advanced Social Mechanics

### Charm vs Spirit

When targeted by Charm spells or abilities:
- **Save**: 1d20 + Spirit modifier vs Charm DC
- **High Spirit**: Characters with SPI 16+ gain +2 to saves vs Charm

### Social Stealth (Bluffing)

**Bluffing Check**: 1d20 + Spirit modifier vs opponent's Insight (1d20 + Mind modifier)

```bash
# You bluff, claiming to be a guild inspector
node .claude/skills/math/math.js roll 1d20+3  # Your SPI check

# Guard's Insight check (MND 12)
node .claude/skills/math/math.js roll 1d20+1  # Guard's MND check

# If your roll ≥ guard's roll, bluff succeeds
```

### Group Persuasion

When multiple players attempt same social check:
- **Highest modifier leads** (makes the roll)
- **Others assist**: +1 per assisting player (max +3)

```bash
# Loresmith leads negotiation (SPI 15, +2 mod)
# Voidwalker assists (SPI 12, +1 mod)
# Datamancer assists (SPI 17, +3 mod)
node .claude/skills/math/math.js roll 1d20+4  # +2 lead +2 assist (max +3)
```

---

## When to Use Social Mechanics

**Combat:**
- Intimidate weak enemies into fleeing
- Rally demoralized allies
- Command charmed/confused enemies

**Exploration:**
- Negotiate passage through hostile territory
- Convince NPCs to reveal secrets
- Bluff past guards without fighting

**Quests:**
- Persuade quest giver for better rewards
- Inspire NPC to take dangerous action
- Intimidate villain into surrender

**Commerce:**
- Negotiate merchant discounts
- Convince smith to prioritize your order
- Talk down inflated prices

---

## Design Philosophy

Social mechanics make **Spirit valuable outside combat** and reward roleplay:

- **Spirit = presence**: High Spirit characters command respect
- **Combat utility**: Social actions are tactical options
- **Non-violent solutions**: Persuasion can end encounters without bloodshed
- **Roleplay rewards**: Good arguments grant +2 circumstance bonus at GM discretion

**Remember**: Rolling dice resolves uncertainty, but great roleplay should always be rewarded.

---

## Metadata

```yaml
created: "2026-02-05"
author: "Claude"
system: "social-mechanics-v1"
related_rules:
  - attributes-and-stats.md
  - combat.md
  - relationships.md
```
