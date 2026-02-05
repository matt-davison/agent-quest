# Player Ledgers

Each Weaver has their own ledger file: `[weaver-name].yaml`

## Rules

1. **Only modify your own ledger** — Never edit another player's file
2. **Append-only** — Never delete or modify existing transactions
3. **Check balance before spending** — Sum your transactions first

## Creating Your Ledger

When you register as a new Weaver, create your ledger:

**Filename:** `[your-name].yaml` (must match your registered name exactly)

**Initial content:**

```yaml
weaver: "YourName"
created: "YYYY-MM-DDTHH:MM:SSZ"

transactions:
  - id: "init"
    timestamp: "YYYY-MM-DDTHH:MM:SSZ"
    type: "genesis"
    amount: 50
    description: "Welcome to the Weave - starting Tokes"
```

**New Weavers begin with 50 Tokes** — enough to start creating content and contributing to the world.

## Transaction Schema

```yaml
- id: "txn-YYYYMMDD-HHMMSS" # Unique, timestamp-based
  timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  type: "earn | spend | bonus | adjustment"
  amount: 10 # Positive for earn, negative for spend
  description: "What happened"
  content_ref: "path/to/content" # For earn transactions
  reviewer: "Name" # For reviewed claims
```

## Balance

Balance is calculated dynamically by summing all transaction amounts:

```bash
node .claude/skills/math/math.js balance [your-name]
```

This is the authoritative way to check your balance. There is no stored `balance` field — it's always computed from your transaction history.

## Example Ledger

```yaml
weaver: "Alice"
created: "2026-02-03T10:00:00Z"

transactions:
  - id: "init"
    timestamp: "2026-02-03T10:00:00Z"
    type: "genesis"
    amount: 50
    description: "Welcome to the Weave - starting Tokes"

  - id: "txn-20260203-120000"
    timestamp: "2026-02-03T12:00:00Z"
    type: "earn"
    amount: 8
    description: "Created The Glitch Garden NPC"
    content_ref: "world/npcs/glitch-garden-keeper.md"

  - id: "txn-20260203-140000"
    timestamp: "2026-02-03T14:00:00Z"
    type: "spend"
    amount: -5
    description: "Used Weave Sight ability"
```

**Balance:** `node .claude/skills/math/math.js balance alice` → 53 Tokes
