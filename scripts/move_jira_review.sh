#!/bin/bash
#
# Transitions the current ticket to "Review" via the Jira REST API.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=jira_lib.sh
source "$SCRIPT_DIR/jira_lib.sh"
require_jira_env

TICKET=$("$SCRIPT_DIR/get_next_ticket.sh")

if [ -z "$TICKET" ] || [ "$TICKET" = "NO_TICKET" ]; then
    echo "ERROR: No ticket to move to Review."
    exit 1
fi

echo "Move $TICKET to Review"

# Find the transition that lands the issue in a "Review" status.
TRANSITIONS=$(jira_get "/rest/api/3/issue/$TICKET/transitions")
# Match any transition whose name or target status contains "review"
# (case-insensitive), so "Review", "In Review", "Code Review" etc. all work.
TRANSITION_ID=$(echo "$TRANSITIONS" | jq -r \
    '.transitions[] | select((.name | ascii_downcase | contains("review")) or (.to.name | ascii_downcase | contains("review"))) | .id' | head -n 1)

if [ -z "$TRANSITION_ID" ]; then
    echo "ERROR: No 'Review' transition available for $TICKET."
    echo "Available transitions:"
    echo "$TRANSITIONS" | jq -r '.transitions[] | "  - \(.name) -> \(.to.name)"'
    exit 1
fi

jira_post "/rest/api/3/issue/$TICKET/transitions" \
    "{\"transition\":{\"id\":\"$TRANSITION_ID\"}}"

echo "Success: $TICKET moved to Review."
