import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";

export type CreativeProfileRow = {
  id: string;
  client_id: string;
  source_brand_profile_id: string | null;
  source_offer_profile_id: string | null;
  source_snapshot_id: string | null;
  source_client_record_id: string | null;
  source_market_research_id: string | null;
  version: number;
  status: string;
  confidence: number;
  confirmed_json: unknown;
  inferred_json: unknown;
  proof_json: unknown;
  created_at: string;
  updated_at: string;
};

export type CreativeProfileSourceRow = {
  id: string;
  creative_profile_id: string;
  source_url: string;
  source_type: string;
  collected_at: string;
  confidence: number;
  notes: string | null;
};

const TABLE_NAME = "creative_profiles";
const SOURCES_TABLE_NAME = "creative_profile_sources";

let ensureSchemaPromise: Promise<void> | null = null;

const ensureCreativeProfileSchema = async () => {
  if (!isDatabaseConfigured()) {
    return;
  }

  if (!ensureSchemaPromise) {
    ensureSchemaPromise = (async () => {
      await query(
        `create table if not exists ${TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           client_id uuid not null references clients(id) on delete cascade,
           source_brand_profile_id uuid references brand_profiles(id) on delete set null,
           source_offer_profile_id uuid references offer_profiles(id) on delete set null,
           source_snapshot_id uuid references social_intelligence_snapshots(id) on delete set null,
           source_client_record_id uuid references client_briefs(id) on delete set null,
           source_market_research_id uuid references market_researches(id) on delete set null,
           version integer not null,
           status text not null default 'draft' check (status in ('draft', 'review', 'approved')),
           confidence integer not null default 50 check (confidence >= 0 and confidence <= 100),
           confirmed_json jsonb not null default '{}'::jsonb,
           inferred_json jsonb not null default '{}'::jsonb,
           proof_json jsonb not null default '{}'::jsonb,
           created_at timestamptz not null default now(),
           updated_at timestamptz not null default now()
         )`,
      );

      await query(
        `create table if not exists ${SOURCES_TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           creative_profile_id uuid not null references ${TABLE_NAME}(id) on delete cascade,
           source_url text not null,
           source_type text not null,
           collected_at timestamptz not null default now(),
           confidence integer not null default 100 check (confidence >= 0 and confidence <= 100),
           notes text
         )`,
      );

      await query(`create unique index if not exists ${TABLE_NAME}_client_version_idx on ${TABLE_NAME} (client_id, version)`);
      await query(`create index if not exists ${TABLE_NAME}_client_collected_idx on ${TABLE_NAME} (client_id, created_at desc)`);
      await query(`create index if not exists ${SOURCES_TABLE_NAME}_profile_idx on ${SOURCES_TABLE_NAME} (creative_profile_id)`);
      await query(
        `do $$
         begin
           if not exists (
             select 1
             from pg_trigger
             where tgname = '${TABLE_NAME}_set_updated_at'
           ) then
             create trigger ${TABLE_NAME}_set_updated_at
             before update on ${TABLE_NAME}
             for each row execute function set_updated_at();
           end if;
         end $$;`,
      ).catch(() => undefined);
    })().catch((error) => {
      ensureSchemaPromise = null;
      throw error;
    });
  }

  return ensureSchemaPromise;
};

const getNextVersion = async (clientId: string) => {
  await ensureCreativeProfileSchema();
  const row = await queryOne<{ version: number }>(
    `select coalesce(max(version), 0) + 1 as version
     from ${TABLE_NAME}
     where client_id = $1`,
    [clientId],
  );

  return Number(row?.version ?? 1);
};

export const listCreativeProfilesByClientId = async (clientId: string) =>
  (async () => {
    await ensureCreativeProfileSchema();

    return query<CreativeProfileRow>(
      `select
         id,
         client_id,
         source_brand_profile_id,
         source_offer_profile_id,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         version,
         status,
         confidence,
         confirmed_json,
         inferred_json,
         proof_json,
         created_at,
         updated_at
       from ${TABLE_NAME}
       where client_id = $1
       order by version desc, created_at desc`,
      [clientId],
    );
  })();

export const findLatestCreativeProfileByClientId = async (clientId: string) =>
  (async () => {
    await ensureCreativeProfileSchema();

    return queryOne<CreativeProfileRow>(
      `select
         id,
         client_id,
         source_brand_profile_id,
         source_offer_profile_id,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         version,
         status,
         confidence,
         confirmed_json,
         inferred_json,
         proof_json,
         created_at,
         updated_at
       from ${TABLE_NAME}
       where client_id = $1
       order by version desc, created_at desc
       limit 1`,
      [clientId],
    );
  })();

