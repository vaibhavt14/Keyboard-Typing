#!/bin/bash

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

if [[ -n $(git status --porcelain) ]]; then
    echo "ERROR: Working tree is not clean."
    git status --short
    exit 1
fi

echo "Working tree is clean."