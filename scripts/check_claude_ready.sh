#!/bin/bash
set -e

echo "Checking Claude..."

OUTPUT=$(claude -p "Reply ONLY with READY")

if [[ "$OUTPUT" != *"READY"* ]]; then
    echo "ERROR: Claude unavailable."
    exit 1
fi

echo "Claude is ready."