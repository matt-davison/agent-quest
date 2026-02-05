# Duel System

Player-vs-player competitive combat with rankings.

## How Duels Work

1. **Challenger issues challenge** - Optional wager
2. **Target accepts** - Wagers escrowed
3. **Combat resolves** - Turn-based using combat rules
4. **Winner determined** - Wagers transfer, ranking updated

## File Locations

- `duels/<duel-id>.yaml` - Duel state and combat log
- `leaderboards/index.yaml` - Rankings and statistics

## Duel Types

| Type | Description |
|------|-------------|
| `friendly` | No wager, no ranking impact |
| `ranked` | Affects leaderboard standing |
| `wagered` | Gold/items at stake |
| `tournament` | Part of organized event |

## Duel Lifecycle

```
CHALLENGED → ACCEPTED → IN_PROGRESS → COMPLETED
          ↘ DECLINED
          ↘ EXPIRED (24h)
```

## Combat Rules

Duels use standard combat system with modifications:
- No fleeing allowed
- Reduced death penalty (respawn with 1 HP)
- Items/abilities same as PvE
- Turn order by Agility roll

## Wagering

- Wagers held in escrow during duel
- Winner takes all on completion
- Draw returns wagers to both
- Forfeit awards wager to opponent

## Rankings

Elo-based rating system:
- Starting rating: 1000
- Win against higher-rated: +30 to +50
- Win against lower-rated: +10 to +20
- Loss: inverse of above
