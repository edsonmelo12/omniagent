# Otiniel Observa - Index

## Purpose

This file is the entry point for the `Otiniel Observa` documentation set.
`Otiniel Observa` is the observation layer that sits between `social-growth` production and `Atos Analista`.

Use this index when the goal is to understand:
- the product role of `Otiniel Observa`
- how signals are collected and normalized
- which observation contracts feed `Atos Analista`
- what belongs to raw evidence versus interpretation
- how the module should be implemented technically

Core readiness baseline:
- Meta + GA4 are the required observation sources for readiness and weekly analysis
- CRM is supported as an optional extension when available, but it does not gate readiness

## Read Order

1. [PRD](otiniel-observa-prd.md)
2. [ADR](otiniel-observa-adr.md)
3. [Collection Architecture](otiniel-observa-collection-architecture.md)
4. [Data Model](otiniel-observa-data-model.md)
5. [Collection Rules](otiniel-observa-collection-rules.md)
6. [Deliverables](otiniel-observa-deliverables.md)
7. [Implementation Plan](otiniel-observa-implementation-plan.md)
8. [Relational Schema](otiniel-observa-relational-schema.md)
9. [API Contract](otiniel-observa-api-contract.md)
10. [Secret Management](otiniel-observa-secret-management.md)
11. [Connector Matrix](otiniel-observa-connector-matrix.md)
12. [Operational Flows](otiniel-observa-operational-flows.md)
13. [Acceptance Criteria](otiniel-observa-acceptance-criteria.md)
14. [Technical Execution Plan](otiniel-observa-technical-execution-plan.md)
15. [Execution Backlog](otiniel-observa-backlog.md)
16. [Sprint Plan](otiniel-observa-sprint-plan.md)
17. [Workstreams by Owner](otiniel-observa-workstreams-by-owner.md)
18. [Work Packages](otiniel-observa-work-packages.md)
19. [Ready Checklist](otiniel-observa-ready-checklist.md)

## Usage Rule

Read this set before:
- implementing metrics ingestion
- designing observation pipelines
- connecting social, GA4 and business sources
- exposing normalized evidence to `Atos Analista`
- writing migrations, endpoints, jobs and secret-resolution logic
