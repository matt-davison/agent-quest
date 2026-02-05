#!/bin/bash
# Get the GitHub username of the current user
# Used by pre-commit hook to validate file ownership

# Try gh CLI first (most reliable)
if command -v gh &> /dev/null; then
    USER=$(gh api user -q '.login' 2>/dev/null)
    if [ -n "$USER" ]; then
        echo "$USER"
        exit 0
    fi
fi

# Try GITHUB_ACTOR (set in GitHub Actions)
if [ -n "$GITHUB_ACTOR" ]; then
    echo "$GITHUB_ACTOR"
    exit 0
fi

# Try git config user.email and extract username pattern
# This is a fallback - not as reliable
GIT_EMAIL=$(git config user.email 2>/dev/null)
if [[ "$GIT_EMAIL" =~ ^([^@]+)@users\.noreply\.github\.com$ ]]; then
    echo "${BASH_REMATCH[1]}"
    exit 0
fi

# Try GITHUB_TOKEN with API
if [ -n "$GITHUB_TOKEN" ]; then
    USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/user 2>/dev/null | \
        grep '"login"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
    if [ -n "$USER" ]; then
        echo "$USER"
        exit 0
    fi
fi

# Could not determine user
exit 1
