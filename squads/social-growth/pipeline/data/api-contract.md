# API Contract Draft

## Purpose

Define the first HTTP contract for the Social Growth backend so the dashboard and future clients can consume stable endpoints backed by PostgreSQL.

## Contract Principles

- REST first.
- Versioned routes.
- Tenant-aware in every request.
- Consistent JSON envelopes.
- Validation before persistence.
- No endpoint should bypass agency context.

## Base Conventions

### API Prefix

- `/api/v1`

### Standard Headers

- `Authorization: Bearer <token>` or session cookie for local auth
- `X-Request-Id` for tracing
- `X-Agency-Id` when agency context is not derived from the session

### Standard Response Envelope

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "agencyId": "agency_123"
  }
}
```

### Error Envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payload",
    "details": []
  },
  "meta": {
    "requestId": "req_123",
    "agencyId": "agency_123"
  }
}
```

## Authentication

### `POST /api/v1/auth/login`

Use this for local or early-stage auth.

Request:
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

Response:
```json
{
  "data": {
    "user": {
      "id": "user_123",
      "name": "Edson",
      "email": "user@example.com"
    },
    "agencies": [
      {
        "id": "agency_123",
        "name": "Social Growth"
      }
    ]
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

### `POST /api/v1/auth/logout`

Invalidates the current session or token.

### `GET /api/v1/me`

Returns the current authenticated user and available agency memberships.

## Agencies

### `GET /api/v1/agencies`

Returns the agencies available to the current user.

### `POST /api/v1/agencies`

Creates a new agency tenant.

Request:
```json
{
  "name": "Acme Agency",
  "slug": "acme-agency"
}
```

## Clients

### `GET /api/v1/clients`

Lists clients for the current agency.

Query options:
- `status`
- `search`
- `limit`
- `cursor`

### `POST /api/v1/clients`

Creates a client workspace.

Request:
```json
{
  "name": "Real Engenharia",
  "slug": "real-engenharia",
  "segment": "real estate",
  "websiteUrl": "https://realengenharia.com"
}
```

### `GET /api/v1/clients/:clientId`

Returns client metadata plus workspace status.

## Brand and Offer Context

The backend treats brand and offer as separate concepts:

- `brand profile` describes the client identity, tone, positioning, and visual cues.
- `offer profile` describes the active offer or product/service focus for the client.
- `product` remains the technical alias in the current API for backward compatibility.
- New UI and integration code should prefer `offer` and `offers` when reading the catalog payload.

### `GET /api/v1/clients/:clientId/products`

Returns the offer catalog for the client.

Response aliases:
- `products`: full catalog, backward compatible name
- `offers`: same catalog, preferred domain name
- `offer`: active offer resolved from the catalog

The active offer is resolved from the item marked as active, or the first catalog item when no active record exists.

## Creative Context

The backend also exposes a dedicated creative profile layer for visual direction, content composition, and render constraints.

- `creative profile` consolidates brand, offer, social, and market evidence into a production-ready art direction payload.
- The creative profile is client-specific visual DNA for the universal creative skill.
- The first visual decision should come from the client niche, then the creative profile, then the post idea.
- It is created and revised together with intake/client record workflows.
- The current response contract should expose both the latest creative profile and the historical list of versions.

### `GET /api/v1/clients/:clientId/creative-profile`

Returns the latest creative profile snapshot plus the computed draft payload.

Response aliases:
- `creativeProfile`: latest or draft creative profile
- `latestCreativeProfile`: persisted latest record if one exists
- `creativeProfiles`: full version history for the client

The payload should include:
- niche and audience anchors
- image strategy
- preferred mood and environment
- palette anchors
- typography direction
- overlay and contrast guidance
- anti-repetition notes

### `POST /api/v1/clients/:clientId/creative-profile`

Creates a new creative profile version from the current client, brand, offer, social, and market evidence.

Request:
```json
{
  "status": "draft",
  "note": "Initial creative direction"
}
```

### `PATCH /api/v1/clients/:clientId/creative-profile`

Revises the current creative profile and stores a new version.

Request:
```json
{
  "status": "review",
  "note": "Tighten the visual direction",
  "summaryOverride": "Use a more editorial composition"
}
```

### `GET /api/v1/clients/:clientId/creative-profiles`

Lists all creative profile versions for the client.

## Campaign Lifecycle

The campaign should follow the canonical sequence described in [Campaign State Machine](campaign-state-machine.md), [Stage Contracts](stage-contracts.md), and [Campaign Backend Map](campaign-backend-map.md).

The backend should treat these endpoints as stateful transitions, not independent ad hoc actions:

- intake -> `POST /clients/:id/discovery`, `POST /clients/:id/social-intelligence`
- client record -> `GET|POST|PATCH /clients/:id/client-record`, `GET|POST|PATCH /clients/:id/brand-profile`, `GET|POST|PATCH /clients/:id/creative-profile`
- geo discoverability -> `GET|POST /clients/:id/geo-discoverability`
- research -> `GET|POST /clients/:id/research`, `POST /clients/:id/strategy-intelligence`
- strategy -> `GET|POST /clients/:id/strategy-recommendations`, optional `POST /clients/:id/proposals` when the checkpoint is confirmed
- content plan -> `POST /clients/:id/content-plan`
- long-form content -> `POST|GET /clients/:id/blog-draft`, `POST|GET /clients/:id/discovery-optimization`, `POST|GET /clients/:id/content-repurpose`
- schedule -> `POST /clients/:id/schedules`
- approval -> `GET|POST /clients/:id/approvals`, `PATCH /approvals/:approvalId`
- publish -> `GET|POST /clients/:id/publishing`
- monitoring -> `GET|POST|PATCH /clients/:id/monitoring`

If a later stage is requested before its contract is satisfied, the backend should report the earliest blocked stage instead of forcing progression.

### `GET /api/v1/clients/:clientId/campaign`

Returns the current campaign stage, next valid stage, blockers, and completion flags for the client workspace.

### `GET /api/v1/clients/:clientId/publishing`

Returns the latest publishing execution, its history, the resolved schedule payload, and the content production package plus repurpose payloads used for execution.

### `POST /api/v1/clients/:clientId/publishing`

Creates a publishing execution record.

Request:
```json
{
  "mode": "dry_run",
  "confirm": false,
  "platforms": ["instagram", "linkedin"]
}
```

Live mode requires explicit confirmation. The current backend records the execution, validation, and result output locally; it does not claim direct delivery to social platform APIs yet.

## Social Discovery

### `POST /api/v1/clients/:clientId/discovery`

Discovers official social profiles from the site and public web references.

Request:
```json
{
  "sourceUrls": [
    "https://realengenharia.com/"
  ]
}
```

Response:
```json
{
  "data": {
    "discoveredProfiles": [
      {
        "platform": "instagram",
        "handle": "@realengenhariapa",
        "url": "https://instagram.com/realengenhariapa",
        "confidence": "high"
      }
    ]
  }
}
```

### `POST /api/v1/clients/:clientId/social-intelligence`

Creates a new social intelligence snapshot.

Request:
```json
{
  "period": {
    "from": "2026-01-01",
    "to": "2026-03-29"
  },
  "sourceMode": "public-only"
}
```

Response:
```json
{
  "data": {
    "snapshotId": "sis_123",
    "status": "completed"
  }
}
```

### `POST /api/v1/clients/:clientId/strategy-intelligence`

Creates strategy intelligence assets from an existing YouTube strategy analysis.

Request:
```json
{
  "sourceAnalysisId": "yts_123"
}
```

Response:
```json
{
  "data": {
    "latestVersion": 3,
    "recommendation": {
      "primary": {
        "strategyName": "Autoridade por prova e mecanismo",
        "fitScore": 92
      }
    }
  }
}
```

## Market Presence Evolution

The market presence module stores a longitudinal baseline, interventions, checkpoints and comparisons so the product can compare the current state against the future state after organic actions.

### `GET /api/v1/clients/:clientId/market-presence`

Returns the latest baseline, intervention, checkpoint and comparison plus the full history for the client.

### `GET /api/v1/clients/:clientId/report`

Returns the unified client report derived from:
- client record
- market research and competitive intelligence
- market presence evolution
- latest proposal
- latest monitoring report
The report is the canonical consolidated delivery when the user opts into a single commercial document for the cycle.

The report is read-only and should not be treated as a primary source of truth. It is a synthesis for dashboard and commercial use.
The report also surfaces geographic coverage from the client context, prioritizing city and region for local businesses and falling back to country-level coverage when the location is not explicit.

### `POST /api/v1/clients/:clientId/market-presence/baselines`

Creates a new market presence baseline from the latest social intelligence snapshot and related evidence.

Request:
```json
{
  "scope": "local",
  "marketContext": "Belém e região metropolitana",
  "evidenceUrls": [
    "https://example.com/empresa"
  ]
}
```

### `POST /api/v1/clients/:clientId/market-presence/interventions`

Registers the organic actions executed between measurements.

Request:
```json
{
  "baselineId": "uuid",
  "periodStart": "2026-04-01",
  "periodEnd": "2026-05-15",
  "actionsTaken": [
    "publicacao de provas",
    "ajuste de bio",
    "novo CTA"
  ],
  "channelsEdited": [
    "instagram",
    "facebook",
    "site"
  ],
  "contentVolume": 12
}
```

### `POST /api/v1/clients/:clientId/market-presence/checkpoints`

Collects a new checkpoint after the intervention window.

Request:
```json
{
  "baselineId": "uuid",
  "interventionId": "uuid",
  "collectedAt": "2026-05-20",
  "evidenceUrls": [
    "https://example.com/post"
  ]
}
```

### `POST /api/v1/clients/:clientId/market-presence/compare`

Compares any checkpoint to a baseline and returns the delta, reading and analogy.

Request:
```json
{
  "baselineId": "uuid",
  "checkpointId": "uuid"
}
```

## Client Record and Research

### `GET /api/v1/clients/:clientId/client-record`

Returns the current editable client record.

### `GET /api/v1/clients/:clientId/brand-profile`

Returns the current brand profile with confirmed facts, inferred signals and proof gaps.

### `POST /api/v1/clients/:clientId/client-record`

Creates a new client record version.

### `POST /api/v1/clients/:clientId/brand-profile`

Creates a new brand profile version from the current intake evidence.

### `PATCH /api/v1/clients/:clientId/client-record`

Updates the current client record version.

### `PATCH /api/v1/clients/:clientId/brand-profile`

Updates the current brand profile version and preserves the confirmed versus inferred split.

## GEO / AI Discoverability

### `GET /api/v1/clients/:clientId/geo-discoverability`

Returns the current site-level GEO audit and its summary fields.

### `POST /api/v1/clients/:clientId/geo-discoverability`

Creates or updates the site-level GEO audit for the client workspace.

### `GET /api/v1/clients/:clientId/research`

Returns market research linked to the client record.

### `POST /api/v1/clients/:clientId/research`

Creates or updates market research input.
The request can include an optional `marketContext` string when the client already has explicit geographic hints.
The research step may also hydrate the brand profile when the initial pass uncovers enough evidence to infer audience, offer, palette and proof themes.

## Strategy Intelligence

### `GET /api/v1/clients/:clientId/strategy-intelligence`

Lists reusable strategic assets and the current recommendation for the client workspace.

### `GET /api/v1/strategy-intelligence/:assetId`

Returns one strategy intelligence record.

### `POST /api/v1/clients/:clientId/strategy-recommendations`

Selects the best stored strategy for the current product or service context.

Request:
```json
{
  "productContext": "premium consulting service",
  "serviceContext": "lead generation",
  "audienceContext": "founders and operators"
}
```

Response:
```json
{
  "data": {
    "recommendation": {
      "primary": {
        "strategyName": "Autoridade por prova e mecanismo",
        "fitScore": 92
      }
    }
  }
}
```

## Proposals

### `POST /api/v1/clients/:clientId/proposals`

Creates a proposal from the current client record and social intelligence.
The proposal engine should also read the latest market research when available, so market context and competitive signals influence the thesis and slide narrative.
The proposal endpoint should only be called after the proposal checkpoint is confirmed.

Request:
```json
{
  "archetype": "autoridade",
  "format": "7-slides"
}
```

### `GET /api/v1/clients/:clientId/proposals`

Lists proposal versions for the client workspace.

### `GET /api/v1/clients/:clientId/proposals/:proposalId`

Returns one proposal version.

## Proposal Checkpoint Flow

Before the proposal endpoints are used, the product should confirm whether this cycle needs the consolidated commercial report.

If the answer is yes:
- the cycle may call `POST /api/v1/clients/:clientId/proposals`
- the final delivery should be represented by the unified client report at `GET /api/v1/clients/:clientId/report`
- the report should consolidate research, social intelligence, proposal and deck summary

If the answer is no:
- the cycle should continue through research, strategy and content without creating the commercial proposal

## Content and Publishing

### `POST /api/v1/clients/:clientId/content-plan`

Creates a content plan from the proposal and client record.

### `POST /api/v1/clients/:clientId/blog-draft`

Creates or updates the long-form blog draft for the cycle.

### `GET /api/v1/clients/:clientId/blog-draft`

Returns the latest blog draft version for the client workspace.

### `POST /api/v1/clients/:clientId/discovery-optimization`

Finalizes the blog for SEO, GEO and LLM discovery readiness.

### `GET /api/v1/clients/:clientId/discovery-optimization`

Returns the latest discovery-optimized blog version for the client workspace.

### `POST /api/v1/clients/:clientId/content-repurpose`

Creates native social variants from the discovery-optimized blog.

### `GET /api/v1/clients/:clientId/content-repurpose`

Returns the latest repurpose package for the client workspace.

### `POST /api/v1/clients/:clientId/schedules`

Creates a publishing schedule.

### `GET /api/v1/clients/:clientId/publishing-profiles`

Returns the configured channel connections for the client.

The response must expose only operational metadata:
- channel
- provider
- account label
- connection status
- approval mode
- publish mode
- capability flags
- last validation timestamps

The response must never expose raw credentials or token material.

### `POST /api/v1/clients/:clientId/publishing-profiles`

Creates a publishing profile for a client/channel/account combination.

Request:
```json
{
  "channel": "instagram",
  "provider": "rube",
  "accountLabel": "main-brand",
  "externalAccountId": "1784...",
  "secretRef": "clients/amiclube/instagram/main-brand",
  "approvalMode": "manual",
  "publishMode": "dry_run_only",
  "capabilities": {
    "singleImage": true,
    "carousel": true,
    "video": true
  },
  "constraints": {
    "dailyLimit": 25,
    "requiresBusinessAccount": true
  }
}
```

Notes:
- `secretRef` must reference an external secrets backend.
- The API should validate shape and policy, but must not persist raw credential values.
- `secretRef` may use logical refs or provider schemes such as `env://`, `aws-sm://`, `vault://`, `azure-kv://`, and `gcp-sm://`.

