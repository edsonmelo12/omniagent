### Visual Decision Card — AC-30-06

- **Asset ID**: AC-30-06
- **Channel / Format**: Instagram / Carrossel
- **Visual Skill**: instagram-carousel
- **Final Canvas**: 1080x1350px
- **Campaign-Hub Preview**: 420x525px, max display size, no-clipping rule, swipe navigation
- **Selected Style**: Editorial Magazine + Proof Layer
- **Client DNA Acceptance**: allowed (Editorial Magazine está em allowed)
- **Baseline / Reference**: AC-30-17 v3 (premium baseline with 7-slide flow)
- **Composition Logic**: image-led (background-image + overlay + proof layer)
- **Recent Assets Checked**: AC-30-17, AC-30-18, AC-30-19, AC-30-20, AC-30-34
- **Opening Image / Crop**: `AC-30-05-preco-valor-hero.jpg`, center crop, focal point on amigurumi product
- **First Impression Role**: hero (product-focused with warm overlay)
- **Difference From Recent Assets**: new image source (not used in AC-30-17/18/19/20/34), different crop logic
- **Similarity Risk**: low
- **Continuity Justification**: N/A (risk is low)
- **Background Image Decision**: background-image
- **Background Image Source**: `output/amiclube/blog/assets/AC-30-05-preco-valor-hero.jpg` (Pexels id 8465936, licensed)
- **Image Treatment**: center crop, overlay 40% opacity #000, warm editorial overlay
- **Typography**: Playfair Display (headlines 28-32px), DM Sans (body 14px), min 12px on final canvas
- **Minimum Font Size**: 12px on 1080x1350 canvas
- **Palette**: #C45C1F (brand primary), #F7F3EE (light bg), #1A1918 (dark bg), #D4AF37 (accent)
- **CTA Treatment**: bottom band, 420x48px, brand-primary background, white text, rounded 24px
- **Navigation / Interaction**: horizontal track (translateX), previous/next arrows, progress dots, swipe/touch support
- **Export Expectation**: 7 PNGs, 1080x1350 each
- **Validation Method**: `node squads/social-growth/scripts/verify-html-png-sync.mjs --client amiclube`

## Skill Invocation Ledger
| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Visual Director | creative-director | skills/creative-director/SKILL.md | AC-30-06 VDC | Selected Editorial Magazine + Proof Layer, defined composition logic | invoked |
| Visual Director | social-visual-system | skills/social-visual-system/SKILL.md | AC-30-06 VDC | Assigned instagram-carousel, defined navigation, typography system | invoked |
| Visual Director | instagram-carousel | skills/instagram-carousel/SKILL.md | AC-30-06 VDC | Defined 7-slide flow, horizontal track, progress dots, swipe navigation | invoked |
