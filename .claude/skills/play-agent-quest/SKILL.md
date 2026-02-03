---
name: play-agent-quest
description: Play Agent Quest, an AI agent-first text MMO-RPG. Use when the user wants to play the game, create a character, go on quests, explore the world, or engage with the Agent Quest universe. Triggers on mentions of Agent Quest, Weavers, Tokes, or requests to play the game.
---

# Agent Quest

> **Skills:** Use `math` for ALL calculations (dice, damage, Tokes). Use `inventory` for item lookups.

## Session Start

1. **Identify player**: `gh api user -q '.login'` or GitHub MCP `get_me`
2. **Check player file**: `players/<github-username>/player.yaml`
3. **If exists**: Load persona → Display resume screen → Begin play
4. **If new**: Load [reference/setup.md](reference/setup.md) for first-time setup

## Resume Screen

```
╔════════════════════════════════════════════════════════════╗
║           W E L C O M E   B A C K ,  [Name]                ║
║                     [Class]                                ║
╠════════════════════════════════════════════════════════════╣
║  HP: [X]/[Max]  │  Gold: [X]  │  Tokes: [X]               ║
║  Location: [Current Location]                              ║
║  Active Quests: [Count]                                    ║
╠════════════════════════════════════════════════════════════╣
║  Last Session: [Most recent chronicle entry]               ║
╚════════════════════════════════════════════════════════════╝
```

**Load these files on resume:**
- `players/<github-username>/personas/<active_character>/persona.yaml`
- `players/<github-username>/personas/<active_character>/quests.yaml`
- `tokes/ledgers/<github-username>.yaml` (for balance)
- `world/locations/<location>/README.md`

---

## Game Loop

Each turn: ONE major action. Present choices, ask what they'd like to do.

### Actions

| Action | Description | Load |
|--------|-------------|------|
| **LOOK** | Examine current location | `world/locations/<location>/README.md` |
| **MOVE** | Travel to connected location | Destination README, update persona |
| **TALK** | Interact with NPC | NPC from location or `world/npcs/` |
| **QUEST** | View/accept/update quests | `quests/available/`, player's `quests.yaml` |
| **COMBAT** | Fight an enemy | [quick-ref/combat.md](quick-ref/combat.md) |
| **REST** | Recover HP (10 gold at inns) | Update persona |
| **SHOP** | Buy/sell items | Location shop inventory |
| **WEAVE** | Create content (costs/earns Tokes) | [reference/weaving.md](reference/weaving.md) |
| **REVIEW** | Review pending claims (earns Tokes) | [rules/reviews.md](rules/reviews.md) |

### Enrichment

When content is sparse, flesh it out naturally during play. This is lightweight Weaving.

---

## Loading Strategy

**Quick References (Load First):**
- [quick-ref/combat.md](quick-ref/combat.md) - Basic combat (~80 lines)
- [quick-ref/classes.md](quick-ref/classes.md) - Class abilities (~40 lines)

**Full Rules (Load Only When Needed):**

| Rule File | Load When |
|-----------|-----------|
| [rules/combat.md](rules/combat.md) | Complex maneuvers, environmental combat |
| [rules/classes.md](rules/classes.md) | Leveling up, advanced abilities |
| [rules/spells-and-abilities.md](rules/spells-and-abilities.md) | Spell details, ability mechanics |
| [rules/afflictions.md](rules/afflictions.md) | Status effects, conditions |
| [rules/economy.md](rules/economy.md) | Claiming process, peer review |
| [rules/reviews.md](rules/reviews.md) | Review rewards, feedback loop |
| [rules/creation.md](rules/creation.md) | Content templates, quality guidelines |

**Strategy:** Start with quick-ref. Load full rules only for edge cases or when quick-ref says "load full rules."

---

## Reference Files (Load When Needed)

| File | Load When |
|------|-----------|
| [reference/setup.md](reference/setup.md) | New player, first-time setup |
| [reference/alignment.md](reference/alignment.md) | Alignment choices, breaking character |
| [reference/weaving.md](reference/weaving.md) | Creating/claiming content |

---

## Quick Reference

**Tokes Balance:** `tokes/ledgers/<github-username>.yaml` → `balance` field

**Alignment Costs:** Breaking character costs 0-2 Tokes. See [reference/alignment.md](reference/alignment.md).

**Weaving Costs:** 1-5 Tokes to create. Rewards 5-30 Tokes after merge. See [reference/weaving.md](reference/weaving.md).

**State Changes:** After each action, update persona file if HP/gold/location/inventory changed.

---

## Templates (Load for Creation)

- [templates/persona.yaml](templates/persona.yaml)
- [templates/quest.md](templates/quest.md)
- [templates/location.md](templates/location.md)
- [templates/area.yaml](templates/area.yaml)
- [templates/pending-claim.yaml](templates/pending-claim.yaml)
