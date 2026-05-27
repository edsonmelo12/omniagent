---
execution: subagent
agent: blog-writer
model_tier: powerful
inputFile: squads/social-growth/output/strategy/content-plan.md
outputFile: squads/social-growth/output/blog/blog-post-draft.md
---

# Step 03D: Create Blog Draft

## Context Loading

Load these files before executing:
- `_opensquad/_memory/company.md` — company context and brand direction
- `_opensquad/_memory/preferences.md` — language and output preferences
- `squads/social-growth/output/research/market-intel.md` - market and opportunity notes
- `squads/social-growth/output/context/social-intelligence-summary.md` - public social signals
- `squads/social-growth/output/context/geo-discoverability-summary.md` - site-level GEO and entity clarity when available
- `squads/social-growth/output/strategy/content-plan.md` - approved strategy and topic direction
- `squads/social-growth/output/blog/blog-brief.md` - canonical brief to preserve
- `squads/social-growth/output/blog/blog-architecture.md` - editorial architecture, thesis and structure family
- `squads/social-growth/pipeline/data/tone-of-voice.md` - brand tone options
- `squads/social-growth/pipeline/data/output-examples.md` - quality reference
- `squads/social-growth/pipeline/data/blog-policy.md` - universal blog policy for all clients
- `squads/social-growth/pipeline/data/blog-structure-families.md` - section arc patterns and repetition guardrails
- `squads/social-growth/pipeline/data/blog-family-ledger-template.md` - repetition ledger template
- `_opensquad/core/best-practices/blog-post.md` - long-form blog structure and readability rules
- `_opensquad/core/best-practices/blog-seo.md` — search intent and SEO structure
- `_opensquad/core/best-practices/content-discovery-optimization.md` — SEO, GEO and LLM optimization rules
- `_opensquad/core/best-practices/copywriting.md` — hook, clarity and CTA rules
- `squads/social-growth/pipeline/data/blog-image-bank.md` — image bank rules for social derivatives

## Instructions

### Process
1. Choose one blog topic that expands the current editorial strategy and supports search or authority.
2. Define the primary keyword, search intent and secondary variations before writing.
3. Read the blog brief and blog architecture, then keep the thesis, structure family, proof freshness gate, copy brief lock and proof map intact.
4. Build and lock the writing brief before drafting: hook options, chosen hook, promise, objection handling and CTA intensity.
5. Build the article structure with title tag, meta description, intro, family-specific body arc, FAQ and conclusion.
6. Reuse confirmed facts, proof points and gaps from the research memo.
7. Keep paragraphs short and insert subheadings often enough for mobile scanning.
8. Include internal link suggestions, external link suggestions and a CTA that matches the funnel stage.
9. Make the piece evergreen and reusable for future social repurposing.
10. Leave room for the optimizer to tighten SEO, GEO and LLM readability.
11. Set a realistic word-count target that matches the function of the piece, not a fixed blog default.
12. Specify a featured-image direction that reinforces the thesis and can be rendered without relying on generic stock.
13. Record whether image research is happening now or later.
14. Add featured-image source search notes only when image research is active, with free/public candidate types, source origin, license notes, license check date, fallback and selection rationale.
15. Add featured-image selection criteria so the draft explains why this asset wins against generic alternatives.
15. Preserve the selected section arc instead of collapsing everything into the same H2 sequence.
16. Carry forward the family ledger entry so later review can detect nearby repetition.
17. If the upstream site/entity is still ambiguous, keep the draft conservative and aligned with the canonical positioning from the GEO summary.
18. Do not use any script, article generator, or family template to write the body. The article must be authored from the live brief, architecture, and proof context.
19. **When image research is active**, collect 3-5 images from free/public sources (Pexels, Unsplash, CC0) during article creation and add them to the **Image Bank** (see output section below). One becomes the article hero; the rest feed social derivatives.
20. Save the image bank JSON to `output/{client}/blog/assets/{asset_id}-images.json` following the schema in `pipeline/data/blog-image-bank.md` when the image bank is created.
21. **Insert transition words** in ≥30% of sentences. Use the transition word reference list below.
20. **SEO title must be ≤55 characters** including the ` | Brand` suffix. If it exceeds 55 characters, shorten the core phrase.

## Transition Word Reference (Português)

| Function | Words |
|----------|-------|
| Adição | além disso, também, ademais, ainda, bem como |
| Contraste | no entanto, porém, contudo, entretanto, por outro lado, todavia |
| Causa/conclusão | portanto, assim, por isso, consequentemente, logo, desse modo, em suma |
| Ordem | primeiramente, em primeiro lugar, depois, finalmente, por fim, antes de |
| Ênfase | principalmente, sobretudo, especialmente, de fato, certamente |
| Exemplificação | por exemplo, como, a saber, isto é, ou seja |
| Condição | caso, desde que, a menos que, contanto que |

