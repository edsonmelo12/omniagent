# Atos Analista - Observation Layer

## Purpose

Define how `Atos Analista` receives evidence.
This layer exists to separate data collection from analysis.

`Atos Analista` should be a disciplined consumer of observations, not a free-form scraper.
For multi-client operation, that means it consumes client-scoped observation contracts from `Otiniel Observa`.

## Core Rule

Observation and interpretation must not be fused.

The observation layer is responsible for:
- collecting
- normalizing
- timestamping
- scoring completeness
- reporting missing data
- managing client/provider observation profiles
- resolving provider access through `secret_ref`

The analyst layer is responsible for:
- interpreting
- prioritizing
- recommending

## Evidence Classes

### 1. Social Performance

Examples:
- reach
- impressions
- saves
- shares
- comments
- profile visits
- link clicks
- video views
- completion rate
- average watch time

### 2. Site / Discoverability Performance

Examples:
- sessions
- engaged users
- engagement time
- source / medium
- campaign
- landing page
- key events
- conversions

### 3. Business Signals

Examples:
- leads
- meetings
- opportunities
- proposal requests
- revenue influence
- funnel stage progression

### 4. Qualitative Signals

Examples:
- direct messages
- comment quality
- objections
- repeated questions
- sales feedback
- support feedback

## Collection Maturity Model

### Level 1 - Structured Manual Intake

Sources:
- CSV exports
- spreadsheets
- screenshots
- manually curated forms
- notes from execution or sales

Use when:
- channels are not integrated yet
- data volume is low
- the goal is fast validation

### Level 2 - Authorized Connectors

Sources:
- Meta Graph / Instagram / Facebook
- YouTube APIs
- GA4
- approved LinkedIn sources
- CRM exports or APIs

Use when:
- provider access is stable
- refresh cadence matters
- recurring weekly reporting is required

### Level 3 - Consolidated Observation Store

Sources feed into one normalized layer before the analyst consumes them.

This is the target state.

Benefits:
- one evidence contract
- better auditability
- simpler analytical logic
- clear separation of responsibility
- no direct client credential handling in the analyst layer

## Observation Contract

Every observation should answer:
- what asset or entity does this belong to?
- from which source did it come?
- through which observation profile was it collected?
- which period does it cover?
- what is the metric value?
- how complete is the evidence?
- how trustworthy is the source?

## Minimum Observation Fields

- `source_type`
- `source_name`
- `collected_at`
- `period_start`
- `period_end`
- `client_id`
- `observation_profile_id` when available
- `asset_id` when available
- `channel`
- `metric_name`
- `metric_value`
- `metric_unit`
- `evidence_level`
- `completeness_status`
- `notes`

## Sensitivity Rule for Atos Consumption

`Atos Analista` must consume only aggregated and client-scoped signals.

Allowed:
- counts
- rates
- standardized dimensions
- completeness and evidence metadata

Blocked:
- personal identifiers
- raw textual user content
- secrets and credential references

Any blocked field in the incoming payload invalidates the analytical read.

## Evidence Levels

- `public_only`
- `authorized_export`
- `direct_api`
- `manually_confirmed`
- `derived`

## Completeness Status

- `complete`
- `partial`
- `minimal`
- `missing`

## Confidence Input Rule

The observation layer does not assign final analytical confidence.
It only provides raw evidence quality signals that the analyst may use.

## Recommended Storage Shape

Use a normalized event-plus-summary model:
- asset observation records
- weekly summaries
- monthly summaries
- qualitative evidence records
- business signal records
- observation profile references

## Anti-Patterns

Never:
- mix inferred meaning into raw observation records
- overwrite provider values with interpretation
- hide missing data
- claim business impact without source trail
- bypass `Otiniel Observa` to fetch provider data directly from inside `Atos Analista`

Always:
- preserve the origin of the signal
- preserve the observation window
- preserve whether the data is partial or confirmed
- preserve client/profile context for multi-client safety
