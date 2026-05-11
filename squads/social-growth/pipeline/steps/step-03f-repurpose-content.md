---
execution: subagent
agent: content-repurposer
model_tier: fast
inputFile: squads/social-growth/output/blog/blog-post.md
outputFile: squads/social-growth/output/repurposing/content-repurpose.md
---

# Step 03F: Repurpose Content

## Context Loading

Load these files before executing:
- `squads/social-growth/pipeline/data/fast-safe-routing-policy.md` — apply `blog_derived_social` route
- `squads/social-growth/output/blog/blog-post.md` — final optimized blog post
- `squads/social-growth/output/strategy/content-plan.md` — approved strategy
- `squads/social-growth/output/research/market-intel.md` — market and opportunity notes
- `squads/social-growth/output/context/social-intelligence-summary.md` — public social signals
- `_opensquad/core/best-practices/content-repurposing.md` — repurposing rules
- `_opensquad/core/best-practices/linkedin-post.md` — LinkedIn structure
- `_opensquad/core/best-practices/instagram-feed.md` — feed and carousel structure
- `_opensquad/core/best-practices/instagram-reels.md` — Reel structure

## Instructions

### Process
1. Extract the core thesis, proof and strongest angle from the finalized blog. Treat the blog as the source of truth.
2. Convert that thesis into a LinkedIn post, an Instagram carousel and a Reel hook/script.
3. Keep each asset native to the channel and tied to a specific CTA.
4. Avoid repeating the blog structure verbatim.
5. Preserve the same strategic point of view across all outputs.
6. Make the repurposed package concise enough for publishing or handoff.
7. Respect the blog's thesis, and do not introduce a channel package that contradicts the approved length or featured-image direction of the source article.
8. Strip internal labels from final copy. The published text must not expose `Hook`, `CTA`, `autoridade de marca`, `negocio premium` or other backstage annotations.
9. For each derivative social asset, include `asset_id`, `channel`, `format`, `final_caption`, `cta`, `hashtags`, `link_target`, `link_strategy`, and `alt_text`.

## Output Format

```
# Content Repurpose

## Source Thesis
[main thesis, audience, objective]

## LinkedIn Post
[hook, body, CTA, hashtags]

## Instagram Carousel
[format, slide arc, CTA, hashtags]

## Instagram Reel
[hook, setup, delivery, CTA, audio note]

## Repurpose Notes
[what was preserved, what was changed, why it fits the channel]

## Social Caption Contracts
| Asset ID | Channel | Format | Final Caption | CTA | Hashtags | Link Target | Link Strategy | Alt Text |
|---|---|---|---|---|---|---|---|---|

## Source Constraints
[blog thesis, word-count target, and featured-image direction that must remain consistent]
```

### Publishable Copy Rule

The LinkedIn, Instagram Carousel and Reel blocks are final copy blocks, not commentary about the copy. If a note is needed for the team, put it in repurpose notes, not in the public-facing lines.

## Output Example

```
# Content Repurpose

## Source Thesis
- Thesis: one strong system beats random posting.
- Audience: owners and marketing teams.
- Objective: authority and demand generation.

## LinkedIn Post
Hook: The problem is rarely content volume. It is content structure.
Body: 3 short paragraphs with one point per paragraph.
CTA: What is the hardest part of keeping your content system consistent?
Hashtags: #contentstrategy #marketing

## Instagram Carousel
Format: Editorial / Thesis
Slide arc: hook, context, 4 insights, CTA
CTA: Save this to revisit when planning your next cycle.
Hashtags: 5-10 relevant tags

## Instagram Reel
Hook: Postar mais nao resolve se o sistema esta errado.
Setup: quick context on why teams stall.
Delivery: 3 concise lessons.
CTA: Follow for the next framework.
Audio note: original voiceover, no forced trend audio.

## Repurpose Notes
- Core thesis preserved.
- LinkedIn emphasizes professional insight.
- Instagram emphasizes saves and quick comprehension.
- Reel emphasizes speed and recall.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The assets read like duplicated blog excerpts.
2. The CTA is not adapted to the channel.
3. The repurpose weakens the original thesis.

## Quality Criteria

- [ ] The blog thesis is preserved.
- [ ] Each derivative asset is native to its channel.
- [ ] The CTA is specific per asset.
- [ ] The package is concise and usable.
- [ ] The repurpose adds distribution value without sounding repetitive.
- [ ] The repurpose does not contradict the blog's approved length or featured-image direction.
