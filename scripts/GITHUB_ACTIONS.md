# Running the Jira robot on GitHub Actions (laptop-free)

The robot used to run via a macOS LaunchAgent (`scripts/schedule_workflow.sh`),
which only works while your laptop is on and logged in. It now also runs on
**GitHub Actions** (`.github/workflows/robot.yml`) so it works with the laptop off.

Same outcome as before: pick the oldest **In Progress** Jira ticket, branch,
implement with Claude, run tests, push, open a PR, move the ticket to **Review**.

## One-time setup

### 1. Mint a Claude auth token (uses your subscription, no API bill)

On your laptop, run:

```
claude setup-token
```

Copy the token it prints.

### 2. Create a Jira API token

Go to https://id.atlassian.com/manage-profile/security/api-tokens → create a token.

### 3. Add repository secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
| --- | --- |
| `CLAUDE_CODE_OAUTH_TOKEN` | output of `claude setup-token` |
| `JIRA_BASE_URL` | e.g. `https://your-site.atlassian.net` (no trailing slash) |
| `JIRA_EMAIL` | your Atlassian account email |
| `JIRA_API_TOKEN` | the token from step 2 |

And one **variable** (Variables tab), not a secret:

| Variable | Value |
| --- | --- |
| `JIRA_PROJECT` | project key, e.g. `PL` |

`GITHUB_TOKEN` is provided automatically — no action needed.

## Testing it

1. Move a throwaway ticket to **In Progress** in Jira.
2. Repo → **Actions → Jira Robot → Run workflow** (manual trigger).
3. Watch the run log: ticket detected → branch created → Claude commit `PL-x:` →
   tests run → branch pushed → PR opened → ticket moved to Review.
4. To test the feature on your laptop:
   ```
   git fetch origin
   git checkout feature/PL-x-...
   ```
   then run/test as usual.

## Enabling the schedule

Once a manual run is green end to end, uncomment the `schedule:` block in
`.github/workflows/robot.yml` to run automatically every 5 minutes.

## Local scheduler (now optional)

`scripts/schedule_workflow.sh`, `scripts/unschedule_workflow.sh`, and
`scripts/run_cron.sh` still work for running the robot locally via a macOS
LaunchAgent. They are no longer required and can be removed if you only use
GitHub Actions. Note the local path uses the Jira REST scripts too, so set
`JIRA_BASE_URL` / `JIRA_EMAIL` / `JIRA_API_TOKEN` / `JIRA_PROJECT` in your
environment if you run it locally.
