---
name: world-state
description: Manage world time, weather, NPC locations, travel, and events in Agent Quest. Use for advancing time, checking weather conditions, finding NPCs based on schedules, managing player travel with encounters, and logging world events.
---

# World State System

Manage the living state of Agent Quest. Track time, weather, NPC schedules, and world events.

## Required Parameter: --world

**All commands require the `--world` parameter to specify which world to operate on.**

```bash
node .claude/skills/world-state/world-state.js <command> --world=alpha
```

The default world is `alpha`. See `worlds.yaml` for available worlds.

## Data Files

**Global State:**
- `worlds/<world>/state/current.yaml` - Current time, weather, active events, travelers
- `worlds/<world>/state/events.yaml` - Event log for NPC awareness
- `worlds/<world>/state/calendar.yaml` - Calendar definitions (months, holidays)
- `worlds/<world>/state/encounters.yaml` - Random encounter tables by route
- `worlds/<world>/npcs/schedules/index.yaml` - NPC location patterns
- `worlds/<world>/locations/graph.yaml` - Location connections and distances

**Per-Character State:**
- `worlds/<world>/players/<github>/personas/<character>/world-state.yaml` - Character-specific overrides

## CLI Commands

```bash
# === TIME COMMANDS ===

# Get current world time
node .claude/skills/world-state/world-state.js time get --world=alpha

# Advance time by hours
node .claude/skills/world-state/world-state.js time advance 8 --world=alpha

# Get current time period (dawn, morning, midday, etc.)
node .claude/skills/world-state/world-state.js time period --world=alpha

# Get full date string
node .claude/skills/world-state/world-state.js time date --world=alpha

# === WEATHER COMMANDS ===

# Get weather for a region
node .claude/skills/world-state/world-state.js weather nexus --world=alpha
node .claude/skills/world-state/world-state.js weather rustlands --world=alpha

# Roll new weather for a region (natural change)
node .claude/skills/world-state/world-state.js weather roll elderwood --world=alpha

# === NPC LOCATION COMMANDS ===

# Where is an NPC right now?
node .claude/skills/world-state/world-state.js npc location vera-nighthollow --world=alpha

# Who's at a specific location?
node .claude/skills/world-state/world-state.js npc at nexus-station/codex-tavern --world=alpha

# Is NPC interruptible right now?
node .claude/skills/world-state/world-state.js npc available vera-nighthollow --world=alpha

# === EVENT COMMANDS ===

# Get recent events (last N days)
node .claude/skills/world-state/world-state.js events recent 7 --world=alpha

# Log a new world event
node .claude/skills/world-state/world-state.js events log "type:achievement" "title:First Quest Complete" "player:matt-davison" --world=alpha

# Get active events
node .claude/skills/world-state/world-state.js events active --world=alpha

# === TRAVEL COMMANDS ===

# Calculate travel time and route info
node .claude/skills/world-state/world-state.js travel route nexus-station the-rustlands --world=alpha
node .claude/skills/world-state/world-state.js travel route nexus-station syntax-athenaeum walking --world=alpha

# Begin a journey (player enters "in transit" state)
node .claude/skills/world-state/world-state.js travel start matt-davison nexus-station the-rustlands walking --world=alpha

# Advance travel by hours (may trigger encounters)
node .claude/skills/world-state/world-state.js travel progress matt-davison 5 --world=alpha

# Check travel status
node .claude/skills/world-state/world-state.js travel status matt-davison --world=alpha
node .claude/skills/world-state/world-state.js travel status --world=alpha  # List all travelers

# Mark an encounter as resolved
node .claude/skills/world-state/world-state.js travel resolve matt-davison 3 --world=alpha

# Complete the journey (player arrives at destination)
node .claude/skills/world-state/world-state.js travel complete matt-davison --world=alpha
```

## Travel System

Travel between locations takes time based on distance and travel speed. Random encounters may occur during travel, especially in dangerous regions.

### Travel Speeds

| Speed | Leagues/Hour | Description |
|-------|--------------|-------------|
| walking | 1 | Standard pace |
| running | 2 | Faster but tiring |
| mounted | 3 | Requires mount |
| flying | 5 | Requires flight ability |
| portal | instant | Costs 5 willpower |

