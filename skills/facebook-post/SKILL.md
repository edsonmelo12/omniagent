---
name: facebook-post
description: >
  Create Facebook-native static feed posts, link-preview visuals, announcements,
  testimonials, and campaign cutdowns. Use when a one-frame asset must feel
  native to Facebook while preserving the shared visual direction of an approved
  Instagram carousel or campaign system.
type: prompt
version: 1.0.0
categories:
  - design
  - social-media
  - facebook
  - content
  - static-post
---

# Facebook Post

This skill adapts the shared social visual system into Facebook-native feed
assets. It should preserve the campaign's visual family without copying
Instagram carousel UI literally.

## Read first

- `../social-visual-system/SKILL.md`
- `../social-visual-system/references/visual-foundation.md`
- `../social-visual-system/references/component-system.md`
- `../social-visual-system/references/layout-fit-policy.md`
- `../social-visual-system/references/review-and-export.md`
- `../instagram-carousel/SKILL.md`, when the asset is part of a carousel campaign, derived from a carousel, or must share the same visual family as an Instagram carousel
- `../../squads/social-growth/pipeline/data/visual-evidence-contract.md`, when used inside the Social Growth Squad

## When to use

Use this skill for:

- Facebook feed posts
- Facebook link-preview graphics
- blog article teasers
- announcement graphics
- offer or event posts
- testimonials and proof posts
- campaign cutdowns from Instagram carousel content
- square or landscape static posts for Facebook distribution

## Carousel-Derived Visual Direction

When there is an approved Instagram carousel, campaign carousel, or carousel
brief, treat `../instagram-carousel/SKILL.md` as the canonical visual direction.

Preserve:

- the 6-token brand palette: `BRAND_PRIMARY`, `BRAND_LIGHT`, `BRAND_DARK`, `LIGHT_BG`, `LIGHT_BORDER`, `DARK_BG`
- brand gradient usage for high-emphasis CTA moments
- heading/body font pairing and mobile readability discipline
- hook-first copy logic
- reusable component language: tag labels, proof blocks, quote boxes, numbered steps, feature rows, CTA buttons, logo lockups
- layout-fit rules: overflow is a hard reject; restructure content before shrinking the entire design
- image handling standards: embedded, reliable, and readable under overlays
- preview-before-export workflow
- export-quality standards and fixed output dimensions

Adapt instead of copying:

- remove carousel progress bars, swipe arrows, dot indicators, and Instagram chrome
- convert slide logic into a single Facebook-native composition
- use Facebook-appropriate CTA language and context density
- make the post understandable without swipe behavior

## Format rules

- Recommended landscape export: `1200x630` for link previews, blog teasers, announcements, offers, and article distribution.
- Recommended square export: `1080x1080` for testimonials, culture posts, proof posts, and feed-native static content.
- Use one dominant message only.
- Lead with a hook that works in the Facebook feed without relying on a caption.
- Give enough context for Facebook, but keep the visual itself scannable.
- Avoid Instagram-only UI patterns such as swipe arrows, progress bars, fake app chrome, or carousel dots.
- If the post is a cutdown from a carousel, pick the strongest claim, result, contrast, or CTA instead of compressing every slide into one image.
- Typography must remain readable in mobile feed preview.
- Final Portuguese copy must be pt-BR with correct accents and diacritics.

## Content patterns

Good Facebook post patterns include:

- hook + short proof + CTA
- problem + direct recommendation + CTA
- result number + context + next step
- testimonial quote + attribution + brand sign-off
- blog title + one-line benefit + read-more CTA
- event or offer title + date/condition + CTA

## CTA style

Facebook CTAs should feel conversational and clear:

- read the full article
- send a message to talk about this
- learn how this applies to your business
- comment with your scenario
- save this idea for later
- visit the link in the post

### 🚨 Mandatory CTA — "Leia a Descrição"

**Every new Facebook post must include this visual call-to-action on the image:**

```html
<div style="position:absolute;top:24px;right:24px;z-index:10;display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(0,0,0,0.6);color:#fff;font-family:sans-serif;font-size:11px;font-weight:600;border-radius:20px;">
  <span>📖</span>
  <span>Leia a Descrição</span>
</div>
```

This CTA badge should be placed in the top-right corner of the post image. Additionally, the post caption/description should include the full article link for complete context.

### Last Slide / Final CTA

When the Facebook post is part of a campaign, include a final CTA at the bottom of the image (in Portuguese pt-BR):
- "👆 Salve para depois" (recommended)
- "👆 Leia o artigo completo"
- "👆 Visite o link"

## Layout guidance

- Use the carousel palette and component language as the starting point.
- Use a strong headline area plus one proof or support element.
- Keep the logo lockup subtle unless the asset is brand-awareness focused.
- Use image overlays only when they improve readability.
- For landscape posts, prioritize left/right or layered editorial composition.
- For square posts, prioritize centered impact, proof cards, or typography-led layouts.
- Do not duplicate the same image as both background and thumbnail unless the treatment creates a clearly different role.

## Avoid

- turning a full carousel into a dense one-frame summary
- using swipe cues, progress bars, or Instagram frame elements
- making the design dependent on caption text to be understood
- starting with the brand name instead of the hook
- shrinking the whole design to force more copy into the frame
- approving clipped, compressed, or unreadable text
- shipping unaccented pt-BR copy

## Output

Return:

- Facebook post concept
- selected format: `1200x630` or `1080x1080`
- carousel visual baseline used, if any
- headline and support copy
- visual anchor choice
- CTA style
- layout and component notes
- export recommendation
- review/preview behavior
- visual evidence block, when used inside Social Growth Squad
