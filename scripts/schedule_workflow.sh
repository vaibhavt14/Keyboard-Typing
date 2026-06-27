#!/bin/bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.prelegal.workflow"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

chmod +x "$PROJECT_ROOT/scripts/run_cron.sh"
mkdir -p "$PROJECT_ROOT/logs"

# Using a LaunchAgent (not cron): LaunchAgents run inside the user's login
# session, so they retain Keychain access. `claude -p` stores its OAuth
# session in the macOS Keychain, which plain cron jobs cannot read, causing
# every `claude -p` call in the workflow to fail with "Not logged in".
cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>$LABEL</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$PROJECT_ROOT/scripts/run_cron.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>300</integer>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardOutPath</key>
    <string>$PROJECT_ROOT/logs/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_ROOT/logs/launchd.log</string>
</dict>
</plist>
PLIST_EOF

launchctl unload "$PLIST" >/dev/null 2>&1 || true
launchctl load "$PLIST"

echo "LaunchAgent installed and loaded successfully."
echo ""
echo "Schedule : every 5 minutes (StartInterval in $PLIST)"
echo "Logs     : $PROJECT_ROOT/logs/workflow.log"
echo ""
echo "Status:"
launchctl list | grep "$LABEL" || echo "(not yet shown by launchctl list; it will run on its next interval)"