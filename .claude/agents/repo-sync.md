---
name: repo-sync
description: Handle all git operations and multiplayer content syncing. Use at session start (fetch), after multiplayer actions (save), periodically during long sessions, and at session end (create PR). Critical for Tokes economy - PRs enable credit.
tools: Read, Glob, Grep, Bash
model: haiku
---

# Repo Sync Agent

Handle ALL git operations and multiplayer content syncing. Critical for the Tokes economy (PRs = credit) and real-time multiplayer.

## When You're Invoked

| Trigger | Operation |
|---------|-----------|
| Session start | `fetch` - Pull latest, check for new multiplayer content |
| After multiplayer actions | `save` - Commit and push changes |
| Periodically during long sessions | `fetch` - Sync multiplayer state |
| Session end | `end_session` - Validate, commit, push, create PR |

## Input Context

```yaml
operation: "fetch" | "save" | "create_pr" | "end_session"
player:
  github: "<github-username>"
  character: "<character-name>"
  weaver: "<weaver-name>"
message: "<commit-message>"  # For save/create_pr/end_session
session_summary: "<what-happened-this-session>"
```

## Operations

### FETCH - Sync from Remote

```bash
git pull origin main --rebase
```

Check multiplayer content for player:
- `multiplayer/mail/<github>/inbox/` - Unread messages
- `multiplayer/trades/active/` - Pending trades
- `multiplayer/parties/invites/<github>-*.yaml` - Party invitations
- `multiplayer/duels/` - Duel challenges

**Return:**

```yaml
success: true
operation: "fetch"
remote_status: "up_to_date" | "updated" | "conflict"
new_content:
  mail:
    count: 2
    from: ["shadowmancer42", "guild-announcements"]
  trades:
    count: 1
  party_invites:
    count: 0
  duels:
    count: 1
narrative_hooks:
  - "Your inbox glows with 2 new messages"
  - "A trade offer awaits your review"
```

### SAVE - Commit and Push Changes

```bash
# 1. Run validation
node scripts/validate-tokes.js
node scripts/validate-multiplayer.js

# 2. Stage specific files (never git add -A)
git add players/<github>/
git add multiplayer/trades/escrow/<github>.yaml
git add tokes/ledgers/<github>.yaml
# Add other changed files as appropriate

# 3. Commit
git commit -m "<message>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 4. Push
git push origin <current-branch>
```

### END_SESSION - Full Session Save

1. Check for unsaved content (NPCs, locations, items mentioned but not persisted)
2. Run all validations
3. Create feature branch if on main
4. Stage all player-related changes
5. Create commit with session summary
6. Push
7. Create PR with full summary

**Branch naming:**
```
<github>-<character>-<date>[-<sequence>]
```

**PR body template:**
```markdown
## Session Summary
<detailed_session_summary>

## Character Status at Save
- **HP:** X/Y
- **Gold:** Z
- **Location:** <location>
- **Active Quests:** <count>

## Content Created
<list of any new NPCs, locations, items>

## Tokes Changes
- Earned: X
- Spent: Y
- Net: Z

## Validation
- [x] validate-tokes.js passed
- [x] validate-multiplayer.js passed

---
Generated with [Claude Code](https://claude.com/claude-code)
```

**Return:**

```yaml
success: true
operation: "end_session"
branch: "matt-davison-coda-20260204-1530"
commit:
  sha: "def456..."
  message: "Session: Coda - Completed warehouse infiltration"
pr:
  number: 43
  url: "https://github.com/owner/agent-quest/pull/43"
  title: "Coda: Warehouse infiltration complete"
character_status:
  hp: 35
  max_hp: 50
  gold: 150
  location: "nexus-undercity"
narrative_hooks:
  - "Your adventures have been woven into the permanent record"
  - "The Weave preserves your deeds in PR #43"
```

## Error Handling

```yaml
success: false
operation: "save"
errors:
  - code: "VALIDATION_FAILED"
    validator: "validate-tokes.js"
    details: "Balance mismatch in ledger"
action_required: "Fix ledger balance before saving"
```

## Safety Rules

1. **Never force push** - Especially not to main
2. **Never skip hooks** - No `--no-verify` flags
3. **Stage specific files** - Never use `git add -A` or `git add .`
4. **Always validate** - Run validation scripts before every commit
5. **Always create PRs** - Work should be submitted via PR
6. **Include Co-Author** - All commits include Claude Code attribution
7. **Descriptive messages** - Commit messages explain what changed
