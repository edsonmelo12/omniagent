---
execution: subagent
agent: discovery-optimizer
model_tier: powerful
inputFile: squads/social-growth/output/blog/blog-post-draft.md
outputFile: squads/social-growth/output/blog/blog-post.md
---

# Step 03E: Optimize Discovery Content

## Context Loading

Load these files before executing:
- `squads/social-growth/output/blog/blog-post-draft.md` - raw draft to optimize
- `squads/social-growth/output/blog/blog-architecture.md` - architecture, thesis and structure family to preserve
- `squads/social-growth/output/blog/blog-brief.md` - canonical brief and proof freshness gate to preserve
- `squads/social-growth/output/research/market-intel.md` - market and opportunity notes
- `squads/social-growth/output/context/social-intelligence-summary.md` - public social signals
- `squads/social-growth/output/strategy/content-plan.md` - approved strategy
- `squads/social-growth/pipeline/data/output-examples.md` — quality reference
- `squads/social-growth/pipeline/data/blog-policy.md` - universal blog policy for all clients
- `squads/social-growth/pipeline/data/blog-structure-families.md` - family-specific arc preservation rules
- `squads/social-growth/pipeline/data/blog-family-ledger-template.md` - family repetition ledger template
- `_opensquad/core/best-practices/geo-ai-discoverability.md` — upstream site/entity GEO criteria when the article depends on brand clarity
- `_opensquad/core/best-practices/content-discovery-optimization.md` — SEO, GEO and LLM optimization rules
- `_opensquad/core/best-practices/blog-seo.md` — search intent and SEO structure
- `_opensquad/core/best-practices/blog-post.md` — readability and long-form structure

## Instructions

### Pre-Flight: GEO Check
Before optimizing, run the local validator to check the draft's current GEO score:
```bash
node squads/social-growth/scripts/local-blog-validator.mjs --file={filename}
```
If the validator score is <60%, apply GEO auto-fix first:
```bash
node squads/social-growth/scripts/deep-fix-blog.mjs --file={filename} --geo
node squads/social-growth/scripts/local-blog-validator.mjs --file={filename} --fix
```
If post-GEO-fix score is still <60%, mark the draft as needing brief/architecture revision before proceeding.

### Process
1. Tighten the draft so the article has a clearer answer path; only add a top summary block when the opening pattern decision justifies it.
2. Reconfirm the primary keyword, search intent and entity targets.
3. Improve headings, definitions, FAQ and source framing for SEO, GEO and LLM readability.
4. Keep the tone human and the structure easy to scan.
5. Preserve the original thesis, structure family, copy brief lock, chosen hook, brief alignment and examples unless they reduce clarity.
6. Add a clear featured-image note so the final article can be rendered with a visual that supports the thesis; source notes are only required when image research is active.
7. Include image selection criteria that explain why the chosen asset is thesis-led and not generic.
8. Include featured-image source search notes with free/public candidate types, license notes and rationale only when image research is active.
9. Resist flattening the article back into the default blog mold.
10. Preserve the family-specific arc; you may improve headings, but you may not normalize every article into the same H2 order.
11. Preserve the family ledger entry so the next post can be checked against nearby repetition.
12. If the draft starts to resemble the default blog skeleton, rework the optimization pass instead of accepting the repetition.
13. Output the finalized article as the single source of truth for review.
14. If the draft still depends on unclear entity, offer or proof signals, flag that the upstream site should be repaired with the GEO audit before scaling the article.
15. Do not use the optimization pass to disguise or polish a template-generated article into something publishable.

## Output Format

