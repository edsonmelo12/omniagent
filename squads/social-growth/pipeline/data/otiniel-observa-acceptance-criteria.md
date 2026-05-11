# Otiniel Observa - Acceptance Criteria

## Purpose

Define what must be true for `Otiniel Observa` to be considered implementable and operationally acceptable.

## Module 1 - Observation Profiles

Accepted when:
- a profile can be created for a client
- `secret_ref` is mandatory for connector-backed profiles
- validation can move a profile between explicit statuses
- the same client/provider/account combination cannot be duplicated incorrectly

## Module 2 - Manual Intake

Accepted when:
- a user can submit structured manual evidence
- raw evidence is persisted
- normalized observations are created
- summaries can be generated from manual intake only

## Module 3 - Connector Collection

Accepted when:
- collection can run from one active profile
- credential resolution uses `secret_ref`
- runs are logged with status and counts
- failures are visible and do not silently disappear

## Module 4 - Normalization

Accepted when:
- provider-specific fields are mapped into platform-owned metric names
- evidence level is assigned
- completeness status is assigned
- normalized records remain traceable back to raw evidence

## Module 5 - Summaries

Accepted when:
- asset summaries can be generated
- weekly summaries can be generated
- monthly summaries can be generated
- summaries expose source count, evidence level and completeness

## Module 6 - Multi-Client Isolation

Accepted when:
- no client can access another client's profiles or summaries
- collection runs are always client-scoped
- profile credentials are never modeled as one environment variable per client

## Module 7 - Analyst Handoff

Accepted when:
- `Atos Analista` can read summaries without needing raw provider payloads
- summaries include enough provenance for confidence logic
- missing data remains explicit in the contract

## Global Rejection Conditions

Reject implementation readiness if:
- raw secrets are stored in relational rows
- provider payload meaning leaks directly into analytical contracts
- collection can succeed without recording a run
- summaries hide partial or missing evidence
- multi-client isolation is not explicit in storage and API boundaries
