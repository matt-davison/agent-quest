# Party System

Form groups for shared adventures, encounters, and loot distribution.

## How Parties Work

1. **Leader creates party** - Sets name, settings, max size
2. **Invitations sent** - Invite files created for targets
3. **Members join** - Accept invite, added to roster
4. **Shared adventures** - Party travels and fights together
5. **Loot distributed** - According to party settings

## Party Lifecycle

```
FORMING → ACTIVE → DISBANDED
              ↘ FULL (at max members)
```

## File Locations

- `active/<party-id>.yaml` - Party state and roster
- `invites/<github>-<party-id>.yaml` - Pending invitations
- `encounters/<encounter-id>.yaml` - Shared combat encounters
- `players/<github>/personas/<char>/party-membership.yaml` - Character's party link

## Loot Distribution Modes

| Mode | Description |
|------|-------------|
| `round-robin` | Rotate through members |
| `need-greed` | Members roll, highest wins |
| `leader` | Leader assigns all loot |
| `free-for-all` | First to claim gets it |

## Party Decisions

Some decisions require party consensus:
- Travel to new location
- Accept/abandon quests
- Distribute valuable loot

Decision status: `pending` → `approved` | `rejected`

## Rules

- Character can only be in ONE party at a time
- Party must have exactly one leader
- If leader goes inactive, longest-serving active member promoted
- Absent members marked as such during encounters
