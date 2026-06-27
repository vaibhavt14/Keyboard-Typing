#!/bin/bash
#
# Prints a validated branch name (feature/<ticket-id>-<short-slug>) for the
# current ticket. Fetches the issue from Jira via REST and asks Claude to turn
# it into a slug; the format is then validated locally.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=jira_lib.sh
source "$SCRIPT_DIR/jira_lib.sh"
require_jira_env

TICKET=$("$SCRIPT_DIR/get_next_ticket.sh")

ISSUE=$(jira_get "/rest/api/3/issue/$TICKET?fields=summary,description")
FIELDS=$(echo "$ISSUE" | jq -c '{summary: .fields.summary, description: .fields.description}')

BRANCH=$(claude -p "
Here is Jira ticket $TICKET as JSON (description may be in Atlassian Document Format):

$FIELDS

Return ONLY a branch name in this exact format:

feature/<ticket-id>-<short-slug>

Example:
feature/PL-4-unit-test-cases

Use the ticket id $TICKET. Return only the branch name and nothing else.
")

# Keep only first line
BRANCH=$(echo "$BRANCH" | head -n 1)

# Remove backticks and whitespace
BRANCH=$(echo "$BRANCH" | tr -d '\`' | xargs)

# Validate format
if [[ ! "$BRANCH" =~ ^feature/[A-Z]+-[0-9]+-[a-z0-9-]+$ ]]; then
    echo "ERROR: Invalid branch name returned:"
    echo "$BRANCH"
    exit 1
fi

echo "$BRANCH"
