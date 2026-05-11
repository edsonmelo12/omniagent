import { query, queryOne, withTransaction } from "../../shared/db/database.js";
export const listLatestSnapshotByClientId = async (clientId) => queryOne(`select
       id,
       client_id,
       collected_at,
       public_only,
       confidence,
       presence_score,
       consistency_score,
       proof_score,
       conversion_readiness,
       main_gaps_json,
       opportunity_notes_json,
       raw_notes,
       created_at,
       updated_at
     from social_intelligence_snapshots
     where client_id = $1
     order by collected_at desc
     limit 1`, [clientId]);
export const findSocialIntelligenceSnapshotById = async (snapshotId) => queryOne(`select
       id,
       client_id,
       collected_at,
       public_only,
       confidence,
       presence_score,
       consistency_score,
       proof_score,
       conversion_readiness,
       main_gaps_json,
       opportunity_notes_json,
       raw_notes,
       created_at,
       updated_at
     from social_intelligence_snapshots
     where id = $1`, [snapshotId]);
export const createSnapshot = async (input) => withTransaction(async (client) => {
    const snapshotResult = await client.query(`insert into social_intelligence_snapshots (
         client_id,
         public_only,
         confidence,
         presence_score,
         consistency_score,
         proof_score,
         conversion_readiness,
         main_gaps_json,
         opportunity_notes_json,
         raw_notes
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10)
       returning
         id,
         client_id,
         collected_at,
         public_only,
         confidence,
         presence_score,
         consistency_score,
         proof_score,
         conversion_readiness,
         main_gaps_json,
         opportunity_notes_json,
         raw_notes,
         created_at,
         updated_at`, [
        input.clientId,
        input.publicOnly,
        input.confidence,
        input.presenceScore,
        input.consistencyScore,
        input.proofScore,
        input.conversionReadiness,
        JSON.stringify(input.mainGaps),
        JSON.stringify(input.opportunityNotes),
        input.rawNotes ?? null,
    ]);
    return snapshotResult.rows[0];
});
export const createSnapshotSources = async (snapshotId, sources) => withTransaction(async (client) => {
    const inserted = [];
    for (const source of sources) {
        const result = await client.query(`insert into social_intelligence_sources (snapshot_id, source_url, source_type, confidence, notes)
         values ($1, $2, $3, $4, $5)
         returning id, snapshot_id, source_url, source_type, collected_at, confidence, notes`, [snapshotId, source.sourceUrl, source.sourceType, source.confidence, source.notes ?? null]);
        inserted.push(result.rows[0]);
    }
    return inserted;
});
export const listSnapshotSourcesBySnapshotId = async (snapshotId) => query(`select id, snapshot_id, source_url, source_type, collected_at, confidence, notes
     from social_intelligence_sources
     where snapshot_id = $1
     order by collected_at asc, id asc`, [snapshotId]);
export const listSnapshotsByClientId = async (clientId) => query(`select
       id,
       client_id,
       collected_at,
       public_only,
       confidence,
       presence_score,
       consistency_score,
       proof_score,
       conversion_readiness,
       main_gaps_json,
       opportunity_notes_json,
       raw_notes,
       created_at,
       updated_at
     from social_intelligence_snapshots
     where client_id = $1
     order by collected_at desc`, [clientId]);
