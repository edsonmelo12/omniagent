# ADR - Otiniel Observa As Observation Layer

## Title

ADR-OTINIEL-001 - Introduce `Otiniel Observa` as the observation layer between `social-growth` and `Atos Analista`

## Status

Accepted at the product-design level

## Context

`Atos Analista` requires normalized, auditable evidence.
If it collects raw signals directly from providers, spreadsheets and screenshots, it will:
- inherit unstable source logic
- mix ingestion with interpretation
- become harder to govern
- lose clarity around evidence quality

The platform therefore needs an explicit observation layer.

## Decision

Create `Otiniel Observa` as the dedicated observation layer between production and analytics.

It will:
- ingest social, site, business and qualitative evidence
- normalize records into a stable contract
- preserve source lineage and time windows
- expose summaries by asset, week and month
- operate as a multi-client observation product through client-scoped observation profiles
- separate global provider application credentials from per-client connected-account credentials
- resolve per-client secrets through `secret_ref` rather than per-client environment variables

It will not:
- decide strategy
- recommend editorial changes
- publish content

## Rationale

This option was chosen because it:
- preserves clear system boundaries
- improves auditability
- gives `Atos Analista` a stable input contract
- supports both manual and connector-based collection
- scales to many clients without environment-variable sprawl
- creates a revocable and isolated connection model per client and provider

## Alternatives Considered

### 1. Let Atos Analista collect everything directly

Rejected because it fuses observation and interpretation.

### 2. Keep collection inside each channel-specific integration

Rejected because it fragments evidence contracts and makes cross-channel logic harder.

### 3. Use only dashboards and external BI tools

Rejected because dashboards do not provide product-owned observation contracts for the analytical layer.

## Consequences

### Positive

- cleaner architecture
- better source tracking
- easier future expansion
- clearer product boundary
- tenant-safe connector model for agencies and multi-client operations

### Negative / Trade-Offs

- adds an additional layer to document and implement
- requires normalization rules
- creates more tables and contracts to maintain
- requires secret-reference management and connection lifecycle handling

## Guardrails

- observation must remain interpretation-free
- every summary must preserve source quality inputs
- manual evidence remains valid when direct integration is unavailable
- client connectivity must be modeled as observation profiles, not ad hoc env variables
- application credentials and client account credentials must remain distinct

## Review Trigger

Revisit this ADR when:
- the platform considers merging observation and analytics for performance reasons
- provider contracts stabilize enough to revisit ingestion architecture
- observation volume requires separate scaling decisions
