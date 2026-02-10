# Quest Template

Copy this template to `quests/available/<quest-id>.md`

---

# [Quest Title]

**ID:** `quest-id`
**Difficulty:** Easy / Medium / Hard / Epic
**Giver:** [NPC Name] at [Location]
**Repeatable:** Yes / No

## Rewards

| Type    | Amount                   |
| ------- | ------------------------ |
| Gold    | [Amount]                 |
| XP      | [Amount]                 |
| Items   | [List]                   |
| Unlocks | [What becomes available] |

## Summary

[1-2 sentence overview of the quest]

## Background

[Why does this quest exist? What's the context? What problem needs solving?]

## Objectives

- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3
- [ ] Return to [Quest Giver]

## Walkthrough

### Step 1: [Title]

[Detailed instructions for this step. Where to go, what to do, who to talk to.]

### Step 2: [Title]

[Continue with next step...]

### Step 3: [Title]

[And so on...]

## Completion

### Turn-in

Return to **[NPC Name]** at **[Location]** after completing all objectives.

### Dialogue

> **[NPC]:** "[What they say when you complete the quest]"

### Follow-up

[Narrative description of what happens next. What does the quest giver say that hints at more?]

## Notes

[Optional: Hints, alternative solutions, secrets, connections to other content]

---

## Quest Metadata (for tracking)

```yaml
status: available # available, unavailable
github: "[Your GitHub Username]"
created_date: "YYYY-MM-DD"

# Level requirements (optional, omit for level-agnostic quests)
level:
  required: 1      # Minimum level to accept this quest
  recommended: 3   # Level for optimal challenge
  scaling: false   # Whether rewards scale with player level

# Prerequisites (optional - what must be true before this quest is available)
prerequisites:
  # quests_completed: ["quest-id"]     # Must have completed these quests first
  # standing:                          # Minimum NPC standing required
  #   npc_id: "npc-id"
  #   minimum: 3
  # flags: ["flag_name"]              # Character flags that must be set
  # level_minimum: 3                  # Minimum character level

# Quest chain (optional - links this quest into a sequence)
chain:
  # id: "chain-name"                  # Shared chain ID across linked quests
  # position: 1                       # Position in the chain (1, 2, 3...)
  # total: 3                          # Total quests in the chain (if known)

# Quest theming (optional - guides narrative tone and consistency)
# See reference/npc-quest-theming.md for full schema and vocabulary.
# theming:
#   archetype: "investigation"       # fetch, delivery, escort, investigation, hunt, defense,
#                                     # puzzle, infiltration, discovery, diplomacy, collection, rescue
#   tone: "mysterious"               # default, tense, triumphant, somber, mysterious, humorous,
#                                     # desperate, conspiratorial, ominous, bittersweet
#   theme: "hidden-truths"           # duty-vs-desire, hidden-truths, corruption-and-redemption,
#                                     # price-of-progress, knowledge-and-power, bonds-tested,
#                                     # legacy-and-memory, order-vs-chaos, survival-at-cost, the-unknown
#   motifs: ["shadows", "echoes"]    # 1-3 from: shadows, neon-glow, flickering, echoes, static,
#                                     # silence, whispers, rust, crystal, ash, broken-code, void,
#                                     # thresholds, fractures, mirrors, mercury (or invent new ones)
#   source:
#     type: "npc"                    # npc | location | world-event | item | self-discovered
#     id: "npc-id"                   # Source identifier (omit for self-discovered)

# On completion (optional - side effects triggered when quest is turned in)
# Not every quest needs this. Use it when completing a quest should change
# the world, advance an NPC's story, or open new possibilities.
on_complete:
  # Quest unlocks - new quests that become available
  # unlocks:
  #   - quest_id: "next-quest-id"        # ID of the quest to unlock
  #     giver: "npc-id"                  # Who offers it (can be same or different NPC)
  #     available: "immediate"           # immediate | next_visit | delayed
  #     delay_until: null                # For "delayed": in-game time or condition
  #     teaser: "The NPC mentions something troubling about the mines..."
  #
  # NPC standing changes
  # standing_changes:
  #   - npc_id: "npc-id"
  #     change: 2                        # How much standing changes (+/-)
  #     reason: "Completed task for them"
  #
  # World effects - flags, NPC movements, area unlocks
  # world_effects:
  #   - type: "flag_set"                # flag_set | npc_location | area_unlock | event
  #     flag: "underlevel_explored"
  #     scope: "character"               # character | global
  #   - type: "npc_location"
  #     npc_id: "dr-hale"
  #     new_location: "lumina-city"
  #     scope: "character"
  #   - type: "area_unlock"
  #     area: "lumina-underlevel/deep-archive"
  #     scope: "character"
  #
  # Giver reaction - what the quest giver says/does beyond reward dialogue
  # giver_reaction: |
  #   The NPC's demeanor changes. They lean in closer, voice dropping.
  #   "There's something else. Something I didn't want to mention until
  #   I knew I could trust you..."
```
