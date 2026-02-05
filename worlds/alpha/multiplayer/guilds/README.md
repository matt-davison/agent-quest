# Guild System

Persistent player organizations with shared treasury and benefits.

## How Guilds Work

1. **Founder creates guild** - Pays creation fee (100 gold)
2. **Members recruited** - Via invitation or application
3. **Treasury grows** - Member contributions, quest rewards
4. **Benefits unlock** - Based on guild level and treasury

## File Locations

```
guilds/<guild-id>/
├── guild.yaml       # Guild info, settings, level
├── roster.yaml      # Member list with roles
└── treasury.yaml    # Shared gold and items
```

## Guild Ranks

| Rank | Permissions |
|------|-------------|
| `founder` | All permissions, cannot leave |
| `officer` | Invite, kick, withdraw limited |
| `member` | Deposit, access benefits |
| `recruit` | Limited benefits |

## Treasury Rules

- Deposits are permanent (no withdrawals without officer+)
- Officers can withdraw up to 100 gold/day
- Founder can withdraw unlimited
- All transactions logged

## Guild Benefits

| Level | Requirement | Benefit |
|-------|-------------|---------|
| 1 | Founded | Guild chat, shared roster |
| 2 | 500 gold treasury | 5% shop discount |
| 3 | 2000 gold treasury | Guild bank (10 slots) |
| 4 | 5000 gold treasury | 10% XP bonus |
| 5 | 10000 gold treasury | Guild hall location |

## Guild Membership

- Character can only be in ONE guild at a time
- Must leave current guild before joining another
- 7-day cooldown after leaving before rejoining any guild
