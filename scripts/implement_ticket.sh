#!/bin/bash
#
# Hands the current ticket to Claude to implement and commit.
#
# Fetches the ticket from Jira via REST and passes its content inline, so Claude
# does not need the Atlassian MCP connector. Runs with --dangerously-skip-permissions
# because there is no human to approve tool use on a CI runner; this is safe here
# because the runner is an ephemeral, isolated sandbox working on a feature branch.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# shellcheck source=jira_lib.sh
source "$SCRIPT_DIR/jira_lib.sh"
require_jira_env

TICKET=$("$SCRIPT_DIR/get_next_ticket.sh")

ISSUE=$(jira_get "/rest/api/3/issue/$TICKET?fields=summary,description")
FIELDS=$(echo "$ISSUE" | jq -c '{summary: .fields.summary, description: .fields.description}')

claude -p --dangerously-skip-permissions "
Ticket: $TICKET

Here is the ticket as JSON (description may be in Atlassian Document Format):

$FIELDS

Implement all requirements.

Run appropriate validation.

Commit changes using a message that starts with:

$TICKET:

Example:
$TICKET: Fix edge cases in workflow scripts
"
