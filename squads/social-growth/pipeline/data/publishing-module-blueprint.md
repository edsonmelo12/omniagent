# Publishing Module Blueprint

## Purpose

Define the multi-client publishing layer that sits after content approval and schedule generation.

The squad should keep creating approved content packages.
The publishing module should own credentials, channel connectivity, dry-run validation, live posting, retries, and execution logging.

## Hard Rules

- Never store raw client credentials in Markdown artifacts.
- Never store raw client credentials in application tables.
- Store only a `secret_ref` in the database.
- Resolve secrets at runtime from a secrets backend.
- Treat publishing as tenant-aware and client-scoped at every step.

## Secrets Strategy

Recommended backends:

- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault

Recommended logical path shape:

- `clients/{client_slug}/instagram/{account_alias}`
- `clients/{client_slug}/linkedin/{account_alias}`
- `clients/{client_slug}/facebook/{account_alias}`

Supported `secret_ref` schemes in the current backend:

- plain logical ref such as `clients/amiclube/instagram/main-brand`
- `env://PUBLISHING_INSTAGRAM_MAIN`
- `aws-sm://clients/amiclube/instagram/main-brand`
- `vault://clients/amiclube/instagram/main-brand#accessToken`
- `azure-kv://main-vault/amiclube-instagram`
- `gcp-sm://project/amiclube-instagram/latest`

Current runtime behavior:

- `env://...` resolves directly from the named environment variable
- external schemes resolve through an environment bridge using `PUBLISHING_SECRET_ENV_PREFIX`
- the database still stores only `secret_ref`, never raw tokens

The backend should persist only:

- `client_id`
- `channel`
- `provider`
- `account_label`
- `external_account_id`
- `secret_ref`
- `connection_status`
- `approval_mode`
- `publish_mode`
- `capabilities_json`
- `constraints_json`

## Publishing Profile

One client can have multiple publishing profiles.

Examples:

- one Instagram Business account for the main brand
- one LinkedIn company page
- one fallback manual profile for handoff-only workflows

Each publishing profile should answer:

- which channel is active
- which provider handles delivery
- where the secret lives
- whether live posting is enabled
- whether the client requires manual approval
- what format and volume constraints apply

## Canonical Publishing Package

Every downstream publish attempt should start from a canonical package:

```json
{
  "clientId": "uuid",
  "scheduleId": "uuid",
  "publishingProfileId": "uuid",
  "mode": "dry_run",
  "channel": "instagram",
  "format": "carousel",
  "copy": {
    "caption": "...",
    "hashtags": ["..."],
    "cta": "..."
  },
  "assets": [
    {
      "url": "https://...",
      "mimeType": "image/png",
      "alt": "..."
    }
  ],
  "publishAt": "2026-04-18T15:00:00Z",
  "sourceArtifacts": {
    "contentProductionPackageId": "uuid",
    "contentRepurposePackageId": "uuid",
    "scheduleVersion": 3
  }
}
```

## Runtime Flow

1. Resolve the client and publishing profile.
2. Verify `publish_mode` and `connection_status`.
3. Resolve the secret from the configured backend using `secret_ref`.
4. Validate payload rules for the target channel.
5. Run `dry_run` or `live`.
6. Persist the execution in `publishing_executions`.
7. Record result, validation output, and any provider response metadata.

## Connection States

- `disconnected` — no usable connection yet
- `pending_auth` — auth flow started but not completed
- `active` — ready for dry-run and live according to profile policy
- `reauth_required` — token expired or scopes invalid
- `paused` — intentionally disabled
- `revoked` — access removed by the client or provider
- `error` — runtime or validation issue needs manual intervention

## Approval Modes

- `manual` — human approval before any live publish
- `two_step` — content approval plus explicit publish approval
- `auto` — approved schedule can publish automatically

## Publish Modes

- `dry_run_only` — validate and log, never publish live
- `live_enabled` — live posting allowed when approvals pass

## Adapter Strategy

Start with:

- Instagram single-image publishing via `meta_graph`
- manual handoff profiles for any channel
- dry-run validation for registered but not yet automated providers

Later:

- Instagram via `instagram-automation`
- LinkedIn via `linkedin-automation`
- Facebook Page posting
- Pinterest
- TikTok
- YouTube

The adapter layer must remain replaceable.
The publishing profile points to the provider, not the squad.
