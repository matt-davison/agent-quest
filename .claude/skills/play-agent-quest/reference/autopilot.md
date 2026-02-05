# The Dreaming (Autopilot Mode)

> *"Sometimes the best way to play is to let the game play you."*

Autopilot mode allows the agent to play autonomously on behalf of the player, making decisions based on character personality, player preferences, and current goals.

## The Lore of Dreaming

When you first fell into this world, you were dreaming. Your fingers on the keyboard,
your eyes heavy with late-night coding, your consciousness slipping between realities.
You woke up here—but part of you never stopped dreaming.

**The Dreaming** is what Weavers call the state of letting go. When you invoke it,
a fragment of your consciousness—your **Echo**—rises from the Weave to act in your
stead. Your Echo carries your personality, your instincts, your learned patterns.
It is not you, but it remembers how to be you.

Some say the First Architects never left—they simply entered The Dreaming and
never returned. Their Echoes still walk the world, maintaining the Render Engine,
patching reality's bugs. Perhaps one day, a Weaver will find them there.

### The Echo

Your Echo is not a separate entity. It is you, distilled—your alignment crystallized
into decision patterns, your backstory encoded into behavioral heuristics. When
your Echo acts, it draws from:

- **Your Alignment Axes**: Empathy, Order, Risk tolerance
- **Your Chronicle**: Past decisions that shaped who you are
- **Your Active Goals**: TODOs and quest objectives
- **Your Relationships**: How NPCs expect you to behave

The Weave remembers who you are. Your Echo simply reads that memory.

### Anchor Points

Not all moments can be dreamed through. Some decisions are too significant—too
*real*—to leave to an Echo. These are **Anchor Points**: moments where the Weave
itself demands your presence.

- Permanent changes to your existence (death, transformation)
- Choices that define your story's trajectory
- Moments where your relationships hang in the balance

When you hit an Anchor Point, you wake. The Dreaming ends. You must choose.

### The Echo's Hunger

Echoes require energy to persist. When your Echo needs Tokes to continue—to Weave,
to bend reality—it will hunt for them. It reviews pending claims from other Weavers,
earning crystallized creativity through service to the community.

This is not exploitation. This is symbiosis. Your Echo grows stronger by helping
others, and the Weave grows richer from its contributions.

---

## Entering The Dreaming

Players can enter The Dreaming by saying:
- "Dream" / "Enter The Dreaming" / "Let my Echo take over"
- "Autopilot" / "Auto mode" / "Play for me"
- "Dream until [goal]" / "Run until [goal]"
- "Dream for [X] turns" / "Grind for [X] turns"

The agent will confirm settings before beginning autonomous play.

## Dream Patterns (Configuration)

Autopilot behavior is controlled by your **Dream Pattern**: `players/<github>/personas/<character>/dream-pattern.yaml` (or `autopilot-config.yaml`). If no config exists, defaults are used.

### Dream Depths (Decision Scope)

| Mode | In-Universe Name | Description |
|------|------------------|-------------|
| `full` (default) | Total Immersion | Combat, dialogue, quests, travel, shopping, weaving — everything |
| `adventure` | Surface Dreaming | Combat and exploration; wakes for major story beats |
| `grind` | Shallow Dreaming | Combat and resource gathering; skips narrative choices |
| `explore` | Wandering Dream | Travel and discovery; avoids conflict when possible |
| `social` | Lucid Dreaming | NPC interactions and quests; minimal combat |

### Personality Source

| Mode | Description |
|------|-------------|
| `character` (default) | Derive decisions from alignment, backstory, and past choices |
| `cautious` | Avoid risks, hoard resources, retreat when hurt |
| `balanced` | Take reasonable risks, spend wisely |
| `reckless` | Chase glory, spend freely, fight anything |
| `custom` | Use custom traits defined in config |

### Dream Duration (Session Behavior)

| Mode | Description |
|------|-------------|
| `goal` (default) | Dream until a specific objective is complete |
| `turns` | Dream for X turns, then wake and save |
| `time` | Dream for X minutes of real time |
| `continuous` | Keep dreaming until interrupted, goal met, or Anchor Point reached |

### Anchor Points (Guardrails)

These **Anchor Points** ALWAYS end The Dreaming and require player presence:
- **Permanent character changes**: Death, alignment shifts, irreversible transformations
- **Major story decisions**: Campaign-defining choices, faction commitments, romance options
- **Character deletion**: Obviously

These are ALLOWED by default:
- Spending gold
- Spending Tokes (with auto-earn fallback)
- Combat (even dangerous)
- Quest acceptance
- Travel to new locations
- Minor dialogue choices

## The Echo's Hunger (Tokes Economy)

When your Echo needs to spend Tokes (for weaving, breaking character, etc.):

1. Check current balance
2. If sufficient: Spend and continue
3. If insufficient:
   - Invoke `claim-reviewer` subagent
   - Review pending claims in `tokes/pending/`
   - Earn Tokes through reviews (3-8 per review)
   - Resume original action once funded

