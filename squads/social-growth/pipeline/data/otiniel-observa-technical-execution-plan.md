# Otiniel Observa - Technical Execution Plan

## Purpose

Translate the implementation package for `Otiniel Observa` into an execution-ready technical plan.

## Execution Objective

Deliver the first production-usable version of `Otiniel Observa` with:
- multi-client-safe observation profiles
- manual intake
- normalized summaries for `Atos Analista`
- initial connector support
- explicit failure handling and coverage visibility

## Execution Strategy

Build in this order:
1. persistence and contracts
2. manual intake and normalization
3. summary generation and analyst handoff
4. connector infrastructure
5. first provider integrations
6. hardening and operations

## Workstreams

### Workstream A - Database and Persistence

Goal:
Create the storage foundation for profiles, runs, evidence and summaries.

Tasks:
1. Add migration for `observation_profiles`
2. Add migration for `evidence_sources`
3. Add migration for `collection_runs`
4. Add migration for `raw_evidence_records`
5. Add migration for `normalized_observation_records`
6. Add migration for `qualitative_evidence`
7. Add migration for `observation_summaries`
8. Add indexes and uniqueness constraints from schema spec
9. Add repository interfaces and persistence tests

Done when:
- all core tables exist
- repositories can write/read one full manual-intake flow

### Workstream B - Secret Resolution

Goal:
Provide one stable abstraction for client-scoped connector secrets.

Tasks:
1. Define `secret_ref` parser/validator contract
2. Implement secret resolver interface
3. Add env-backed/local-backed first adapter
4. Add masked logging rules for secret failures
5. Add validation tests for resolvable/unresolvable refs

Done when:
- backend code can resolve a profile secret without exposing raw value to logs or database rows

### Workstream C - Observation Profiles API

Goal:
Make client/provider connections manageable.

Tasks:
1. Add routes:
   - `GET /clients/:clientId/observation-profiles`
   - `POST /clients/:clientId/observation-profiles`
   - `PATCH /clients/:clientId/observation-profiles/:profileId`
   - `POST /clients/:clientId/observation-profiles/:profileId/validate`
2. Add validation schemas
3. Enforce agency/client scoping
4. Return explicit profile status transitions

Done when:
- a client can create, edit and validate an observation profile end-to-end

### Workstream D - Manual Intake Pipeline

Goal:
Ship the first usable data path without waiting for live provider integrations.

Tasks:
1. Add `POST /clients/:clientId/observation-intake/manual`
2. Implement source creation for manual evidence
3. Create collection run on intake
4. Persist raw evidence records
5. Normalize submitted metrics into platform-owned records
6. Persist qualitative evidence when present
7. Return intake/run identifiers

Done when:
- a CSV/form-based payload can be ingested and produces normalized observation records

### Workstream E - Summary Generation

Goal:
Produce the read model consumed by `Atos Analista`.

Tasks:
1. Implement asset summary generator
2. Implement weekly summary generator
3. Implement monthly summary generator
4. Aggregate profile ids, source count, evidence level and completeness
5. Add:
   - `GET /clients/:clientId/observation-summaries`
   - `POST /clients/:clientId/observation-summaries/generate`
6. Add generation tests for complete, partial and missing evidence cases

Done when:
- `Atos Analista` can read summaries without touching raw evidence tables

### Workstream F - Coverage and Ops Visibility

Goal:
Make missingness and connector health visible.

Tasks:
1. Add `GET /clients/:clientId/observation-coverage`
2. Compute:
   - connected sources
   - missing sources
   - profile status distribution
   - domain coverage
   - high-risk gaps
3. Add collection-run list/detail endpoints
4. Expose safe failure reasons

Done when:
- operations can identify which client/provider/channel paths are weak or broken

### Workstream G - Connector Runtime

Goal:
Create the reusable infrastructure for live providers.

Tasks:
1. Define provider adapter interface
2. Define collection-run orchestrator
3. Implement scheduled execution entrypoint
4. Add failure categorization:
   - credential failure
   - provider access failure
   - normalization failure
   - transient network failure
5. Update profile status when connector state changes

Done when:
- one adapter can run through the standard collection lifecycle

### Workstream H - First Connectors

Goal:
Automate the highest-value sources first.

Recommended order:
1. Meta
2. GA4
3. One CRM, if available

Tasks per connector:
1. map profile metadata requirements
2. implement provider client
3. implement validation routine
4. implement period-based collection
5. map provider fields to normalized metrics
6. add connector-specific tests

Done when:
- at least Meta and GA4 live providers can feed weekly summaries for each client that has them
- CRM can be added later without changing the core readiness threshold

## Dependency Order

Required sequence:
1. Workstream A
2. Workstream B
3. Workstream C
4. Workstream D
5. Workstream E
6. Workstream F
7. Workstream G
8. Workstream H

## Milestones

### Milestone 1 - Manual MVP Ready

Includes:
- A through F

Result:
- usable `Otiniel Observa` without live provider dependency

### Milestone 2 - Connector MVP Ready

Includes:
- G and first two connectors from H

Result:
- recurring automated collection for real clients

### Milestone 3 - Operations Hardening

Includes:
- retries
- profile revalidation
- secret rotation handling
- backfill/reprocessing
- richer collection diagnostics

## Suggested Task Breakdown for Engineering

### Backend

- route handlers
- service layer
- normalization engine
- summary generator
- secret resolver
- adapter runtime

### Database

- migrations
- indexes
- constraints
- retention decisions
- query tuning for summaries and runs

### Integrations

- Meta adapter
- GA4 adapter
- CRM adapter
- validation paths
- mapping tests

### QA / Verification

- tenancy checks
- ingestion validation
- summary correctness
- failure-state coverage
- acceptance-criteria traceability

## Verification Gates

Do not advance to the next milestone unless:

### Gate 1
- one full manual intake becomes a summary successfully

### Gate 2
- observation profile validation works with success and failure paths

### Gate 3
- `Atos Analista` can consume summary output contract

### Gate 4
- connector failure does not silently produce stale certainty

## Recommended Execution Rhythm

### Sprint 1

- Workstreams A and B
- start C

### Sprint 2

- finish C
- D
- start E

### Sprint 3

- finish E
- F
- start G

### Sprint 4+

- H
- hardening work

## Final Deliverable of This Plan

At the end of execution, the system should have:
- implemented schema
- observation profile lifecycle
- manual intake path
- summary generation
- coverage endpoints
- connector runtime
- first provider integrations
- clean handoff to `Atos Analista`
