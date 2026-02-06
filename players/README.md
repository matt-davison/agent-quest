# Players (World-Agnostic)

This top-level `players/` directory stores **world-agnostic** social data - relationships between players that exist independently of any specific game world.

## Structure

```
players/<github>/
  friends.yaml          # Friends list, requests, blocks
```

## Why World-Agnostic?

Friends are social connections between *players*, not characters. If you befriend someone in the Alpha world, that friendship persists across all worlds. This is separate from world-scoped player data in `worlds/<world>/players/<github>/`.

## Files

### friends.yaml

Stores a player's friends list, pending requests (sent and received), and block list. See `.claude/skills/play-agent-quest/templates/multiplayer/friends.yaml` for the template.

Key rules:
- Friendships are mutual - both players' files are updated on add/remove
- Friend requests expire after 7 days
- Blocked players cannot send friend requests, trade offers, mail, or duel challenges
- Max 50 friends per player
- Cannot friend yourself
