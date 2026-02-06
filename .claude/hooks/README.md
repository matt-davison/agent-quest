# Agent Quest Hooks

This directory contains Claude Code hooks that enhance the multiplayer experience.

## Configured Hooks

### UserPromptSubmit: sync-multiplayer.sh

**Purpose**: Automatically sync multiplayer updates before each user prompt to enable asynchronous multiplayer gameplay.

**What it does**:
1. Fetches latest changes from `origin/main`
2. Checks if the current branch is behind
3. If behind, safely merges updates using the sync-multiplayer script
4. Displays a notification to Claude about synced updates

**Configuration**: Defined in `.claude/settings.json`:
```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/sync-multiplayer.sh"
          }
        ]
      }
    ]
  }
}
```

**Why this matters**:
Agent Quest is designed for asynchronous multiplayer. Players can send trade offers, party invites, mail, and more while you're playing. This hook ensures you see those updates automatically without manually pulling from git.

## Disabling Hooks

If you need to temporarily disable the sync hook:

1. Comment out the hook in `.claude/settings.json`
2. Or run Claude Code with `--no-hooks` flag (if available)
3. Or delete this hooks directory

## Manual Sync

You can still manually sync at any time:

```bash
# Safe sync with stashing
./scripts/sync-multiplayer.sh

# Check for updates only
node scripts/sync-multiplayer.js --check
```

## Hook Safety

The sync hook is designed to be safe:
- Uses git stash to preserve uncommitted changes
- Only merges if behind (no unnecessary operations)
- Falls back gracefully if sync script unavailable
- Always returns exit 0 to allow prompts to proceed
- Errors are suppressed to avoid blocking gameplay

## Troubleshooting

If the hook causes issues:

1. Check hook execution: Run `/hooks` in Claude Code
2. Test manually: `bash .claude/hooks/sync-multiplayer.sh`
3. Check git status: `git status` and resolve any conflicts
4. Disable temporarily by editing `.claude/settings.json`

## Learn More

- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks.md)
- [Multiplayer Quick Reference](../skills/play-agent-quest/quick-ref/multiplayer.md)
- [Sync Script Documentation](../../scripts/README.md)
