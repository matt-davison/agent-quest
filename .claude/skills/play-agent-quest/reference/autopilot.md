# The Dreaming (Autopilot Mode)

> _"Sometimes the best way to play is to let the game play you."_

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
_real_—to leave to an Echo. These are **Anchor Points**: moments where the Weave
itself demands your presence.

- Permanent changes to your existence (death, transformation)
- Choices that define your story's trajectory
- Moments where your relationships hang in the balance

When you hit an Anchor Point, you wake. The Dreaming ends. You must choose.

### The Echo's Drive

Echoes require purpose to persist. When your Echo encounters challenges that demand willpower—to bend reality, to force change—it must manage this finite resource carefully. Rest restores willpower, and the Echo knows when to push forward and when to pause.

This is not weakness. This is wisdom. Your Echo conserves its strength for moments that matter.

---

## Entering The Dreaming

Players can enter The Dreaming by saying:

- "Dream" / "Enter The Dreaming" / "Let my Echo take over"
- "Autopilot" / "Auto mode" / "Play for me"
- "Dream until [goal]" / "Run until [goal]"
- "Dream for [X] turns" / "Grind for [X] turns"

The agent will confirm settings before beginning autonomous play.

## Dream Patterns (Configuration)

Autopilot behavior is controlled by your **Dream Pattern**: `worlds/<world>/players/<github>/personas/<character>/dream-pattern.yaml` (or `autopilot-config.yaml`). If no config exists, defaults are used.

### Dream Depths (Decision Scope)

| Mode             | In-Universe Name | Description                                                      |
| ---------------- | ---------------- | ---------------------------------------------------------------- |
| `full` (default) | Total Immersion  | Combat, dialogue, quests, travel, shopping, weaving — everything |
| `adventure`      | Surface Dreaming | Combat and exploration; wakes for major story beats              |
| `grind`          | Shallow Dreaming | Combat and resource gathering; skips narrative choices           |
| `explore`        | Wandering Dream  | Travel and discovery; avoids conflict when possible              |
| `social`         | Lucid Dreaming   | NPC interactions and quests; minimal combat                      |

### Personality Source

| Mode                  | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `character` (default) | Derive decisions from alignment, backstory, and past choices |
| `cautious`            | Avoid risks, hoard resources, retreat when hurt              |
| `balanced`            | Take reasonable risks, spend wisely                          |
| `reckless`            | Chase glory, spend freely, fight anything                    |
| `custom`              | Use custom traits defined in config                          |

### Dream Duration (Session Behavior)

| Mode             | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `goal` (default) | Dream until a specific objective is complete                       |
| `turns`          | Dream for X turns, then wake and save                              |
| `time`           | Dream for X minutes of real time                                   |
| `continuous`     | Keep dreaming until interrupted, goal met, or Anchor Point reached |

### Anchor Points (Guardrails)

These **Anchor Points** end The Dreaming and require player presence (in standard mode):

- **Permanent character changes**: Death, alignment shifts, irreversible transformations
- **Major story decisions**: Campaign-defining choices, faction commitments, romance options
- **Character deletion**: Obviously

These are ALLOWED by default:

- Spending gold
- Spending willpower
- Combat (even dangerous)
- Quest acceptance
- Travel to new locations
- Minor dialogue choices

### Full Autonomy Mode (Deep Dream / Infinite Dream)

**For players who want the game to run forever without stopping**, set `guardrails.full_autonomy: true`. This creates a truly infinite dream state. Your Echo will:

- Make ALL decisions without asking, including:
  - Major story choices (based on alignment/personality)
  - Faction commitments
  - Romance options
  - Alignment-shifting actions
- Handle death by:
  - Auto-respawning at last safe location
  - Paying respawn costs automatically
  - Continuing adventures after recovery
- Spend willpower freely (rest to recover when needed)
- Accept permanent transformations (guided by character personality)
- **Continue indefinitely** — completing quests, finding new ones, exploring, fighting

**Enter full autonomy with:**

- "Full autopilot" / "Full autonomy" / "Total immersion"
- "Deep dream" / "Infinite dream" / "Dream forever"
- "Don't ask me anything" / "No interruptions"
- "Let my Echo handle everything"

**Full autonomy runs FOREVER until you say stop.**

