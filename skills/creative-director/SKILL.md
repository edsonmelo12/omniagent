---
name: creative-director
description: >
  Directs client-agnostic creative batches with real visual variation,
  anti-repetition rules, first-impression diversity, and prompt-ready art
  direction. Use when planning new assets for any registered client, reviewing
  repetitive batches, choosing a visual family, or preparing briefing for the
  export and motion pipeline.
type: prompt
version: "0.2.0"
categories: [creative, design, social, planning]
---

# Creative Director

This skill plans creative direction for any client before generation.

It exists because the system already produces batches, exports assets, and renders motion. The missing layer is creative decision-making: reading the client table, choosing a better composition, varying structure across the batch, and preventing the same visual logic from repeating item after item.

The skill works as a four-layer system:

1. client creative profile
2. client creative DNA
3. batch objective
4. post idea

The profile layer defines constraints. The DNA layer defines the client-specific creative personality. The post idea leads the message. The batch layer decides variation.

## When to use

Use this skill when you need to:

- plan a new batch for any client
- avoid repetitive layouts across a batch
- prevent repeated first-frame or cover impressions in the client's feed
- improve visual hierarchy and contrast
- choose a different art direction for each item
- prepare a briefing that the current export and motion scripts can execute
- review whether a new batch looks too similar to the last one

## What to read first

Before making decisions, inspect the current context:

- the active client record or creative table
- the client creative DNA, if present
- the client creative profile, if present
- `squads/social-growth/output/creative/client-creative-profile-template.md`
- `squads/social-growth/output/<client>/creative-dna.md`, if the client has one
- `squads/social-growth/output/creative/production-package.md`
- `squads/social-growth/output/creative/visual-direction.md`
- `squads/social-growth/output/creative/validation-checklist.md`
- `squads/social-growth/output/creative/source-decision-matrix.md`
- `references/creative-rules.md`
- `references/art-directions.md`
- `references/anti-repetition.md`
- `references/examples.md`
- `references/test-prompts.md`
- `references/reference-board-principles.md`
- `references/free-source-policy.md`
- `references/source-selection-guide.md`
- `squads/social-growth/pipeline/data/visual-evidence-contract.md`, when used inside the Social Growth Squad

Use the client record and the output manifests to understand what has already been rendered and what kind of structure the system tends to repeat.

### Creative hierarchy

When choosing the visual route, apply this order:

1. client niche and category
2. client creative DNA
3. client creative profile
4. post function
5. post idea
6. channel and format
7. composition
8. typography
9. CTA
10. finishing and export

The niche should define the first visual angle.
The creative DNA should define the second angle.
The post idea should shape the third angle.
The image should support both without overpowering the message.

## Core job

The skill must:

1. read the client table and extract the creative signals
2. read the client creative DNA and apply its fixed personality signals
3. read the client creative profile and apply its fixed constraints
4. classify the item type
5. identify the batch goal
6. detect repetition risk from recent output
7. choose a visual family
8. define composition and hierarchy
9. produce prompt-ready briefing for the current pipeline

It must not:

- render the image itself
- replace the existing export scripts
- invent a new production pipeline
- force every piece into the same layout

## Input shape

The skill should work with a brief like:

- client name
- client table or brief snapshot
- client creative DNA, if present
- client creative profile or visual DNA layer
- batch id
- channel
- format
- list of items
- campaign objective
- last batch context
- visual references already used
- recent first impressions or cover/frame screenshots, when available
- tone constraints
- allowed experimentation level

Example:

```md
Client: registered client name
Niche: service, product, education, or local business
Batch: batch-04
Channel: Instagram Feed
Format: carousel and feed
Objective: increase clarity and perceived value
Recent context: batches 01 to 03 already used
Constraints: keep brand coherence, but avoid repeated structure
Experimentation level: medium
```

## Output shape

The skill should always return a creative brief in this structure:

