# Local DB Setup

## Goal

Run PostgreSQL as the persistence phase and keep it as the source of truth for operational records.

## Recommended Setup

- PostgreSQL 16
- Docker Compose
- environment variables for connection
- optional backend environment variables for public-source enrichment
- versioned SQL migrations
- JSONB only where the content is highly variable

This setup is for the migration phase and for steady-state operation.
The Markdown files in `pipeline/data/` and `output/` remain optional documentation or review artifacts.
PostgreSQL is the operational source of truth for client, product and service records.

## Local Connection

Suggested local database name:
- `social_growth`

Suggested local user:
- `social_growth`

Suggested local password:
- `social_growth_local_change_me`

Suggested local port:
- `5432`

## Connection Rule

The application must read the database connection from `DATABASE_URL`.
Optional public-source enrichment for social and market research is controlled by `BRAVE_SEARCH_API_KEY` in `backend/.env.example`.
Optional Meta Graph API presence collection is controlled by `META_GRAPH_ACCESS_TOKEN` in `backend/.env.example`.
Instagram official presence capture also expects `META_INSTAGRAM_BUSINESS_ACCOUNT_ID` in `backend/.env.example`.
Optional YouTube presence collection is controlled by `SOCIAL_PRESENCE_YOUTUBE_API_KEY` in `backend/.env.example`.
If the keys are not present, the backend skips the API path and continues with the database, first-party sources, and HTML fallback.
Brave Search can also supplement social profile discovery when a client site does not list the handles directly.

Examples:

```bash
DATABASE_URL=postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth
```

Later, the same variable can point to a remote database without changing the schema or the application code.

## Access

Start the local database from the Postgres runbook:

```bash
cd squads/social-growth/infra/postgres
docker compose up -d
```

Connect with:

```bash
psql postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth
```

## Local Workflow

1. Start PostgreSQL with Docker Compose.
2. Apply migrations from `infra/postgres/migrations/` in numeric order.
3. Seed minimal development data directly into the database when needed.
4. Run the app against the local database.
5. Verify the schema and workflow locally.
6. Promote the same migrations to staging and production later.

## What Goes In the Database

- agencies
- users
- memberships
- clients
- sites
- social profiles
- social intelligence snapshots
- social presence snapshots
- creative profiles
- youtube strategy analyses
- strategy intelligence assets
- briefs
- blog drafts
- discovery-optimized posts
- content repurpose packages
- market research
- proposals
- content plans
- content production packages
- approvals
- schedules
- monitoring reports
- evidence files

These are the persisted records of the same concepts; Markdown review copies may be generated from them, but they are not the source of truth.

## What Should Stay Outside the Database

- large binary assets
- screenshots
- file attachments
- exports

These should live in file storage, with database references.

## Migration Principle

Do not hand-edit production data tables in an ad hoc way.
Use migrations for schema evolution and preserve history.

## Remote Migration Path

When moving to a remote database:
- keep the same schema
- keep the same migrations
- change only `DATABASE_URL`
- move file storage independently if needed

The backend architecture blueprint assumes this exact rule and keeps the API isolated from the database location.

The API contract and folder structure docs assume the same local-first setup, with Markdown limited to documentation or export artifacts.

## Final Recommendation

Use local PostgreSQL as a development mirror of the future remote database.
This keeps the product portable and avoids a painful migration later.
