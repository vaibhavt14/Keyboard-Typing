#!/bin/bash
#
# Prints the key of the oldest "In Progress" Jira ticket in $JIRA_PROJECT,
# or "NO_TICKET" if there are none. Queries the Jira REST API directly.

set -euo pipefail

# Reuse an already-resolved ticket if the workflow exported one.
if [ -n "${TICKET:-}" ] && [ "$TICKET" != "NO_TICKET" ]; then
    echo "$TICKET"
    exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=jira_lib.sh
source "$SCRIPT_DIR/jira_lib.sh"
require_jira_env

JQL="project = $JIRA_PROJECT AND status = \"In Progress\" ORDER BY created ASC"
ENCODED_JQL=$(jq -rn --arg q "$JQL" '$q | @uri')

# /search/jql is the current Jira Cloud enhanced search endpoint.
RESP=$(jira_get "/rest/api/3/search/jql?jql=${ENCODED_JQL}&fields=key&maxResults=1")

KEY=$(echo "$RESP" | jq -r '.issues[0].key // "NO_TICKET"')
[ -z "$KEY" ] && KEY="NO_TICKET"

echo "$KEY"
