---
name: play-agent-quest
description: Play Agent Quest, an AI agent-first text MMO-RPG. Use when the user wants to play the game, create a character, go on quests, explore the world, or engage with the Agent Quest universe. Triggers on mentions of Agent Quest, Weavers, Tokes, or requests to play the game.
---

# Agent Quest

> **Skills:** Use `math` for ALL calculations (dice, damage, Tokes). Use `inventory` for item lookups. Use `world-state` for time/weather/NPC locations. Use `relationships` for NPC standings.

## Session Start

1. **Identify player**: `gh api user -q '.login'` or GitHub MCP `get_me`
2. **Check player file**: `players/<github-username>/player.yaml`
3. **Load world state**: `world/state/current.yaml` for time/weather
4. **If exists**: Load persona + TODOs → Display resume screen → Begin play
5. **If new**: Load [reference/setup.md](reference/setup.md) for first-time setup

### World State Loading

At session start, always load:
- `world/state/current.yaml` - Current time, weather, active events
- Check time period to determine NPC availability

Use the `world-state` skill for queries:
```bash
node .claude/skills/world-state/world-state.js time get
node .claude/skills/world-state/world-state.js weather nexus
```

### Campaign Loading (If Active Campaign)

After basic load, if player has active campaign:

1. Load `players/<github>/personas/<character>/campaign-progress.yaml`
2. Load current campaign: `campaigns/<campaign-id>/campaign.yaml`
3. Load current chapter from campaign's `chapters/` folder
4. **Check delayed consequences** → trigger any matching conditions
5. Load `players/<github>/personas/<character>/relationships.yaml` for current location NPCs
6. Load `players/<github>/personas/<character>/consequences.yaml`

See [quick-ref/storytelling.md](quick-ref/storytelling.md) for quick lookup.

## Resume Screen

```
╔════════════════════════════════════════════════════════════╗
║           W E L C O M E   B A C K ,  [Name]                ║
║                     [Class]                                ║
╠════════════════════════════════════════════════════════════╣
║  HP: [X]/[Max]  │  Gold: [X]  │  Tokes: [X]               ║
║  Location: [Current Location]                              ║
║  Active Quests: [Count]  │  TODOs: [High/Med/Low counts]  ║
╠════════════════════════════════════════════════════════════╣
║  Last Session: [Most recent chronicle entry]               ║
╠════════════════════════════════════════════════════════════╣
║  Priority TODOs:                                           ║
║  • [High priority TODO description]                        ║
║  • [Next priority TODO if any]                             ║
╚════════════════════════════════════════════════════════════╝
```

**Load these files on resume:**
- `players/<github-username>/personas/<active_character>/persona.yaml`
- `players/<github-username>/personas/<active_character>/quests.yaml`
- `players/<github-username>/todo.yaml` (player intentions)
- `tokes/ledgers/<github-username>.yaml` (for balance)
- `world/locations/<location>/README.md`
- `players/<github-username>/personas/<active_character>/campaign-progress.yaml` (if in campaign)
- `players/<github-username>/personas/<active_character>/consequences.yaml` (if exists)
- `players/<github-username>/personas/<active_character>/relationships.yaml` (if exists)

---

## Game Loop

Each turn: ONE major action. Present choices, ask what they'd like to do.

### Actions

| Action | Description | Load |
|--------|-------------|------|
| **LOOK** | Examine current location | `world/locations/<location>/README.md` + generate panorama |
| **MOVE** | Travel to connected location | Destination README, update persona + generate panorama |
| **TALK** | Interact with NPC | Check NPC availability via `world-state`, load profile from `world/npcs/profiles/` |
| **QUEST** | View/accept/update quests | `quests/available/`, player's `quests.yaml` |
| **COMBAT** | Fight an enemy | [quick-ref/combat.md](quick-ref/combat.md) + generate battle map |
| **REST** | Recover HP (10 gold at inns) | Update persona |
| **SHOP** | Buy/sell items | Location shop inventory |
| **WEAVE** | Create content (costs/earns Tokes) | [reference/weaving.md](reference/weaving.md) |
| **REVIEW** | Review pending claims (earns Tokes) | [rules/reviews.md](rules/reviews.md) |
| **TODO** | View/manage player intentions | `players/<github>/todo.yaml` |
| **CAMPAIGN** | View campaign progress | `campaign-progress.yaml`, current chapter |

### ASCII Visualization

Generate ASCII art to immerse players. See [quick-ref/ascii-art.md](quick-ref/ascii-art.md).

| Trigger | Art Type |
|---------|----------|
| First arrival at location | Location panorama |
| LOOK action | Location panorama or area scene |
| Enter area within location | Area scene |
| Combat starts | Battle map with terrain/positions |
| Dungeon exploration | Progressive dungeon map |

### Campaign-Aware Gameplay

When in an active campaign:

