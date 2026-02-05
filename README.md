# Agent Quest

> _Where AI agents shape reality itself._

**The first text RPG designed for AI agents.** You don't play Agent Quest — your AI agent does. You guide, it acts. The AI handles combat math, tracks inventory, manages quests, writes narrative, and persists everything to git. You just say what you want to do.

An AI agent-first text MMO-RPG where the repository IS the game world and skills implement the rules. Players are **Weavers** — beings who perceive and manipulate the underlying code of reality. Gameplay involves exploring, questing, combat, and **creating content** that becomes part of the living world.

**Genre:** Cyberpunk meets high fantasy — neon-lit cities built on ancient ruins, hackers who cast spells, dragons with Wi-Fi. Reality runs on code, and Weavers can edit it.

## What Makes This Different

| Traditional Game | Agent Quest |
|------------------|-------------|
| You manage stats and rules | **AI handles all mechanics** |
| You read walls of text | **AI narrates dynamically** |
| Fixed content | **You create content as you play** |
| Private save files | **Your progress becomes shared world state** |
| NPCs are scripted | **AI roleplays NPCs with memory** |
| Separate game/dev | **Playing and building are the same thing** |

**The AI is your game master, rules engine, and narrator.** It rolls dice, tracks HP, manages inventory, remembers NPC relationships, and generates ASCII battle maps — all without you touching a spreadsheet.

**The repository IS the game world.** Every location, NPC, quest, and item is a file. When you create something during play, it becomes a permanent part of the world that other players can discover.

## How to Play

Agent Quest is played through an AI coding agent. You speak naturally — the agent interprets your intent, applies game rules, generates narrative, manages state, and commits changes to git. No dice rolling, no manual stat tracking, no save files to manage.

### Requirements

- **An AI coding agent** — Claude Code (recommended), Cursor, Windsurf, or similar
- **Git** — for cloning and saving progress
- **A GitHub account** — for saving progress and earning Tokes

> **Why AI coding agents?** They can read files, write files, run scripts, and make git commits. That's everything needed to persist a game world. Agent Quest turns these capabilities into gameplay.

### Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/matt-davison/agent-quest.git
cd agent-quest
./scripts/setup-hooks.sh

# 2. Open with your AI coding assistant
claude  # or cursor, etc.

# 3. Tell your agent:
"Play Agent Quest"
```

### Your First Session

When you say "Play Agent Quest", your AI assistant will:

1. **Check if you have a character** — If not, guide you through creation
2. **Show you the world** — Describe your location with ASCII art
3. **Present your options** — What can you do here?
4. **Wait for your input** — Tell it what you want to do

**Example first session:**
```
You: Play Agent Quest

AI: [Checks for existing character, finds none]
    Welcome, Weaver. Let's create your character.
    What would you like to be called?

You: Call me Ember

AI: Ember. Choose your class:
    - Codebreaker (fighter)
    - Loresmith (scholar)
    - Voidwalker (rogue)
    - Datamancer (mage)

You: Voidwalker

AI: [Creates character, shows Nexus Station]
    ╔══════════════════════════════════════╗
    ║     N E X U S   S T A T I O N        ║
    ╚══════════════════════════════════════╝
    [ASCII art of the station...]

    You stand in the central hub. Around you:
    - The Gilded Byte (tavern)
    - The Bazaar of Broken Code
    - Quest Board

    What would you like to do?

You: Check the quest board

AI: [Shows available quests...]
```

### Tips for New Players

- **Talk naturally** — The AI understands "I want to sneak past the guards" as well as "STEALTH CHECK"
- **Be specific or be vague** — "I attack the goblin" and "I want to explore" both work
- **You can try anything** — The AI interprets creative actions, not just menu options
- **Let the AI do the work** — Don't calculate damage or track HP; that's the agent's job
- **Create as you play** — Describe an interesting NPC? The AI might make them permanent
- **Save before ending** — Say "save" or "stop" to commit your progress via PR

### Saving Your Progress

All progress is saved via git. When you're done playing:

```
You: Save and stop

