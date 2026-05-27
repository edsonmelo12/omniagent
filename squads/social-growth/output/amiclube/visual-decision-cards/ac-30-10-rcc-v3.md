---
execution: subagent
agent: Creative Renderer
version: 3
status: approved
client: amiclube
asset: AC-30-10
format: instagram-carousel
---

# Render Compliance Card — AC-30-10 v3

## Asset Identification

- **Asset ID:** AC-30-10
- **Version:** v3
- **Client:** AmiClube
- **Stage Owner:** Creative Renderer
- **Format:** Instagram carousel, 6 slides, 1080x1350 PNG each
- **Style:** editorial-myth

## Style Tokens

| Token | Hex | Applied To |
|---|---|---|
| Cream | `#F7F3EE` | texture-only slides 2, 4 |
| Dark | `#1A1918` | texture-only slides 3, 5 |
| Terracotta | `#C45C1F` | eyebrow labels, accents |
| Warm Brown | `#8C6A5E` | gradient start (slide 6) |
| Gold | `#D9A85A` | dark variant eyebrow, CTA highlights |

## Image Source

- **Hero Image:** `squads/social-growth/output/amiclube/blog/imagens/AC-30-09-campanha-como-avaliar-reputação-de-marca-artesanal/instagram-carousel/instagram carousel-como-avaliar-reputacao-de-v1.webp`
- **Use Scope:** slide 1 only
- **Inner Slides:** texture-pattern only, no image reuse

## Slides Content

### Slide 1 (Cover)
- Eyebrow: REPUTAÇÃO VISUAL
- Title: FOTO BONITA NÃO BASTA
- Body: 5 sinais para avaliar uma marca artesanal antes de comprar.

### Slide 2 (Sinal 1)
- Eyebrow: SINAL 1
- Heading: ACABAMENTO VISÍVEL
- Body: A marca mostra detalhe, textura, proximidade. Não só foto heroica distante.

### Slide 3 (Sinal 2)
- Eyebrow: SINAL 2
- Heading: CLAREZA COMERCIAL
- Body: Prazo, personalização, forma de pedido e contato — tudo compreensível sem esforço.

### Slide 4 (Sinal 3)
- Eyebrow: SINAL 3
- Heading: LINGUAGEM COM CRITÉRIO
- Body: A marca evita promessas vazias e comunica com sobriedade — não só entusiasmo.

### Slide 5 (Sinal 4)
- Eyebrow: SINAL 4
- Heading: DEPOIMENTOS ESPECÍFICOS
- Body: Relatos sobre foto vs. realidade, apresentação e atendimento — provas concretas, não elogios genéricos.

### Slide 6 (CTA)
- Eyebrow: SINAL 5
- Heading: CONSISTÊNCIA DO CONJUNTO
- Body: Checklist com 7 perguntas de avaliação
- CTA: Quer saber mais? O link está na bio.

## Typography Implemented

- **Heading:** Playfair Display 700-800, 62px export
- **Body:** DM Sans 500-800, 40px export
- **Caption/CTA:** 28px export
- **Minimum Font Size:** 28px (caption/CTA on export canvas)

## Export Specification

- **Output Directory:** `output/amiclube/social/publish/ac-30-10/`
- **Files:** `ac-30-10-01.png` through `ac-30-10-06.png`
- **Dimensions:** 1080x1350 px each
- **Format:** PNG
- **Preview HTML:** `output/amiclube/social/previews/ac-30-10-carousel-reputacao.html`

## Validation Checklist

- [x] Slide count: 6
- [x] Dimensions: 1080x1350 each
- [x] Slide 1 uses image; slides 2-6 are texture-only
- [x] No arrows/chevrons in art surface
- [x] No mock/chrome (phone frame, Instagram header, likes, comments)
- [x] pt-BR diacritics preserved
- [x] CTA link target: `https://amiclube.com.br/reputacao-marca-artesanal-avaliar-antes-comprar/`
- [x] HTML preview matches PNG content
- [x] Caption matches `social-final-captions.json`

## HTML-PNG Sync

- **HTML Slide Count:** 6
- **PNG Count:** 6
- **Content Verified:** yes
- **Sync Status:** pass

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Creative Renderer | social-visual-system | `skills/social-visual-system/SKILL.md` | AC-30-10 v3 | DS textures, typography, export fidelity | invoked |
| Creative Renderer | instagram-carousel | `skills/instagram-carousel/SKILL.md` | AC-30-10 v3 | 6-slide carousel structure, preview behavior | invoked |
| Creative Renderer | creative-director | `skills/creative-director/SKILL.md` | AC-30-10 v3 | Editorial-myth consistency, proof-layer CTA | invoked |

## Render Execution

Status: **approved** — all gates passed, PNGs exported and synced.