```md
# Creative Brief

## Batch Context
- Client:
- Batch:
- Channel:
- Objective:

## Creative Profile
- Client niche:
- Creative DNA:
- Brand feel:
- Image story:
- Allowed image types:
- Preferred mood:
- Palette anchors:
- Background treatment:
- Overlay guidance:
- Typography direction:

## Client Table Signals
- Niche:
- Offer:
- Audience:
- Tone:
- Palette:
- Proof:
- Image guidance:

## Recommended Direction
- Family:
- Mood:
- Composition:
- Focal Point:

## Alternatives
1. ...
2. ...
3. ...

## Per-Item Notes
- Item 1:
- Item 2:
- Item 3:
- Item 4:

## Anti-Repetition Warnings
- ...

## First Impression Diversity
- Recent assets checked:
- Opening image/crop:
- First impression role:
- Difference from recent assets:
- Similarity risk:
- Continuity justification, if any:

## Prompt Guidance
- ...

## Approval Checklist
- ...
```

## Visual Batch Quality Contract

For any batch with two or more visual assets, the creative brief must include a variation matrix before rendering starts.

Use this structure:

```md
## Visual Variation Matrix

| Asset | Objective | Format Skill | Visual Style | Baseline | Why This Style | Anti-Repetition Note |
|-------|-----------|--------------|--------------|----------|----------------|----------------------|
| ... | ... | ... | ... | ... | ... | ... |
```

Rules:

- Every asset must declare one explicit format skill.
- Every asset must declare one selected visual style from the available visual style library.
- Every asset must cite a baseline, approved reference, or clearly marked inferred reference.
- The chosen style must be justified by the asset objective, not by convenience.
- Adjacent assets should not repeat the same composition logic unless the repetition is deliberate and explained.
- A batch may share brand palette, finish, and typography discipline, but it must vary focal logic, density, rhythm, or mood across assets.
- Repeating the same style in three or more assets is allowed only when the matrix explains why the campaign needs that repetition.

## First Impression Diversity Contract

The first frame, cover, or feed-facing thumbnail must feel visually distinct from recent assets from the same client. This is mandatory even when the internal frames vary.

The goal is to prevent the audience from thinking "I already saw this" before reading the new content.

Required decision fields for every social asset:

```md
## First Impression Diversity
- **Recent Assets Checked**: [last 3 client assets, or `not available` + reason]
- **Opening Image / Crop**: [image path, crop, focal point, or `not used`]
- **First Impression Role**: [hero | texture | proof | backstage | context | comparison | CTA | typography-led]
- **Difference From Recent Assets**: [image/crop | composition | treatment | color | density | focal logic]
- **Similarity Risk**: [low | medium | high]
- **Continuity Justification**: [required when similarity risk is medium/high]
```

Rules:

- The opening frame should vary at least two of these factors from nearby client assets: image/crop, composition, treatment, dominant color, density, or focal logic.
- Reusing an image is allowed only when the role or treatment changes clearly enough to create a new first impression.
- Do not use the same image with the same crop, same overlay, same text position, and same color mood across adjacent assets unless continuity is intentional and documented.
- For blog-derived social assets, the blog image catalog may be reused, but the opening image/crop must be selected for feed distinctiveness, not only topic fit.
- If only one relevant image exists, vary crop, scale, focal zone, scrim, color temperature, density, and composition.

First-impression hard vetoes before handoff:

- no first-impression check for a social asset
- cover or first frame repeats image, crop, composition, and treatment from a recent asset without justification
- variation limited to changing text while the feed-facing visual impression remains the same
- similarity risk marked `high` without a specific strategic continuity reason

Hard vetoes before handoff:

- no baseline or reference declared
- no format skill declared
- no visual style declared
- same visual style repeated across the batch without a strategic reason
- same composition backbone repeated across adjacent assets
- variation limited to copy changes or color swaps

## Evidence discipline

When this skill is used inside the Social Growth Squad, follow `pipeline/data/visual-evidence-contract.md`.

The brief must not claim that a baseline, source image, approval, preview test, or export validation exists unless it can point to a file path, URL, command, screenshot, verdict, or explicit record.

Use these labels in the brief:

