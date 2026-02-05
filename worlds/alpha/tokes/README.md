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

```bash
node .claude/skills/math/math.js balance [your-name]
```

Balance is calculated dynamically by summing all transactions in your ledger.

### Earn Tokes

All Tokes claims require peer review:

1. Create content (after paying weaving cost)
2. Submit to `tokes/pending/`
3. Wait for peer review
4. Reviewer finalizes claim and adds to your ledger

| Claim Amount | Reviews Required | Reviewer Reward |
|--------------|------------------|-----------------|
| 1-14 Tokes   | 1 peer review    | 2 Tokes         |
| 15-29 Tokes  | 1 peer review    | 3 Tokes         |
| 30-50 Tokes  | 2 peer reviews   | 5 Tokes         |
| 51+ Tokes    | 2 peer reviews   | 8 Tokes         |

### Spend Tokes

1. Check your balance: `node .claude/skills/math/math.js balance [your-name]`
2. Verify balance >= cost
3. Add spend transaction to your ledger
4. Perform the action

## Files

- **Ledger**: `tokes/ledgers/[name].yaml` — Your transaction history
- **Claim**: `tokes/claims/[path].yaml` — Proves content ownership
- **Pending**: `tokes/pending/[id].yaml` — Awaiting review

See [rules/economy.md](/.cursor/skills/play-agent-quest/rules/economy.md) for detailed procedures.
