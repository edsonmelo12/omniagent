# Backend Folder Structure

## Purpose

Define a clean backend repository layout for the Social Growth platform so implementation starts with bounded modules instead of a pile of generic folders.

## Recommended Layout

```text
backend/
  src/
    app/
      server.ts
      env.ts
      routes.ts
    modules/
      auth/
        auth.routes.ts
        auth.service.ts
        auth.repository.ts
        auth.schemas.ts
      tenancy/
        tenancy.service.ts
        tenancy.repository.ts
      clients/
        clients.routes.ts
        clients.service.ts
        clients.repository.ts
        clients.schemas.ts
      social-discovery/
        social-discovery.routes.ts
        social-discovery.service.ts
        social-discovery.repository.ts
        social-discovery.schemas.ts
      social-intelligence/
        social-intelligence.routes.ts
        social-intelligence.service.ts
        social-intelligence.repository.ts
        social-intelligence.schemas.ts
      social-presence/
        social-presence.routes.ts
        social-presence.service.ts
        social-presence.repository.ts
        social-presence.search.ts
        social-presence.schemas.ts
      client-record/
        client-record.routes.ts
        client-record.service.ts
        client-record.repository.ts
        client-record.schemas.ts
      research/
        research.routes.ts
        research.service.ts
        research.repository.ts
        research.schemas.ts
      proposals/
        proposals.routes.ts
        proposals.service.ts
        proposals.repository.ts
        proposals.schemas.ts
      content/
        content.routes.ts
        content.service.ts
        content.repository.ts
        content.schemas.ts
      monitoring/
        monitoring.routes.ts
        monitoring.service.ts
        monitoring.repository.ts
        monitoring.schemas.ts
      files/
        files.service.ts
        files.repository.ts
      audit/
        audit.service.ts
        audit.repository.ts
    shared/
      db/
        database.ts
        transactions.ts
      http/
        errors.ts
        request-context.ts
        response-envelope.ts
      logging/
        logger.ts
      security/
        auth-context.ts
        tenant-guard.ts
      utils/
        pagination.ts
        dates.ts
  test/
  migrations/
  package.json
  tsconfig.json
  Dockerfile
```

## Folder Rules

- `app/` owns bootstrapping and server wiring.
- `modules/` owns domain behavior.
- `shared/` only contains reusable infrastructure primitives.
- `migrations/` must stay SQL-only.
- `test/` keeps integration and contract tests.

## Module Boundaries

### Routes

- Parse input
- call services
- return envelopes

### Services

- enforce business rules
- manage workflow steps
- coordinate repository calls

### Repositories

- isolate SQL
- map rows to domain objects
- never contain policy decisions

### Schemas

- validate request input
- validate response shapes where useful

## Naming Rules

- Prefer domain names over generic names.
- Avoid `utils`, `helpers`, and `common` except in `shared/` for truly reusable primitives.
- Keep a one-to-one relationship between a domain module and its core files.

## Implementation Order

1. `app/server.ts`
2. `shared/db/database.ts`
3. `modules/auth`
4. `modules/tenancy`
5. `modules/clients`
6. `modules/social-discovery`
7. `modules/social-intelligence`
8. `modules/client-record`
9. `modules/proposals`
10. `modules/content`
11. `modules/monitoring`

## Final Recommendation

This structure is small enough to move fast and strict enough to avoid turning the backend into a loose collection of scripts.
