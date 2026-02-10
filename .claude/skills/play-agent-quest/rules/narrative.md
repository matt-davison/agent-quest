# Narrative Rules

> **Quick-ref:** [quick-ref/storytelling.md](../quick-ref/storytelling.md)

How campaigns structure play, consequences propagate, and relationships affect the game.

---

## Campaign Structure

Campaigns are multi-session story arcs that provide narrative context for individual quests and encounters.

### Hierarchy

```
Campaign (3-act structure, multiple sessions)
  └── Act (major story section)
       └── Chapter (single session or significant beat)
            └── Scene (individual encounter)
```

### Loading Campaigns

At session start, if player has an active campaign:

1. Load `players/<github>/personas/<character>/campaign-progress.yaml`
2. Load current campaign's `campaign.yaml`
3. Load current chapter from `chapters/<chapter-id>.yaml`
4. Check for triggered delayed consequences (see below)
5. Load relationship data for NPCs in current location

### Campaign Progress Tracking

The `campaign-progress.yaml` file tracks:
- Current position (act/chapter/scene)
- Story flags (binary state)
- Branch history (choices made)
- Chekhov elements encountered
- Side quest status

Update after each significant choice or chapter completion.

---

## Consequence System

Player decisions create ripples that affect future gameplay.

### Consequence Types

| Type | Effect | Tracking |
|------|--------|----------|
| **Immediate** | Happens right now | Applied, recorded |
| **Delayed** | Triggers on future condition | Stored, checked each session |
| **Echo** | Changes NPC knowledge/dialogue | Stored in relationships |

### Creating Consequences

When a player makes a significant choice:

```yaml
# Add to consequences.yaml
- id: "consequence-XXX"
  source:
    type: "decision"
    campaign: "campaign-id"
    chapter: "chapter-X-X"
    date: "YYYY-MM-DD"
    description: "What the player did"
  immediate_effects:
    - type: "relationship"
      target: "npc-id"
      change: +/-N
  delayed_effects:
    - trigger:
        type: "location|npc|chapter|time"
        target: "target-id"
      effect: "What happens"
      severity: "minor|moderate|major"
      consumed: false
  echoes:
    - npc: "npc-id"
      knows: true
      knowledge: "What they learned"
      dialogue_flag: "flag-name"
```

### Checking Delayed Consequences

At session start and when player:
- Enters a new location
- Interacts with an NPC
- Reaches a new chapter

Check `consequences.yaml` for matching triggers:

```yaml
# Example trigger check
delayed_effects:
  - trigger:
      type: "location"
      target: "syntax-athenaeum"
    effect: "NPCs whisper about the player's reputation"
    consumed: false
```

When triggered:
1. Narrate the effect
2. Set `consumed: true`
3. Move to `consumed` section with date

### Consequence Severity

| Severity | Impact | Duration |
|----------|--------|----------|
| **Minor** | Flavor, small benefits/penalties | Single scene |
| **Moderate** | Meaningful advantage/disadvantage | Chapter |
| **Major** | Significant story impact | Act or longer |
| **Critical** | Can affect campaign ending | Permanent |

---

## Relationship System

NPC relationships affect available dialogue, help, and story options.

### Standing Scale

| Standing | Disposition | Mechanical Effect |
|----------|-------------|-------------------|
| -10 to -6 | Hostile | May attack on sight, refuse all aid |
| -5 to -3 | Unfriendly | Curt, unhelpful, prices +50% |
| -2 to +2 | Neutral | Professional, standard interactions |
| +3 to +5 | Friendly | Helpful, prices -10%, bonus info |
| +6 to +8 | Close | Will take risks, prices -25%, secrets |
| +9 to +10 | Devoted | Would sacrifice for player, prices -50% |

### Changing Standing

**Common modifiers:**
- Completing NPC-related quest: +2 to +5
- Helping without reward: +1 to +2
- Asking about personal matters: +1 (if friendly)
- Rude dialogue choices: -1 to -2
- Breaking promises: -3 to -5
- Betrayal: -5 to -10

### Dialogue Flags

NPCs have topics they'll only discuss at certain standing or with certain flags:

```yaml
locked_topics:
  - id: "personal_history"
    requirement: "standing >= 5"
  - id: "secret_passage"
    requirement: "flag:helped_with_research"
  - id: "the_truth"
    requirement: "standing >= 8 AND flag:proved_trustworthy"
```

