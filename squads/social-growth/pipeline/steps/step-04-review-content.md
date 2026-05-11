---
execution: subagent
agent: reviewer
model_tier: powerful
inputFile: squads/social-growth/output/content/content-production-package.md
outputFile: squads/social-growth/output/review/content-review.md
---

# Step 04: Review Content

## Context Loading

Load these files before executing:
- `squads/social-growth/pipeline/data/fast-safe-routing-policy.md` - confirm whether the delivery used quick, fast-track or full route
- `squads/social-growth/output/blog/blog-architecture.md` - editorial architecture and thesis to validate when present
- `squads/social-growth/output/blog/blog-brief.md` - canonical brief and proof freshness gate to validate when present
- `squads/social-growth/output/blog/blog-post.md` - final optimized blog post to review when present
- `squads/social-growth/output/repurposing/content-repurpose.md` - repurposed social package when present
- `squads/social-growth/output/content/content-production-package.md` - content production package to review
- `squads/social-growth/output/context/geo-discoverability-summary.md` — site-level GEO and entity clarity when present
- `squads/social-growth/output/creative/visual-direction.md` — visual direction to validate alongside copy
- `squads/social-growth/output/creative/rendered-assets.md` — final render manifest to validate against the brief
- `squads/social-growth/output/creative/validation-checklist.md` — gate checklist for clarity, proof, closing strength and anti-repetition
- `squads/social-growth/pipeline/data/visual-production-gate.md` — mandatory social visual decision/render/review gate
- `squads/social-growth/pipeline/data/skill-invocation-gate.md` — mandatory skill invocation evidence for social generation
- `squads/social-growth/output/{client}/creative-dna-acceptance.json` — active client creative acceptance envelope when available
- `_opensquad/core/best-practices/content-discovery-optimization.md` — SEO, GEO and LLM optimization rules
- `_opensquad/core/best-practices/blog-post.md` — blog structure and readability rules
- `_opensquad/core/best-practices/blog-seo.md` — SEO and intent rules
- `squads/social-growth/pipeline/data/quality-criteria.md` — review rubric
- `squads/social-growth/pipeline/data/blog-policy.md` — universal blog policy for all clients
- `squads/social-growth/pipeline/data/blog-publication-scorecard-template.md` — weighted publication score model and decision rules
- `squads/social-growth/pipeline/data/client-editorial-backlog-template.md` — per-client discrepancy and learning backlog
- `squads/social-growth/pipeline/data/blog-structure-families.md` — structure variety and anti-repetition rules
- `squads/social-growth/pipeline/data/anti-patterns.md` — recurring mistakes to avoid
- `squads/social-growth/pipeline/data/output-examples.md` — reference examples
- `_opensquad/core/best-practices/review.md` — review methodology
- `squads/social-growth/pipeline/data/blog-family-ledger-template.md` - family repetition ledger template

## Instructions

### Process
0. Identify the route used (`quick_social_copy`, `blog_derived_social`, `full_campaign_asset`, `correction_fast_track`) and apply the matching gates from `fast-safe-routing-policy.md`.
1. Score the package against the quality criteria.
   - use the weighted publication scorecard (0-100).
   - assign a decision: `publish`, `revise`, or `hold`.
2. Validate that the visual direction matches the blog, repurpose package and content production package.
3. Validate that the rendered assets match the content production package and the visual direction.
4. Validate the batch against the creative validation checklist.
5. If a blog post exists, validate it against blog readability, SEO, GEO and LLM optimization rules.
6. If a blog architecture exists, validate the thesis, structure family and proof map before approving the draft.
7. If a blog brief exists, validate the proof freshness gate and family ledger entry before approving the draft.
8. Validate the article length against the function of the piece and the squad length ranges.
9. Validate the featured image direction against the thesis and reject generic visuals.
10. Validate that the featured image selection criteria are explicit and defensible.
11. Validate that the featured image source search is free/public by default and includes rationale.
12. If a repurposed package exists, validate it against repurposing and native-channel rules.
13. If a GEO summary exists, validate that the article does not outrun the upstream site or entity clarity.
14. Validate that the section arc is not the same default skeleton used in nearby posts.
15. Validate that the canonical brief, copy brief lock, chosen hook and family ledger survived optimization.
16. Treat genericity as a scored dimension, not a stylistic note.
17. Assign a P1 blocker when the post is structurally repetitive, has a weak or generic opening, or adds GEO blocks without real extractable value.
18. Assign a P1 blocker when the article body appears script-generated, template-shaped, or not traceable to the brief and architecture stages.
19. Point out the strongest parts and the blocking problems.
20. Identify exact places that need revision.
21. Separate required fixes from optional improvements.
22. Return a verdict that the next step can trust.
23. Apply the Visual Production Gate to every social visual asset: verify the Visual Decision Card, Render Compliance Card, first impression diversity, background/image decision, typography minimum, campaign-hub preview behavior, navigation and export validation evidence.
24. Validate Client Creative DNA Acceptance for every social VDC; block styles outside the client's envelope even if the render is technically correct.
25. Block any social visual asset whose design decisions or render evidence are incomplete, even if the asset appears visually acceptable.
26. Apply `skill-invocation-gate.md`: reject any social generation artifact whose required skills were not invoked and evidenced in a `Skill Invocation Ledger`.
27. Do not infer skill usage from good output. If the ledger is missing or vague, verdict is `BLOCKED`.
28. Update or append `squads/social-growth/output/review/client-editorial-backlog.md` with recurring discrepancy patterns and future topic opportunities.

