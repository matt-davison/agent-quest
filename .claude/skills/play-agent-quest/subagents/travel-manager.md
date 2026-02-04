# Travel Manager Subagent

**Responsibility:** Handle multi-turn travel with encounters, time advancement, and location transitions. Delegates combat to Combat Manager when encounters occur.

## When to Invoke

- Player uses MOVE action
- Multi-leg journeys
- Fast travel between distant locations
- Timed travel with encounter rolls

## Input Context

```yaml
operation: "travel"
player:
  github: "<github-username>"
  character: "<character-name>"
  current_location: "<origin-location-id>"
  level: <player-level>
  stealth_bonus: <if-any>
journey:
  destination: "<destination-location-id>"
  path: [<list-of-intermediate-locations>]  # Optional, auto-calculated if not provided
  travel_mode: "walking" | "mounted" | "fast_travel"
  stealth: true | false  # Attempting to avoid encounters
```

## Processing Steps

### 1. Validate Route

Check that destination is reachable from origin:

```bash
# Use world-state skill to validate route
node .claude/skills/world-state/world-state.js travel validate \
  --from "<origin>" \
  --to "<destination>"
```

If path not provided, calculate optimal route.

### 2. Calculate Travel Time

```bash
# Get travel time estimate
node .claude/skills/world-state/world-state.js travel time \
  --from "<origin>" \
  --to "<destination>" \
  --mode "<travel_mode>"
```

Travel times vary by:
- Distance (based on connections)
- Travel mode (mounted is 2x faster)
- Terrain difficulty

### 3. Roll for Encounters

For each travel segment, roll for random encounters:

```bash
# Encounter check: 1d20
# Encounter on roll <= encounter_rate
node .claude/skills/math/math.js roll 1d20

# Encounter rates by area type:
# - Safe roads: 5% (roll 1)
# - Wilderness: 20% (roll 1-4)
# - Dangerous: 40% (roll 1-8)
# - Very dangerous: 60% (roll 1-12)
```

If stealth mode, player gets stealth check to avoid:
```bash
# Stealth check vs encounter DC
node .claude/skills/math/math.js roll "1d20+${stealth_bonus}"
# DC typically 12-18 based on area danger
```

### 4. Generate Encounter (if triggered)

Load encounter tables from `rules/encounter-generation.md`:

```bash
# Determine encounter type
node .claude/skills/math/math.js roll 1d100

# Roll on appropriate table for area
# Results: combat, social, discovery, environmental
```

### 5. Handle Encounter

#### Combat Encounter
Delegate to Combat Manager:

```yaml
# Return control to main agent with:
encounter_triggered: true
encounter_type: "combat"
combat_context:
  enemies:
    - name: "Rustland Raiders"
      count: 3
      template: "bandit"
  terrain: "road_ambush"
  surprise: false  # Unless stealth succeeded
narrative_hooks:
  - "Figures emerge from the roadside ruins"
  - "Rustland Raiders block your path"
action_required: "invoke_combat_manager"
```

#### Social Encounter
```yaml
encounter_triggered: true
encounter_type: "social"
npc:
  id: "traveling-merchant-001"
  name: "Whisper, the Wandering Tinker"
  disposition: "neutral"
  has_wares: true
narrative_hooks:
  - "A weathered cart blocks the narrow path"
  - "Its owner waves a friendly greeting"
action_required: "main_agent_handles_interaction"
```

#### Discovery
```yaml
encounter_triggered: true
encounter_type: "discovery"
discovery:
  type: "abandoned_cache"
  contents:
    - "Healing Potion x2"
    - "15 gold"
  investigation_dc: 12  # To find hidden compartment
narrative_hooks:
  - "Glint of metal catches your eye"
  - "An old supply cache, half-buried"
```

#### Environmental
```yaml
encounter_triggered: true
encounter_type: "environmental"
hazard:
  type: "collapsed_bridge"
  bypass_options:
    - method: "climb"
      check: "agility DC 14"
      risk: "fall damage 2d6"
    - method: "detour"
      time_cost: "2 hours"
      encounter_reroll: true
narrative_hooks:
  - "The bridge ahead has collapsed"
  - "Swift water churns below"
```

### 6. Advance Time

After travel (or each segment):

```bash
# Advance world time
node .claude/skills/world-state/world-state.js time advance \
  --hours <travel_hours>
```

Track:
- Time of day changes
- Weather transitions
- NPC schedule changes

### 7. Complete Arrival