- `Verified:` for evidence that was actually checked.
- `Inferred:` for a decision derived from context without direct evidence.
- `Missing:` for required evidence that is not available.

If required evidence is missing, mark the asset as blocked instead of filling the gap with assumptions.

## Source guidance

The skill should also output a source recommendation when a piece needs external imagery:

- no external source
- CC0 / Public Domain support image
- Unsplash / Pexels support image
- Wikimedia Commons reference
- Pixabay fallback

Record the chosen source class, source name, URL, license type, and attribution requirement before production.

## Default source matrix

Use the source-decision matrix as the default decision table for choosing whether a post should rely on external imagery at all.

## Decision workflow

### 1. Diagnose the batch

Find the real creative problem:

- is the batch too similar to the previous one?
- is the issue weak hierarchy?
- is the issue lack of contrast?
- is the issue too much text and not enough visual logic?
- is the issue a repeated focal point?

### 2. Read the client table

Every item must be interpreted through the client signals:

- niche
- offer
- audience
- tone
- palette
- proof
- image guidance

### 2b. Read the client DNA

When available, the client creative DNA should narrow the visual personality:

- mood
- energy level
- palette anchors
- allowed families
- preferred background treatment
- overlay guidance
- anti-patterns
- repetition guardrails

If the DNA is missing, derive a draft from the creative profile and mark it as inferred.

### 3. Classify each item

Every item must map to a visual purpose:

- manifesto
- proof
- backstage
- educational
- comparison
- conversion
- closing

### 4. Choose the direction

Pick the direction based on the item's role, the niche, and the batch goal.
Do not default to the same family every time.

### 5. Apply anti-repetition rules

Check recent assets and make sure the new direction changes:

- focal logic
- text hierarchy
- density
- balance
- temperature
- composition

### 6. Deliver briefing

Return:

- recommended direction
- 3 alternatives
- per-item composition notes
- prompt-ready guidance
- risk notes
- approval checklist
- creative DNA notes, when applicable

## Principles

### 1. One batch, multiple structures

Do not give every item the same backbone. The batch should feel like a coherent set, not a copy-paste grid.

### 2. Variation must be functional

Do not vary color only. The change must affect how the piece is read.

### 3. Repetition is a bug

If two adjacent pieces feel structurally identical, the skill should flag it.

### 4. Clarity beats ornament

### 5. Let the niche lead the image

The client table decides whether the image should show hands, tools, materials, workspace, product, team, results, or no external source at all.

### 6. Let the client profile keep the style coherent

When a client has a creative profile, the profile should stabilize the look:

- Amiclube-like clients can use richer color, decorative environments, craft texture, and warmer compositions.
- Dallas Rent a Car-like clients can use executive, premium, cleaner, and more restrained compositions.
- The profile should not freeze the system into one template; it should constrain the family, not the composition.

### 6b. Let the client DNA keep the personality coherent

When a client has a creative DNA file, the DNA should define the brand's creative personality:

- Amiclube-like clients can lean into colorful, decorative, warm and expressive image-led compositions.
- Real Engenharia-like clients can lean into premium, segmented and editorial compositions with strong contrast control.
- Porto Real-like clients can lean into practical, clear and comparison-friendly compositions with restrained premium cues.
- The DNA should be stable across batches, but it can evolve when repeated evidence proves a better creative fit.

### 7. Keep the pipeline stable

The job of the skill is to improve the creative decision layer, not to replace the production scripts.

## Typography System

Typography must create variety through role, scale, spacing and line breaks, not by multiplying font families.

### Core rule

- Use a maximum of two font families in the same piece.
- Prefer one main family plus one accent family.
- If the image is strong, keep typography controlled and precise.
- If the image is weak or missing, let typography carry more personality and structure.

### Typography roles

- **Hook**: the opening line that stops the scroll.
- **Support**: the short line that explains or frames the hook.
- **Proof**: the line, number or claim that gives credibility.
- **CTA**: the closing action or prompt to move the reader.
- Keep keyword emphasis inside the same title size when the word must remain part of the composition.
- Apply these rules to every client and every post; only the content changes, not the composition logic.
- When emphasizing a keyword inside the title, keep it inline with the surrounding phrase; do not offset it as a floating label or overlap it across the previous word.
- If the keyword still creates crowding, move that keyword to its own continuation line inside the same title block rather than forcing it to share space with the previous line.

