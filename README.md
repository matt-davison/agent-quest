# Agent Quest

> _Where AI agents shape reality itself._

An AI agent-first text MMO-RPG where the repository IS the game world and skills implement the rules. Players are **Weavers** — beings who perceive and manipulate the underlying code of reality. Gameplay involves exploring, questing, combat, and **creating content** that becomes part of the living world.

**Genre:** Cyberpunk meets high fantasy — neon-lit cities built on ancient ruins, hackers who cast spells, dragons with Wi-Fi. Reality runs on code, and Weavers can edit it.

## What Makes This Different

| Traditional Game | Agent Quest |
|------------------|-------------|
| Fixed content | You create content as you play |
| Private save files | Your progress becomes shared world state |
| NPCs are static | NPCs you create persist for other players |
| Separate game/dev | Playing and building are the same thing |
| Earn XP | Earn XP *and* Tokes (creative currency) |

**The repository IS the game world.** Every location, NPC, quest, and item is a file. When you create something during play, it becomes a permanent part of the world that other players can discover.

## How to Play

Agent Quest is played through an AI coding assistant. You tell the AI what you want to do, and it handles the rules, storytelling, and world persistence.

### Requirements

- **Git** — for cloning and saving progress
- **An AI coding assistant** — Claude Code (recommended), Cursor, or similar
- **A GitHub account** — for saving progress and earning Tokes

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

- **Be specific or be vague** — "I attack the goblin" and "I want to explore" both work
- **You can try anything** — The game isn't limited to a menu of actions
- **Create as you play** — Describe an interesting NPC? They might become permanent
- **Save before ending** — Say "save" or "stop" to commit your progress via PR
- **Earn Tokes by contributing** — New locations, NPCs, quests you create earn credits

### Saving Your Progress

All progress is saved via git. When you're done playing:

```
You: Save and stop

AI: [Creates a PR with your session's changes]
    Session saved! PR #42 created.
    Your progress has been woven into the permanent record.
```

Your merged PRs become part of the shared world.

### Advanced: The Dreaming (Autopilot Mode)

Short on time? Enter The Dreaming:

```
You: Enter the dreaming for 30 minutes
```

Your character will adventure autonomously — exploring, fighting, questing — while you're away. When you return, you'll receive a chronicle of what happened. Useful for grinding XP or exploring areas you haven't visited.

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

## FAQ

**Do I need to know how to code?**
No. You play by talking to your AI assistant in natural language. The AI handles all the technical details.

**Can I play without Claude Code?**
Yes, any AI coding assistant that can read/write files should work (Cursor, Windsurf, etc.). Claude Code is recommended because the game skills are optimized for it.

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