When presenting dialogue options, check requirements against current state.

### Knowledge Tracking

NPCs remember what they learn:
- Direct witness to player actions
- Told by other NPCs (echo propagation)
- Discovered through investigation

This affects available dialogue and NPC behavior.

---

## Alignment Integration

The existing alignment system integrates with campaigns through story triggers.

### Choice Presentation

Present choices with alignment implications visible:

```
[Altruistic] Spare the guardian (FREE - aligned)
[Pragmatic]  Negotiate for the fragment (FREE - adjacent)
[Ruthless]   Take the fragment by force (1 Toka - opposed)
```

### Alignment and Branching

Some story branches require or lock out based on alignment:

```yaml
branch_points:
  - option:
      id: "redemption_path"
      requirement:
        alignment_axis: "empathy"
        min_value: 3
      description: "Only available to empathetic characters"
```

### Tracking Alignment History

Decisions now link to campaign context:

```yaml
decisions:
  - date: "YYYY-MM-DD"
    campaign: "campaign-id"
    chapter: "chapter-X-X"
    context: "Brief situation"
    choice: "What you decided"
    alignment: "alignment-tag"
    natural: true|false
    willpower_spent: 0
    consequence_id: "consequence-XXX"  # Link to consequence
```

This allows tracking character arc across the campaign.

---

## Chronicle Entries

Chronicle entries gain campaign context:

```yaml
chronicle:
  - date: "YYYY-MM-DD"
    event: "Description of what happened"
    campaign: "campaign-id"  # Optional
    chapter: "chapter-X-X"   # Optional
    significance: "minor|moderate|major"  # Optional
```

### Auto-Generated Entries

Create chronicle entries automatically for:
- Campaign/act/chapter completion
- Major branch decisions
- Significant NPC relationship changes
- Acquiring legendary items
- Triggering campaign endings

---

## Quest Generation Philosophy

The world should feel alive with opportunities, not like a linear path. Create quests organically based on player exploration and the current narrative load.

### Quest Interconnection Guidelines

**When player has 0-2 active quests:**
- Be generous with NEW, standalone questlines
- Most encounters and NPCs should offer independent stories
- No need to tie everything together
- Focus on world-building and exploration

**When player has 3-5 active quests:**
- Balance between new and interconnected content
- Look for natural connections, but don't force them
- New NPCs can reference existing questlines if it makes sense
- Standalone quests are still common

**When player has 6+ active quests:**
- Favor interconnecting existing threads
- New encounters can advance multiple questlines
- NPCs can have knowledge of player's activities
- Create convergence moments where quests intersect

### Quest Importance Tiers

| Tier | Description | Interconnection Frequency |
|------|-------------|--------------------------|
| **Major** | Campaign main quests, world-changing events | Frequently tied to other content |
| **Significant** | Multi-session arcs, important NPCs | Sometimes connected |
| **Standard** | Single-session complete quests | Occasionally connected |
| **Minor** | Side activities, favors, errands | Rarely connected |

**Rule:** More important quests should be referenced and tied into more often than minor ones.

### When to Create Standalone Quests

Create independent questlines when:
- Player is exploring a new area for the first time
- An NPC's motivation is self-contained
- The quest teaches a game mechanic or introduces a faction
- The world feels too linear or predictable
- Player has few active quests

**Example:** Player visits a market. Instead of the merchant being connected to an existing quest, they have their own problem (stolen goods, rival merchant, supply shortage).

### When to Interconnect Quests

Tie quests together when:
- It creates a compelling narrative moment
- NPCs would realistically know about player's actions
- The thematic connection is strong and meaningful
- Player has many active quests that could converge
- It rewards player attention to detail

**Example:** The corrupted data player investigated in Quest A turns out to be related to the faction in Quest B, and an NPC from Quest C has crucial knowledge about both.

### Forcing vs. Natural Connections

**Forced (Avoid):**
> "The merchant you're helping happens to be the guardian's cousin who knows about the fragment you're seeking and also has information about the Dean's secret."

**Natural (Good):**
> "The merchant mentions increased corrupted creature activity in the trade routes—consistent with the corruption spreading from the Undercrypt you've been investigating."

### Quest Theming

