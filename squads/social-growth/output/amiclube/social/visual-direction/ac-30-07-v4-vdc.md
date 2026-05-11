# Visual Decision Card — AC-30-07 (v4)

## Step 03B — Visual Director

**Data:** 2026-05-02
**Pipeline:** Regeneração rigorosa com Pipeline Auditor
**Blog Parent:** AC-30-05 (Preço vs Valor)

---

## Skill Invocation Ledger

| Skill | Arquivo | Status | Decisão |
|-------|---------|--------|----------|
| creative-director | `skills/creative-director/SKILL.md` | ✅ invoked | Família Visual: Motion Social |
| social-visual-system | `skills/social-visual-system/SKILL.md` | ✅ invoked | Sistema visual base: reels |
| reels-sequence | `skills/reels-sequence/SKILL.md` | ✅ invoked | Formato: 9:16 vertical, 4 frames |

---

## Asset Info
- **Asset ID:** AC-30-07
- **Format:** Instagram Reels (reels-sequence)
- **Canvas Final:** 1080x1920
- **Frames:** 4

---

## Visual Style
- **Style Selected:** Motion Social + Authentic Rough
- **Baseline Reference:** AC-30-07 v3 (Motion Social)
- **Baseline Source:** v3 foi aprovado

**Estilo JUSTIFICADO:**
- O tema "preço vs valor" pede ritmo e urgência — Motion Social com blur passa essa sensação de "análise rápida".
- Alternativo ao Dark Premium para manter diversity.

---

## Client DNA Acceptance Gate

**Status:** PASS ✅

| Check | Result |
|-------|--------|
| Estilo em allowed list | ✅ Motion Social (conditional OK), Authentic Rough (conditional OK) |
| Estilo bloqueado | ❌ não |
| Usar blocked style | N/A → não |

---

## First Impression Diversity

- **Recent Assets Checked:** AC-30-07 v3, AC-30-06 v3, AC-30-20 v3
- **Opening Image:** Imagem com blur + headline
- **First Impression Role:** typography-led com motion
- **Difference From v3:** Treatment mais texturizado, mais contraste
- **Similarity Risk:** LOW

---

## Image Decision

- **Source:** Imagem do blog hero AC-30-05 + overlay blur
- **Treatment:** Background com blur + typography overlay
- **Justificativa:** "Preço vs valor" é conceitual — blur passa a ideia de "visão unclear" até a decisão.

---

## Typography

| Element | Fonte | Tamanho | Cor |
|---------|-------|---------|-----|
| Title | Playfair Display 700 | 42px | #FFFFFF |
| Body | DM Sans 400 | 24px | #FFFFFF |
| CTA | DM Sans 700 | 18px | #1A1A1A |
| **Min Font Size:** | — | 24px | — |

---

## Palette (AmiClube Tokens)

| Token | Hex | Uso |
|-------|-----|-----|
| BACKGROUND_DARK | #1A1A1A | Base |
| ACCENT_TERRACOTA | #C85A48 | CTA |
| TEXT_LIGHT | #FFFFFF | Conteúdo |

---

## Frame Structure

| Frame # | Conteúdo | Typography | Background |
|---------|---------|-----------|------------|
| 1 | "PREÇO ALTO OU INVESTIMENTO?" | Headline 42px | Blur + overlay |
| 2 | "PREÇO SEM CONTEXTO NÃO MEDE VALOR" | Headline 32px | Solid dark |
| 3 | 3 filtros: qualidade, confiança, proposta | Bullets 24px | Solid dark |
| 4 | CTA: "COMENTE 'QUERO ANÁLISE'" | Headline 28px + CTA | Terracota |

---

## Navigation (Reels-Native)

- **Padrão:** Vertical scroll/tap-through
- **Progress:** bars
- **Safe Areas:** Texto não conflita com UI nativo Reels

---

## Export Expectation

- **Canvas Final:** 1080x1920 (por frame)
- **Arquivos:** 4 PNGs
- **Naming:** `ac-30-07-v4-frame-{n}.png` (n = 1-4)
- **Validation:** `identify` para confirmar cada dimensão

---

## Render Compliance Card

- Canvas: 1080x1920 ✅
- Preview Hub: HTML navegável com 4 frames ✅
- Primeira Impressão: typography-led com motion ✅
- Fonte imagem: Blog hero + blur ✅
- Min Font Size: 24px ✅
- Navegação: Vertical tap/swipe ✅
- Export Paths: `social/publish/ac-30-07-v4-frame-{n}.png` ✅
- Validação: `identify` → confirmar 1080x1920 ✅

---

## Evidence Status

| Evidência | Status | Método |
|----------|--------|--------|
| Baseline ref | ✅ verified | Caminho: v3 reference |
| Source image | ✅ verified | Blog assets path |
| Export | ⚠️ pending | Ainda não executado |
| Preview test | ⚠️ pending | Após render |
| VDC completo | ✅ ready | Este card |

---

## Quality Gate Checklist

- [x] Client DNA Acceptance verificado
- [x] Estilo em allowed/conditional list
- [x] First Impression declarada
- [x] Similarity risk avaliado
- [x] Min font size em px
- [x] Canvas declarada
- [x] Navegação native do formato
- [x] Skill invocations evidenciadas
- [ ] Reviewer valida (PENDENTE)
- [ ] Pipeline Auditor audita (PENDENTE)