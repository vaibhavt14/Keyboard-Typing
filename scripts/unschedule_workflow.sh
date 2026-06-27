#!/bin/bash
set -e

LABEL="com.prelegal.workflow"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ ! -f "$PLIST" ]; then
    echo "No prelegal workflow LaunchAgent found."
    exit 0
fi

launchctl unload "$PLIST" >/dev/null 2>&1 || true
rm -f "$PLIST"

echo "LaunchAgent removed successfully."