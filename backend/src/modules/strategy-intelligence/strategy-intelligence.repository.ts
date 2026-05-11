import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";

export type StrategyIntelligenceRow = {
  id: string;
  client_id: string;
  version: number;
  kind: string;
  source_analysis_id: string | null;
  status: string;
  payload_json: unknown;
  created_at: string;
  updated_at: string;
};

const TABLE_NAME = "strategy_intelligence_assets";
const STRATEGY_LIBRARY_TABLE_NAME = "strategy_library_strategies";
const STRATEGY_LIBRARY_SOURCE_TABLE_NAME = "strategy_library_sources";

let ensureTablePromise: Promise<void> | null = null;
let ensureLibraryTablePromise: Promise<void> | null = null;

const ensureTable = async () => {
  if (!isDatabaseConfigured()) return;

  if (!ensureTablePromise) {
    ensureTablePromise = (async () => {
      await query(
        `create table if not exists ${TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           client_id uuid not null references clients(id) on delete cascade,
           version integer not null,
           kind text not null,
           source_analysis_id uuid null references youtube_strategy_analyses(id) on delete set null,
           status text not null default 'active',
           payload_json jsonb not null default '{}'::jsonb,
           created_at timestamptz not null default now(),
           updated_at timestamptz not null default now(),
           unique (client_id, version, kind)
         )`,
      );

      await query(`create index if not exists ${TABLE_NAME}_client_version_idx on ${TABLE_NAME} (client_id, version desc)`);
      await query(`create index if not exists ${TABLE_NAME}_client_kind_idx on ${TABLE_NAME} (client_id, kind)`);

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
      ensureTablePromise = null;
      throw error;
    });
  }

  return ensureTablePromise;
};

export const listStrategyIntelligenceAssetsByClientId = async (clientId: string, limit = 20) => {
  await ensureTable();

  return query<StrategyIntelligenceRow>(
    `select id, client_id, version, kind, source_analysis_id, status, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where client_id = $1
     order by version desc,
              case kind
                when 'primary' then 0
                when 'alternative' then 1
                when 'plan_b' then 2
                else 3
              end asc,
              created_at desc
     limit $2`,
    [clientId, limit],
  );
};

export const listAllStrategyIntelligenceAssets = async () => {
  await ensureTable();

  return query<StrategyIntelligenceRow>(
    `select id, client_id, version, kind, source_analysis_id, status, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     order by created_at asc`,
  );
};

export const findLatestStrategyIntelligenceVersionByClientId = async (clientId: string) => {
  await ensureTable();

  return queryOne<{ version: number }>(
    `select max(version) as version
     from ${TABLE_NAME}
     where client_id = $1`,
    [clientId],
  );
};

export const listLatestStrategyIntelligenceAssetsByClientId = async (clientId: string) => {
  await ensureTable();

  const versionRow = await findLatestStrategyIntelligenceVersionByClientId(clientId);
  const version = Number(versionRow?.version ?? 0);

  if (!version) {
    return [];
  }

  return query<StrategyIntelligenceRow>(
    `select id, client_id, version, kind, source_analysis_id, status, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where client_id = $1
       and version = $2
     order by case kind
                when 'primary' then 0
                when 'alternative' then 1
                when 'plan_b' then 2
                else 3
              end asc,
              created_at asc`,
    [clientId, version],
  );
};

export const findStrategyIntelligenceAssetById = async (id: string) => {
  await ensureTable();

  return queryOne<StrategyIntelligenceRow>(
    `select id, client_id, version, kind, source_analysis_id, status, payload_json, created_at, updated_at
     from ${TABLE_NAME}
     where id = $1
     limit 1`,
    [id],
  );
};

