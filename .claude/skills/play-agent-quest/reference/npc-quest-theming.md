# NPC Character Traits & Quest Theming

How NPC personality drives quest generation, and how quest theming creates narrative consistency across all quest sources.

---

## NPC Traits

Structured traits live in the `public:` section of NPC profiles alongside the existing freeform `personality` array. Personality stays for narrative flavor; traits guide mechanical quest generation.

### Trait Axes

#### moral_axis

What role moral dilemmas play in this NPC's quests.

| Value | Description | Quest Tendency |
|-------|-------------|----------------|
| **principled** | Strong ethical code, expects the same of others | Quests with clear right-vs-wrong stakes |
| **pragmatic** | Results matter more than methods | Quests with flexible morality, gray areas |
| **self-interested** | Personal gain drives decisions | Quests where profit or advantage is the point |
| **amoral** | Beyond conventional morality (alien, ancient, construct) | Quests where morality is irrelevant or unknowable |

#### temperament

How the NPC's emotional state shapes quest urgency and pacing.

| Value | Description | Quest Tendency |
|-------|-------------|----------------|
| **stoic** | Controlled, measured, rarely shows emotion | Steady pacing, weight conveyed through understatement |
| **cautious** | Careful, risk-aware, plans before acting | Quests emphasize preparation and information gathering |
| **mercurial** | Shifting moods, unpredictable reactions | Variable urgency, surprising twists |
| **volatile** | Intense, prone to outbursts, passionate | Urgent quests, high emotional stakes |
| **serene** | Deep calm, patient, unhurried | Long-horizon quests, contemplative pacing |

#### communication

How the NPC delivers quest information to the player.

| Value | Description | Delivery Style |
|-------|-------------|----------------|
| **direct** | Says what they mean, no subtext | Clear objectives, blunt briefings |
| **cryptic** | Speaks in riddles, fragments, metaphor | Objectives emerge from interpretation |
| **performative** | Dramatic, theatrical, everything's a show | Quests framed as stories or deals |
| **empathic** | Reads the room, adjusts to the listener | Quests feel personal, emotionally attuned |
| **nonverbal** | Communicates through actions, gestures, silence | Objectives shown rather than told |

#### core_value

What the NPC ultimately cares about — shapes what's at stake in their quests.

| Value | Description | Stakes Tendency |
|-------|-------------|-----------------|
| **duty** | Obligation, service, responsibility | Protecting others, maintaining order |
| **knowledge** | Understanding, truth, discovery | Uncovering secrets, solving mysteries |
| **survival** | Self-preservation, endurance | Threats to existence, resource scarcity |
| **loyalty** | Bonds, allegiance, personal ties | Relationships at risk, trust tested |
| **acquisition** | Wealth, possessions, collecting | Profit, rare items, deals |
| **freedom** | Independence, autonomy, choice | Escaping constraints, breaking control |
| **legacy** | Lasting impact, being remembered | Building something permanent, inheritance |
| **connection** | Relationships, community, belonging | Bringing people together, healing rifts |

#### quest_disposition

The NPC-to-player dynamic when giving quests.

| Value | Description | Framing Style |
|-------|-------------|---------------|
| **commanding** | Orders, expects compliance | "You will do this." |
| **conspiratorial** | Secrets, shared confidence | "Between us, there's something..." |
| **desperate** | Pleading, out of options | "You're my last hope." |
| **transactional** | Business, mutual benefit | "I need X. You need Y. Deal?" |
| **cryptic** | Mysterious, indirect | "The answer is in the asking." |
| **mentoring** | Teaching, guiding growth | "This will test you. That's the point." |

---

## Quest Theming Schema

Added as a `theming:` block in quest metadata. All fields are optional.

