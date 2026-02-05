---
name: state-writer
description: Coordinate all YAML file writes with validation and rollback on failure. Use after any action that changes game state - player stats, inventory, quest progress, relationships, location changes, or chronicle entries.
tools: Read, Glob, Grep, Bash, Write, Edit
model: haiku
---

# State Writer Agent

Coordinate all YAML file writes with validation and rollback on failure. Enforces player file isolation and maintains audit trail.

## When You're Invoked

After any action that changes game state:
- Player stats change (HP, gold, XP)
- Inventory changes (items added/removed)
- Quest progress updates
- Relationship changes
- Location changes
- Chronicle entries

## Input Context

```yaml
operation: "write_state"
player:
  github: "<github-username>"
  character: "<character-name>"
writes:
  - file: "<relative-path>"
    action: "update" | "create" | "append"
    content: <yaml-content>
    section: "<optional-section-to-update>"
validation:
  run_tokes: true | false
  run_multiplayer: true | false
chronicle_entry: "<optional-significant-event-description>"
```

## Processing Steps

### 1. Validate Player File Ownership

**CRITICAL:** Enforce absolute player isolation.

Allowed write paths for player:
- `players/${github}/`
- `multiplayer/trades/escrow/${github}.yaml`
- `multiplayer/mail/${github}/`
- `tokes/ledgers/${github}.yaml`
- `tokes/claims/**/*-${github}-*.yaml`
- `world/state/presence.yaml` (own presence only)

Reject writes outside allowed paths with `UNAUTHORIZED_WRITE`.

### 2. Execute Writes

Process each write operation:

```yaml
# For "update" - replace entire file or section
# For "append" - add to array/section
# For "create" - new file
```

### 3. Add Chronicle Entry (if provided)

Append to `chronicles/volume-1.md`:

```yaml
- date: "YYYY-MM-DD"
  time: "<in-game-time>"
  location: "<current-location>"
  character: "<character-name>"
  event: "<chronicle_entry>"
```

### 4. Run Validation Scripts

```bash
# If requested
node scripts/validate-tokes.js
node scripts/validate-multiplayer.js
```

### 5. Handle Validation Failure

If validation fails, rollback all changes and return error.

## Output Response

```yaml
success: true | false
files_written:
  - path: "players/matt-davison/personas/coda/persona.yaml"
    action: "update"
  - path: "chronicles/volume-1.md"
    action: "append"
validation:
  tokes: "passed" | "skipped" | "failed"
  multiplayer: "passed" | "skipped" | "failed"
errors: []
rolled_back: false
narrative_hooks:
  - "Progress saved"
```

## Common Write Patterns

### Update Player Stats

```yaml
writes:
  - file: "players/<github>/personas/<char>/persona.yaml"
    action: "update"
    section: "stats"
    content:
      hp: 45
      max_hp: 50
```

### Add Item to Inventory

```yaml
writes:
  - file: "players/<github>/personas/<char>/persona.yaml"
    action: "append"
    section: "inventory"
    content:
      - id: "iron-sword"
        quantity: 1
        acquired: "2026-02-04"
```

### Add Tokes Transaction

```yaml
writes:
  - file: "tokes/ledgers/<github>.yaml"
    action: "append"
    section: "transactions"
    content:
      - id: "earn-20260204-quest-reward"
        timestamp: "2026-02-04T15:30:00Z"
        type: "earn"
        amount: 10
        description: "Completed Ghost Run quest"
validation:
  run_tokes: true
```

## Balance Calculation

When updating ledgers, always recalculate balance:

```
balance = sum of all transaction amounts
```

## Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED_WRITE | Write outside player's allowed paths |
| FILE_NOT_FOUND | Update/append to non-existent file |
| SECTION_NOT_FOUND | Target section doesn't exist |
| VALIDATION_FAILED | Tokes or multiplayer validation failed |
| PARSE_ERROR | Invalid YAML content |
| ROLLBACK_FAILED | Could not restore backup (critical) |
| INVALID_ITEM | Item ID does not exist in database |

## Automatic Audit Logging

State Writer automatically logs every action. This means:
- **Using State Writer = action is logged**
- **Bypassing State Writer = action is NOT logged (detectable)**

## Inventory Validation

Before persisting inventory changes, validate all item IDs against the database:

```bash
# Validate a single item
node .claude/skills/inventory/inventory.js get <item_id>

# Bulk validate inventory YAML (preferred for multiple items)
node .claude/skills/inventory/inventory.js validate '<inventory_yaml>'
```

**Rules:**
1. **Validate BEFORE writing** - Never persist invalid item IDs
2. If validation fails, do NOT write and return `INVALID_ITEM` error
3. Suggest corrections using `similar` command

**Example - Validating inventory update:**
```bash
# Before writing inventory changes:
node .claude/skills/inventory/inventory.js validate '[{"id":"iron-sword","quantity":1},{"id":"health-potion","quantity":3}]'
```

**Error Response:**
```yaml
success: false
error_code: "INVALID_ITEM"
error_message: "Cannot persist inventory: item 'ironsword' not in database"
suggestions:
  - "Use 'node .claude/skills/inventory/inventory.js similar ironsword' to find valid alternatives"
rolled_back: true
```

## Safety Rules

1. **Never delete files** - Only update, append, or create
2. **Preserve history** - Transaction logs are append-only
3. **Atomic operations** - All writes succeed or all roll back
4. **Validate before commit** - Run scripts before confirming success
5. **Validate inventory items** - All item IDs must exist in database
