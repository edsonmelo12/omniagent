# Backend Architecture Blueprint

## Goal

Define the backend layer for the Social Growth platform so the product can start with Markdown artifacts, then move the stable flow into PostgreSQL without redesign.

## Decision Summary

- Use a modular monolith for the MVP.
- Keep the API as a TypeScript backend.
- Keep Markdown artifacts as the initial drafting and review layer.
- Use PostgreSQL as the persistence layer after migration and runtime use.
- Keep SQL migrations as the schema evolution mechanism once the database becomes authoritative.
- Expose a REST API first.
- Keep the dashboard thin and data-driven.
- Preserve a clean path to remote hosting, job workers, and dashboard expansion.

## Recommended Stack

### Application Layer

- Node.js 20+
- TypeScript
- Fastify for HTTP
- Zod for request and response validation

### Data Layer

- PostgreSQL 16
- SQL migrations in versioned files
- Repository layer for database access
- JSONB only for fields that are naturally variable

### Integration Layer

- REST endpoints for the dashboard and future client apps
- Webhooks for external events
- Background jobs for long-running social intelligence tasks
- Optional public-source enrichment via Brave Search, configured only in backend environment variables
- Optional social presence API providers, configured only when the provider key is available
- Meta Graph API for Facebook and Instagram presence when `META_GRAPH_ACCESS_TOKEN` is present
- Instagram Business Discovery also expects `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
- Brave Search can also help discover social profile URLs before capture

### Observability Layer

- Structured logs with request correlation ids
- Health endpoints for liveness and readiness
- Audit events for important state changes

## Why This Stack

This stack matches the current shape of the product:

- the dashboard already uses TypeScript and React
- the product started as Markdown artifacts and then hardened into tables
- the database layer is already defined with SQL migrations
- the product needs a small but reliable backend first
- the architecture must stay portable for later remote deployment
- the proposal checkpoint must be respected across chat, API and pipeline docs

## Architecture Style

### MVP Shape

Use a modular monolith with clear domain boundaries:

- identity and access
- agency tenancy
- client workspaces
- social profile discovery
- social intelligence
- social presence snapshots

- briefs and research
- proposals
- content planning
- approvals and monitoring
- evidence and files

Social presence collection is API-first when a provider is configured, with HTML scraping as fallback for networks or workspaces that do not yet have official access.

### Why Not Microservices Yet

- the domain is still being shaped
- the product needs speed over infrastructure overhead
- the first version has shared data and shared workflows
- microservices would add deployment and coordination cost too early

## Service Boundaries

### Identity and Access

Owns:
- agencies
- users
- memberships
- roles and permissions

### Client Core

Owns:
- clients
- client sites
- workspace metadata

### Social Intelligence

Owns:
- social profiles
- discovery state
- intelligence snapshots
- evidence sources

### Strategy Intelligence

Owns:
- youtube strategy analyses
- reusable strategy assets
- recommendation ranking by product or service fit

### Client Record and Strategy

Owns:
- client records
- market research
- strategy inputs

### Proposal Engine

Owns:
- proposals
- archetype selection
- proposal versions
- the unified client report when a consolidated commercial delivery is requested

### Content and Monitoring

Owns:
- content plans
- blog drafts
- discovery-optimized posts
- repurpose packages
- content production packages
- schedules
- approvals
- monitoring reports

### Publishing Executor

Current owner:
- backend publishing executor
- dry-run validation
- explicit live publish confirmation
- publish outcome logging
- publishing profile resolution
- runtime secret lookup through `secret_ref`

Still missing:
- platform-specific publish adapters
- external platform API delivery
- queue/worker orchestration for real network posting

Recommended additions:
- `publishing_profiles` for multi-client channel connectivity
- secret manager integration for runtime credential resolution
- adapter isolation by channel and provider
- validation that keeps raw credentials out of database rows and Markdown artifacts

### Campaign Orchestration

Owns:
- campaign state machine
- stage transition checks
- semantic invalidation rules when the client record changes
- next-step resolution for the dashboard and assistant
- note-only client record revisions stay local
- the campaign state exposes changed client-record sections, paths, and impact hints for auditability
- identity and diagnosis changes reopen research and downstream stages
- narrative and offer changes reopen strategy and downstream stages
- long-form content changes reopen blog drafting, discovery optimization, repurpose, content packaging and schedule stages

## API Shape

Start with a small REST surface:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /me`
- `GET /agencies`
- `POST /agencies`
- `GET /clients`
- `POST /clients`
- `GET /clients/:id`
- `GET /clients/:id/campaign`
- `POST /clients/:id/discovery`
- `POST /clients/:id/social-intelligence`
- `POST /clients/:id/social-presence`
- `GET /clients/:id/social-presence`
- `POST /clients/:id/youtube-strategy-analyses`
- `GET /clients/:id/strategy-intelligence`
- `POST /clients/:id/strategy-recommendations`
- `GET /clients/:id/client-record`
- `POST /clients/:id/client-record`
- `PATCH /clients/:id/client-record`
- `GET /clients/:id/report`
- `POST /clients/:id/proposals`
- `GET /clients/:id/proposals`
- `POST /clients/:id/content-plan`
- `POST /clients/:id/blog-draft`
- `GET /clients/:id/blog-draft`
- `POST /clients/:id/discovery-optimization`
- `GET /clients/:id/discovery-optimization`
- `POST /clients/:id/content-repurpose`
- `GET /clients/:id/content-repurpose`
- `GET /clients/:id/publishing-profiles`
- `POST /clients/:id/publishing-profiles`
- `PATCH /clients/:id/publishing-profiles/:profileId`
- `POST /clients/:id/publishing-profiles/:profileId/validate`
- `GET /clients/:id/publishing`
- `POST /clients/:id/publishing`
- `POST /clients/:id/monitoring`

