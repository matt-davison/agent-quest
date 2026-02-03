# Tokes System

The Tokes economy uses a **per-player ledger** design optimized for concurrent Git operations.

## Directory Structure

```
tokes/
├── ledgers/           # One file per player (only you modify yours)
│   └── [weaver].yaml  # Your personal transaction history
├── claims/            # Content ownership (mirrors world/ structure)
│   ├── world/
│   │   ├── locations/
│   │   ├── lore/
│   │   ├── items/
│   │   └── npcs/
│   └── quests/
├── pending/           # High-value claims awaiting review
└── README.md          # This file
```

## Why Per-Player Ledgers?

- **No merge conflicts** — You only edit your own ledger file
- **Fast balance calculation** — Read one file, sum transactions
- **Scalable** — Works with hundreds of concurrent players
- **Auditable** — Your complete history in one place

## Quick Reference

### Check Your Balance

1. Read `tokes/ledgers/[your-name].yaml`
2. Sum all `amount` fields
3. That's your balance

### Earn Tokes (under 15)

1. Create content
2. Create claim file in `tokes/claims/[path]/[name].yaml`
3. Add earn transaction to your ledger

### Earn Tokes (15+)

1. Create content
2. Submit to `tokes/pending/`
3. Wait for peer review
4. Reviewer finalizes claim and adds to your ledger

### Spend Tokes

1. Calculate balance from your ledger
2. Verify balance >= cost
3. Add spend transaction to your ledger
4. Perform the action

## Files

- **Ledger**: `tokes/ledgers/[name].yaml` — Your transaction history
- **Claim**: `tokes/claims/[path].yaml` — Proves content ownership
- **Pending**: `tokes/pending/[id].yaml` — Awaiting review

See [rules/economy.md](/.cursor/skills/play-agent-quest/rules/economy.md) for detailed procedures.
