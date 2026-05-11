---
execution: subagent
agent: blog-architect
model_tier: powerful
inputFile: squads/social-growth/output/strategy/content-plan.md
outputFile: squads/social-growth/output/blog/blog-architecture.md
---

# Step 03BB: Build Blog Architecture

## Context Loading

Load these files before executing:
- `_opensquad/_memory/company.md` - company context and brand direction
- `_opensquad/_memory/preferences.md` - language and output preferences
- `squads/social-growth/output/research/market-intel.md` - market and opportunity notes
- `squads/social-growth/output/context/social-intelligence-summary.md` - public social signals
- `squads/social-growth/output/context/geo-discoverability-summary.md` - site-level GEO and entity clarity when available
- `squads/social-growth/output/strategy/content-plan.md` - approved strategy and topic direction
- `squads/social-growth/output/blog/blog-brief.md` - canonical brief to preserve
- `squads/social-growth/pipeline/data/output-examples.md` - quality reference
- `squads/social-growth/pipeline/data/quality-criteria.md` - quality rubric
- `squads/social-growth/pipeline/data/blog-policy.md` - universal blog policy for all clients
- `squads/social-growth/pipeline/data/blog-structure-families.md` - structure family matrix and anti-repetition rules
- `squads/social-growth/pipeline/data/blog-family-ledger-template.md` - repetition ledger template
- `_opensquad/core/best-practices/blog-post.md` - blog structure and readability rules
- `_opensquad/core/best-practices/blog-seo.md` - search intent and SEO structure
- `_opensquad/core/best-practices/content-discovery-optimization.md` - SEO, GEO and LLM optimization rules

## Instructions

### Process
1. Identify the editorial thesis that the article must defend.
2. Choose a structure family from the matrix and map it to a family-specific section arc.
3. Define the proof map, nuance, counterpoint and CTA direction.
4. Define the intended word-count range based on the function of the piece.
5. Define the featured-image direction so the visual reinforces the thesis rather than a generic category.
6. Define the featured-image selection criteria so the chosen asset can be defended against the article thesis, topic and one-glance clarity.
7. Define the featured-image source search note so the eventual asset can be sourced from free/public candidates before render.
   - include source origin URL or repository, license class, license check date and fallback candidate.
8. Read the canonical blog brief and preserve its thesis, structure family and proof freshness gate.
9. Lock the editorial copy brief: target reader, reader problem, promise, dominant objection, CTA direction and hook territory.
10. Convert the research into an architecture brief that is specific enough to guide drafting.
11. Call out what should not be repeated from recent or nearby blog outputs.
12. State the opening shape, proof placement and ending shape so the writer does not default to the same skeleton.
13. Record the family-ledger entry that later steps must keep intact.
14. Keep the briefing concise, but strong enough that the writer does not have to invent the argument from zero.
15. Treat the structure family as a decision aid only, never as permission to use a prose template.

## Output Format

```
# Blog Architecture

## Topic and Intent
[topic, primary keyword, search intent, target audience]

## Editorial Thesis
[single sentence thesis]

## Structure Family
[manifesto, teardown, framework, comparison, case study, contrarian guide, or similar]

## Why This Structure
[why this family fits the thesis and what repetition it avoids]

## Brief Alignment
[what the canonical brief requires, including proof freshness and CTA direction]

## Copy Brief Lock
[target reader, reader problem, awareness, promise, dominant objection, CTA direction, hook territory]

## Section Arc
[family-specific opening, proof placement, nuance block, close]

## Proof Map
[data, examples, cases, contrasts, limits, or sources that should appear]

## Section List
[H1, intro promise, section list, nuance block, conclusion]

## Repetition Guardrails
[what to avoid copying from the last article]

## Drafting Notes
[tone, pace, CTA direction, credibility constraints]

## Word Count Target
[tactical, standard, or pillar range with rationale]

## Featured Image Direction
[subject, composition, visual thesis, and why the image is specific to the article]

## Featured Image Selection Criteria
[why this image wins against generic alternatives; thesis match, topic match, one-glance clarity]

## Featured Image Source Search
[free/public candidate sources or asset types, source origin, license notes, license check date, fallback candidate, and why the final choice is the least generic option]

## Family Ledger Entry
[family name, opening shape, proof placement, nuance placement, close shape, neighboring-post guardrail]
```

## Veto Conditions

Reject and redo if ANY are true:
1. The thesis is vague or exchangeable.
2. The structure family is just the default blog mold.
3. The briefing does not create a clear path to credibility.
4. The copy brief lock is missing or detachable from the thesis.
5. The architecture reads like a reusable article template instead of a client-specific argument path.

## Quality Criteria

- [ ] The thesis is explicit.
- [ ] The structure family is intentional and different from the default mold.
- [ ] The proof map includes more than generic claims.
- [ ] The word-count target matches the function of the piece.
- [ ] The featured-image direction reinforces the thesis and is not generic.
- [ ] The featured-image source search is explicit, free/public by default, and includes source origin + license check date + fallback.
- [ ] The canonical brief was respected.
- [ ] The copy brief lock is explicit and useful for drafting.
- [ ] The family ledger entry is complete.
- [ ] The briefing gives the writer a clear argument path.
- [ ] The output reduces the risk of repetitive blog structure.