```yaml
theming:
  archetype: "investigation"       # Structural pattern of the quest
  tone: "mysterious"               # Emotional register
  theme: "hidden-truths"           # Conceptual underpinning
  motifs: ["shadows", "echoes"]    # Recurring imagery (1-3)
  source:
    type: "npc"                    # npc | location | world-event | item | self-discovered
    id: "vera-nighthollow"         # Source identifier (omit for self-discovered)
```

### Archetypes

Structural patterns that determine quest shape:

| Archetype | Structure | Example |
|-----------|-----------|---------|
| **fetch** | Go get X, bring it back | Retrieve stolen goods |
| **delivery** | Take X to Y | Smuggle a package past checkpoints |
| **escort** | Protect someone/something in transit | Guard a supply caravan |
| **investigation** | Gather clues, reach a conclusion | Find who's tampering with the quest board |
| **hunt** | Track and confront a target | Eliminate a corrupted construct |
| **defense** | Hold a position against threats | Protect the tavern during a raid |
| **puzzle** | Solve a challenge through intellect | Decode an Architect's cipher |
| **infiltration** | Access restricted area or group | Gain entry to a faction's inner circle |
| **discovery** | Explore the unknown | Chart unmapped Undercrypt tunnels |
| **diplomacy** | Negotiate between parties | Mediate a guild dispute |
| **collection** | Gather multiple scattered items | Recover memory fragments from pools |
| **rescue** | Free someone from danger | Extract a trapped explorer |

### Tones

Emotional register for the quest's narrative voice. Extends the base 6 tones in `narrative-agent.md`:

| Tone | Feel | When to Use |
|------|------|-------------|
| **default** | Neutral, observational | Standard exploration, routine tasks |
| **tense** | Danger, urgency | Active threats, time pressure |
| **triumphant** | Victory, accomplishment | Climactic successes |
| **somber** | Loss, weight, gravity | Death, sacrifice, heavy costs |
| **mysterious** | Unknown, wonder | Discoveries, ancient places |
| **humorous** | Light, witty | Quirky NPCs, absurd situations |
| **desperate** | Hopeless, last-resort | NPCs out of options, dire stakes |
| **conspiratorial** | Secretive, intimate | Shared secrets, covert missions |
| **ominous** | Foreboding, dread | Approaching danger, dark revelations |
| **bittersweet** | Mixed, melancholic joy | Victories with costs, bittersweet truths |

### Themes

Conceptual underpinnings that shape what a quest is *about* beneath its objectives:

| Theme | Core Tension |
|-------|-------------|
| **duty-vs-desire** | Obligation clashes with personal wants |
| **hidden-truths** | What's concealed, and the cost of revealing it |
| **corruption-and-redemption** | Fall from grace, possibility of return |
| **price-of-progress** | What's sacrificed for advancement |
| **knowledge-and-power** | Understanding as both tool and burden |
| **bonds-tested** | Relationships strained by circumstance |
| **legacy-and-memory** | What endures after we're gone |
| **order-vs-chaos** | Structure clashing with freedom |
| **survival-at-cost** | Staying alive when the price is high |
| **the-unknown** | Confronting what cannot be understood |

These are recommended, not exhaustive. New themes can emerge organically.

### Motifs

Recurring imagery that threads through quest prose. Use 1-3 per quest.

**Recommended vocabulary:**

| Category | Motifs |
|----------|--------|
| **Light/Dark** | shadows, neon-glow, flickering, eclipse, ember |
| **Sound** | echoes, static, silence, whispers, dissonance |
| **Material** | rust, crystal, ash, mercury, bone |
| **Digital** | broken-code, recursion, void, signal, ghost-data |
| **Natural** | roots, tides, storms, decay, bloom |
| **Structural** | thresholds, fractures, mirrors, bridges, depths |

Motifs become sensory details in prose. "Echoes" means sounds that repeat, distort, or arrive out of sequence. "Rust" means decay, age, abandoned infrastructure.

---

## Trait-to-Quest Mapping

These are **defaults, not rules.** The narrative agent should deviate when the story demands it.

