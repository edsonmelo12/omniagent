import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";

export type OfferProfileRow = {
  id: string;
  client_id: string;
  client_product_id: string;
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

const TABLE_NAME = "offer_profiles";

let ensureSchemaPromise: Promise<void> | null = null;

const ensureOfferProfileSchema = async () => {
  if (!isDatabaseConfigured()) {
    return;
  }

  if (!ensureSchemaPromise) {
    ensureSchemaPromise = (async () => {
      await query(
        `create table if not exists ${TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           client_id uuid not null references clients(id) on delete cascade,
           client_product_id text not null references client_products(id) on delete cascade,
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

      await query(`create unique index if not exists offer_profiles_product_version_idx on ${TABLE_NAME} (client_product_id, version)`);
      await query(`create index if not exists offer_profiles_client_collected_idx on ${TABLE_NAME} (client_id, created_at desc)`);
      await query(`create index if not exists offer_profiles_product_collected_idx on ${TABLE_NAME} (client_product_id, created_at desc)`);
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

const getNextVersion = async (productId: string) => {
  await ensureOfferProfileSchema();
  const row = await queryOne<{ version: number }>(
    `select coalesce(max(version), 0) + 1 as version
     from ${TABLE_NAME}
     where client_product_id = $1`,
    [productId],
  );

  return Number(row?.version ?? 1);
};

export const listOfferProfilesByClientId = async (clientId: string) =>
  (async () => {
    await ensureOfferProfileSchema();

    return query<OfferProfileRow>(
    `select
       id,
       client_id,
       client_product_id,
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

export const listOfferProfilesByProductId = async (productId: string) =>
  (async () => {
    await ensureOfferProfileSchema();

    return query<OfferProfileRow>(
    `select
       id,
       client_id,
       client_product_id,
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
     where client_product_id = $1
     order by version desc, created_at desc`,
    [productId],
    );
  })();

export const findLatestOfferProfileByClientId = async (clientId: string) =>
  (async () => {
    await ensureOfferProfileSchema();

    return queryOne<OfferProfileRow>(
    `select
       id,
       client_id,
       client_product_id,
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

export const findLatestOfferProfileByProductId = async (productId: string) =>
  (async () => {
    await ensureOfferProfileSchema();

    return queryOne<OfferProfileRow>(
    `select
       id,
       client_id,
       client_product_id,
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
     where client_product_id = $1
     order by version desc, created_at desc
     limit 1`,
    [productId],
    );
  })();

export const createOfferProfileVersion = async (input: {
  clientId: string;
  productId: string;
  sourceClientRecordId?: string | null;
  sourceMarketResearchId?: string | null;
  status: string;
  confidence: number;
  confirmed: Record<string, unknown>;
  inferred: Record<string, unknown>;
  proof: Record<string, unknown>;
}) =>
  withTransaction(async (client) => {
    await ensureOfferProfileSchema();
    const version = await getNextVersion(input.productId);
    const result = await client.query<OfferProfileRow>(
      `insert into ${TABLE_NAME} (
         client_id,
         client_product_id,
         source_client_record_id,
         source_market_research_id,
         version,
         status,
         confidence,
         confirmed_json,
         inferred_json,
         proof_json
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb)
       returning
         id,
         client_id,
         client_product_id,
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
        input.productId,
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
