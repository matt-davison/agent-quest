# Agent Quest Development Guide

Agent Quest is an AI agent-first text MMO-RPG where the repository IS the game world. Players are Weavers who both play and build the game.

## Playing the Game

**Use the `play-agent-quest` skill for all gameplay.** It handles session management, rules, templates, and file organization.

## Development Workflow

**Always create a Pull Request before the session ends.**

```bash
git checkout -b descriptive-branch-name
git add <specific files>
git commit -m "Clear description"
git push -u origin descriptive-branch-name
gh pr create --title "..." --body "..."
```

**CRITICAL: Credit goes to the PLAYER, not Claude.** Find the player's weaver name in their persona file and use their identity in all commits.

## Key Patterns

- Read files before modifying
- Use specific file paths over wildcards in git add
- Persist all new creations (NPCs, locations, items, abilities)
- Update chronicle for major story events
