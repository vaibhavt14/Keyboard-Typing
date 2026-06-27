#!/bin/bash
set -e

echo "=== PRECHECKS ==="

TMPFILE=$(mktemp)
./scripts/run_workflow.sh 2>&1 | tee "$TMPFILE"
EXIT_CODE=${PIPESTATUS[0]}
PRECHECK_OUTPUT=$(cat "$TMPFILE")
rm -f "$TMPFILE"

if [ $EXIT_CODE -ne 0 ]; then
    exit 1
fi

if echo "$PRECHECK_OUTPUT" | grep -q "No Jira tickets in progress."; then
    echo ""
    echo "Nothing to do."
    exit 0
fi

TICKET=$(./scripts/get_next_ticket.sh)
export TICKET

echo ""
echo "=== CLAUDE IMPLEMENTATION ==="
./scripts/implement_ticket.sh

echo ""
echo "=== IMPLEMENTATION VERIFICATION ==="
./scripts/check_implementation.sh

echo ""
echo "=== TEST VALIDATION ==="
./scripts/check_tests_pass.sh

echo ""
echo "=== PUSH ==="
./scripts/push_branch.sh

echo ""
echo "=== CREATE PR ==="
./scripts/create_pr.sh

echo ""
echo "=== CODE REVIEW ==="
# Non-fatal: an automated review is advisory and must not block the pipeline.
./scripts/review_pr.sh || echo "Review step failed (non-fatal); continuing."

echo ""
echo "=== MOVE JIRA REVIEW ==="
./scripts/move_jira_review.sh

echo ""
echo "=== DONE ==="