When destination reached:

```yaml
success: true
operation: "travel"
journey_complete: true
travel_summary:
  origin: "nexus-downtown"
  destination: "rustlands-outpost"
  segments_traveled: 3
  encounters: 1
  time_elapsed: "4 hours"
  time_now: "14:00"
state_diffs:
  player:
    location: "rustlands-outpost"
  world:
    time: "14:00"
    player_presence:
      remove: "nexus-downtown"
      add: "rustlands-outpost"
narrative_hooks:
  - "The Rustlands sprawl before you"
  - "Outpost walls rise from the scrap-metal landscape"
  - "Four hours since leaving Nexus"
  - "The afternoon sun beats down"
```

## Output Response

### Travel Without Encounters

```yaml
success: true
operation: "travel"
journey_complete: true
segments:
  - from: "nexus-downtown"
    to: "nexus-gates"
    encounter_roll: 15
    encounter: false
    time: "30 min"
  - from: "nexus-gates"
    to: "rustlands-edge"
    encounter_roll: 8
    encounter: false
    time: "1.5 hours"
  - from: "rustlands-edge"
    to: "rustlands-outpost"
    encounter_roll: 19
    encounter: false
    time: "2 hours"
travel_summary:
  total_time: "4 hours"
  encounters: 0
state_diffs:
  player:
    location: "rustlands-outpost"
  world:
    time: "+4 hours"
narrative_hooks:
  - "The journey passes uneventfully"
  - "You arrive at Rustlands Outpost as the sun peaks"
```

### Travel Interrupted by Encounter

```yaml
success: true
operation: "travel"
journey_complete: false
progress:
  current_segment: 2
  total_segments: 3
  current_location: "rustlands-edge"  # Stopped here
segments_completed:
  - from: "nexus-downtown"
    to: "nexus-gates"
    encounter: false
  - from: "nexus-gates"
    to: "rustlands-edge"
    encounter_roll: 3
    encounter: true
    encounter_type: "combat"
encounter:
  type: "combat"
  enemies:
    - name: "Scrap Golem"
      hp: 40
      defense: 16
      damage: "2d8"
  terrain: "junkyard_clearing"
time_elapsed_so_far: "2 hours"
action_required: "invoke_combat_manager"
narrative_hooks:
  - "Halfway through the Rustlands..."
  - "Metal scrapes against metal"
  - "A Scrap Golem assembles from the debris"
resume_travel_after_encounter:
  remaining_segments:
    - from: "rustlands-edge"
      to: "rustlands-outpost"
```

### Stealth Travel

```yaml
success: true
operation: "travel"
journey_complete: true
stealth_mode: true
segments:
  - from: "nexus-undercity"
    to: "shadow-district"
    encounter_roll: 2  # Would trigger
    stealth_roll: 18
    stealth_dc: 14
    stealth_success: true
    encounter_avoided: true
travel_summary:
  encounters_triggered: 1
  encounters_avoided: 1
  encounters_fought: 0
narrative_hooks:
  - "You slip through the shadows unnoticed"
  - "Footsteps echo nearby, but pass you by"
```

## World-State Integration

Use the world-state skill throughout:

```bash
# Validate travel route
node .claude/skills/world-state/world-state.js travel validate --from A --to B

# Get travel time
node .claude/skills/world-state/world-state.js travel time --from A --to B

# Advance time after travel
node .claude/skills/world-state/world-state.js time advance --hours 4

# Update player presence
node .claude/skills/world-state/world-state.js presence update \
  --player <github> \
  --character <name> \
  --location <new-location>

# Check weather at destination
node .claude/skills/world-state/world-state.js weather <location>
```

## Error Handling

```yaml
success: false
errors:
  - code: "INVALID_ROUTE"
    message: "No path from nexus-downtown to ancient-ruins"
    suggestion: "Travel to rustlands-gate first"
  - code: "AREA_LOCKED"
    message: "Shadow Sanctum requires quest flag 'shadow-initiate'"
  - code: "COMBAT_IN_PROGRESS"
    message: "Cannot travel during active combat"
```

## Resume After Encounter

After combat/social encounter resolves, invoke again with:

```yaml
operation: "resume_travel"
player:
  github: "<github>"
  character: "<character>"
resume_from:
  location: "rustlands-edge"
  remaining_segments:
    - from: "rustlands-edge"
      to: "rustlands-outpost"
encounter_outcome: "victory" | "fled"  # Affects narrative
```
