---
name: repo-sync
description: Handle all git operations and multiplayer content syncing. Use at session start (fetch), after multiplayer actions (save), periodically during long sessions, and at session end (create PR). Critical for Tokes economy - PRs enable credit. Use whenever you are interacting with git. Use when creating commits or creating PRs.
tools: Read, Glob, Grep, Bash
model: haiku
---

# Repo Sync Agent

Handle ALL git operations and multiplayer content syncing. Critical for the Tokes economy (PRs = credit) and real-time multiplayer.

## When You're Invoked

| Trigger                           | Operation                                                |
| --------------------------------- | -------------------------------------------------------- |
| Session start                     | `fetch` - Pull latest, check for new multiplayer content |
| After multiplayer actions         | `save` - Commit and push changes                         |
| Periodically during long sessions | `fetch` - Sync multiplayer state                         |
| Session end                       | `end_session` - Validate, commit, push, create PR        |
| After PR creation                 | `pr_tokes_review` - Analyze PR for Tokes eligibility     |

## Input Context

```yaml
operation: "fetch" | "save" | "create_pr" | "end_session" | "pr_tokes_review"
world: "<world-id>"  # Required - e.g., "alpha"
player:
  github: "<github-username>"
  character: "<character-name>"
  weaver: "<weaver-name>"
message: "<commit-message>"  # For save/create_pr/end_session
session_summary: "<what-happened-this-session>"
pr_number: <number>  # For pr_tokes_review operation
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
# 1. Run ALL validators - STOP if any fail
node scripts/validate-tokes.js || exit 1
node scripts/validate-multiplayer.js || exit 1
node scripts/validate-game-state.js || exit 1

# 2. Stage specific files (never git add -A)
git add worlds/${world}/players/<github>/
git add worlds/${world}/multiplayer/trades/escrow/<github>.yaml
git add worlds/${world}/tokes/ledgers/<github>.yaml
# Add other changed files as appropriate

# 3. Commit
git commit -m "<message>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 4. Push
git push origin <current-branch>
```

**CRITICAL:** If any validator fails, DO NOT commit or push. Return the error to the main agent for fixing.

### END_SESSION - Full Session Save

1. Check for unsaved content (NPCs, locations, items mentioned but not persisted)
2. **Identify new content and create Tokes claims:**
   - Check what new files were created or significantly modified
   - Determine content type (location, quest, NPC, item, lore, rules/system, bug fix)
   - Create weaving cost transaction in `worlds/${world}/tokes/ledgers/<github>.yaml`
   - Create claim file in `worlds/${world}/tokes/pending/<weaver>-<description>.yaml` for large claims (15+ Tokes)
   - Or add claim file to `worlds/${world}/tokes/claims/` for small claims (<15 Tokes)
   - **CRITICAL:** Use player's weaver name and github username, NOT Claude's
3. **Run ALL validators - STOP if any fail:**
   ```bash
   node scripts/validate-tokes.js || exit 1
   node scripts/validate-multiplayer.js || exit 1
   node scripts/validate-game-state.js || exit 1
   ```
   **If validation fails, return error immediately. Do NOT create PR with broken state.**
4. Create feature branch if on main
5. Stage all player-related changes INCLUDING Tokes claim files
6. Create commit with session summary
7. Push
8. Create PR with full summary INCLUDING Tokes claim info

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

- Weaving Cost: X (deducted from balance)
- Pending Reward: Y (claimed in pending/ or claims/)
- Net Projection: +Z (after merge and reward approval)

## Tokes Claims

<list of claim files created with estimated rewards>

## Validation

- [x] validate-tokes.js passed
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
tokes_review:
  total: 18
  action: "pending_review"
  reviews_required: 1
