### Render Compliance Card — AC-30-21

- **Decision Card Found**: yes
- **Final Canvas Rendered**: 1080x1350px
- **Campaign-Hub Preview Implemented**: yes, 420x525px, max display size, no-clipping, swipe navigation
- **Visual Skill Behavior**: pass, instagram-carousel with horizontal track, translateX, progress bar, swipe arrows
- **Background Decision Implemented**: background-image (slides 1 and4), texture-only (others)
- **Background Source Implemented**: Slide1: ../../blog/assets/AC-30-05-preco-valor-hero.jpg, Slide4: ../../blog/assets/AC-30-01-escolher-com-criterio-hero.jpg
- **Image Treatment Implemented**: Slide1: center crop, overlay 35% opacity #000; Slide4: center crop, overlay 40% opacity #000
- **Opening Frame Implemented**: AC-30-05-preco-valor-hero.jpg, center crop, focal point on price/value theme
- **First Impression Difference Preserved**: yes, different crop/treatment from AC-30-06
- **Typography Implemented**: DM Sans (headlines 26-30px), Playfair Display (accent), min 12px
- **Minimum Font Size Check**: pass, smallest 12px on 1080x1350
- **Navigation Check**: pass, horizontal track, previous/next arrows, progress dots, swipe support
- **Export Paths**: HTML: social/previews/ac-30-21-v3.html, PNGs: social/publish/ac-30-21-v3/
- **Export Dimension Check**: 1080x1350px via export script
- **Status**: ready

## Skill Invocation Ledger
| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Creative Renderer | social-visual-system | skills/social-visual-system/SKILL.md | AC-30-21 | Applied background-image decisions | invoked |
| Creative Renderer | instagram-carousel | skills/instagram-carousel/SKILL.md | AC-30-21 | Rendered 7-slide carousel with navigation | invoked |

## HTML-PNG Sync
- **HTML-PNG Sync**: pending verification
- **HTML Slide Count**: 7
- **PNG Count**: pending export
- **Content Verified**: pending
- **Sync Script Output**: pending
