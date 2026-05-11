# Otiniel Observa - Implementation Plan

## Purpose

Define the recommended implementation sequence for `Otiniel Observa` so the team can move from product documentation to delivery without redesign.

## Implementation Goal

Ship a multi-client observation layer that:
- supports manual and connector-based evidence intake
- isolates client connections through observation profiles
- normalizes evidence for `Atos Analista`
- preserves source lineage, completeness and evidence level

## Delivery Principles

1. Ship the evidence contract before broad connector coverage.
2. Make manual intake production-safe before API integrations.
3. Keep the first implementation operationally useful, not architecturally maximal.
4. Do not block the MVP on every provider.
5. Treat `observation_profiles` as the center of the implementation.

## Recommended Phases

### Phase 0 - Foundations

Deliver:
- database tables for observation profiles and evidence records
- enum strategy for evidence level, completeness, provider and profile status
- backend folder/module scaffolding
- secret-resolution abstraction with `secret_ref`
- audit event shape for collection lifecycle changes

Exit criteria:
- the project can persist a client observation profile
- the project can persist one raw evidence record and one normalized summary

### Phase 1 - Manual MVP

Deliver:
- create/list/update observation profiles
- structured manual intake flow
- CSV / spreadsheet / form-backed ingestion path
- raw evidence persistence
- normalization pipeline
- summary generation by asset, week and month
- coverage report generation

Exit criteria:
- each client can be operated without any live connector
- `Atos Analista` can consume normalized summaries

### Phase 2 - Connector MVP

Deliver:
- scheduled collection jobs
- provider adapter interface
- first connectors:
  - Meta
  - GA4
  - one CRM, if available
- connection validation flow
- token-expiry and invalid-profile handling
- collection run logging

Exit criteria:
- each client can run recurring collection with Meta and GA4 as the core automated providers
- failed collection does not break downstream summaries silently

### Phase 3 - Hardening

Deliver:
- retry policies
- coverage gaps surfaced in ops views
- profile revalidation flow
- reprocessing and backfill flow
- secret rotation support
- connector health visibility

Exit criteria:
- the team can operate multiple clients safely
- connection failures are visible and recoverable

## Workstreams

### 1. Data Model

Owns:
- relational tables
- indexes
- foreign keys
- state fields
- retention rules

### 2. Collection Engine

Owns:
- manual ingestion
- provider adapters
- scheduled jobs
- run lifecycle

### 3. Normalization

Owns:
- provider mapping
- metric normalization
- evidence level assignment
- completeness assignment
- summary generation

### 4. Security and Secrets

Owns:
- `secret_ref` contract
- secret lookup
- credential rotation behavior
- environment/application credential boundaries

### 5. Analyst Interface

Owns:
- summary read models
- client-safe retrieval
- delivery contract for `Atos Analista`

## Recommended MVP Scope

Implement first:
- `observation_profiles`
- `evidence_sources`
- `raw_evidence_records`
- `normalized_observation_records`
- `observation_summaries`
- `qualitative_evidence`
- manual intake endpoints
- summary read endpoints
- one scheduled summary generation path

Defer initially:
- LinkedIn connector
- advanced attribution logic
- generalized dashboarding
- complex anomaly detection
- CRM readiness gating as a blocking criterion

## Main Risks

- overbuilding provider integrations before the normalization contract stabilizes
- mixing publishing profiles with observation profiles
- letting provider-specific fields leak into analytical summaries
- handling client tokens outside the `secret_ref` abstraction

## Implementation Read Order

1. `otiniel-observa-prd.md`
2. `otiniel-observa-adr.md`
3. `otiniel-observa-collection-architecture.md`
4. `otiniel-observa-data-model.md`
5. `otiniel-observa-relational-schema.md`
6. `otiniel-observa-secret-management.md`
7. `otiniel-observa-api-contract.md`
8. `otiniel-observa-connector-matrix.md`
9. `otiniel-observa-operational-flows.md`
10. `otiniel-observa-acceptance-criteria.md`