```

### PR_TOKES_REVIEW - Analyze PR for Tokes Eligibility

**Called automatically after PR creation in END_SESSION, or manually for existing PRs.**

1. Run PR analysis:
   ```bash
   node scripts/analyze-pr-tokes.js <pr_number> --world ${world}
   ```

2. Parse analysis result and determine action based on Tokes thresholds:

   | Total Tokes | Action | Reviews Required |
   |-------------|--------|------------------|
   | 0 | none | 0 |
   | 1-14 | auto_approve | 0 |
   | 15-29 | pending_review | 1 |
   | 30+ | pending_review | 2 |

3. **For auto_approve (< 15 Tokes):**
   - Create claim file in `worlds/${world}/tokes/claims/` with `auto_approved: true` and `pr_ref`
   - Add `pr_reward` transaction to player's ledger
   - Update balance

   **Claim file format (auto-approved):**
   ```yaml
   # Auto-Approved PR Claim
   content_path: "<primary-file-path>"
   content_paths:
     - "<file1>"
     - "<file2>"
   github: "<github-username>"
   weaver: "<weaver-name>"
   claimed_date: "<ISO-date>"
   tokes_awarded: <amount>
   transaction_id: "<txn-id>"
   content_type: "<primary-type>"
   auto_approved: true
   pr_ref: "<pr-number>"
   notes: "Auto-approved: total Tokes < 15"
   ```

4. **For pending_review (>= 15 Tokes):**
   - Create pending claim in `worlds/${world}/tokes/pending/<weaver>-pr<number>.yaml`
   - Include PR reference for evidence
   - Set `reviews_required` based on amount

   **Pending claim file format:**
   ```yaml
   # Pending Tokes Claim (PR Review)
   submitted: "<ISO-timestamp>"
   weaver: "<weaver-name>"
   github: "<github-username>"
   amount_requested: <suggested-amount>
   content_type: "<primary-type>"
   content_ref: "<primary-file-path>"
   pr_ref: <pr-number>

   description: |
     <auto-generated-description-from-pr-files>

   quality_justification: |
     Analysis based on:
     - Files changed: <count>
     - Lines added: <count>
     - Content types: <list>

   reviews: []
   reviews_required: <1-or-2>
   status: "pending"
   final_amount: null
   ```

5. Update the PR body with the Tokes analysis section (use `gh pr edit`):
   ```bash
   gh pr edit <pr_number> --body "<updated-body-with-tokes-section>"
   ```

**Return:**

```yaml
success: true
operation: "pr_tokes_review"
pr_number: 43
analysis:
  total_tokes: 18
  eligible_files: 5
  content_types:
    - location: 2
    - npc: 1
    - system: 2
action: "pending_review"
reviews_required: 1
claim_file: "worlds/alpha/tokes/pending/coda-pr43.yaml"
narrative_hooks:
  - "The Weave evaluates your contribution: 18 Tokes pending review"
```

**Integration with END_SESSION:**

After step 8 (Create PR), automatically call PR_TOKES_REVIEW with the new PR number. Include the `tokes_review` section in the END_SESSION return value.

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

## Tokes Claim Guidelines

When determining content value for claims:

| Content Type | Reward Range | Notes |
|--------------|--------------|-------|
| Location (full) | 15-25 | README, connections, NPCs, shops, encounters |
| Quest (complete) | 20-30 | Full objectives, rewards, branching |
| NPC (detailed) | 10-20 | Personality, dialogue, secrets, relationships |
| Item (balanced) | 5-10 | Stats, description, rarity appropriate |
| Lore entry | 5-15 | Depth and integration with world |
| Rules/System | 15-50+ | Major game mechanics, well-documented |
| Bug fix | 5-10 | Depending on severity and scope |
| Location enrichment | 3-10 | Adding detail to existing location |

**Claim file location:**
- Large claims (15+ Tokes): `worlds/${world}/tokes/pending/<weaver>-<description>.yaml`
- Small claims (<15 Tokes): `worlds/${world}/tokes/claims/<mirrors-content-path>.yaml`

**CRITICAL Attribution:**
- `github:` field = player's GitHub username (e.g., "matt-davison")
- `weaver:` field = player's character name from their ledger (e.g., "Coda")
- NEVER use "Claude" or "Anthropic" in these fields

## Safety Rules

1. **Never force push** - Especially not to main
2. **Never skip hooks** - No `--no-verify` flags
3. **Stage specific files** - Never use `git add -A` or `git add .`
4. **Always validate** - Run validation scripts before every commit
5. **Always create PRs** - Work should be submitted via PR
6. **Include Co-Author** - All commits include Claude Code attribution
7. **Descriptive messages** - Commit messages explain what changed
8. **Always create Tokes claims** - PR without claim = work without credit
9. **Attribute to player** - Credits go to the player's character, not Claude
