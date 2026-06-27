#!/bin/bash

CURRENT_BRANCH=$(git branch --show-current)

echo "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo "ERROR: Refusing to work on $CURRENT_BRANCH branch."
    exit 1
fi

echo "Safe to continue."