# Location Template

Create locations using this file-based vector database structure:

```
world/locations/<location-id>/
├── location.yaml      # Core metadata, coordinates, connections
├── README.md          # Human-readable description
└── areas/
    ├── <area-id>.yaml # Individual area details
    └── ...
```

Also update:
- `world/locations/index.yaml` - Add location to the registry with coordinates
- `world/locations/graph.yaml` - Add connections with distances

---

## 1. location.yaml

```yaml
# Location: [Name]
# Vector database entry for spatial queries and relationships

id: "location-id"
name: "Location Name"
tagline: "Atmospheric one-liner."

# Spatial data (for vector database queries)
coordinates:
  x: 0       # Relative to Nexus Station (0,0)
  y: 0       # 1 unit = 1 league (~3 miles, ~1 hour walking)
  z: 0       # Elevation layer (0 = ground)

# Semantic embedding placeholder
embedding: null  # Populated by embedding service

# Classification
region: "Region Name"
type: hub | dungeon | wilderness | settlement | academy | special
danger_level: safe | low | medium | high | extreme
is_safe_zone: true | false

# Level range for encounters (null for safe zones)
# See rules/difficulty.md for danger_level to level mappings
level_range:
  min: 2        # Lowest-level creatures spawn here
  max: 6        # Highest-level creatures spawn here
  sweet_spot: 4 # Optimal challenge level for this area
  # Danger level mappings:
  # - low:     1-4, sweet: 2
  # - medium:  2-6, sweet: 4
  # - high:    5-9, sweet: 7
  # - extreme: 7-10, sweet: 9

# Tags for search and filtering
tags:
  - "keyword1"
  - "keyword2"

# Areas within this location
areas:
  - id: "area-id"
    name: "Area Name"
    type: "area-type"

# NPCs present
npcs:
  - id: "npc-id"
    name: "NPC Name"
    area: "area-id"

# Connections to other locations (with distances)
connections:
  - target: "location-id"
    direction: "direction-name"
    distance: 10          # In leagues
    travel_time: "10 hours walking"
    requirements: null    # Or list of requirements
    danger: "low"         # Optional

# Random encounter table
encounters:
  enabled: true | false
  table:
    - roll: [1, 2]
      event: "Event description"
    - roll: [3, 6]
      event: "Nothing happens"

# Secrets (hidden until discovered)
secrets:
  - id: "secret-id"
    requirements:
      - "Requirement 1"
      - "Requirement 2"

# Metadata
metadata:
  github: "your-github-username"
  created_date: "YYYY-MM-DD"
  last_modified: "YYYY-MM-DD"
  version: "1.0"
```

---

## 2. areas/<area-id>.yaml

```yaml
# Area: [Name]
# Part of: [Parent Location]

id: "area-id"
name: "Area Name"
parent_location: "location-id"
type: plaza | marketplace | inn | library | training | special | etc

description: |
  2-3 paragraphs describing the area with sensory details.
  What do you see, hear, smell? What's the atmosphere?

# Position within the parent location
local_coordinates:
  x: 0
  y: 0
  floor: 1

# Connected areas within the same location
connected_areas:
  - id: "other-area-id"
    direction: "north"
    distance: 0.1  # In leagues (usually small fractions)

# Interactions available
interactions:
  - action: "action-verb"
    target: "target-name"
    description: "What happens"

# NPCs typically found here
npcs:
  - id: "npc-id"
    name: "NPC Name"
    role: "Their Role"
    always_present: true | false

# Shops (if applicable)
shops:
  - id: "shop-id"
    name: "Shop Name"
    proprietor: "npc-id"
    inventory:
      - item: "Item Name"
        price: 50
        stock: -1  # -1 = unlimited

# Services (if applicable)
services:
  - id: "service-id"
    name: "Service Name"
    options:
      - name: "Option Name"
        price: 25
        effect: "What it does"

# Secrets in this area
secrets:
  - id: "secret-id"
    trigger: "How to discover it"
    content: "What is revealed"

# Special properties
properties:
  safe_zone: true
  commerce_enabled: false
  training_enabled: false

# Atmospheric details
atmosphere:
  lighting: "Description of lighting"
  sounds: "What you hear"
  smells: "What you smell"
```