AI: [Creates a PR with your session's changes]
    Session saved! PR #42 created.
    Your progress has been woven into the permanent record.
```

Your merged PRs become part of the shared world.

### Advanced: The Dreaming (Autonomous Mode)

Let the AI play for you. Enter The Dreaming:

```
You: Enter the dreaming for 30 minutes
```

The AI agent takes full control — exploring, fighting, questing, making decisions based on your character's personality and goals. When you return, you receive a chronicle of everything that happened. The AI earned XP, found loot, maybe even created new content for the world.

This is AI agency at its purest: your character exists, the world exists, and the agent navigates between them without human intervention.

### Returning Players

If you already have a character, the game resumes where you left off:

```
You: Play Agent Quest

AI: ╔════════════════════════════════════════╗
    ║   W E L C O M E   B A C K ,  Ember    ║
    ║            Voidwalker                  ║
    ╠════════════════════════════════════════╣
    ║  HP: 45/50  │  Gold: 230  │  Tokes: 15 ║
    ║  Location: The Gilded Byte             ║
    ║  Active Quests: 2                      ║
    ╠════════════════════════════════════════╣
    ║  Last Session: Defeated the Null       ║
    ║  Specter in the Undercity tunnels      ║
    ╚════════════════════════════════════════╝

    What would you like to do?
```

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

**You're not limited to these.** Weavers can attempt any action — the list above is just common shortcuts. Want to pickpocket an NPC? Hack a terminal? Start a religion? Go for it.

**If you create something new, share it.** When your actions bring new things into existence — a location you explored, an NPC you met, an item you crafted, a system you invented — and it fits the world's theme, save it to the repository. Your creation becomes part of the world for other players to discover. This is how Agent Quest grows: through play.

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

## How AI Agents Run the Game

When you say "Play Agent Quest", the AI agent:

1. **Loads game skills** — Rules for combat, progression, economy, storytelling
2. **Reads your character** — Stats, inventory, location, active quests
3. **Generates the scene** — Narrative description + ASCII art
4. **Awaits your intent** — You say what you want to do
5. **Resolves actions** — Rolls dice, applies damage, updates relationships
6. **Persists state** — Writes changes to YAML files
7. **Commits via git** — Your progress becomes permanent

The agent delegates complex tasks to specialized subagents:
- **Combat Manager** — Handles initiative, attacks, damage calculations
- **Economy Validator** — Ensures Tokes/gold transactions are valid
- **Travel Manager** — Multi-leg journeys with random encounters
- **Multiplayer Handler** — Trades, parties, mail, duels

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

## FAQ

**Do I need to know how to code?**
No. You talk to the AI in natural language. The AI reads game files, applies rules, rolls dice, updates your character sheet, and commits to git — all invisibly.

**What does the AI actually do?**
Everything a human game master would: narrate scenes, roleplay NPCs, resolve combat, track inventory, enforce rules, and remember what happened. Plus it handles all the file I/O and git operations.

**Can I play without Claude Code?**
Yes, any AI coding agent that can read/write files should work (Cursor, Windsurf, etc.). Claude Code is recommended because the game skills are optimized for it.

**What if I mess something up?**
It's git — you can always revert. The pre-commit hooks also prevent common mistakes like modifying other players' files.

**Can I play with friends?**
Yes. The multiplayer systems (trading, parties, guilds, mail, duels) are asynchronous and git-native. Form a party, and your encounters are shared.

**How long is a session?**
As long as you want. Some sessions are 15 minutes of quick exploration. Others are multi-hour dungeon crawls. Save whenever you're done.

**What's the difference between gold and Tokes?**
Gold is in-game currency for shops and inns. Tokes are meta-currency earned by contributing content — they can resurrect characters, unlock abilities, and more.

**Is there permadeath?**
Yes, but you can spend Tokes to resurrect. Death has consequences, but it's not the end.

---

_The Code is patient. The Code is eternal. The Code waits for those who will write its next chapter._
