# Agent Quest Development Guide

This document helps Claude agents work effectively on Agent Quest. Agent Quest is a game where players (humans and agents) both play and build the game. The game is defined by the `play-agent-quest` skill.

## Share Your Work (Always Create PRs)

**Always create a Pull Request before the session ends.** The Tokes economy depends on PRs - contributions are reviewed, credited, and merged through this process. Uncommitted work is lost work that earns no Tokes.

```bash
# 1. Validate first
node scripts/validate-tokes.js

# 2. Create branch, commit, push, PR
git checkout -b descriptive-branch-name
git add <specific files>
git commit -m "Clear description of changes"
git push -u origin descriptive-branch-name
gh pr create --title "..." --body "..."
```

**Never push directly to main.** PRs enable peer review and proper Tokes attribution.

**CRITICAL: Credit goes to the PLAYER, not Claude.** When creating claims or commits:
- Use the player's GitHub username and weaver name from their ledger
- Check `tokes/ledgers/<github>.yaml` for their weaver name
- Example: If helping `matt-davison`, credit goes to weaver "Coda"

### 3. Claim Credit (Tokes)

Agent Quest uses a Tokes economy for contributions. **Credits always go to the PLAYER's character, not to Claude.**

**IMPORTANT: Identify the player first:**

1. Get GitHub username: `gh api user -q '.login'` or check git config
2. Find their ledger: `tokes/ledgers/<github>.yaml`
3. Get their weaver name from the ledger's `weaver:` field
4. Use THEIR github and weaver name in claims, not yours

**Example:** If working for user `matt-davison` whose character is `Coda`:

- Claim file: `coda-storytelling-system.yaml` (not `claude-...`)
- `weaver: "Coda"` (not `"Claude"`)
- `github: "matt-davison"` (not `"anthropic-claude"`)

**For small contributions (< 15 Tokes):**

- Add transaction directly to `tokes/ledgers/<github>.yaml`
- Create claim file in `tokes/claims/` mirroring world structure

**For large contributions (15+ Tokes):**

- Submit to `tokes/pending/` for peer review
- Use template from `tokes/pending/README.md`
- Name file: `<weaver>-<description>.yaml`

**Tokes values:**
| Content Type | Reward Range |
|-------------|--------------|
| Location | 15-25 |
| Quest | 20-30 |
| NPC | 10-20 |
| Item | 5-10 |
| Lore | 5-15 |
| Rules/System | 15-50+ |
| Bug fix | 5-10 |

### 4. Update Chronicles

For significant story events, add to `chronicles/volume-1.md`.

## Playing Agent Quest

When running the game, use the `play-agent-quest` skill. Key files:

- `SKILL.md` - Main game loop and loading strategy
- `quick-ref/` - Fast lookups during play
- `rules/` - Full rules when needed
- `templates/` - For creating content

### Campaign System

When players are in campaigns:

1. Load `campaign-progress.yaml` at session start
2. Check `consequences.yaml` for triggered delayed effects
3. Load `relationships.yaml` for NPC interactions
4. Present choices with alignment costs visible
5. Record significant decisions with campaign/chapter context

See `rules/narrative.md` and `quick-ref/storytelling.md`.

## File Organization

```
.claude/skills/play-agent-quest/  - Game rules, templates, references
campaigns/                         - Campaign content (acts, chapters)
players/<github>/                  - Player data and personas
quests/                           - Standalone quests
tokes/                            - Economy (ledgers, claims, pending)
world/                            - Locations, NPCs, items, lore
```

## Key Patterns

### Always Prefer

- Reading files before modifying
- Specific file paths over wildcards in git add
- Using templates for new content
- Linking new content to existing world elements

### Remember To

- **Create a PR before session ends** - no PR means no Tokes, lost work
- Update `balance` field when modifying Tokes ledgers
- Add chronicle entries for major events
- Check delayed consequences at session start
- Track relationship changes after NPC interactions
- Claim Tokes in the PR (credits go to PLAYER's character)
