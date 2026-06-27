#!/bin/bash

export PATH="/Users/vaibhavthukral/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCKFILE="/tmp/prelegal_workflow.lock"
LOGFILE="$PROJECT_ROOT/logs/workflow.log"

mkdir -p "$PROJECT_ROOT/logs"

if [ -f "$LOCKFILE" ]; then
    echo "[$(date)] Workflow already running. Skipping this run." >> "$LOGFILE"
    exit 0
fi

trap "rm -f $LOCKFILE" EXIT
touch "$LOCKFILE"

echo "" >> "$LOGFILE"
echo "========================================" >> "$LOGFILE"
echo "[$(date)] Starting workflow" >> "$LOGFILE"

cd "$PROJECT_ROOT"
./scripts/workflow.sh >> "$LOGFILE" 2>&1
EXIT_CODE=$?

echo "[$(date)] Workflow finished with exit code $EXIT_CODE." >> "$LOGFILE"
exit $EXIT_CODE
