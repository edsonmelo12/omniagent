# Local Publishing Secrets

This is the simplest local setup for per-client publishing credentials.

## Decision

- Keep `secretRef` in database profiles.
- Keep raw tokens in local `.env`.
- Use `env://...` refs per client/channel/account.

Do not store raw tokens in database rows.

## Quick Start (AmiClube)

1. Generate standard names:

```bash
npm run publishing:secret:make -- --client amiclube --channel instagram --account main
```

2. Add the generated variable to `backend/.env`:

```env
PUBLISHING_AMICLUBE_INSTAGRAM_MAIN='{"accessToken":"<token>","instagramBusinessAccountId":"<1784...>"}'
```

3. Use this `secretRef` in publishing profile:

```text
env://PUBLISHING_AMICLUBE_INSTAGRAM_MAIN
```

4. Validate resolution:

```bash
npm run publishing:secret:validate -- --secret-ref env://PUBLISHING_AMICLUBE_INSTAGRAM_MAIN
```

If `resolved: true`, the backend can use this profile in `dry_run` and `live` (subject to profile policy).

## New Client Pattern

For each new client:

- Create a new env variable with client/channel/account naming.
- Create a `publishing_profile` row with its own `secretRef`.
- Run profile validation endpoint before enabling live mode.

## Migration Later

When moving to Vault/Secrets Manager:

- Keep the same `secretRef` contract in DB.
- Replace local env values with provider-backed references.
- No schema redesign needed.