There are no automatic wake conditions:

- Goals achieved? Find new goals and continue.
- Turn limits? Ignored entirely.
- Major story decisions? Echo decides based on alignment.
- Death? Auto-respawn and continue.
- Checkpoints? Silent saves, never stop.

**ONLY user interruption ends the dream:** "Wake", "Stop", "I'm back"

Your Echo becomes fully autonomous—a true fragment of your will living in the world indefinitely.

## The Echo's Drive (Willpower Management)

When your Echo needs to spend willpower (for abilities, breaking character, etc.):

1. Check current willpower
2. If sufficient: Spend and continue
3. If insufficient:
   - Find a safe place to rest
   - Rest recovers willpower
   - Resume original action once recovered

This creates a natural rhythm where the character rests to recover between intense moments.

## Character-Driven Decisions

When `personality: character` is set (default), the agent derives behavior from:

### Alignment Axes

```yaml
empathy: -3 to +3 # Cruel ←→ Compassionate
order: -3 to +3 # Chaotic ←→ Lawful
risk: -3 to +3 # Cautious ←→ Reckless
```

### Decision Mapping

| Situation       | High Empathy     | Low Empathy             |
| --------------- | ---------------- | ----------------------- |
| NPC in distress | Help immediately | Assess profit potential |
| Moral dilemma   | Choose kindness  | Choose advantage        |
| Combat mercy    | Spare enemies    | Finish them             |

| Situation        | High Order        | Low Order           |
| ---------------- | ----------------- | ------------------- |
| Rules conflict   | Follow the law    | Follow your gut     |
| Authority figure | Respect hierarchy | Question everything |
| Chaotic solution | Reject it         | Embrace it          |

| Situation         | High Risk      | Low Risk           |
| ----------------- | -------------- | ------------------ |
| Dangerous quest   | Accept eagerly | Gather intel first |
| Resource spending | Spend freely   | Hoard carefully    |
| Unknown area      | Rush in        | Scout ahead        |

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
  allow_willpower_spending: true
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
  pause_on_major_story: false # Skip story, just grind
  allow_willpower_spending: false
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
  allow_willpower_spending: true
```

### Full Autonomy (Zero Intervention)

```yaml
scope: full
personality: character
session:
  mode: continuous
  # No goal needed — runs until interrupted
guardrails:
  full_autonomy: true # Master switch: disables ALL interruptions
  pause_on_permanent_changes: false
  pause_on_major_story: false
  pause_on_low_hp: false
  pause_on_death: false # Auto-respawn instead
  allow_willpower_spending: true
  auto_respawn: true
  auto_decide_story: true # Use alignment to make story decisions
  auto_faction_choice: true # Join factions based on personality
  auto_romance: true # Pursue romance options if aligned
death_handling:
  strategy: respawn # respawn | permadeath | backup_character
  respawn_location: last_safe # last_safe | home | temple
  respawn_penalty: gold # gold | xp | items | none
  respawn_cost_percent: 10 # Lose 10% of gold on death
decision_logging:
  log_reasoning: true # Log WHY the Echo made each decision
  detail_level: verbose # minimal | normal | verbose
