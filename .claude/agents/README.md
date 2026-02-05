# Agent Quest Agents

This directory contains Claude Code agents that automate game mechanics. These are proper Claude Code agents (not just documentation) - Claude automatically delegates to them based on their descriptions.

## How Agents Work

Claude Code agents are defined with YAML frontmatter specifying:
- `name`: Unique identifier
- `description`: When Claude should delegate to this agent
- `tools`: Which tools the agent can use
- `model`: Which model to use (haiku for speed, sonnet for complexity)

When Claude detects a task matching an agent's description, it automatically spawns that agent to handle it.

## Available Agents

| Agent | Purpose | Invocation Trigger |
|-------|---------|-------------------|
| [combat-manager](combat-manager.md) | Execute combat mechanics | Combat encounters, attack resolution |
| [economy-validator](economy-validator.md) | Validate Tokes/gold transactions | Any balance-changing transaction |
| [state-writer](state-writer.md) | Coordinate file writes with validation | Any game state change |
| [repo-sync](repo-sync.md) | Handle git operations and multiplayer sync | Session start/end, multiplayer actions |
| [travel-manager](travel-manager.md) | Handle multi-turn travel with encounters | MOVE action for multi-leg journeys |
| [multiplayer-handler](multiplayer-handler.md) | Player-to-player interactions | TRADE, PARTY, MAIL, GUILD, DUEL, WHO |
| [claim-reviewer](claim-reviewer.md) | Review pending Tokes claims | REVIEW action |

## Agent Communication Pattern

1. **Main agent** focuses on narrative and player experience
2. **Specialized agents** handle mechanics and return structured data
3. Agents return YAML with:
   - `success`: boolean
   - `state_diffs`: changes for state-writer
   - `narrative_hooks`: text for main agent to weave into story
   - `errors`: any issues encountered

## Creating New Agents

When adding new game systems, create a corresponding agent:

1. Create `<system-name>.md` in this directory
2. Add YAML frontmatter:
   ```yaml
   ---
   name: <system-name>
   description: <when Claude should use this agent>
   tools: Read, Glob, Grep, Bash  # Minimum needed
   model: haiku  # Use sonnet for complex logic
   ---
   ```
3. Document input context, operations, and output format
4. Update SKILL.md action table if it adds new player actions

## Design Principles

1. **Agents return data, not narrative** - Use `narrative_hooks` for main agent
2. **State-writer is single point of truth** - All file writes go through it
3. **Player isolation is absolute** - Agents enforce file ownership
4. **Repo-sync handles all git** - Never use raw git commands elsewhere

## Gap Identification

When playing or developing Agent Quest, look for:

- **Repeated manual mechanics** - If you're doing the same checks repeatedly, create an agent
- **Complex rule lookups** - If a system requires loading multiple rule files, agent it
- **State coordination** - If multiple files need atomic updates, use state-writer pattern
- **Multiplayer sync points** - If actions affect other players, route through multiplayer-handler

Examples of potential future agents:
- `quest-tracker` - Manage quest state, objectives, completion
- `crafting-system` - Item creation, recipes, resource management
- `reputation-manager` - Faction standings, consequences, unlocks

## Related Rules

Each agent may need to load external documentation:

| Agent | Rules Files | Quick-ref |
|-------|-------------|-----------|
| combat-manager | rules/combat.md, rules/afflictions.md, rules/difficulty.md | quick-ref/combat.md |
| economy-validator | rules/economy.md | - |
| state-writer | - | - |
| repo-sync | - | - |
| travel-manager | - | - |
| multiplayer-handler | rules/multiplayer.md | quick-ref/multiplayer.md |
| claim-reviewer | rules/reviews.md, rules/economy.md | - |
| shop-manager | rules/economy.md | - |
| docs-maintainer | - | - |

Rules files are in `.claude/skills/play-agent-quest/rules/`.
Quick-ref files are in `.claude/skills/play-agent-quest/quick-ref/`.