## Output Format

```
# Blog Post

## Topic and Intent
[topic, primary keyword, search intent, target audience]

## Editorial Architecture
[thesis, structure family, section arc, proof map, repetition guardrails, brief alignment, ledger note]

## Copy Brief Lock
[reader, problem, awareness, promise, objection, CTA direction]

## Hook Strategy
[3 hook options, chosen hook, why it fits this article]

## Title Tag
[under 60 characters]

## Meta Description
[150-160 characters]

## H1
[main heading]

## Intro
[hook and promise]

## Body
[family-specific H2 sections with supporting points]

## Nuance and Proof
[counterpoint, examples, evidence, limits]

## FAQ
[3-5 questions with short answers]

## Conclusion
[summary and CTA]

## SEO Checklist
[internal links, external links, word count, keyword use, image notes]

## Word Count Target
[range and rationale]

## Featured Image
[visual concept, format, alt text, implementation note, and source class]

## Image Bank (3-5 images for social derivatives)

```json
{
  "asset_id": "AC-30-13",
  "client": "amiclube",
  "hero_image": "AC-30-13-compra-inteligente-hero.jpg",
  "images": [
    {
      "id": "img-01",
      "filename": "AC-30-13-compra-inteligente-hero.jpg",
      "source_url": "https://www.pexels.com/photo/...",
      "license": "Pexels License",
      "license_verified_at": "2026-04-25",
      "attribution_required": false,
      "alt": "Descrição da imagem",
      "suggested_use": "hero do artigo / capa de carrossel",
      "orientation": "landscape",
      "dominant_colors": ["#8B4513", "#D2B48C", "#2F4F4F"]
    }
  ]
}
```

- Upload each image file to `output/{client}/blog/assets/{asset_id}-{img-id}.{ext}`
- Save the full JSON to `output/{client}/blog/assets/{asset_id}-images.json`
- Follow the schema in `pipeline/data/blog-image-bank.md`

## Featured Image Source Search
[free/public candidate sources or asset types, source origin, license notes, license check date, fallback, rationale, and rejected options]

## Featured Image Selection Criteria
[topic match, thesis match, one-glance clarity, and why this asset is better than a generic category image]

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

## Conclusion
Use a simple system, publish consistently, and review what performs.
If you want help, talk to the team.

## SEO Checklist
- internal links: 3+
- external links: 2+
- word count: 1200-1600
- keyword use: natural and consistent
- image notes: add one featured image that supports the thesis and one or more visual breaks if needed

## Featured Image
- Visual concept: a simple content system diagram with a clear thematic focal point
- Format: 16:9
- Alt text: Diagram showing the main idea of the article
- Implementation note: avoid generic office or lifestyle stock imagery
```

## Veto Conditions

Reject and redo if ANY are true:
1. The post ignores search intent or topic relevance.
2. The structure is too thin to support evergreen SEO value.
3. The CTA is generic or detached from the content goal.
4. The hook strategy is missing or sounds interchangeable.
5. The body reads like a reusable family template instead of a topic-specific article.

## Quality Criteria

- [ ] The topic is aligned with strategy and market research.
- [ ] The keyword and search intent are explicit.
- [ ] The title and meta description are search-friendly.
- [ ] The copy brief lock and hook strategy are explicit.
- [ ] The article structure is scannable and complete.
- [ ] The CTA matches the funnel stage.
- [ ] The SEO checklist includes internal and external linking guidance.
- [ ] The featured-image direction is explicit and thesis-aligned.
- [ ] The featured-image source search is explicit when image research is active, free/public by default, and includes source origin + license check date + fallback.
- [ ] The image bank contains 3-5 images from free/public sources (Pexels/Unsplash/CC0) with license notes when image research is active.
- [ ] The image bank JSON was saved to `output/{client}/blog/assets/{asset_id}-images.json` when the image bank is created.
- [ ] Each image in the bank has source_url, license, license_verified_date, alt text, and suggested_use.
- [ ] Images are visually distinct (different subjects/crops/colors) so social derivatives get variety.
- [ ] The canonical brief is preserved.
- [ ] The family ledger entry is carried forward.
- [ ] ≥30% of sentences contain a transition word from the reference list.
- [ ] SEO title ≤55 chars (including ` | Brand` suffix).
- [ ] Meta description is 120-160 characters.
