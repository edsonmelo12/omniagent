# PostgreSQL Local Setup

## Purpose

PostgreSQL runbook for the persistence phase of the Social Growth platform.
Use this as the durable storage layer for the platform.
Markdown artifacts are optional review/export copies; the database is the active runtime store for persisted strategy and client data.

## How to Use

1. Start the database with Docker Compose.
2. Set `DATABASE_URL` to the local connection string.
3. Apply the SQL migrations in `migrations/` in numeric order.
4. Keep the same migrations for staging and production.
5. Seed or update persisted records directly in the database.

## Access

Start the local database from this directory:

```bash
cd squads/social-growth/infra/postgres
docker compose up -d
```

Open a `psql` shell with the documented credentials:

```bash
psql postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth
```

## Local Connection

```bash
DATABASE_URL=postgresql://social_growth:social_growth_local_change_me@localhost:5432/social_growth
```

## Migration Order

Run the files in `migrations/` from `001` through `017`.

## Rule

Do not edit the schema manually once migrations are in place.
Use a new migration for every structural change.
Treat the database as the source of truth and Markdown as a human-readable derivative only.
