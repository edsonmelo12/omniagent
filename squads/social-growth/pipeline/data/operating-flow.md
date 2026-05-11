# Operating Flow

## Operating Rhythm

1. Intake links and documents during onboarding.
2. Discover official social profiles and collect the first social intelligence summary.
3. Build the brand profile and editable client record, including site, blog and social presence signals.
4. Validate the record with the user if anything is unclear.
5. Run research from the approved record and persist the result in the database, including market, competition, audience hypotheses and presence digital.
6. Run strategy from the persisted research and the persisted strategy library.
7. If the proposal checkpoint is confirmed, build the commercial proposal from the research and social evidence, starting with the presentation deck and its title/objective block.
8. If the cycle includes long-form content, start trend research in the blog topic backlog stage, then build the blog architecture, create the blog draft and optimize discovery before repurposing, carrying forward the approved word-count target, featured-image direction and free/public source search rationale.
9. If the site or brand entity is still ambiguous, run the GEO / AI discoverability audit before scaling the blog layer.
10. Create, review and schedule the content production package.
11. Monitor profile health and adjust the next cycle.

## Ownership Loop

- Intake owns raw source capture and first draft client record.
- Strategy owns interpretation and prioritization.
- Creator owns adaptation into platform content.
- Blog Architect owns the thesis, structure family and proof map for long-form blog.
- Blog Writer owns long-form blog drafts from approved architecture.
- Discovery Optimizer owns article-level SEO, GEO and LLM finalization.
- GEO / AI discoverability audit is owned upstream by research and strategy when the brand or site is still unclear.
- Content Repurposer owns the translation from blog to native social assets.
- Reviewer owns quality and correction notes.
- Monitor owns the performance readout and action triggers.

## Editing Loop

- If the client changes an offer, update the client record first.
- If the client changes tone or positioning, update the client record first.
- If only one service changes, edit the relevant record section only.
- If the client corrects a source extraction, replace the old value with the new one and keep a note of the correction.
- If the client record revision only changes notes, keep downstream work intact.
- If the client record revision changes identity or diagnosis, reopen research and downstream stages.
- If the client record revision changes narrative or offer recommendation, reopen strategy and downstream stages.
- If the research changes, reopen strategy after updating the persisted market research record.
- If the strategy library changes, rerun strategy for any active client that depends on that library.
- If the blog architecture changes, rerun blog drafting, discovery optimization, repurpose and review, and revalidate the length, featured-image and source-search constraints.

## Operational Rule

The database is the source of truth for client, product and service records.
Markdown records are human-reviewed working copies only.
Every later step should read the persisted record before making new assumptions.
Research must write back to the database and strategy must read from the persisted library before selecting a thesis.
The universal route in [research-and-proposal-route.md](research-and-proposal-route.md) defines the standard structure for any research result.
Research ends at analysis and opportunity framing unless the downstream artifact is explicitly requested.
The social intelligence summary is the required evidence layer before any social proposal is written.
The brand profile is the canonical bridge between research, content and proposal; it must preserve the confirmed versus inferred split.
The commercial proposal is optional and only runs after the client confirms the proposal checkpoint and needs a social offer or sales deck. When it runs, the client-facing output should surface the presentation deck first, then the textual proposal.
If the cycle includes long-form content, the blog architecture must be approved before drafting, and the blog draft must be discovery-optimized before repurpose and schedule approval, with the length target, featured-image direction and source rationale preserved end to end.
If the delivery is meant for a client, save the final consolidated report in `output/<client-slug>/client-report.md`.
Publishing stays as an approval-gated execution step, not a new squad specialist. The backend already records dry-run and live-simulated publishing executions; only platform-specific adapters would move it from simulation to real network delivery.

The canonical campaign sequence is defined in [Campaign State Machine](campaign-state-machine.md) and [Stage Contracts](stage-contracts.md).
