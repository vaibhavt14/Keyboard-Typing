#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

if [[ -n $(git status --porcelain) ]]; then
    echo "ERROR: Working tree is not clean."
    git status --short
    exit 1
fi

BRANCH=$(./scripts/get_branch_name.sh)

echo "Branch: $BRANCH"

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    echo "Branch already exists."

    git checkout "$BRANCH"

    echo "Current branch:"
    git branch --show-current
    exit 0
fi

DEFAULT_BRANCH=$(git remote show origin | grep "HEAD branch" | awk '{print $NF}')

if [ -z "$DEFAULT_BRANCH" ]; then
    echo "ERROR: Could not determine default branch."
    exit 1
fi

echo "Syncing with latest $DEFAULT_BRANCH..."

git fetch origin

git checkout "$DEFAULT_BRANCH"

git reset --hard "origin/$DEFAULT_BRANCH"

echo "Creating branch..."

git checkout -b "$BRANCH"

echo "Current branch:"
git branch --show-current