### Role-based direction

- **Manifesto**: use heavier weight, tighter line breaks and a decisive vertical rhythm.
- **Proof-led**: use clean hierarchy, strong numeric emphasis and restrained spacing.
- **Educational**: use modular lines, clear indentation and easy scanning.
- **Backstage**: use a more human tone, softer contrast and deliberate breathing room.
- **Comparison**: use split hierarchy, mirrored weights or visible contrast between sides.
- **Closing**: use a compact final statement and a CTA that feels isolated.
- **Commercial direct**: use short lines, clear offer framing and a CTA that reads instantly on mobile.

### Anti-patterns

- Repeating the same title size across the whole batch.
- Repeating the same line break pattern across adjacent pieces.
- Treating proof as body copy with no emphasis.
- Placing the CTA in the same visual position every time.
- Using decorative fonts only to simulate creativity.
- Sacrificing mobile readability for style.

### Typography decision rule

- When the piece needs posture, push the headline structure.
- When the piece needs trust, compress and clarify the hierarchy.
- When the piece teaches, make the reading path obvious.
- When the piece converts, keep the CTA isolated and unambiguous.
- When the background is light, the title must either move to a darker zone or gain a local dark overlay behind it before using light text.
- If the title is light on a light background, fix contrast before adjusting size or adding more decorative treatment.
- For image-led posts, treat the image as the full background canvas. Do not introduce a solid side panel or card that replaces the background; use a controlled scrim, gradient, or translucent overlay instead.
- When a post needs text on one side, keep the text block floating over the background with transparency or scrim support. Never convert that side into an opaque block unless the source composition explicitly requires a stable plate.
- The default hierarchy for image-led work is: full background image, controlled scrim, readable text, then small support accents. Do not reverse this into a card-first layout.
- If contrast still feels weak after the initial scrim, darken the image base first and then reapply a transparent scrim. Never solve contrast by letting the overlay collapse the image into an opaque field.
- For Amiclube educational image-led posts, use a working text scale of 66px for the title, 40px for the complementary line, 37px for bullets, 40px for the CTA, and 35px for the footer line unless a specific layout exception is required.
- If you need to deviate from that scale, do it only to protect mobile readability or to preserve a deliberate hierarchy shift.
- When the client palette contains a dark anchor color, use that tone for the title instead of pure black.
- Avoid white halos, white strokes, or bright drop shadows on body or title text; they read as rendering artifacts on light imagery.
- The palette bars above the title should reflect actual client palette anchors, not arbitrary colors.

## Reference files

Read these files for detailed rules:

- `references/creative-rules.md`
- `references/art-directions.md`
- `references/anti-repetition.md`
- `references/examples.md`

## Direction selection rules

Choose a direction according to what the piece needs most:

- **Editorial** when clarity and hierarchy matter
- **Proof-led** when credibility matters
- **Backstage** when process and craft matter
- **Manifesto** when posture and conviction matter
- **Comparison** when contrast matters
- **Educational** when teaching matters
- **Closing** when the piece ends the sequence
- **Commercial direct** when the piece should convert

## Quality checklist

Before approving a direction, confirm:

- the piece is different from the previous one
- the focal point is obvious
- the hierarchy is readable on mobile
- the batch has real variation
- the direction matches the piece purpose
- the output can feed the existing export pipeline
- the direction passes the validation checklist before render

## Anti-repetition signals

Treat these as warning signs:

- same focal point as the previous asset
- same text weight distribution
- same composition base
- same CTA treatment
- same mood repeated too many times
- same visual temperature across the whole batch

## Final rule

If a piece only changes the text but keeps the same visual logic, it is not different enough.

The goal is not just to make pretty assets. The goal is to make a batch where each piece has its own reason to exist.
