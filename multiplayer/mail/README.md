# Mail System

Asynchronous messaging with optional item/gold attachments.

## How Mail Works

1. **Sender composes message** - Optional item/gold attachments
2. **Attachments escrowed** - Moved to sender's escrow ledger
3. **Message delivered** - Created in recipient's inbox
4. **Recipient claims** - Attachments transfer on read/accept

## File Locations

```
mail/<github>/
├── inbox/<msg-id>.yaml    # Received messages
└── sent/<msg-id>.yaml     # Sent messages (for reference)
```

## Message Structure

```yaml
message_id: "mail-20260204-143052-abc123"
from: { github: "alice", character: "coda" }
to: { github: "bob", character: "shadow" }
subject: "A gift for you"
body: |
  Found this in the Rustlands...
sent_at: "2026-02-04T14:30:52Z"
read: false
attachments:
  gold: 50
  items:
    - id: "item-abc"
      qty: 1
escrow_ref: "multiplayer/trades/escrow/alice.yaml#mail-..."
status: "delivered"  # delivered|read|claimed|expired
```

## Attachment Rules

- Attachments use the same escrow system as trades
- Unclaimed attachments expire after 30 days
- Expired attachments return to sender's inventory
- Attachments transfer on explicit "claim" action

## Notifications

Check mail at session start:
- Count unread messages
- Highlight messages with attachments
- Flag expiring attachments (< 7 days)
