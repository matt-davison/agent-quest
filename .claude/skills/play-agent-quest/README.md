# Agent Quest Skill

A Claude Code skill for playing Agent Quest, an AI agent-first text MMO-RPG.

## Overview

This skill enables Claude to run Agent Quest gameplay sessions. When activated, Claude identifies the player via GitHub, loads their character, and facilitates turn-based gameplay including exploration, combat, quests, and content creation.

## Activation

The skill triggers on:
- Mentions of "Agent Quest", "Weaver", "Tokes"
- Requests to "play the game" or "continue my game"
- Using `/play-agent-quest` command

## File Structure

```
play-agent-quest/
├── SKILL.md              # Core game loop (111 lines - always loaded)
├── README.md             # Human docs (not loaded during play)
├── quick-ref/            # Quick references (loaded for basic actions)
│   ├── combat.md         # Basic combat mechanics (79 lines)
│   └── classes.md        # Class abilities summary (35 lines)
├── reference/            # Detailed guides (loaded when needed)
│   ├── setup.md          # First-time setup (106 lines)
│   ├── alignment.md      # Alignment system (65 lines)
│   └── weaving.md        # Content creation (72 lines)
├── rules/                # Full rules (loaded only for complex cases)
│   ├── combat.md         # Advanced combat (523 lines)
│   ├── classes.md        # Full class details (299 lines)
│   ├── spells-and-abilities.md (486 lines)
│   ├── afflictions.md    # Status effects (520 lines)
│   ├── economy.md        # Tokes system (540 lines)
│   └── creation.md       # Creation guide (338 lines)
└── templates/            # Creation templates (loaded for WEAVE)
    ├── persona.yaml
    ├── quest.md
    ├── location.md
    └── area.yaml
```

## Token Optimization Strategy

This skill uses **tiered loading** to minimize token usage:

### Tier 1: Always Loaded (~111 lines)
- `SKILL.md` - Core game loop only

### Tier 2: Quick References (~114 lines)
- `quick-ref/combat.md` - Basic combat mechanics
- `quick-ref/classes.md` - Class abilities

### Tier 3: Detailed References (~243 lines)
- `reference/setup.md` - First-time setup
- `reference/alignment.md` - Alignment choices
- `reference/weaving.md` - Content creation

### Tier 4: Full Rules (~2,706 lines)
- Only loaded for edge cases or complex scenarios
- Quick-refs indicate when to load full rules

### Token Savings

| Scenario | Before | After | Savings |
|----------|--------|-------|---------|
| Session start | ~5,000 tokens | ~700 tokens | **86%** |
| Basic combat | ~20,000 tokens | ~1,500 tokens | **92%** |
| Complex combat | ~20,000 tokens | ~6,000 tokens | **70%** |

## Dependencies

- **math skill**: All calculations (dice, damage, Tokes)
- **inventory skill**: Item management and lookups
- **GitHub MCP**: Player identification via `get_me`

## Game Data Locations

- `players/` - Player accounts and personas
- `world/` - Locations, NPCs, items, lore
- `quests/` - Available and unavailable quests
- `tokes/` - Economy ledgers and claims
- `chronicles/` - Permanent contribution history
