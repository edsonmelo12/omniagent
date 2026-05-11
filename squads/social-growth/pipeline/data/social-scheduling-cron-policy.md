# Social Scheduling Cron Policy

## Objective

Run social publishing with a hybrid model:

1. Native platform scheduling/publishing when connector is available.
2. Cron orchestration for queue execution, retries, monitoring and evidence.

## Canonical Artifacts

1. `squads/social-growth/output/{client}/publishing/schedule-plan.md`
2. `squads/social-growth/output/{client}/publishing/social-publish-assets.json`
3. `squads/social-growth/output/{client}/publishing/social-publish-queue.json`
4. `squads/social-growth/output/{client}/publishing/social-publish-worker-log.md`
5. `squads/social-growth/output/{client}/publishing/social-publish-monitor.md`

## Queue Rules

1. Every scheduled social item must have:
   - `asset_id`
   - `channel`
   - `format`
   - `publish_date`
   - `publish_time_brt`
   - `publish_at_iso`
   - `publish_at_utc`
   - `dispatch_mode` (`manual_export` or `connector_api`)
   - `status` (`scheduled`, `queued`, `published`, `failed`, `blocked`)
2. Queue rows are generated from `schedule-plan.md` + `social-publish-assets.json`.
3. Status values must be normalized before export validation. Portuguese statuses such as `Em revisão (preview pronto)` and `Preview pronto (aprovado)` map to canonical `review`, `ready_to_schedule` or `approved`.
4. If a scheduled asset is missing from `social-publish-assets.json`, the queue builder must check `social/publish/{asset_id}/` for existing PNG files before blocking. If files exist, recover the queue row and emit a warning.
5. Queue rows without a matching manifest row or recoverable exported files are invalid and must be blocked.
6. Channels `PARKED`/`DISABLED` cannot reach production statuses.

## Dispatch Rules

1. Default dispatch mode: `manual_export` when connector readiness is absent.
2. `connector_api` is allowed only if:
   - channel is `ACTIVE`
   - `publish_enabled=true`
   - `credentials_valid=true`
3. Cron worker must never bypass checkpoint approval.
4. Before live publishing, a `quick_preflight` Audit Packet is sufficient when no visual/copy asset changed. Required evidence: queue, monitor, final captions, exported assets, dry-run/validator and checkpoint status.

## Cron Cadence

Recommended:

1. Queue build: every run after Step 06 and before publication windows.
2. Worker: every 10 or 15 minutes.
3. Monitor: every 15 minutes after worker.

## Failure Handling

1. Missing queue for scheduled assets: `critical`.
2. Due item not dispatched after grace window: `critical`.
3. Connector-ineligible channel in production status: `critical`.
4. Missing exported files for queued item: `critical`.
5. `schedule-status.md` is informational. `social-publish-monitor.md` is the authoritative health gate after every queue rebuild.
6. Missing `final_caption` for connector-published items is critical.

## Timezone Standard

1. Planner time: BRT (`-03:00`).
2. Worker/monitor compare timestamps in UTC.
3. Reports must include both local and UTC where relevant.
