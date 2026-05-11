import { isDatabaseConfigured, query, queryOne, withTransaction } from "../../shared/db/database.js";

const PROVIDER_VALUES = ["meta", "youtube", "ga4", "linkedin", "crm", "manual", "other"] as const;
const PROFILE_STATUS_VALUES = ["pending", "active", "expired", "invalid", "revoked"] as const;
const SOURCE_TYPE_VALUES = [
  "social_api",
  "site_analytics",
  "crm",
  "spreadsheet_import",
  "csv_upload",
  "manual_form",
  "screenshot_review",
] as const;
const ACCESS_MODE_VALUES = ["manual", "oauth", "api_token", "service_account", "import"] as const;
const TRIGGER_TYPE_VALUES = ["manual", "connector", "scheduled", "backfill"] as const;
const RUN_STATUS_VALUES = ["pending", "running", "completed", "failed", "cancelled"] as const;
const EVIDENCE_LEVEL_VALUES = ["public_only", "authorized_export", "direct_api", "manual_confirmed", "derived"] as const;
const COMPLETENESS_STATUS_VALUES = ["complete", "partial", "minimal", "missing"] as const;
const WINDOW_TYPE_VALUES = ["asset", "weekly", "monthly"] as const;

const sqlList = (values: readonly string[]) => values.map((value) => `'${value.replace(/'/g, "''")}'`).join(", ");

let schemaReady: Promise<void> | null = null;

