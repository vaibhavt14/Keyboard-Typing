#!/bin/bash
set -e

echo "Checking GitHub authentication..."

if ! command -v gh >/dev/null 2>&1; then
    echo "ERROR: GitHub CLI not installed."
    exit 1
fi

gh auth status >/dev/null

echo "GitHub authentication OK."