import { query, queryOne, withTransaction } from "../../shared/db/database.js";

export type SocialIntelligenceSnapshotRow = {
  id: string;
  client_id: string;
  collected_at: string;
  public_only: boolean;
  confidence: number;
  presence_score: number | null;
  consistency_score: number | null;
  proof_score: number | null;
  conversion_readiness: number | null;
  main_gaps_json: unknown;
  opportunity_notes_json: unknown;
  raw_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialIntelligenceSourceRow = {
  id: string;
  snapshot_id: string;
  source_url: string;
  source_type: string;
  collected_at: string;
  confidence: number;
  notes: string | null;
};

export const listLatestSnapshotByClientId = async (clientId: string) =>
  queryOne<SocialIntelligenceSnapshotRow>(
    `select
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
     limit 1`,
    [clientId],
  );

export const findSocialIntelligenceSnapshotById = async (snapshotId: string) =>
  queryOne<SocialIntelligenceSnapshotRow>(
    `select
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
     where id = $1`,
    [snapshotId],
  );

export const createSnapshot = async (
  input: {
    clientId: string;
    publicOnly: boolean;
    confidence: number;
    presenceScore: number;
    consistencyScore: number;
    proofScore: number;
    conversionReadiness: number;
    mainGaps: string[];
    opportunityNotes: string[];
    rawNotes?: string;
  },
) =>
  withTransaction(async (client) => {
    const snapshotResult = await client.query<SocialIntelligenceSnapshotRow>(
      `insert into social_intelligence_snapshots (
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
         updated_at`,
      [
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
      ],
    );

    return snapshotResult.rows[0];
  });

export const createSnapshotSources = async (
  snapshotId: string,
  sources: Array<{
    sourceUrl: string;
    sourceType: string;
    confidence: number;
    notes?: string;
  }>,
) =>
  withTransaction(async (client) => {
    const inserted: SocialIntelligenceSourceRow[] = [];

    for (const source of sources) {
      const result = await client.query<SocialIntelligenceSourceRow>(
        `insert into social_intelligence_sources (snapshot_id, source_url, source_type, confidence, notes)
         values ($1, $2, $3, $4, $5)
         returning id, snapshot_id, source_url, source_type, collected_at, confidence, notes`,
        [snapshotId, source.sourceUrl, source.sourceType, source.confidence, source.notes ?? null],
      );

      inserted.push(result.rows[0]);
    }

    return inserted;
  });

export const listSnapshotSourcesBySnapshotId = async (snapshotId: string) =>
  query<SocialIntelligenceSourceRow>(
    `select id, snapshot_id, source_url, source_type, collected_at, confidence, notes
     from social_intelligence_sources
     where snapshot_id = $1
     order by collected_at asc, id asc`,
    [snapshotId],
  );

export const listSnapshotsByClientId = async (clientId: string) =>
  query<SocialIntelligenceSnapshotRow>(
    `select
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
     order by collected_at desc`,
    [clientId],
  );
