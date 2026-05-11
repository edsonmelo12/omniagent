#!/bin/bash
# Git Sync Cron
# Commits and pushes all changes to GitHub
# Runs every 30 minutes via crontab

set -e

SQUAD_DIR="/home/edsonrmjunior/Local Sites/omniagent"
LOG_DIR="$SQUAD_DIR/squads/social-growth/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$LOG_DIR"

cd "$SQUAD_DIR" || { echo "[$(date '+%Y-%m-%d %H:%M:%S')] FATAL: cannot cd to $SQUAD_DIR"; exit 1; }

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/git-sync-cron-$TIMESTAMP.log"
}

log "=== Git sync started ==="

node "$SQUAD_DIR/squads/social-growth/scripts/git-sync.mjs" \
  >> "$LOG_DIR/git-sync.log" 2>&1 || {
  log "WARN: git sync returned non-zero"
}

log "=== Git sync completed ==="
