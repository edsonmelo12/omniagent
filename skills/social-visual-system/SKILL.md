---
name: social-visual-system
description: >
  Build reusable visual systems for social content across multiple platforms.
  Use when defining brand intake, color tokens, typography, component rules,
  image handling, review flow, export rules, or when adapting one approved
  visual language to more than one social format.
type: prompt
version: 1.1.0
categories:
  - design
  - social-media
  - creative
  - content
---

# Social Visual System

This skill is the shared foundation for social design formats.

Use it to keep visual quality consistent while allowing each platform format to
behave like its native surface instead of forcing one Instagram pattern onto
everything.

## When to use

Use this skill when you need to:

- define a client's visual base for social assets
- derive a full palette from a primary brand color
- choose typography and component behavior for social formats
- adapt one approved visual direction to multiple platforms
- review whether a new format still feels like the same brand
- prevent multiple posts from sharing the same first impression in the feed
- prepare design instructions for a specialized child skill

## Read first

Before deciding layout details, read the relevant references:

- `references/brand-intake.md`
- `references/visual-foundation.md`
- `references/component-system.md`
- `references/format-selection.md`
- `references/layout-fit-policy.md`
- `references/review-and-export.md`
- `squads/social-growth/pipeline/data/visual-evidence-contract.md`, when used inside the Social Growth Squad

Do not read every file by default. Load only what the current task needs.

## Core job

This skill defines the shared system. It does not define a platform-specific
layout by itself.

It should:

1. collect or infer the brand inputs
2. derive reusable visual tokens
3. choose the right typography pairing
4. define the core component behavior
5. select the most appropriate output format
6. validate content fit before render
7. hand the work off to the specialized format skill

It must not:

- pretend every format is an Instagram carousel
- force progress bars, swipe cues, or fake app chrome where they do not belong
- skip preview and review just because the design system is known
- accept overflow as a visual tweak instead of a production failure

## Handoff contract

When this foundation passes work to a child skill, always provide:

- brand name
- social handle if relevant
- primary brand color
- tone
- language
- available assets
- goal of the post
- content structure
- selected format
- export target

## Shared standards

- Favor strong hierarchy over decoration.
- Keep layouts intentional and platform-native.
- Use image overlays only when they improve readability.
- Maintain a clear CTA, but adapt the CTA style to the platform.
- All final Portuguese copy must be pt-BR with correct accents.
- Content fit is a hard production constraint.
- If a layout overflows, change structure before globally shrinking the design.

## First Impression Diversity

The feed-facing frame matters most. A social asset can reuse the same blog image catalog, but its first frame, cover, or thumbnail must not look like a recent post with only the text changed.

Before handoff, declare:

- opening image or crop;
- first impression role: `hero`, `texture`, `proof`, `backstage`, `context`, `comparison`, `CTA`, or `typography-led`;
- recent assets checked, preferably the last 3 client assets;
- difference from recent assets across image/crop, composition, treatment, color, density, or focal logic;
- similarity risk: `low`, `medium`, or `high`.

The opening frame should vary at least two of these factors from nearby client assets: image/crop, composition, treatment, dominant color, density, or focal logic. Reusing an image is valid only when the crop, role, or treatment creates a clearly different first impression.

## Export and Review Contract

Every visual asset must separate final export behavior from review behavior.

Final export:

- Use the exact fixed canvas for the target platform.
- Keep final PNG/JPEG output at the declared dimensions.
- Do not rely on browser viewport size, CSS zoom, or preview scaling to make the final export correct.
- Treat clipped content, missing imagery, or unreadable type as production failures.

Review preview:

- HTML previews must be usable on desktop and mobile review screens.
- If the final canvas is larger than the browser viewport, provide a responsive preview mode or equivalent fit behavior.
- Multi-frame formats must expose navigation in the review preview.
- The preview may scale for review, but the exported asset must remain at the fixed final canvas.

Required handoff fields:

- export dimensions
- preview behavior
- format skill
- selected visual style
- baseline or reference
- first impression role and similarity risk
- known fit risks and fallback plan

## Evidence requirements

When used inside the Social Growth Squad, the setup must include a `Visual Evidence` block or handoff notes compatible with `pipeline/data/visual-evidence-contract.md`.

Do not state that a preview is responsive, a file exported correctly, or a baseline was approved unless the handoff includes the supporting path, validation method, or evidence status.

Use `verified`, `inferred`, `not used`, or `missing` for evidence status. Missing required evidence blocks approval.

## Output shape

Return the shared visual setup in this structure:

```md
# Social Visual Setup

## Brand Intake
- Brand:
- Handle:
- Tone:
- Language:
- Assets:

## Visual Tokens
- Primary:
- Light:
- Dark:
- Light background:
- Light border:
- Dark background:

## Typography
- Heading font:
- Body font:
- Reason:

## Component Rules
- Labels:
- Proof blocks:
- Steps:
- CTA:
- Image treatment:

## Recommended Format
- Format:
- Reason:
- Export target:
- Preview behavior:
- Baseline/reference:

## First Impression Diversity
- Recent assets checked:
- Opening image/crop:
- First impression role:
- Difference from recent assets:
- Similarity risk:

## Fit Assessment
- Top weight:
- Template capacity:
- Overflow risk:
- Fallback plan:

## Handoff Notes
- ...

## Visual Evidence
- Baseline/reference:
- Baseline status:
- Export path:
- Export dimensions:
- Preview path:
- Preview behavior:
- Validation method:
```
