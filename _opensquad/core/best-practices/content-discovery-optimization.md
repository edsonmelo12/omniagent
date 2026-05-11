---
name: "Content Discovery Optimization"
platform: "cross-platform"
content_type: "optimization"
description: "Optimization layer for SEO, GEO and LLM readability across blog and long-form editorial content"
whenToUse: |
  Creating agents that optimize content for search engines, generative engines and AI citation readiness.
constraints:
  summary_block_required: true
  tl_dr_required: true
  faq_min_questions: 3
  source_attribution_required: true
  author_context_required: true
  schema_block_required: true
version: "1.0.0"
---

## Purpose

This layer turns long-form content into something both humans and AI systems can extract quickly.
It combines search relevance, citation-friendly structure and answer-friendly prose.

If the problem is the site or brand entity itself, use `geo-ai-discoverability.md` first.
If the problem is the article, use this layer.
Trend signals, audience hypotheses and market framing must come from upstream research. This layer consumes those inputs; it does not invent them.

## Optimization Layers

### SEO

- Match search intent before writing.
- Front-load the primary keyword in the title and H1.
- Use descriptive internal anchors and related subtopics.
- Keep the structure crawlable, fast and readable.

### GEO for Content

- Make the article easy to cite by AI engines.
- Add a short summary or TL;DR near the top.
- Use explicit definitions, facts, comparisons and FAQ blocks.
- Surface author identity, last updated date and source references.
- Prefer named entities, concrete data and clear relationships over vague claims.
- Include a schema block for BlogPosting and FAQPage when the page is intended for publication.
- Include an author block and source notes so the publication can be audited and cited.
- Keep the content aligned to the canonical site/entity narrative that the GEO audit confirmed.
- Do not use this layer to create the market research itself; only translate validated research into a publishable article.

### LLM Readability

- Answer the main question early.
- Use headings that read like retrieval chunks.
- Keep paragraphs short and self-contained.
- Repeat the core thesis without paraphrasing it into ambiguity.
- Include direct statements that can be lifted into summaries without re-interpretation.

## Site-Level Input

When the article depends on brand clarity, the upstream site should already pass:

- entity consistency
- service clarity
- proof density
- schema sanity
- answerability

If these are weak, the article can improve readability but will still inherit the site's ambiguity.

## Content Checklist

- [ ] Title expresses the topic clearly.
- [ ] TL;DR or summary block appears near the top.
- [ ] Primary keyword is present naturally.
- [ ] Entities, metrics and claims are explicit.
- [ ] FAQ addresses likely follow-up questions.
- [ ] Sources are named where relevant.
- [ ] Author and update context are visible.
- [ ] Schema block is included when the content is intended for publication.
- [ ] Author block and source notes are included when the content is intended for publication.
- [ ] Internal links connect to related pages.
- [ ] External links support credibility.
- [ ] The structure remains easy to scan on mobile.

## Anti-Patterns

- Thin intros that delay the answer.
- Keyword stuffing.
- Unlabeled claims without sources.
- Walls of text with no retrieval-friendly structure.
- Generic wording that no AI can cite cleanly.
