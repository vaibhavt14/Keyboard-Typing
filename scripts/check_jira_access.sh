#!/bin/bash
#
# Preflight: verify the Jira API token works by hitting /myself.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=jira_lib.sh
source "$SCRIPT_DIR/jira_lib.sh"
require_jira_env

echo "Checking Jira access..."

if ! jira_get "/rest/api/3/myself" >/dev/null; then
    echo "ERROR: Unable to access Jira. Check JIRA_BASE_URL / JIRA_EMAIL / JIRA_API_TOKEN."
    exit 1
fi

echo "Jira access OK."
