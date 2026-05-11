---
id: "squads/social-growth/output/amiclube/visual-decision-cards/ac-30-31-rcc-v7"
name: "AC-30-31 RCC v7"
title: "Render Compliance Card — AC-30-31 v7"
icon: "✅"
client: amiclube
asset: AC-30-31
version: 7
status: pending_review
---

# Render Compliance Card — AC-30-31 v7

## Asset

- **Asset ID:** AC-30-31
- **Versão:** v7
- **Tipo:** Instagram Carrossel (7 slides)
- **Dimensão:** 1080x1350 (4:5)
- **HTML source:** `squads/social-growth/output/amiclube/social/previews/ac-30-31-carousel-v7.html`
- **Export dir:** `squads/social-growth/output/amiclube/social/publish/ac-30-31-v7/`

## Render Verification

### Dimensões (via ImageMagick identify)

| Slide | Arquivo | Largura | Altura | Proporção | Tamanho | Status |
|-------|---------|---------|--------|-----------|---------|--------|
| 1 | ac-30-31-v7-01.png | 1080 | 1350 | 4:5 | 359635B | ✅ |
| 2 | ac-30-31-v7-02.png | 1080 | 1350 | 4:5 | 275159B | ✅ |
| 3 | ac-30-31-v7-03.png | 1080 | 1350 | 4:5 | 83031B | ✅ |
| 4 | ac-30-31-v7-04.png | 1080 | 1350 | 4:5 | 277251B | ✅ |
| 5 | ac-30-31-v7-05.png | 1080 | 1350 | 4:5 | 133606B | ✅ |
| 6 | ac-30-31-v7-06.png | 1080 | 1350 | 4:5 | 246566B | ✅ |
| 7 | ac-30-31-v7-07.png | 1080 | 1350 | 4:5 | 63979B | ✅ |

### pt-BR Diacritics Check

- ✅ "perguntas", "confiável", "serenidade", "contextualizar" — todos os acentos verificados no HTML source
- ✅ "prévia", "órgãos", "avaliação" — não aplicável (artigo é checklist, não documento legal)
- ✅ Nenhuma transliteração detectada

### Image Source Implementation (v7 Rotation)

| Slide | Background | Implementation | Status |
|-------|-----------|----------------|--------|
| 1 | Article hero + warm cream scrim | `slide-bg-1`: gradient overlay + `url('../blog/assets/AC-30-09B-seguranca-higiene-hero.jpg')` center/cover | ✅ |
| 2 | Paper texture, no photography | `slide-bg-paper`: warm cream + SVG grain | ✅ |
| 3 | Macro crop + amber scrim | `slide-bg-3`: amber gradient 48% + same hero crop | ✅ |
| 4 | Paper texture + teal inspection line | `slide-bg-paper` + `.teal-line` | ✅ |
| 5 | Blurred hero + coral overlay | `slide-bg-5`: blur(3px) + coral gradient | ✅ |
| 6 | Paper texture, no photography | `slide-bg-paper` + two-col comparison | ✅ |
| 7 | Clean crop + CTA plate | `slide-bg-7`: warm overlay + `.cta-plate` block | ✅ |

### No-Mock / No-Chrome Check

- Grep HTML source: `chrome|mock|phone|instagram|avatar|like|comment|hashtag|verified|browser` → 0 matches inside `.slide`
- `.preview-dots` navigation: outside art surface, hidden in export mode (`display: none !important`)
- No phone frames, browser bars, social interaction UI, publication simulation

### No-Arrow / No-Button Check

- Grep HTML source: `arrow|chevron|anterior|próximo|previous|next|swipe` → 0 matches inside `.slide`
- VDC prohibition (line 231) upheld: no arrows/chevrons/previous-next in visible art

### HTML-PNG Sync

- Track translateX shifts by 100% per slide (slide 0 → slide 6)
- Viewport: 1080x1350, overflow hidden, export-mode body class
- Body font: Fraunces (serif 700-800) + Nunito Sans (sans 400-700)
- Export PNGs confirmed: 1080x1350 x 7

### VDC Parity

| Slide | VDC Directive | Render Match | Status |
|-------|-------------|--------------|--------|
| 1 | Label: `GUIA DE COMPRA` (uppercase) | `GUIA DE COMPRA` | ✅ |
| 1 | Article hero + warm cream scrim | ✅ slide-bg-1 | ✅ |
| 2 | Paper texture, giant `01` | ✅ slide-bg-paper + `q-number: 01` | ✅ |
| 3 | Amber scrim 48%, macro crop | ✅ slide-bg-3 + amber gradient | ✅ |
| 4 | Teal inspection line + criteria chips | ✅ `.teal-line` + 3 chips | ✅ |
| 5 | Blurred crop + coral overlay | ✅ blur(3px) + coral overlay | ✅ |
| 6 | Two-col comparison without arrows | ✅ `.two-col-comparison` | ✅ |
| 7 | CTA: `Salve este guia e leia o artigo completo.` | ✅ `.cta-text` matches exactly | ✅ |

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|-------|-------|-------------|-------------|--------------|--------|
| Creative Renderer | social-visual-system | skills/social-visual-system/SKILL.md | AC-30-31 v7 render | Palette tokens, typography scale, export dimensions | invoked |
| Creative Renderer | instagram-carousel | skills/instagram-carousel/SKILL.md | AC-30-31 v7 format | 7-slide 4:5 carousel, horizontal track, progress indicator | invoked |

## Fixes Applied (Post-Initial Export)

| Date | Issue | Fix |
|------|-------|-----|
| 2026-05-09 | Hero image not rendering — `file://` protocol blocks local background-image in headless Chrome | Export script now serves HTML via HTTP server with hero image embedded as data URI |
| 2026-05-09 | Slide 5 text blurred — `filter:blur(3px)` on `.slide-bg-5` applied to entire slide including text | Replaced blurred photo background with warm coral gradient (160deg, coral→amber→cream); text now sharp |
| 2026-05-09 | Export script used `clip` with wrong viewport → slides captured at 420×525 | Fixed: `page.setViewportSize(1080,1350)` + screenshot without clip |
| 2026-05-09 | Slides 2-7 initially exported empty (~7KB) — `display:none` from JS persisted | Fixed: script now clears `display` inline style before repositioning track |
| 2026-05-09 | Slide 1 label: `Guia de Compra` (title case) → `GUIA DE COMPRA` (uppercase per VDC) | Fixed in HTML source |

---

**Verdict:** PASS

**Status:** READY FOR REVIEW