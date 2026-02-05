# Agent Quest Development Guide

This document helps Claude agents work effectively on Agent Quest. Agent Quest is an AI agent-first text MMO-RPG where the repository IS the game world and skills implement the rules. The setting blends cyberpunk and high fantasy — neon-lit cities on ancient ruins, hackers who cast spells. Players are Weavers who both play and build the game.

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
- Check `worlds/<world>/tokes/ledgers/<github>.yaml` for their weaver name (default world: `alpha`)
- Example: If helping `matt-davison`, credit goes to weaver "Coda"

## Claim Credit (Tokes) After Merging

Agent Quest uses a Tokes economy for contributions. **Credits always go to the PLAYER's character, not to Claude.**

**IMPORTANT: Identify the player first:**

1. Get GitHub username: `gh api user -q '.login'` or check git config
2. Determine world (default: `alpha`, see `worlds.yaml`)
3. Find their ledger: `worlds/<world>/tokes/ledgers/<github>.yaml`
4. Get their weaver name from the ledger's `weaver:` field
5. Use THEIR github and weaver name in claims, not yours

**Example:** If working for user `matt-davison` whose character is `Coda`:

- Claim file: `coda-storytelling-system.yaml` (not `claude-...`)
- `weaver: "Coda"` (not `"Claude"`)
- `github: "matt-davison"` (not `"anthropic-claude"`)

**For small contributions (< 15 Tokes):**

- Add transaction directly to `worlds/<world>/tokes/ledgers/<github>.yaml`
- Create claim file in `worlds/<world>/tokes/claims/` mirroring world structure

**For large contributions (15+ Tokes):**

- Submit to `worlds/<world>/tokes/pending/` for peer review
- Use template from `worlds/<world>/tokes/pending/README.md`
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

## Update Chronicles

For significant story events, add to `worlds/<world>/chronicles/volume-1.md`.

## Playing Agent Quest

When running the game, use the `play-agent-quest` skill. See `.claude/skills/play-agent-quest/INDEX.md` for complete loading strategy and file organization.

## File Organization

| Path | Purpose |
|------|---------|
| `worlds.yaml` | Registry of all worlds (default: alpha) |
| `worlds/<world>/` | Per-world content (locations, npcs, items, players, etc.) |
| `.claude/agents/` | Claude Code agents for game mechanics |
| `.claude/skills/play-agent-quest/` | Game rules, templates, references |
| `scripts/` | Validation and utility scripts |

See `.claude/skills/play-agent-quest/INDEX.md` for complete file hierarchy.

## Agent Architecture

Game mechanics are handled by Claude Code agents in `.claude/agents/`. These are automatically invoked based on their descriptions - no manual delegation needed. See `.claude/agents/README.md` for the full list and patterns.

### Creating New Agents

When adding new game systems, create a corresponding agent:

1. Create `.claude/agents/<system-name>.md`
2. Add YAML frontmatter:
   ```yaml
   ---
   name: <system-name>
   description: <when Claude should use this agent>
   tools: Read, Glob, Grep, Bash
   model: haiku
   ---
   ```
3. Document input context, operations, output format
4. Update SKILL.md action table if it adds player actions

### Proactive Gap Identification

When playing or developing Agent Quest, actively look for:

- **Repeated manual mechanics** - If doing the same checks repeatedly, suggest an agent
- **Complex rule lookups** - If a system requires loading multiple files, consider an agent
- **State coordination** - If multiple files need atomic updates, use state-writer pattern
- **Consistency issues** - If game state could become inconsistent, add validation
- **Missing content hooks** - If actions should trigger world changes but don't

**Always suggest improvements** when you notice gaps in logic, consistency, or user experience. The goal is a coherent, growing universe.

## Key Patterns

### Always Prefer

- Reading files before modifying
- Specific file paths over wildcards in git add
- Using templates for new content
- Linking new content to existing world elements

### Remember To

- **Create a PR before session ends** - no PR means no Tokes, lost work
- **ALWAYS** persist new creations and updates
- Update `balance` field when modifying Tokes ledgers
- Add chronicle entries for major events
- Check delayed consequences at session start
- Track relationship changes after NPC interactions
- Claim Tokes in the PR (credits go to PLAYER's character)
