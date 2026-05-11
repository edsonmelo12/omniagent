# PRD - Otiniel Observa

## Product

`Otiniel Observa`

## Summary

`Otiniel Observa` is the observation layer for the `social-growth` platform.
It is responsible for collecting, normalizing and qualifying evidence from social channels, site analytics, business systems and qualitative feedback before that evidence reaches `Atos Analista`.
It must operate as a multi-client product, with tenant-safe observation profiles per client and per provider.

## Problem

Without a dedicated observation layer, the system tends to:
- mix collection with interpretation
- lose source and time-window fidelity
- depend on scattered exports, screenshots and APIs
- produce fragile analysis from inconsistent inputs
- hide evidence gaps behind polished summaries

This makes downstream analytics noisy, hard to audit and difficult to trust.

## Goal

Create a stable evidence layer that turns raw channel, site and business signals into normalized observation records that `Atos Analista` can consume safely.
Do so without coupling the product to per-client environment variables or provider-specific analytical contracts.
For operational readiness, treat Meta and GA4 as the core analytic baseline; CRM is additive, not a precondition for testing the observation layer.

## Users

### Operations

Needs:
- simple ingestion paths
- minimal friction for manual updates
- clear visibility of missing data

### Product / Engineering

Needs:
- stable contracts
- auditable source tracking
- normalized observation structures

### Atos Analista

Needs:
- comparable evidence across channels and periods
- explicit completeness markers
- trustworthy observation windows
- core signals from Meta and GA4 must be available for baseline analysis; CRM increases depth but does not gate readiness

## Jobs To Be Done

1. When metrics come from multiple places, consolidate them without losing source fidelity.
2. Distinguish raw evidence from interpretation.
3. Expose a normalized evidence layer by asset, week and month.
4. Preserve confidence inputs through completeness and evidence quality.

## In Scope

- structured manual ingestion
- authorized connector ingestion
- multi-client observation profiles by provider, channel and connected account
- separation between global application credentials and per-client connected accounts
- secret resolution through `secret_ref`
- normalization by client, asset, channel and period
- evidence quality tagging
- completeness tagging
- storage of raw and summarized observation records
- export of observation summaries to `Atos Analista`

## Out of Scope

- strategic interpretation
- recommendation generation
- publishing decisions
- content creation
- creative review

## Product Principles

1. Source before synthesis.
2. Window before comparison.
3. Missing data must stay visible.
4. Observation is not interpretation.
5. A weaker but explicit record is better than a confident hidden guess.
6. Application credentials and client credentials must never be modeled the same way.
7. Per-client connectivity must be explicit, isolated and revocable.

## Positioning

### Social Growth

Produces:
- research
- plans
- content
- schedules
- publications

### Otiniel Observa

Produces:
- observation records
- evidence summaries
- completeness and evidence metadata
- client-scoped observation profiles

### Atos Analista

Consumes:
- normalized evidence from `Otiniel Observa`
- then interprets and recommends

## Evidence Domains

### Social

- reach
- impressions
- saves
- shares
- comments
- profile visits
- link clicks
- video retention

### Site

- sessions
- engaged users
- engagement time
- source / medium
- campaign
- landing page performance
- key events
- conversions

### Business

- leads
- meetings
- opportunities
- proposal requests
- revenue influence
- pipeline movement

### Qualitative

- DMs
- objection notes
- comment themes
- sales feedback
- recurring questions

## Collection Maturity

### Phase 1

Structured manual evidence intake.

### Phase 2

Authorized connectors for high-value sources.
Each connector should bind to a client-owned observation profile, not to hardcoded client environment variables.

### Phase 3

Consolidated observation store with recurring summaries and source lineage.
This store should support multiple clients, multiple connected accounts per client and rotation-safe secret references.
CRM remains a supported extension point, but not a readiness blocker for the core observation flow.

## Connectivity Model

### Global Application Credentials

Used to authenticate the platform itself with providers.

Examples:
- Meta app credentials
- Google OAuth client credentials
- LinkedIn app credentials
- search enrichment provider credentials

These belong to the platform environment, not to an individual client.

### Client Observation Profiles

Used to represent a client connection to a provider/account pair.

Examples:
- one Instagram business account for Client A
- one GA4 property for Client B
- one CRM workspace for Client C

Each profile should carry:
- `client_id`
- `provider`
- `channel`
- `account_ref`
- `secret_ref`
- `status`
- `scopes`
- connection metadata needed for collection

Core readiness expects at least one active Meta profile and one active GA4 profile per client when those data sources are available.

### Secret Resolution

`Otiniel Observa` should resolve provider secrets through `secret_ref`.
It should not require environment variables like `CLIENT_A_META_TOKEN` or `CLIENT_B_GA4_PROPERTY_ID`.

## Success Criteria

The product should be considered useful when it:
- reduces ambiguity in evidence ingestion
- makes missing data explicit
- gives `Atos Analista` stable comparable inputs
- reduces manual interpretation of screenshots and exports
- preserves source and time-window auditability

## Main Risks

- becoming a generic ETL layer with no product discipline
- overmodeling too early
- hiding gaps through aggressive normalization
- tying analytical quality to unstable APIs
- creating environment-variable sprawl for multi-client credentials
- weakening tenant isolation between clients

## Guardrails

- raw signals stay separate from analytical conclusions
- source lineage is mandatory
- completeness status is mandatory
- manual intake remains supported when no connector exists
- per-client credentials must be represented as observation profiles with `secret_ref`
- no per-client provider token should be introduced as a first-class `.env` variable
