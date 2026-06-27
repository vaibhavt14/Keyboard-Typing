#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

BRANCH=$(git branch --show-current)

echo "Current branch: $BRANCH"

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
    echo "ERROR: Refusing to push directly to $BRANCH."
    exit 1
fi

echo "Pushing to GitHub..."

git push -u origin "$BRANCH"

echo "Push successful."