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

### `pre-commit`

Git pre-commit hook that validates:

- Players can only modify files in their own `players/<github>/` directory
- Players can only modify their own ledger `tokes/ledgers/<github>.yaml`
- Claims must have `github:` matching the committer

### `setup-hooks.sh`

Installs the git hooks and tests authentication.

## Bypassing Hooks (Not Recommended)

For emergencies only:

```bash
git commit --no-verify -m "message"
```

This should only be used by repository maintainers.
