---
name: reels-sequence
description: >
  Create Instagram or Facebook Reels concepts, short-form video scripts, scene
  sequences, on-screen text, cover direction, captions, and CTA structure. Use
  when content must become a replayable vertical video while preserving the
  shared visual direction of an approved carousel or campaign system.
type: prompt
version: 1.0.0
categories:
  - design
  - social-media
  - reels
  - short-form-video
  - content
---

# Reels Sequence

This skill adapts a campaign idea into a vertical short-form video sequence for
Instagram Reels, Facebook Reels, or similar 9:16 video surfaces.

Reels are not Stories. A Reel must work as a standalone, replayable video with a
clear hook, rhythmic progression, and a memorable closing action.

## Read first

- `../social-visual-system/SKILL.md`
- `../social-visual-system/references/visual-foundation.md`
- `../social-visual-system/references/component-system.md`
- `../social-visual-system/references/layout-fit-policy.md`
- `../social-visual-system/references/review-and-export.md`
- `../instagram-carousel/SKILL.md`, when the Reel is part of a carousel campaign, derived from a carousel, or must share the same visual family as an Instagram carousel
- `../../squads/social-growth/pipeline/data/visual-evidence-contract.md`, when used inside the Social Growth Squad

## When to use

Use this skill for:

- Instagram Reels scripts
- Facebook Reels scripts
- short educational videos
- teaser videos for blog posts or campaigns
- proof or result videos
- before/after concepts
- quick tips
- behind-the-scenes content
- carousel-to-video repurposing
- Reel cover direction

## Carousel-Derived Visual Direction

When there is an approved Instagram carousel, campaign carousel, or carousel
brief, treat `../instagram-carousel/SKILL.md` as the canonical visual direction.

Preserve:

- the 6-token brand palette: `BRAND_PRIMARY`, `BRAND_LIGHT`, `BRAND_DARK`, `LIGHT_BG`, `LIGHT_BORDER`, `DARK_BG`
- heading/body font pairing and label style
- hook-first copy discipline from Slide 1
- progressive disclosure rhythm, converted into video scenes
- reusable component language: tags, proof cards, quote boxes, numbered steps, CTA buttons, logo lockups
- layout-fit rules: overflow is a hard reject; restructure or split scenes before shrinking the whole design
- image treatment and readability standards
- preview-before-export workflow
- fixed export target and evidence discipline

Adapt instead of copying:

- convert slides into timed scenes, not static slide screenshots
- replace progress bars and swipe arrows with motion rhythm, cuts, zooms, captions, or scene changes
- use safe areas for Reels UI instead of carousel bottom padding
- design a cover that belongs to the same family but works as a feed thumbnail

## Format rules

- Export target: `1080x1920` vertical video or frame sequence.
- Safe area: keep critical text away from top UI, bottom caption/action areas, and right-side action rail.
- Hook must land within the first 1-3 seconds.
- Use short on-screen text. One idea per scene.
- Prefer 5-8 scenes for most educational Reels.
- Use a static cover when feed appearance matters, but keep the cover direction inside the `reels-sequence` skill and ledger for Reel-native assets.
- Final Portuguese copy must be pt-BR with correct accents and diacritics.

## Sequence patterns

Good Reel patterns include:

- hook -> problem -> insight -> example -> CTA
- question -> answer -> proof -> action
- myth -> truth -> quick demonstration -> CTA
- before -> after -> what changed -> CTA
- carousel hook -> 3 key points -> save/share CTA

## Scene structure

For each scene, define:

- time range
- visual action or shot
- on-screen text
- narration or caption line
- motion note
- safe-area risk

## Cover rules

- Cover should use the carousel's visual tokens and typography.
- Cover headline must be readable as a thumbnail.
- Cover should not include too much text or every scene title.
- If derived from a carousel, use the strongest hook rather than the full carousel title.
- Avoid placing critical text in the bottom area that may be hidden by platform overlays.

## CTA style

Reels CTAs should be fast and replay-friendly:

- save this for later
- send this to someone who needs it
- comment with your case
- follow for the next part
- read the full article
- send a DM with the keyword

## Avoid

- treating a Reel as a Story sequence
- exporting a carousel as a video without adapting timing or motion
- putting paragraphs on screen
- using carousel progress bars, swipe arrows, or dots
- placing key text under platform UI
- starting with the brand name instead of the hook
- approving clipped, compressed, or unreadable text
- shipping unaccented pt-BR copy

## Output

Return:

- Reel concept
- platform target: Instagram Reels, Facebook Reels, or both
- carousel visual baseline used, if any
- hook
- scene-by-scene sequence
- on-screen text
- narration or caption draft
- cover direction
- CTA style
- export recommendation
- review/preview behavior
- visual evidence block, when used inside Social Growth Squad
