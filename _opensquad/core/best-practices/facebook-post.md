---
name: "Facebook Feed Post"
platform: "facebook"
content_type: "feed"
description: "Single image posts optimized for reach, engagement, and link clicks"
whenToUse: |
  Creating agents that produce Facebook feed posts or static image content for Facebook Pages.
  Facebook rewards link clicks and comments more than saves/shares.
constraints:
  caption_max_chars: 63206
  caption_visible_chars: 200
  image_ratio: "1.91:1 landscape or 1:1 square"
  image_resolution: "1200x630px (landscape) or 1080x1080px (square)"
  recommended_hashtags: "0-5 (optional)"
  version: "1.0.0"
---

## Platform Rules

- **Links are clickable** — Unlike Instagram, Facebook supports clickable links in posts. Use this to drive traffic to your website or landing pages.
- **Engagement hierarchy** — Comments > Shares > Reactions > Clicks. Facebook rewards conversations more than passive engagement.
- **Algorithm factors** — Early engagement (first 30-60 min), comment replies, and link clicks all boost reach.
- **Best posting times** — 9 AM - 1 PM or 7-9 PM in your audience's local time. Weekdays (Tue-Thu) perform strongest.
- **Reach is broader** — Facebook audiences skew older (35+) and have higher intent for services/products.
- **Visuals work differently** — Facebook is more text-tolerant. Strong headlines and clear CTAs perform well.

## Image Formats

### Landscape (1.91:1) - Preferred for News Feed

- **Dimensions**: 1200×630 px (export)
- **Aspect ratio**: 1.91:1 — optimized for Facebook's link preview format
- **Best for**: Promotional content, announcements, external links, product highlights
- **Text-to-image ratio**: Aim for 20% text maximum on the image itself

### Square (1:1) - Alternative

- **Dimensions**: 1080×1080 px (export)
- **Aspect ratio**: 1:1
- **Best for**: Testimonials, quotes, behind-the-scenes, culture content

## Content Guidelines

### Visual Direction

- One strong focal point — Facebook feeds are faster, users scroll quickly
- High contrast headlines work well (white text on dark background)
- Use bold, san-serif typography for readability at small sizes
- Editorial-quality photos between text blocks (same principle as Instagram)
- Avoid excessive text on image (Facebook tolerates less than Instagram)

### Caption Structure

1. **Hook (first 200 chars)** — Direct address or provocative question. "Você conhece alguém que...?" or "Esse erro pode estar custando R$..."
2. **Body** — Expand on the hook with context, data, or story. Use line breaks for readability.
3. **CTA** — Clear ask: comment, share, click link, or visit profile. Facebook rewards link clicks.
4. **Hashtags** — Optional, 0-5 max. Facebook is not hashtag-driven like Instagram.

### Tone Differences from Instagram

- **More conversational** — Write as if speaking to a friend, not formal
- **Less polished** — Overly "advertisy" content performs poorly
- **More direct** — Front-load the value proposition
- **Explicit calls-to-action work** — Facebook users respond to clear asks

## Writing Guidelines

- **First 200 characters are critical** — They must convey the main value or question
- Use line breaks aggressively — Every 1-2 sentences on a new line
- Ask questions that invite comments — "Você já passou por isso?" or "Qual é a sua experiência?"
- Include a link when relevant — Facebook tracks link clicks as engagement
- End with a specific CTA — "Comenta aqui", "Compartilha com alguém que...", "Link na bio"
- Hashtags are optional — Use 0-5 if at all, typically at the very end

## Output Format

```
=== FORMAT ===
[Single Image Post - choose landscape (1.91:1) or square (1:1)]

=== IMAGE ===
Dimensions: [1200x630px or 1080x1080px]
Visual direction: [Describe the main visual element]
Primary text on image: [Headline text if applicable, keep minimal]

=== CAPTION ===
[Hook paragraph — first 200 chars must convey main value or question]

[Body paragraph — expand with context, data, or story. Use line breaks.]

[CTA — specific action: comment, share, click link, visit profile]

[Hashtags (optional, 0-5 max)]
```

## Quality Criteria

- [ ] Image uses correct dimensions (1200×630 or 1080×1080)
- [ ] Visual has a clear focal point that communicates at a glance
- [ ] Caption hook (first 200 chars) delivers value or asks engaging question
- [ ] Caption includes clear CTA (comment, share, or link)
- [ ] Tone is conversational, not overly polished
- [ ] Link included when driving traffic (if relevant)
- [ ] Hashtags used sparingly (0-5) or not at all
- [ ] Content is appropriate for Facebook's broader audience demographic

## Anti-Patterns

- **Instagram spam** — Copy-pasting Instagram captions without adaptation
- **Too much text on image** — Facebook tolerates less text overlay than Instagram
- **Overly polished aesthetics** — "Adverty" content gets hidden in feeds
- **No CTA** — Facebook rewards clear asks; silent posts get less reach
- **Hashtag overload** — Facebook is not hashtag-driven; 20+ hashtags look spammy
- **Link-less promotional posts** — If promoting, include the link — it's a key engagement signal
- **Negative or defensive tone** — Facebook algorithm penalizes complaint-heavy content
- **Posting too frequently** — 1-2x/day max; more signals spam behavior