# Atos Analista - Implementation Plan

## Purpose

Define the recommended implementation sequence for `Atos Analista` to turn product documentation into a working analytical layer over `social-growth`.

## Implementation Goal

Deliver an intelligence layer that:
- Connects editorial intent (objective, horizon, theme) with observed results.
- Consumes normalized evidence from `Otiniel Observa`.
- Produces structured verdicts (Scale, Repeat, Archive, etc.).
- Generates strategic deliverables (Asset Cards, Weekly Reviews, Monthly Memos).

## Delivery Principles

1. **Intent before Evidence**: We must know *why* something was published before we can judge *how* it performed.
2. **Analysis before Automation**: Focus on getting the interpretation right before trying to automate decision feedback loops.
3. **Normalization as a Shield**: `Atos Analista` must never touch raw provider APIs; it only reads from `Otiniel Observa` contracts.
4. **Decisions over Metrics**: Every endpoint and UI should prioritize the "Verdict" and "Next Action" over raw numbers.

## Recommended Phases

### Phase 0 - Foundations & Intent Intake

Deliver:
- Database tables for `asset_intents`, `analytical_verdicts`, and `pattern_groups`.
- Backend module scaffolding (`backend/src/modules/atos-analista`).
- CRUD for `Asset Intent Profiles` (why did we create this?).
- Integration with the current `publishing` module to link intents to assets.

**Exit criteria**:
- We can register the strategic intent (objective, horizon, theme, angle) for any asset.

### Phase 1 - Evidence Binding (Otiniel Integration)

Deliver:
- Service to fetch `observation_summaries` from `Otiniel Observa` scoped by client and asset.
- Linking logic to join `asset_intents` + `observation_summaries`.
- "Readiness" check: determine if enough evidence exists for a verdict (Completeness/Confidence).

**Exit criteria**:
- The system can show a unified view of "What we wanted" vs "What actually happened" for a single asset.

### Phase 2 - Analytical Verdict Engine

Deliver:
- CRUD for `Analytical Verdicts`.
- Implementation of the `Decision Taxonomy` (Scale, Repeat, Redistribute, Archive, Inconclusive).
- Logic for confidence scoring based on `Otiniel` evidence levels and completeness.
- Pattern detection engine for `Pattern Groups` (clustering by theme/angle/format).

**Exit criteria**:
- An analyst (human or agent) can record a structured verdict for an asset or cluster.

### Phase 3 - Deliverables Engine

Deliver:
- Template system for `Asset Cards`.
- Aggregation engine for `Weekly Operational Reviews`.
- Data structure for the `Monthly Portfolio Memo`.
- API endpoints to serve these deliverables to the dashboard.

**Exit criteria**:
- The system generates the three canonical deliverables defined in the documentation.

### Phase 4 - Feedback Loop (Portfolio Balance)

Deliver:
- Portfolio health dashboards (Balance by Objective/Horizon).
- Backlog recommendation engine (turning Archive/Repeat decisions into new pautas).
- Strategic trend analysis (Theses strengthening/weakening).

**Exit criteria**:
- `Atos Analista` findings directly influence the next planning cycle of the production squad.

## Data Model (Relational Implementation)

### 1. `atos_asset_intents`
- `id` (uuid)
- `asset_id` (uuid, fk to publishing.assets)
- `client_id` (uuid)
- `primary_objective` (enum: authority, distribution, capture, conversion)
- `secondary_objective` (enum, optional)
- `return_horizon` (enum: short, medium, long)
- `funnel_stage` (enum)
- `theme` (string/ref)
- `angle` (string/ref)
- `editorial_thesis` (text)
- `icp` (string)
- `created_at`, `updated_at`

### 2. `atos_verdicts`
- `id` (uuid)
- `client_id` (uuid)
- `target_type` (enum: asset, group)
- `target_id` (uuid)
- `decision` (enum: scale, repeat_with_adjustment, redistribute, archive, inconclusive)
- `probable_causality` (text)
- `confidence` (enum: low, medium, high)
- `main_gap` (text)
- `next_action` (text)
- `analyst_id` (uuid, optional)
- `created_at`, `updated_at`

### 3. `atos_pattern_groups`
- `id` (uuid)
- `client_id` (uuid)
- `group_type` (enum: theme, angle, format, objective)
- `group_key` (string)
- `period_start`, `period_end`
- `verdict_id` (uuid, fk)
- `metadata` (jsonb)

## Integration with Otiniel Observa

`Atos Analista` consumes:
- `GET /otiniel-observa/observation-summaries?clientId=X&assetId=Y`
- `GET /otiniel-observa/coverage?clientId=X`

It uses `evidence_level` and `completeness_status` from these summaries to calibrate its own `confidence` field.

## Main Risks

- **Intent Gap**: Content being produced without strategic intent mapped, making analysis impossible.
- **Signal Noise**: Over-interpreting low-confidence data from immature `Otiniel` connectors.
- **Disconnected Decisions**: Generating verdicts that nobody reads or uses to change the next cycle.
- **Taxonomy Drift**: Using "Scale" or "Archive" inconsistently across clients.

## Next Steps (Technical Task List)

1. [ ] Create `backend/src/modules/atos-analista` scaffold.
2. [ ] Write SQL migration for `atos_asset_intents` and `atos_verdicts`.
3. [ ] Implement `IntentService` to handle asset strategic mapping.
4. [ ] Create a bridge service to consume `Otiniel Observa` summaries.
5. [ ] Design the `VerdictService` with the decision taxonomy rules.