### `PATCH /api/v1/clients/:clientId/publishing-profiles/:profileId`

Updates publishing policy or connection metadata for an existing profile.

Allowed updates:
- `accountLabel`
- `approvalMode`
- `publishMode`
- `capabilities`
- `constraints`
- `connectionStatus`
- `lastErrorCode`
- `lastErrorMessage`

### `POST /api/v1/clients/:clientId/publishing-profiles/:profileId/validate`

Runs a safe connectivity check for the profile.

Response:
```json
{
  "data": {
    "profileId": "uuid",
    "channel": "instagram",
    "provider": "rube",
    "connectionStatus": "active",
    "validatedAt": "2026-04-18T18:00:00Z",
    "checks": {
      "secretResolved": true,
      "providerReachable": true,
      "requiredScopesPresent": true
    },
    "secretResolution": {
      "backend": "aws-sm",
      "envKey": "OMNI_SECRET__AWS_SM_CLIENTS_AMICLUBE_INSTAGRAM_MAIN_BRAND",
      "fields": ["accessToken", "instagramBusinessAccountId"],
      "resolved": true,
      "errorCode": null
    }
  },
  "meta": {
    "requestId": "req_123",
    "agencyId": "agency_123"
  }
}
```

### `GET /api/v1/clients/:clientId/publishing`

