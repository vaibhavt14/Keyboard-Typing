#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

TICKET=$(./scripts/get_next_ticket.sh)

if [ -z "$TICKET" ]; then
    echo "ERROR: Could not determine current ticket."
    exit 1
fi

if [ "$TICKET" = "NO_TICKET" ]; then
    echo "ERROR: No ticket is currently In Progress."
    exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)

echo "Ticket: $TICKET"
echo "Current Branch: $CURRENT_BRANCH"

if [[ "$CURRENT_BRANCH" == *"$TICKET"* ]]; then
    echo "Ticket and branch match."
else
    echo "ERROR: Branch does not match ticket."
    exit 1
fi