export const createStrategyIntelligenceVersion = async (input: {
  clientId: string;
  sourceAnalysisId: string | null;
  status: string;
  assets: Array<{
    kind: "primary" | "alternative" | "plan_b";
    payload: Record<string, unknown>;
  }>;
}) => {
  await ensureTable();

  return withTransaction(async (client) => {
    const versionRow = await client.query<{ version: number }>(
      `select coalesce(max(version), 0) + 1 as version
       from ${TABLE_NAME}
       where client_id = $1`,
      [input.clientId],
    );

    const version = Number(versionRow.rows[0]?.version ?? 1);

    const created = [];

    for (const asset of input.assets) {
      const result = await client.query<StrategyIntelligenceRow>(
        `insert into ${TABLE_NAME} (client_id, version, kind, source_analysis_id, status, payload_json)
         values ($1, $2, $3, $4, $5, $6::jsonb)
         returning id, client_id, version, kind, source_analysis_id, status, payload_json, created_at, updated_at`,
        [input.clientId, version, asset.kind, input.sourceAnalysisId, input.status, JSON.stringify(asset.payload)],
      );

      if (result.rows[0]) {
        created.push(result.rows[0]);
      }
    }

    return { version, assets: created };
  });
};

export type StrategyLibraryRow = {
  id: string;
  strategy_key: string;
  strategy_name: string;
  strategy_summary: string;
  canonical_objective: string | null;
  canonical_funnel_stage: string | null;
  fit_band: string;
  fit_signals: unknown;
  source_count: number;
  last_source_analysis_id: string | null;
  last_source_client_id: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StrategyLibrarySourceRow = {
  id: string;
  strategy_id: string;
  legacy_asset_id: string;
  client_id: string;
  source_analysis_id: string | null;
  source_version: number;
  source_kind: string;
  source_payload_json: unknown;
  source_evidence_json: unknown;
  source_context_json: unknown;
  created_at: string;
  updated_at: string;
};

const ensureStrategyLibraryTables = async () => {
  if (!isDatabaseConfigured()) return;

  if (!ensureLibraryTablePromise) {
    ensureLibraryTablePromise = (async () => {
      await query(
        `create table if not exists ${STRATEGY_LIBRARY_TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           strategy_key text not null unique,
           strategy_name text not null,
           strategy_summary text not null,
           canonical_objective text null,
           canonical_funnel_stage text null,
           fit_band text not null,
           fit_signals jsonb not null default '[]'::jsonb,
           source_count integer not null default 0,
           last_source_analysis_id uuid null references youtube_strategy_analyses(id) on delete set null,
           last_source_client_id uuid null references clients(id) on delete set null,
           last_seen_at timestamptz null,
           created_at timestamptz not null default now(),
           updated_at timestamptz not null default now()
         )`,
      );

      await query(
        `create table if not exists ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME} (
           id uuid primary key default gen_random_uuid(),
           strategy_id uuid not null references ${STRATEGY_LIBRARY_TABLE_NAME}(id) on delete cascade,
           legacy_asset_id uuid not null unique references ${TABLE_NAME}(id) on delete cascade,
           client_id uuid not null references clients(id) on delete cascade,
           source_analysis_id uuid null references youtube_strategy_analyses(id) on delete set null,
           source_version integer not null,
           source_kind text not null,
           source_payload_json jsonb not null default '{}'::jsonb,
           source_evidence_json jsonb not null default '[]'::jsonb,
           source_context_json jsonb not null default '{}'::jsonb,
           created_at timestamptz not null default now(),
           updated_at timestamptz not null default now()
         )`,
      );

      await query(`create index if not exists ${STRATEGY_LIBRARY_TABLE_NAME}_fit_band_idx on ${STRATEGY_LIBRARY_TABLE_NAME} (fit_band)`);
      await query(`create index if not exists ${STRATEGY_LIBRARY_TABLE_NAME}_source_count_idx on ${STRATEGY_LIBRARY_TABLE_NAME} (source_count desc)`);
      await query(`create index if not exists ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME}_strategy_idx on ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME} (strategy_id)`);
      await query(`create index if not exists ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME}_client_idx on ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME} (client_id)`);

      await query(
        `do $$
         begin
           if not exists (
             select 1
             from pg_trigger
             where tgname = '${STRATEGY_LIBRARY_TABLE_NAME}_set_updated_at'
           ) then
             create trigger ${STRATEGY_LIBRARY_TABLE_NAME}_set_updated_at
             before update on ${STRATEGY_LIBRARY_TABLE_NAME}
             for each row execute function set_updated_at();
           end if;
         end $$;`,
      ).catch(() => undefined);

      await query(
        `do $$
         begin
           if not exists (
             select 1
             from pg_trigger
             where tgname = '${STRATEGY_LIBRARY_SOURCE_TABLE_NAME}_set_updated_at'
           ) then
             create trigger ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME}_set_updated_at
             before update on ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME}
             for each row execute function set_updated_at();
           end if;
         end $$;`,
      ).catch(() => undefined);
    })().catch((error) => {
      ensureLibraryTablePromise = null;
      throw error;
    });
  }

  return ensureLibraryTablePromise;
};

const normalizeStrategyLibraryKey = (strategyName: string, objective: string | null, funnelStage: string | null) =>
  [strategyName, objective, funnelStage]
    .map((value) =>
      String(value ?? "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("__");

const mergeJsonStringArray = (left: unknown, right: unknown) => {
  const values = new Set<string>();

  for (const input of [left, right]) {
    if (!Array.isArray(input)) continue;
    for (const item of input) {
      if (typeof item === "string" && item.trim()) {
        values.add(item.trim());
      }
    }
  }

  return [...values];
};

const buildLibraryStrategyPayload = (asset: StrategyIntelligenceRow) => {
  const payload = asset.payload_json as Record<string, unknown>;
  const strategy = (payload.strategy ?? {}) as Record<string, unknown>;
  const recommendation = (payload.recommendation ?? {}) as Record<string, unknown>;
  const fitSignals = Array.isArray(recommendation.fitSignals)
    ? (recommendation.fitSignals as unknown[]).map((signal) => (typeof signal === "string" ? signal : "")).filter(Boolean)
    : [];
  const sourceUrls = Array.isArray(recommendation.sourceUrls)
    ? (recommendation.sourceUrls as unknown[]).map((url) => (typeof url === "string" ? url : "")).filter(Boolean)
    : [];

  const strategyName = String(strategy.name ?? "Estratégia sem nome").trim();
  const strategySummary = String(strategy.summary ?? "Resumo objetivo indisponível").trim();
  const canonicalObjective = strategy.objective ? String(strategy.objective).trim() : null;
  const canonicalFunnelStage = strategy.funnelStage ? String(strategy.funnelStage).trim() : null;
  const strategyKey = normalizeStrategyLibraryKey(strategyName, canonicalObjective, canonicalFunnelStage);

  return {
    strategyKey,
    strategyName,
    strategySummary,
    canonicalObjective,
    canonicalFunnelStage,
    fitBand: String(strategy.fitBand ?? "recommended"),
    fitSignals,
    sourceUrls,
    evidence: Array.isArray(recommendation.evidence)
      ? (recommendation.evidence as unknown[]).map((item) => (typeof item === "string" ? item : "")).filter(Boolean)
      : [],
    sourceContext: {
      productContext: recommendation.productContext ?? null,
      serviceContext: recommendation.serviceContext ?? null,
      audienceContext: recommendation.audienceContext ?? null,
      funnelStage: recommendation.funnelStage ?? canonicalFunnelStage,
      objective: canonicalObjective,
    },
    payload,
  };
};

export const syncStrategyLibraryFromAssets = async (assets: StrategyIntelligenceRow[]) => {
  await ensureStrategyLibraryTables();

  return withTransaction(async (client) => {
    const syncedStrategyKeys = new Set<string>();

    for (const asset of assets) {
      const library = buildLibraryStrategyPayload(asset);

      const sourceExists = await client.query<{ id: string }>(
        `select id
         from ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME}
         where legacy_asset_id = $1
         limit 1`,
        [asset.id],
      );

      if (sourceExists.rows[0]) {
        continue;
      }

      const strategyUpsert = await client.query<StrategyLibraryRow>(
        `insert into ${STRATEGY_LIBRARY_TABLE_NAME} (
           strategy_key,
           strategy_name,
           strategy_summary,
           canonical_objective,
           canonical_funnel_stage,
           fit_band,
           fit_signals,
           source_count,
           last_source_analysis_id,
           last_source_client_id,
           last_seen_at
         )
         values ($1, $2, $3, $4, $5, $6, $7::jsonb, 1, $8, $9, now())
         on conflict (strategy_key) do update set
           strategy_name = excluded.strategy_name,
           strategy_summary = excluded.strategy_summary,
           canonical_objective = excluded.canonical_objective,
           canonical_funnel_stage = excluded.canonical_funnel_stage,
           fit_band = excluded.fit_band,
           fit_signals = excluded.fit_signals,
           source_count = ${STRATEGY_LIBRARY_TABLE_NAME}.source_count + 1,
           last_source_analysis_id = excluded.last_source_analysis_id,
           last_source_client_id = excluded.last_source_client_id,
           last_seen_at = now()
         returning id, strategy_key, strategy_name, strategy_summary, canonical_objective, canonical_funnel_stage, fit_band, fit_signals, source_count, last_source_analysis_id, last_source_client_id, last_seen_at, created_at, updated_at`,
        [
          library.strategyKey,
          library.strategyName,
          library.strategySummary,
          library.canonicalObjective,
          library.canonicalFunnelStage,
          library.fitBand,
          JSON.stringify(mergeJsonStringArray([], library.fitSignals)),
          asset.source_analysis_id,
          asset.client_id,
        ],
      );

      const strategyId = strategyUpsert.rows[0]?.id;
      if (!strategyId) {
        continue;
      }

      await client.query(
        `insert into ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME} (
           strategy_id,
           legacy_asset_id,
           client_id,
           source_analysis_id,
           source_version,
           source_kind,
           source_payload_json,
           source_evidence_json,
           source_context_json
         )
         values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb)`,
        [
          strategyId,
          asset.id,
          asset.client_id,
          asset.source_analysis_id,
          asset.version,
          asset.kind,
          JSON.stringify(library.payload),
          JSON.stringify(library.evidence),
          JSON.stringify(library.sourceContext),
        ],
      );

      syncedStrategyKeys.add(library.strategyKey);
    }

    return [...syncedStrategyKeys];
  });
};

export const listStrategyLibraryStrategies = async () => {
  await ensureStrategyLibraryTables();

  return query<StrategyLibraryRow>(
    `select id,
            strategy_key,
            strategy_name,
            strategy_summary,
            canonical_objective,
            canonical_funnel_stage,
            fit_band,
            fit_signals,
            source_count,
            last_source_analysis_id,
            last_source_client_id,
            last_seen_at,
            created_at,
            updated_at
     from ${STRATEGY_LIBRARY_TABLE_NAME}
     order by source_count desc, last_seen_at desc nulls last, strategy_name asc`,
  );
};

export const listStrategyLibraryStrategiesForClientId = async (clientId: string) => {
  await ensureStrategyLibraryTables();

  return query<StrategyLibraryRow>(
    `select s.id,
            s.strategy_key,
            s.strategy_name,
            s.strategy_summary,
            s.canonical_objective,
            s.canonical_funnel_stage,
            s.fit_band,
            s.fit_signals,
            s.source_count,
            s.last_source_analysis_id,
            s.last_source_client_id,
            s.last_seen_at,
            s.created_at,
            s.updated_at
     from ${STRATEGY_LIBRARY_TABLE_NAME} s
     where exists (
       select 1
       from ${STRATEGY_LIBRARY_SOURCE_TABLE_NAME} src
       where src.strategy_id = s.id
         and src.client_id = $1
     )
     order by s.source_count desc, s.last_seen_at desc nulls last, s.strategy_name asc`,
    [clientId],
  );
};
