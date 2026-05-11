---
name: social-single-post
description: >
  Create strong single-frame social posts, covers, teasers, and static feed
  visuals. Use when one idea should be compressed into one high-impact visual
  without the narrative structure of a carousel.
type: prompt
version: 1.0.0
categories:
  - design
  - social-media
  - content
  - static-post
---

# Social Single Post

This skill turns the shared visual system into a one-frame asset.

## Read first

- `../social-visual-system/SKILL.md`
- `../social-visual-system/references/visual-foundation.md`
- `../social-visual-system/references/component-system.md`
- `../social-visual-system/references/review-and-export.md`
- `../../squads/social-growth/pipeline/data/visual-evidence-contract.md`, when used inside the Social Growth Squad

## When to use

Use this skill for:

- teaser posts
- announcement graphics
- non-Facebook static feed posts
- quote visuals
- one-idea educational posts

Do not use this skill for Facebook-native feed assets or Reel-native covers.
Use `../facebook-post/SKILL.md` for Facebook static posts and
`../reels-sequence/SKILL.md` for Reels, including cover direction inside a Reel
package.

## Format rules

- One dominant message only.
- Headline must carry the piece.
- Use subhead only when it sharpens the claim.
- Prefer one proof element, not many.
- Design for instant comprehension.
- If the background image already carries the visual story, keep it as the only image treatment in the card; do not repeat the same image as a thumbnail, inset, proof window, or mini-card.
- For image-led single posts, the background image is the canvas. Any support copy must sit on overlays or text blocks only, never on a duplicated image layer.
- For image-led posts, preserve the image as an active narrative layer. Use scrims, gradients, translucent blocks, or local contrast support instead of replacing the image with an opaque card-first layout.
- Typography must be readable at mobile review size. If a preview makes the text look small, fix the source scale or hierarchy before approving the asset.
- Export canvas and review preview are separate concerns: keep the final canvas fixed, but provide a review mode when the HTML would otherwise be too large or clipped.
- Do not claim that the image source, baseline, export dimensions, or preview behavior were validated unless the output includes evidence compatible with the Visual Evidence Contract.

## Structure

Suggested structure:

- eyebrow or tag
- headline
- short support line or proof
- visual anchor
- CTA or brand sign-off

### 🚨 Mandatory CTA — "Leia a Descrição"

**Every new single post must include this visual call-to-action badge:**

```html
<div style="position:absolute;top:24px;right:24px;z-index:10;display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(0,0,0,0.6);color:#fff;font-family:sans-serif;font-size:11px;font-weight:600;border-radius:20px;">
  <span>📖</span>
  <span>Leia a Descrição</span>
</div>
```

This CTA badge should be placed in the top-right corner of the post. It signals to viewers that more context exists in the post caption/description.

### Last Slide / Final CTA

When applicable, include a final CTA at the bottom of the image (in Portuguese pt-BR):
- "👆 Salve para depois" (recommended for algorithm engagement)
- "👆 Siga para mais"
- "👆 Leia o artigo completo"

## Avoid

- forcing carousel logic into a static piece
- routing Facebook-native static posts away from `facebook-post`
- routing Reel covers away from `reels-sequence`
- too many competing messages
- decorative clutter that weakens the core idea
- duplicating the same source image in the background and in a secondary frame
- approving a static post whose HTML preview only works at export size

## Output

Return:

- single-frame composition
- headline and support structure
- visual anchor choice
- CTA style
- export recommendation
- visual evidence block, when used inside Social Growth Squad

## Platform Dimensions

| Platform | Dimensions (export) | Aspect Ratio | When to use |
|----------|-------------------|--------------|-------------|
| Instagram Feed | 1080×1080 | 1:1 | Single image, quotes |
| LinkedIn | 1200×627 | 1.93:1 | Professional content |
| Twitter/X | 1200×675 | 16:9 | News, announcements |

For Facebook Feed exports, use `facebook-post` instead.
