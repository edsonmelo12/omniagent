# SQUAD CONTRACT: AmiClube Social Growth

## 1. Visual Standards (NON-NEGOTIABLE)
- **Canvas:** 1080x1350px (Instagram 4:5 ratio). Preview HTML uses 420x525px viewport scaled via Playwright.
- **No Mock Chrome:** NO Instagram-style frames, fake headers, avatar circles, like/comment icons, or captions in the preview. The art stands alone.
- **Typography:**
  - Headings: 'Playfair Display', serif (Weight 600/700).
  - Body/UI: 'DM Sans', sans-serif (Weight 400/500/700).
- **Color Palette:**
  - `--brand-primary`: #C45C1F (Terracotta)
  - `--brand-accent`: #D4AF37 (Dourado AmiClube)
  - `--dark-bg`: #1A1A1A (Near Black)
  - `--light-bg`: #F7F3EE (Warm Off White)
  - `--light-border`: #E8E0D5

## 2. Format Rules

### Carousels (`instagram-carousel`)
- Alternating light/dark backgrounds for visual rhythm.
- Progress bar on every slide (3px height, position indicator).
- Swipe arrow on right edge (all slides EXCEPT last).
- Navigation: dots + keyboard arrows + swipe/drag for preview review.
- NO Instagram frame wrapper, NO fake app chrome.

### Single Posts (`social-single-post`)
- ONE dominant message only.
- NO navigation arrows, NO swipe cues, NO progress bars.
- Image as full canvas background with scrim/gradient overlay (no opaque cards replacing the image).
- Simple brand lockup (small, corner-positioned).

## 3. Operational Rules
- **No Inventions:** Do not add emojis, "fofura" or tech tutorials.
- **Source Truth:** Only use content from the approved `.md` copy files.
- **Skill Locking:**
  - For Carousels: Use `instagram-carousel` skill logic.
  - For Single Posts: Use `social-single-post` skill logic.
- **Preview Integrity:** HTML previews show the art ONLY. Navigation controls (dots, keyboard, swipe) are for review purposes and must be hidden via `export-mode` CSS during PNG capture.

## 4. Veto Conditions
- Any file with mock Instagram chrome (fake header, avatar, likes, caption) will be rejected.
- Any file using generic system fonts (Arial, Times) will be rejected.
- Any file with dimensions other than 1080x1350 (final export) will be rejected.
- Single posts with navigation arrows or progress bars will be rejected.
- Carousels without progress bars or swipe arrows will be rejected.
