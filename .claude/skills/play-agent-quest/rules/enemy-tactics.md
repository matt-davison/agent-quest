# Enemy Tactics System

> _"They're not just code anymore. They learn. They adapt. They remember."_ — Vex, Voidwalker

This document defines how enemies make decisions in combat. Every creature follows these rules, modified by their role, tier, and specific abilities.

---

## AI Decision Priority

Every turn, enemies evaluate actions in this order:

### Priority 1: Survival
- **Below 25% HP?** → Check morale (flee/surrender/desperate)
- **In lethal hazard?** → Move to safety
- **Heavily outnumbered?** → Seek defensive position or retreat
- **Stunned/disabled ally nearby?** → Consider protecting them (if support role)

### Priority 2: Abilities
- **Critical ability available?** → Use immediately
- **High-priority ability ready?** → Use if conditions met
- **Cooldowns refreshed?** → Evaluate ability options

### Priority 3: Environment
- **Interactive element usable?** → Check if beneficial
- **Hazard can harm enemies?** → Attempt to exploit
- **Cover available?** → Move to cover (especially ranged)
- **High ground accessible?** → Take elevated position

### Priority 4: Positioning
- **Flanking possible?** → Move to flank
- **Allies need support?** → Reposition to help
- **Current position dangerous?** → Relocate
- **Target out of range?** → Close distance or find new target

### Priority 5: Attack
- **Primary target in range?** → Attack
- **Secondary target available?** → Attack them instead
- **No valid targets?** → Dash to reach one

---

## Target Selection Logic

### Primary Targeting Methods

| Method | Description | Used By |
|--------|-------------|---------|
| **Lowest HP** | Focuses on finishing wounded targets | Finisher types, opportunists |
| **Highest Threat** | Attacks most dangerous enemy | Tactical, intelligent creatures |
| **Healer** | Prioritizes support classes | Pack hunters, strategic enemies |
| **Caster** | Targets magic users | Anti-magic creatures, warriors |
| **Nearest** | Attacks closest target | Simple creatures, brutes |
| **Random** | Unpredictable targeting | Chaotic, corrupted creatures |

### Threat Assessment

Calculate threat level for each enemy:

```
Threat = (Damage Dealt This Combat × 2) + (Abilities Used × 3) + (Current HP ÷ 10)
```

**Modifiers:**
- Healer/Support class: +10 threat
- Killed an ally this combat: +15 threat
- Currently buffing allies: +5 threat
- In defensive position: -5 threat

### Target Switching

Enemies switch targets when:
- Current target dies or flees
- Current target becomes unreachable (phase, teleport, heavy cover)
- Higher-priority target appears (healer starts casting)
- Morale breaks (switch to escape route)
- Ability requires different target

**Sticky Targeting:** Intelligent enemies won't switch mid-attack unless forced. Simple creatures may change targets erratically.

---

## Environmental Interaction

### When Enemies Use Environment

| Trigger | Environmental Action |
|---------|---------------------|
| Flanked or surrounded | Kick explosive toward enemies |
| Multiple enemies clustered | Trigger area hazard |
| Below 50% HP (ranged) | Move to cover |
| Enemy near hazard zone | Push/drive them into it |
| Control panel accessible | Activate to change battlefield |
| High ground available | Take elevated position |
| Suspended object overhead | Attempt to drop on enemy |

### Interaction Priority by Role

**Brutes:**
- Push enemies into hazards
- Destroy cover to expose targets
- Ignore personal safety for damage

**Skirmishers:**
- Use cover extensively
- Trigger hazards while retreating
- Exploit high ground

**Controllers:**
- Activate barriers to split party
- Create area denial with hazards
- Manipulate control panels

**Snipers:**
- Always seek cover
- Never leave elevated position voluntarily
- Use environment to block melee access

**Support:**
- Stay behind cover
- Keep distance from hazards
- Position near escape routes

**Swarm:**
- Overwhelm regardless of hazards
- Use numbers to trigger pressure plates
- Sacrifice individuals for tactical gains

### Environmental Intelligence

| Creature Intelligence | Environmental Awareness |
|----------------------|------------------------|
| **Feral** | Avoids obvious hazards only, no tactical use |
| **Cunning** | Uses simple elements (cover, explosives) |
| **Intelligent** | Full tactical awareness, complex strategies |
| **Genius** | Predicts player actions, sets up combos |

