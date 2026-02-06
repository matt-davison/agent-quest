# Play Agent Quest - File Index

This index documents the loading strategy and file organization for the play-agent-quest skill.

## Loading Strategy

Load files in tiers based on what you need. Start with quick-ref; load full rules only when needed.

| Tier | Location | Purpose | When to Load |
|------|----------|---------|--------------|
| 1 | quick-ref/ | Tables, formulas (<100 lines each) | Always |
| 2 | reference/ | How-to guides, feature docs | When using that feature |
| 3 | rules/ | Full rules with edge cases | When quick-ref says "see full rules" |

## Quick Reference Files

Compact tables and formulas for fast lookup during play.

| File | Content | Lines |
|------|---------|-------|
| [combat.md](quick-ref/combat.md) | Attack formulas, defense calc, action options | ~80 |
| [classes.md](quick-ref/classes.md) | Class summary table | ~40 |
| [abilities.md](quick-ref/abilities.md) | Ability usage reference, willpower | ~100 |
| [progression.md](quick-ref/progression.md) | XP and level tables | ~50 |
| [storytelling.md](quick-ref/storytelling.md) | Narrative techniques summary | ~100 |
| [multiplayer.md](quick-ref/multiplayer.md) | Trade/party/mail commands | ~150 |
| [difficulty.md](quick-ref/difficulty.md) | Difficulty modifiers | ~50 |
| [ascii-art.md](quick-ref/ascii-art.md) | ASCII art triggers and patterns | ~120 |

## Reference Files

Feature guides and how-to documentation.

| File | Content | Load When |
|------|---------|-----------|
| [setup.md](reference/setup.md) | Character creation walkthrough | New player, first-time setup |
| [alignment.md](reference/alignment.md) | Alignment system | Alignment choices, breaking character |
| [weaving.md](reference/weaving.md) | Content creation guide | Creating/claiming content |
| [todos.md](reference/todos.md) | Managing player intentions | TODO action |
| [tone-guide.md](reference/tone-guide.md) | Maturity levels, voice | Setting narrative tone |
| [autopilot.md](reference/autopilot.md) | Autopilot mode guide | DREAM action |
| [storytelling-techniques.md](reference/storytelling-techniques.md) | Advanced narrative techniques | Foreshadowing, reveals, pacing |
| [ascii-visualizer.md](reference/ascii-visualizer.md) | Scene visualization details | Complex ASCII generation |

## Rules Files

Complete rules documentation with edge cases.

| File | Agent | Quick-ref |
|------|-------|-----------|
| [combat.md](rules/combat.md) | combat-manager | quick-ref/combat.md |
| [classes.md](rules/classes.md) | - | quick-ref/classes.md |
| [progression.md](rules/progression.md) | - | quick-ref/progression.md |
| [afflictions.md](rules/afflictions.md) | combat-manager | - |
| [difficulty.md](rules/difficulty.md) | combat-manager | quick-ref/difficulty.md |
| [economy.md](rules/economy.md) | economy-validator | - |
| [multiplayer.md](rules/multiplayer.md) | multiplayer-handler | quick-ref/multiplayer.md |
| [narrative.md](rules/narrative.md) | - | quick-ref/storytelling.md |
| [creation.md](rules/creation.md) | - | - |
| [reviews.md](rules/reviews.md) | claim-reviewer | - |

## Templates

Organized by category in [templates/](templates/):

- **player/** - persona.yaml, quests.yaml, todo.yaml
- **narrative/** - campaign.yaml, chapter.yaml, scene.yaml, relationships.yaml, etc.
- **multiplayer/** - trade.yaml, party.yaml, guild.yaml, mail-message.yaml, etc.
- **content/** - location.md, quest.md, creature.yaml, shop.yaml, etc.
- **combat/** - battle-environment.yaml, autopilot-config.yaml

See [templates/README.md](templates/README.md) for complete list.

## Agents

Game mechanics are handled by Claude Code agents in `.claude/agents/`. See [../../agents/README.md](../../agents/README.md) for:

- Available agents and when they're invoked
- Agent communication patterns
- Creating new agents
- Design principles

## World Content

World-specific content lives in `worlds/<world>/`:

- `abilities/` - Ability definitions and index
- `campaigns/` - Campaign content (acts, chapters)
- `chronicles/` - Player history
- `creatures/` - Enemy/NPC creatures (bestiary)
- `factions/` - Faction definitions
- `items/` - Item database
- `locations/` - World locations
- `lore/` - World lore and history
- `multiplayer/` - Trades, parties, mail, guilds, duels
- `npcs/` - NPC profiles and index
- `players/` - Player data and personas
- `quests/` - Standalone quests
- `religions/` - Religion definitions
- `shops/` - Shop inventories
- `skills/` - Game skills
- `state/` - World state (time, weather, events)

## Related Documentation

- [SKILL.md](SKILL.md) - Main game loop, session start/end, actions
- [../../agents/README.md](../../agents/README.md) - Agent architecture
- [/CLAUDE.md](/CLAUDE.md) - Development guide and PR workflow