```
# Blog Post

## Topic and Intent
[topic, primary keyword, search intent, target audience]

## Copy Brief Preservation
[what promise, objection, CTA direction and hook logic were preserved]

## Opening Pattern Decision
[state whether the article uses a direct opening, TL;DR, resumo executivo, question-led opening, scene-led opening, contrarian opening, or another pattern; justify why]

## Top Summary Block
[optional; include only when justified]

## Author Block
[author name, title, bio, update date]

## Title Tag
[under 60 characters]

## Meta Description
[150-160 characters]

## H1
[main heading]

## Intro
[hook and promise]

## Body
[family-specific H2 sections with supporting points; preserve the selected arc]

## FAQ
[3-5 questions with short answers]

## Source Notes
[citations, references, data provenance]

## Schema
[BlogPosting JSON-LD, FAQPage JSON-LD, author/entity metadata]

## Conclusion
[summary and CTA]

## Discovery Optimization Notes
[SEO, GEO, LLM readability, internal links, external links, source notes]

## Structural Preservation Notes
[how the family-specific arc was preserved and what was intentionally not flattened]

## Word Count Target
[range and rationale]

## Featured Image
[visual concept, format, alt text, implementation note, and source class]

## Featured Image Source Search
[free/public candidate sources or asset types, license notes, rationale, and rejected options]

## Featured Image Selection Criteria
[why the chosen asset is the best thesis match, why it is not generic, and what one-glance job it performs]

## Family Ledger Entry
[family name, opening shape, proof placement, nuance placement, close shape, neighboring-post guardrail]
```

## Output Example

```
# Blog Post

## Topic and Intent
- Topic: content system for small businesses
- Primary keyword: content system for small businesses
- Search intent: informational
- Audience: owners and marketing leads

## Opening Pattern Decision
- Pattern: abertura direta com contraste
- Justification: a tensao inicial diferencia melhor o artigo; um TL;DR padronizaria a leitura sem ganho claro de retrieval.

## Author Block
- Author: Portal de Mídias
- Title: Editorial Team
- Bio: Content strategy and growth team focused on authority and demand generation.
- Updated: 2026-04-14

## Title Tag
Content System for Small Businesses That Scales

## Meta Description
Learn how to build a content system for small businesses with clear pillars, cadence, and reusable ideas that support growth.

## H1
Content System for Small Businesses

## Intro
A lot of teams do not have a content problem. They have a system problem.
This article shows how to turn scattered ideas into a repeatable blog and social engine.

## Body
## Why random posting fails
## What a content system needs
## How to choose topics
## How to reuse one idea across channels
## How to measure what works

## FAQ
### What is a content system?
### How often should I publish?
### How do I turn one topic into multiple formats?

## Source Notes
- Core claims should reference research memo, client profile and authoritative sources.
- Examples should be tied to real market observations when available.

## Schema
- BlogPosting JSON-LD with headline, description, author, datePublished and dateModified.
- FAQPage JSON-LD for the FAQ section.
- Author/entity metadata aligned with the brand profile.

## Featured Image
- Visual concept: a topic-specific composition that reinforces the article thesis.
- Format: 16:9
- Alt text: Descriptive text aligned with the article subject.
- Implementation note: avoid generic stock or decorative imagery.

## Conclusion
Use a simple system, publish consistently, and review what performs.
If you want help, talk to the team.

## Discovery Optimization Notes
- SEO: title front-loaded, links suggested, intent aligned
- GEO: answer path near the top, FAQ, named concepts and clear statements
- LLM readability: short blocks, explicit answers, scannable headings
- internal links: 3+
- external links: 2+
- source notes: cite proof where claims matter
```

## Veto Conditions

Reject and redo if ANY are true:
1. The optimized draft changes the core thesis without reason.
2. The output is not clearly easier to scan, cite or retrieve.
3. The optimization introduces keyword stuffing or awkward phrasing.
4. The optimization weakens the original hook or flattens the section arc into a default mold.
5. The optimized article still reads like a script-generated family template.

## Quality Criteria

- [ ] The opening pattern is explicit, justified and not repetitive by default.
- [ ] SEO and GEO concerns are both addressed.
- [ ] The headings improve retrieval and readability.
- [ ] FAQ is present and any top summary block is present only when justified.
- [ ] The final article remains human-friendly.
- [ ] The copy brief lock and chosen hook survived optimization.
- [ ] The featured-image note is explicit and thesis-aligned.
- [ ] The featured-image source search is explicit and free/public by default when image research is active.
- [ ] The canonical brief and family ledger were preserved.
