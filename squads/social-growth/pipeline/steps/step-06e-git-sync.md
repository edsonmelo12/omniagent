---
execution: subagent
agent: git-master
model_tier: standard
inputFile: .
outputFile: squads/social-growth/logs/git-sync-{timestamp}.log
---

# Step 06E: Git Sync — Version Control Backup

## Context Loading

Load these files before executing:
- `pipeline/data/git-sync-policy.md` — git sync policy and rules
- `squads/social-growth/scripts/git-sync.mjs` — sync script

## Instructions

1. **Run the git sync script** to commit and push all changes:

   ```bash
   node squads/social-growth/scripts/git-sync.mjs [--dry-run]
   ```

2. **Verify the sync result**:
   - Check the log file at `squads/social-growth/logs/git-sync-*.log`
   - Confirm the commit message is descriptive (includes date and file count)
   - Confirm the push completed successfully

3. **If sync fails**:
   - Check if there are merge conflicts
   - Check if the token is still valid
   - Check for large files exceeding GitHub limits (>100MB)
   - Report the error and suggest manual intervention

## Output Format

```
=== Git Sync Start === dry_run=false
Changes detected: {N} file(s)
Push OK: edsonmelo12/omniagent.git (main)
Commit: sync: {YYYY-MM-DD HH:mm:ss} ({N} arquivos)
=== Git Sync Complete ===
```

## Veto Conditions

Reject and do NOT proceed if:
1. The script exits with a non-zero code
2. The push was rejected (check GitHub error message)
3. The commit contains secrets (`.env`, `*.key`, credentials)

## Quality Criteria

- [ ] All changes since last sync are committed
- [ ] Commit message is descriptive
- [ ] Push to remote completed successfully
- [ ] Log file was saved to `logs/git-sync-*.log`
