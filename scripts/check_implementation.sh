#!/bin/bash
set -e

echo "Checking implementation..."

TICKET=$(./scripts/get_next_ticket.sh)

if [ -z "$TICKET" ] || [ "$TICKET" = "NO_TICKET" ]; then
    echo "ERROR: No ticket is currently In Progress."
    exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo "ERROR: Still on protected branch."
    exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
    echo "ERROR: Uncommitted or untracked changes detected."
    echo "Claude may have forgotten to commit."
    git status --short
    exit 1
fi

LAST_COMMIT=$(git log -1 --pretty=%s)

if [[ "$LAST_COMMIT" != "$TICKET:"* ]]; then
    echo "ERROR: Latest commit does not belong to current ticket."
    echo "Latest commit: $LAST_COMMIT"
    exit 1
fi

echo "Latest commit:"
echo "$LAST_COMMIT"

echo "Implementation verification passed."