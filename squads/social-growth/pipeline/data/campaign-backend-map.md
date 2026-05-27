# Campaign Backend Map

## Purpose

Map the campaign states to the existing backend endpoints and service boundaries.

This is the bridge between the workflow design and the HTTP/API layer.

## Canonical Sequence

1. `intake`
2. `client_record`
3. `geo_discoverability`
4. `research`
5. `campaign_planning`
6. `strategy`
7. `content_plan`
8. `blog_draft`
9. `discovery_optimization`
10. `content_repurpose`
11. `content_production_package`
12. `schedule`
13. `approval`
14. `publish`
15. `monitoring`
16. `campaign_review`
17. `adjustment`

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

### `campaign_planning`

Primary endpoints:
- `GET /api/v1/clients/:clientId/campaign-planning`
- `POST /api/v1/clients/:clientId/campaign-planning`
- `PATCH /api/v1/clients/:clientId/campaign-planning`

Purpose:
- capture previous campaign outcomes
- record engagement, market and trend reads
- lock the campaign thesis before strategy

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

### `campaign_review`

Primary endpoints:
- `GET /api/v1/clients/:clientId/campaign-review`
- `POST /api/v1/clients/:clientId/campaign-review`
- `PATCH /api/v1/clients/:clientId/campaign-review`

Purpose:
- close the campaign loop
- record what happened, what changed and what seeds the next cycle

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