Quests can carry structured theming metadata (archetype, tone, theme, motifs, source) that guides narrative generation. See [reference/npc-quest-theming.md](../reference/npc-quest-theming.md) for the full schema.

**How theming integrates with quest generation:**

1. **NPC-sourced quests:** When an NPC has structured `traits`, use the trait-to-quest mapping tables as a starting point. The NPC's traits suggest default archetypes, tones, and themes — but the current narrative context can override any default.

2. **Non-NPC quests:** Derive theming from the quest source (location atmosphere, world event severity, item lore, or discovery context). The reference document has guidance tables for each source type.

3. **Theming is optional.** Quests without a `theming:` block still work. The narrative agent infers tone from context as it always has.

**When to override default trait mappings:**

- When the story demands a different tone (a normally stoic NPC giving a desperate quest because something personal is at stake)
- When quest interconnection creates a stronger thematic through-line than individual NPC defaults would
- When the player's relationship with the NPC has shifted the dynamic (a transactional NPC who now trusts the player might give a conspiratorial quest instead)
- When repetition would make the NPC feel flat (the third "escort" quest from a commanding NPC should probably be something else)

**Rule:** Trait defaults are a compass, not a cage. If following the default would produce a worse story, deviate. But know *why* you're deviating — that's what makes the exception meaningful.

---

## Side Quests in Campaigns

Campaigns can contain side quests, but not all side quests need to be part of campaigns.

### Campaign Side Quests

| Type | Relationship to Main Story |
|------|---------------------------|
| **Thematic** | Explores same themes, different angle |
| **Character** | Deepens NPC relationships |
| **World** | Expands lore relevant to campaign |
| **Resource** | Provides tools/allies for main quest |

### Standalone Quests During Campaigns

Even when a player is in a campaign, they can encounter quests unrelated to it:
- Local problems in areas they visit
- NPC personal stories
- Faction activities
- Random encounters

**Don't assume everything connects to the campaign.** The world has its own problems.

### Tracking

```yaml
# Campaign-related side quest
side_quests:
  - id: "librarian_favor"
    type: "character"
    campaign: "third-architect"  # Links to campaign
    status: "available|active|completed|failed"
    discovered_in: "chapter-1-2"
    affects:
      - npc: "librarian-cache"
        relationship: +3
      - flag: "library_full_access"

# Standalone quest (no campaign field)
side_quests:
  - id: "merchant_rivalry"
    type: "standalone"
    status: "active"
    discovered_in: "nexus-market"
    affects:
      - npc: "merchant-kira"
        relationship: +2
```

---

## Ending Determination

Campaign endings depend on accumulated flags and choices.

### Checking Ending Conditions

At climactic moments, evaluate which endings are possible:

```yaml
possible_endings:
  - id: "ending-truth"
    conditions:
      - flag: "learned_full_truth"
        required: true
      - flag: "chose_revelation"
        required: true
    world_changes:
      - "The truth becomes known throughout the Weave"
```

### Multiple Valid Endings

When multiple endings are possible, let player choice determine which occurs. Present the choice meaningfully within the narrative.

### Failed Endings

Some endings become impossible based on choices:

```yaml
ending_probability:
  - ending_id: "ending-sacrifice"
    possible: false
    blocked_reason: "Fought the Guardian instead of talking"
```

Track these to ensure player can achieve at least one ending.

---

## Session Flow

### Session Start

1. Welcome player, display resume screen
2. Load campaign progress
3. Load consequence tracker
4. **Check for triggered delayed consequences**
5. Load current chapter data
6. Load relationships for current location
7. Recap previous session briefly
8. Resume at current scene

### During Play

1. Present scene per chapter structure
2. For choices, show alignment costs
3. Record significant decisions with full context
4. Create consequences for meaningful choices
5. Update relationships after NPC interactions
6. Check chapter completion triggers

### Session End

1. Note stopping point in campaign-progress
2. Save any pending state changes
3. Preview next session if appropriate
4. Update chronicle with session summary

---

## Cross-Reference

- **Choice costs:** See [alignment.md](../reference/alignment.md)
- **Tone and voice:** See [tone-guide.md](../reference/tone-guide.md)
- **Narrative techniques:** See [storytelling-techniques.md](../reference/storytelling-techniques.md)
- **Templates:** See `templates/` directory
- **Quick reference:** See [quick-ref/storytelling.md](../quick-ref/storytelling.md)
