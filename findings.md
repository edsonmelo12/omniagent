# Findings

## Current State
- The `social-growth` squad already has a YouTube strategy pipeline and a strategy intelligence layer.
- The backend already produces `primary`, `alternatives`, and `planB` recommendations from YouTube analysis assets.
- The current recommendation system is mostly fit-based, using product context and transcript-derived signals.

## Key Files
- `backend/src/modules/youtube-strategy/youtube-strategy.service.ts`
- `backend/src/modules/strategy-intelligence/strategy-intelligence.service.ts`
- `backend/src/modules/strategy-intelligence/strategy-intelligence.schemas.ts`
- `dashboard/src/components/BackendOpsPanel.tsx`
- `squads/social-growth/pipeline/data/strategy-intelligence-intake.md`

## Product Insight
- The requested module should not be a generic summary tool.
- It should behave as a strategy recommendation engine that ranks reusable organic strategy options by client context and campaign objective.
- The best implementation path is to keep the current recommendation structure and add a context-aware catalog layer above it.

## Recommended Output Shape
- Context diagnosis
- Primary strategy recommendation
- Secondary strategy options
- Strategies not recommended for the current context
- Why each option fits or does not fit
- Suggested organic formats and next tests
- Concrete campaign action plan with cadence, format mix, weekly actions, production priorities and CTA focus
- Day-by-day weekly agenda for each stage, so the recommendation can be executed as a real publishing plan
- Publish-ready titles for each agenda day, reducing interpretation work for the operator
- Hooks, structures and final CTAs for each agenda day, so the module can be used as a real briefing without extra decoding
- Copy and caption fields for each agenda day, so the module can feed a content calendar with minimal manual rewriting
- A dashboard copy action now serializes the whole campaign plan into structured text, reducing the chance of manual transcription errors

## Final Outcome
- The recommendation engine now exposes a controlled organic strategy catalog with contextual ranking.
- Client archetype now participates in ranking, so consultive, educational, productized, e-commerce, local and creator-led profiles can bias strategy selection when the campaign objective allows it.
- Funnel stage now participates in ranking, so awareness, consideration, decision, retention and scale can alter the strategy family chosen for a campaign.
- The dashboard now accepts an optional campaign objective and surfaces the ranked option set in the YouTube strategy panel.
- The dashboard now also exposes the direct strategy recommendation endpoint, with product/service/audience context fields for manual ranking.
- The recommendation panel now listens for product focus changes and refreshes automatically after the first explicit recommendation run.
- The squad docs now describe the module as extraction plus recommendation, which matches the intended workflow.
- The recommendation payload now includes a concrete campaign action plan, which bridges the gap between strategy selection and execution.
- The action plan now includes a weekday agenda, which makes the module operational for leigos rather than just strategic for especialistas.
- The agenda now includes ready-to-use titles, which makes the output copy-pasteable into a calendar or task board.
- The agenda now includes hooks, structures and CTAs, which makes it actionable for a leigo without needing a strategist to translate it first.
- The agenda now includes copy and caption, which turns the output into a near-ready publishing draft instead of a simple plan.
- The dashboard now exposes a copy action for the structured plan, which makes the next step after analysis operational and immediate.
