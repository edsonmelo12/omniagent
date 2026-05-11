# Otiniel Observa - Collection Architecture

## Purpose

Define how `Otiniel Observa` collects and consolidates evidence before passing it to `Atos Analista`.

## Core Rule

Collection, normalization and evidence qualification belong to `Otiniel Observa`.
Interpretation belongs to `Atos Analista`.

## Logical Layers

### 1. Source Connectors

Examples:
- Meta / Instagram / Facebook
- YouTube
- GA4
- LinkedIn when available
- CRM, when available
- spreadsheet imports
- manual evidence forms

Responsibilities:
- fetch or receive raw signals
- keep provider-specific fields intact at the ingestion edge
- authenticate through platform app credentials plus client-scoped observation profiles when required

### 1.5. Observation Profiles

Represents a client connection to a provider/account pair.

Responsibilities:
- bind collection to the correct client context
- store provider/account metadata required for collection
- reference secrets through `secret_ref`
- expose connection status, scopes and freshness

### 2. Raw Evidence Intake

Responsibilities:
- store source payload references
- preserve collection timestamp
- preserve provider and account identity
- mark whether the record came from API, export or manual confirmation
- preserve the observation profile used for collection when applicable

### 3. Normalization Layer

Responsibilities:
- map provider-specific metrics to platform-owned fields
- attach client, channel, asset and period references
- attach observation-profile context when the source is connector-driven
- detect completeness and structural gaps

### 4. Observation Summaries

Responsibilities:
- expose summarized records by:
  - asset
  - weekly period
  - monthly period
- group evidence into:
  - social
  - site
  - business
  - qualitative

### 5. Analyst Interface

Responsibilities:
- deliver normalized summaries to `Atos Analista`
- never include hidden interpretation

## Input Modes

### Manual Structured Input

Use for:
- screenshots
- CSV uploads
- spreadsheet imports
- CRM notes
- team-entered qualitative evidence

### Connector Input

Use for:
- recurring APIs
- scheduled fetches
- analytics exports with stable schemas

Connector input must always be linked to a client-owned observation profile.

## Summary Windows

### Asset Window

Use when evidence relates to one specific content item.

### Weekly Window

Use for operational adjustment.

### Monthly Window

Use for portfolio and strategy reads.

## Output Shape

Every normalized observation summary should carry:
- `client_id`
- `observation_profile_ids` when applicable
- `asset_id` when applicable
- `channel`
- `window_type`
- `period_start`
- `period_end`
- `social_signals`
- `site_signals`
- `business_signals`
- `qualitative_signals`
- `evidence_level`
- `completeness_status`
- `source_count`
- `notes`

## Evidence Quality Inputs

### Evidence Level

- `public_only`
- `authorized_export`
- `direct_api`
- `manual_confirmed`
- `derived`

### Completeness Status

- `complete`
- `partial`
- `minimal`
- `missing`

## Comparison Rule

Only compare windows that share:
- the same metric definition
- a compatible period boundary
- compatible evidence quality

## Anti-Patterns

Never:
- compare API data to inferred screenshot values as if they were equivalent
- hide the difference between manual and direct-api evidence
- push raw provider naming directly into analytical contracts

Always:
- preserve the source trail
- preserve the observation window
- keep normalization reversible

## Credential Model

### Global Application Credentials

Live at the platform level and identify the product to providers.

Examples:
- Meta app credentials
- Google OAuth app credentials
- LinkedIn app credentials
- enrichment/search provider credentials

### Client-Scoped Connected Accounts

Live as observation profiles.
They represent the real account/property/workspace being observed for a client.

Examples:
- one Instagram business account
- one GA4 property
- one CRM account, when available

These should never be represented as hardcoded per-client environment variables.

### Secret Resolution

Observation profiles should store a `secret_ref` instead of raw tokens in operating documents.
`Otiniel Observa` resolves the secret at runtime through the configured secret backend.
