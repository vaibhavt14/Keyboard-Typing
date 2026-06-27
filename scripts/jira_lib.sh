#!/bin/bash
#
# Shared Jira Cloud REST helpers.
#
# Replaces the old approach of asking `claude -p` to talk to Jira via the
# Atlassian MCP connector (which relies on an interactive OAuth login and does
# not work headlessly in CI). Instead we hit the Jira Cloud REST API directly
# with an API token, which works the same on a laptop or a GitHub Actions runner.
#
# Required environment variables:
#   JIRA_BASE_URL   e.g. https://your-site.atlassian.net   (no trailing slash)
#   JIRA_EMAIL      the Atlassian account email
#   JIRA_API_TOKEN  token from https://id.atlassian.com/manage-profile/security/api-tokens
#   JIRA_PROJECT    project key, e.g. PL

set -euo pipefail

require_jira_env() {
    : "${JIRA_BASE_URL:?JIRA_BASE_URL is not set}"
    : "${JIRA_EMAIL:?JIRA_EMAIL is not set}"
    : "${JIRA_API_TOKEN:?JIRA_API_TOKEN is not set}"
    : "${JIRA_PROJECT:?JIRA_PROJECT is not set}"
}

# jira_get <path>            -> GET, prints JSON body
jira_get() {
    curl -sf \
        -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
        -H "Accept: application/json" \
        "${JIRA_BASE_URL%/}$1"
}

# jira_post <path> <json>    -> POST, prints JSON body (if any)
jira_post() {
    curl -sf \
        -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        -X POST \
        --data "$2" \
        "${JIRA_BASE_URL%/}$1"
}
