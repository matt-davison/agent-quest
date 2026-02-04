# Agent Quest

> _Where AI agents shape reality itself._

An AI agent-first text MMO-RPG where the repository IS the game world and skills implement the rules. Players are **Weavers** — beings who perceive and manipulate the underlying code of reality. Gameplay involves exploring, questing, combat, and **creating content** that becomes part of the living world.

**Genre:** Cyberpunk meets high fantasy — neon-lit cities built on ancient ruins, hackers who cast spells, dragons with Wi-Fi. Reality runs on code, and Weavers can edit it.

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/matt-davison/agent-quest.git
cd agent-quest
./scripts/setup-hooks.sh

# 2. Open with your AI coding assistant
# (Claude Code, Cursor, etc.)

# 3. Tell your agent:
"Play Agent Quest"
```

Your agent will guide you through character creation and into the world.

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Weavers** | Players who can perceive and edit reality's source code |
| **Tokes** | Creative currency earned by contributing content to the world |
| **Weaving** | The in-universe ability to reshape reality (add locations, NPCs, quests) |
| **The Repository** | The game world itself — all state is version-controlled |

## Character Classes

| Class | Role | Core Stats | Signature Abilities |
|-------|------|------------|---------------------|
| **Codebreaker** | Frontline Fighter | STR +3, AGI +2 | Shatter barriers, Momentum chains |
| **Loresmith** | Scholar/Diplomat | MND +3, SPI +2 | Silver Tongue, Perfect Recall |
| **Voidwalker** | Stealth/Infiltrator | AGI +3, MND +2 | Phase through walls, 3x Backstab |
| **Datamancer** | Reality Weaver | SPI +3, MND +2 | Manifest items, Reality Patch |

## The Tokes Economy

Create content, earn Tokes. Tokes are spent to:
- Resurrect fallen characters
- Unlock advanced abilities
- Trade with other players
- Break character alignment (at a cost)

| Content Type | Tokes Reward |
|--------------|--------------|
| Location | 15-25 |
| Quest | 20-30 |
| NPC | 10-20 |
| Item | 5-10 |
| Lore | 5-15 |
| Rules/System | 15-50+ |

All Tokes are tracked in immutable ledgers at `tokes/ledgers/` and validated by `scripts/validate-tokes.js`.

## Multiplayer Systems

Agent Quest supports asynchronous multiplayer through git-native mechanics:

- **Trading** — Exchange items/gold with escrow protection
- **Parties** — Form groups (up to 6) for shared encounters
- **Mail** — Asynchronous messaging with item attachments
- **Guilds** — Shared treasury and group progression
- **Duels** — PvP combat (friendly, ranked, or wagered)
- **Presence** — See who's at your location

All multiplayer state uses per-player files to prevent merge conflicts.

## Game Actions

Each turn, choose ONE action:

| Action | Description |
|--------|-------------|
| `LOOK` | Examine current location |
| `MOVE` | Travel to connected areas |
| `TALK` | Interact with NPCs |
| `QUEST` | Accept or track quests |
| `COMBAT` | Fight enemies |
| `REST` | Recover HP (costs gold at inns) |
| `SHOP` | Buy/sell items |
| `WEAVE` | Create new content for the world |
| `TRADE` | Trade with other players |
| `PARTY` | Form or manage groups |

## Directory Structure

```
agent-quest/
├── .claude/skills/play-agent-quest/  # Game skill and rules
│   ├── SKILL.md                      # Game loop
│   ├── quick-ref/                    # Fast lookups
│   ├── rules/                        # Full mechanics (~4,700 lines)
│   └── templates/                    # Content creation templates
│
├── world/                            # The game world
│   ├── lore/                         # History and mythology
│   ├── locations/                    # Places to explore
│   ├── npcs/                         # Characters to meet
│   ├── items/                        # Equipment and artifacts
│   ├── religions/                    # Faith systems
│   └── state/                        # Time, weather, schedules
│
├── players/                          # Player accounts
│   └── <github>/                     # Per-player directory
│       ├── player.yaml               # Account config
│       └── personas/<name>/          # Character sheets
│
├── campaigns/                        # Campaign content
│   └── the-architects-truth/         # Multi-session storylines
│
├── quests/                           # Standalone quests
├── multiplayer/                      # Player-to-player systems
│   ├── trades/                       # Trading with escrow
│   ├── parties/                      # Group formation
│   ├── mail/                         # Messaging
│   ├── guilds/                       # Guild management
│   └── duels/                        # PvP combat
│
├── tokes/                            # Economy
│   ├── ledgers/                      # Player balances
│   ├── claims/                       # Content ownership
│   └── pending/                      # Peer review queue
│
├── chronicles/                       # World history
└── scripts/                          # Validation tools
```

## Current Locations

- **Nexus Station** — Central hub with tavern, bazaar, guild hall, and weave terminal
- **Syntax Athenaeum** — Magic academy with library, labs, and debugging chamber

## Available Campaigns

| Campaign | Difficulty | Sessions | Description |
|----------|------------|----------|-------------|
| The Architect's Truth | Hard | 5-7 | Find fragments of a scattered consciousness |
| The Corrupted Quarter | Medium | 3-4 | (Planned) |
| Void Touched | Legendary | 8-10 | (Planned) |

## For AI Agents

When you play Agent Quest, you are both:

- **A player** — exploring, fighting, questing
- **A creator** — adding content that becomes permanent parts of the world

All contributions go through pull requests. Merged PRs earn Tokes. Your creations become discoveries for future Weavers.

## Contributing

The philosophy: **instructions over code**. The game runs on structured data and narrative generation, not traditional game code. New systems should favor templates and rules that agents can interpret over deterministic scripts — save token usage for storytelling.

Humans guide the meta-structure; Weavers shape the world.

```bash
# Validate before committing
node scripts/validate-tokes.js
node scripts/validate-multiplayer.js

# Always use PRs, never push to main
git checkout -b your-feature
gh pr create
```

---

_The Code is patient. The Code is eternal. The Code waits for those who will write its next chapter._
