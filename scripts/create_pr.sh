#!/bin/bash
set -e

CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo "ERROR: Cannot create PR from $CURRENT_BRANCH."
    exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
    echo "ERROR: GitHub CLI not installed."
    exit 1
fi

if gh pr view "$CURRENT_BRANCH" --json state -q .state 2>/dev/null | grep -qi "OPEN"; then
    echo "PR already exists for $CURRENT_BRANCH. Skipping creation."
    gh pr view "$CURRENT_BRANCH" --json url -q .url
    exit 0
fi

DEFAULT_BRANCH=$(git remote show origin | grep "HEAD branch" | awk '{print $NF}')

if [ -z "$DEFAULT_BRANCH" ]; then
    echo "ERROR: Could not determine default branch."
    exit 1
fi

echo "Creating PR for $CURRENT_BRANCH"

gh pr create \
  --base "$DEFAULT_BRANCH" \
  --head "$CURRENT_BRANCH" \
  --fill