Returns the latest publishing execution, its history, the schedule payload, and the repurpose/content production package payloads used to validate the run.

### `POST /api/v1/clients/:clientId/publishing`

Creates a publishing execution record.

Request:
```json
{
  "scheduleId": "uuid",
  "publishingProfileId": "uuid",
  "mode": "dry_run",
  "platforms": ["instagram"],
  "payload": {
    "channel": "instagram",
    "format": "carousel",
    "publishAt": "2026-04-21T15:00:00Z"
  }
}
```

The current backend supports:
- canonical manifest generation from schedule, content package, and rendered assets
- live publication through the Meta Graph adapter for single-image Instagram posts when a public media URL is available
- manual handoff profiles that end in `queued`
- dry-run validation for non-automated providers

Live publishing must require a profile whose `publishMode` is `live_enabled` and whose `connectionStatus` is `active`.

## Monitoring

### `POST /api/v1/clients/:clientId/monitoring`

Creates a monitoring report for a cycle.

### `GET /api/v1/clients/:clientId/monitoring`

Returns monitoring history.

## Evidence

### `POST /api/v1/clients/:clientId/evidence`

Registers evidence linked to a client record, proposal, or intelligence snapshot.

## Health

### `GET /health`

Basic liveness check.

### `GET /ready`

Readiness check for app and database connectivity.

## Validation Rules

- `agency_id` must exist for every write.
- `client_id` must belong to the active agency.
- Invalid payloads must return `400`.
- Unauthorized requests must return `401`.
- Cross-tenant access must return `403`.
- Missing resources must return `404`.

## Final Recommendation

This contract is intentionally small. It is enough to power the first dashboard, the social intelligence flow, and the proposal engine without creating a brittle API surface.
