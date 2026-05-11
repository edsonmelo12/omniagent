# Git Sync Policy

## Purpose

Ensure all squad outputs, pipeline data, agent definitions, and configuration changes are regularly committed and pushed to the remote GitHub repository. Guarantees persistence, traceability, and the ability to resume work across sessions.

## Trigger

- **Pipeline step**: `step-06e-git-sync.md` — runs after publishing and validation
- **Automatic cron**: `git-sync-cron.sh` (every 30 min via crontab)
- **Manual**: `node squads/social-growth/scripts/git-sync.mjs [--dry-run]`

## Commit Message Format

```
sync: {YYYY-MM-DD HH:mm:ss} ({N} arquivos)
```

## Scope

The sync operates on the **entire repository** — not per client. All changes across all clients, pipeline data, scripts, and configurations are committed in a single atomic commit.

## Files Tracked

All files in the repository are tracked **except**:
- `node_modules/` and `**/node_modules/`
- `.env`, `.env.*`, `**/.env.*`
- `**/.secrets/`
- `.graphify-cache/` and `graphify-out/cache/`
- `dist/`, `build/`, `.vite/`, `.puppeteer/`
- `*.log`
- `sys,json,re`, `squads/social-ht/`
- Embedded git repos (`open-design/`, `social-studio/`)

## Security Rules

1. **Never commit** `.env` files, service account keys, API tokens, or any file containing secrets
2. The `GITHUB_TOKEN` is read from `$HOME/Local Sites/.env` — this file is in `.gitignore`
3. The token is injected into the remote URL only during push, then immediately restored
4. If GitHub Push Protection blocks a commit, investigate and remove the secret before retrying

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Push rejected: large file | Check `.gitignore` for the pattern, run `git rm --cached <file>`, recommit |
| Push rejected: secret detected | Remove the secret file from tracking, add to `.gitignore`, recommit |
| Authentication failed | Check `GITHUB_TOKEN` in `$HOME/Local Sites/.env` (regenerate if expired) |
| Merge conflict | Run `git pull --rebase origin main`, resolve conflicts, retry |
| Nothing to commit | No changes detected — this is normal between work sessions |
