# Otiniel Observa - Secret Management

## Purpose

Define how `Otiniel Observa` resolves secrets safely in a multi-client environment.

## Core Rule

`Otiniel Observa` must never depend on one environment variable per client connection.

Correct:
- global provider application credentials in backend environment
- per-client connected-account credentials resolved through `secret_ref`

Incorrect:
- `CLIENT_A_META_TOKEN`
- `CLIENT_B_GA4_REFRESH_TOKEN`
- `CLIENT_C_LINKEDIN_TOKEN`

## Secret Classes

### Global Application Credentials

Owned by the platform.

Examples:
- `META_APP_ID`
- `META_APP_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `BRAVE_SEARCH_API_KEY`

These belong in backend environment or secure platform-level secret storage.

### Client Connection Secrets

Owned by a client/provider/account pair.

Examples:
- access token
- refresh token
- service account material
- CRM token

These must be referenced through `secret_ref`.

## `secret_ref` Contract

Every observation profile should store a `secret_ref`, not raw credential material.

Examples:
- `secret://clients/real-engenharia/meta/main`
- `secret://clients/porto-real/ga4/property-main`
- `secret://clients/amiclube/hubspot/default`

## Resolution Rules

1. Resolve `secret_ref` at runtime only.
2. Do not persist resolved secrets in observation tables.
3. Do not log resolved secret values.
4. Mask provider error payloads that may echo credentials.
5. Keep secret resolution behind one abstraction boundary.

## Recommended Resolution Abstraction

Use one internal interface:

- `resolveSecret(secretRef)`
- `validateSecret(secretRef)`
- `rotateSecret(secretRef, nextRef)` optional later

This allows moving from env-backed secrets to a real secret manager without rewriting connector logic.

## Initial Implementation Strategy

### Phase 1

Support env-backed or local-secret-backed resolution through one adapter.

### Phase 2

Move to managed secret storage if the platform needs stronger operational controls.

## Audit Requirements

Log:
- secret resolution attempted
- secret resolution succeeded or failed
- which profile requested it
- when it happened

Never log:
- token values
- raw credential payloads
- secret manager plaintext responses

## Failure Modes

Treat these as explicit operational states:
- secret missing
- secret invalid
- secret expired
- provider rejected credential
- secret/profile mismatch

These should degrade profile status, not silently fail collection.
