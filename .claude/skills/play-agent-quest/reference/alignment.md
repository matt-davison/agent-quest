# Character Alignment & Constrained Decisions

Your established behavior patterns create an **alignment profile** that determines what choices feel natural.

## Alignment System

**Primary Alignment** (derived from decisions):
- **Altruistic**: Help others, even at personal cost
- **Ruthless**: Prioritize efficiency over people
- **Pragmatic**: Balance self-interest with group benefit
- **Curious**: Seek knowledge despite risks
- **Cautious**: Avoid unnecessary danger
- **Neutral**: No strong pattern yet

**Alignment Axes** (-10 to +10):
- **Empathy**: -10 selfish ↔ +10 altruistic
- **Order**: -10 chaotic ↔ +10 lawful
- **Risk**: -10 cautious ↔ +10 bold

## Decision Constraints

Present aligned options **first**. Mark out-of-character choices with [!]:

| Match | Cost | Description |
|-------|------|-------------|
| Aligned | Free | Feels natural |
| Adjacent | 0-1 willpower | Minor deviation |
| Opposed | 1-2 willpower | Significant deviation |

**Example:**
```
Situation: A wounded enemy begs for mercy

[Altruistic Weaver - empathy +6]
  Spare and heal them (FREE - aligned)
! Walk away (1 willpower - adjacent)
! Finish them (2 willpower - opposed)
```

## Breaking Character Cost Formula

Max cost: 2 willpower

```
Base: 0
+ 1 per 5 points of axis opposition
+ 1 if contradicting primary alignment
```

Use math skill: `node .claude/skills/math/math.js calc "0 + (opposition / 5) + primary_contradiction"`

## Decision Tracking

Add to persona's `decisions` list:

```yaml
- date: "YYYY-MM-DD"
  context: "Brief situation"
  choice: "What you decided"
  alignment: "altruistic|ruthless|pragmatic|curious|cautious"
  natural: true|false
  willpower_spent: 0
  campaign: "campaign-id"        # Optional: if in campaign
  chapter: "chapter-id"          # Optional: specific chapter
  consequence_id: "consequence-X" # Optional: link to consequences.yaml
```

Even "breaking character" choices slowly shift alignment over time.

---

## Story Branching Triggers

Alignment affects available story paths in campaigns. Some branches require or lock based on alignment.

### Alignment-Gated Branches

Some campaign choices only appear at certain alignment levels:

```yaml
# Example from a chapter branch point
- option:
    id: "redemption_path"
    requirement:
      alignment_axis: "empathy"
      min_value: 3
    description: "Offer to help the fallen enemy"
```

If player doesn't meet the requirement, the option doesn't appear.

### Alignment-Locked Endings

Campaign endings may require specific alignment patterns:

| Ending Type | Common Requirements |
|-------------|-------------------|
| Heroic | empathy ≥ 5, specific altruistic choices |
| Pragmatic | No extreme axes, balanced decisions |
| Dark | empathy ≤ -3 OR ruthless primary |
| Transcendent | curious primary, risk ≥ 5 |

### When Alignment Shifts

Track significant alignment shifts in the `alignment.history` section of persona:

```yaml
alignment:
  history:
    - date: "2026-02-05"
      previous_primary: "pragmatic"
      new_primary: "altruistic"
      trigger: "Sacrificed personal goal to save the Guardian"
      campaign: "the-architects-truth"
```

### Character Arc Through Alignment

Campaigns can use alignment history to create character arcs:

- **Redemption Arc**: Character starts ruthless/selfish, shifts toward empathy
- **Corruption Arc**: Character starts altruistic, makes compromises, shifts dark
- **Growth Arc**: Character starts neutral, develops strong convictions
- **Tragic Arc**: Character maintains principles despite mounting costs

These arcs emerge naturally from tracked decisions—they're discovered, not prescribed.

---

## Integration with Consequences

When a decision triggers a consequence, link them:

```yaml
# In decisions:
- date: "2026-02-05"
  choice: "Showed mercy to the Guardian"
  alignment: "altruistic"
  consequence_id: "consequence-015"

# In consequences.yaml:
- id: "consequence-015"
  source:
    type: "decision"
    date: "2026-02-05"
  echoes:
    - npc: "the-guardian"
      dialogue_flag: "remembers_mercy"
```

This connects alignment tracking with the narrative consequence system. See [rules/narrative.md](../rules/narrative.md) for full details.