export type ObservationProfileRow = {
  id: string;
  agency_id: string;
  client_id: string;
  provider: string;
  channel: string;
  profile_type: string;
  account_ref: string;
  property_ref: string | null;
  organization_ref: string | null;
  display_name: string | null;
  secret_ref: string;
  status: string;
  scopes: unknown;
  connection_metadata: unknown;
  last_validated_at: string | null;
  last_collected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ObservationRunRow = {
  id: string;
  agency_id: string;
  client_id: string;
  observation_profile_id: string | null;
  source_id: string | null;
  trigger_type: string;
  run_status: string;
  started_at: string;
  finished_at: string | null;
  records_received: number;
  records_normalized: number;
  error_code: string | null;
  error_message: string | null;
  run_metadata: unknown;
};

export type NormalizedObservationRecordRow = {
  id: string;
  agency_id: string;
  client_id: string;
  observation_profile_id: string | null;
  raw_evidence_record_id: string;
  raw_source_id: string;
  raw_record_type: string;
  raw_asset_external_ref: string | null;
  asset_id: string | null;
  channel: string;
  metric_name: string;
  metric_value: string;
  metric_unit: string;
  period_start: string;
  period_end: string;
  evidence_level: string;
  completeness_status: string;
  normalization_metadata: unknown;
  created_at: string;
};

export type QualitativeEvidenceRow = {
  id: string;
  agency_id: string;
  client_id: string;
  observation_profile_id: string | null;
  asset_id: string | null;
  channel: string;
  period_start: string;
  period_end: string;
  signal_type: string;
  summary_text: string;
  source_ref: string | null;
  evidence_level: string;
  created_at: string;
};

export type ObservationSummaryRow = {
  id: string;
  agency_id: string;
  client_id: string;
  asset_id: string | null;
  window_type: string;
  period_start: string;
  period_end: string;
  social_signals: unknown;
  site_signals: unknown;
  business_signals: unknown;
  qualitative_signals: unknown;
  observation_profile_ids: unknown;
  source_count: number;
  evidence_level: string;
  completeness_status: string;
  notes: string | null;
  generated_at: string;
};

const ensureOtinielObservaSchema = async () => {
  if (!isDatabaseConfigured()) {
    return;
  }

  if (!schemaReady) {
    schemaReady = (async () => {
      await query(`
        create table if not exists observation_profiles (
          id uuid primary key default gen_random_uuid(),
          agency_id uuid not null references agencies(id) on delete cascade,
          client_id uuid not null references clients(id) on delete cascade,
          provider text not null check (provider in (${sqlList(PROVIDER_VALUES)})),
          channel text not null,
          profile_type text not null default 'observation',
          account_ref text not null,
          property_ref text null,
          organization_ref text null,
          display_name text null,
          secret_ref text not null,
          status text not null check (status in (${sqlList(PROFILE_STATUS_VALUES)})),
          scopes jsonb not null default '[]'::jsonb check (jsonb_typeof(scopes) = 'array'),
          connection_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(connection_metadata) = 'object'),
          last_validated_at timestamptz null,
          last_collected_at timestamptz null,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          unique (client_id, provider, account_ref, profile_type)
        )
      `);

      await query(`
        create table if not exists evidence_sources (
          id uuid primary key default gen_random_uuid(),
          agency_id uuid not null references agencies(id) on delete cascade,
          client_id uuid not null references clients(id) on delete cascade,
          observation_profile_id uuid null references observation_profiles(id) on delete set null,
          source_type text not null check (source_type in (${sqlList(SOURCE_TYPE_VALUES)})),
          provider_name text not null check (provider_name in (${sqlList(PROVIDER_VALUES)})),
          account_ref text null,
          access_mode text not null check (access_mode in (${sqlList(ACCESS_MODE_VALUES)})),
          status text not null,
          source_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(source_metadata) = 'object'),
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);

      await query(`
        create table if not exists collection_runs (
          id uuid primary key default gen_random_uuid(),
          agency_id uuid not null references agencies(id) on delete cascade,
          client_id uuid not null references clients(id) on delete cascade,
          observation_profile_id uuid null references observation_profiles(id) on delete set null,
          source_id uuid null references evidence_sources(id) on delete set null,
          trigger_type text not null check (trigger_type in (${sqlList(TRIGGER_TYPE_VALUES)})),
          run_status text not null check (run_status in (${sqlList(RUN_STATUS_VALUES)})),
          started_at timestamptz not null,
          finished_at timestamptz null,
          records_received integer not null default 0 check (records_received >= 0),
          records_normalized integer not null default 0 check (records_normalized >= 0),
          error_code text null,
          error_message text null,
          run_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(run_metadata) = 'object'),
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `);

      await query(`
        create table if not exists raw_evidence_records (
          id uuid primary key default gen_random_uuid(),
          agency_id uuid not null references agencies(id) on delete cascade,
          client_id uuid not null references clients(id) on delete cascade,
          source_id uuid not null references evidence_sources(id) on delete restrict,
          observation_profile_id uuid null references observation_profiles(id) on delete set null,
          collection_run_id uuid null references collection_runs(id) on delete set null,
          collected_at timestamptz not null,
          period_start timestamptz not null,
          period_end timestamptz not null,
          record_type text not null,
          asset_external_ref text null,
          payload_ref text not null,
          payload_hash text null,
          notes text null,
          created_at timestamptz not null default now()
        )
      `);

      await query(`
        create table if not exists normalized_observation_records (
          id uuid primary key default gen_random_uuid(),
          agency_id uuid not null references agencies(id) on delete cascade,
          client_id uuid not null references clients(id) on delete cascade,
          observation_profile_id uuid null references observation_profiles(id) on delete set null,
          raw_evidence_record_id uuid not null references raw_evidence_records(id) on delete restrict,
          asset_id uuid null,
          channel text not null,
          metric_name text not null,
          metric_value numeric not null,
          metric_unit text not null,
          period_start timestamptz not null,
          period_end timestamptz not null,
          evidence_level text not null check (evidence_level in (${sqlList(EVIDENCE_LEVEL_VALUES)})),
          completeness_status text not null check (completeness_status in (${sqlList(COMPLETENESS_STATUS_VALUES)})),
          normalization_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(normalization_metadata) = 'object'),
          created_at timestamptz not null default now()
        )
      `);

      await query(`
        create table if not exists qualitative_evidence (
          id uuid primary key default gen_random_uuid(),
          agency_id uuid not null references agencies(id) on delete cascade,
          client_id uuid not null references clients(id) on delete cascade,
          observation_profile_id uuid null references observation_profiles(id) on delete set null,
          asset_id uuid null,
          channel text not null,
          period_start timestamptz not null,
          period_end timestamptz not null,
          signal_type text not null,
          summary_text text not null,
          source_ref text null,
          evidence_level text not null check (evidence_level in (${sqlList(EVIDENCE_LEVEL_VALUES)})),
          created_at timestamptz not null default now()
        )
      `);

      await query(`
        create table if not exists observation_summaries (
          id uuid primary key default gen_random_uuid(),
          agency_id uuid not null references agencies(id) on delete cascade,
          client_id uuid not null references clients(id) on delete cascade,
          asset_id uuid null,
          window_type text not null check (window_type in (${sqlList(WINDOW_TYPE_VALUES)})),
          period_start timestamptz not null,
          period_end timestamptz not null,
          social_signals jsonb not null default '{}'::jsonb check (jsonb_typeof(social_signals) = 'object'),
          site_signals jsonb not null default '{}'::jsonb check (jsonb_typeof(site_signals) = 'object'),
          business_signals jsonb not null default '{}'::jsonb check (jsonb_typeof(business_signals) = 'object'),
          qualitative_signals jsonb not null default '{}'::jsonb check (jsonb_typeof(qualitative_signals) = 'object'),
          observation_profile_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(observation_profile_ids) = 'array'),
          source_count integer not null default 0 check (source_count >= 0),
          evidence_level text not null check (evidence_level in (${sqlList(EVIDENCE_LEVEL_VALUES)})),
          completeness_status text not null check (completeness_status in (${sqlList(COMPLETENESS_STATUS_VALUES)})),
          notes text null,
          generated_at timestamptz not null default now(),
          unique (client_id, asset_id, window_type, period_start, period_end)
        )
      `);

      await query(`create index if not exists observation_profiles_agency_client_idx on observation_profiles (agency_id, client_id)`);
      await query(`create index if not exists observation_profiles_client_provider_channel_idx on observation_profiles (client_id, provider, channel)`);
      await query(`create index if not exists observation_profiles_secret_ref_idx on observation_profiles (secret_ref)`);
      await query(`create index if not exists evidence_sources_client_provider_idx on evidence_sources (client_id, provider_name)`);
      await query(`create index if not exists evidence_sources_profile_idx on evidence_sources (observation_profile_id)`);
      await query(`create index if not exists collection_runs_client_started_idx on collection_runs (client_id, started_at desc)`);
      await query(`create index if not exists collection_runs_profile_started_idx on collection_runs (observation_profile_id, started_at desc)`);
      await query(`create index if not exists raw_evidence_records_client_period_idx on raw_evidence_records (client_id, period_start, period_end)`);
      await query(`create index if not exists raw_evidence_records_collection_run_idx on raw_evidence_records (collection_run_id)`);
      await query(`create index if not exists raw_evidence_records_asset_external_ref_idx on raw_evidence_records (asset_external_ref)`);
      await query(`create index if not exists normalized_observation_records_client_channel_metric_idx on normalized_observation_records (client_id, channel, metric_name)`);
      await query(`create index if not exists normalized_observation_records_asset_period_idx on normalized_observation_records (asset_id, period_start)`);
      await query(`create index if not exists normalized_observation_records_profile_period_idx on normalized_observation_records (observation_profile_id, period_start)`);
      await query(`create index if not exists qualitative_evidence_client_signal_period_idx on qualitative_evidence (client_id, signal_type, period_start)`);
      await query(`create index if not exists qualitative_evidence_asset_period_idx on qualitative_evidence (asset_id, period_start)`);
      await query(`create index if not exists observation_summaries_client_window_period_idx on observation_summaries (client_id, window_type, period_start desc)`);

      await query(
        `do $$
         begin
           if not exists (
             select 1
             from pg_trigger
             where tgname = 'observation_profiles_set_updated_at'
           ) then
             create trigger observation_profiles_set_updated_at
             before update on observation_profiles
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
             where tgname = 'evidence_sources_set_updated_at'
           ) then
             create trigger evidence_sources_set_updated_at
             before update on evidence_sources
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
             where tgname = 'collection_runs_set_updated_at'
           ) then
             create trigger collection_runs_set_updated_at
             before update on collection_runs
             for each row execute function set_updated_at();
           end if;
         end $$;`,
      ).catch(() => undefined);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
};

export const listObservationProfilesByClientId = async (clientId: string) =>
  ensureOtinielObservaSchema().then(() =>
  query<ObservationProfileRow>(
    `select id, agency_id, client_id, provider, channel, profile_type, account_ref, property_ref, organization_ref, display_name, secret_ref, status, scopes, connection_metadata, last_validated_at, last_collected_at, created_at, updated_at
     from observation_profiles
     where client_id = $1
     order by created_at desc`,
    [clientId],
  ));

export const findObservationProfileById = async (profileId: string) =>
  ensureOtinielObservaSchema().then(() =>
  queryOne<ObservationProfileRow>(
    `select id, agency_id, client_id, provider, channel, profile_type, account_ref, property_ref, organization_ref, display_name, secret_ref, status, scopes, connection_metadata, last_validated_at, last_collected_at, created_at, updated_at
     from observation_profiles
     where id = $1`,
    [profileId],
  ));

export const createObservationProfileRow = async (input: {
  agencyId: string;
  clientId: string;
  provider: string;
  channel: string;
  profileType: string;
  accountRef: string;
  propertyRef?: string | null;
  organizationRef?: string | null;
  displayName?: string | null;
  secretRef: string;
  status: string;
  scopes: string[];
  connectionMetadata: Record<string, unknown>;
  lastValidatedAt?: string | null;
  lastCollectedAt?: string | null;
}) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<ObservationProfileRow>(
      `insert into observation_profiles (
         agency_id, client_id, provider, channel, profile_type, account_ref, property_ref, organization_ref,
         display_name, secret_ref, status, scopes, connection_metadata
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb)
       returning id, agency_id, client_id, provider, channel, profile_type, account_ref, property_ref, organization_ref, display_name, secret_ref, status, scopes, connection_metadata, last_validated_at, last_collected_at, created_at, updated_at`,
      [
        input.agencyId,
        input.clientId,
        input.provider,
        input.channel,
        input.profileType,
        input.accountRef,
        input.propertyRef ?? null,
        input.organizationRef ?? null,
        input.displayName ?? null,
        input.secretRef,
        input.status,
        JSON.stringify(input.scopes),
        JSON.stringify(input.connectionMetadata),
      ],
    );

    return result.rows[0];
  }));
export const updateObservationProfileRow = async (
  profileId: string,
  input: Partial<{
    displayName: string | null;
    status: string;
    propertyRef: string | null;
    organizationRef: string | null;
    scopes: string[];
    connectionMetadata: Record<string, unknown>;
    secretRef: string;
    lastValidatedAt: string | null;
    lastCollectedAt: string | null;
  }>,
) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<ObservationProfileRow>(
      `update observation_profiles
       set display_name = coalesce($2, display_name),
           status = coalesce($3, status),
           property_ref = coalesce($4, property_ref),
           organization_ref = coalesce($5, organization_ref),
         scopes = coalesce($6::jsonb, scopes),
         connection_metadata = coalesce($7::jsonb, connection_metadata),
         secret_ref = coalesce($8, secret_ref),
         last_validated_at = coalesce($9, last_validated_at),
         last_collected_at = coalesce($10, last_collected_at),
         updated_at = now()
       where id = $1
       returning id, agency_id, client_id, provider, channel, profile_type, account_ref, property_ref, organization_ref, display_name, secret_ref, status, scopes, connection_metadata, last_validated_at, last_collected_at, created_at, updated_at`,
      [
        profileId,
        input.displayName ?? null,
        input.status ?? null,
        input.propertyRef ?? null,
        input.organizationRef ?? null,
        input.scopes ? JSON.stringify(input.scopes) : null,
        input.connectionMetadata ? JSON.stringify(input.connectionMetadata) : null,
        input.secretRef ?? null,
        input.lastValidatedAt ?? null,
        input.lastCollectedAt ?? null,
      ],
    );

    return result.rows[0] ?? null;
  }));

export const listObservationSummariesByClientId = async (clientId: string) =>
  ensureOtinielObservaSchema().then(() =>
  query<ObservationSummaryRow>(
    `select id, agency_id, client_id, asset_id, window_type, period_start, period_end, social_signals, site_signals, business_signals, qualitative_signals, observation_profile_ids, source_count, evidence_level, completeness_status, notes, generated_at
     from observation_summaries
     where client_id = $1
     order by period_end desc, generated_at desc`,
    [clientId],
  ));

export const listObservationSummariesByClientIdWithWindow = async (
  clientId: string,
  input: Partial<{
    windowType: string;
    periodStart: string;
    periodEnd: string;
    assetId: string | null;
  }>,
) =>
  ensureOtinielObservaSchema().then(() => {
    const conditions = ["client_id = $1"];
    const params: unknown[] = [clientId];

    if (input.windowType) {
      params.push(input.windowType);
      conditions.push(`window_type = $${params.length}`);
    }

    if (input.periodStart) {
      params.push(input.periodStart);
      conditions.push(`period_start >= $${params.length}`);
    }

    if (input.periodEnd) {
      params.push(input.periodEnd);
      conditions.push(`period_end <= $${params.length}`);
    }

    if (input.assetId !== undefined) {
      params.push(input.assetId);
      conditions.push(`asset_id is not distinct from $${params.length}`);
    }

    return query<ObservationSummaryRow>(
      `select id, agency_id, client_id, asset_id, window_type, period_start, period_end, social_signals, site_signals, business_signals, qualitative_signals, observation_profile_ids, source_count, evidence_level, completeness_status, notes, generated_at
       from observation_summaries
       where ${conditions.join(" and ")}
       order by period_end desc, generated_at desc`,
      params,
    );
  });

export const listCollectionRunsByClientId = async (clientId: string) =>
  ensureOtinielObservaSchema().then(() =>
  query<ObservationRunRow>(
    `select id, agency_id, client_id, observation_profile_id, source_id, trigger_type, run_status, started_at, finished_at, records_received, records_normalized, error_code, error_message, run_metadata
     from collection_runs
     where client_id = $1
     order by started_at desc`,
    [clientId],
  ));

export const listCollectionRunsByClientIdWithFilters = async (
  clientId: string,
  input: Partial<{
    profileId: string;
    status: string;
    limit: number;
  }>,
) =>
  ensureOtinielObservaSchema().then(() => {
    const conditions = ["client_id = $1"];
    const params: unknown[] = [clientId];

    if (input.profileId) {
      params.push(input.profileId);
      conditions.push(`observation_profile_id = $${params.length}`);
    }

    if (input.status) {
      params.push(input.status);
      conditions.push(`run_status = $${params.length}`);
    }

    const limit = input.limit ?? 100;
    params.push(limit);

    return query<ObservationRunRow>(
      `select id, agency_id, client_id, observation_profile_id, source_id, trigger_type, run_status, started_at, finished_at, records_received, records_normalized, error_code, error_message, run_metadata
       from collection_runs
       where ${conditions.join(" and ")}
       order by started_at desc
       limit $${params.length}`,
      params,
    );
  });

export const findCollectionRunById = async (runId: string) =>
  ensureOtinielObservaSchema().then(() =>
  queryOne<ObservationRunRow>(
    `select id, agency_id, client_id, observation_profile_id, source_id, trigger_type, run_status, started_at, finished_at, records_received, records_normalized, error_code, error_message, run_metadata
     from collection_runs
     where id = $1`,
    [runId],
  ));

export const listNormalizedObservationRecordsByClientId = async (
  clientId: string,
  input: Partial<{
    periodStart: string;
    periodEnd: string;
    assetId: string | null;
    windowType: string;
  }>,
) =>
  ensureOtinielObservaSchema().then(() => {
    const conditions = ["nor.client_id = $1"];
    const params: unknown[] = [clientId];

    if (input.periodStart) {
      params.push(input.periodStart);
      conditions.push(`nor.period_start >= $${params.length}`);
    }

    if (input.periodEnd) {
      params.push(input.periodEnd);
      conditions.push(`nor.period_end <= $${params.length}`);
    }

    if (input.assetId !== undefined) {
      params.push(input.assetId);
      conditions.push(`nor.asset_id is not distinct from $${params.length}`);
    }

    if (input.windowType === "asset") {
      conditions.push("nor.asset_id is not null");
    }

    return query<NormalizedObservationRecordRow>(
      `select nor.id, nor.agency_id, nor.client_id, nor.observation_profile_id, nor.raw_evidence_record_id,
              rer.source_id as raw_source_id, rer.record_type as raw_record_type, rer.asset_external_ref as raw_asset_external_ref,
              nor.asset_id, nor.channel, nor.metric_name, nor.metric_value::text as metric_value, nor.metric_unit,
              nor.period_start, nor.period_end, nor.evidence_level, nor.completeness_status, nor.normalization_metadata, nor.created_at
       from normalized_observation_records nor
       join raw_evidence_records rer on rer.id = nor.raw_evidence_record_id
       where ${conditions.join(" and ")}
       order by nor.period_end desc, nor.created_at desc`,
      params,
    );
  });

export const listQualitativeEvidenceByClientId = async (
  clientId: string,
  input: Partial<{
    periodStart: string;
    periodEnd: string;
    assetId: string | null;
    windowType: string;
  }>,
) =>
  ensureOtinielObservaSchema().then(() => {
    const conditions = ["client_id = $1"];
    const params: unknown[] = [clientId];

    if (input.periodStart) {
      params.push(input.periodStart);
      conditions.push(`period_start >= $${params.length}`);
    }

    if (input.periodEnd) {
      params.push(input.periodEnd);
      conditions.push(`period_end <= $${params.length}`);
    }

    if (input.assetId !== undefined) {
      params.push(input.assetId);
      conditions.push(`asset_id is not distinct from $${params.length}`);
    }

    if (input.windowType === "asset") {
      conditions.push("asset_id is not null");
    }

    return query<QualitativeEvidenceRow>(
      `select id, agency_id, client_id, observation_profile_id, asset_id, channel, period_start, period_end, signal_type, summary_text, source_ref, evidence_level, created_at
       from qualitative_evidence
       where ${conditions.join(" and ")}
       order by period_end desc, created_at desc`,
      params,
    );
  });

export const createCollectionRunRow = async (input: {
  agencyId: string;
  clientId: string;
  observationProfileId?: string | null;
  sourceId?: string | null;
  triggerType: string;
  runStatus: string;
  startedAt: string;
  finishedAt?: string | null;
  recordsReceived?: number;
  recordsNormalized?: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  runMetadata?: Record<string, unknown>;
}) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<ObservationRunRow>(
      `insert into collection_runs (
         agency_id, client_id, observation_profile_id, source_id, trigger_type, run_status, started_at, finished_at,
         records_received, records_normalized, error_code, error_message, run_metadata
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb)
       returning id, agency_id, client_id, observation_profile_id, source_id, trigger_type, run_status, started_at, finished_at, records_received, records_normalized, error_code, error_message, run_metadata`,
      [
        input.agencyId,
        input.clientId,
        input.observationProfileId ?? null,
        input.sourceId ?? null,
        input.triggerType,
        input.runStatus,
        input.startedAt,
        input.finishedAt ?? null,
        input.recordsReceived ?? 0,
        input.recordsNormalized ?? 0,
        input.errorCode ?? null,
        input.errorMessage ?? null,
        JSON.stringify(input.runMetadata ?? {}),
      ],
    );

    return result.rows[0];
  }));

export const updateCollectionRunRow = async (
  runId: string,
  input: Partial<{
    runStatus: string;
    finishedAt: string | null;
    recordsReceived: number;
    recordsNormalized: number;
    errorCode: string | null;
    errorMessage: string | null;
    runMetadata: Record<string, unknown>;
  }>,
) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<ObservationRunRow>(
      `update collection_runs
       set run_status = coalesce($2, run_status),
           finished_at = coalesce($3, finished_at),
           records_received = coalesce($4, records_received),
           records_normalized = coalesce($5, records_normalized),
           error_code = coalesce($6, error_code),
           error_message = coalesce($7, error_message),
           run_metadata = coalesce($8::jsonb, run_metadata)
       where id = $1
       returning id, agency_id, client_id, observation_profile_id, source_id, trigger_type, run_status, started_at, finished_at, records_received, records_normalized, error_code, error_message, run_metadata`,
      [
        runId,
        input.runStatus ?? null,
        input.finishedAt ?? null,
        input.recordsReceived ?? null,
        input.recordsNormalized ?? null,
        input.errorCode ?? null,
        input.errorMessage ?? null,
        input.runMetadata ? JSON.stringify(input.runMetadata) : null,
      ],
    );

    return result.rows[0] ?? null;
  }));

export const createEvidenceSourceRow = async (input: {
  agencyId: string;
  clientId: string;
  observationProfileId?: string | null;
  sourceType: string;
  providerName: string;
  accountRef?: string | null;
  accessMode: string;
  status: string;
  sourceMetadata?: Record<string, unknown>;
}) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `insert into evidence_sources (
         agency_id, client_id, observation_profile_id, source_type, provider_name, account_ref, access_mode, status, source_metadata
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
       returning id, agency_id, client_id, observation_profile_id, source_type, provider_name, account_ref, access_mode, status, source_metadata, created_at, updated_at`,
      [
        input.agencyId,
        input.clientId,
        input.observationProfileId ?? null,
        input.sourceType,
        input.providerName,
        input.accountRef ?? null,
        input.accessMode,
        input.status,
        JSON.stringify(input.sourceMetadata ?? {}),
      ],
    );

    return result.rows[0];
  }));

export const createRawEvidenceRecordRow = async (input: {
  agencyId: string;
  clientId: string;
  sourceId: string;
  observationProfileId?: string | null;
  collectionRunId?: string | null;
  collectedAt: string;
  periodStart: string;
  periodEnd: string;
  recordType: string;
  assetExternalRef?: string | null;
  payloadRef: string;
  payloadHash?: string | null;
  notes?: string | null;
}) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `insert into raw_evidence_records (
         agency_id, client_id, source_id, observation_profile_id, collection_run_id, collected_at, period_start, period_end,
         record_type, asset_external_ref, payload_ref, payload_hash, notes
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       returning id`,
      [
        input.agencyId,
        input.clientId,
        input.sourceId,
        input.observationProfileId ?? null,
        input.collectionRunId ?? null,
        input.collectedAt,
        input.periodStart,
        input.periodEnd,
        input.recordType,
        input.assetExternalRef ?? null,
        input.payloadRef,
        input.payloadHash ?? null,
        input.notes ?? null,
      ],
    );

    return result.rows[0];
  }));

export const createNormalizedObservationRecordRow = async (input: {
  agencyId: string;
  clientId: string;
  observationProfileId?: string | null;
  rawEvidenceRecordId: string;
  assetId?: string | null;
  channel: string;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  periodStart: string;
  periodEnd: string;
  evidenceLevel: string;
  completenessStatus: string;
  normalizationMetadata?: Record<string, unknown>;
}) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `insert into normalized_observation_records (
         agency_id, client_id, observation_profile_id, raw_evidence_record_id, asset_id, channel, metric_name, metric_value, metric_unit,
         period_start, period_end, evidence_level, completeness_status, normalization_metadata
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb)
       returning id`,
      [
        input.agencyId,
        input.clientId,
        input.observationProfileId ?? null,
        input.rawEvidenceRecordId,
        input.assetId ?? null,
        input.channel,
        input.metricName,
        input.metricValue,
        input.metricUnit,
        input.periodStart,
        input.periodEnd,
        input.evidenceLevel,
        input.completenessStatus,
        JSON.stringify(input.normalizationMetadata ?? {}),
      ],
    );

    return result.rows[0];
  }));

export const createQualitativeEvidenceRow = async (input: {
  agencyId: string;
  clientId: string;
  observationProfileId?: string | null;
  assetId?: string | null;
  channel: string;
  periodStart: string;
  periodEnd: string;
  signalType: string;
  summaryText: string;
  sourceRef?: string | null;
  evidenceLevel: string;
}) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `insert into qualitative_evidence (
         agency_id, client_id, observation_profile_id, asset_id, channel, period_start, period_end, signal_type, summary_text, source_ref, evidence_level
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       returning id`,
      [
        input.agencyId,
        input.clientId,
        input.observationProfileId ?? null,
        input.assetId ?? null,
        input.channel,
        input.periodStart,
        input.periodEnd,
        input.signalType,
        input.summaryText,
        input.sourceRef ?? null,
        input.evidenceLevel,
      ],
    );

    return result.rows[0];
  }));

export const createObservationSummaryRow = async (input: {
  agencyId: string;
  clientId: string;
  assetId?: string | null;
  windowType: string;
  periodStart: string;
  periodEnd: string;
  socialSignals?: Record<string, unknown>;
  siteSignals?: Record<string, unknown>;
  businessSignals?: Record<string, unknown>;
  qualitativeSignals?: Record<string, unknown>;
  observationProfileIds?: string[];
  sourceCount?: number;
  evidenceLevel: string;
  completenessStatus: string;
  notes?: string | null;
}) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<{ id: string }>(
      `insert into observation_summaries (
         agency_id, client_id, asset_id, window_type, period_start, period_end, social_signals, site_signals, business_signals,
         qualitative_signals, observation_profile_ids, source_count, evidence_level, completeness_status, notes
       )
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13,$14,$15)
       returning id`,
      [
        input.agencyId,
        input.clientId,
        input.assetId ?? null,
        input.windowType,
        input.periodStart,
        input.periodEnd,
        JSON.stringify(input.socialSignals ?? {}),
        JSON.stringify(input.siteSignals ?? {}),
        JSON.stringify(input.businessSignals ?? {}),
        JSON.stringify(input.qualitativeSignals ?? {}),
        JSON.stringify(input.observationProfileIds ?? []),
        input.sourceCount ?? 0,
        input.evidenceLevel,
        input.completenessStatus,
        input.notes ?? null,
      ],
    );

    return result.rows[0];
  }));

export const upsertObservationSummaryRow = async (input: {
  agencyId: string;
  clientId: string;
  assetId?: string | null;
  windowType: string;
  periodStart: string;
  periodEnd: string;
  socialSignals?: Record<string, unknown>;
  siteSignals?: Record<string, unknown>;
  businessSignals?: Record<string, unknown>;
  qualitativeSignals?: Record<string, unknown>;
  observationProfileIds?: string[];
  sourceCount?: number;
  evidenceLevel: string;
  completenessStatus: string;
  notes?: string | null;
}) =>
  ensureOtinielObservaSchema().then(() =>
  withTransaction(async (client) => {
    const result = await client.query<ObservationSummaryRow>(
      `insert into observation_summaries (
         agency_id, client_id, asset_id, window_type, period_start, period_end, social_signals, site_signals, business_signals,
         qualitative_signals, observation_profile_ids, source_count, evidence_level, completeness_status, notes
       )
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13,$14,$15)
       on conflict (client_id, asset_id, window_type, period_start, period_end)
       do update set
         agency_id = excluded.agency_id,
         social_signals = excluded.social_signals,
         site_signals = excluded.site_signals,
         business_signals = excluded.business_signals,
         qualitative_signals = excluded.qualitative_signals,
         observation_profile_ids = excluded.observation_profile_ids,
         source_count = excluded.source_count,
         evidence_level = excluded.evidence_level,
         completeness_status = excluded.completeness_status,
         notes = excluded.notes,
         generated_at = now()
       returning id, agency_id, client_id, asset_id, window_type, period_start, period_end, social_signals, site_signals, business_signals, qualitative_signals, observation_profile_ids, source_count, evidence_level, completeness_status, notes, generated_at`,
      [
        input.agencyId,
        input.clientId,
        input.assetId ?? null,
        input.windowType,
        input.periodStart,
        input.periodEnd,
        JSON.stringify(input.socialSignals ?? {}),
        JSON.stringify(input.siteSignals ?? {}),
        JSON.stringify(input.businessSignals ?? {}),
        JSON.stringify(input.qualitativeSignals ?? {}),
        JSON.stringify(input.observationProfileIds ?? []),
        input.sourceCount ?? 0,
        input.evidenceLevel,
        input.completenessStatus,
        input.notes ?? null,
      ],
    );

    return result.rows[0];
  }));