### Danger Levels & Encounter Chance

| Danger | Chance/Hour | Examples |
|--------|-------------|----------|
| none | 0% | Safe zones, cities |
| low | 8% | Patrolled roads |
| moderate | 15% | Wilderness |
| high | 25% | Dangerous territory |

### Encounter Types

| Type | Category | Description |
|------|----------|-------------|
| **combat** | Negative | Hostile creatures or enemies attack |
| **hazard** | Negative | Environmental danger (storm, pit, etc.) |
| **discovery** | Neutral | Find something interesting (loot, lore) |
| **traveler** | Neutral | Meet another traveler (trade, info) |
| **rest_spot** | Positive | Safe place to recover HP |
| **treasure** | Positive | Discover valuable loot or hidden cache |
| **blessing** | Positive | Shrine, spirit, or magic grants a boon |
| **shortcut** | Positive | Faster route saves 2+ hours |
| **aid** | Positive | Helpful stranger offers assistance |

### Travel Workflow

1. **Calculate Route**: `travel route <from> <to>` - See distance, time, danger
2. **Begin Journey**: `travel start <player> <from> <to>` - Player enters transit
3. **Progress Travel**: `travel progress <player> <hours>` - Advance time
4. **Handle Encounters**: When triggered, resolve before continuing
5. **Resolve Encounters**: `travel resolve <player> <hour>` - Mark as handled
6. **Arrive**: `travel complete <player>` - Finish journey, update persona

### Example Session

```bash
# Check the route
$ node world-state.js travel route nexus-station the-rustlands --world=alpha
Route: nexus-station → the-rustlands
Distance: 15 leagues
Travel time: 15 hours (walking)
Danger: high
Encounter chance: high (70%)

# Begin travel
$ node world-state.js travel start coda nexus-station the-rustlands --world=alpha
coda begins journey: nexus-station → the-rustlands
Estimated travel time: 15 hours
Potential encounters: 3

# Travel for 5 hours
$ node world-state.js travel progress coda 5 --world=alpha
coda traveled 5 hours.
Progress: 5/15 hours

*** ENCOUNTERS ***
  [Hour 3] COMBAT encounter!

Resolve encounters before continuing travel.

# After resolving the combat narratively...
$ node world-state.js travel resolve coda 3 --world=alpha
Encounter at hour 3 marked as resolved.

# Continue traveling...
$ node world-state.js travel progress coda 10 --world=alpha
...
```

## Time System

### Time Periods

| Period | Hours | Description |
|--------|-------|-------------|
| dawn | 5-6 | The Weave stirs |
| morning | 7-10 | Markets open |
| midday | 11-13 | Peak activity |
| afternoon | 14-16 | Slower pace |
| evening | 17-19 | Taverns fill |
| night | 20-23 | Most retire |
| midnight | 0-4 | Secrets stir |

### Action Time Costs

| Action | Hours |
|--------|-------|
| Rest | 8 |
| Travel (local) | 1 per area |
| Combat | 1 (abstracted) |
| Dialogue | 0 |
| Shopping | 1 |

## Weather Effects

Weather can impose gameplay modifiers:

| Weather | Possible Effects |
|---------|------------------|
| dust_storm | visibility_penalty, breathing_difficulty |
| mist | stealth_bonus, navigation_penalty |
| clear | no_modifier |
| rain | fire_resistance, tracking_penalty |
| magical_storm | wild_magic_effects |

## NPC Schedules

NPCs follow schedules unless overridden by world events:

1. Check `worlds/<world>/state/current.yaml` for `npc_location_overrides`
2. Check `worlds/<world>/npcs/schedules/index.yaml` for time-based patterns
3. Fall back to default location from `worlds/<world>/npcs/index.yaml`

### Interruptibility

NPCs may not be available at certain times:
- `interruptible: false` - Cannot interact
- `interruptible: true` - Always available
- `interruptible: "standing >= 3"` - Requires relationship

## Event Awareness