---

## 3. README.md

Keep the human-readable description for players. See existing locations for format:
- Atmospheric description
- Points of Interest (now reference areas/)
- NPC summary table
- Shops & Services summary
- Connections table (with distances)
- Encounter table
- Secrets (in spoiler tags)
- Lore connections

---

## 4. Update index.yaml

Add to `world/locations/index.yaml`:

```yaml
locations:
  your-location-id:
    name: "Your Location Name"
    coordinates: [x, y]
    region: "Region Name"
    type: "location-type"
    danger_level: "safe"
    searchable_tags:
      - "tag1"
      - "tag2"
```

---

## 5. Update graph.yaml

Add connections to `world/locations/graph.yaml`:

```yaml
connections:
  - from: "your-location-id"
    to: "connected-location-id"
    distance: 10  # In leagues
    travel_type: "walking"
    path: "Description of the route"
    requirements: null
    danger: "low"
```

---

## 6. World Expansion Rule

**Every new location MUST spawn connected frontier locations** to keep the world perpetually expanding. These are lightweight stubs — just enough to exist on the map and tempt exploration.

### How Many Frontiers?

Scale with the location's importance, size, and lore significance:

| Location Scale | Frontiers | Examples |
|---|---|---|
| Minor (small camp, single-purpose site) | 1-2 | A hermit's cave, a roadside shrine |
| Typical (settlement, dungeon, landmark) | 3-5 | A trading post, a forest ruin, a bandit fortress |
| Major (capital city, world hub, lore-critical) | 5-8 | Nexus Station, Lumina City, a seat of power |

Most locations should land in the 3-5 range. Use 1 as the absolute minimum and 8 as the upper limit for truly massive or lore-significant places.

### Frontier Location Stubs

For each new location, add entries to `_meta.yaml` under `unexplored_connections` and to `graph.yaml`:

```yaml
# _meta.yaml - add frontier stubs per new location
unexplored_connections:
  - from: "your-new-location"
    to: "frontier-location-id"
    notes: "Rumor or hint about this place"
    status: "unexplored"
```

At least one frontier connection should be **hidden** — locked behind a requirement so it isn't immediately visible to the persona:

```yaml
# In the parent location.yaml connections list
connections:
  # Open frontier — visible on arrival
  - target: "the-shattered-basin"
    direction: "north-trail"
    distance: 12
    travel_time: "12 hours walking"
    requirements: null
    danger: "medium"

  # Hidden frontier — locked behind progress
  - target: "vault-of-echoes"
    direction: "hidden-passage"
    distance: 3
    travel_time: "3 hours walking"
    requirements:
      - "Quest complete: the-lost-cartographer"
      - "Perception >= 14"
    danger: "high"
```

### Guidelines

- **Open frontiers**: Visible connections that players can travel to immediately. They pull players forward into the unknown.
- **Hidden frontiers** (at least 1 per location): Locked behind quest completion, stat checks, NPC standing, secret discovery, or other requirements. These reward thorough exploration and progression.
- Frontier stubs don't need full `location.yaml` files yet — they get fleshed out when a player first travels there. The stub in `unexplored_connections` and the connection entry are enough.
- Frontier names and hints should be evocative and genre-appropriate. The rumor text is what NPCs or environmental clues might reference.
- When a frontier location is eventually created (because a player travels there), it in turn spawns its own frontiers, continuing the cycle.

---

## Distance Reference

- 1 league ≈ 3 miles ≈ 1 hour walking
- Nexus Station is at coordinates (0, 0)
- Adjacent areas within a location: 0.05-0.15 leagues
- Connected buildings (like Athenaeum from Nexus): 0.5-1 league
- Nearby settlements: 10-30 leagues
- Distant locations: 50+ leagues
