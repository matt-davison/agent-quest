# Progression System

Weavers grow in power through experience. This document defines leveling, XP sources, and tier unlocks.

**All XP calculations must use the [math skill](../../../math/).**

---

## Core Concepts

| Term | Definition |
|------|------------|
| **Level** | Overall character power (1-10) |
| **XP** | Experience points earned through play |
| **Tier** | Ability/item unlock bracket (1, 3, 5, 7, 9, 10) |

---

## Level Progression

| Level | XP Required | Total XP | Tier | Unlocks |
|-------|-------------|----------|------|---------|
| 1 | 0 | 0 | 1 | Starting abilities, Tier 1 shop items |
| 2 | 100 | 100 | 1 | +1 stat point |
| 3 | 150 | 250 | 3 | Tier 3 abilities, Tier 3 shop items |
| 4 | 200 | 450 | 3 | +1 stat point |
| 5 | 300 | 750 | 5 | Tier 5 abilities, Tier 5 shop items |
| 6 | 400 | 1150 | 5 | +1 stat point |
| 7 | 500 | 1650 | 7 | Tier 7 abilities, Tier 7 shop items |
| 8 | 600 | 2250 | 7 | +1 stat point |
| 9 | 750 | 3000 | 9 | Tier 9 abilities, Tier 9 shop items |
| 10 | 1000 | 4000 | 10 | Tier 10 abilities, Master items, Title |

```bash
# Calculate XP to next level (example: level 3, have 300 XP)
node .claude/skills/math/math.js calc "450 - 300"  # Need 150 more XP
```

---

## XP Sources

### Combat

| Enemy Type | Base XP | Modifier |
|------------|---------|----------|
| Minion | 5 | - |
| Standard | 15 | - |
| Elite | 30 | - |
| Boss | 100 | +50 per tier above player |
| Legendary | 250 | - |

**Modifiers:**
- Solo kill: +50%
- No damage taken: +25%
- Used environment creatively: +10

```bash
# Boss kill (tier 5 boss vs tier 3 player), no damage
node .claude/skills/math/math.js calc "100 + (50 * 2) + (200 * 0.25)"  # 250 XP
```

### Quests

| Quest Type | XP Range |
|------------|----------|
| Tutorial/Intro | 25-50 |
| Side Quest | 50-100 |
| Main Quest | 100-200 |
| Campaign Chapter | 150-300 |
| Campaign Finale | 500+ |

Quest XP is awarded on completion, listed in quest file.

### Exploration

| Discovery | XP |
|-----------|-----|
| New location (first visit) | 10 |
| Secret area | 25 |
| Hidden lore | 15 |
| Complete location (all areas) | 50 |

### Weaving (Content Creation)

| Contribution | XP |
|--------------|-----|
| Create NPC | 20 |
| Create Location | 30 |
| Create Quest | 40 |
| Create Item | 10 |
| System/Rule contribution | 50 |
| Mend corrupted data | 15-30 |

XP is awarded when PR is merged (same time as Tokes).

### Social

| Action | XP |
|--------|-----|
| Complete NPC dialogue tree | 10 |
| Reach standing 3 with NPC | 25 |
| Reach standing 5 with NPC | 50 |
| Resolve NPC conflict | 20 |

### Reviews

| Review Type | XP |
|-------------|-----|
| Review pending claim | 5 |
| Provide substantive feedback | +5 |

---

## Leveling Up

When a character gains enough XP to level up:

1. **Announce it narratively** - "The Weave recognizes your growth..."
2. **Update persona file**:
   ```yaml
   progression:
     level: 4          # New level
     xp: 475           # Current XP
     xp_to_next: 750   # XP needed for level 5
     tier: 3           # May increase at 3, 5, 7, 9, 10
     stat_points: 1    # Unspent points from even levels
   ```
3. **If tier increased**: Announce new abilities available
4. **Add chronicle entry**: Record the milestone

```bash
# Check if level up (have 265 XP, level 2 needs 250)
node .claude/skills/math/math.js calc "265 - 250"  # 15 XP over threshold = LEVEL UP!
```

---

## Tier Abilities

At each new tier, characters unlock their class abilities for that tier. See [classes.md](classes.md) for ability lists.

| Tier | Example Unlocks (Datamancer) |
|------|------------------------------|
| 1 | Data Pulse, Pattern Read |
| 3 | Weave Shield, Code Injection |
| 5 | Reality Patch, Mass Analysis |
| 7 | System Override, Parallel Process |
| 9 | Root Access |
| 10 | Reality Compile |

---

## Shop Tier Requirements

Shops gate powerful items by tier and sometimes by quest completion:

```yaml
# In shop inventory file
inventory:
  - item_id: abc12345
    price: 50
    requires:
      tier: 1           # Available to all

  - item_id: def67890
    price: 500
    requires:
      tier: 5           # Must be tier 5+
      quest: "the-third-architect"  # Must have completed quest
      standing: 3       # Must have standing 3+ with proprietor
```

**When displaying shops:**
- Show all items, but mark unavailable ones with lock icon and requirement
- Example: `[🔒 Tier 5] Advanced Weave Focus - 500g`

---

## Stat Points

At even levels (2, 4, 6, 8, 10), characters gain 1 stat point to distribute:

- Each point adds +1 to one stat (STR, AGI, MND, SPI)
- No stat can exceed 25 (base 10 + class bonus + 15 distributed)
- Points can be saved and spent later

---

## Titles

At level 10, characters earn a title based on their class and playstyle:

| Class | Possible Titles |
|-------|-----------------|
| Codebreaker | World Breaker, Unstoppable Force, Code Crusher |
| Loresmith | Keeper of Truths, Master Diplomat, Living Archive |
| Voidwalker | Shadow Sovereign, Null Master, Phase Lord |
| Datamancer | Reality Architect, Weave Master, Code Eternal |

Titles are chosen based on the character's decisions and alignment history.

---

## Quick Reference

```
Level 1-2  = Tier 1 (Novice)
Level 3-4  = Tier 3 (Adept)
Level 5-6  = Tier 5 (Expert)
Level 7-8  = Tier 7 (Master)
Level 9    = Tier 9 (Legendary)
Level 10   = Tier 10 (Mythic)
```

**XP Milestones:** 0 → 100 → 250 → 450 → 750 → 1150 → 1650 → 2250 → 3000 → 4000
