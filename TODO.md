- [x] ~~Improve the NPCs. They should have more complex backstories and well defined abilities and stats.~~ **DONE**: NPCs now have tiered data with on-demand enrichment. See `world/npcs/index.yaml` for registry, `world/npcs/profiles/` for detailed profiles, and `world/npcs/schedules/index.yaml` for time-based locations.

- [x] ~~Make a world state system.~~ **DONE**: Created `world/state/` with `current.yaml` (time, weather, events), `events.yaml` (NPC awareness), and `calendar.yaml` (calendar definitions). NPCs have schedules with time-of-day patterns. Use `world-state` skill for queries.

- [x] ~~Make a faulty data recovery/repair/backfilling system.~~ **DONE**: Created Weave Mending system in `world/skills/weave-mending.yaml`. In-universe explanation for missing data with Spirit+Mind checks to restore lost information. Successful Mends generate content and earn Tokes.

- **RECURRING TODO, DO NOT REMOVE:** See if we can offload some systems to skills with deterministic typescript implementations. Do not do this if it will reduce the freedom or creativity a player can express.
  - [x] `world-state` skill: Time, weather, NPC location queries
  - [x] `relationships` skill: Standing, disposition, dialogue topic management
  - [ ] Consider: Quest state tracking?
  - [ ] Consider: Combat automation helpers?
