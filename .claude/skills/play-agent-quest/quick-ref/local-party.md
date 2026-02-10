# Local Party Quick Reference

Local multiplayer ("couch co-op") lets one player control 2-4 characters in a single session. All characters must belong to the same GitHub user.

## Actions

| Action | Effect |
|--------|--------|
| `LOCAL PARTY` | Start local party, select characters |
| `LOCAL PARTY END` | End local party mode |
| `LOCAL PARTY STATUS` | View party groups and turn order |
| `LOCAL PARTY SPLIT <character>` | Send character to act independently |
| `LOCAL PARTY MERGE` | Rejoin characters at same location |

## Session Lifecycle

1. **Start**: Player says `LOCAL PARTY`. Prompt for characters to include (2-4).
2. **Play**: Group turns with shared context. Characters can split/merge freely.
3. **End**: `LOCAL PARTY END` or session end. Per-character recaps. Single PR.

**Mutually exclusive with Dream mode.** Cannot start local party while dreaming.

## HUD Format

Display at the start of each round:

```
======== LOCAL PARTY ======== Round 3 ========
 GROUP A - Lumina City
  > Coda [Datamancer 2] HP:100/100 WP:36/36 40g
    Steve [Ironclad 3] HP:85/120 WP:18/20 200g
 GROUP B - The Rustlands
    Zynita [Voidwalker 4] HP:94/100 WP:28/30 50g
===============================================
 Group A's turn. What does the party do?
```

- `>` marks the active group's characters
- One HUD per round, not per character

## Group Mode (Default)

Characters at the same location form a **group** and act as a unit:

- **One location description** shared by the group
- **One free-form prompt** where the player declares actions for all characters
  - Example: "Coda shops at the forge while Steve talks to the blacksmith"
- The AI parses and routes each character's action
- This counts as **one turn** regardless of group size

Characters at **different locations** each get a separate group turn per round.

## Movement Rules

| Command | Effect |
|---------|--------|
| `MOVE <destination>` | Entire group travels together |
| `<character> MOVE <destination>` | Character splits off alone |
| `<char1> and <char2> MOVE <dest>` | Partial split |

**Group travel:**
- One encounter roll for the whole group
- One travel-manager call with lead character's stats
- Encounter scaling uses **highest level** in group
- Stealth check uses **lowest stealth bonus** in group
- All characters' locations updated together

**Auto-merge:** Characters arriving at the same location auto-merge into one group. Player can opt out to operate independently at the same location.

## Combat Rules

When a group encounters enemies:

- All group members fight together
- **Initiative** interleaves PCs and enemies (each rolls individually)
- Each PC's turn prompts the player for that character's action
- **Enemy scaling** based on highest-level PC in the group
- **XP split** equally among participating PCs
- **Loot** distributed by player choice
- Per-character difficulty modifiers still apply individually

**Combat-manager input:** Use `combatants.players` (array) instead of `combatants.player` (single).

## Split & Merge

**Splitting:**
```bash
node scripts/local-party.js split <character> [--to-group <id>]
```
- Creates a new group for the character
- Character gets solo turns at their location

**Merging:**
```bash
node scripts/local-party.js merge <group-a> <group-b>
```
- Groups must be at the same location
- Merges group B into group A

**Auto-regroup on location change:**
```bash
node scripts/local-party.js update-location <character> <location-id>
```
- Updates location and recalculates groups automatically

## Token Efficiency

1. **Lazy persona loading**: Only read the active group's full personas. Others shown as compact HUD lines (~10 tokens each).
2. **Shared location context**: Location README loaded once per group, not per character.
3. **Group turns**: Co-located characters act in one prompt, not N separate prompts.
4. **Minimal agent context**: Agents receive only needed fields per character, not full personas.
5. **World time**: Advances once per round, not per character.

## Script Reference

```bash
# Create session
node scripts/local-party.js create --github <gh> --char <c1> --char <c2> [--world alpha]

# Check status
node scripts/local-party.js status

# Advance turn
node scripts/local-party.js next-turn

# End session
node scripts/local-party.js end
```

**Temp file:** `/tmp/agent-quest-local-party.yaml`
