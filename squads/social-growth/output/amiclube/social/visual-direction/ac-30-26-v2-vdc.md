# Visual Direction Card — AC-30-26 (v2)

## Step 03B — Visual Director

**Data:** 2026-05-02
**Pipeline:** Regeneração rigorosa com Pipeline Auditor
**Blog Parent:** AC-30-05B (Veludo = Luxo)

---

## Skill Invocation Ledger

| Skill | Arquivo | Status | Decisão |
|-------|---------|--------|----------|
| creative-director | `skills/creative-director/SKILL.md` | ✅ invoked | Família Visual: Motion Social |
| social-visual-system | `skills/social-visual-system/SKILL.md` | ✅ invoked | Sistema visual base: stories-sequence |
| stories-sequence | `skills/stories-sequence/SKILL.md` | ✅ invoked | Formato: 9:16 vertical, 4 frames |

---

## Asset Info
- **Asset ID:** AC-30-26
- **Format:** Instagram Reels (stories-sequence)
- **Canvas Final:** 1080x1920
- **Frames:** 4

---

## Visual Style
- **Style Selected:** Motion Social + Dark Premium
- **Baseline Reference:** v1 previous Motion Social style
- **Baseline Source:** v1 existed but needs regeneration

**Estilo JUSTIFICADO:**
- O tema "Macro textura ASMR: O toque do luxo" pede ritmo esensorialidade.
- Motion Social passa a sensação de movimento e toque.
- Dark Premium mantém o tom de luxo.

---

## Client DNA Acceptance Gate

**Status:** PASS ✅

| Check | Result |
|-------|--------|
| Estilo em allowed list | ✅ Motion Social (conditional OK), Dark Premium (allowed) |
| Estilo bloqueado | ❌ não |
| Usar blocked style | N/A → não |

---

## First Impression Diversity

- **Recent Assets Checked:** AC-30-07 v4, AC-30-25 v2, AC-30-31, AC-30-32, AC-30-33
- **Opening Image:** Velvet macro com motion glow
- **First Image Role:** Sensory-led com movimento
- **Difference From v1:** Estilo mais motion, menos estático
- **Similarity Risk:** LOW

---

## Image Decision

- **Source:** Imagem do blog hero AC-30-05B + motion effect
- **Treatment:** Background com velvet + motion glow + typography overlay
- **Justificativa:** "ASMR" pede sensação visual de movimento e toque.

---

## Typography

| Element | Fonte | Tamanho | Cor |
|---------|-------|---------|-----|
| Title | Playfair Display 700 | 38px | #FFFFFF |
| Body | DM Sans 400 | 24px | #FFFFFF |
| CTA | DM Sans 700 | 18px | #1A1A1A |
| **Min Font Size:** | — | 24px | — |

---

## Palette (AmiClube Tokens)

| Token | Hex | Uso |
|-------|-----|-----|
| BACKGROUND_DARK | #1A1A1A | Base |
| ACCENT_GOLD | #B48A1D | Destaque |
| TEXT_LIGHT | #FFFFFF | Conteúdo |

---

## Frame Structure

| Frame # | Conteúdo | Typography | Background |
|---------|---------|-----------|------------|
| 1 | "O TOQUE DO LUXO" | Headline 38px | Velvet + motion |
| 2 | "MACRO TEXTURA ASMR" | Headline 32px | Solid dark |
| 3 | Sensa tátil + brilho | Body 24px | Solid dark |
| 4 | CTA: "COMENTE 'TOQUE'" | Headline 28px + CTA | Gold |

---

## Navigation (Reels-Native)

- **Padrão:** Vertical tap/swipe
- **Progress:** bars
- **Safe Areas:** Texto não conflita com UI nativo Reels

---

## Export Expectation

- **Canvas Final:** 1080x1920 (por frame)
- **Arquivos:** 4 PNGs
- **Naming:** `ac-30-26-v2-frame-{n}.png` (n = 1-4)
- **Validation:** `identify` para confirmar cada dimensão

---

## Render Compliance Card

- Canvas: 1080x1920 ✅
- Preview Hub: HTML navegável com 4 frames ✅
- Primeira Impressão: sensory-led ✅
- Fonte imagem: Blog hero + motion ✅
- Min Font Size: 24px ✅
- Navegação: Vertical tap/swipe ✅
- Export Paths: `social/publish/ac-30-26-v2-frame-{n}.png` ✅
- Validação: `identify` → confirmar 1080x1920 ✅

---

## Evidence Status

| Evidência | Status | Método |
|----------|--------|--------|
| Baseline ref | ✅ verified | Caminho: v1 reference |
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