The dashboard should consume these endpoints directly.

The stateful sequence is documented in [Campaign Backend Map](campaign-backend-map.md).

## Data Access Rules

- Controllers do not access the database directly.
- Domain services own business rules.
- Repositories isolate SQL details.
- Validation happens before persistence.
- Cross-tenant access is denied at the service boundary.

## Tenant Model

Every request must resolve to:

- a user
- an agency tenant
- a workspace or client context

No query should ignore `agency_id`.

## Authentication Recommendation

For the MVP:

- support password or session-based login locally
- keep the auth adapter replaceable later
- avoid binding business rules to the auth provider

This keeps the system portable if the identity layer changes later.

## Background Jobs

Use async jobs for:

- discovering official social profiles
- scraping public social signals
- building intelligence summaries
- generating proposal drafts
- assembling the unified client report when the proposal checkpoint is accepted
- compiling monitoring reports
- executing future publish adapters after explicit confirmation
- validating publishing profile connectivity without exposing raw secrets
- enriching social and market research with Brave Search when `BRAVE_SEARCH_API_KEY` is present
- enriching Facebook and Instagram social presence with Meta Graph API when `META_GRAPH_ACCESS_TOKEN` is present

Jobs should be idempotent and retry-safe.

## File Storage

Do not store large binaries in PostgreSQL.

Store in file storage:

- screenshots
- exports
- attachments
- generated presentation assets

Store only metadata and references in the database.

## Observability Requirements

Minimum required signals:

- request id
- agency id
- client id
- user id
- job id
- operation type
- error class

Minimum operational endpoints:

- `/health`
- `/ready`

## Local-to-Remote Path

The backend must use `DATABASE_URL` only once the relational phase is active.

Local:
- Dockerized PostgreSQL
- local API process
- local dashboard

Remote:
- managed PostgreSQL
- same SQL migrations
- same backend code
- same API contracts

Documentation layer:
- operating docs and review copies in `pipeline/data/*.md` and `output/**/*.md`
- database as the runtime source of truth for clients, products and services
- human review remains optional, not the authoritative store

## Suggested Internal Module Layout

- `auth`
- `tenancy`
- `clients`
- `social-discovery`
- `social-intelligence`
- `social-presence`
- `briefs`
- `research`
- `proposals`
- `content`
- `monitoring`
- `strategy-intelligence`
- `files`
- `audit`

Each module should own:
- routes
- service layer
- repository layer
- types and validation

## Implementation Starter

The backend repository should start with:

- `package.json`
- `tsconfig.json`
- `Dockerfile`
- `src/server.ts`
- `src/app/server.ts`
- `src/app/routes.ts`
- shared HTTP, logging and database primitives

This gives the team a minimal runnable backend before domain modules are filled in.

## MVP Release Order

1. Boot the backend with health checks.
2. Wire database access through `DATABASE_URL`.
3. Implement identity, agency, and client core.
4. Add social discovery and intelligence ingestion.
5. Add client record and proposal endpoints.
6. Add content and monitoring endpoints.
7. Connect the dashboard to the API.

## Risks

- auth scope can expand too early
- tenant isolation bugs can leak data across agencies
- background jobs can grow before the API is stable
- analytics and reporting can pull the team into premature complexity

## Final Recommendation

Build a TypeScript Fastify backend as a modular monolith on PostgreSQL, keep SQL migrations as the contract, and let the dashboard consume a small REST surface.

This is the simplest architecture that still looks and behaves like a serious product.
