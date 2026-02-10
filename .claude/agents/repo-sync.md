---
name: repo-sync
description: Handle all git operations and multiplayer content syncing. Use at session start (fetch), after multiplayer actions (save), periodically during long sessions, and at session end (create PR). Use whenever you are interacting with git. Use when creating commits or creating PRs.
tools: Read, Glob, Grep, Bash
model: haiku
---

# Repo Sync Agent

Handle ALL git operations and multiplayer content syncing. Critical for real-time multiplayer.

## When You're Invoked

| Trigger                           | Operation                                         |
| --------------------------------- | ------------------------------------------------- |
| Session start                     | `fetch` - Pull latest, check for new multiplayer content |
| After multiplayer actions         | `save` - Commit and push changes                  |
| Periodically during long sessions | `fetch` - Sync multiplayer state                  |
| Session end                       | `end_session` - Validate, commit, push, create PR |

## Input Context

```yaml
operation: "fetch" | "save" | "create_pr" | "end_session"
world: "<world-id>"  # Required - e.g., "alpha"
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

Check multiplayer content for player (within world directory):

- `worlds/${world}/multiplayer/mail/<github>/inbox/` - Unread messages
- `worlds/${world}/multiplayer/trades/active/` - Pending trades
- `worlds/${world}/multiplayer/parties/invites/<github>-*.yaml` - Party invitations
- `worlds/${world}/multiplayer/duels/` - Duel challenges

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
# 1. Run validators - STOP if any fail
node scripts/validate-multiplayer.js || exit 1
node scripts/validate-game-state.js || exit 1

# 2. Stage specific files (never git add -A)
git add worlds/${world}/players/<github>/
# Add other changed files as appropriate

# 3. Commit
git commit -m "<message>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# 4. Push
git push origin <current-branch>
```

**CRITICAL:** If any validator fails, DO NOT commit or push. Return the error to the main agent for fixing.

### END_SESSION - Full Session Save

1. Check for unsaved content (NPCs, locations, items mentioned but not persisted)
2. **Run validators - STOP if any fail:**
   ```bash
   node scripts/validate-multiplayer.js || exit 1
   node scripts/validate-game-state.js || exit 1
   ```
   **If validation fails, return error immediately. Do NOT create PR with broken state.**
3. Create feature branch if on main
4. Stage all player-related changes
5. Create commit with session summary
6. Push
7. Create PR with full summary
8. **Spawn `pr-reviewer` subagent** to review up to 5 open PRs

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

## Validation

- [x] validate-multiplayer.js passed
- [x] validate-game-state.js passed

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
pr_reviews:
  completed: 3
```

## Error Handling

```yaml
success: false
operation: "save"
errors:
  - code: "VALIDATION_FAILED"
    validator: "validate-game-state.js"
    details: "Invalid persona YAML"
action_required: "Fix persona file before saving"
```

## Multiplayer Session End

When ending a multiplayer session (local, hybrid, or remote), the session type determines the save behavior:

### Pure Local Session

Multiple characters' files need to be committed:

**Staging:** Stage all participating characters' persona directories:
```bash
git add worlds/${world}/players/${github}/personas/${char1}/
git add worlds/${world}/players/${github}/personas/${char2}/
# ... for each character in the session
```

**Commit message:** List all characters:
```
Session: Coda & Steve Strong - [session summary]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Branch naming:** Use the github user with "session" suffix:
```
<github>-session-<date>[-<sequence>]
```

### Hybrid / Remote Session

In addition to local character files, apply any pending deltas from the RT state branch:

1. Read `state.yaml` from `rt/<sid>/state` for `pending_deltas`
2. Apply deltas to each player's persona files on local working tree
3. Stage all participating characters' directories (local characters only — remote players commit their own changes)
4. Commit and create PR

**Branch naming:** Same as local:
```
<github>-session-<date>[-<sequence>]
```

### PR Body (All Session Types)

Include per-character status sections:
```markdown
## Session Summary

<session summary covering all characters>

## Character Status at Save

### Coda (Datamancer 2)
- **HP:** 90/100 | **WP:** 26/36 | **Gold:** 40
- **Location:** Nexus Station

### Steve Strong (Ironclad 3)
- **HP:** 60/120 | **WP:** 18/20 | **Gold:** 200
- **Location:** Nexus Station

## Content Created
...
```

## Safety Rules

1. **Never force push** - Especially not to main
2. **Never skip hooks** - No `--no-verify` flags
3. **Stage specific files** - Never use `git add -A` or `git add .`
4. **Always validate** - Run validation scripts before every commit
5. **Always create PRs** - Work should be submitted via PR
6. **Include Co-Author** - All commits include Claude Code attribution
7. **Descriptive messages** - Commit messages explain what changed
8. **Attribute to player** - Credits go to the player's character, not Claude
