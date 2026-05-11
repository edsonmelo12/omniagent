---
execution: subagent
agent: strategist
model_tier: powerful
inputFile: squads/social-growth/output/research/market-intel.md
outputFile: squads/social-growth/output/strategy/content-plan.md
---

# Step 02: Strategy Plan

## Context Loading

Load these files before executing:
- `squads/social-growth/output/research/market-intel.md` — research insights from the previous step
- `squads/social-growth/output/context/geo-discoverability-summary.md` — site-level GEO and AI discoverability summary when available
- database market research record — client-specific market synthesis and opportunities
- `squads/social-growth/output/context/social-intelligence-summary.md` — public and confirmed social signals
- `squads/social-growth/pipeline/data/domain-framework.md` — operating framework
- `squads/social-growth/pipeline/data/quality-criteria.md` — strategy quality bar
- `_opensquad/core/best-practices/strategist.md` — strategy best practices
- `_opensquad/core/best-practices/social-networks-publishing.md` — distribution and channel rules
- database strategy records — source of truth for persisted strategy inputs

## Instructions

### Process
1. Convert research findings into 2-4 strategic objectives.
2. Use the social intelligence summary to prioritize the strongest channels, formats and content gaps.
3. Consult `strategy_library_strategies` before drafting the plan.
4. Rank the persisted strategies against the current client, objective and funnel stage.
5. Select the primary strategy and, when relevant, the secondary or plan B strategy that will actually be used.
6. Define content pillars, platform roles and cadence.
7. Decide which topics should stay in social, which should become blog content and which should become recurring authority assets.
8. Map each platform to a purpose in the funnel.
9. Specify the success metrics that will be monitored.
10. Produce a 2-4 week content plan that the creator can execute.
11. Record the selected strategy keys and fit rationale in the output so the client brief can persist them later.

## Output Format

```
# Content Plan

## Objectives
[objective list with KPI and target]

## Content Pillars
[pillar name, purpose, example topics]

## Discovery Layers
[site GEO / AI discoverability, SEO, content GEO, LLM readability, citation readiness, content reuse]

## Platform Roles
[Instagram feed, reels, stories, LinkedIn post, LinkedIn article, Blog post]

## Cadence
[weekly or biweekly distribution]

## Measurement
[metric, source, review rhythm]
```

## Output Example

```
# Content Plan

## Objectives
1. Increase qualified reach.
2. Improve authority on LinkedIn.
3. Build a repeatable posting rhythm.

## Content Pillars
- Practical growth
- Positioning and differentiation
- Proof and process
- Search intent and evergreen authority

## Discovery Layers
- Site GEO: entity clarity, proof density, schema sanity and canonical positioning
- SEO: ranking, keyword match and internal linking
- Content GEO: entities, TL;DR, FAQ and citation-friendly structure
- LLM readability: concise answers, clear headings and retrieval-friendly blocks

## Platform Roles
- Instagram Reels: discovery
- Instagram Feed: saves and shares
- Instagram Stories: retention and community
- LinkedIn Post: authority and comments
- LinkedIn Article: deeper evergreen value
- Blog Post: search visibility and topic depth

## Cadence
- 2 carousels/week
- 2 reels/week
- 3 story blocks/week
- 2 LinkedIn posts/week
- 1 blog post per cycle when search or authority is part of the brief

## Measurement
- Saves, shares, comments, profile visits
- Organic clicks, time on page, FAQ impressions, AI citation mentions
- Weekly review with a short recalibration note
```

## Veto Conditions

Reject and redo if ANY are true:
1. The strategy is not tied to measurable objectives.
2. The plan asks for a cadence the team cannot execute.

## Quality Criteria

- [ ] Objectives are measurable.
- [ ] Each platform has a distinct role.
- [ ] Cadence matches the available capacity.
- [ ] Metrics and review rhythm are defined.
- [ ] Strategy selection is grounded in the persisted strategy library.
- [ ] The selected primary/secondary strategies are named explicitly in the output.
