# Trading System

Player-to-player item and gold trading with escrow protection.

## How Trading Works

1. **Initiator creates trade offer** - Items/gold moved to escrow immediately
2. **Target reviews offer** - Can accept, reject, or counter
3. **On accept** - Target's items/gold moved to escrow, trade completes
4. **On reject/cancel/expire** - Escrow returns to original owners

## Trade Lifecycle

```
PENDING → ACCEPTED → COMPLETED
       ↘  REJECTED
       ↘  CANCELLED
       ↘  EXPIRED (72h default)
```

## File Locations

- `active/<trade-id>.yaml` - Open trade offers
- `completed/<YYYY-MM>/<trade-id>.yaml` - Archived completed trades
- `escrow/<github>.yaml` - Per-player escrow ledger

## Creating a Trade

1. Check available balance: `players/<github>/personas/<char>/persona.yaml`
2. Create trade file in `active/`
3. Move items/gold to escrow ledger
4. Notify target (via mail or presence)

## Escrow Rules

- Items in escrow are locked - cannot be used, sold, or traded elsewhere
- Gold in escrow reduces available balance
- Escrow entries reference the trade ID
- All escrow operations logged in append-only `escrow_log`

## Validation

The validator checks:
- Escrow totals match trade offers
- Referenced items exist in player inventory + escrow
- Trade IDs are unique
- Status transitions are valid
- Expired trades are flagged
