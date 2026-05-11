# PRD - Atos Analista

## Product

`Atos Analista`

## Summary

`Atos Analista` is the analytical intelligence layer for the `social-growth` platform.
It does not replace content production. It learns from published content and turns results into structured diagnosis, prioritization and strategic recommendations for the next cycle.
It consumes normalized evidence from `Otiniel Observa`, not raw provider payloads or client credentials directly.

## Problem

The current `social-growth` system already handles:
- research
- planning
- content creation
- publishing
- tactical monitoring

However, production alone does not create intelligence.
Without a dedicated analytical layer, the system tends to:
- interpret metrics in a fragmented way
- optimize for short-term visible signals
- fail to connect content to business outcomes
- lose repeatable learning between cycles
- depend on scattered, client-scoped evidence inputs that are hard to compare or audit

## Goal

Turn `social-growth` from a content production system into a system that learns from evidence and improves editorial, channel and business decisions over time.

## Users

### Execution Team

Needs fast guidance about:
- what to repeat
- what to adjust
- what to redistribute
- what to stop

### Strategy / Leadership

Needs portfolio-level clarity about:
- which themes are strengthening
- which channels deserve more effort
- how the mix between authority, distribution, capture and conversion is evolving

### Client

Needs an executive interpretation of:
- what worked
- what was learned
- what changes next

## Jobs To Be Done

1. When content is published across multiple channels, understand what is actually working in context.
2. Distinguish visibility from business value.
3. Protect medium- and long-term authority assets from premature rejection.
4. Turn measurement into a prioritized next-cycle plan.

## In Scope

- per-asset analysis
- weekly operational review
- monthly portfolio memo
- consumption of normalized observation summaries from `Otiniel Observa`
- theme / angle / format / channel pattern detection
- conflict reading between engagement, quality and business impact
- portfolio balance reading across objectives and horizons
- prioritized recommendations
- confidence and gap reporting

## Out of Scope

- automatic publishing
- autonomous planning changes without human approval
- creative generation
- review and approval replacement
- becoming the core orchestrator of the full squad in the first phase

## Product Principles

1. Objective before metric.
2. Horizon before judgment.
3. Observation before interpretation.
4. Confidence before assertiveness.
5. Short-term signal must not dominate the portfolio.
6. Every analysis must end in a decision.
7. Analytical access to provider data must happen through observation contracts, never through direct client credential handling.

## Positioning

`Atos Analista` is a layer above `social-growth`, not a separate replacement product.

### Social Growth

Responsible for:
- intake
- research
- planning
- content production
- visual direction
- rendering
- review
- scheduling
- publication
- tactical monitoring

### Atos Analista

Responsible for:
- consuming evidence consolidated by `Otiniel Observa`
- interpreting results in context
- identifying patterns and conflicts
- reading portfolio health
- recommending the next moves

### Otiniel Observa

Provides:
- multi-client observation profiles
- source-lineage-safe evidence summaries
- evidence level and completeness signals
- client-scoped summaries by asset, week and month

## Core Analytical Model

### Execution Objects

- asset
- channel
- format
- date / window
- CTA
- creative variation

### Intention Objects

- primary objective
- secondary objective
- return horizon
- ICP
- funnel stage
- editorial thesis
- theme
- narrative angle

### Result Objects

- distribution signals
- response signals
- qualitative return
- business impact
- observation profile context
- portfolio contribution
- decision
- probable causality
- confidence

## Cadences

### Asset Level

Purpose:
- detect early signal without overinterpreting

### Weekly

Purpose:
- adjust execution with pattern and conflict reading

### Monthly

Purpose:
- reallocate focus and effort with a portfolio view

## Decision Taxonomy

Every analytical output must end with one of these:
- `scale`
- `optimize`
- `retest`
- `pause`
- `kill`

## Opportunity Status Taxonomy

Every relevant angle or hypothesis must also receive one of these:
- `validated`
- `under_tested`
- `execution_failed`
- `distribution_failed`
- `market_misaligned`
- `strategic_bet`
- `discarded`

## False Negative Protection

No angle should receive `kill` by default when there is plausible evidence that:
- execution was weak;
- distribution was insufficient;
- the sample size was too small;
- the format/channel was mismatched.

In these cases prefer:
- `retest`
- `optimize`
- `pause`

## Success Criteria

The product should be considered useful when it increases:
- clarity of editorial decisions
- consistency in backlog prioritization
- ability to explain why priorities changed
- quality of learning between cycles
- balance across short-, medium- and long-term content bets

## Main Risks

- false causal certainty
- short-term bias
- taxonomy drift
- analysis that explains well but prioritizes poorly
- rewarding content noise instead of strategic value

## Guardrails

- confidence must always be explicit
- gaps must always be explicit
- `Inconclusive` is a valid outcome
- strategy-level conclusions must rely on consolidated reads, not isolated assets
- `Atos Analista` must not connect directly to per-client provider tokens or ad hoc channel APIs

## Future Evolution

### Phase 1

Advisory analytical layer.

### Phase 2

Formal input into weekly planning.

### Phase 3

Planning mediation for `social-growth`, if quality proves stable.