## Output Format

```
# Content Review

## Verdict
[PUBLISH / REVISE / HOLD]

## Scores
[criterion, score, justification]

## Publication Scorecard
[weighted dimensions, total score, decision threshold result]

## Blog Notes
[topic fit, structure, SEO, GEO, LLM readability, schema, author, sources, length, featured image, image selection criteria, image source search, brief alignment, copy brief lock, chosen hook, family ledger]

## Blog Architecture Notes
[thesis, structure family, proof map, repetition risk, credibility fit]

## Structure Variety Notes
[whether the article uses a distinct arc for its family and how it differs from neighboring posts]

## Copy and Hook Notes
[hook strength, specificity, objection handling, CTA fit, and whether the article sounds interchangeable]

## Repurpose Notes
[source thesis, native fit, CTA, channel adaptation]

## Visual Notes
[layout fit, hierarchy, mobile readability, CTA treatment, featured-image thesis fit]

## Render Notes
[asset paths, manifest quality, export fidelity, variant consistency, source class traceability]

## Visual Production Gate Notes
[Visual Decision Card completeness, Render Compliance Card completeness, first impression diversity, background/image decision, typography minimum, campaign-hub preview, navigation and export validation]

## Skill Invocation Gate Notes
[required skills per agent, ledger completeness, concrete use evidence, mismatches, blocking decisions]

## Required Fixes
[blocking issues only]

## Suggestions
[optional improvements]

## Client Editorial Backlog Update
[recurring discrepancy records, future topic opportunities, decisions log updates]
```

## Output Example

```
# Content Review

## Verdict
CONDITIONAL APPROVE

## Scores
- Hook strength: 8/10 — strong and direct.
- Platform fit: 7/10 — mostly native, but one post is too long.
- CTA clarity: 9/10 — clear and actionable.

## Visual Notes
- Hierarchy is clear, but the cover needs higher contrast to improve mobile readability.
- Reels cover should reduce text density and use a single focal point.

## Render Notes
- Manifest entries are traceable by channel and status.
- Master exports keep the same campaign system across variants.

## Required Fixes
- Shorten the LinkedIn post body by one paragraph.
- Remove repeated wording in the Reel script.

## Suggestions
- Consider adding one proof point in the carousel.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The review gives a verdict without justifications.
2. The review does not distinguish blocking issues from suggestions.
3. The review does not include weighted total score and threshold-based decision.
4. The review sees genericity but does not convert it into a score impact or blocker.
5. The review notices template-like generation but does not block publication.
6. **[multi-slide]** A multi-slide asset fails its visual skill's native interaction model but was approved without flagging the issue.
7. A social visual asset is approved without a complete Visual Decision Card.
8. A social visual asset is approved without a complete Render Compliance Card.
9. A blog-derived social asset ignored available blog imagery without a strategic justification.
10. A social visual asset repeats the first impression of a recent asset without documented continuity reason.
11. A social visual asset violates the client's creative DNA acceptance contract without explicit user approval.
12. The review does not validate campaign-hub preview behavior, typography minimum, first impression diversity, image/background decision and export dimensions.
13. The review approves social generation artifacts without validating `Skill Invocation Ledger` sections.
14. Any required skill for Creator, Visual Director or Creative Renderer is absent, vague or not linked to a concrete decision.

## Quality Criteria

- [ ] Every score has justification.
- [ ] The publication scorecard includes weighted total and explicit threshold result.
- [ ] Blog output, when present, was validated against blog, SEO, GEO and LLM rules.
- [ ] Blog output, when present: ≥30% sentences have transition words (count before approving).
- [ ] Blog output, when present: SEO title ≤55 chars including ` | Brand`.
- [ ] Blog output, when present, included author, source and schema blocks.
- [ ] Blog output, when present, was validated against the copy brief lock and chosen hook.
- [ ] Blog output, when present, matched the squad length range for the piece function.
- [ ] Blog output, when present, included a thesis-aligned featured image note.
- [ ] Blog output, when present, included a free/public featured-image source search note.
- [ ] **[GEO Gate]** Blog output GEO validator score must be ≥60% before approval. Run `node squads/social-growth/scripts/local-blog-validator.mjs --file=blog-post.md` to verify. If <60%, apply `node squads/social-growth/scripts/deep-fix-blog.mjs --file=blog-post.md --geo` and re-validate.
- [ ] Repurposed output, when present, was validated against repurposing rules.
- [ ] The visual direction was validated against the content production package.
- [ ] The render manifest was validated against the visual direction.
- [ ] The creative validation checklist was applied to the batch.
- [ ] **[multi-slide]** Every multi-slide asset (carousel/stories) was validated against its visual skill's native interaction model (navigation, progress bar, chrome rules).
- [ ] Every social visual asset was validated against `visual-production-gate.md`.
- [ ] Every social visual asset was validated against the client's creative DNA acceptance contract when available.
- [ ] Every approved social visual asset has complete Visual Decision Card and Render Compliance Card.
- [ ] First impression diversity, background/image decision, typography minimum and campaign-hub preview behavior were verified.
- [ ] `Skill Invocation Ledger` was verified for every social generation agent output.
- [ ] Required skills were invoked before approving copy, visual direction, render or export.
- [ ] Required fixes are specific.
- [ ] The verdict matches the scores.
- [ ] The reviewer points to exact problems.
- [ ] A client editorial backlog update was produced for future cycles.
