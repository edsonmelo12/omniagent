---
execution: subagent
agent: strategist
model_tier: powerful
inputFile: squads/social-growth/output/strategy/content-plan.md
outputFile: squads/social-growth/output/blog/blog-topic-backlog.md
---

# Step 03AA: Build Blog Topic Backlog

## Context Loading

Load these files before executing:
- `_opensquad/_memory/company.md` - company context and brand direction
- `_opensquad/_memory/preferences.md` - language and output preferences
- `squads/social-growth/output/research/market-intel.md` - market, competition and opportunity readout
- `squads/social-growth/output/context/social-intelligence-summary.md` - public social signals and recurring themes
- `squads/social-growth/output/context/geo-discoverability-summary.md` - site-level GEO and entity clarity when available
- `squads/social-growth/output/strategy/content-plan.md` - approved strategic direction
- `squads/social-growth/pipeline/data/blog-topic-backlog-template.md` - required output structure
- `squads/social-growth/pipeline/data/blog-policy.md` - universal blog policy
- `squads/social-growth/pipeline/data/blog-structure-families.md` - structure family matrix
- `squads/social-growth/pipeline/data/quality-criteria.md` - quality rubric

## Instructions

### Process
1. Generate 10-20 candidate blog topics aligned with strategy and audience pains.
2. Cluster topics by intent and funnel stage.
3. Start trend research in this stage. Do not assume trend data from previous research stages.
4. For each topic, assign:
   - primary keyword;
   - search intent;
   - structure-family candidate;
   - proof availability level.
5. Add a trend signal for each topic and mark:
   - source;
   - observation date;
   - validity window (`30d`, `60d`, `90d`, `evergreen`);
   - confidence (`high`, `medium`, `low`).
6. Add an execution score per topic using:
   - impact (0-5)
   - feasibility (0-5)
   - proof readiness (0-5)
7. Rank the backlog by total score and mark the top 3 "ready now" topics.
8. Record disqualified topics and the reason (weak proof, weak trend, duplicate angle, low business fit).
9. Keep recommendations concrete enough so the next step can select one topic without re-research.

## Output Format

Use the structure defined in `blog-topic-backlog-template.md`.

## Veto Conditions

Reject and redo if ANY are true:
1. Fewer than 10 candidate topics are proposed.
2. Trend signal metadata is missing for any proposed topic.
3. Ranked priorities are not justified by impact/feasibility/proof scores.

## Quality Criteria

- [ ] Backlog contains 10-20 topics.
- [ ] Each topic has keyword, intent, family candidate and proof level.
- [ ] Each topic has trend source, date and validity window.
- [ ] Prioritization is scored and ranked.
- [ ] Top 3 "ready now" topics are explicit.
- [ ] Rejected topics include reason codes.
