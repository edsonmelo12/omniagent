---
execution: subagent
agent: Atlas CEO
version: 4
status: pending
client: amiclube
asset: AC-30-10
format: instagram-carousel
based_on: ac-30-10-vdc-v3.md
---

# Render Compliance Card — AC-30-10 v4

## Asset Identification

- **Asset ID:** AC-30-10
- **Version:** v4
- **Client:** AmiClube
- **Stage Owner:** Creative Renderer
- **Parent Blog:** AC-30-09
- **Hub Link Target:** `https://amiclube.com.br/reputacao-marca-artesanal-avaliar-antes-comprar/`
- **Channel / Format:** Instagram carousel
- **Slide Count:** 6 slides
- **Final Canvas:** 1080x1350 PNG per slide
- **Preview Requirement:** horizontally navigable review preview with controls outside the art surface
- **Status:** pending render

## Visual Direction Reference

- **VDC:** `output/amiclube/visual-decision-cards/ac-30-10-vdc-v3.md` (approved)
- **Style:** editorial-myth (creme #F7F3EE + terracota #C45C1F, dark alt #1A1918)
- **Design System:** `design-system/styles/editorial-myth.css`
- **Image:** blog hero AC-30-09, slide 1 only; slides 2-6 texture-only

## Composition Map

| Slide | Background | Eyebrow | Heading | Body | Text Variant |
|-------|------------|---------|---------|------|--------------|
| 1 | blog hero + dark-overlay (rgba 0,0,0,0.52) | REPUTAÇÃO VISUAL | FOTO BONITA NÃO BASTA | 5 sinais para avaliar uma marca artesanal antes de comprar. | light |
| 2 | cream texture-pattern (#F7F3EE → #efe4d8) | SINAL 1 | ACABAMENTO VISÍVEL | A marca mostra detalhe, textura, proximidade. Não só foto heroica distante. | dark |
| 3 | dark texture-pattern (#1A1918 → #2d2318) | SINAL 2 | CLAREZA COMERCIAL | Prazo, personalização, forma de pedido e contato — tudo compreensível sem esforço. | light |
| 4 | cream texture-pattern (#F7F3EE → #ede3d6) | SINAL 3 | LINGUAGEM COM CRITÉRIO | A marca evita promessas vazias e comunica com sobriedade — não só entusiasmo. | dark |
| 5 | dark texture-pattern (#1A1918 → #2d2318) | SINAL 4 | DEPOIMENTOS ESPECÍFICOS | Relatos sobre foto vs. realidade, apresentação e atendimento — provas concretas, não elogios genéricos. | light |
| 6 | gradient (#8C6A5E → #C45C1F) | SINAL 5 | CONSISTÊNCIA DO CONJUNTO | Checklist com 7 perguntas de avaliação | dark |

## Typography Scale (Export)

| Token | Size | Family | Weight |
|-------|------|--------|--------|
| Hero (slide 1 title) | 82px | Playfair Display | 700-800 |
| Heading (signal titles) | 62px | Playfair Display | 700 |
| Body | 40px | DM Sans | 500 |
| Eyebrow | 28px | DM Sans | 800 |
| CTA | 28px | DM Sans | 500 |

## Image Handling

- **Source:** `output/amiclube/blog/imagens/AC-30-09-campanha-como-avaliar-reputacao-de-marca-artesanal/instagram-carousel/instagram carousel-como-avaliar-reputacao-de-v1.webp`
- **Use:** slide 1 only, centered, dark overlay 0.52
- **Slides 2-6:** zero image reuse — DS textures only

## Prohibitions

1. No mock / chrome (phone frames, Instagram UI, likes, comments, share icons)
2. No image on slides 2-6
3. No flat textureless backgrounds
4. No font size below 28px on export canvas
5. No navigation buttons inside the art surface (arrows/dots must be in preview chrome, outside canvas)

## Preview Behavior

- Horizontal swipe between slides
- Dot indicators and prev/next arrows in preview chrome only (outside 1080x1350 canvas)
- "arraste" label on non-last slides
- Progress bar at bottom of each slide

## CTA

- Slide 6: "Quer saber mais? O link está na bio."
- Link: `https://amiclube.com.br/reputacao-marca-artesanal-avaliar-antes-comprar/`
- Strategy: link_na_bio

## Output

- **Preview HTML:** `output/amiclube/social/previews/ac-30-10-v4-carousel-reputacao.html`
- **Exports:** `output/amiclube/social/publish/ac-30-10/ac-30-10-01.png` through `ac-30-10-06.png`
- **Preview Manifest:** `output/amiclube/social/previews/ac-30-10-post-preview-manifest.json`

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Creative Renderer | social-visual-system | `skills/social-visual-system/SKILL.md` | AC-30-10 v4 | DS textures, typography, export fidelity | pending |
| Creative Renderer | instagram-carousel | `skills/instagram-carousel/SKILL.md` | AC-30-10 v4 | 6-slide carousel structure, preview behavior, export | pending |
| Creative Renderer | creative-director | `skills/creative-director/SKILL.md` | AC-30-10 v4 | Editorial-myth consistency, proof-layer CTA | pending |

## Veto Conditions

- [ ] Image appears on any slide other than slide 1
- [ ] Any font renders below 28px on export canvas
- [ ] Text is clipped or overflows safe area
- [ ] Mock UI elements (phone frame, Instagram chrome) present
- [ ] Navigation inside art surface
- [ ] Typography not matching export scale (hero 82px / heading 62px / body 40px)