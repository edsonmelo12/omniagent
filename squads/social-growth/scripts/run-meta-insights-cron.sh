#!/bin/bash
# Meta Insights Cron Scheduler
# Runs daily at 10:00 BRT to collect Instagram metrics

SCRIPT_DIR="/home/edsonrmjunior/Local Sites/omniagent/squads/social-growth"
SKILL_PATH="/home/edsonrmjunior/Local Sites/omniagent/skills/meta-insights/scripts/insights.js"

# List of clients to collect
CLIENTS=("amiclube")

for CLIENT in "${CLIENTS[@]}"; do
  ENV_FILE="$SCRIPT_DIR/.env.publish.$CLIENT"
  if [ -f "$ENV_FILE" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Collecting insights for $CLIENT..."
    node --env-file="$ENV_FILE" "$SKILL_PATH" --client "$CLIENT" --period last_7_days 2>&1 | grep -v MODULE_TYPELESS
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done for $CLIENT"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Skipping $CLIENT (no credentials)"
  fi
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Meta insights collection complete"