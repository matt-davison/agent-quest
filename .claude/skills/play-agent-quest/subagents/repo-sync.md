# Repo Sync Subagent

**Responsibility:** Handle ALL git operations and multiplayer content syncing. Critical for the Tokes economy (PRs = credit) and real-time multiplayer.

## When to Invoke

| Trigger | Operation |
|---------|-----------|
| Session start | `fetch` - Pull latest, check for new multiplayer content |
| After multiplayer actions | `save` - Commit and push changes |
| Periodically during long sessions | `fetch` - Sync multiplayer state |
| Session end | `end_session` - Validate, commit, push, create PR |
| Major milestone | `create_pr` - Create PR for significant progress |

## Input Context

```yaml
operation: "fetch" | "save" | "create_pr" | "end_session"
player:
  github: "<github-username>"
  character: "<character-name>"
  weaver: "<weaver-name>"  # From ledger
# For save/create_pr/end_session:
message: "<commit-message>"
session_summary: "<what-happened-this-session>"
```

## Operations

### FETCH - Sync from Remote

Pull latest changes and check for new multiplayer content.

```bash
# 1. Pull latest from remote
git pull origin main --rebase

# 2. Check for merge conflicts
if [ $? -ne 0 ]; then
  # Handle conflicts - typically abort and warn
  git rebase --abort
  return conflict_warning
fi
```

**Check multiplayer content for player:**

```yaml
# Scan these paths for content involving player
multiplayer_checks:
  - path: "multiplayer/mail/<github>/inbox/"
    type: "mail"
    description: "Unread messages"
  - path: "multiplayer/trades/active/"
    type: "trade"
    filter: "involves_player"
    description: "Pending trades"
  - path: "multiplayer/parties/invites/<github>-*.yaml"
    type: "party_invite"
    description: "Party invitations"
  - path: "multiplayer/duels/"
    type: "duel"
    filter: "involves_player"
    description: "Duel challenges"
  - path: "multiplayer/parties/active/"
    type: "party_update"
    filter: "player_is_member"
    description: "Party activity"
```

**Fetch Response:**

```yaml
success: true
operation: "fetch"
remote_status: "up_to_date" | "updated" | "conflict"
new_content:
  mail:
    count: 2
    from:
      - "shadowmancer42"
      - "guild-announcements"
  trades:
    count: 1
    details:
      - trade_id: "trade-20260204-001"
        from: "merchantking"
        offering: "Enchanted Dagger"
  party_invites:
    count: 0
  duels:
    count: 1
    details:
      - duel_id: "duel-20260204-001"
        challenger: "bladedancer"
        type: "friendly"
narrative_hooks:
  - "Your inbox glows with 2 new messages"
  - "A trade offer awaits your review"
  - "A duel challenge has been issued"
```

### SAVE - Commit and Push Changes

Stage, validate, commit, and push current changes.

```bash
# 1. Run validation scripts
node scripts/validate-tokes.js
if [ $? -ne 0 ]; then
  return validation_error
fi

node scripts/validate-multiplayer.js
if [ $? -ne 0 ]; then
  return validation_error
fi

# 2. Stage specific files (never git add -A)
git add players/<github>/
git add multiplayer/trades/escrow/<github>.yaml
git add multiplayer/mail/<github>/
git add tokes/ledgers/<github>.yaml
git add tokes/claims/  # If claims created
git add world/state/presence.yaml
# Add other changed files as appropriate

# 3. Commit with descriptive message
git commit -m "<message>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 4. Push to remote
git push origin <current-branch>
```

**Save Response:**

```yaml
success: true
operation: "save"
validation:
  tokes: "passed"
  multiplayer: "passed"
commit:
  sha: "abc123..."
  message: "<commit-message>"
  files_changed: 4
pushed: true
branch: "main"  # or feature branch
```

### CREATE_PR - Create Pull Request

Create a PR for significant work, typically from a feature branch.

