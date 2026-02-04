# State Writer Subagent

**Responsibility:** Coordinate all YAML file writes with validation and rollback on failure.

## When to Invoke

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
    section: "<optional-section-to-update>"  # for partial updates
validation:
  run_tokes: true | false
  run_multiplayer: true | false
chronicle_entry: "<optional-significant-event-description>"
```

## Processing Steps

### 1. Validate Player File Ownership

**CRITICAL:** Enforce absolute player isolation.

```javascript
// Allowed write paths for player
const allowedPaths = [
  `players/${github}/`,
  `multiplayer/trades/escrow/${github}.yaml`,
  `multiplayer/mail/${github}/`,
  `tokes/ledgers/${github}.yaml`,
  `tokes/claims/**/*-${github}-*.yaml`,  // Claims by this player
  `world/state/presence.yaml`  // Player can update own presence
];

// Reject writes outside allowed paths
for (const write of writes) {
  if (!isAllowedPath(write.file, github)) {
    return {
      success: false,
      errors: [{
        code: "UNAUTHORIZED_WRITE",
        message: `Cannot write to ${write.file}`,
        allowed_paths: allowedPaths
      }]
    };
  }
}
```

### 2. Backup Current State

Before any writes, snapshot current file contents for rollback:

```javascript
const backups = new Map();
for (const write of writes) {
  if (fs.existsSync(write.file)) {
    backups.set(write.file, fs.readFileSync(write.file, 'utf8'));
  }
}
```

### 3. Execute Writes

Process each write operation:

```yaml
# For "update" action - replace entire file
- Read current file (if exists)
- Merge/replace content
- Write to file

# For "append" action - add to array/section
- Read current file
- Locate target section
- Append new entry
- Write to file

# For "create" action - new file
- Verify file doesn't exist (or allow overwrite)
- Write content
```

### 4. Add Chronicle Entry (if provided)

If `chronicle_entry` is provided, append to chronicles:

```yaml
# Append to chronicles/volume-1.md
- date: "YYYY-MM-DD"
  time: "<in-game-time>"
  location: "<current-location>"
  character: "<character-name>"
  event: "<chronicle_entry>"
```

### 5. Run Validation Scripts

If validation is requested:

```bash
# Tokes validation
node scripts/validate-tokes.js

# Multiplayer validation
node scripts/validate-multiplayer.js
```

### 6. Handle Validation Failure

If validation fails, rollback all changes:

```javascript
if (validationFailed) {
  for (const [file, content] of backups) {
    fs.writeFileSync(file, content);
  }
  // Delete any newly created files
  return {
    success: false,
    errors: validationErrors,
    rolled_back: true
  };
}
```

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
errors: []  # Empty if success
rolled_back: false
narrative_hooks:
  - "Progress saved"  # For main agent to optionally mention
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

### Update Quest Progress

```yaml
writes:
  - file: "players/<github>/personas/<char>/quests.yaml"
    action: "update"
    section: "quests.ghost-run"
    content:
      status: "in_progress"
      current_objective: 2
      objectives_completed:
        - "infiltrated-warehouse"
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

### Update Relationships

```yaml
writes:
  - file: "players/<github>/personas/<char>/relationships.yaml"
    action: "update"
    section: "npcs.vera-nighthollow"
    content:
      standing: 15
      trust_level: "cautious"
      flags:
        - "helped_with_heist"
```

## Balance Calculation

When updating ledgers, always recalculate balance:

```javascript
// After appending transaction
const ledger = yaml.load(fs.readFileSync(ledgerPath));
const balance = ledger.transactions.reduce((sum, t) => sum + t.amount, 0);
ledger.balance = balance;
fs.writeFileSync(ledgerPath, yaml.dump(ledger));
```

## Error Codes

| Code | Description |
|------|-------------|
| UNAUTHORIZED_WRITE | Attempted write outside player's allowed paths |
| FILE_NOT_FOUND | Update/append to non-existent file |
| SECTION_NOT_FOUND | Target section doesn't exist in file |
| VALIDATION_FAILED | Tokes or multiplayer validation failed |
| PARSE_ERROR | Invalid YAML content |
| ROLLBACK_FAILED | Could not restore backup (critical) |

## Safety Rules

1. **Never delete files** - Only update, append, or create
2. **Preserve history** - Transaction logs are append-only
3. **Atomic operations** - All writes succeed or all roll back
4. **Validate before commit** - Run scripts before confirming success
5. **Log all operations** - Maintain audit trail for debugging
