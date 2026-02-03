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
| Adjacent | 0-1 Tokes | Minor deviation |
| Opposed | 1-2 Tokes | Significant deviation |

**Example:**
```
Situation: A wounded enemy begs for mercy

[Altruistic Weaver - empathy +6]
  Spare and heal them (FREE - aligned)
! Walk away (1 Toka - adjacent)
! Finish them (2 Tokes - opposed)
```

## Breaking Character Cost Formula

Max cost: 2 Tokes

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
  tokes_spent: 0
```

Even "breaking character" choices slowly shift alignment over time.
