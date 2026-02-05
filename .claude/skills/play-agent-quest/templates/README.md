# Templates

Templates for creating game content in Agent Quest. Organized by category.

## Categories

### player/
Character and player data templates.

| Template | Purpose |
|----------|---------|
| [persona.yaml](player/persona.yaml) | Character sheet - stats, inventory, location |
| [quests.yaml](player/quests.yaml) | Active quests and objectives |
| [todo.yaml](player/todo.yaml) | Player intentions and goals |
| [world-state.yaml](player/world-state.yaml) | Character-specific world overrides |

### narrative/
Campaign and storytelling templates.

| Template | Purpose |
|----------|---------|
| [campaign.yaml](narrative/campaign.yaml) | Multi-quest story arcs |
| [campaign-progress.yaml](narrative/campaign-progress.yaml) | Per-character campaign state |
| [chapter.yaml](narrative/chapter.yaml) | Individual narrative beats |
| [scene.yaml](narrative/scene.yaml) | Granular encounter structure |
| [consequence-tracker.yaml](narrative/consequence-tracker.yaml) | Decision ripple system |
| [relationships.yaml](narrative/relationships.yaml) | NPC standings and dialogue |
| [dream-pattern.yaml](narrative/dream-pattern.yaml) | Autopilot/Dreaming configuration |

### multiplayer/
Player-to-player interaction templates.

| Template | Purpose |
|----------|---------|
| [trade.yaml](multiplayer/trade.yaml) | Player-to-player trades |
| [escrow.yaml](multiplayer/escrow.yaml) | Locked items/gold ledger |
| [party.yaml](multiplayer/party.yaml) | Party structure |
| [party-membership.yaml](multiplayer/party-membership.yaml) | Character party link |
| [party-invite.yaml](multiplayer/party-invite.yaml) | Party invitations |
| [party-encounter.yaml](multiplayer/party-encounter.yaml) | Shared combat |
| [mail-message.yaml](multiplayer/mail-message.yaml) | Player messages |
| [guild.yaml](multiplayer/guild.yaml) | Guild info |
| [guild-roster.yaml](multiplayer/guild-roster.yaml) | Guild membership |
| [guild-treasury.yaml](multiplayer/guild-treasury.yaml) | Shared resources |
| [duel.yaml](multiplayer/duel.yaml) | PvP combat |
| [world-event.yaml](multiplayer/world-event.yaml) | Server-wide events |

### content/
World content creation templates.

| Template | Purpose |
|----------|---------|
| [location.md](content/location.md) | New world locations |
| [area.yaml](content/area.yaml) | Areas within locations |
| [creature.yaml](content/creature.yaml) | Enemy/NPC creatures |
| [quest.md](content/quest.md) | Standalone quest structure |
| [pending-claim.yaml](content/pending-claim.yaml) | Tokes claim for review |
| [shop.yaml](content/shop.yaml) | Shop inventories |

### combat/
Combat-related templates.

| Template | Purpose |
|----------|---------|
| [battle-environment.yaml](combat/battle-environment.yaml) | Combat arena setup |
| [autopilot-config.yaml](combat/autopilot-config.yaml) | Autopilot combat preferences |

## Usage

1. Copy the appropriate template to your target location
2. Fill in all required fields
3. Remove placeholder comments
4. Validate against the schema if available

See [rules/creation.md](../rules/creation.md) for content creation standards.
