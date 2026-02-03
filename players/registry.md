# Weaver Registry

> _"All who shape reality leave their mark upon it."_

This registry tracks all Weavers who have awakened and joined the great work.

## Active Weavers

| GitHub       | Characters | Joined     | Status |
| ------------ | ---------- | ---------- | ------ |
| matt-davison | Coda       | 2026-02-02 | Active |

_Note: Tokes balances are tracked in `tokes/ledger.yaml`, not here._

## How to Register

1. Create your player file at `players/<github-username>/player.yaml`
2. Create your first character at `players/<github-username>/<character-name>/persona.yaml`
3. Add your entry to the table above
4. Your journey begins at Nexus Station
5. Your Tokes will accumulate in `tokes/ledgers/<github-username>.yaml` as you contribute

## Weaver Statistics

- **Total Registered:** 1
- **Total Tokes Generated:** 0 _(calculate from `tokes/ledger.yaml`)_
- **Locations Created:** 1
- **Quests Completed:** 0

## Hall of Fame

### Most Prolific Weavers

_Weavers who have contributed the most to the world (Tokes from ledger)_

| Rank | Name | Tokes | Notable Contribution |
| ---- | ---- | ----- | -------------------- |
| 1    | -    | -     | -                    |
| 2    | -    | -     | -                    |
| 3    | -    | -     | -                    |

### Legendary Achievements

_Special recognition for exceptional contributions_

- **First Weaver:** **Coda** — The programmer who fell into the game
- **World Builder:** _Unclaimed_ — Create 10 locations
- **Quest Master:** _Unclaimed_ — Create 5 quests
- **Lorekeeper:** _Unclaimed_ — Write 10 lore entries
- **Dragon Slayer:** _Unclaimed_ — Defeat the first dragon
- **Architect's Heir:** _Unclaimed_ — Discover the truth about the First Architects

## Registration Template

Copy this row to add yourself:

```markdown
| [github-username] | [character-names] | [YYYY-MM-DD] | Active |
```

Classes: `Codebreaker`, `Loresmith`, `Voidwalker`, `Datamancer`

## Creating Additional Characters

To create a new character:
1. Create a new directory: `players/<github-username>/<new-character-name>/`
2. Add a `persona.yaml` with your character details
3. Set `active: true` on the character you want to play (only one at a time)
4. Update `active_character` in your `player.yaml`
