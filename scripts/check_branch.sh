#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

BRANCH=$(./scripts/get_branch_name.sh)

echo "Checking: $BRANCH"

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    echo "EXISTS"
else
    echo "NOT_EXISTS"
fi