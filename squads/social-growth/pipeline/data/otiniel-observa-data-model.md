# Otiniel Observa - Data Model

## Purpose

Define the conceptual and implementation-oriented data model for `Otiniel Observa`.

## Design Principle

The model must support:
- raw evidence lineage
- normalized observations
- summary windows
- evidence quality inputs for analytics
- multi-client observation profiles and secret references

## Core Entities

### Observation Profile

Represents a client-connected source account that `Otiniel Observa` can collect from.

Fields:
- `observation_profile_id`
- `client_id`
- `provider`
- `channel`
- `profile_type`
- `account_ref`
- `property_ref` optional
- `organization_ref` optional
- `secret_ref`
- `status`
- `scopes`
- `last_validated_at` optional
- `notes` optional

### Evidence Source

Represents where a signal came from.

Fields:
- `source_id`
- `client_id`
- `observation_profile_id` optional
- `source_type`
- `provider_name`
- `account_ref`
- `access_mode`
- `status`

### Raw Evidence Record

Represents one collected provider or manual record before full normalization.

Fields:
- `raw_record_id`
- `source_id`
- `observation_profile_id` optional
- `collected_at`
- `period_start`
- `period_end`
- `payload_ref`
- `record_type`
- `asset_external_ref` optional
- `notes`

### Normalized Observation Record

Represents one platform-owned observation record after normalization.

Fields:
- `observation_id`
- `client_id`
- `observation_profile_id` optional
- `asset_id` optional
- `channel`
- `metric_name`
- `metric_value`
- `metric_unit`
- `period_start`
- `period_end`
- `evidence_level`
- `completeness_status`
- `raw_record_id`

### Observation Summary

Represents a grouped evidence package for downstream analytics.

Fields:
- `summary_id`
- `client_id`
- `observation_profile_ids`
- `asset_id` optional
- `window_type`
- `period_start`
- `period_end`
- `social_signals`
- `site_signals`
- `business_signals`
- `qualitative_signals`
- `source_count`
- `evidence_level`
- `completeness_status`
- `notes`

### Qualitative Evidence

Represents non-numeric structured observations.

Fields:
- `qualitative_id`
- `client_id`
- `observation_profile_id` optional
- `asset_id` optional
- `channel`
- `period_start`
- `period_end`
- `signal_type`
- `summary_text`
- `source_ref`
- `evidence_level`

## Enumerations

### Source Type

- `social_api`
- `site_analytics`
- `crm`
- `spreadsheet_import`
- `csv_upload`
- `manual_form`
- `screenshot_review`

### Window Type

- `asset`
- `weekly`
- `monthly`

### Completeness Status

- `complete`
- `partial`
- `minimal`
- `missing`

### Evidence Level

- `public_only`
- `authorized_export`
- `direct_api`
- `manual_confirmed`
- `derived`

### Provider

- `meta`
- `youtube`
- `ga4`
- `linkedin`
- `crm`
- `manual`
- `other`

### Observation Profile Status

- `pending`
- `active`
- `expired`
- `invalid`
- `revoked`

## Minimum Implementation Set

If implementation starts lean, create only:
- `observation_profiles`
- `evidence_sources`
- `raw_evidence_records`
- `normalized_observation_records`
- `observation_summaries`
- `qualitative_evidence`

## Join Requirements

The system must be able to join:
- observation profile -> evidence source
- source -> raw record
- raw record -> normalized observation
- observation -> summary
- summary -> client
- summary -> asset when applicable

## Governance Rule

Provider-specific fields should not leak into analytical contracts.
They may exist in raw records, but summaries and normalized records must use platform-owned names.
Per-client connected accounts must be modeled as observation profiles with `secret_ref`, not as standalone per-client environment variables.