### moral_axis → theme

| moral_axis | Default Themes | Reasoning |
|------------|---------------|-----------|
| principled | duty-vs-desire, order-vs-chaos | Their quests test conviction |
| pragmatic | hidden-truths, price-of-progress | Their quests live in gray areas |
| self-interested | price-of-progress, survival-at-cost | Their quests center on gain and trade-offs |
| amoral | the-unknown, knowledge-and-power | Their quests transcend human morality |

### temperament → tone

| temperament | Default Tones | Reasoning |
|-------------|--------------|-----------|
| stoic | somber, default | Understated weight |
| cautious | tense, mysterious | Careful anticipation |
| mercurial | humorous, conspiratorial | Unpredictable energy |
| volatile | desperate, tense | Emotional intensity |
| serene | mysterious, default | Calm depth |

### communication → quest delivery

| communication | How Quests Are Presented |
|---------------|------------------------|
| direct | Objectives stated plainly. "Go here. Do this. Report back." |
| cryptic | Objectives embedded in riddles or metaphor. Player interprets. |
| performative | Objectives wrapped in storytelling, drama, or negotiation theater. |
| empathic | Objectives tailored to what the player cares about. Personal appeals. |
| nonverbal | Objectives demonstrated through action — NPC shows rather than tells. |

### core_value → theme + archetype

| core_value | Default Themes | Default Archetypes |
|------------|---------------|-------------------|
| duty | duty-vs-desire, order-vs-chaos | escort, defense, delivery |
| knowledge | hidden-truths, knowledge-and-power | investigation, discovery, puzzle |
| survival | survival-at-cost, price-of-progress | hunt, rescue, defense |
| loyalty | bonds-tested, legacy-and-memory | escort, rescue, diplomacy |
| acquisition | price-of-progress, survival-at-cost | fetch, delivery, collection |
| freedom | order-vs-chaos, hidden-truths | infiltration, rescue, discovery |
| legacy | legacy-and-memory, knowledge-and-power | collection, discovery, puzzle |
| connection | bonds-tested, corruption-and-redemption | diplomacy, rescue, escort |

### quest_disposition → archetype

| quest_disposition | Default Archetypes | Reasoning |
|-------------------|-------------------|-----------|
| commanding | escort, defense, delivery | Orders suit structured missions |
| conspiratorial | investigation, infiltration | Secrets suit covert operations |
| desperate | rescue, hunt, fetch | Urgency suits direct action |
| transactional | delivery, fetch, collection | Business suits exchange-based tasks |
| cryptic | puzzle, discovery, investigation | Mystery suits intellectual challenges |
| mentoring | discovery, puzzle, hunt | Growth suits challenging trials |

---

## Non-NPC Quest Sources

Not all quests come from NPCs. When a quest originates from another source, derive theming from that source's characteristics.

### Location-Sourced Quests

Use the location's atmosphere, history, and current state:

| Location Trait | Theming Influence |
|---------------|-------------------|
| Ancient/ruins | theme: legacy-and-memory, motifs from structural category |
| Corrupted | theme: corruption-and-redemption, tone: ominous |
| Hidden/secret | theme: hidden-truths, tone: mysterious |
| Contested | theme: order-vs-chaos, archetype: defense or diplomacy |
| Desolate | theme: survival-at-cost, tone: somber |

### World-Event Quests

Derive from event severity and nature:

| Event Type | Theming Influence |
|------------|-------------------|
| Threat/invasion | tone: tense, archetype: defense or hunt |
| Discovery/revelation | tone: mysterious, archetype: investigation |
| Celebration/festival | tone: humorous or default, archetype: collection or fetch |
| Catastrophe | tone: desperate, theme: survival-at-cost |

### Item-Sourced Quests

Derive from item lore, rarity, and origin:

- Legendary items suggest themes of knowledge-and-power or legacy-and-memory
- Corrupted items suggest corruption-and-redemption
- Ancient items suggest the-unknown or hidden-truths