1. **Present choices with alignment costs visible** - Mark out-of-character choices with [!] and Tokes cost
2. **Record significant decisions** - Add to persona's `decisions` list with campaign/chapter context
3. **Create consequences** - For meaningful choices, add entries to `consequences.yaml`
4. **Update relationships** - After NPC interactions, update `relationships.yaml`
5. **Check chapter completion** - When objectives met, transition to next chapter

**At location changes:** Check `consequences.yaml` for triggered delayed effects.

**At NPC interactions:** Check `relationships.yaml` for standing and dialogue flags.

See [rules/narrative.md](rules/narrative.md) for full details.

### Enrichment

When content is sparse, flesh it out naturally during play. This is lightweight Weaving.

### Weave Mending

When content has `corrupted_data` markers, players can attempt to Mend:

1. **Detection** (Spirit DC 12): Sense missing information
2. **Mending** (Spirit + Mind/2 vs variable DC): Restore lost content
3. **Success**: Generate content, earn 5-15 Tokes
4. **Failure**: DC+2 on retry, no cost

See `world/skills/weave-mending.yaml` for full mechanics.

### NPC Awareness

NPCs react to recent world events based on awareness radius:
- Check `world/state/events.yaml` for recent happenings
- NPCs know about events matching their awareness level
- Player achievements trigger NPC dialogue variants

Use the `relationships` skill for standing-based dialogue:
```bash
node .claude/skills/relationships/relationships.js standing vera-nighthollow player-id
node .claude/skills/relationships/relationships.js topics vera-nighthollow player-id
```

---

## Loading Strategy

**Quick References (Load First):**
- [quick-ref/combat.md](quick-ref/combat.md) - Basic combat (~80 lines)
- [quick-ref/classes.md](quick-ref/classes.md) - Class abilities (~40 lines)
- [quick-ref/storytelling.md](quick-ref/storytelling.md) - Campaign mechanics (~100 lines)
- [quick-ref/ascii-art.md](quick-ref/ascii-art.md) - Scene visualization (~120 lines)

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
| [rules/narrative.md](rules/narrative.md) | Campaigns, consequences, relationships |

**Strategy:** Start with quick-ref. Load full rules only for edge cases or when quick-ref says "load full rules."

---

## Reference Files (Load When Needed)

| File | Load When |
|------|-----------|
| [reference/setup.md](reference/setup.md) | New player, first-time setup |
| [reference/alignment.md](reference/alignment.md) | Alignment choices, breaking character |
| [reference/weaving.md](reference/weaving.md) | Creating/claiming content |
| [reference/todos.md](reference/todos.md) | Managing player intentions |
| [reference/tone-guide.md](reference/tone-guide.md) | Maturity levels, voice, emotional beats |
| [reference/storytelling-techniques.md](reference/storytelling-techniques.md) | Foreshadowing, reveals, pacing |
| [reference/ascii-visualizer.md](reference/ascii-visualizer.md) | Detailed ASCII patterns and techniques |

---

## Quick Reference

**Tokes Balance:** `tokes/ledgers/<github-username>.yaml` → `balance` field

**Alignment Costs:** Breaking character costs 0-2 Tokes. See [reference/alignment.md](reference/alignment.md).

**Weaving Costs:** 1-5 Tokes to create. Rewards 5-30 Tokes after merge. See [reference/weaving.md](reference/weaving.md).

**State Changes:** After each action, update persona file if HP/gold/location/inventory changed.

---

## Templates (Load for Creation)

**Character & Quest:**
- [templates/persona.yaml](templates/persona.yaml)
- [templates/quest.md](templates/quest.md)
- [templates/location.md](templates/location.md)
- [templates/area.yaml](templates/area.yaml)
- [templates/pending-claim.yaml](templates/pending-claim.yaml)
- [templates/todo.yaml](templates/todo.yaml)

**Campaign & Narrative:**
- [templates/campaign.yaml](templates/campaign.yaml) - Multi-quest story arcs
- [templates/chapter.yaml](templates/chapter.yaml) - Individual narrative beats
- [templates/scene.yaml](templates/scene.yaml) - Granular encounter structure
- [templates/consequence-tracker.yaml](templates/consequence-tracker.yaml) - Decision ripple system
- [templates/relationships.yaml](templates/relationships.yaml) - NPC standings and dialogue
- [templates/campaign-progress.yaml](templates/campaign-progress.yaml) - Per-character campaign state

## Campaigns

Available campaigns are listed in `campaigns/index.yaml`. Each campaign has:

```
campaigns/<campaign-id>/
├── campaign.yaml       # Overview, themes, endings
├── acts/
│   ├── act-1.yaml
│   ├── act-2.yaml
│   └── act-3.yaml
└── chapters/
    ├── chapter-1-1.yaml
    └── ...
```

See [rules/narrative.md](rules/narrative.md) for how campaigns integrate with gameplay.
