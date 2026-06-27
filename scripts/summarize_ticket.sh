#!/bin/bash
#
# Prints a concise summary of the current ticket's work. Fetches the issue from
# Jira via REST, then passes the raw fields JSON to Claude (Claude can read the
# Atlassian Document Format description directly, so no MCP connector is needed).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=jira_lib.sh
source "$SCRIPT_DIR/jira_lib.sh"
require_jira_env

TICKET=$("$SCRIPT_DIR/get_next_ticket.sh")

ISSUE=$(jira_get "/rest/api/3/issue/$TICKET?fields=summary,description")
FIELDS=$(echo "$ISSUE" | jq -c '{summary: .fields.summary, description: .fields.description}')

claude -p "
Here is Jira ticket $TICKET as JSON (the description may be in Atlassian Document Format):

$FIELDS

Return ONLY a concise summary of the work required.
Maximum 5 bullet points.
"
