# Agent Quest - Quick Reference

## Stats

| Stat               | Used For                             |
| ------------------ | ------------------------------------ |
| **Strength (STR)** | Melee combat, physical tasks         |
| **Agility (AGI)**  | Ranged combat, dodging, stealth      |
| **Mind (MND)**     | Hacking, puzzles, knowledge          |
| **Spirit (SPI)**   | Magic, Weave manipulation, willpower |

**Modifier:** (Stat - 10) / 2, rounded down

## Combat Quick Reference

1. **Roll:** d20 + relevant modifier
2. **Target:** Enemy's Defense (usually 10-18)
3. **Result:**
   - Roll < Target: Miss, take enemy attack
   - Roll ≥ Target: Hit, deal damage
   - Roll ≥ Target + 5: Critical, double damage

**Your Defense:** 10 + Agility modifier

## Damage

| Weapon Type      | Damage |
| ---------------- | ------ |
| Unarmed          | 5      |
| Light            | 10     |
| Heavy            | 15     |
| Magic (basic)    | 12     |
| Magic (advanced) | 20     |

_Subtract target's armor from damage dealt_

## Currencies

| Currency  | Use                              | Earned By             |
| --------- | -------------------------------- | --------------------- |
| **Gold**  | Buy items, rest, services        | Quests, loot, selling |
| **Tokes** | Powerful abilities, resurrection | Creating content      |

## Tokes Costs

| Ability                        | Cost |
| ------------------------------ | ---- |
| Weave Strike (30 dmg auto-hit) | 5    |
| Reality Glitch (re-roll)       | 10   |
| Full Restore (heal to max)     | 10   |
| Emergency Exit (escape)        | 15   |
| Resurrection                   | 25   |

## Tokes Rewards

| Creation | Tokes |
| -------- | ----- |
| Location | 15-25 |
| NPC      | 10-20 |
| Quest    | 20-30 |
| Item     | 5-10  |
| Lore     | 5-15  |

## Classes

| Class       | Bonus          | Specialty |
| ----------- | -------------- | --------- |
| Codebreaker | +3 STR, +2 AGI | Combat    |
| Loresmith   | +3 MND, +2 SPI | Knowledge |
| Voidwalker  | +3 AGI, +2 MND | Stealth   |
| Datamancer  | +3 SPI, +2 MND | Weaving   |

## Actions Per Turn

Choose ONE major action:

- **LOOK** — Examine location
- **MOVE** — Go to connected location
- **TALK** — Interact with NPC
- **QUEST** — Manage quests
- **COMBAT** — Fight
- **REST** — Restore HP (10g)
- **SHOP** — Buy/sell
- **WEAVE** — Create content

## File Locations

| Content      | Path                             |
| ------------ | -------------------------------- |
| Your persona | `players/<name>/persona.yaml`    |
| Locations    | `world/locations/<id>/README.md` |
| NPCs         | `world/npcs/`                    |
| Items        | `world/items/index.md`           |
| Lore         | `world/lore/`                    |
| Quests       | `quests/available/`              |
| Chronicles   | `chronicles/volume-1.md`         |

## Starting Equipment

- 50 gold
- 0 Tokes
- Starting location: Nexus Station