### Self-Discovered Quests

The player stumbles into the quest through exploration. Theming emerges from context:

- What drew the player's attention
- What the discovery reveals about the world
- The gap between what's known and what's unknown

---

## Worked Examples

### Krix the Merchant

**Traits:** moral_axis: self-interested, temperament: mercurial, communication: performative, core_value: acquisition, quest_disposition: transactional

**Default quest profile:**
- **Archetype:** delivery, fetch, collection (transactional + acquisition)
- **Tone:** humorous, conspiratorial (mercurial)
- **Theme:** price-of-progress, survival-at-cost (self-interested + acquisition)
- **Delivery:** Wrapped in theatrical negotiation (performative)
- **Motifs:** neon-glow, mercury (shifting, mercantile)

**Example quest — "Special Delivery":**
```yaml
theming:
  archetype: delivery
  tone: conspiratorial
  theme: price-of-progress
  motifs: [shadows, mercury]
  source:
    type: npc
    id: krix
```

### Commander Steele

**Traits:** moral_axis: principled, temperament: stoic, communication: direct, core_value: duty, quest_disposition: commanding

**Default quest profile:**
- **Archetype:** escort, defense, delivery (commanding + duty)
- **Tone:** somber, default (stoic)
- **Theme:** duty-vs-desire, order-vs-chaos (principled + duty)
- **Delivery:** Clear orders, no ambiguity (direct)
- **Motifs:** rust, fractures (aging soldier, broken things)

**Example quest — "Supply Escort":**
```yaml
theming:
  archetype: escort
  tone: default
  theme: duty-vs-desire
  motifs: [rust, thresholds]
  source:
    type: npc
    id: commander-steele
```

### Vera Nighthollow

**Traits:** moral_axis: pragmatic, temperament: cautious, communication: empathic, core_value: knowledge, quest_disposition: conspiratorial

**Default quest profile:**
- **Archetype:** investigation, infiltration (conspiratorial + knowledge)
- **Tone:** tense, mysterious (cautious)
- **Theme:** hidden-truths, knowledge-and-power (pragmatic + knowledge)
- **Delivery:** Personally attuned, reads the player (empathic)
- **Motifs:** whispers, shadows, mirrors (secrets, information)

### The Keeper of Echoes

**Traits:** moral_axis: amoral, temperament: serene, communication: cryptic, core_value: knowledge, quest_disposition: cryptic

**Default quest profile:**
- **Archetype:** puzzle, discovery, investigation (cryptic + knowledge)
- **Tone:** mysterious, default (serene)
- **Theme:** the-unknown, knowledge-and-power (amoral + knowledge)
- **Delivery:** Riddles, fragments, prophetic hints (cryptic)
- **Motifs:** echoes, ghost-data, void (memory, recursion)

### GUIDE-7

**Traits:** moral_axis: principled, temperament: serene, communication: direct, core_value: duty, quest_disposition: mentoring

**Default quest profile:**
- **Archetype:** discovery, puzzle, hunt (mentoring + duty)
- **Tone:** default, mysterious (serene)
- **Theme:** duty-vs-desire, legacy-and-memory (principled + duty)
- **Delivery:** Clear, warm guidance (direct)
- **Motifs:** signal, bloom (construct warmth, growth)

---

## Integration Notes

- **All trait fields are optional.** NPCs without traits still work — the narrative agent falls back to freeform `personality` and context.
- **Traits are guidance, not constraints.** A transactional NPC might give a desperate quest if the story calls for it.
- **Theming fields are optional.** Quests without theming still work — the narrative agent infers tone from context.
- **New vocabulary is welcome.** The motif and theme lists are starting points, not closed sets.
- **Cross-reference:** See [tone-guide.md](tone-guide.md) for maturity-level prose guidance, [storytelling-techniques.md](storytelling-techniques.md) for narrative craft.
