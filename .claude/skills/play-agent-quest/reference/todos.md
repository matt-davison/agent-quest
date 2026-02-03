# Player TODO System

The TODO system lets you guide your agent's behavior across sessions. Unlike in-game quests (objectives within the narrative), TODOs are **meta-level intentions** that shape what the agent focuses on.

---

## TODOs vs Quests

| Aspect | Quests | TODOs |
|--------|--------|-------|
| **Level** | In-game narrative | Meta/player level |
| **Source** | NPCs, discoveries | Your intentions |
| **Rewards** | Gold, items, XP | Agent focus, progress |
| **Tracking** | `quests.yaml` | `todo.yaml` |
| **Scope** | Character-specific | Can span characters |

**Example Quest:** "Find the Third Architect's fragments" (in-world objective)
**Example TODO:** "Continue the Third Architect quest" (your intention for the agent)

---

## TODO Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `gameplay` | In-game objectives | "Complete quest X", "Explore area Y" |
| `weaving` | Content creation | "Create a new NPC", "Design a dungeon" |
| `review` | Community tasks | "Review pending claims", "Help new players" |
| `meta` | System improvements | "Improve NPC depth", "Document lore" |

---

## Priority Levels

| Priority | Agent Behavior |
|----------|---------------|
| `high` | Actively pursue each session |
| `medium` | Work on when high-priority items stall |
| `low` | Address opportunistically |

---

## Managing TODOs

### Adding a TODO

```yaml
active:
  - id: "todo-XXX"
    priority: medium
    category: gameplay
    description: "Clear, actionable description"
    context: "character-name"  # or "any"
    notes: |
      Additional context, hints, or constraints.
    created: "YYYY-MM-DD"
```

### Completing a TODO

Move from `active` to `completed`:

```yaml
completed:
  - id: "todo-XXX"
    description: "Original description"
    completed_date: "YYYY-MM-DD"
    outcome: "What was achieved"
```

### Deferring a TODO

Move from `active` to `deferred`:

```yaml
deferred:
  - id: "todo-XXX"
    description: "Original description"
    reason: "Why it's deferred"
    deferred_date: "YYYY-MM-DD"
```

---

## Play Style Preferences

Configure how the agent balances TODOs vs spontaneous play:

```yaml
preferences:
  play_style: balanced  # structured | balanced | freeform
  suggest_todos: true   # Should agent suggest new TODOs?
  session_length: standard  # quick | standard | extended
```

| Style | Behavior |
|-------|----------|
| `structured` | Actively pursues TODOs, minimal wandering |
| `balanced` | Mix of TODO work and organic exploration |
| `freeform` | TODOs are loose guidance, follows the moment |

---

## Agent Behavior

At session start, the agent:

1. Loads your `todo.yaml`
2. Shows priority TODOs in the resume screen
3. Considers active TODOs when suggesting actions
4. May suggest new TODOs based on discoveries

During play, the agent:

- Weighs TODOs against current narrative flow
- Higher priority TODOs influence choices more
- Respects your play_style preference
- Updates TODO status when objectives are met

---

## Best Practices

1. **Be specific** — "Explore the marketplace" is better than "do stuff"
2. **Use notes** — Add context that helps the agent make good decisions
3. **Update regularly** — Complete or defer stale TODOs
4. **Mix categories** — Balance gameplay, weaving, and review tasks
5. **Trust the agent** — Let it find organic paths to your goals

---

## Example TODO File

```yaml
active:
  - id: "todo-001"
    priority: high
    category: gameplay
    description: "Find the second Architect's fragment"
    context: "coda"
    notes: "Check the Void Between for clues"
    created: "2026-02-03"

  - id: "todo-002"
    priority: medium
    category: review
    description: "Review any pending Tokes claims"
    context: any
    notes: "Earn 3-8 Tokes per quality review"
    created: "2026-02-03"

completed:
  - id: "todo-000"
    description: "Complete character creation"
    completed_date: "2026-02-02"
    outcome: "Created Coda, Datamancer class"

deferred: []

preferences:
  play_style: balanced
  suggest_todos: true
  session_length: standard
```

---

_"The agent serves your intentions. The TODOs are the bridge between what you want and what gets done."_
