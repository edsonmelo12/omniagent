# Campaign Backend Map

## Purpose

Map the campaign states to the existing backend endpoints and service boundaries.

This is the bridge between the workflow design and the HTTP/API layer.

## Canonical Sequence

1. `intake`
2. `client_record`
3. `geo_discoverability`
4. `research`
5. `strategy`
6. `content_plan`
7. `blog_draft`
8. `discovery_optimization`
9. `content_repurpose`
10. `content_production_package`
11. `schedule`
12. `approval`
13. `publish`
14. `monitoring`
15. `adjustment`

## Endpoint Mapping

### `intake`

Primary endpoints:
- `POST /api/v1/clients/:clientId/discovery`
- `POST /api/v1/clients/:clientId/social-intelligence`

Purpose:
- capture source material
- discover profiles
- build the first evidence layer

### `client_record`

Primary endpoints:
- `GET /api/v1/clients/:clientId/client-record`
- `POST /api/v1/clients/:clientId/client-record`
- `PATCH /api/v1/clients/:clientId/client-record`

Purpose:
- create the editable base record
- accept corrections from the user
- ignore note-only edits for downstream invalidation
- reopen only the stages affected by identity, diagnosis, narrative, or offer changes
- expose the changed client-record sections, paths, and impact hints to the campaign state

### `geo_discoverability`

Primary endpoints:
- `GET /api/v1/clients/:clientId/geo-discoverability`
- `POST /api/v1/clients/:clientId/geo-discoverability`

Purpose:
- evaluate the site and brand entity for AI discoverability
- capture canonical positioning, proof density and schema readiness
- decide whether article-level scaling is safe yet

### `research`

Primary endpoints:
- `GET /api/v1/clients/:clientId/research`
- `POST /api/v1/clients/:clientId/research`
- `POST /api/v1/clients/:clientId/strategy-intelligence`

Purpose:
- assemble market context
- enrich the evidence base

### `strategy`

Primary endpoints:
- `GET /api/v1/clients/:clientId/strategy-intelligence`
- `POST /api/v1/clients/:clientId/strategy-recommendations`
- `POST /api/v1/clients/:clientId/proposals`

Purpose:
- turn evidence into strategic direction
- choose the recommendation that supports the campaign

### `content_plan`

Primary endpoints:
- `POST /api/v1/clients/:clientId/content-plan`
- `GET /api/v1/clients/:clientId/content`

Purpose:
- define themes, cadence and formats

### `blog_draft`

Primary endpoints:
- `POST /api/v1/clients/:clientId/blog-draft`
- `GET /api/v1/clients/:clientId/blog-draft`

Purpose:
- create the long-form draft when the cycle includes blog content

### `discovery_optimization`

Primary endpoints:
- `POST /api/v1/clients/:clientId/discovery-optimization`
- `GET /api/v1/clients/:clientId/discovery-optimization`

Purpose:
- finalize the blog for SEO, content GEO and LLM discoverability after the site-level GEO audit when needed

### `content_repurpose`

Primary endpoints:
- `POST /api/v1/clients/:clientId/content-repurpose`
- `GET /api/v1/clients/:clientId/content-repurpose`

Purpose:
- translate the discovery-optimized blog into native social assets

### `content_production_package`

Primary endpoints:
- `GET /api/v1/clients/:clientId/content`

Purpose:
- persist or return the content production package ready for review

### `schedule`

Primary endpoints:
- `GET /api/v1/clients/:clientId/content`
- `POST /api/v1/clients/:clientId/schedules`

Purpose:
- convert the content production package into a realistic publishing order

### `approval`

Primary endpoints:
- `GET /api/v1/clients/:clientId/approvals`
- `POST /api/v1/clients/:clientId/approvals`
- `PATCH /api/v1/approvals/:approvalId`

Purpose:
- block execution until the schedule is explicitly approved

### `publish`

Primary endpoints:
- `GET /api/v1/clients/:clientId/publishing`
- `POST /api/v1/clients/:clientId/publishing`

Purpose:
- execute the approved schedule
- record dry-run and live-simulated publishing output

Current reality:
- this stage is modeled in the campaign state machine
- the backend now stores a publishing execution record with validation and result data
- live platform delivery is still simulated; there is no network adapter to Instagram, LinkedIn or other social platforms yet
- the system still relies on schedule approval plus explicit publish execution

### `monitoring`

Primary endpoints:
- `GET /api/v1/clients/:clientId/monitoring`
- `POST /api/v1/clients/:clientId/monitoring`
- `PATCH /api/v1/clients/:clientId/monitoring`

Purpose:
- measure the result of the cycle
- generate operational observations

### `adjustment`

Primary endpoints:
- `PATCH /api/v1/clients/:clientId/client-record`
- `POST /api/v1/clients/:clientId/research`
- `POST /api/v1/clients/:clientId/content-plan`

Purpose:
- feed monitoring back into the next cycle
- reopen only what changed

## Backend Rule

The backend should not infer progression from endpoint calls alone.
It should check the campaign state and the stage contract before allowing a transition.
