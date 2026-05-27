---
id: "squads/social-growth/output/amiclube/visual-decision-cards/ac-30-32-rcc-v7"
name: "AC-30-32 RCC v7"
title: "Render Compliance Card — AC-30-32 v7"
icon: "🖼️"
client: amiclube
asset: AC-30-32
version: 7
status: ready_for_review
execution: subagent
---

# Render Compliance Card — AC-30-32 v7

## Render Details

- **Asset ID:** AC-30-32
- **Versão:** v7
- **Tipo:** Instagram Reels (4 frames)
- **Final Canvas Rendered:** 1080×1920 px
- **Campaign-Hub Preview Implemented:** sim — preview responsivo com navegação entre frames

## Visual Production Gate Compliance

### Stage 0 — Client Creative DNA Acceptance
- **Gate Passed:** ✅ sim
- **Style:** Typographic Bold c/ background-image no slide 1
- **DNA Envelope:** allowed (warm, human, artisanal, expressive, supportive)

### Stage 1 — Visual Decision Gate

| Check | Status |
|-------|--------|
| Decision Card Found | ✅ sim — `visual-decision-cards/ac-30-32-vdc-v7.md` |
| Visual Skill Behavior | ✅ pass — `reels-sequence` vertical 9:16, safe areas respeitadas |
| Background Decision Implemented | ✅ `background-image` no frame 1 com overlay escuro |
| Background Source | ✅ `blog/imagens/ac-30-08B/AC-30-32-instagram-reels.webp` |
| Image Bank Applied To | ✅ slide 1 only |
| Slides 2+ Background | ✅ Deep Burgundy #3D1A2A (typography-only, mesmo v6) |
| Contrast Strategy Implemented | ✅ `dark-overlay` — linear-gradient 180deg rgba(0,0,0,0.55)→rgba(0,0,0,0.35) |
| Text Legibility Check | ✅ pass — overlay garante contraste ≥4.5:1 em texto branco |
| Opening Frame Implemented | ✅ imagem full-bleed com overlay, headline à esquerda |
| First Impression Difference | ✅ image-led vs. todos os assets recentes typography-only/pattern |
| Typography Implemented | ✅ Playfair Display 700 (headline), DM Sans (body) |
| Minimum Font Size Check | ✅ 16px preview / 81px export (CTA) |
| Navigation Check | ✅ pass — progress bars + buttons + scroll |
| Post-Preview Generated | ✅ `social/previews/ac-30-32-reels-v7.html` |
| Caption Source Confirmed | `social-final-captions.json` |
| Caption Integrity Check | match |

### Stage 2 — Render Compliance

| Property | Value |
|----------|-------|
| **Export Paths** | `social/publish/ac-30-32/` |
| **Frame 1** | `ac-30-32-01.png` — 1080×1920, 234 KB |
| **Frame 2** | `ac-30-32-02.png` — 1080×1920, 108 KB |
| **Frame 3** | `ac-30-32-03.png` — 1080×1920, 119 KB |
| **Frame 4** | `ac-30-32-04.png` — 1080×1920, 91 KB |
| **Export Dimension Check** | ✅ verified with `identify` — all 1080x1920 |
| **CSS Transition Active** | no — frames são show/hide, sem transição CSS |
| **Screenshot Method** | Playwright viewport screenshot a 1080x1920 |

### Stage 4 — HTML-PNG Sync Gate

| Check | Status |
|-------|--------|
| HTML Slide Count | 4 |
| PNG Count | 4 |
| Content Verified | ✅ sim — copy, CTA, branding correspondem |
| Sync Status | ✅ pass |

## Visual Evidence

| Field | Status | Detail |
|-------|--------|--------|
| Asset | verified | AC-30-32 |
| Status | ready_for_review | |
| Creative decision | verified | Typographic Bold + background-image slide 1 |
| Format skill | verified | reels-sequence |
| Visual style | verified | Typographic Bold |
| Baseline/reference | verified | v6 existente |
| Export path | verified | `social/publish/ac-30-32/` |
| Export dimensions | verified | 1080×1920 (identify) |
| Preview path | verified | `social/previews/ac-30-32-reels-v7.html` |
| Preview behavior | verified | responsivo com navegação entre frames |
| Multi-frame navigation | yes | progress bars + buttons |
| Validation method | verified | identify + Playwright screenshot |
| Known risks | frame 4 com 91 KB (typography-only, esperado) | |

---

**Status:** READY FOR REVIEW
**Handoff to:** Reviewer
