# Otiniel Observa - Relational Schema

## Purpose

Define the first relational schema required to implement `Otiniel Observa` in PostgreSQL.

## Schema Principles

- tenant-aware at every level
- profile-based connector ownership
- source lineage preserved
- summaries derived from raw and normalized records
- no raw provider credentials stored in relational rows

## Core Tables

### `observation_profiles`

Represents a client-owned observation connection.

Columns:
- `id` uuid primary key
- `agency_id` uuid not null
- `client_id` uuid not null
- `provider` text not null
- `channel` text not null
- `profile_type` text not null default `observation`
- `account_ref` text not null
- `property_ref` text null
- `organization_ref` text null
- `display_name` text null
- `secret_ref` text not null
- `status` text not null
- `scopes` jsonb not null default `'[]'::jsonb`
- `connection_metadata` jsonb not null default `'{}'::jsonb`
- `last_validated_at` timestamptz null
- `last_collected_at` timestamptz null
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Indexes:
- `(agency_id, client_id)`
- `(client_id, provider, channel)`
- unique `(client_id, provider, account_ref, profile_type)`

### `evidence_sources`

Represents a concrete source stream linked to one profile or manual source.

Columns:
- `id` uuid primary key
- `agency_id` uuid not null
- `client_id` uuid not null
- `observation_profile_id` uuid null references `observation_profiles(id)`
- `source_type` text not null
- `provider_name` text not null
- `account_ref` text null
- `access_mode` text not null
- `status` text not null
- `source_metadata` jsonb not null default `'{}'::jsonb`
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Indexes:
- `(client_id, provider_name)`
- `(observation_profile_id)`

### `collection_runs`

Represents one execution of manual intake or connector collection.

Columns:
- `id` uuid primary key
- `agency_id` uuid not null
- `client_id` uuid not null
- `observation_profile_id` uuid null references `observation_profiles(id)`
- `source_id` uuid null references `evidence_sources(id)`
- `trigger_type` text not null
- `run_status` text not null
- `started_at` timestamptz not null
- `finished_at` timestamptz null
- `records_received` integer not null default 0
- `records_normalized` integer not null default 0
- `error_code` text null
- `error_message` text null
- `run_metadata` jsonb not null default `'{}'::jsonb`

Indexes:
- `(client_id, started_at desc)`
- `(observation_profile_id, started_at desc)`

### `raw_evidence_records`

Stores pre-normalization evidence.

Columns:
- `id` uuid primary key
- `agency_id` uuid not null
- `client_id` uuid not null
- `source_id` uuid not null references `evidence_sources(id)`
- `observation_profile_id` uuid null references `observation_profiles(id)`
- `collection_run_id` uuid null references `collection_runs(id)`
- `collected_at` timestamptz not null
- `period_start` timestamptz not null
- `period_end` timestamptz not null
- `record_type` text not null
- `asset_external_ref` text null
- `payload_ref` text not null
- `payload_hash` text null
- `notes` text null
- `created_at` timestamptz not null default now()

Indexes:
- `(client_id, period_start, period_end)`
- `(collection_run_id)`
- `(asset_external_ref)`

### `normalized_observation_records`

Stores platform-owned metric records after normalization.

Columns:
- `id` uuid primary key
- `agency_id` uuid not null
- `client_id` uuid not null
- `observation_profile_id` uuid null references `observation_profiles(id)`
- `raw_evidence_record_id` uuid not null references `raw_evidence_records(id)`
- `asset_id` uuid null
- `channel` text not null
- `metric_name` text not null
- `metric_value` numeric not null
- `metric_unit` text not null
- `period_start` timestamptz not null
- `period_end` timestamptz not null
- `evidence_level` text not null
- `completeness_status` text not null
- `normalization_metadata` jsonb not null default `'{}'::jsonb`
- `created_at` timestamptz not null default now()

Indexes:
- `(client_id, channel, metric_name)`
- `(asset_id, period_start)`
- `(observation_profile_id, period_start)`

### `qualitative_evidence`

Stores structured qualitative signals.

Columns:
- `id` uuid primary key
- `agency_id` uuid not null
- `client_id` uuid not null
- `observation_profile_id` uuid null references `observation_profiles(id)`
- `asset_id` uuid null
- `channel` text not null
- `period_start` timestamptz not null
- `period_end` timestamptz not null
- `signal_type` text not null
- `summary_text` text not null
- `source_ref` text null
- `evidence_level` text not null
- `created_at` timestamptz not null default now()

Indexes:
- `(client_id, signal_type, period_start)`
- `(asset_id, period_start)`

### `observation_summaries`

Stores derived grouped views for the analyst layer.

Columns:
- `id` uuid primary key
- `agency_id` uuid not null
- `client_id` uuid not null
- `asset_id` uuid null
- `window_type` text not null
- `period_start` timestamptz not null
- `period_end` timestamptz not null
- `social_signals` jsonb not null default `'{}'::jsonb`
- `site_signals` jsonb not null default `'{}'::jsonb`
- `business_signals` jsonb not null default `'{}'::jsonb`
- `qualitative_signals` jsonb not null default `'{}'::jsonb`
- `observation_profile_ids` jsonb not null default `'[]'::jsonb`
- `source_count` integer not null default 0
- `evidence_level` text not null
- `completeness_status` text not null
- `notes` text null
- `generated_at` timestamptz not null default now()

Indexes:
- unique `(client_id, asset_id, window_type, period_start, period_end)`
- `(client_id, window_type, period_start desc)`

## Recommended Enums

- `provider`: `meta`, `youtube`, `ga4`, `linkedin`, `crm`, `manual`, `other`
- `profile_status`: `pending`, `active`, `expired`, `invalid`, `revoked`
- `source_type`: `social_api`, `site_analytics`, `crm`, `spreadsheet_import`, `csv_upload`, `manual_form`, `screenshot_review`
- `access_mode`: `manual`, `oauth`, `api_token`, `service_account`, `import`
- `window_type`: `asset`, `weekly`, `monthly`
- `evidence_level`: `public_only`, `authorized_export`, `direct_api`, `manual_confirmed`, `derived`
- `completeness_status`: `complete`, `partial`, `minimal`, `missing`

## Foreign-Key Expectations

- `agency_id` and `client_id` should align with the core multi-agency/client model
- `asset_id` should join to the publishing/content asset model when available
- `observation_profile_id` should be optional for manual evidence

## Non-Goals

This schema does not store:
- raw provider tokens
- analytical verdicts
- strategic recommendations
- publishing credentials
