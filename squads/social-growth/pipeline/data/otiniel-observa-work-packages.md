# Otiniel Observa - Work Packages

## Purpose

Group backlog items into execution packages that can be assigned and shipped with low coordination overhead.

## Package 1 - Core Data Foundation

Includes:
- OTI-001
- OTI-002
- OTI-003
- OTI-004

Primary owners:
- database
- backend

Output:
- schema
- secret abstraction
- backend module boundaries

Ship condition:
- a profile and an evidence chain can be persisted safely

## Package 2 - Profile Lifecycle

Includes:
- OTI-005
- OTI-006

Primary owners:
- backend
- integrations for provider-aware validation support

Output:
- observation profile CRUD
- profile validation path

Ship condition:
- profiles move through explicit lifecycle states

## Package 3 - Manual MVP

Includes:
- OTI-007
- OTI-008
- OTI-009
- OTI-010
- OTI-011

Primary owners:
- backend
- database
- qa

Output:
- manual intake
- normalization
- summaries
- coverage endpoint

Ship condition:
- `Atos Analista` can consume summary output from manual evidence only

## Package 4 - Connector Runtime

Includes:
- OTI-012
- OTI-013
- OTI-014

Primary owners:
- backend
- qa

Output:
- reusable collection runtime
- provider adapter contract
- run visibility

Ship condition:
- a mock or stub provider can traverse the full runtime lifecycle

## Package 5 - Live Providers

Includes:
- OTI-015
- OTI-016
- OTI-017

Primary owners:
- integrations
- backend
- qa

Output:
- Meta connector
- GA4 connector
- first CRM connector, if available

Ship condition:
- at least Meta and GA4 generate weekly summaries for each client that has those providers
- CRM remains optional for readiness

## Package 6 - Hardening

Includes:
- OTI-018
- OTI-019
- OTI-020
- OTI-021

Primary owners:
- backend
- qa
- integrations where relevant

Output:
- retries
- expiry/revalidation behavior
- reprocessing flow
- acceptance traceability

Ship condition:
- the module is safe to operate across multiple clients without silent degradation

## Recommended Assignment Strategy

If team capacity is small:
- Package 1 and Package 2 first
- Package 3 immediately after
- do not split effort across live connectors too early

If team capacity is medium:
- Package 4 can start once Package 3 is stabilizing

If team capacity is strong:
- Package 5 can begin in parallel for two providers only after Package 4 contract is locked
