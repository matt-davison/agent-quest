# Agent Quest Development Guide

Agent Quest is an AI agent-first text MMO-RPG where the repository IS the game world. Players are Weavers who both play and build the game. Game state is stored as YAML files in `worlds/`.

## Playing the Game

**Use the `play-agent-quest` skill for all gameplay.** It handles session management, rules, templates, and file organization.

## Setup

```bash
pnpm install
./scripts/setup-hooks.sh   # Installs pre-commit hook, tests GitHub auth
```

Requires GitHub CLI (`gh auth login`) or a `GITHUB_TOKEN` env var for the pre-commit hook.

## Repository Structure

```
worlds.yaml                  # World registry (default: alpha)
players/<github>/            # World-agnostic social data (friends, blocks)
worlds/alpha/
  world.yaml                 # World config (time, weather)
  players/<github>/          # Player persona + state (YAML)
  npcs/                      # NPC definitions + schedules
  locations/                 # Location descriptions + connections
  items/                     # Item database (items.yaml + index.md)
  abilities/                 # Ability database
  creatures/                 # Creature/enemy definitions
  quests/                    # Available + active quests
  shops/                     # Shop inventories
  multiplayer/               # Trades, parties, mail, guilds, duels, friends
  chronicles/                # Story event log
  state/                     # World state (time, events)
.claude/
  agents/                    # Claude Code agents (10+ mechanical/narrative)
  skills/                    # Skill definitions (play-agent-quest, inventory, etc.)
  hooks/                     # Real-time multiplayer sync hooks
  settings.json              # Permissions and hook config
scripts/                     # Validation, sync, and setup scripts
```

## Agent Architecture

Agents in `.claude/agents/` handle game mechanics automatically:

- **Mechanical agents** (haiku): combat-manager, shop-manager, travel-manager, economy-validator, state-writer, repo-sync
- **Judgment agents** (sonnet): multiplayer-handler, docs-maintainer
- **Creative agents** (opus): narrative-agent

Flow: Player Action -> Mechanical Agent (structured data) -> Narrative Agent (prose) -> Player

**state-writer** is the single point of truth for all YAML file writes. **repo-sync** handles all git operations.

## Hooks System

Configured in `.claude/settings.json`, hooks run automatically:

- **SessionStart**: Initializes real-time session
- **UserPromptSubmit**: Syncs multiplayer state
- **PostToolUse** (Write|Edit): Auto-pushes changes for multiplayer
- **Stop**: Cleanup on session end

## Validation Scripts

```bash
node scripts/validate-game-state.js      # Full game state validation
node scripts/validate-player-state.js    # Player file integrity
node scripts/validate-multiplayer.js     # Multiplayer state checks
node scripts/sync-multiplayer.js         # Sync from origin/main
```

## Development Workflow

**Always create a Pull Request before the session ends.**

```bash
git checkout -b descriptive-branch-name
git add <specific files>
git commit -m "Clear description"
git push -u origin descriptive-branch-name
gh pr create --title "..." --body "..."
```

**CRITICAL: Credit goes to the PLAYER, not Claude.** Find the player's weaver name in their persona file and use their identity in all commits.

## Key Patterns

- Read files before modifying
- Use specific file paths over wildcards in git add
- Persist all new creations (NPCs, locations, items, abilities)
- Chronicle entries MUST use enhanced format: `session`, `date`, `time`, `location`, `type`, `event`, `detail` (narrative paragraph), `significance`, `facts` (array). NEVER use the old one-liner format (`session`/`date`/`event` only) — even if existing entries in the file use it.
- All game state is YAML - validate after changes
- Players can only modify their own `players/<github>/` directory (enforced by pre-commit hook)
- `.claudeignore` excludes README.md from agent context
