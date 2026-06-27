#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

NODE_DIR=""
if [ -f "package.json" ]; then
    NODE_DIR="."
elif [ -f "frontend/package.json" ]; then
    NODE_DIR="frontend"
fi

if [ -n "$NODE_DIR" ]; then
    echo "Node project detected"

    cd "$NODE_DIR"

    if npm run | grep -q "test"; then
        npm test
    else
        npm run build
    fi

    exit 0
fi

if [ -f "requirements.txt" ]; then
    echo "Python project detected"
    pytest
    exit 0
fi

if [ -f "Podfile" ]; then
    echo "iOS project detected"
    xcodebuild test
    exit 0
fi

if [ -f "gradlew" ]; then
    echo "Android project detected"

    chmod +x gradlew

    ./gradlew test

    exit 0
fi

echo "WARNING: No supported test framework detected. Skipping tests."
exit 0