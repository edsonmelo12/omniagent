# Otiniel Observa - Workstreams by Owner

## Purpose

Assign the execution backlog to implementation tracks by responsibility.

## Owner Model

Use four execution owners:
- `database`
- `backend`
- `integrations`
- `qa`

If the same person plays multiple roles, keep the ownership split anyway.
It reduces planning ambiguity.

## Database Owner

Primary responsibility:
- persistence model
- migrations
- indexes
- relational integrity
- query support for summaries and coverage

Owns:
- OTI-001
- OTI-002
- database portions of OTI-009
- database portions of OTI-011

Deliverables:
- schema migrations
- enum decisions
- relational constraints
- repository support requirements

Definition of done:
- migrations apply cleanly
- indexes match the schema spec
- tenant boundaries are preserved in storage

## Backend Owner

Primary responsibility:
- services
- APIs
- normalization
- summary generation
- collection orchestration
- secret resolution abstraction

Owns:
- OTI-003
- OTI-004
- OTI-005
- OTI-006
- OTI-007
- OTI-008
- OTI-009
- OTI-010
- OTI-011
- OTI-012
- OTI-013
- OTI-014
- OTI-018
- OTI-019
- OTI-020

Deliverables:
- route handlers
- validation schemas
- services
- orchestration logic
- summary read models

Definition of done:
- API contracts match spec
- failures are explicit
- `Atos Analista` can consume summaries without raw-provider coupling

## Integrations Owner

Primary responsibility:
- provider adapters
- provider validation logic
- field mapping from provider to normalized metrics

Owns:
- OTI-015
- OTI-016
- OTI-017
- integration portions of OTI-006
- integration portions of OTI-013

Deliverables:
- Meta adapter
- GA4 adapter
- first CRM adapter, if available
- provider validation routines

Definition of done:
- a real profile per provider can validate
- one declared period can be collected
- provider output reaches normalized summaries
- CRM support does not block Meta + GA4 readiness

## QA Owner

Primary responsibility:
- acceptance traceability
- tenancy verification
- failure-path verification
- contract validation

Owns:
- OTI-021
- validation support across all milestones

Must verify:
- profile creation and validation
- manual intake end-to-end
- summary generation
- coverage endpoint behavior
- connector failure handling
- tenant isolation

Definition of done:
- all acceptance criteria map to executable checks or operational validation steps

## Cross-Owner Dependencies

### Database -> Backend

Backend should not finalize APIs before migrations and relational expectations are stable.

### Backend -> Integrations

Integrations should plug into the standard collection runtime, not invent parallel flows.

### Integrations -> QA

QA should validate each provider against the same acceptance baseline plus connector-specific checks.

## Recommended Coordination Rhythm

### Weekly

Use one implementation checkpoint with:
- blocked items
- cross-owner dependencies
- schema/API drift review

### Milestone Gates

At each milestone, require signoff from:
- database
- backend
- qa

And from `integrations` once live providers are in scope.
