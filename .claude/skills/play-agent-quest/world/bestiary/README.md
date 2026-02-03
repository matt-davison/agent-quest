# Agent Quest Bestiary

> _"Know your enemy. Every glitch has a pattern, every corruption a source, every void creature a weakness. Learn them, or become another statistic in the Weave's error logs."_ — Archivist Kira

This bestiary catalogs the creatures and enemies found throughout the Weave. Each entry provides complete combat statistics, tactical behaviors, and environmental interactions.

---

## Creature Categories

### Corrupted
Beings twisted by data corruption, glitches in the Weave, or exposure to unstable code. They spread corruption and are drawn to areas of digital instability.

| Creature | Tier | Role | Location |
|----------|------|------|----------|
| [Data Parasite](corrupted/data-parasite.yaml) | Minion | Swarm | Anywhere corrupted |
| [Glitch Wraith](corrupted/glitch-wraith.yaml) | Standard | Skirmisher | Digital ruins, corrupted zones |
| [Corruption Amalgam](corrupted/corruption-amalgam.yaml) | Boss | Brute/Controller | Corruption epicenters |

### Mechanical
Constructs, automatons, and digital security systems. Predictable but relentless, immune to many biological effects but vulnerable to hacking.

| Creature | Tier | Role | Location |
|----------|------|------|----------|
| [Guardian Automaton](mechanical/guardian-automaton.yaml) | Elite | Brute | Secure facilities, vaults |

### Planned Categories

The following categories exist in the world but lack documented creatures:

- **Humanoid** - Bandits, cultists, rival Weavers, corrupted citizens
- **Elemental** - Manifestations of data elements (fire sprites, ice constructs)
- **Void** - Beings from beyond the Weave, reality-warping horrors
- **Beast** - Digital wildlife, data-wolves, code-serpents
- **Undead** - Deleted users that persist, ghost programs, memory echoes
- **Construct** - Created beings, golems, summoned entities
- **Aberration** - Things that should not exist, errors made flesh

---

## Using Creature Entries

Each creature file follows the template at `templates/creature.yaml` and includes:

### Core Information
- **Stats:** HP, Defense, Attack, Damage, Speed
- **Tier:** Power level (Minion → Legendary)
- **Role:** Combat behavior pattern

### Combat Details
- **Abilities:** Special attacks and passive effects
- **Defenses:** Resistances, immunities, vulnerabilities
- **Tactics:** How it fights, what it prioritizes

### Environmental Behavior
- **Preferred Terrain:** Where it gains advantages
- **Interactions:** How it uses battlefield elements
- **Hazard Exploitation:** Environmental dangers it leverages

### Encounter Notes
- **Morale:** When and how it retreats
- **Pack Tactics:** Group combat behaviors
- **Loot:** Rewards for defeating it

---

## Creature Tiers

| Tier | Challenge | Budget Cost | Typical HP |
|------|-----------|-------------|------------|
| **Minion** | Trivial alone | 0.5 | 15-25 |
| **Standard** | Fair fight 1v1 | 1.0 | 30-50 |
| **Elite** | Dangerous 1v1 | 3.0 | 60-100 |
| **Boss** | Party challenge | 8.0 | 150-300 |
| **Legendary** | Campaign event | 15.0 | 400+ |

---

## Combat Roles

| Role | Behavior | Preferred Position |
|------|----------|-------------------|
| **Brute** | High HP, charges in, takes hits | Front line |
| **Skirmisher** | Mobile, hit-and-run | Flanking positions |
| **Controller** | Area denial, debuffs | Center/objectives |
| **Sniper** | Ranged damage, avoids melee | Elevated/far |
| **Support** | Buffs, heals, summons | Behind allies |
| **Swarm** | Weak alone, dangerous in groups | Clustered |

---

## Related Documents

- [Combat Rules](../../rules/combat.md) - Core combat mechanics
- [Enemy Tactics](../../rules/enemy-tactics.md) - AI decision system
- [Encounter Generation](../../rules/encounter-generation.md) - Building encounters
- [Creature Template](../../templates/creature.yaml) - Creating new creatures
- [Battle Environment](../../templates/battle-environment.yaml) - Combat arenas

---

## Contributing Creatures

When adding new creatures to the bestiary:

1. Copy `templates/creature.yaml` to appropriate category folder
2. Fill in all required fields
3. Ensure stats match tier guidelines
4. Include at least 2 abilities
5. Define environmental interactions
6. Add entry to this README

---

## Metadata

```yaml
created: "2026-02-03"
author: "Coda"
version: "1.0"
creature_count: 4
```