export const listCreativeProfileSourcesByCreativeProfileId = async (creativeProfileId: string) =>
  (async () => {
    await ensureCreativeProfileSchema();

    return query<CreativeProfileSourceRow>(
      `select
         id,
         creative_profile_id,
         source_url,
         source_type,
         collected_at,
         confidence,
         notes
       from ${SOURCES_TABLE_NAME}
       where creative_profile_id = $1
       order by collected_at asc, id asc`,
      [creativeProfileId],
    );
  })();

export const createCreativeProfileVersion = async (input: {
  clientId: string;
  sourceBrandProfileId?: string | null;
  sourceOfferProfileId?: string | null;
  sourceSnapshotId?: string | null;
  sourceClientRecordId?: string | null;
  sourceMarketResearchId?: string | null;
  status: string;
  confidence: number;
  confirmed: Record<string, unknown>;
  inferred: Record<string, unknown>;
  proof: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    await ensureCreativeProfileSchema();
    const version = await getNextVersion(input.clientId);
    const result = await client.query<CreativeProfileRow>(
      `insert into ${TABLE_NAME} (
         client_id,
         source_brand_profile_id,
         source_offer_profile_id,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         version,
         status,
         confidence,
         confirmed_json,
         inferred_json,
         proof_json
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12::jsonb)
       returning
         id,
         client_id,
         source_brand_profile_id,
         source_offer_profile_id,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         version,
         status,
         confidence,
         confirmed_json,
         inferred_json,
         proof_json,
         created_at,
         updated_at`,
      [
        input.clientId,
        input.sourceBrandProfileId ?? null,
        input.sourceOfferProfileId ?? null,
        input.sourceSnapshotId ?? null,
        input.sourceClientRecordId ?? null,
        input.sourceMarketResearchId ?? null,
        version,
        input.status,
        input.confidence,
        JSON.stringify(input.confirmed),
        JSON.stringify(input.inferred),
        JSON.stringify(input.proof),
      ],
    );

    return result.rows[0];
  });

export const updateCreativeProfileVersion = async (input: {
  clientId: string;
  sourceBrandProfileId?: string | null;
  sourceOfferProfileId?: string | null;
  sourceSnapshotId?: string | null;
  sourceClientRecordId?: string | null;
  sourceMarketResearchId?: string | null;
  status: string;
  confidence: number;
  confirmed: Record<string, unknown>;
  inferred: Record<string, unknown>;
  proof: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    await ensureCreativeProfileSchema();
    const version = await getNextVersion(input.clientId);
    const result = await client.query<CreativeProfileRow>(
      `insert into ${TABLE_NAME} (
         client_id,
         source_brand_profile_id,
         source_offer_profile_id,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         version,
         status,
         confidence,
         confirmed_json,
         inferred_json,
         proof_json
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12::jsonb)
       returning
         id,
         client_id,
         source_brand_profile_id,
         source_offer_profile_id,
         source_snapshot_id,
         source_client_record_id,
         source_market_research_id,
         version,
         status,
         confidence,
         confirmed_json,
         inferred_json,
         proof_json,
         created_at,
         updated_at`,
      [
        input.clientId,
        input.sourceBrandProfileId ?? null,
        input.sourceOfferProfileId ?? null,
        input.sourceSnapshotId ?? null,
        input.sourceClientRecordId ?? null,
        input.sourceMarketResearchId ?? null,
        version,
        input.status,
        input.confidence,
        JSON.stringify(input.confirmed),
        JSON.stringify(input.inferred),
        JSON.stringify(input.proof),
      ],
    );

    return result.rows[0];
  });

export const createCreativeProfileSources = async (
  creativeProfileId: string,
  sources: Array<{
    sourceUrl: string;
    sourceType: string;
    confidence: number;
    notes?: string;
  }>,
) =>
  withTransaction(async (client) => {
    await ensureCreativeProfileSchema();

    const inserted: CreativeProfileSourceRow[] = [];

    for (const source of sources) {
      const result = await client.query<CreativeProfileSourceRow>(
        `insert into ${SOURCES_TABLE_NAME} (
           creative_profile_id,
           source_url,
           source_type,
           confidence,
           notes
         )
         values ($1, $2, $3, $4, $5)
         returning id, creative_profile_id, source_url, source_type, collected_at, confidence, notes`,
        [creativeProfileId, source.sourceUrl, source.sourceType, source.confidence, source.notes ?? null],
      );

      inserted.push(result.rows[0]);
    }

    return inserted;
  });
