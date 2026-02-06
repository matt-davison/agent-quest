# Friends System

The friends system enables persistent social connections between players.

## Storage

Friends data is stored in **`players/<github>/friends.yaml`** at the repository root (world-agnostic). This directory exists for world-specific friends documentation and future expansion.

## Commands

| Command | Action |
|---------|--------|
| FRIEND ADD @player | Send friend request (auto-accept if mutual pending) |
| FRIEND ACCEPT @player | Accept pending request |
| FRIEND REJECT @player | Reject pending request |
| FRIEND REMOVE @player | Remove from friends list |
| FRIEND BLOCK @player | Block player (auto-removes, rejects all requests) |
| FRIEND UNBLOCK @player | Unblock player |
| FRIENDS | Show friends list with activity status |

## Rules

- **Mutual relationship**: Both players' `friends.yaml` files are updated on add/remove
- **Request expiry**: Friend requests expire after 7 days
- **Auto-accept**: If both players have pending requests to each other, auto-accept
- **Block enforcement**: Blocked players cannot send friend requests, trade offers, mail, or duel challenges
- **Blocking auto-removes**: Blocking a friend removes the friendship from both sides
- **Self-protection**: Cannot friend yourself
- **Limit**: Max 50 friends per player

## Activity Status

The FRIENDS command shows each friend's activity status using the existing presence system:

| Status | Condition |
|--------|-----------|
| Active | Recent action (< 30 min) |
| Idle | No action for 30 minutes |
| Away | No action for 2 hours |
| Offline | No action for 8+ hours |

Active and idle friends also show their current location.

## Integration with Block List

The block list is checked during:
- **FRIEND ADD**: Cannot send request to someone who blocked you
- **TRADE**: Cannot create trade offer with blocked player
- **MAIL**: Cannot send mail to blocked player
- **DUEL**: Cannot challenge blocked player
