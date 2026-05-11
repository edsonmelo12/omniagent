import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";
const BASELINE_TABLE = "market_presence_baselines";
const INTERVENTION_TABLE = "market_presence_interventions";
const CHECKPOINT_TABLE = "market_presence_checkpoints";
const COMPARISON_TABLE = "market_presence_comparisons";
let ensureBaselineTablePromise = null;
let ensureInterventionTablePromise = null;
let ensureCheckpointTablePromise = null;
let ensureComparisonTablePromise = null;
const ensureVersionedTable = async (tableName, createStatement, indexes) => {
    if (!isDatabaseConfigured())
        return;
    await query(createStatement);
    for (const statement of indexes) {
        await query(statement);
    }
    await query(`do $$
     begin
       if not exists (
         select 1
         from pg_trigger
         where tgname = '${tableName}_set_updated_at'
       ) then
         create trigger ${tableName}_set_updated_at
         before update on ${tableName}
         for each row execute function set_updated_at();
       end if;
     end $$;`).catch(() => undefined);
};
const ensureBaselineTable = async () => {
    if (!isDatabaseConfigured())
        return;
    if (!ensureBaselineTablePromise) {
        ensureBaselineTablePromise = ensureVersionedTable(BASELINE_TABLE, `create table if not exists ${BASELINE_TABLE} (
         id uuid primary key default gen_random_uuid(),
         client_id uuid not null references clients(id) on delete cascade,
         version integer not null,
         scope text not null,
         market_context text not null,
         source_snapshot_id uuid null references social_intelligence_snapshots(id) on delete set null,
         source_client_record_id uuid null references client_briefs(id) on delete set null,
         source_market_research_id uuid null references market_researches(id) on delete set null,
         collected_at timestamptz not null default now(),
         presence_score integer not null,
         consistency_score integer not null,
         proof_score integer not null,
         conversion_score integer not null,
         confidence_score integer not null,
         profiles_count integer not null default 0,
         source_count integer not null default 0,
         evidence_count integer not null default 0,
         last_post_date date null,
         notes text null,
         payload_json jsonb not null default '{}'::jsonb,
         created_at timestamptz not null default now(),
         updated_at timestamptz not null default now(),
         unique (client_id, version)
       )`, [
            `create index if not exists ${BASELINE_TABLE}_client_version_idx
         on ${BASELINE_TABLE} (client_id, version desc)`,
            `create index if not exists ${BASELINE_TABLE}_client_collected_at_idx
         on ${BASELINE_TABLE} (client_id, collected_at desc)`,
        ]).catch((error) => {
            ensureBaselineTablePromise = null;
            throw error;
        });
    }
    return ensureBaselineTablePromise;
};
const ensureInterventionTable = async () => {
    if (!isDatabaseConfigured())
        return;
    if (!ensureInterventionTablePromise) {
        ensureInterventionTablePromise = ensureVersionedTable(INTERVENTION_TABLE, `create table if not exists ${INTERVENTION_TABLE} (
         id uuid primary key default gen_random_uuid(),
         client_id uuid not null references clients(id) on delete cascade,
         baseline_id uuid not null references ${BASELINE_TABLE}(id) on delete cascade,
         period_start date not null,
         period_end date not null,
         actions_taken_json jsonb not null default '[]'::jsonb,
         channels_edited_json jsonb not null default '[]'::jsonb,
         content_volume integer not null default 0,
         cta_changes integer not null default 0,
         site_changes integer not null default 0,
         proof_changes integer not null default 0,
         notes text null,
         payload_json jsonb not null default '{}'::jsonb,
         created_at timestamptz not null default now(),
         updated_at timestamptz not null default now()
       )`, [
            `create index if not exists ${INTERVENTION_TABLE}_client_created_at_idx
         on ${INTERVENTION_TABLE} (client_id, created_at desc)`,
            `create index if not exists ${INTERVENTION_TABLE}_baseline_created_at_idx
         on ${INTERVENTION_TABLE} (baseline_id, created_at desc)`,
        ]).catch((error) => {
            ensureInterventionTablePromise = null;
            throw error;
        });
    }
    return ensureInterventionTablePromise;
};
const ensureCheckpointTable = async () => {
    if (!isDatabaseConfigured())
        return;
    if (!ensureCheckpointTablePromise) {
        ensureCheckpointTablePromise = ensureVersionedTable(CHECKPOINT_TABLE, `create table if not exists ${CHECKPOINT_TABLE} (
         id uuid primary key default gen_random_uuid(),
         client_id uuid not null references clients(id) on delete cascade,
         version integer not null,
         baseline_id uuid not null references ${BASELINE_TABLE}(id) on delete cascade,
         intervention_id uuid null references ${INTERVENTION_TABLE}(id) on delete set null,
         source_snapshot_id uuid null references social_intelligence_snapshots(id) on delete set null,
         source_client_record_id uuid null references client_briefs(id) on delete set null,
         source_market_research_id uuid null references market_researches(id) on delete set null,
         collected_at timestamptz not null default now(),
         presence_score integer not null,
         consistency_score integer not null,
         proof_score integer not null,
         conversion_score integer not null,
         confidence_score integer not null,
         profiles_count integer not null default 0,
         source_count integer not null default 0,
         evidence_count integer not null default 0,
         last_post_date date null,
         notes text null,
         payload_json jsonb not null default '{}'::jsonb,
         created_at timestamptz not null default now(),
         updated_at timestamptz not null default now(),
         unique (client_id, version)
       )`, [
            `create index if not exists ${CHECKPOINT_TABLE}_client_version_idx
         on ${CHECKPOINT_TABLE} (client_id, version desc)`,
            `create index if not exists ${CHECKPOINT_TABLE}_baseline_created_at_idx
         on ${CHECKPOINT_TABLE} (baseline_id, collected_at desc)`,
        ]).catch((error) => {
            ensureCheckpointTablePromise = null;
            throw error;
        });
    }
    return ensureCheckpointTablePromise;
};
const ensureComparisonTable = async () => {
    if (!isDatabaseConfigured())
        return;
    if (!ensureComparisonTablePromise) {
        ensureComparisonTablePromise = ensureVersionedTable(COMPARISON_TABLE, `create table if not exists ${COMPARISON_TABLE} (
         id uuid primary key default gen_random_uuid(),
         client_id uuid not null references clients(id) on delete cascade,
         baseline_id uuid not null references ${BASELINE_TABLE}(id) on delete cascade,
         checkpoint_id uuid not null references ${CHECKPOINT_TABLE}(id) on delete cascade,
         presence_delta integer not null,
         consistency_delta integer not null,
         proof_delta integer not null,
         conversion_delta integer not null,
         maturity_delta integer not null,
         profiles_delta integer not null,
         source_delta integer not null,
         evidence_delta integer not null,
         reading text not null,
         attribution text not null,
         analogy text not null,
         executive_summary text not null,
         payload_json jsonb not null default '{}'::jsonb,
         created_at timestamptz not null default now(),
         updated_at timestamptz not null default now(),
         unique (baseline_id, checkpoint_id)
       )`, [
            `create index if not exists ${COMPARISON_TABLE}_client_created_at_idx
         on ${COMPARISON_TABLE} (client_id, created_at desc)`,
            `create index if not exists ${COMPARISON_TABLE}_baseline_checkpoint_idx
         on ${COMPARISON_TABLE} (baseline_id, checkpoint_id)`,
        ]).catch((error) => {
            ensureComparisonTablePromise = null;
            throw error;
        });
    }
    return ensureComparisonTablePromise;
};
const getNextVersion = async (clientId, tableName) => {
    const row = await queryOne(`select coalesce(max(version), 0) + 1 as version
     from ${tableName}
     where client_id = $1`, [clientId]);
    return Number(row?.version ?? 1);
};
export const ensureMarketPresenceTables = async () => {
    await ensureBaselineTable();
    await ensureInterventionTable();
    await ensureCheckpointTable();
    await ensureComparisonTable();
};
export const listMarketPresenceBaselinesByClientId = async (clientId) => {
    await ensureBaselineTable();
    return query(`select
       id,
       client_id,
       version,
       scope,
       market_context,
       source_snapshot_id,
       source_client_record_id,
       source_market_research_id,
       collected_at,
       presence_score,
       consistency_score,
       proof_score,
       conversion_score,
       confidence_score,
       profiles_count,
       source_count,
       evidence_count,
       last_post_date,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${BASELINE_TABLE}
     where client_id = $1
     order by version desc, collected_at desc`, [clientId]);
};
export const findLatestMarketPresenceBaselineByClientId = async (clientId) => {
    await ensureBaselineTable();
    return queryOne(`select
       id,
       client_id,
       version,
       scope,
       market_context,
       source_snapshot_id,
       source_client_record_id,
       source_market_research_id,
       collected_at,
       presence_score,
       consistency_score,
       proof_score,
       conversion_score,
       confidence_score,
       profiles_count,
       source_count,
       evidence_count,
       last_post_date,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${BASELINE_TABLE}
     where client_id = $1
     order by version desc, collected_at desc
     limit 1`, [clientId]);
};
export const findMarketPresenceBaselineById = async (baselineId) => {
    await ensureBaselineTable();
    return queryOne(`select
       id,
       client_id,
       version,
       scope,
       market_context,
       source_snapshot_id,
       source_client_record_id,
       source_market_research_id,
       collected_at,
       presence_score,
       consistency_score,
       proof_score,
       conversion_score,
       confidence_score,
       profiles_count,
       source_count,
       evidence_count,
       last_post_date,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${BASELINE_TABLE}
     where id = $1`, [baselineId]);
};
export const createMarketPresenceBaselineVersion = async (input) => withTransaction(async (client) => {
    await ensureBaselineTable();
    const version = await getNextVersion(input.clientId, BASELINE_TABLE);
    const result = await client.query(`insert into ${BASELINE_TABLE} (
         client_id,
         version,
         scope,
         market_context,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         collected_at,
         presence_score,
         consistency_score,
         proof_score,
         conversion_score,
         confidence_score,
         profiles_count,
         source_count,
         evidence_count,
         last_post_date,
         notes,
         payload_json
       )
       values ($1, $2, $3, $4, $5, $6, $7, coalesce($8, now()), $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19::jsonb)
       returning
         id,
         client_id,
         version,
         scope,
         market_context,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         collected_at,
         presence_score,
         consistency_score,
         proof_score,
         conversion_score,
         confidence_score,
         profiles_count,
         source_count,
         evidence_count,
         last_post_date,
         notes,
         payload_json,
         created_at,
         updated_at`, [
        input.clientId,
        version,
        input.scope,
        input.marketContext,
        input.sourceSnapshotId,
        input.sourceClientRecordId,
        input.sourceMarketResearchId,
        input.collectedAt ?? null,
        input.presenceScore,
        input.consistencyScore,
        input.proofScore,
        input.conversionScore,
        input.confidenceScore,
        input.profilesCount,
        input.sourceCount,
        input.evidenceCount,
        input.lastPostDate ?? null,
        input.notes ?? null,
        JSON.stringify(input.payload),
    ]);
    return result.rows[0];
});
export const listMarketPresenceInterventionsByClientId = async (clientId) => {
    await ensureInterventionTable();
    return query(`select
       id,
       client_id,
       baseline_id,
       period_start,
       period_end,
       actions_taken_json,
       channels_edited_json,
       content_volume,
       cta_changes,
       site_changes,
       proof_changes,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${INTERVENTION_TABLE}
     where client_id = $1
     order by period_end desc, created_at desc`, [clientId]);
};
export const findLatestMarketPresenceInterventionByClientId = async (clientId) => {
    await ensureInterventionTable();
    return queryOne(`select
       id,
       client_id,
       baseline_id,
       period_start,
       period_end,
       actions_taken_json,
       channels_edited_json,
       content_volume,
       cta_changes,
       site_changes,
       proof_changes,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${INTERVENTION_TABLE}
     where client_id = $1
     order by period_end desc, created_at desc
     limit 1`, [clientId]);
};
export const findMarketPresenceInterventionById = async (interventionId) => {
    await ensureInterventionTable();
    return queryOne(`select
       id,
       client_id,
       baseline_id,
       period_start,
       period_end,
       actions_taken_json,
       channels_edited_json,
       content_volume,
       cta_changes,
       site_changes,
       proof_changes,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${INTERVENTION_TABLE}
     where id = $1`, [interventionId]);
};
export const createMarketPresenceIntervention = async (input) => withTransaction(async (client) => {
    await ensureInterventionTable();
    const result = await client.query(`insert into ${INTERVENTION_TABLE} (
         client_id,
         baseline_id,
         period_start,
         period_end,
         actions_taken_json,
         channels_edited_json,
         content_volume,
         cta_changes,
         site_changes,
         proof_changes,
         notes,
         payload_json
       )
       values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11, $12::jsonb)
       returning
         id,
         client_id,
         baseline_id,
         period_start,
         period_end,
         actions_taken_json,
         channels_edited_json,
         content_volume,
         cta_changes,
         site_changes,
         proof_changes,
         notes,
         payload_json,
         created_at,
         updated_at`, [
        input.clientId,
        input.baselineId,
        input.periodStart,
        input.periodEnd,
        JSON.stringify(input.actionsTaken),
        JSON.stringify(input.channelsEdited),
        input.contentVolume,
        input.ctaChanges,
        input.siteChanges,
        input.proofChanges,
        input.notes ?? null,
        JSON.stringify(input.payload),
    ]);
    return result.rows[0];
});
export const listMarketPresenceCheckpointsByClientId = async (clientId) => {
    await ensureCheckpointTable();
    return query(`select
       id,
       client_id,
       version,
       baseline_id,
       intervention_id,
       source_snapshot_id,
       source_client_record_id,
       source_market_research_id,
       collected_at,
       presence_score,
       consistency_score,
       proof_score,
       conversion_score,
       confidence_score,
       profiles_count,
       source_count,
       evidence_count,
       last_post_date,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${CHECKPOINT_TABLE}
     where client_id = $1
     order by version desc, collected_at desc`, [clientId]);
};
export const findLatestMarketPresenceCheckpointByClientId = async (clientId) => {
    await ensureCheckpointTable();
    return queryOne(`select
       id,
       client_id,
       version,
       baseline_id,
       intervention_id,
       source_snapshot_id,
       source_client_record_id,
       source_market_research_id,
       collected_at,
       presence_score,
       consistency_score,
       proof_score,
       conversion_score,
       confidence_score,
       profiles_count,
       source_count,
       evidence_count,
       last_post_date,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${CHECKPOINT_TABLE}
     where client_id = $1
     order by version desc, collected_at desc
     limit 1`, [clientId]);
};
export const findMarketPresenceCheckpointById = async (checkpointId) => {
    await ensureCheckpointTable();
    return queryOne(`select
       id,
       client_id,
       version,
       baseline_id,
       intervention_id,
       source_snapshot_id,
       source_client_record_id,
       source_market_research_id,
       collected_at,
       presence_score,
       consistency_score,
       proof_score,
       conversion_score,
       confidence_score,
       profiles_count,
       source_count,
       evidence_count,
       last_post_date,
       notes,
       payload_json,
       created_at,
       updated_at
     from ${CHECKPOINT_TABLE}
     where id = $1`, [checkpointId]);
};
export const createMarketPresenceCheckpointVersion = async (input) => withTransaction(async (client) => {
    await ensureCheckpointTable();
    const version = await getNextVersion(input.clientId, CHECKPOINT_TABLE);
    const result = await client.query(`insert into ${CHECKPOINT_TABLE} (
         client_id,
         version,
         baseline_id,
         intervention_id,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         collected_at,
         presence_score,
         consistency_score,
         proof_score,
         conversion_score,
         confidence_score,
         profiles_count,
         source_count,
         evidence_count,
         last_post_date,
         notes,
         payload_json
       )
       values ($1, $2, $3, $4, $5, $6, $7, coalesce($8, now()), $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19::jsonb)
       returning
         id,
         client_id,
         version,
         baseline_id,
         intervention_id,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         collected_at,
         presence_score,
         consistency_score,
         proof_score,
         conversion_score,
         confidence_score,
         profiles_count,
         source_count,
         evidence_count,
         last_post_date,
         notes,
         payload_json,
         created_at,
         updated_at`, [
        input.clientId,
        version,
        input.baselineId,
        input.interventionId ?? null,
        input.sourceSnapshotId,
        input.sourceClientRecordId,
        input.sourceMarketResearchId,
        input.collectedAt ?? null,
        input.presenceScore,
        input.consistencyScore,
        input.proofScore,
        input.conversionScore,
        input.confidenceScore,
        input.profilesCount,
        input.sourceCount,
        input.evidenceCount,
        input.lastPostDate ?? null,
        input.notes ?? null,
        JSON.stringify(input.payload),
    ]);
    return result.rows[0];
});
export const listMarketPresenceComparisonsByClientId = async (clientId) => {
    await ensureComparisonTable();
    return query(`select
       id,
       client_id,
       baseline_id,
       checkpoint_id,
       presence_delta,
       consistency_delta,
       proof_delta,
       conversion_delta,
       maturity_delta,
       profiles_delta,
       source_delta,
       evidence_delta,
       reading,
       attribution,
       analogy,
       executive_summary,
       payload_json,
       created_at,
       updated_at
     from ${COMPARISON_TABLE}
     where client_id = $1
     order by created_at desc, id desc`, [clientId]);
};
export const findLatestMarketPresenceComparisonByClientId = async (clientId) => {
    await ensureComparisonTable();
    return queryOne(`select
       id,
       client_id,
       baseline_id,
       checkpoint_id,
       presence_delta,
       consistency_delta,
       proof_delta,
       conversion_delta,
       maturity_delta,
       profiles_delta,
       source_delta,
       evidence_delta,
       reading,
       attribution,
       analogy,
       executive_summary,
       payload_json,
       created_at,
       updated_at
     from ${COMPARISON_TABLE}
     where client_id = $1
     order by created_at desc, id desc
     limit 1`, [clientId]);
};
export const findMarketPresenceComparisonByCheckpointId = async (checkpointId) => {
    await ensureComparisonTable();
    return queryOne(`select
       id,
       client_id,
       baseline_id,
       checkpoint_id,
       presence_delta,
       consistency_delta,
       proof_delta,
       conversion_delta,
       maturity_delta,
       profiles_delta,
       source_delta,
       evidence_delta,
       reading,
       attribution,
       analogy,
       executive_summary,
       payload_json,
       created_at,
       updated_at
     from ${COMPARISON_TABLE}
     where checkpoint_id = $1
     limit 1`, [checkpointId]);
};
export const createMarketPresenceComparison = async (input) => withTransaction(async (client) => {
    await ensureComparisonTable();
    const result = await client.query(`insert into ${COMPARISON_TABLE} (
         client_id,
         baseline_id,
         checkpoint_id,
         presence_delta,
         consistency_delta,
         proof_delta,
         conversion_delta,
         maturity_delta,
         profiles_delta,
         source_delta,
         evidence_delta,
         reading,
         attribution,
         analogy,
         executive_summary,
         payload_json
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb)
       on conflict (baseline_id, checkpoint_id)
       do update set
         presence_delta = excluded.presence_delta,
         consistency_delta = excluded.consistency_delta,
         proof_delta = excluded.proof_delta,
         conversion_delta = excluded.conversion_delta,
         maturity_delta = excluded.maturity_delta,
         profiles_delta = excluded.profiles_delta,
         source_delta = excluded.source_delta,
         evidence_delta = excluded.evidence_delta,
         reading = excluded.reading,
         attribution = excluded.attribution,
         analogy = excluded.analogy,
         executive_summary = excluded.executive_summary,
         payload_json = excluded.payload_json,
         updated_at = now()
       returning
         id,
         client_id,
         baseline_id,
         checkpoint_id,
         presence_delta,
         consistency_delta,
         proof_delta,
         conversion_delta,
         maturity_delta,
         profiles_delta,
         source_delta,
         evidence_delta,
         reading,
         attribution,
         analogy,
         executive_summary,
         payload_json,
         created_at,
         updated_at`, [
        input.clientId,
        input.baselineId,
        input.checkpointId,
        input.presenceDelta,
        input.consistencyDelta,
        input.proofDelta,
        input.conversionDelta,
        input.maturityDelta,
        input.profilesDelta,
        input.sourceDelta,
        input.evidenceDelta,
        input.reading,
        input.attribution,
        input.analogy,
        input.executiveSummary,
        JSON.stringify(input.payload),
    ]);
    return result.rows[0];
});
