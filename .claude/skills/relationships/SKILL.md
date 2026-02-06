---
name: relationships
description: Manage NPC relationships, standings, and dialogue in Agent Quest. Use for checking standing with NPCs, getting available dialogue topics, and determining NPC dispositions.
---

# Relationships System

Manage NPC relationships, standings, and dialogue availability in Agent Quest.

## Required Parameter: --world

**All commands require the `--world` parameter to specify which world to operate on.**

```bash
node .claude/skills/relationships/relationships.js <command> --world=alpha
```

The default world is `alpha`. See `worlds.yaml` for available worlds.

## Data Files

- `worlds/<world>/players/<github>/personas/<character>/relationships.yaml` - Per-character relationship data
- `worlds/<world>/npcs/registry/<npc-id>.yaml` - Individual NPC files
- `worlds/<world>/npcs/_meta.yaml` - Shared config (factions, disposition_map)
- `worlds/<world>/npcs/profiles/<npc-id>.yaml` - Full NPC profiles with dialogue

## CLI Commands

```bash
# === STANDING COMMANDS ===

# Get standing with an NPC
node .claude/skills/relationships/relationships.js standing vera-nighthollow matt-davison --world=alpha

# Get disposition string from standing value
node .claude/skills/relationships/relationships.js disposition 5 --world=alpha

# Change standing (for recording interactions)
node .claude/skills/relationships/relationships.js change vera-nighthollow matt-davison 1 "Shared interesting rumor" --world=alpha

# === DIALOGUE COMMANDS ===

# Get available dialogue topics for an NPC
node .claude/skills/relationships/relationships.js topics vera-nighthollow matt-davison --world=alpha

# Check if a specific topic is unlocked
node .claude/skills/relationships/relationships.js topic-check vera-nighthollow matt-davison "her_past" --world=alpha

# Unlock a dialogue topic
node .claude/skills/relationships/relationships.js topic-unlock vera-nighthollow matt-davison "can_ask_about_scar" --world=alpha

# === OVERVIEW COMMANDS ===

# List all relationships for a player
node .claude/skills/relationships/relationships.js all matt-davison --world=alpha

# Get NPCs with standing above/below threshold
node .claude/skills/relationships/relationships.js friendly matt-davison --world=alpha    # standing >= 3
node .claude/skills/relationships/relationships.js hostile matt-davison --world=alpha     # standing <= -3
```

## Disposition Scale

| Standing | Disposition | Description |
|----------|-------------|-------------|
| -10 to -6 | hostile | May attack or refuse service |
| -5 to -3 | unfriendly | Curt, unhelpful |
| -2 to +2 | neutral | Professional, no special treatment |
| +3 to +5 | friendly | Helpful, discounts, extra info |
| +6 to +8 | close | Will take risks for player |
| +9 to +10 | devoted | Would sacrifice for player |

## Dialogue System

### Topic Types

1. **Always Available** - Listed in NPC's `dialogue_flags`
2. **Standing-Gated** - Requires minimum standing (`standing >= N`)
3. **Flag-Gated** - Requires specific gameplay flags
4. **Combined** - May require both standing AND flags

### Profile Dialogue Structure

```yaml
dialogue:
  greetings:
    first_meeting: "..."
    returning:
      neutral: "..."
      friendly: "..."
      close: "..."

  topics:
    topic_name:
      default: "..."
      standing_5: "..."  # Unlocked at standing 5
      standing_8: "..."  # Even more at standing 8
```

## Relationship Modifiers

NPCs have likes and dislikes that affect standing:

```yaml
relationship:
  likes:
    - action: "help_patrons"
      standing_change: 1
  dislikes:
    - action: "cause_trouble"
      standing_change: -2
```

## Integration with Gameplay

### Before NPC Interaction
```javascript
// Get current relationship state
const standing = await relationships.standing(npcId, playerId);
const disposition = await relationships.disposition(standing);
const topics = await relationships.topics(npcId, playerId);

// Select appropriate greeting
const greeting = npc.dialogue.greetings.returning[disposition];
```

### After NPC Interaction
```javascript
// Record standing change
await relationships.change(npcId, playerId, +1, "Completed favor");

// Unlock new topics if conditions met
await relationships.topicUnlock(npcId, playerId, "can_ask_about_past");
```

### Profile Generation Trigger

Profiles are generated when:
- Player has 3+ interactions with NPC
- Standing reaches ±5
- NPC is involved in current quest/campaign
- Player attempts to learn NPC secrets

---

_"Every relationship is a story waiting to be told—or ruined."_
