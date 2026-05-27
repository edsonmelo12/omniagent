---
execution: subagent
agent: Visual Director
version: 2
status: ready_for_render
client: amiclube
asset: AC-30-10
format: instagram-carousel
---

# Visual Decision Card — AC-30-10 v2

## Asset Identification

- **Asset ID:** AC-30-10
- **Version:** v2
- **Client:** AmiClube
- **Stage Owner:** Visual Director
- **Parent Blog:** AC-30-09 — `squads/social-growth/output/amiclube/blog/AC-30-09-draft.md`
- **Hub Link Target:** `https://amiclube.com.br/reputacao-marca-artesanal-avaliar-antes-comprar/`
- **Channel / Format:** Instagram carousel
- **Slide Count:** 6 slides
- **Final Canvas:** 1080x1350 PNG per slide
- **Preview Requirement:** horizontally navigable review preview with controls outside the art surface and one slide visible at a time
- **Status:** ready_for_render

## Research Sources

| Source | Path | Applied Decision |
|---|---|---|
| Creative Director skill | `skills/creative-director/SKILL.md` | Kept editorial magazine tone with proof-led opening and clear CTA cadence. |
| Social Visual System skill | `skills/social-visual-system/SKILL.md` | Defined typography scale, texture rules, spacing and export-safe composition. |
| Instagram Carousel skill | `skills/instagram-carousel/SKILL.md` | Fixed 6-slide 4:5 carousel structure and horizontal preview behavior. |
| Skill Invocation Gate | `squads/social-growth/pipeline/data/skill-invocation-gate.md` | Added ledger rows for required Visual Director skills. |
| Visual Production Gate | `squads/social-growth/pipeline/data/visual-production-gate.md` | Completed VDC fields: DNA acceptance, canvas, style, image, typography, CTA, navigation. |
| Generation Contract | `squads/social-growth/pipeline/data/generation-contract.md` | Ensured identity, routing, creative decision, caption/link and export proof are explicit. |
| Campaign Manifest | `squads/social-growth/output/amiclube/review/campaign-manifest.json` | Aligned title, article URL and preview target with the social derivative. |
| Draft | `squads/social-growth/output/amiclube/social/drafts/ac-30-10.md` | Preserved the 5-signal structure and the article link requirement. |

## Client DNA Acceptance

- **Acceptance Status:** allowed
- **Selected Style:** editorial-magazine + proof-layer
- **Allowed Envelope Match:** editorial, useful, warm and trust-building.
- **Must Feel Like:** editorial, clear, proof-led, artisanal, calm and credible.
- **Must Avoid:** mock UI, generic card soup, neon/cyber, overly dense text blocks.
- **Decision:** v2 uses the article hero on slide 1 only, then switches to texture-only slides with typography-led rhythm.

## Visual Style Decision

- **Exact Visual Style:** Editorial Magazine + Proof Layer
- **Execution Family:** proof-led with texture-only inner slides
- **Composition Logic:** slide 1 uses the blog hero image; slides 2-6 use Design System textures, gradients and typographic blocks only.
- **Why This Style:** reputation is a trust topic; an editorial format supports careful reading and makes the checklist feel authoritative.
- **Baseline:** current article hero and previous social system constraints; no direct visual reuse from other posts.

## First Impression Diversity

- **Recent Assets Checked:** `ac-30-10` previous render, `ac-30-07`, `ac-30-08`, `ac-30-17`
- **Opening Visual:** hero image on slide 1 with "FOTO BONITA NÃO BASTA" headline
- **First Impression Role:** proof - the article hero makes the topic feel grounded immediately
- **Difference From Previous AC-30-10:** previous version repeated the hero image on every slide; v2 uses image only on slide 1 and texture-only inner slides
- **Similarity Risk:** low
- **Continuity Justification:** brand continuity comes from warm editorial tone and the reputation thesis, not from reusing the same image on every frame.

## Image Allocation

- **Image allocated:** `AC-30-09-reputacao-marca-hero.jpg`
- **Source path:** `squads/social-growth/output/amiclube/blog/assets/AC-30-09-reputacao-marca-hero.jpg`
- **Use scope:** slide 1 only
- **Slides 2-6:** no image reuse; Design System textures and gradients only

## Background And Image Decision

- **Background Image Decision:** image-source on slide 1 only
- **Primary Image Source:** `squads/social-growth/output/amiclube/blog/assets/AC-30-09-reputacao-marca-hero.jpg`
- **License Status:** inherited from blog asset record
- **Rotation Strategy:** none; image does not repeat on slides 2-6
- **Slide 1 (Cover):** dark background, hero image center, proof headline
- **Slide 2:** cream texture, signal 1 card
- **Slide 3:** cream texture, signal 2 card
- **Slide 4:** cream texture, signal 3 card
- **Slide 5:** cream texture, signal 4 card
- **Slide 6:** cream texture, signal 5 + checklist + CTA

## Typography

- **Heading Family:** DM Sans, 700-800 for editorial hooks and signal titles
- **Body Family:** Inter, 500-700 for legible pt-BR text
- **Accent Treatment:** uppercase labels with letter-spacing
- **Title Size Target:** 62-82 px on final canvas
- **Body Size Target:** 25-32 px on final canvas
- **CTA Size Target:** 15-18 px on final canvas
- **Minimum Font Size:** 25 px