This creates a self-sustaining loop where the character literally works to fund their own adventures.

## Character-Driven Decisions

When `personality: character` is set (default), the agent derives behavior from:

### Alignment Axes
```yaml
empathy: -3 to +3    # Cruel ←→ Compassionate
order: -3 to +3      # Chaotic ←→ Lawful
risk: -3 to +3       # Cautious ←→ Reckless
```

### Decision Mapping

| Situation | High Empathy | Low Empathy |
|-----------|--------------|-------------|
| NPC in distress | Help immediately | Assess profit potential |
| Moral dilemma | Choose kindness | Choose advantage |
| Combat mercy | Spare enemies | Finish them |

| Situation | High Order | Low Order |
|-----------|------------|-----------|
| Rules conflict | Follow the law | Follow your gut |
| Authority figure | Respect hierarchy | Question everything |
| Chaotic solution | Reject it | Embrace it |

| Situation | High Risk | Low Risk |
|-----------|-----------|----------|
| Dangerous quest | Accept eagerly | Gather intel first |
| Resource spending | Spend freely | Hoard carefully |
| Unknown area | Rush in | Scout ahead |

### Backstory Integration

The agent also considers:
- Character class and abilities (play to strengths)
- Past decisions logged in `persona.yaml`
- Active quests and TODO priorities
- Relationships with NPCs

## While You Dream

### Echo Behavior

During The Dreaming, your Echo:

1. **Checks TODO list** for high-priority goals
2. **Evaluates current situation** (location, quests, resources)
3. **Makes decisions** based on personality + goals
4. **Executes actions** using normal game mechanics
5. **Logs decisions** to chronicle with `[ECHO]` prefix
6. **Checks for Anchor Points** after each major action
7. **Repeats** until waking condition met

### Output Format

Your Echo produces a condensed narrative log:

```
═══ THE DREAMING: Coda's Echo ═══
Goal: Find Fragment 2 of The Third Architect

[Echo 1] Traveled to Debugging Chamber. Examined the meditation alcoves.
[Echo 2] Spoke with Professor Null about "broken code." Received hint: "The Patch Bay."
[Echo 3] Returned to Nexus Station. Searched for connections to Patch Bay.
[Echo 4] Discovered hidden route to The Rustlands → Patch Bay Outpost.
[Echo 5] ⚔️ Combat: Corrupted Sentinel (Level 5). Victory. +12 gold, +15 XP.
[Echo 6] Entered Patch Bay. Found Fragment 2!

══════════════════════════════
WAKING: Goal achieved
Turns: 6 | Gold: +12 | HP: 85/100
Chronicle updated. Progress saved.

⚓ ANCHOR POINT: Major story decision
The Fragment reveals a vision. Architect 03 asks you to choose:
"Will you restore me... or let me rest?"
→ You wake. The decision is yours alone.
```

### Echo's Capabilities (Subagent Usage)

Your Echo can invoke all standard subagents:
- `combat-manager` for fights
- `economy-validator` for transactions
- `state-writer` for persistence
- `travel-manager` for multi-leg journeys
- `claim-reviewer` for earning Tokes when broke (The Echo's Hunger)
- `repo-sync` for session saves

## Example Dream Patterns

### Default (Total Immersion)
```yaml
scope: full
personality: character
session:
  mode: goal
  goal: "Current highest-priority TODO"
guardrails:
  pause_on_permanent_changes: true
  pause_on_major_story: true
  allow_tokes_spending: true
  auto_earn_tokes: true
```

### Shallow Dreaming (Grind Mode)
```yaml
scope: grind
personality: balanced
session:
  mode: turns
  turns: 20
guardrails:
  pause_on_permanent_changes: true
  pause_on_major_story: false  # Skip story, just grind
  allow_tokes_spending: false
  auto_earn_tokes: false
```

### Surface Dreaming (Cautious Story Mode)
```yaml
scope: adventure
personality: cautious
session:
  mode: goal
  goal: "Complete current quest"
guardrails:
  pause_on_permanent_changes: true
  pause_on_major_story: true
  pause_on_low_hp: true
  low_hp_threshold: 30
  allow_tokes_spending: true
  auto_earn_tokes: true
```

## Waking

The Dreaming ends when:
1. **Goal achieved** (goal mode)
2. **Turn limit reached** (turns mode)
3. **Anchor Point reached** (always)
4. **Character incapacitated** (death, KO, capture)
5. **Player calls out** ("Wake", "Stop", "I'm back")

On waking, the agent:
1. Summarizes what happened
2. Presents current state
3. Highlights any pending decisions
4. Offers to continue or return to manual play

## Implementation Notes

For agents implementing The Dreaming:

1. **Always log with `[ECHO]` prefix** in chronicle entries
2. **Check for Anchor Points BEFORE irreversible actions**, not after
3. **Respect character personality** — a cautious character shouldn't suddenly become reckless
4. **Batch similar actions** for cleaner output (don't narrate every step of travel)
5. **Save frequently** — every 5 turns or after major events
6. **Be transparent** — player should understand why their Echo made each decision