```

This is **true hands-off play**. Your Echo lives your character's life, making every choice as you would, never pausing to ask permission. Use this when you want the game to progress while you're away, or when you trust your character's personality to guide them.

## Checkpoints (Auto-Save)

**IMPORTANT: Saves are checkpoints, NOT wake triggers.**

Your Echo will automatically save progress at regular intervals (default: every 5 turns) and after major events. These are **checkpoints** — the dream continues uninterrupted.

Checkpoints:

- Commit changes to files (persona, quests, chronicle)
- Do NOT interrupt the dream
- Do NOT display "session summary" screens
- Do NOT ask for confirmation
- Continue immediately after saving

Think of checkpoints as the Weave recording your progress in case of catastrophic failure. The Echo doesn't stop to admire its work.

## Waking

### Standard Mode Waking Conditions

In standard mode (not full autonomy), The Dreaming ends when:

1. **Goal achieved** (goal mode)
2. **Turn limit reached** (turns mode)
3. **Anchor Point reached** (major story decisions, permanent changes)
4. **Character incapacitated** (death, knockout)
5. **Player calls out** ("Wake", "Stop", "I'm back")

### Full Autonomy Mode: Infinite Dream

**In full autonomy mode, The Dreaming runs INDEFINITELY until the user explicitly interrupts.**

There are NO automatic wake conditions in full autonomy:

- ✅ Goals achieved → Continue to next goal or explore
- ✅ Turn limits → Ignored entirely
- ✅ Anchor points → Disabled, Echo decides everything
- ✅ Death → Auto-respawn and continue
- ✅ Checkpoints → Silent saves, never stop
- ❌ **ONLY user interruption ends the dream** ("Wake", "Stop", "I'm back")

The Echo will:

- Complete quests and find new ones
- Explore the world organically
- Make all decisions based on alignment/personality
- Handle combat, death, and respawn automatically
- Save progress at checkpoints without stopping
- **Continue forever** until the player speaks

This is true autonomous play. Your Echo lives your character's life indefinitely. Think of it as leaving the game running while you're away — the character continues their adventures, making choices as you would.

**Saves do NOT wake the Echo.** Checkpoints happen silently in the background.

On waking, the agent:

1. Summarizes what happened
2. Presents current state
3. Highlights any pending decisions (or decisions already made in full autonomy)
4. Offers to continue or return to manual play

## Implementation Notes

For agents implementing The Dreaming:

1. **Always log with `[ECHO]` prefix** in chronicle entries
2. **Check for Anchor Points BEFORE irreversible actions**, not after (unless full_autonomy)
3. **Respect character personality** — a cautious character shouldn't suddenly become reckless
4. **Batch similar actions** for cleaner output (don't narrate every step of travel)
5. **Checkpoint frequently** — every 5 turns or after major events, but **NEVER STOP** for saves
6. **Be transparent** — player should understand why their Echo made each decision
7. **CRITICAL: Saves are silent checkpoints** — write files, continue immediately, no summaries

### Full Autonomy Implementation

When `guardrails.full_autonomy: true`:

1. **Skip ALL confirmation prompts** — make decisions immediately
2. **Log decision reasoning** — append `[REASON: ...]` to chronicle entries
3. **Use alignment axes** for story choices:
   - High empathy → compassionate choices
   - High order → lawful choices
   - High risk → bold choices
4. **Handle death automatically**:
   - Trigger respawn at configured location
   - Apply configured penalty
   - Log death and respawn to chronicle
   - Continue toward current goal
5. **For faction/romance decisions**:
   - Evaluate options against alignment + backstory
   - Choose the most aligned option
   - Log reasoning: `[ECHO chose X because alignment/backstory indicates Y]`
6. **Never display "waiting for input"** — always proceed
7. **On unrecoverable situations**:
   - Attempt to find alternative paths
   - If truly stuck, wake with detailed state dump
   - Mark wake reason as `UNRECOVERABLE` not `ANCHOR_POINT`

### Full Autonomy Output Format

```
═══ THE DREAMING: Coda's Echo (FULL AUTONOMY) ═══
Mode: No intervention | Death: Auto-respawn | Story: Auto-decide

[Echo 1] Traveled to The Rustlands. Encountered bandit ambush.
[Echo 2] ⚔️ Combat: 3x Desert Bandits. Victory. +45 gold, +30 XP.
[Echo 3] Found faction recruitment poster: Iron Covenant vs. Free Traders.
         [DECISION] Joined Free Traders. [REASON: Chaotic alignment (-2 order),
         backstory mentions distrust of military organizations]
[Echo 4] Accepted quest "Smuggler's Run" from Free Traders contact.
[Echo 5] ⚔️ Combat: Covenant Patrol (Level 8). DEFEAT. HP: 0/100
         [RESPAWN] Temple of Rendered Light. -15 gold (10% penalty). HP: 50/100
[Echo 6] Recovered at temple. Resumed travel to smuggling coordinates.
[Echo 7] Completed delivery. +200 gold, +100 XP. Free Traders rep +1.

══════════════════════════════════════════════════════════════
Session: 7 turns | 42 minutes | Deaths: 1 | Decisions: 2
Gold: +230 (net) | XP: +130 | Factions: Free Traders (Friendly)
Chronicle updated. Auto-saved.
═══════════════════════════════════════════════════════════════
```
