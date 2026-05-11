---
execution: subagent
agent: strategist
model_tier: powerful
inputFile: squads/social-growth/output/strategy/content-plan.md
outputFile: squads/social-growth/output/blog/blog-brief.md
---

# Step 03BA: Build Blog Brief

## Context Loading

Load these files before executing:
- `squads/social-growth/output/research/market-intel.md` - market and opportunity notes
- `squads/social-growth/output/context/social-intelligence-summary.md` - public social signals
- `squads/social-growth/output/context/geo-discoverability-summary.md` - site-level GEO and entity clarity when available
- `squads/social-growth/output/strategy/content-plan.md` - approved strategy and topic direction
- `squads/social-growth/output/blog/blog-topic-backlog.md` - ranked topic backlog with trend validity gates
- `squads/social-growth/pipeline/data/blog-brief-template.md` - required brief structure
- `squads/social-growth/pipeline/data/blog-policy.md` - universal blog policy
- `squads/social-growth/pipeline/data/blog-structure-families.md` - structure family matrix
- `squads/social-growth/pipeline/data/output-examples.md` - quality reference
- `squads/social-growth/pipeline/data/quality-criteria.md` - quality rubric
- `_opensquad/_memory/company.md` - company context and brand direction
- `_opensquad/_memory/preferences.md` - language and output preferences

## Instructions

### Process
1. Select the blog topic that best serves the current strategy and market read.
   - use the ranked `Ready Now` list from `blog-topic-backlog.md` by default.
   - if overriding the backlog rank, document the override reason.
2. Define the primary keyword, search intent and target audience.
3. Lock the editorial thesis in a single sentence.
4. Choose the structure family intentionally and record the repetition risk.
5. Check proof freshness before the article is allowed to proceed.
6. Add a trend validity gate with source, signal date, validity window and confidence.
7. Record the family ledger entry so nearby posts can avoid the same skeleton.
8. Define CTA direction and a copy-brief seed: target reader, reader problem, awareness, promise territory, dominant objection and hook territory.
9. Define featured-image direction and word-count rationale.
10. Keep the brief concise enough to guide architecture without forcing prose too early.

## Output Format

```
# Blog Brief

## Topic and Intent
[topic, primary keyword, search intent, target audience, business goal]

## Editorial Thesis
[single-sentence thesis and why it matters now]

## Structure Family
[selected family and why it fits]

## Proof Freshness Gate
[proof status, recency, source notes, claims still blocked]

## Trend and Validity Gate
[trend source, signal date, validity window, confidence, stale-risk note]

## Family Ledger Entry
[family name, opening shape, proof placement, nuance placement, close shape, guardrail]

## CTA Direction
[primary CTA, funnel stage, reader action]

## Copy Brief Seed
[target reader, reader problem, awareness level, promise territory, dominant objection, hook territory]

## Featured Image Direction
[visual concept, thesis match, one-glance job, source class]

## Word Count Target
[tactical, standard, or pillar range with rationale]
```

## Veto Conditions

Reject and redo if ANY are true:
1. The thesis is vague or exchangeable.
2. The proof freshness gate is ignored.
3. The structure family is not intentionally chosen.
4. The trend validity gate is missing or has no dated source.
5. The copy brief seed is missing or too generic to guide the architecture step.

## Quality Criteria

- [ ] Topic and intent are explicit.
- [ ] Thesis is explicit.
- [ ] Structure family is explicit.
- [ ] Proof freshness is explicit.
- [ ] Trend validity gate is explicit.
- [ ] Family ledger entry is explicit.
- [ ] CTA direction is explicit.
- [ ] Copy brief seed is explicit.
- [ ] Featured image direction is explicit.
