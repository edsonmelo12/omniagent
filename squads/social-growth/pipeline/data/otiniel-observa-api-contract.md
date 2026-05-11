# Otiniel Observa - API Contract

## Purpose

Define the first backend contract required to operate `Otiniel Observa`.

## Contract Principles

- all routes are agency- and client-aware
- observation profile lifecycle is explicit
- collection and summary generation are separate concerns
- analytical consumers read summaries, not raw payloads

## Base Prefix

- `/api/v1`

## Headers

- `Authorization: Bearer <token>` or valid session
- `X-Agency-Id` when agency is not derived from session
- `X-Request-Id` optional for tracing

## Observation Profiles

### `GET /api/v1/clients/:clientId/observation-profiles`

Returns all observation profiles for the client.

### `POST /api/v1/clients/:clientId/observation-profiles`

Creates a profile.

Request:
```json
{
  "provider": "ga4",
  "channel": "site",
  "accountRef": "properties/123456789",
  "propertyRef": "123456789",
  "displayName": "Main GA4 Property",
  "secretRef": "secret://clients/real-engenharia/ga4/oauth",
  "scopes": ["read:analytics"]
}
```

### `PATCH /api/v1/clients/:clientId/observation-profiles/:profileId`

Updates metadata, status or display fields.

### `POST /api/v1/clients/:clientId/observation-profiles/:profileId/validate`

Validates the connection using current credentials and provider metadata.

Response:
```json
{
  "data": {
    "status": "active",
    "validatedAt": "2026-04-19T14:00:00Z",
    "checks": [
      {"name": "secret_resolved", "status": "ok"},
      {"name": "provider_access", "status": "ok"}
    ]
  }
}
```

## Manual Intake

### `POST /api/v1/clients/:clientId/observation-intake/manual`

Creates one manual intake event.

Request:
```json
{
  "sourceType": "csv_upload",
  "providerName": "manual",
  "channel": "instagram",
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-04-07T23:59:59Z",
  "records": [
    {
      "assetExternalRef": "ig_post_123",
      "metrics": [
        {"name": "impressions", "value": 1200, "unit": "count"},
        {"name": "saves", "value": 30, "unit": "count"}
      ]
    }
  ],
  "notes": "Weekly export from client spreadsheet"
}
```

Response:
- created intake reference
- created collection run id
- received record count

## Connector Collection

### `POST /api/v1/clients/:clientId/observation-profiles/:profileId/collect`

Triggers collection for one profile.

Request:
```json
{
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-04-07T23:59:59Z",
  "mode": "incremental"
}
```

### `GET /api/v1/clients/:clientId/collection-runs`

Lists collection runs for the client.

Query:
- `profileId`
- `status`
- `limit`

### `GET /api/v1/clients/:clientId/collection-runs/:runId`

Returns run details, counts and error state.

## Summaries

### `GET /api/v1/clients/:clientId/observation-summaries`

Returns summaries for analyst consumption.

Query:
- `windowType` required: `asset|weekly|monthly`
- `periodStart`
- `periodEnd`
- `assetId` optional

Summary payload must follow the governed contract:
- context keys (`client_id`, `channel`, `window_type`, period fields)
- aggregated metrics only
- derived rates with explicit formula policy
- `collection_source`, `evidence_level`, `completeness_status`

Summary payload must never include:
- personal identifiers
- raw textual user feedback (comments, DMs, form text)
- `secret_ref` or any credential material

### `POST /api/v1/clients/:clientId/observation-summaries/generate`

Generates or regenerates summaries.

Request:
```json
{
  "windowType": "weekly",
  "periodStart": "2026-04-01T00:00:00Z",
  "periodEnd": "2026-04-07T23:59:59Z"
}
```

## Coverage

### `GET /api/v1/clients/:clientId/observation-coverage`

Returns:
- connected sources
- missing sources
- profile status distribution
- domain coverage by social/site/business/qualitative
- high-risk gaps

## Errors

Recommended error codes:
- `OBSERVATION_PROFILE_INVALID`
- `SECRET_REF_UNRESOLVABLE`
- `COLLECTION_RUN_FAILED`
- `NORMALIZATION_ERROR`
- `SUMMARY_GENERATION_FAILED`
- `TENANCY_MISMATCH`

## Non-Goals

This contract does not expose:
- raw provider credentials
- direct provider token refresh responses
- analytical verdict creation