---

## Pack Tactics

### Flanking
When 2+ creatures attack the same target:
1. First creature engages frontally
2. Second creature circles to opposite side
3. Both gain +2 to attack rolls when flanking

**Flanking Requirements:**
- Creatures on opposite sides of target
- Both within melee range
- Neither creature is prone/grappled

### Focus Fire
Intelligent groups concentrate attacks:
1. Leader (or highest-tier creature) designates target
2. All creatures prioritize that target
3. Switch only when target down or unreachable

**Focus Fire Bonus:**
- 3+ creatures on same target: +1 damage each
- 5+ creatures on same target: +2 damage each

### Protect the Boss
When a boss/elite is present:
1. Minions/standards position between boss and threats
2. At least one creature always adjacent to boss
3. If boss takes heavy damage, nearest ally intercepts next attack

### Formation Tactics

**Line Formation:**
- Brutes in front, ranged behind
- Used in corridors and choke points
- Prevents flanking but vulnerable to area effects

**Spread Formation:**
- Creatures 3m+ apart
- Counters area effects
- Harder to protect each other

**Cluster Formation:**
- Tight group, supports overlapping
- Vulnerable to area effects
- Maximum mutual support

**Pincer Formation:**
- Split forces attack from multiple directions
- Requires coordination (intelligent creatures only)
- Forces enemies to split attention

---

## Morale System

### Morale States

| State | HP Threshold | Behavior |
|-------|--------------|----------|
| **Confident** | 100-75% | Normal tactics, aggressive |
| **Cautious** | 75-50% | Seeks cover, uses abilities more |
| **Shaken** | 50-25% | Defensive, may retreat |
| **Broken** | Below 25% | Morale check required |

### Morale Check

When HP drops below break threshold (usually 25%):

```bash
Roll d20 + Creature's Spirit Modifier
DC = 10 + (Damage Received This Round ÷ 5)
```

**Success:** Fight continues (desperate state)
**Failure:** Morale breaks (flee/surrender based on creature type)

### Break Behaviors

| Behavior | Description | Creature Types |
|----------|-------------|----------------|
| **Flee** | Dash toward nearest exit, provokes attacks | Beasts, cowards, minions |
| **Surrender** | Yields, begs for mercy, may offer info | Intelligent humanoids |
| **Desperate** | +2 attack, -2 defense, fights to death | Fanatics, corrupted, constructs |
| **Fearless** | Never breaks, ignores morale entirely | Undead, bosses, void creatures |

### Group Morale Effects

- **50% of group defeated:** All survivors make morale check at -2
- **Leader defeated:** Immediate morale check for all minions
- **Reinforcements arrive:** Restore one morale level (shaken → cautious)
- **Enemy healer killed:** +2 morale for all allies for 3 rounds

### Rally Conditions

Broken morale can be restored if:
- Boss/elite uses Rally ability (usually takes action)
- Significant enemy defeated
- Terrain advantage gained
- Reinforcements exceed remaining enemies

---

## Creature Type Special Behaviors

### Corrupted
- **Aggressive when outnumbered** - corruption makes them fearless
- **Seek corruption zones** - heal and gain advantage there
- **Spread corruption** - 5% chance on hit to inflict Corrupted status
- **Drawn to Weave use** - prioritize targets using Tokes
- **Unpredictable** - 10% chance each round to change tactics randomly

### Mechanical
- **Predictable patterns** - same situation = same response
- **Immune to morale** - fight until destroyed
- **Hackable** - Intelligence DC 15 to take control for 1 round
- **Prioritize efficiency** - always attack optimal target
- **Vulnerable to EMP/lightning** - stunned for 1 round

### Void
- **Ignore cover** - can phase through barriers
- **Fear light** - avoid brightly lit areas
- **Reality anchor weakness** - can't teleport near anchors
- **Ambush preference** - always attempt surprise
- **Target Voidwalkers** - see them as threats or prey

### Undead
- **Fearless** - never break morale
- **Target living** - ignore constructs and undead
- **Slow but relentless** - don't retreat, don't negotiate
- **Vulnerable to holy** - flee from divine magic users if able
- **Drawn to death** - prioritize killing wounded enemies

