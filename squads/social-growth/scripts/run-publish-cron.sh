#!/bin/bash
# Social Publish Worker Cron
# Runs every 30 minutes to publish pending social posts
# Default mode: live_api (changed from dry_run)

set -e

SQUAD_DIR="/home/edsonrmjunior/Local Sites/omniagent"
LOG_DIR="$SQUAD_DIR/squads/social-growth/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$LOG_DIR"

# Garantir cwd correto para o worker (cron roda do $HOME por padrão)
cd "$SQUAD_DIR" || { echo "[$(date '+%Y-%m-%d %H:%M:%S')] FATAL: cannot cd to $SQUAD_DIR"; exit 1; }

# Debug: log cron execution
echo "[$(date '+%Y-%m-%d %H:%M:%S')] CRON EXECUTED" >> "$LOG_DIR/cron-execution.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/publish-worker-$TIMESTAMP.log"
}

# Debug: check node availability
NODE_PATH=$(which node 2>/dev/null || echo "NODE NOT FOUND")
log "Node path: $NODE_PATH"

CLIENTS="${PUBLISH_CLIENTS:-amiclube}"

for client in $CLIENTS; do
  log "=== Checking publications for: $client ==="

  node "$SQUAD_DIR/squads/social-growth/scripts/run-social-publish-worker.mjs" \
    --client "$client" \
    --mode live_api >> "$LOG_DIR/publish-worker-$client.log" 2>&1 || {
    log "WARN: publish worker returned non-zero for $client"
  }

  log "=== Completed: $client ==="
done

log "Publishing check completed"
echo ""