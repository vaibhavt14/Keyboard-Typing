#!/bin/bash
set -e

echo "=== STEP 1: Check GitHub Access ==="
./scripts/check_git_auth.sh

echo ""
echo "=== STEP 2: Check Jira Access ==="
./scripts/check_jira_access.sh

echo ""
echo "=== STEP 3: Get Ticket ==="

TICKET=$(./scripts/get_next_ticket.sh)

if [ "$TICKET" = "NO_TICKET" ]; then
    echo "No Jira tickets in progress."
    exit 0
fi

export TICKET

echo "$TICKET"

echo ""
echo "=== STEP 4: Ticket Summary ==="
./scripts/summarize_ticket.sh

echo ""
echo "=== STEP 5: Verify Clean Worktree ==="
./scripts/check_clean_worktree.sh

echo ""
echo "=== STEP 6: Create/Checkout Branch ==="
./scripts/create_branch.sh

echo ""
echo "=== STEP 7: Verify Safe Branch ==="
./scripts/check_safe_branch.sh

echo ""
echo "=== STEP 8: Verify Ticket Match ==="
./scripts/verify_ticket_branch.sh

echo ""
echo "=== STEP 9: Verify Claude Ready ==="
./scripts/check_claude_ready.sh

echo ""
echo "=== ALL PRECHECKS PASSED ==="
echo "Ready for Claude to work."