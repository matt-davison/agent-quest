# Subagent System (DEPRECATED)

> **NOTE:** This directory contains legacy documentation. The subagent system has been replaced with proper Claude Code agents in `.claude/agents/`.

## New Agent Location

Agents are now defined in `.claude/agents/` with YAML frontmatter. Claude automatically delegates to them based on their descriptions - no manual invocation needed.

See `.claude/agents/README.md` for the current architecture.

## Migration

The agents now available are:
- `combat-manager` - Combat mechanics
- `economy-validator` - Transaction validation
- `state-writer` - File writes with validation
- `repo-sync` - Git operations
- `travel-manager` - Multi-turn travel
- `multiplayer-handler` - Player interactions
- `claim-reviewer` - Tokes claim review

The documentation files in this directory are kept for reference but should not be used for new development.

---

# Legacy Documentation (for reference)

## Architecture

```
Main Agent (Narrative Focus)
    │
    ├─→ Combat Manager ─────→ Returns: outcome + state diffs
    │
    ├─→ Economy Validator ──→ Returns: valid/invalid + transaction
    │
    ├─→ State Writer ───────→ Returns: success + files written
    │
    ├─→ Repo Sync ──────────→ Returns: new content / commit status / PR URL
    │
    ├─→ Travel Manager ─────→ Returns: travel outcome + encounters
    │
    ├─→ Multiplayer Handler ─→ Returns: action result + state changes
    │
    └─→ Claim Reviewer ─────→ Returns: review + Tokes earned
```

## Key Principles

### 1. Subagents Return Data, Not Narrative

Subagents provide structured YAML with `narrative_hooks` fields. The main agent weaves these into the story.

**Good subagent response:**
```yaml
success: true
data:
  damage_dealt: 15
  target_hp_remaining: 23
narrative_hooks:
  - "The blade bites deep"
  - "Enemy staggers but holds"
```

**Bad subagent response:**
```
You swing your sword and deal 15 damage! The enemy is hurt but still standing!
```

### 2. State Writer is Single Point of Truth

All file writes go through State Writer. This is critical because:
- State Writer runs validation scripts
- State Writer automatically logs actions to session audit
- **Direct file writes bypass both validation AND audit logging**

If an action isn't logged, it means State Writer wasn't used - which is detectable.

### 3. Player Isolation is Absolute

Subagents enforce file ownership. A player can only modify:
- `players/<their-github>/`
- Files explicitly referenced in trades/interactions

### 4. Append-Only Transactions

Ledgers, escrow logs, and chronicles are append-only. Never delete or modify existing entries.

### 5. Repo Sync Invoked Regularly

The main agent should invoke Repo Sync:
- **Session start**: Fetch new multiplayer content
- **After multiplayer actions**: Push changes, fetch responses
- **Periodically**: Sync during long sessions
- **Session end**: Ensure all committed + create PR

### 6. Git Operations Always Through Repo Sync

Never use raw git commands in the main agent. All git operations go through Repo Sync.

## Subagent Reference

| File | When to Use |
|------|-------------|
| [combat-manager.md](combat-manager.md) | Combat encounters, attack resolution |
| [economy-validator.md](economy-validator.md) | Before any Tokes/gold transaction |
| [state-writer.md](state-writer.md) | After any action that changes game state |
| [repo-sync.md](repo-sync.md) | Git operations, multiplayer content sync |
| [travel-manager.md](travel-manager.md) | Multi-turn travel with encounters |
| [multiplayer-handler.md](multiplayer-handler.md) | Trades, parties, mail, guilds, duels |
| [claim-reviewer.md](claim-reviewer.md) | REVIEW action to earn Tokes |

## Existing Code to Leverage

Subagents should use these existing scripts and skills:

| Script/Skill | Purpose |
|--------------|---------|
| `scripts/validate-tokes.js` | Economy validation |
| `scripts/validate-multiplayer.js` | Multiplayer state validation |
| `.claude/skills/math/math.js` | All calculations (dice, damage, Tokes) |
| `.claude/skills/inventory/inventory.js` | Item lookups |
| `.claude/skills/world-state/world-state.js` | Time, weather, travel, NPC locations |
| `.claude/skills/relationships/relationships.js` | NPC standings |

## Error Handling

When a subagent encounters an error:

1. Return structured error response:
```yaml
success: false
errors:
  - code: "INSUFFICIENT_BALANCE"
    message: "Not enough gold for transaction"
    context:
      required: 100
      available: 50
```

2. Main agent presents error narratively
3. No partial state changes committed

## Example Flow: Combat

1. Main agent detects combat trigger
2. Load `subagents/combat-manager.md`
3. Spawn Task agent with combatant stats, initiative
4. Combat Manager:
   - Rolls initiative using math.js
   - Resolves attacks turn by turn
   - Returns structured outcome
5. Main agent weaves outcome into narrative
6. Load `subagents/state-writer.md`
7. Spawn Task agent to update persona HP, inventory
8. State Writer validates and commits changes

## Example Flow: Session End

1. Main agent detects session end trigger
2. Load `subagents/repo-sync.md`
3. Spawn Task agent with operation: "end_session"
4. Repo Sync:
   - Runs all validation scripts
   - Creates descriptive commit
   - Creates PR with session summary
   - Returns PR URL
5. Main agent presents PR link to player
