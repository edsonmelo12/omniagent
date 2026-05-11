---
name: stories-sequence
description: >
  Create vertical story sequences for Instagram Stories, Facebook Stories, or
  similar story surfaces. Use when the content should be consumed quickly frame
  by frame with one idea per screen, interactive rhythm, and direct-response CTA
  behavior.
type: prompt
version: 1.0.0
categories:
  - design
  - social-media
  - stories
  - content
---

# Stories Sequence

This skill adapts the shared visual system to fast 9:16 story formats for
Instagram Stories, Facebook Stories, and similar ephemeral vertical surfaces.

## Read first

- `../social-visual-system/SKILL.md`
- `../social-visual-system/references/visual-foundation.md`
- `../social-visual-system/references/component-system.md`
- `../social-visual-system/references/layout-fit-policy.md`
- `../social-visual-system/references/review-and-export.md`
- `../instagram-carousel/SKILL.md`, when the story sequence is part of a carousel campaign, derived from a carousel, or must share the same visual family as an Instagram carousel
- `../../squads/social-growth/pipeline/data/visual-evidence-contract.md`, when used inside the Social Growth Squad

## When to use

Use this skill when the user needs:

- Instagram Stories
- Facebook Stories
- quick educational frames
- interactive prompts
- teaser sequences
- proof plus CTA
- direct-message or reply-oriented content

## Carousel-Derived Visual Direction

When there is an approved Instagram carousel, campaign carousel, or carousel
brief, treat `../instagram-carousel/SKILL.md` as the canonical visual direction.

Preserve:

- the 6-token brand palette: `BRAND_PRIMARY`, `BRAND_LIGHT`, `BRAND_DARK`, `LIGHT_BG`, `LIGHT_BORDER`, `DARK_BG`
- heading/body font pairing and label style
- hook-first copy discipline
- progressive disclosure rhythm, adapted into fast story frames
- reusable component language: tags, proof cards, quote boxes, numbered steps, CTA buttons, logo lockups
- layout-fit rules: overflow is a hard reject; split or simplify frames before shrinking the whole design
- image treatment and readability standards
- preview-before-export workflow
- fixed export target and evidence discipline

Adapt instead of copying:

- reduce density compared with carousel slides
- remove carousel progress bars, swipe arrows, dots, and Instagram feed chrome
- use story-native pacing, safe areas, and direct-response CTA behavior
- make each frame understandable in a quick tap-through context

## Format rules

- Use `1080x1920`.
- Keep one main idea per frame.
- Use larger type and less copy than carousel formats.
- Prioritize rhythm, contrast, and direct readability.
- Design around vertical safe areas.
- Keep critical text away from areas likely to be covered by platform UI or reply controls.
- Facebook Stories and Instagram Stories share the same export target, but CTA language may differ by campaign objective.
- Final exports must remain fixed at `1080x1920`; review HTML may scale responsively for inspection.
- Review previews for multi-frame stories must include real navigation, such as next/previous controls, dots, keyboard support, or another explicit way to inspect each frame.
- A story sequence is not approved until every frame can be reviewed without relying on manual file opening.
- Do not claim that frame navigation, export dimensions, or preview behavior were validated unless the output includes evidence compatible with the Visual Evidence Contract.
- Final Portuguese copy must be pt-BR with correct accents and diacritics.

## Sequence patterns

Good patterns include:

- hook -> proof -> takeaway -> CTA
- question -> answer -> example -> CTA
- myth -> truth -> action -> CTA

## CTA style

Stories should ask for immediate action:

- reply to this story
- send a DM with a keyword
- vote mentally or via sticker equivalent
- tap a link sticker equivalent
- tap through for the next step

### 🚨 Mandatory CTA — Final Frame

**Every story sequence must end with a clear CTA on the last frame (in Portuguese pt-BR):**

| CTA Type | Text | When to Use |
|----------|------|-------------|
| Save | "👆 Salve para depois" | Default — drives Saves metric |
| Follow | "👆 Siga para mais" | Follower growth goal |
| DM | "👆 Mande uma mensagem" | Lead generation |
| Link | "👆 Tap to learn more" | Traffic to article/site |

For story sequences that are part of a larger campaign (accompanying carousel/posts), consider including a brief "Leia a Descrição" call on the first frame if there's an associated post with more context.

## Avoid

- multi-paragraph frames
- document-like density
- horizontal carousel affordances
- reels-only pacing for a story that should be tap-through
- carousel progress bars, swipe arrows, dots, or feed chrome
- review HTML that only shows the first frame
- preview scaling that hides clipped content or unreadable type
- unaccented pt-BR copy

## Output

Return:

- frame-by-frame sequence
- platform target: Instagram Stories, Facebook Stories, or both
- carousel visual baseline used, if any
- pacing notes
- safe-area reminders
- CTA style
- export recommendation
- review/preview behavior
- visual evidence block, when used inside Social Growth Squad
