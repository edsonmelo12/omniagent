# Otiniel Observa - Execution Backlog

## Purpose

Break the technical execution plan into implementation-ready backlog items.

## Backlog Rules

1. Complete foundational data and secret work before live connectors.
2. Do not start provider integrations before manual intake is working end-to-end.
3. Every backlog item must produce a testable outcome.
4. `Atos Analista` integration reads summaries only.

## Phase 1 - Foundations

### OTI-001 - Create `observation_profiles` persistence

Goal:
Persist client-scoped observation connections.

Includes:
- migration
- repository
- status enum handling
- uniqueness constraints by client/provider/account/profile_type

Depends on:
- existing agency/client tenancy model

Done when:
- one profile can be inserted, updated and queried safely by client

### OTI-002 - Create evidence persistence tables

Goal:
Persist sources, runs, raw evidence, normalized records, qualitative evidence and summaries.

Includes:
- migrations
- indexes
- foreign keys
- repository interfaces

Depends on:
- OTI-001

Done when:
- one complete evidence chain can be stored in PostgreSQL

### OTI-003 - Implement `secret_ref` resolution abstraction

Goal:
Resolve client-scoped secrets without storing raw credentials in data tables.

Includes:
- resolver interface
- env/local adapter
- error model
- masked logging

Depends on:
- none

Done when:
- a profile secret can be resolved for runtime use and failure paths are explicit

### OTI-004 - Define Otiniel module structure in backend

Goal:
Create code boundaries for profiles, intake, normalization, summaries and connectors.

Includes:
- folders/modules
- service boundaries
- route registration plan

Depends on:
- none

Done when:
- backend has a stable place for all Otiniel responsibilities

## Phase 2 - Observation Profiles API

### OTI-005 - Implement list/create/update observation profiles endpoints

Endpoints:
- `GET /clients/:clientId/observation-profiles`
- `POST /clients/:clientId/observation-profiles`
- `PATCH /clients/:clientId/observation-profiles/:profileId`

Depends on:
- OTI-001
- OTI-003
- OTI-004

Done when:
- profiles can be managed per client through the API

### OTI-006 - Implement observation profile validation endpoint

Endpoint:
- `POST /clients/:clientId/observation-profiles/:profileId/validate`

Includes:
- runtime secret resolution
- provider-agnostic validation flow
- status updates

Depends on:
- OTI-003
- OTI-005

Done when:
- profiles transition correctly between `pending`, `active`, `invalid` and `expired`

## Phase 3 - Manual Intake MVP

### OTI-007 - Implement manual intake endpoint

Endpoint:
- `POST /clients/:clientId/observation-intake/manual`

Includes:
- payload validation
- collection run creation
- source creation/reuse
- raw evidence persistence

Depends on:
- OTI-002
- OTI-004

Done when:
- one structured manual payload creates a collection run and raw evidence records

### OTI-008 - Implement normalization engine v1

Goal:
Map raw evidence into platform-owned normalized observations.

Includes:
- metric mapping service
- evidence level assignment
- completeness assignment
- qualitative signal persistence when present

Depends on:
- OTI-007

Done when:
- manual intake produces normalized records with source traceability

### OTI-009 - Implement summary generators

Goal:
Generate asset, weekly and monthly summaries.

Includes:
- asset summary generator
- weekly summary generator
- monthly summary generator
- source count aggregation
- profile id aggregation

Depends on:
- OTI-008

Done when:
- summaries can be generated for a client from normalized records only

### OTI-010 - Implement summary read/generate endpoints

Endpoints:
- `GET /clients/:clientId/observation-summaries`
- `POST /clients/:clientId/observation-summaries/generate`

Depends on:
- OTI-009

Done when:
- summaries are available for `Atos Analista` consumption

### OTI-011 - Implement coverage endpoint

Endpoint:
- `GET /clients/:clientId/observation-coverage`

Includes:
- connected sources
- missing sources
- profile status distribution
- domain coverage
- high-risk gaps

Depends on:
- OTI-005
- OTI-009

Done when:
- operations can see what is observable and what is missing for a client

## Phase 4 - Connector Runtime

### OTI-012 - Implement collection run orchestration

Goal:
Standardize the lifecycle of connector-based collection.

Includes:
- start run
- collect
- persist
- normalize
- summarize
- finish/fail

Depends on:
- OTI-002
- OTI-003
- OTI-009

Done when:
- one connector can use the standard orchestration path

### OTI-013 - Implement provider adapter interface

Goal:
Create a reusable connector contract.

Includes:
- validate
- collect
- map account metadata
- safe error handling

Depends on:
- OTI-012

Done when:
- a provider implementation can plug into the runtime without custom orchestration

### OTI-014 - Implement collection runs read endpoints

Endpoints:
- `GET /clients/:clientId/collection-runs`
- `GET /clients/:clientId/collection-runs/:runId`

Depends on:
- OTI-012

Done when:
- operations can inspect run history and failures

## Phase 5 - First Connectors

### OTI-015 - Implement Meta validation and collection adapter

Includes:
- profile metadata contract
- validation routine
- period-based collection
- normalized metric mapping

Depends on:
- OTI-013

Done when:
- one Meta profile can generate weekly summaries automatically

### OTI-016 - Implement GA4 validation and collection adapter

Includes:
- property metadata contract
- validation routine
- period-based collection
- normalized metric mapping

Depends on:
- OTI-013

Done when:
- one GA4 profile can generate weekly summaries automatically

### OTI-017 - Implement first CRM adapter, if available

Includes:
- provider choice
- validation routine
- lead/opportunity signal mapping

Depends on:
- OTI-013

Done when:
- one CRM profile can feed business signals into summaries, when a CRM is available

## Phase 6 - Hardening

### OTI-018 - Add retry and transient-failure handling

Depends on:
- OTI-012

Done when:
- transient failures no longer collapse collection silently

### OTI-019 - Add revalidation and expiry handling

Depends on:
- OTI-006
- OTI-012

Done when:
- expired or invalid credentials degrade profile state predictably

### OTI-020 - Add reprocessing and backfill flow

Depends on:
- OTI-009

Done when:
- summaries can be regenerated for a declared historical window

### OTI-021 - Add acceptance traceability checks

Goal:
Verify each acceptance criterion is covered by tests or operational validation.

Depends on:
- all core implementation items

Done when:
- Otiniel has a readiness checklist tied to real endpoints, tables and flows

## Milestone Mapping

### Milestone M1 - Manual MVP

Includes:
- OTI-001 through OTI-011

Outcome:
- usable Otiniel without live provider integrations

### Milestone M2 - Connector MVP

Includes:
- OTI-012 through OTI-017

Outcome:
- first live automated collection for real clients

### Milestone M3 - Hardening

Includes:
- OTI-018 through OTI-021

Outcome:
- operational reliability suitable for broader multi-client use

## Recommended Implementation Order

1. OTI-001
2. OTI-003
3. OTI-002
4. OTI-004
5. OTI-005
6. OTI-006
7. OTI-007
8. OTI-008
9. OTI-009
10. OTI-010
11. OTI-011
12. OTI-012
13. OTI-013
14. OTI-014
15. OTI-015
16. OTI-016
17. OTI-017
18. OTI-018
19. OTI-019
20. OTI-020
21. OTI-021
