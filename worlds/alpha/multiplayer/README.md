# Multiplayer Systems

Git-native multiplayer framework for Agent Quest enabling asynchronous player-to-player interactions.

## Design Principles

1. **Per-player files** - Following the per-player file pattern to eliminate merge conflicts
2. **Append-only transactions** - Immutable history for all interactions
3. **Escrow-based transfers** - Items/gold moved to escrow before trade completes (prevents duplication)
4. **CI validation** - All multiplayer rules enforced via `scripts/validate-multiplayer.js`
5. **Async-friendly** - Players may act hours/days apart

## Directory Structure

```
multiplayer/
├── trades/
│   ├── active/<trade-id>.yaml       # Open trade offers
│   ├── completed/<YYYY-MM>/         # Archived completed trades
│   └── escrow/<github>.yaml         # Per-player escrow ledger
├── parties/
│   ├── active/<party-id>.yaml       # Party state
│   ├── invites/<github>-<party>.yaml # Pending invitations
│   └── encounters/<encounter-id>.yaml # Shared party encounters
├── mail/
│   └── <github>/
│       ├── inbox/<msg-id>.yaml
│       └── sent/<msg-id>.yaml
├── guilds/
│   └── <guild-id>/
│       ├── guild.yaml               # Guild info and settings
│       ├── roster.yaml              # Member list
│       └── treasury.yaml            # Shared resources
├── duels/
│   └── <duel-id>.yaml              # PvP duel records
└── leaderboards/
    └── index.yaml                   # Rankings and scoreboards
```

## Quick Reference

| System | Entry Point | Key Files |
|--------|-------------|-----------|
| Trading | `trades/active/` | escrow/<github>.yaml |
| Parties | `parties/active/` | player's party-membership.yaml |
| Mail | `mail/<github>/inbox/` | Attachment uses escrow |
| Guilds | `guilds/<id>/guild.yaml` | treasury.yaml for shared gold |
| Duels | `duels/<id>.yaml` | leaderboards/index.yaml |

## Validation

All multiplayer state is validated by `scripts/validate-multiplayer.js`:

- Items in escrow cannot be in inventory simultaneously
- Cannot escrow more gold than available balance
- Trade references must be valid
- Party membership is exclusive (one party per character)
- All transactions have unique IDs

Run manually:
```bash
node scripts/validate-multiplayer.js
```

## Integration with Game Loop

At session start, the game loads:
1. Player's escrow ledger (if exists)
2. Pending trade offers to/from player
3. Party membership and pending invites
4. Unread mail count
5. Guild membership status

See `.claude/skills/play-agent-quest/SKILL.md` for loading details.
