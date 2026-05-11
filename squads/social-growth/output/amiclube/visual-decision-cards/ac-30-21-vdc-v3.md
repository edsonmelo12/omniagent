### Visual Decision Card — AC-30-21

- **Asset ID**: AC-30-21
- **Channel / Format**: Instagram / Carrossel
- **Visual Skill**: instagram-carousel
- **Final Canvas**: 1080x1350px
- **Campaign-Hub Preview**: 420x525px, max display size, no-clipping rule, swipe navigation
- **Selected Style**: Minimalist Texture (4-color system: cream, peach, sage, brown)
- **Client DNA Acceptance**: allowed (Minimalist Texture está em allowed)
- **Baseline / Reference**: AC-30-19 v2 (minimalist baseline with space-between alignment)
- **Composition Logic**: image-led (slides 1 and 4 with background-image, others texture-only)
- **Recent Assets Checked**: AC-30-17, AC-30-18, AC-30-19, AC-30-20, AC-30-34, AC-30-06
- **Opening Image / Crop**: `AC-30-05-preco-valor-hero.jpg` (slide 1), center crop, focal point on price/value theme
- **First Impression Role**: hero (different from AC-30-06 which also uses same image but different crop/treatment)
- **Difference From Recent Assets**: uses blog images from different parent (AC-30-05 for slide 1, AC-30-01 for slide 4)
- **Similarity Risk**: medium (same image as AC-30-06, but different crop and treatment)
- **Continuity Justification**: AC-30-06 uses full-width overlay; AC-30-21 uses split blocks with image as background for slides 1 and 4 only
- **Background Image Decision**: background-image (slides 1 and 4), texture-only (slides 2, 3, 5, 6, 7)
- **Background Image Source**: 
  - Slide 1: `output/amiclube/blog/assets/AC-30-05-preco-valor-hero.jpg` (Pexels id 8465936)
  - Slide 4: `output/amiclube/blog/assets/AC-30-01-escolher-com-criterio-hero.jpg` (Pexels licensed)
- **Image Treatment**: 
  - Slide 1: center crop, overlay 35% opacity #000, warm peach accent
  - Slide 4: center crop, overlay 40% opacity #000, sage accent
- **Typography**: DM Sans (headlines 26-30px), Playfair Display (accent), min 12px on final canvas
- **Minimum Font Size**: 12px on 1080x1350 canvas
- **Palette**: #F5F0EA (cream), #E8D5C4 (peach), #D4DDD0 (sage), #8C6A5E (brown), #C85A48 (accent red)
- **CTA Treatment**: inline CTA button, 14px padding, brand-accent background, rounded 2px
- **Navigation / Interaction**: horizontal track (translateX), previous/next arrows, progress dots, swipe/touch support
- **Export Expectation**: 7 PNGs, 1080x1350 each
- **Validation Method**: `node squads/social-growth/scripts/verify-html-png-sync.mjs --client amiclube`

## Skill Invocation Ledger
| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Visual Director | creative-director | skills/creative-director/SKILL.md | AC-30-21 VDC | Selected Minimalist Texture, defined 2-image composition logic | invoked |
| Visual Director | social-visual-system | skills/social-visual-system/SKILL.md | AC-30-21 VDC | Assigned instagram-carousel, defined 4-color palette, typography | invoked |
| Visual Director | instagram-carousel | skills/instagram-carousel/SKILL.md | AC-30-21 VDC | Defined 7-slide flow with 2 image slides, navigation system | invoked |
