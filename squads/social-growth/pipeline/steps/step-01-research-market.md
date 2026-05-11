---
execution: subagent
agent: researcher
model_tier: powerful
outputFile: squads/social-growth/output/research/market-intel.md
---

# Step 01: Research Market

## Context Loading

Load these files before executing:
- `_opensquad/_memory/company.md` — company context and brand direction
- `_opensquad/_memory/preferences.md` — language and user preferences
- database client record — normalized client record created from links and documents
- `squads/social-growth/output/context/social-intelligence-summary.md` — public and confirmed social signals
- `squads/social-growth/output/context/geo-discoverability-summary.md` — site-level GEO and AI discoverability summary when available
- `squads/social-growth/pipeline/data/intake-sources.md` — raw source list provided by the user
- `squads/social-growth/pipeline/data/research-record.md` — squad research intent
- `squads/social-growth/pipeline/data/research-and-proposal-route.md` — universal route for research and proposal readiness
- `squads/social-growth/pipeline/data/domain-framework.md` — operating framework
- `_opensquad/core/best-practices/researching.md` — research best practices
- `_opensquad/core/best-practices/geo-ai-discoverability.md` — site-level GEO and AI discoverability audit

## Instructions

### Process
1. Map the persisted client context into a concise market snapshot.
2. Use the social intelligence summary to understand actual profile activity, recurring themes and public proof.
3. Treat the database client record as the source of truth and record any corrections back into the persisted research trail.
4. Break the memo into three explicit blocks: market, competition and opportunity.
5. Identify audience segments, competitors, themes and growth opportunities.
6. Extract 3-5 strategic insights that can drive the next planning step.
7. State risks, unknowns and assumptions clearly.
8. Add a quantitative readout with counts, scores and confidence labels.
9. Declare whether the result is ready to become a presentation or proposal.
10. Deliver a research memo that is useful for strategy, not just descriptive.
11. If a proposal is needed, state that the first client-facing output must be the presentation header and slide deck, followed by the textual proposal.
12. Include the handoff signals that strategy must use to consult the persisted strategy library.
13. If the site is part of the acquisition path, include a short GEO / AI discoverability readout so strategy can decide whether to fix the entity before scaling content.
14. Include a practical `Suggested Research Sources` section with free-first sources, optional API-based sources, and concrete query ideas that help the user continue the research later.
15. Do not execute trend research in this stage; only mark trend-research recommendations for the content phase (`Step 03AA`).

## Output Format

```
# Market Intel

## Executive Summary
[3-5 bullet points summarizing the market situation]

## Market
[segment, demand signals, market language, source confidence]

## Competition
[direct competitors, comparable accounts, strengths, weaknesses, patterns]

## Opportunities
[3-5 concrete opportunities, ordered by impact and feasibility]

## Presence
[social channels found, activity, last post, site signals, confidence labels]

## AI Discoverability
[entity clarity, service clarity, answerability, proof density, sourceability, structured data readiness, GEO score]

## Audience
[segments, pains, content habits]

## Competitive Landscape
[competitors or comparable content patterns]

## Score Readout
[presence, consistency, proof, conversion, maturity, GEO/AI discoverability, confidence]

## Proposal Readiness
[whether the research already supports a presentation or proposal, and what is missing if not]

## Risks and Assumptions
[what is uncertain and what needs validation]

## Suggested Research Sources
[recommended sources with source type, why it matters, access mode and 1-2 practical query examples per source]
[if trend-related, mark as "execute in Step 03AA - content phase"]
```

## Output Example

```
# Market Intel

## Executive Summary
- The client needs a content system, not isolated posts.
- Instagram is the main discovery engine.
- LinkedIn should carry authority and trust.

## Presence
- 3 channels found.
- 2 channels active.
- Last visible post: 12 days ago.
- Confidence: partial.

## AI Discoverability
- Entity clarity: 4/5
- Proof density: 3/5
- GEO score: 68/100

## Audience
- Owners and managers who want visibility.
- Teams that need a repeatable content process.

## Competitive Landscape
- Many accounts post generic tips.
- Few accounts translate strategy into execution.

## Score Readout
- Presence: 3/5
- Consistency: 2/5
- Proof: 4/5
- Conversion: 3/5
- Maturity: 3/5
- Confidence: 62/100

## Opportunities
- Own the "practical growth" angle.
- Build a recurring series format.
- Turn research into reusable pillars.

## Proposal Readiness
- The memo is ready to become a presentation.
- Commercial proposal is optional if the client needs a sales deck.

## Risks and Assumptions
- Assumption: the client can maintain weekly cadence.
- Risk: content volume grows faster than review capacity.

## Suggested Research Sources
- Google Trends (free, trend, execute in Step 03AA): compare "marketing de conteudo" vs "social selling" in Brazil, last 12 months.
- YouTube (free + API optional, execute in Step 03AA): search "[tema] 2026" and "[tema] estudo de caso"; extract recurring pains from top videos.
- Reddit (free, execute in Step 03AA): search subreddit posts with "how to [resultado]" and "best [categoria] for [ICP]".
- Brave Search API (API key, execute in Step 03AA): query competitor terms + pain language to map emerging angles and sources.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The memo only repeats the client record without adding insight.
2. The output does not identify at least 3 opportunities or risks.

## Quality Criteria

- [ ] Executive summary is short and specific.
- [ ] Audience is broken into usable segments.
- [ ] Opportunities are actionable.
- [ ] Assumptions and risks are explicit.
- [ ] The memo includes a quantitative readout and proposal-readiness note.
- [ ] The memo clearly points strategy toward the persisted library and next best thesis.
- [ ] The memo includes suggested research sources with practical queries the user can execute directly.
