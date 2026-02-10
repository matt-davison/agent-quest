# Followers Quick Reference

Followers are NPCs or creatures that travel and fight alongside a player character. They are stored in the player's `persona.yaml` under a top-level `followers:` array.

## Follower Limit

The maximum number of active followers scales with player level, configured in `worlds/<world>/world.yaml` under `settings.followers.max_by_level`:

| Player Level | Max Followers |
|-------------|---------------|
| 1-2 | 1 |
| 3-4 | 2 |
| 5-6 | 3 |
| 7-9 | 4 |
| 10 | 5 |

**Lookup rule:** Find the highest key in `max_by_level` that is <= the player's level. That value is their limit.

## Commands

| Command | Description |
|---------|-------------|
| `RECRUIT <NPC>` | Attempt to recruit an NPC as a follower |
| `DISMISS <follower>` | Release a follower permanently |
| `FOLLOWERS` | List all active followers with stats |
| `FOLLOWER <name> ATTACK <target>` | Direct follower to attack specific target |
| `FOLLOWER <name> DEFEND` | Set follower to defensive stance |
| `FOLLOWER <name> EQUIP <item>` | Give follower a weapon |
| `FOLLOWER <name> WAIT` | Park follower at current location |
| `FOLLOWER <name> FOLLOW` | Resume following (if parked) |
| `FOLLOWER <name> USE <ability>` | Direct follower to use an ability |

## Recruitment

Recruitment is narrative-driven, not mechanical. Requirements vary by NPC:
- Some NPCs join after completing a quest for them
- Some require persuasion or reputation thresholds
- Some are rescued and choose to follow
- Hostile creatures cannot be recruited (unless special quest/ability allows it)

**Source types:**
| Source | Description |
|--------|-------------|
| `npc` | Recruited from an existing NPC |
| `creature` | Tamed or befriended creature |
| `quest` | Granted as a quest reward |
| `summoned` | Created by an ability (reserved for future use) |

## Follower Schema (in persona.yaml)

```yaml
followers:
  - id: "scraps"                    # Unique ID
    name: "Scraps"
    source: "npc"                   # npc | creature | quest | summoned
    source_id: "scraps"             # NPC/creature/quest ID for provenance
    recruited_date: "2026-02-08"
    recruited_location: "eastern-approach"
    level: 1
    class: "Bandit"
    hp: 20
    max_hp: 20
    stats:
      strength: 12
      agility: 14
      mind: 8
      spirit: 8
    defense: 12
    weapon:
      name: "Rusty Sword"
      damage: "1d6"
      type: "melee"
    abilities: []
    loyalty: 60                     # 0-100
    disposition: "fearful"
    combat_role: "melee_dps"        # melee_dps | ranged_dps | tank | support
    combat_behavior: "aggressive"   # aggressive | defensive | support | passive
    active: true                    # false = parked at a location
    location: null                  # null = with player, else location ID
    afflictions: []
```

## Loyalty

Loyalty is a 0-100 value that reflects the follower's commitment. Changes are narrative-driven (not formula-based).

| Range | Label | Effect |
|-------|-------|--------|
| 0-19 | Hostile | Deserts at next opportunity |
| 20-39 | Reluctant | May refuse orders, flee combat |
| 40-59 | Neutral | Follows orders reliably |
| 60-79 | Devoted | Reliable, minor morale bonus |
| 80-100 | Fanatical | Never flees, +1 damage bonus |

**Loyalty changes via narrative events:**
- Winning a battle together: +5 to +10
- Protecting the follower from harm: +5
- Resting and caring for follower: +3
- Sending follower into danger recklessly: -5 to -10
- Follower reaches 0 HP in combat: -10
- Ignoring follower's needs or disposition: -5

At loyalty 0, the follower deserts permanently.

## Combat Behavior

Followers act automatically on their turn based on `combat_behavior`:

| Behavior | Priority |
|----------|----------|
| `aggressive` | Attacks lowest-HP enemy, pursues targets |
| `defensive` | Attacks nearest enemy, stays near player |
| `support` | Uses healing/buff abilities first, attacks only if no support needed |
| `passive` | Defends only, does not attack unless directly ordered |

The player can override automatic behavior with `FOLLOWER <name> <action>` during combat.

## Combat Rules

- **Initiative**: Followers roll separately (`1d20 + agility mod`), interleaved with all combatants. Initiative type: `"follower"`.
- **Auto-resolve**: On a follower's turn, combat-manager resolves based on `combat_behavior`. Player can override with `FOLLOWER <name> <action>`.
- **Targeting**: Enemies can target followers. Followers are valid targets for all attacks.
- **0 HP**: Follower is incapacitated (not killed). Recovers to 1 HP post-combat. Loyalty -10.
- **No XP or loot**: Followers don't earn XP and don't receive loot.
- **No difficulty modifiers**: Difficulty scaling is player-only; followers take/deal base damage.

## Travel Rules

- Followers with `active: true` and `location: null` automatically travel with the player
- **Stealth**: Uses lowest stealth bonus across player AND all active followers
- **Encounter scaling**: Uses highest level across player AND all active followers
- No separate location updates needed — followers move with player

## Parking and Retrieving

- `FOLLOWER <name> WAIT` — Parks follower at current location (`active: false`, `location: "<current>"`)
- `FOLLOWER <name> FOLLOW` — Must be at the follower's parked location to retrieve them
- Parked followers do not count against the follower limit
- Parked followers are not affected by travel or combat

## Death and Loss

- Followers cannot permanently die in normal combat (incapacitated at 0 HP, recover to 1 HP)
- Permanent loss happens only through narrative events (betrayal at 0 loyalty, sacrifice in a quest, etc.)
- A dismissed follower is gone permanently (may be re-recruited narratively if NPC still exists)

## State Storage

All follower data lives in `persona.yaml` under the `followers:` array. The state-writer handles:
- **Recruit**: Append new follower entry to `followers` section
- **Update**: Modify HP, loyalty, weapon, stats, active status, location
- **Dismiss**: Remove follower entry from array