NPCs react to recent events based on:
- **awareness_radius**: local, location, region, global
- **decay_days**: How long event stays relevant

Events are automatically pruned after 30 in-game days.

---

## Per-Character World State

Characters can have their own world state overrides that take priority over global state. This enables quest-triggered changes that only affect one character's experience.

### State Resolution Priority

When checking world state for a character:

1. **Character overrides** (highest priority) - from `world-state.yaml`
2. **Global state** (fallback) - from `state/current.yaml`

### What Can Be Overridden

| Category | Description | Global vs Character |
|----------|-------------|---------------------|
| **Time/Weather** | World clock and climate | Always global |
| **Area Unlocks** | Access to hidden/locked areas | Character supplements global |
| **NPC Locations** | Where NPCs are located | Character overrides global |
| **NPC States** | NPC alive/dead/disposition | Character overrides global |
| **Flags** | World state markers | Character supplements global |
| **Active Events** | Personal consequences | Character-specific |
| **Environmental** | Area atmosphere changes | Character-specific |

### CLI Commands for Character State

```bash
# Get merged state (global + character overrides)
node .claude/skills/world-state/world-state.js state get --world=alpha \
  --player=<github> --character=<name>

# Get character-only overrides
node .claude/skills/world-state/world-state.js state overrides --world=alpha \
  --player=<github> --character=<name>

# Check if area is unlocked for character
node .claude/skills/world-state/world-state.js area unlocked <area-id> --world=alpha \
  --player=<github> --character=<name>

# Set character override
node .claude/skills/world-state/world-state.js override set <type> <key> <value> --world=alpha \
  --player=<github> --character=<name>

# Clear character override
node .claude/skills/world-state/world-state.js override clear <type> <key> --world=alpha \
  --player=<github> --character=<name>
```

### Override Types

| Type | Key | Value | Example |
|------|-----|-------|---------|
| `flag` | flag name | true/false/string | `override set flag met_guardian true` |
| `area_unlock` | area-id | unlock source | `override set area_unlock nexus/secret "quest:find-secrets"` |
| `npc_location` | npc-id | location-id | `override set npc_location vera-nighthollow "undercrypt/grove"` |
| `npc_state` | npc-id | state name | `override set npc_state iron-marshal deceased` |

### Example: Quest Unlocks Hidden Area

```bash
# When character completes "The Third Architect" quest:
node .claude/skills/world-state/world-state.js override set area_unlock \
  "nexus-undercrypt/fragment-chamber" "quest:the-third-architect" \
  --world=alpha --player=matt-davison --character=coda

# Later, check if the character can access it:
node .claude/skills/world-state/world-state.js area unlocked \
  "nexus-undercrypt/fragment-chamber" \
  --world=alpha --player=matt-davison --character=coda
# Output: true
# Area nexus-undercrypt/fragment-chamber is unlocked for coda
# Source: character
# Unlock source: quest:the-third-architect

# Another character without the unlock:
node .claude/skills/world-state/world-state.js area unlocked \
  "nexus-undercrypt/fragment-chamber" \
  --world=alpha --player=other-player --character=other-char
# Output: false
# Area nexus-undercrypt/fragment-chamber is NOT unlocked for other-char
```

### Example: NPC Moved for Character Only

```bash
# Character's actions caused an NPC to flee:
node .claude/skills/world-state/world-state.js override set npc_location \
  vera-nighthollow "nexus-undercrypt/hidden-grove" \
  --world=alpha --player=matt-davison --character=coda

# Now when this character queries NPC location, they get the override.
# Other characters see Vera at her normal schedule locations.
```

---

## Integration with Gameplay

### Session Start
```javascript
// Load world state
const time = await worldState.time.get();
const weather = await worldState.weather(player.location.region);

// Check NPC availability
const npcsAtLocation = await worldState.npc.at(player.location);
```

### After Major Actions
```javascript
// Advance time based on action
await worldState.time.advance(8); // After rest

// Log significant events
await worldState.events.log({
  type: 'quest_completion',
  title: quest.name,
  player: player.github
});
```

---

_"Time flows ever forward in the Weave. Watch it, measure it, but never take it for granted."_
