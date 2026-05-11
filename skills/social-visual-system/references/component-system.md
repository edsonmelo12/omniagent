# Component System

These components should be reusable across formats:

- eyebrow label
- hero headline
- subhead or support line
- proof block
- quote block
- feature list
- numbered steps
- CTA block
- brand lockup

## Usage rules

- Reuse components, not entire layouts.
- Keep CTA styling consistent with the platform tone.
- Use proof blocks for numbers, claims, and screenshots.
- Use numbered steps only when the content is genuinely procedural.
- Brand lockup should support the post, not dominate it.

## Image treatment

- For local images, embed as base64 `data:` URI when generating standalone HTML.
- Prefer `<img>` with `object-fit: cover` over giant inline CSS backgrounds.
- Add overlays only to preserve readability.