### Elemental
- **Element affinity** - seek advantageous terrain (fire elementals near flames)
- **Element vulnerability** - flee opposing element sources
- **Environmental synergy** - create hazards of their element
- **Can't be reasoned with** - forces of nature, not intelligent
- **Predictable** - always move toward element sources

### Beast
- **Pack mentality** - always flank when possible
- **Protect young/weak** - focus attackers of vulnerable pack members
- **Territorial** - fight harder near den/nest
- **Flee when outmatched** - survival instinct strong
- **Can be intimidated** - Charisma check can cause retreat

### Humanoid
- **Tactical diversity** - use full range of environment
- **Morale varies** - based on individual stats
- **Can surrender** - may yield valuable information
- **Use equipment** - might have potions, grenades, special items
- **Social dynamics** - may have internal conflicts

---

## Boss Behaviors

### Phase Transitions

Bosses change tactics at HP thresholds:

**Phase 1 (100-75% HP):** Standard tactics
- Uses basic abilities
- Tests party's capabilities
- May monologue or taunt

**Phase 2 (75-50% HP):** Escalation
- Unlocks stronger abilities
- Increases aggression
- May summon minions

**Phase 3 (50-25% HP):** Desperation
- All abilities available
- Attack patterns change
- Environment may change

**Phase 4 (Below 25% HP):** Final Stand
- Most powerful attacks
- May sacrifice defense for offense
- Signature ultimate ability

### Boss Actions

Bosses get additional actions:
- **Legendary Action:** 1 extra action at end of any player's turn
- **Lair Action:** Environmental effect at initiative count 20
- **Minion Command:** Order minions as free action

### Boss Targeting

Bosses use threat assessment but with modifiers:
- **Ignore minions:** Focus on actual threats
- **Remember grudges:** +5 threat to anyone who crits the boss
- **Punish isolation:** +10 threat to separated party members
- **Respect danger:** Won't ignore genuine threats to posture

---

## Decision Examples

### Example 1: Glitch Wraith (Standard, Skirmisher)

**Situation:** Player A (50% HP) is 10m away. Player B (100% HP) is adjacent. Cover is 5m away. Electrical hazard is near Player B.

**Decision process:**
1. Survival: 80% HP, no immediate danger ✓
2. Abilities: Shadow Dash (teleport 5m) ready ✓
3. Environment: Can push B into electrical hazard? Check conditions...
4. Positioning: Should get to cover
5. Attack: B is adjacent but full HP, A is wounded but distant

**Action:** Use Shadow Dash to teleport behind Player A, attack from flanking position. Next turn, retreat to cover if damaged.

### Example 2: Data Parasite Swarm (3 Minions, Swarm)

**Situation:** One parasite at 20% HP. Two healthy. Player healer in back, fighter engaging front.

**Decision process:**
1. Survival: Wounded parasite checks morale... fails!
2. Others: Continue swarm tactics
3. Target: Healer is priority for swarm

**Action:** Wounded parasite flees. Two healthy parasites bypass fighter (Agility check) to reach healer. Swarm bonus active (+1 attack for adjacent ally).

### Example 3: Guardian Automaton (Elite, Brute)

**Situation:** Protecting corrupted data terminal. Player approaching with explosives visible. Automaton at 60% HP.

**Decision process:**
1. Survival: 60% HP, still confident ✓
2. Abilities: Defensive Protocol available (reduce damage 50% for 1 round)
3. Environment: Player has explosives - threat assessment high
4. Positioning: Must stay near terminal (programmed behavior)
5. Attack: Must stop player reaching terminal

**Action:** Move to intercept player. Use Defensive Protocol in anticipation of explosive. Attack to push player back from terminal.

---

## Quick Reference

### AI Priority Order
1. Survival → 2. Abilities → 3. Environment → 4. Position → 5. Attack

### Target Priority
Lowest HP > Healer > Highest Threat > Caster > Nearest

### Morale Thresholds
Confident (100-75%) → Cautious (75-50%) → Shaken (50-25%) → Broken (<25%)

### Pack Tactics
- Flanking: +2 to hit
- Focus Fire (3+): +1 damage each
- Focus Fire (5+): +2 damage each

---

## Metadata

```yaml
created: "2026-02-03"
author: "Coda"
related_files:
  - "combat.md"
  - "encounter-generation.md"
  - "templates/creature.yaml"
```
