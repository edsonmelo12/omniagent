# Otiniel Observa - Deliverables

## Purpose

Define the canonical outputs of `Otiniel Observa`.

## Deliverable 1 - Observation Intake Record

### Audience

Operations and product / engineering

### Purpose

Capture one ingestion event or manual evidence submission in a traceable way.

### Required Sections

- `Client`
- `Observation Profile` when applicable
- `Source`
- `Collection Time`
- `Window`
- `Record Type`
- `Evidence Level`
- `Completeness`
- `Notes`

## Deliverable 2 - Normalized Observation Summary

### Audience

`Atos Analista`

### Purpose

Provide a normalized evidence package for one asset, week or month.

### Required Sections

- `Window Identification`
- `Client Context`
- `Observation Profile Coverage`
- `Social Signals`
- `Site Signals`
- `Business Signals`
- `Qualitative Signals`
- `Evidence Level`
- `Completeness`
- `Source Count`
- `Notes`

## Deliverable 3 - Observation Coverage Report

### Audience

Operations, product and leadership

### Purpose

Show what is currently observable and where evidence is weak or missing.

### Required Sections

- `Client Scope`
- `Sources Connected`
- `Sources Missing`
- `Observation Profiles by Provider`
- `Coverage by Channel`
- `Coverage by Evidence Domain`
- `High-Risk Gaps`
- `Recommended Next Source Additions`

## Deliverable 4 - Observation HTML Preview

### Audience

User approval and operations

### Purpose

Provide a professional interactive HTML visualization of the current `Otiniel Observa` state for human review before downstream strategic decisions.
This preview must operate in multi-client mode with explicit client filtering.

### Canonical Filename Rule

- Use a stable canonical filename per client: `squads/social-growth/output/{client}/oto/observation-overview.html`.
- Do not create date/version suffixes for this recurring artifact.
- Always update the same file in place with the latest collected data.

### Required Sections

- `Client Scope`
- `Client Filter`
- `Collection Window`
- `Collection Source (live_api | metadata_snapshot | mock_collection)`
- `Profiles by Provider`
- `Readiness Status`
- `Coverage by Domain (social, site, business, qualitative)`
- `High-Risk Gaps`
- `Last Updated At`

### Required Tabs

1. `Conteúdo`
   - Performance by post/asset, format, topic/pillar, CTA and platform.
2. `Aquisição`
   - Traffic origin breakdown by `Instagram`, `Facebook`, `LinkedIn`, `YouTube`, `Google`, `Direto`, `Campanhas`.
3. `Conversão`
   - What became `lead`, `orçamento`, `venda` or another client-defined key goal.

### Rendering Standard

- Rendering must use `social-visual-system` as the default visual skill path.
- `creative-renderer` is responsible for applying the visual skill and producing final HTML.
- Manual generic HTML is allowed only as fallback if the skill path is unavailable or fails explicitly.

## Shared Output Rules

Every deliverable must:
- preserve source lineage
- preserve window boundaries
- declare evidence level
- declare completeness
- preserve client and observation-profile context
- follow canonical filename rules for recurring artifacts
- use skill-driven rendering when a matching visual skill exists

## Output Failure Modes

Reject the deliverable if:
- it includes strategic interpretation
- it hides missing data
- it has no window boundary
- it cannot be traced back to a source
- recurring HTML preview is generated under a non-canonical filename
- the HTML preview bypasses the required visual skill path without explicit fallback reason
- the HTML preview is missing any required tab (`Conteúdo`, `Aquisição`, `Conversão`)
- the HTML preview does not expose client-scoped filtering