## Palette

| Token | Hex | Role |
|---|---|---|
| Ink | `#111827` | dark base and export canvas |
| Cream | `#f7f3ee` | light slide background |
| Terracotta | `#c45c1f` | signal labels and accents |
| Amber | `#d9a85a` | CTA and highlight blocks |
| Teal | `#0f766e` | secondary accent |
| Warm Brown | `#b45309` | supporting contrast |

## Layout, Alignment And Safe Area

- **Canvas:** 1080x1350 px, 4:5
- **Safe Area:** minimum 88 px from outer edges
- **Primary Grid:** centered editorial grid with strong optical balance
- **Vertical Alignment:** centered cards with lower CTA anchor on the last slide
- **Progress Indicator:** visible controls outside the art surface only
- **Preview Navigation:** horizontal swipe/drag in preview; no arrows inside art

## Slide-By-Slide Direction And Copy

### Slide 1 — Capa / Hook

- **Purpose:** stop the scroll and establish the thesis
- **Background:** dark scrim with article hero image
- **Copy:**
  - Label: `GUIA DE COMPRA`
  - Title: `FOTO BONITA NÃO BASTA`
  - Support: `5 sinais para avaliar reputação com mais critério antes de comprar.`

### Slide 2 — Sinal 1

- **Background:** cream texture only
- **Copy:**
  - Question: `A peça aparece em detalhe real?`
  - Answer: `Foto de longe ou edição pesada = mais suposição.`
  - Note: `Textura, proximidade e ângulos = mais serenidade.`

### Slide 3 — Sinal 2

- **Background:** cream texture only
- **Copy:**
  - Question: `A marca explica materiais e uso?`
  - Answer: `Contextualizar não é aula técnica.`
  - Note: `Materiais, personalização e uso = menos ruído.`

### Slide 4 — Sinal 3

- **Background:** cream texture only
- **Copy:**
  - Question: `A apresentação sugere cuidado?`
  - Criteria: `luz coerente` · `fundo limpo` · `leitura clara`
  - Note: `Vitrine organizada = compra menos arriscada.`

### Slide 5 — Sinal 4

- **Background:** cream texture only
- **Copy:**
  - Question: `O atendimento transmite tranquilidade?`
  - Answer: `Clareza, prazo explicado e personalização sem ruído.`
  - Note: `Calma e precisão são sinais de cuidado.`

### Slide 6 — Sinal 5 + CTA

- **Background:** cream texture only
- **Copy:**
  - Question: `O portfólio é consistente?`
  - Close: `Consistência = marca não depende de acerto ocasional.`
  - Checklist: `1. Close visível? 2. Imagens consistentes? 3. Prazo claro? 4. Linguagem com critério? 5. Depoimentos específicos? 6. Apresentação premium? 7. O conjunto inspira confiança?`
  - CTA: `Quer saber mais? O link está na bio.`
  - Footer URL: `https://amiclube.com.br/reputacao-marca-artesanal-avaliar-antes-comprar/`

## CTA Treatment

- **CTA Type:** explicit save/read CTA
- **Primary CTA:** `Quer saber mais? O link está na bio.`
- **CTA Link Target:** `https://amiclube.com.br/reputacao-marca-artesanal-avaliar-antes-comprar/`
- **Position:** slide 6, lower-middle, inside a subtle cream plate
- **Style:** warm editorial pill; no arrow glyphs inside the art

## Export Expectation

- **Final Export:** 6 PNG files
- **Dimensions:** 1080x1350 px each
- **Naming:** `ac-30-10-01.png` through `ac-30-10-06.png`
- **Preview:** horizontal navigable HTML with visible controls outside the art surface
- **Validation:** slide count, dimensions, no clipped text, no image reuse on slides 2-6, HTML-PNG sync

## Explicit Prohibitions

- **No Mock / Chrome:** no phone frames, Instagram headers, likes, comments or browser chrome
- **No Arrows In Art:** no chevrons, anterior/próximo, swipe arrows inside exported slides
- **No Image Reuse On Inner Slides:** slides 2-6 must remain texture-only
- **No Generic Card:** no flat, textureless card layouts

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Visual Director | creative-director | `skills/creative-director/SKILL.md` | AC-30-10 v2 creative route | editorial proof-led reputation narrative | invoked |
| Visual Director | social-visual-system | `skills/social-visual-system/SKILL.md` | AC-30-10 v2 system handoff | typography, textures, export size, no-image inner slides | invoked |
| Visual Director | instagram-carousel | `skills/instagram-carousel/SKILL.md` | AC-30-10 v2 format | 6-slide 4:5 carousel, horizontal preview | invoked |

## Render Handoff

- **Renderer May Proceed:** yes, v2 is the authoritative decision card
- **Renderer Must Preserve:** slide 1 hero only, texture-only slides 2-6, 6 slides, no arrows in art, pt-BR diacritics, CTA link target
- **Renderer Must Record:** RCC v2 with image evidence, texture-only inner slides, export paths and dimension validation
