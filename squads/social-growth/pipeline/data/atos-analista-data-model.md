# Atos Analista - Data Model

## Purpose

Define the conceptual data model required for `Atos Analista`.
This is the minimum product model needed to connect editorial intent with observed evidence.

## Design Principle

The model must be expressive enough to learn, but small enough to remain governable.

## Core Entities

### Asset

Represents one published or distributed content unit.

Fields:
- `asset_id`
- `client_id`
- `title`
- `channel`
- `format`
- `published_at`
- `cta_type`
- `campaign_id` optional
- `status`

### Intent Profile

Represents why the asset exists.

Fields:
- `asset_id`
- `primary_objective`
- `secondary_objective` optional
- `return_horizon`
- `theme`
- `angle`
- `editorial_thesis` optional in phase 1
- `icp`
- `funnel_stage`

### Observation Summary

Represents the normalized evidence consumed by the analyst.

Fields:
- `client_id`
- `observation_profile_ids`
- `asset_id`
- `window_type` (`asset`, `weekly`, `monthly`)
- `distribution_signals`
- `response_signals`
- `qualitative_signals`
- `business_signals`
- `evidence_level`
- `completeness_status`

### Analytical Verdict

Represents the analyst's conclusion.

Fields:
- `asset_id` or `group_id`
- `decision`
- `probable_causality`
- `confidence`
- `main_gap`
- `next_action`
- `created_at`

### Pattern Group

Represents aggregated views.

Examples:
- theme cluster
- angle cluster
- channel x format cluster
- objective cluster

Fields:
- `group_id`
- `group_type`
- `group_key`
- `period_start`
- `period_end`
- `pattern_status`
- `portfolio_contribution`

## Enumerations

### Primary Objective

- `authority`
- `distribution`
- `capture`
- `conversion`

### Return Horizon

- `short_term`
- `medium_term`
- `long_term`

### Decision

- `scale`
- `repeat_with_adjustment`
- `redistribute`
- `archive`
- `inconclusive`

### Confidence

- `high`
- `medium`
- `low`

### Funnel Stage

- `awareness`
- `consideration`
- `decision`
- `post_conversion`

## Derived Analytical Dimensions

These may be calculated rather than stored:
- portfolio balance by objective
- portfolio balance by horizon
- saturation risk
- efficiency score
- pattern strength
- business alignment

## Minimum Relational Requirement

The implementation should be able to join:
- asset -> intent
- asset -> observation
- asset -> verdict
- asset -> campaign when available
- asset -> client
- observation -> observation profile when applicable

Without these joins, the analyst will not be able to reason across cycles.

## Phase 1 Minimal Model

If implementation must start lean, use only:
- `asset`
- `intent_profile`
- `observation_summary`
- `analytical_verdict`

And make these fields mandatory:
- client_id
- channel
- format
- primary objective
- return horizon
- theme
- angle
- confidence
- decision

## Phase 2 Expansion

Add:
- editorial thesis
- campaign grouping
- creative family
- effort score
- reuse lineage
- attribution window

## Governance Rule

If theme, angle, objective or horizon are free-form in implementation, the model will collapse over time.
These fields require controlled vocabularies or explicit review rules.
The same applies to observation provenance: `client_id` and observation-profile context cannot be optional in a multi-client analytical product.
