# ADR - Atos Analista As Analytical Layer

## Title

ADR-ATOS-001 - Introduce `Atos Analista` as an analytical intelligence layer over `social-growth`

## Status

Accepted at the product-design level

## Context

`social-growth` already supports research, planning, content creation, publishing and tactical monitoring.
What is missing is a structured layer that:
- consolidates evidence from content performance
- interprets outcomes in business context
- protects the system against short-term bias
- turns historical results into next-cycle recommendations

That intelligence now depends on `Otiniel Observa` as the mandatory observation contract for multi-client evidence intake.

The team considered whether this intelligence should be:
- part of the same operational mode
- a separate squad
- a central orchestrator from the beginning

## Decision

Create `Atos Analista` as a dedicated analytical layer on top of `social-growth`.

It will:
- consume production outputs and monitoring inputs
- consume normalized summaries from `Otiniel Observa`
- interpret evidence in context
- produce analytical deliverables for team, leadership and client
- remain advisory in the first phase

It will not:
- replace the production squad
- publish automatically
- coordinate the whole system from day one
- manage client provider credentials directly

## Rationale

This option was chosen because it:
- preserves the production value already present in `social-growth`
- keeps execution and evaluation separated
- allows analytical quality to be validated before granting coordination power
- reduces premature system complexity
- keeps multi-client source connectivity out of the analytical layer

## Alternatives Considered

### 1. Make analytics just another mode inside `social-growth`

Rejected because it blurs the line between production and evaluation.

### 2. Create an independent analytics squad immediately

Rejected because it adds fragmentation too early and duplicates context.

### 3. Make the analytical layer the orchestrator from the start

Rejected because it centralizes too much power before evidence quality and governance are mature.

## Consequences

### Positive

- clearer separation of responsibilities
- better decision quality
- easier validation of analytical usefulness
- lower risk of operational bias
- cleaner boundary between observation contracts and interpretation logic

### Negative / Trade-Offs

- requires a formal observation layer
- may be ignored if not connected to real weekly decisions
- adds a new product boundary to document and maintain

## Guardrails

- explicit confidence levels
- explicit gaps and missing evidence
- valid `Inconclusive` state
- no strategic recommendation from weak or incomplete evidence
- no direct dependence on per-client API tokens in the analytical layer

## Review Trigger

This ADR should be revisited when:
- `Atos Analista` proves useful across multiple cycles
- the team wants the analyst to directly influence planning
- consolidated observation data is stable enough for stronger automation
