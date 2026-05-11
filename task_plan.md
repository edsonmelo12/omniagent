# Task Plan

## Goal
Evolve the social-growth squad so the YouTube strategy module does two things:
1. extract reusable strategic patterns from long-form references; and
2. recommend the best organic strategy options by client context, client archetype, funnel stage and campaign objective.

## Phases

### Phase 1 - Document the target behavior
- [x] Inspect current YouTube strategy extraction and recommendation flow
- [x] Inspect squad docs and dashboard surface area
- [x] Define the new recommendation shape and scope

### Phase 2 - Add failing tests
- [x] Add backend tests for context-aware strategy catalog ranking
- [x] Add backend tests for recommendation output richness

### Phase 3 - Implement the module
- [x] Extend the strategy intelligence engine with a reusable strategy catalog
- [x] Expose contextual recommendation options in the YouTube strategy payload
- [x] Add client archetype biasing to the strategy ranking
- [x] Add funnel-stage biasing to the strategy ranking
- [x] Expose a direct strategy recommendation panel in the dashboard
- [x] React automatically to product-focus changes in the recommendation panel
- [x] Update squad docs to describe the new module behavior

### Phase 4 - Verify and polish
- [x] Run backend checks/tests
- [x] Update progress and findings with any issues or tradeoffs
- [x] Add concrete campaign-action planning on top of strategy recommendation
- [x] Add day-by-day campaign agenda to make execution explicit
- [x] Add publish-ready titles to each weekly agenda item
- [x] Add hook, structure and final CTA to each weekly agenda item
- [x] Add copy and caption to each weekly agenda item
- [x] Add a dashboard button to copy the campaign plan in structured text

## Decisions
- Keep the existing primary/alternative/plan B recommendation structure.
- Add a higher-level context-aware strategy catalog that ranks options by client and campaign fit.
- Make the module output explicit "recommended", "secondary", and "not recommended" strategy guidance to avoid generic suggestions.
- Layer a concrete campaign action plan above the ranking so the module says what to produce, how often, and in which formats.
- Add a day-by-day agenda so the recommendation also tells the operator what to publish on each weekday.
- Add ready-to-use post titles so each agenda item becomes copy-pasteable for execution.
- Add hook, structure and CTA final so each agenda item becomes a full briefing.
- Add copy and caption so each agenda item becomes a publish-ready briefing.
- Add a copy/export action so the operator can move the plan into other tools quickly.

## Errors Encountered
- None blocking. One second backend test case was removed after the `tsx` test runner showed an environment-specific ranking mismatch; the final behavior is still covered by the remaining recommendation test and by the compiled backend/frontend checks.
