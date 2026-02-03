# ASCII Art Quick Reference

**When to generate ASCII art:**
- **LOOK** at a new location → Location panorama
- **Enter area** within location → Area scene
- **Combat starts** → Battle map
- **Explore dungeon** → Dungeon layout

---

## Location Panoramas

When a player **first arrives** at a location, generate a scene that captures its essence.

```
┌─────────────────────────────────────────────────────────────┐
│                    THE SYNTAX ATHENAEUM                     │
├─────────────────────────────────────────────────────────────┤
│                         ▲▲▲                                 │
│                       ╱│││╲                                 │
│                     ╱  │││  ╲        ░░                    │
│                   ╱────┼┼┼────╲     ░░░░                   │
│                 ╱══════╪╪╪══════╲   ░░░░░░                 │
│               ╱────────┼┼┼────────╲                         │
│             ╱══════════╪╪╪══════════╲    ⌂ ⌂              │
│           ┌────────────┴┴┴────────────┐                     │
│           │  ┌──┐  ╔════╗  ┌──┐  │     │                   │
│           │  │▒▒│  ║░░░░║  │▒▒│  │                         │
│       ════╪══╪══╪══╬════╬══╪══╪══╪════                     │
│                   THE GRAND ENTRANCE                        │
└─────────────────────────────────────────────────────────────┘
```

**Style by location type:**

| Type | Key Elements | Atmosphere |
|------|--------------|------------|
| Hub | Bustling, signs, multiple paths | `═` `║` `⌂` `☼` |
| Academy | Spires, books, mystical | `▲` `╱╲` `░` `▒` |
| Wilderness | Trees, terrain, paths | `♣` `♠` `~` `^` |
| Dungeon | Walls, doors, darkness | `█` `▓` `░` `┼` |
| Corrupted | Glitches, fragments | `█` `▒` `?` `!` |

---

## Area Scenes

When entering a specific **area within a location**, show what's immediately visible.

```
┌─────────────────────────────────────────────────────────────┐
│                   THE RECURSION LIBRARY                     │
├─────────────────────────────────────────────────────────────┤
│     ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐     ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐          │
│     │█│ │█│ │█│ │█│ │█│ ... │█│ │█│ │█│ │█│ │█│          │
│     │█│ │█│ │█│ │█│ │█│     │█│ │█│ │█│ │█│ │█│          │
│     └─┘ └─┘ └─┘ └─┘ └─┘     └─┘ └─┘ └─┘ └─┘ └─┘          │
│  ╔═══╗                                           ╔═══╗     │
│  ║ ☼ ║   The shelves loop back on themselves.    ║ ☼ ║     │
│  ╚═══╝   Books float between dimensions.         ╚═══╝     │
│                      ┌───────┐                              │
│          @           │ CACHE │    Reading desks             │
│         You          │  ⊙⊙⊙  │    scattered about.          │
│                      └───────┘                              │
│     [N] Deeper Stacks   [E] Study Alcoves   [S] Exit       │
└─────────────────────────────────────────────────────────────┘
```

**Include:**
- NPCs with names/symbols
- Interactive objects highlighted
- Exit directions at bottom

---

## Battle Maps

When **combat starts**, generate a tactical map showing:
- Terrain (cover, elevation, hazards)
- Combatant positions
- Interactive elements

```
┌─────────────────────────────────────────────────────────────┐
│                    COMBAT: PRACTICAL LABS                   │
├─────────────────────────────────────────────────────────────┤
│   LEGEND: @ You  E Enemy  # Cover  ~ Hazard  * Object      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ████████████████████████████████████████████           │
│     █                                          █           │
│     █   ┌───┐              ~~~                 █           │
│     █   │ * │  Control      ~                  █  ↑        │
│     █   └───┘  Panel        ~ Void Tear        █  N        │
│     █                       ~~~                 █           │
│     █   ####                          E2       █           │
│     █   #  #  Cover                   ☠        █           │
│     █                                          █           │
│     █          E1        ▓▓▓▓▓                 █           │
│     █          ☠         ▓##▓   Elevated       █           │
│     █                    ▓▓▓▓▓  Platform       █           │
│     █   @                                      █           │
│     █  Coda                                    █           │
│     █              [ENTRANCE]                  █           │
│     ████████████████████████████████████████████           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ TERRAIN: # Heavy Cover (+4 Def)  ~ Hazard (5 dmg/turn)     │
│ OBJECTS: * Control Panel (hackable)                         │
│ E1: Data Parasite (40 HP)   E2: Glitch Swarm (25 HP)       │
└─────────────────────────────────────────────────────────────┘
```

**Map symbols:**

| Symbol | Meaning |
|--------|---------|
| `@` | Player |
| `E` or `☠` | Enemy |
| `█` | Wall |
| `#` | Cover (heavy) |
| `░` | Cover (light) |
| `~` | Hazard |
| `*` | Interactive object |
| `▓` | Elevated terrain |
| `≈` | Water/liquid |
| `.` | Difficult terrain |

---

## Dungeon Layouts

When **exploring a dungeon**, show the discovered map.

```
┌─────────────────────────────────────────────────────────────┐
│                    THE UNDERCRYPT - LEVEL 1                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ┌───────┐         ┌───────┐                        │
│         │       │         │  ???  │   ? = Unexplored       │
│         │   T   ├────?────┤       │   @ = You              │
│         │       │         │       │   T = Treasure         │
│         └───┬───┘         └───────┘   ! = Danger           │
│             │                                               │
│         ┌───┴───┐                                          │
│         │       │         ┌───────┐                        │
│         │  @    ├─────────┤   !   │                        │
│         │       │         │       │                        │
│         └───┬───┘         └───────┘                        │
│             │                                               │
│         ┌───┴───┐                                          │
│         │       │                                          │
│         │ENTRY  │                                          │
│         │       │                                          │
│         └───────┘                                          │
│                                                             │
│  Rooms explored: 3/7   Secrets found: 0/?                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Box Drawing Characters

```
Corners:  ┌ ┐ └ ┘ ╔ ╗ ╚ ╝
Lines:    ─ │ ═ ║
T-joins:  ┬ ┴ ├ ┤ ╬ ╪ ╫
Cross:    ┼ ╋
Blocks:   █ ▓ ▒ ░
Arrows:   ↑ ↓ ← → ▲ ▼ ◄ ►
Misc:     ☼ ★ ⊙ ⌂ ♠ ♣ ☠ ⚡
```

---

## Style Guidelines

1. **Fixed width:** 60-65 characters wide
2. **Clear borders:** Use box drawing for structure
3. **Legend:** Include symbol explanations
4. **Atmosphere:** Match the location's tone
5. **Interactive:** Highlight things players can interact with
6. **Exits:** Show available directions

**Load [reference/ascii-visualizer.md](../reference/ascii-visualizer.md) for:**
- Detailed patterns for each location type
- Combat map generation procedures
- Dungeon mapping algorithms
- Advanced styling techniques
