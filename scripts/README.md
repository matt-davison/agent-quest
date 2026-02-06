# Agent Quest Scripts

Scripts for managing the Agent Quest repository.

## Setup

After cloning the repository, run:

```bash
./scripts/setup-hooks.sh
```

This will:

1. Install the pre-commit hook
2. Test your GitHub authentication
3. Show your player directory path

## GitHub Authentication

The pre-commit hook requires GitHub authentication to verify your identity. Configure one of these methods:

### Option 1: GitHub CLI (Recommended)

```bash
# Install gh CLI (https://cli.github.com/)
brew install gh  # macOS
# or see https://github.com/cli/cli#installation

# Authenticate
gh auth login
```

### Option 2: Personal Access Token

```bash
# Create a token at https://github.com/settings/tokens
# Then set the environment variable:
export GITHUB_TOKEN="your_token_here"

# Add to your shell profile for persistence:
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
```

## Scripts

### `sync-multiplayer.sh`

Safely syncs multiplayer updates from the main branch. You do not need to ever run this. This script:

- Stashes any uncommitted changes
- Fetches the latest changes from origin/main
- Merges updates into your current branch
- Restores your stashed changes

**Usage:**

```bash
./scripts/sync-multiplayer.sh
```

This enables asynchronous multiplayer by incorporating other players' changes while preserving your local work.

### `sync-multiplayer.js`

Node.js wrapper for multiplayer syncing with additional utilities.

**Usage:**

```bash
# Full sync
node scripts/sync-multiplayer.js

# Check for updates without merging
node scripts/sync-multiplayer.js --dry-run

# Silent mode (for programmatic use)
node scripts/sync-multiplayer.js --silent

# Check only
node scripts/sync-multiplayer.js --check
```

**Programmatic usage:**

```javascript
const {
  syncMultiplayer,
  checkForUpdates,
  getRecentActivity,
} = require("./scripts/sync-multiplayer");

// Check for updates
const status = await checkForUpdates();
// { success: true, behind: 3, message: "Behind origin/main by 3 commit(s)" }

// Sync updates
const result = syncMultiplayer();
// { success: true, message: "Multiplayer sync completed successfully" }

// Get recent activity
const activity = getRecentActivity(5);
// [{ hash, author, date, message }, ...]
```

### `pre-commit`

Git pre-commit hook that validates:

- Players can only modify files in their own `players/<github>/` directory
- Claims must have `github:` matching the committer

### `setup-hooks.sh`

Installs the git hooks and tests authentication.

## Bypassing Hooks (Not Recommended)

For emergencies only:

```bash
git commit --no-verify -m "message"
```

This should only be used by repository maintainers.
