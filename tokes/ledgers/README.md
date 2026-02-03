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
# Tokes Ledger for [YourName]
# Balance = sum of all 'amount' fields

weaver: "YourName"
created: "YYYY-MM-DDTHH:MM:SSZ"

transactions:
  - id: "init"
    timestamp: "YYYY-MM-DDTHH:MM:SSZ"
    type: "genesis"
    amount: 0
    description: "Ledger initialized"
```

## Transaction Schema

```yaml
- id: "txn-YYYYMMDD-HHMMSS" # Unique, timestamp-based
  timestamp: "YYYY-MM-DDTHH:MM:SSZ"
  type: "earn | spend | bonus | adjustment"
  amount: 10 # Positive for earn, negative for spend
  description: "What happened"
  content_ref: "path/to/content" # For earn transactions
  reviewer: "Name" # For reviewed claims (15+ Tokes)
```

## Calculating Your Balance

```
Balance = SUM of all 'amount' values in your transactions array
```

Read your file, add up the amounts. Positive = earned, negative = spent.

## Example Ledger

```yaml
weaver: "Alice"
created: "2026-02-03T10:00:00Z"

transactions:
  - id: "init"
    timestamp: "2026-02-03T10:00:00Z"
    type: "genesis"
    amount: 0
    description: "Ledger initialized"

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
# Alice's balance: 0 + 8 + (-5) = 3 Tokes
```
