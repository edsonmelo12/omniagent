#!/bin/bash
# Unified monitoring collector
# Collects meta-insights + ga4-insights for all clients
# Runs daily at 10:00 BRT

set -e

SQUAD_DIR="/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth"
LOG_DIR="$SQUAD_DIR/logs"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/collection-$TIMESTAMP.log"
}

log "Starting unified monitoring collection"

CLIENTS="${COLLECT_CLIENTS:-amiclube}"

for client in $CLIENTS; do
  log "=== Collecting for: $client ==="
  
  # Meta insights (Instagram + Facebook)
  log "Collecting meta-insights..."
  node --env-file="$SQUAD_DIR/.env.publish.$client" "/home/edsonrmjunior/Local Sites/omniagent/skills/meta-insights/scripts/insights.js" \
    --client "$client" \
    --period last_7_days >> "$LOG_DIR/meta-$client.log" 2>&1 || {
    log "ERROR: meta-insights failed for $client"
  }
  
  # GA4 insights (Web analytics)
  log "Collecting ga4-insights..."
  GA4_PROPERTY_ID=302524520 node "/home/edsonrmjunior/Local Sites/omniagent/skills/ga4-insights/scripts/insights.js" \
    --client "$client" \
    --period last_7_days >> "$LOG_DIR/ga4-$client.log" 2>&1 || {
    log "ERROR: ga4-insights failed for $client"
  }
  
  log "=== Completed: $client ==="
done

log "Collection completed"
echo ""