#!/bin/bash
#
# Posts an automated Claude code review as a comment on the current ticket's PR.
#
# Runs after the PR is created. Diffs the feature branch against the default branch,
# asks Claude (Opus 4.8) to review the change for bugs / security / quality, and posts
# the result as a PR comment for a human to read. Intentionally read-only: it never
# edits or pushes code, so it can't break the implementation that was already verified.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    echo "ERROR: refusing to review from protected branch $CURRENT_BRANCH."
    exit 1
fi

DEFAULT_BRANCH=$(git remote show origin | grep "HEAD branch" | awk '{print $NF}')
: "${DEFAULT_BRANCH:=main}"

# Make sure the base branch is available locally to diff against.
git fetch origin "$DEFAULT_BRANCH" --quiet || true

# Three-dot diff: only the changes this branch introduces since it diverged.
DIFF=$(git diff "origin/$DEFAULT_BRANCH...HEAD")

if [ -z "$DIFF" ]; then
    echo "No diff to review. Skipping."
    exit 0
fi

echo "Reviewing $CURRENT_BRANCH against origin/$DEFAULT_BRANCH..."

REVIEW=$(claude -p --dangerously-skip-permissions --model claude-opus-4-8 "
You are reviewing a pull request. Below is the full diff of the branch against the
default branch. Review it for bugs, logic errors, security issues, and code-quality
problems. Be concise and specific, and reference file names. If it looks good, say so
briefly.

IMPORTANT: Do NOT modify, create, or delete any files. Output ONLY the review, as Markdown.

Diff:

$DIFF
")

if [ -z "$REVIEW" ]; then
    echo "Empty review output. Skipping comment."
    exit 0
fi

gh pr comment "$CURRENT_BRANCH" --body "## 🤖 Automated code review — Claude Opus 4.8

$REVIEW

---
*Automated review by the Jira robot. Treat as advisory, not a merge gate.*"

echo "Posted review comment to PR for $CURRENT_BRANCH."
