# Client Campaign Hub Blueprint

## Purpose

Define a single client-scoped area where campaign assets are centralized for:
- visualization
- review
- approval
- historical retrieval by filters/selectors

This hub is the canonical pre-publish surface for blog and social pieces.

## Scope

- Client-level campaign listing and filtering
- Campaign detail with asset gallery/table
- Approval workflow visibility and actions
- Historical campaign retrieval
- Audit traceability (who approved what, when, and under which version)

## Core Principles

1. Client-scoped first: no mixed-client artifact listing.
2. Approval before publish: every publishable asset must expose approval status.
3. Canonical previews only: use stable preview artifacts, not ad hoc links.
4. Filter-first retrieval: fast recovery of older campaigns by objective, channel, format, period and status.
5. Evidence over opinion: skill execution, review verdict and readiness checks must be visible.

## Operational Ownership (Mandatory)

- Build/refresh owner: `reviewer` (Phase 04).
- Approval gate consumer: `user-checkpoint` (Phase 05).
- Execution handoff consumers: `scheduler` (Phase 06) and `wagner-wordpress` (06B).

Canonical artifact per client:
- `squads/social-growth/output/{client}/review/campaign-hub.html`
- `squads/social-growth/output/{client}/review/campaign-manifest.json` (source of truth for hub links)

Rule:
- The hub must be regenerated in every review cycle before schedule approval is requested.
- Build and preview links must be promoted through manifest updates; direct manual hub link edits are non-compliant.

## Information Architecture

### 1) Campaigns List (per client)

Primary selector:
- `Cliente` (already resolved when entering workspace)

Filters:
- `Campanha` (select)
- `Período` (date range)
- `Objetivo` (descoberta, consideração, conversão, autoridade)
- `Canal` (Instagram, Stories, Reels, LinkedIn, Blog)
- `Formato` (carousel, reels, story-sequence, single-post, blog)
- `Status` (draft, in_review, approved, scheduled, published, blocked)
- `Responsável por fase` (agent/owner)
- `Somente com pendência` (toggle)

Columns:
- campaign id/name
- cycle window
- state (campaign-state-machine)
- approval status
- scheduled window
- publish status
- updated at

### 2) Campaign Detail

Sections:
- Overview
  - campaign objective
  - current state and next valid state
  - blockers
- Assets (blog + social unified)
  - grouped by channel/format
  - each asset with preview link and artifact path
- Review & Compliance
  - content review verdict
  - scorecard
  - skill execution evidence
  - veto checks
- Approval Timeline
  - requested -> approved/rejected -> scheduled -> published
- Publish Readiness
  - explicit checklist gate

### 3) Asset Drawer / Modal

For each piece:
- title/id
- channel/format
- funnel objective
- preview HTML
- source artifact path
- render status
- review status
- approval status
- last editor/agent
- timestamps

## Approval Model

Required statuses:
- `draft`
- `in_review`
- `approved`
- `rejected`
- `changes_requested`
- `ready_to_schedule`
- `scheduled`
- `published`

Rules:
- `ready_to_schedule` only when:
  - review verdict is `PUBLISH`
  - mandatory preview exists
  - for blog: final article + final featured image (no placeholder)
- `scheduled` only after explicit user checkpoint approval
- `published` only with execution evidence

## Blog + Social Consolidation Contract

A campaign in the hub should expose:
- Blog assets:
  - draft/final markdown
  - final html preview
  - featured image metadata
- Social assets:
  - rendered previews per format
  - manifest row references
  - format skill evidence

## Suggested Backend Projection

Client campaign endpoints to support this hub:
- `GET /api/v1/clients/:clientId/campaigns`
- `GET /api/v1/clients/:clientId/campaigns/:campaignId`
- `GET /api/v1/clients/:clientId/campaigns/:campaignId/assets`
- `GET /api/v1/clients/:clientId/campaigns/:campaignId/approvals`
- `PATCH /api/v1/approvals/:approvalId`

Query params for list endpoint:
- `date_from`, `date_to`
- `objective`
- `channel`
- `format`
- `status`
- `owner`
- `search`

## Suggested Data Shape (UI view model)

```json
{
  "campaignId": "ac-2026-w1-p1",
  "clientId": "amiclube",
  "name": "Semana 1 P1",
  "state": "approval",
  "objective": "authority_with_purchase_decision",
  "status": "scheduled",
  "assets": {
    "blog": [{"id": "blog-01", "status": "approved", "preview": "..."}],
    "social": [{"id": "ac-30-02", "format": "carousel", "status": "approved", "preview": "..."}]
  },
  "review": {
    "verdict": "PUBLISH",
    "score": 91.7
  },
  "approvals": {
    "schedule": "approved"
  },
  "updatedAt": "2026-04-21T20:00:00Z"
}
```

## UX Notes

- Default to latest active campaign, with quick switch to historical campaigns.
- Keep `Asset Type` tabs: `Todos`, `Blog`, `Social`.
- Add a compact “Readiness Badge” per asset:
  - green: publishable
  - yellow: pending review/approval
  - red: blocked (show reason)
- Always show absolute timestamps for audit.

## Governance Rules

- The hub must read from client-scoped artifacts only (`output/{client}` model).
- Missing canonical preview = non-approvable asset.
- Placeholder featured image = blog blocked.
- Missing skill evidence for format assets = blocked.
- AmiClube veto violations = automatic block.

## Rollout Plan

1. Stage 1 - Read-only hub
- list campaigns
- open campaign detail
- view previews and status

2. Stage 2 - Approval actions
- approve/reject with reason
- checkpoint registration

3. Stage 3 - Scheduling handoff
- readiness gate summary
- one-click handoff to scheduler/publishing executor

4. Stage 4 - Historical analytics
- filters by period/objective/channel
- campaign comparison snapshots

## Immediate Next Step

Implement Stage 1 with current artifacts and existing `campaign` endpoint, then iterate with approval actions.
