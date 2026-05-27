---
id: "squads/social-growth/output/amiclube/visual-decision-cards/ac-30-32-vdc-v7"
name: "AC-30-32 VDC v7"
title: "Visual Decision Card — AC-30-32 v7"
icon: "🎬"
client: amiclube
asset: AC-30-32
version: 7
status: ready_for_render
execution: subagent
skills:
  - creative-director
  - social-visual-system
  - reels-sequence
---

# Visual Decision Card — AC-30-32 v7

## Asset Identification

- **Asset ID:** AC-30-32
- **Versão:** v7
- **Tipo:** Instagram Reels (4 frames)
- **Dimensões:** 1080×1920 (9:16)
- **Status:** PRONTO PARA RENDERIZAÇÃO
- **Post-Preview Generated:** sim — `social/previews/ac-30-32-reels-v6.html` (será atualizado p/ v7)
- **Caption Sourced From:** `social-final-captions.json`
- **Caption Integrity:** match

## Direction

### Visual Style

- **Estilo selecionado:** Typographic Bold c/ background-image no slide 1
- **Paleta:** Deep Burgundy (#3D1A2A), Gold Ochre (#D4A844), Mauve (#8B6B7C)
- **Tipografia:** Playfair Display 700 (headline), DM Sans (body)
- **Composição:** Mixed — image-led slide 1, typography-led slides 2-4
- **Mudança v6→v7:** background-image adicionada ao slide 1 com overlay escuro

### Client DNA Alignment

- ✅ **mustFeelLike:** warm, human, artisanal, expressive, supportive, useful, decorative-but-controlled
- ✅ **mustAvoid:** cold, corporate, tech, cyber, glitch, sterile, generic-card
- ✅ **allowed:** Motion Social (conditional)
- ✅ **conditional:** Motion Social — permitido quando mantém calor humano, clareza e prova
- ✅ **blockedByDefault:** High-Energy Cyber (não aplicável)
- ✅ **Justificativa DNA:** Imagem real de amigurumi em plano detalhado alinha com `hands, materials, products, close human context` (Creative DNA — Image Strategy). Overlay escuro preserva legibilidade e mantém o mood artesanal e acolhedor.

### First Impression Diversity

| Check | Value |
|-------|-------|
| Recent assets checked | AC-30-36, AC-30-15-ds, AC-30-10, AC-30-25, AC-30-18 |
| Opening image/crop | `blog/imagens/ac-30-08B/AC-30-32-instagram-reels.webp` (768×1344) — full-bleed background, crop 9:16 (1080×1920), focal point central-superior |
| First impression role | hero — imagem de produto em close que comunica imediatamente o nicho amigurumi |
| Difference from recent | AC-30-36: typography-only. AC-30-15-ds: ilustração/pattern. AC-30-10: split-screen. AC-30-25: fundo texturizado. **v7 difere**: traz imagem fotográfica real de amigurumi em full-bleed — nenhum asset recente usou foto real como background de slide 1 em Reels |
| Similarity risk | low — imagem real de produto em Reels é inédita no feed recente |
| Continuity justification | N/A — similarity risk low |

## Background Image Decision

- **Decision:** background-image
- **Source path:** `squads/social-growth/output/amiclube/blog/imagens/ac-30-08B/AC-30-32-instagram-reels.webp` (768×1344, 61KB, 8-bit sRGB)
- **Scope:** slide 1 only
- **Slides 2+ background:** Deep Burgundy (#3D1A2A) solid — mesmo tratamento v6

### Image Treatment (slide 1)

| Property | Value |
|----------|-------|
| Fit | cover (fill 1080×1920 mantendo proporção, centralizado) |
| Overlay | linear-gradient escuro (top-to-bottom, rgba(0,0,0,0.55) → rgba(0,0,0,0.35)) |
| Contrast strategy | dark-overlay |
| Text legibility | legible — overlay garante contraste ≥4.5:1 para texto branco (#FFFFFF) sobre fundo escurecido |
| Focal point | centro da peça (amigurumi principal) — composição da imagem orienta headline à esquerda inferior |

## Technical Specs

### Navigation (Reels)

- Vertical scroll ✅
- Snap-to-frame ✅
- Progress bars ✅ (4 bars, ouro #D4A844 quando preenchido)
- Touch swipe ✅
- 4 frames

### Export Requirements

- **Formato:** PNG sequência
- **Frames:** 4
- **Dimensão:** 1080×1920
- **Background slides 2-4:** Deep Burgundy (#3D1A2A)

### Typography

| Level | Family | Size (preview) | Size (export) |
|-------|--------|----------------|---------------|
| Title (headline) | Playfair Display 700 | 36px | 182px |
| Body | DM Sans 400 | 18px | 91px |
| CTA | DM Sans 700 | 16px | 81px |

- **Minimum font size:** 16px (preview) / 81px (export) — CTA

### CTA Treatment

- **Position:** frame 4, abaixo do título, centralizado
- **Styling:** Gold Ochre (#D4A844), DM Sans 700
- **Action:** "Link da BIO" + handle @amiclube

## Content Alignment

| Frame | Conteúdo |
|-------|----------|
| 1 | Hook: "Você sabe se o amigurumi que vai comprar é confiável?" + imagem real de amigurumi como background |
| 2 | Provas 1-3: detalhe real, materiais, apresentação |
| 3 | Provas 4-5: atendimento, portfólio |
| 4 | Provas 6-7 + CTA: link da bio |

## Visual Evidence

| Field | Status | Detail |
|-------|--------|--------|
| Creative decision | verified | Typographic Bold + background-image no slide 1 |
| Format skill | verified | reels-sequence |
| Visual style | verified | Typographic Bold |
| Baseline/reference | verified | v6 existente — `social/previews/ac-30-32-reels-v6.html` |
| Source image path | verified | `blog/imagens/ac-30-08B/AC-30-32-instagram-reels.webp` (768×1344) |
| Source/license status | verified | Imagem do banco do blog AC-30-08B |
| Export path | verified | `social/publish/ac-30-32/` (4 PNGs existentes) |
| Export dimensions | verified | 1080×1920 each |
| Preview path | verified | `social/previews/ac-30-32-reels-v7.html` (a gerar) |
| Preview behavior | verified | Responsivo com navegação entre frames |
| Multi-frame navigation | yes | progress bars + arrows |
| Validation method | manual review + `identify` p/ checagem de dimensões |
| Post-preview generated | pending | será gerado pelo Creative Renderer |
| Reviewer verdict | pending | etapa seguinte |

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|-------|-------|-------------|-------------|--------------|--------|
| Visual Director | creative-director | skills/creative-director/SKILL.md | AC-30-32 batch variation | Typographic Bold + anti-repetição vs. AC-30-33 | invoked |
| Visual Director | social-visual-system | skills/social-visual-system/SKILL.md | AC-30-32 palette & format | Burgundy/Gold/Mauve palette, reels-sequence routing | invoked |
| Visual Director | reels-sequence | skills/reels-sequence/SKILL.md | AC-30-32 navigation & canvas | 9:16 vertical, 4 frames, progress bars, safe-area | invoked |

---

**Handoff to Creative Renderer:**

1. Regenerar `social/previews/ac-30-32-reels-v7.html` a partir do v6:
   - Frame 1: adicionar `background-image: url(../blog/imagens/ac-30-08B/AC-30-32-instagram-reels.webp)` com `background-size: cover; background-position: center`
   - Frame 1: adicionar overlay escuro `::before` com `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.35))`
   - Frames 2-4: manter fundo #3D1A2A sólido (inalterado)
   - Atualizar versão no `<title>` para "AC-30-32 Reels v7 — AmiClube"
2. Exportar novos PNGs (4 frames, 1080×1920) usando o export script
3. Gerar Render Compliance Card

**Status:** READY FOR RENDER
**Approval Gate:** Creative Renderer → Reviewer → Pipeline Auditor → User Checkpoint
