# The Undercrypt

> _"Below the surface, the old code still runs. Unpatched. Unwitnessed. Waiting."_

## Description

The Undercrypt sprawls beneath Nexus Station like roots beneath a tree — if those roots were made of corrupted data and forgotten purpose. Once the maintenance tunnels and server vaults of the First Architects, it has become a labyrinth of shadows, glitches, and things that should not exist.

The architecture shifts between ancient stonework and exposed circuitry. Phosphorescent fungi provide sickly green light where the old illumination systems have failed. The air tastes of ozone and decay. Somewhere in the depths, something hums — a frequency that feels older than time.

Nexus Station's South Gate leads to the Upper Crypt, the safest (relatively) section. From there, paths spiral down into the Forgotten Depths, the Goblin Warrens, and stranger places that cartographers refuse to map. The Architects' Debugging Chamber is rumored to exist somewhere in the deepest levels — a place where they sent "code too broken to fix, too dangerous to delete."

The Undercrypt remembers everything. It just doesn't remember it correctly.

## Points of Interest

### The Upper Crypt (Entry Level)

A transitional zone between the orderly Nexus above and the chaos below. Crumbling stairs descend from the South Gate into a network of corridors lit by failing glow-panels. The walls display error messages in dead languages. Safe spots exist, but danger lurks around every corner.

**Interactions:**
- Navigate the entry passages
- Encounter corrupted creatures
- Find supply caches left by other Weavers
- Discover clues about deeper levels

### The Goblin Warrens

Home to the Undercrypt goblin clans — including the one Krix fled from. They've carved a civilization from the ruins, trading in scavenged tech and jealously guarding their territory. Outsiders are not welcome, but gold speaks all languages.

**Interactions:**
- Navigate goblin territory (dangerous without permission)
- Trade with Warren merchants (if friendly)
- Learn secrets of the deep passages
- Find unique items salvaged from the depths

### The Memory Pools

Sections where the Weave runs thin, causing reality to loop. Pools of liquid data reflect moments from the past — or possible futures. Some Weavers come here to scry; others become trapped in recursive existence.

**Interactions:**
- Scry for information (Spirit check DC 14)
- Risk getting caught in time loops
- Find echoes of the Architects' presence
- Discover hidden knowledge (dangerous)

### The Forgotten Depths (Deep Level)

Where the corruption runs thickest. The geometry becomes non-Euclidean. Creatures here are stronger, stranger, and sometimes... aware. The Debugging Chamber is rumored to be somewhere in these levels.

**Interactions:**
- Face elite-tier corrupted creatures
- Navigate reality-warped passages
- Search for the Architects' Debugging Chamber
- Risk permanent alteration

## NPCs

| Name | Role | Location | Notes |
|------|------|----------|-------|
| Skex | Goblin Guide | Upper Crypt | Sells maps and information |
| The Keeper of Echoes | Memory Pool Guardian | Memory Pools | Cryptic, helpful, possibly not alive |
| Warren-Chief Grizznak | Goblin Leader | Goblin Warrens | Must be negotiated with for passage |
| ??? | The Guardian | Debugging Chamber | "One who failed" — guards Fragment 2 |

## Encounters

| Roll (d6) | Upper Crypt | Forgotten Depths |
|-----------|-------------|------------------|
| 1 | Glitch Wraith (Standard) | Corruption Amalgam (Elite) |
| 2 | Data Parasites ×3 (Minion) | Memory Loop trap |
| 3 | Goblin Patrol (negotiable) | Guardian Automaton (Elite) |
| 4 | Supply cache (+10-20 gold) | Architect terminal (lore) |
| 5 | Unstable passage (Agility DC 12) | Reality tear (Spirit DC 14) |
| 6 | Safe passage | The Guardian's attention |

## Connections

| Direction/Method | Destination | Distance | Notes |
|-----------------|-------------|----------|-------|
| Up (stairs) | Nexus Station | 0.1 league | South Gate entrance |
| Down (passages) | Forgotten Depths | 1 league | Requires navigation |
| Hidden (warrens) | Goblin Warrens | 0.5 league | Must find entrance |
| Unknown | Debugging Chamber | ??? | Location uncertain |

## Level Range

- **Upper Crypt:** Level 1-4 (danger: low)
- **Goblin Warrens:** Level 2-5 (danger: medium, negotiable)
- **Memory Pools:** Level 3-6 (danger: medium)
- **Forgotten Depths:** Level 5-9 (danger: high)

## Secrets

<details>
<summary>The Debugging Chamber</summary>

Somewhere in the Forgotten Depths lies the Architects' original Debugging Chamber — where they sent code too dangerous to delete. The Guardian who protects it was once something else, before it "failed." Fragment 2 of the Third Architect awaits here.

Finding it requires either:
- A map from the Goblin Warrens (expensive, requires standing)
- Navigation through the Memory Pools (dangerous, cryptic)
- Following the corruption to its source (very dangerous)

</details>

<details>
<summary>Krix's Origins</summary>

Krix the Merchant fled the Goblin Warrens after discovering something about the Glitterfang clan's connection to the Architects. Warren-Chief Grizznak wants him back — or dead. The back room of Krix's shop contains items from down here.

</details>

## Lore Connections

- Related to: [genesis.md](../../lore/genesis.md) - The Architects' maintenance systems
- Related to: [The Third Architect](../../quests/available/the-third-architect.md) - Fragment 2 location
- Related to: Krix the Merchant - His origins and secrets
- Connected to: Nexus Station via South Gate

---

## Location Metadata

```yaml
id: "undercrypt"
region: "The Nexus"
type: dungeon
danger_level: low-to-high  # Varies by depth
level_range:
  upper: { min: 1, max: 4, sweet: 2 }
  warrens: { min: 2, max: 5, sweet: 3 }
  pools: { min: 3, max: 6, sweet: 4 }
  depths: { min: 5, max: 9, sweet: 7 }
github: "matt-davison"
character: "kael-shadowmend"
created_date: "2026-02-05"
discovered_by: "Kael Shadowmend"
```