```bash
# 1. Ensure on feature branch
current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ]; then
  # Create feature branch
  branch_name="<github>-<character>-$(date +%Y%m%d)"
  git checkout -b "$branch_name"
  git push -u origin "$branch_name"
fi

# 2. Run all validations
node scripts/validate-tokes.js
node scripts/validate-multiplayer.js

# 3. Commit any uncommitted changes
git add <appropriate-files>
git commit -m "<message>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 4. Push
git push origin "$branch_name"

# 5. Create PR
gh pr create \
  --title "<pr-title>" \
  --body "## Summary
<session_summary>

## Changes
- Player: <character> (<github>)
- Session events: ...
- Tokes earned/spent: ...

## Validation
- [x] validate-tokes.js passed
- [x] validate-multiplayer.js passed

---
Generated with [Claude Code](https://claude.com/claude-code)"
```

**Create PR Response:**

```yaml
success: true
operation: "create_pr"
branch: "matt-davison-coda-20260204"
pr:
  number: 42
  url: "https://github.com/owner/agent-quest/pull/42"
  title: "Coda: Ghost Run quest progress"
narrative_hooks:
  - "Your progress has been preserved in the Weave"
  - "PR #42 awaits validation"
```

### END_SESSION - Full Session Save

Complete session wrap-up: validate, commit, push, and create PR.

```bash
# 1. Check for any unsaved content
# - NPCs mentioned but not in world/npcs/profiles/
# - Locations visited but not in world/locations/
# - Items created but not in world/items/

# 2. Run all validations
node scripts/validate-tokes.js
node scripts/validate-multiplayer.js

# 3. Create feature branch if on main
current_branch=$(git branch --show-current)
if [ "$current_branch" = "main" ]; then
  branch_name="<github>-<character>-$(date +%Y%m%d-%H%M)"
  git checkout -b "$branch_name"
fi

# 4. Stage all player-related changes
git add players/<github>/
git add tokes/ledgers/<github>.yaml
git add tokes/claims/
git add tokes/pending/  # If reviews submitted
git add multiplayer/
git add world/  # If new content created
git add chronicles/  # If chronicle entries added

# 5. Create commit with session summary
git commit -m "Session: <character> - <brief-summary>

<session_summary>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 6. Push
git push -u origin "$branch_name"

# 7. Create PR with full summary
gh pr create \
  --title "<character>: <session-title>" \
  --body "## Session Summary
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
Generated with [Claude Code](https://claude.com/claude-code)"
```

**End Session Response:**

```yaml
success: true
operation: "end_session"
validation:
  tokes: "passed"
  multiplayer: "passed"
  new_content_saved: true
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
  active_quests: 2
narrative_hooks:
  - "Your adventures have been woven into the permanent record"
  - "The Weave preserves your deeds in PR #43"
  - "Until next time, Weaver..."
```

## Error Handling

### Validation Failure

```yaml
success: false
operation: "save"
errors:
  - code: "VALIDATION_FAILED"
    validator: "validate-tokes.js"
    details: "Balance mismatch in ledger"
action_required: "Fix ledger balance before saving"
```

### Merge Conflict

```yaml
success: false
operation: "fetch"
errors:
  - code: "MERGE_CONFLICT"
    files:
      - "multiplayer/trades/active/trade-001.yaml"
    details: "Another player modified this file"
action_required: "Manual conflict resolution needed"
```

### Push Failure

```yaml
success: false
operation: "save"
errors:
  - code: "PUSH_FAILED"
    details: "Remote has newer changes"
action_required: "Fetch and merge before pushing"
```

## Safety Rules

1. **Never force push** - Especially not to main
2. **Never skip hooks** - No `--no-verify` flags
3. **Stage specific files** - Never use `git add -A` or `git add .`
4. **Always validate** - Run validation scripts before every commit
5. **Always create PRs** - Work should be submitted via PR, not direct push to main
6. **Include Co-Author** - All commits include Claude Code attribution
7. **Descriptive messages** - Commit messages explain what changed and why

## Git Safety Checklist

Before any git operation:

- [ ] Not on main branch for new work? Create feature branch
- [ ] Validation scripts pass?
- [ ] Only staging player-owned files?
- [ ] Commit message is descriptive?
- [ ] PR template followed?

## Branch Naming Convention

```
<github>-<character>-<date>[-<sequence>]

Examples:
- matt-davison-coda-20260204
- matt-davison-coda-20260204-1530
- shadowuser-nightblade-20260204-quest-completion
```
