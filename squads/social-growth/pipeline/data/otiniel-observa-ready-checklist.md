# Otiniel Observa - Ready Checklist

## Purpose

Provide a single practical checklist before implementation starts and before each milestone is declared ready.

## Pre-Implementation Checklist

- [ ] PRD reviewed
- [ ] ADR accepted
- [ ] schema reviewed
- [ ] API contract reviewed
- [ ] secret strategy accepted
- [ ] connector MVP scope fixed
- [ ] ownership assigned by workstream

## Milestone M1 - Manual MVP

- [ ] `observation_profiles` implemented
- [ ] evidence tables implemented
- [ ] `secret_ref` resolver implemented
- [ ] profile API implemented
- [ ] manual intake implemented
- [ ] normalization implemented
- [ ] summaries implemented
- [ ] coverage endpoint implemented
- [ ] `Atos Analista` can consume summary contract
- [ ] manual flow verified by QA

## Milestone M2 - Connector MVP

- [ ] collection runtime implemented
- [ ] provider adapter interface implemented
- [ ] collection-runs endpoints implemented
- [ ] Meta connector implemented
- [ ] GA4 connector implemented
- [ ] at least one real client profile validated per core live provider
- [ ] weekly summaries generated from at least Meta and GA4
- [ ] connector failure handling verified by QA
- [ ] if the client has official Instagram + Facebook presence, both canonical Meta profiles exist (`instagram` and `facebook`)
- [ ] canonical `ga4/site` profile exists for the same client baseline
- [ ] baseline live trio revalidated after any provider-code or credential fix
- [ ] canonical artifacts refreshed after baseline changes:
  - [ ] `output/{client}/context/social-intelligence-summary.md`
  - [ ] `output/{client}/oto/observation-overview.md`
  - [ ] `output/{client}/oto/observation-overview.html`

## Milestone M3 - Hardening

- [ ] retries implemented
- [ ] expiry/revalidation implemented
- [ ] reprocessing implemented
- [ ] acceptance traceability closed
- [ ] multi-client isolation verified explicitly
- [ ] no raw secrets stored in relational rows

## Release Blockers

Do not call the module ready if:
- [ ] provider credentials still require one env var per client
- [ ] summary generation hides missing evidence
- [ ] collection runs are not auditable
- [ ] `Atos Analista` still depends on raw provider payloads
- [ ] Meta or GA4 are missing when the test scope is "core observation"
- [ ] official Facebook exists for the client but the canonical Meta/Facebook observation profile is missing
- [ ] provider fix was applied but no post-fix collection rerun was executed
