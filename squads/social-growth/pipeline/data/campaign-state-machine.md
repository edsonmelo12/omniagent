# Campaign State Machine

## Purpose

Define the campaign as a sequence of explicit states so the squad can always answer:

- where the client is
- what can happen next
- what is blocked
- what must be reopened if the base changes

## State Model

### 1. `intake`

The squad collects links, documents and notes.

Exit condition:
- enough source material exists to draft the client record

### 2. `client_record`

The squad creates or updates the editable client record.

Exit condition:
- business profile, audience, offer and positioning are coherent enough to use as base truth

### 3. `geo_discoverability`

The squad evaluates the site and brand entity for AI discoverability before scaling article production.

Exit condition:
- the canonical positioning, proof density and schema readiness are clear enough for content planning

### 4. `research`

The squad validates the market and the social evidence.

Exit condition:
- market context, presence digital signals and audience hypotheses are enough to support strategy

### 5. `strategy`

The squad converts evidence into priorities, angle and cadence.

Exit condition:
- the strategy can be turned into content without guessing

### 6. `proposal`

The squad optionally creates the commercial proposal or presentation deck when the checkpoint is confirmed.

Exit condition:
- the commercial report is ready and the client-facing order is presentation first, text second

### 7. `content_plan`

The squad defines what will be published.

Exit condition:
- content themes, formats and cadence are set

### 8. `blog_draft`

The squad produces the long-form draft when the cycle includes blog content.

Exit condition:
- the blog draft is ready for discovery optimization

### 9. `discovery_optimization`

The squad finalizes the blog for SEO, GEO and LLM discoverability.

Exit condition:
- the blog is optimized and has the required author, source and schema blocks

### 10. `content_repurpose`

The squad translates the blog into native social assets when multichannel output is needed.

Exit condition:
- the repurpose package is ready for content packaging or direct execution

### 11. `content_production_package`

The squad produces the final content production package for the selected channel mix.

Exit condition:
- the package is ready for review

### 12. `visual_direction`

The squad turns the approved content into a production-ready visual brief.

Exit condition:
- the visual system, layout guidance and production notes are stable

### 13. `render`

The squad renders the approved brief into final assets and a manifest.

Exit condition:
- the asset paths, formats and variants are recorded

### 14. `review`

The squad reviews the content production package, visual direction and rendered assets.

Exit condition:
- the review is approved or returns precise fixes

### 15. `schedule`

The squad orders the content for delivery.

Exit condition:
- the publishing sequence is realistic and approved for execution

### 16. `approval`

The squad waits for explicit user or operator confirmation.

Exit condition:
- schedule is approved or rejected with notes

### 17. `publish`

The squad executes the agenda.

Exit condition:
- the planned items were published or their execution state is known

### 18. `monitoring`

The squad reads the effect of the cycle.

Exit condition:
- the performance summary exists and the next actions are clear

### 19. `adjustment`

The squad turns monitoring into the next cycle of improvements.

Exit condition:
- the next cycle can start from a stable updated base

## Allowed Flow

The default path is:

`intake -> client_record -> research -> strategy -> content_plan -> blog_draft -> discovery_optimization -> content_repurpose -> content_production_package -> visual_direction -> render -> review -> schedule -> approval -> publish -> monitoring -> adjustment`

If the proposal checkpoint is confirmed, insert the optional proposal branch after strategy and before content plan:

`intake -> client_record -> research -> strategy -> proposal -> content_plan -> blog_draft -> discovery_optimization -> content_repurpose -> content_production_package -> visual_direction -> render -> review -> schedule -> approval -> publish -> monitoring -> adjustment`

## Backward Moves

Some changes should reopen previous states:

- `client_record` note-only revision -> keep the current flow
- `client_record` identity or diagnosis change -> reopen `research`, `strategy`, `content_plan`, `blog_draft`, `discovery_optimization`, `content_repurpose`, `content_production_package`, `schedule`
- `client_record` narrative or offer change -> reopen `strategy`, `content_plan`, `blog_draft`, `discovery_optimization`, `content_repurpose`, `content_production_package`, `schedule`
- `research` changed -> reopen `strategy`, `content_plan`, `blog_draft`, `discovery_optimization`, `content_repurpose`, `content_production_package`, `schedule`
- `strategy` changed -> reopen `content_plan`, `blog_draft`, `discovery_optimization`, `content_repurpose`, `content_production_package`, `schedule`
- `proposal` changed -> reopen `content_plan`, `blog_draft`, `discovery_optimization`, `content_repurpose`, `content_production_package`, `schedule`
- `content_plan` changed -> reopen `blog_draft`, `discovery_optimization`, `content_repurpose`, `content_production_package`, `schedule`
- `blog_draft` changed -> reopen `discovery_optimization`, `content_repurpose`, `content_production_package`, `schedule`
- `discovery_optimization` changed -> reopen `content_repurpose`, `content_production_package`, `schedule`
- `content_repurpose` changed -> reopen `content_production_package`, `schedule`
- `content_production_package` changed -> reopen `visual_direction`, `render`, `review`, `schedule`
- `visual_direction` changed -> reopen `render`, `review`, `schedule`
- `render` changed -> reopen `review`, `schedule`
- `schedule` changed -> reopen `approval`
- `publish` outcome changes -> reopen `monitoring`

## Blockers

The system should not advance if:

- the base client record is incoherent
- the required evidence is missing
- the current schedule has not been approved
- the content production package is not aligned with the strategy
- the blog draft is not optimized when long-form content is in scope
- the proposal checkpoint was confirmed but the proposal state is missing
- the visual direction is not executable
- the rendered assets do not exist or do not match the approved brief
- the monitoring summary has not been produced

## Decision Rule

At any time, the system should return:

1. current state
2. next valid state
3. blockers
4. whether any earlier state must be reopened
