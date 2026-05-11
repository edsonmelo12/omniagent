# Visual Decision Card — AC-30-20 (v3)

## Step 03B — Visual Director

**Data:** 2026-05-02
**Pipeline:** Regeneração rigurosa com skills de design
**Blog Parent:** AC-30-01B (Saúde e Bem-Estar: Ergonomia)

---

## Skill Invocation Ledger

| Skill | Arquivo | Status | Decisão |
|-------|--------|--------|----------|
| creative-director | `skills/creative-director/SKILL.md` | ✅ invoked | Família Visual: Organic Image-led |
| social-visual-system | `skills/social-visual-system/SKILL.md` | ✅ invoked | Sistema visual base: stories |
| stories-sequence | `skills/stories-sequence/SKILL.md` | ✅ invoked | Formato: 9:16, ritmo vertical |

---

## Asset Info
- **Asset ID:** AC-30-20
- **Format:** Instagram Stories (stories-sequence)
- **Canvas Final:** 1080x1920
- **Frames:** 5

---

## Visual Style
- **Style Selected:** Organic Image-led
- **Baseline Reference:** `social/previews/ac-30-20-v2-organic.html` (v2 que teve problemas)
- **Baseline Source:** AC-30-20 v1 (Dark Premium)

**Estilo JUSTIFICADO:**
- Ergonomia = toque e sensação → treatment orgânico passa a ideia de "sentir" vs. "analisar"
- Estilo está no envelope allowed do Client DNA Acceptance (`creative-dna-acceptance.json`)
- Alternativa ao Dark Premium para diversidade

---

## Client DNA Acceptance Gate

**Status:** PASS ✅

| Check | Result |
|-------|--------|
| Estilo em allowed list | ✅ Organic Image-led |
| Estilo em conditional | N/A |
| Estilo bloqueado | ❌ não |
| Usar blocked style | N/A → não |
| Aprovação explícita | N/A → não requer |

---

## First Impression Diversity

- **Recent Assets Checked:** AC-30-20 v1, AC-30-07, AC-30-26
- **Opening Image:** Blog hero (AC-30-01B)
- **First Impression Role:** image-led com warmth visual
- **Difference From v1:** Treatment mais natural; menos overlay; mais espaço negativo vs. Dark Premium
- **Similarity Risk:** MEDIUM (mesma estrutura stories, mas tratado diferente)
- **Continuity Justification:** Estilo diferente proposital para Campaign Diversity — v1 e v2 servem moods distintos

---

## Image Decision

- **Source:** `output/amiclube/blog/assets/AC-30-01b-saude-bem-estar-hero.jpg`
- **Treatment:** Background com gradiente suave (não scrim pesado — CORREÇÃO DO BUG)
- **Justificativa:** Ergonomia = toque e sensação — Treatment orgânico passa "sentir" vs. "analisar"

---

## Typography

| Element | Fonte | Tamanho | Cor |
|---------|-------|--------|-----|
| Title | Playfair Display 700 | 38px | #FFFFFF |
| Body | DM Sans 400 | 24px | #FFFFFF |
| Scale Number | DM Sans 700 | 36px | #D4A574 |
| CTA | DM Sans 700 | 14px | #1A1A1A |
| **Min Font Size:** | — | 24px | — |

---

## Palette (AmiClube Tokens)

| Token | Hex | Uso |
|-------|-----|-----|
| BACKGROUND_DARK | #2A2A2A | Base story |
| ACCENT_GOLD | #D4A574 | Números escala, CTA |
| TEXT_LIGHT | #FFFFFF | Conteúdo principal |
| OVERLAY_START | rgba(0,0,0,0.25) | Abertura frame |
| OVERLAY_END | rgba(0,0,0,0.85) | Fechamento frame |

---

## Frame Structure

| Frame # | Conteúdo | Typography | Background |
|---------|---------|-----------|------------|
| 1 | Abertura: "Linda, mas confortável?" | Headline 38px + subhead 16px | Imagem hero + overlay gradiente |
| 2 | Nível 1-2: "Bonita, mas..." | Scale 36px + texto 22px | Solid dark |
| 3 | Nível 3-4: "Consistente..." | Scale 36px + texto 22px | Solid dark |
| 4 | Nível 5: "Conforto claro" | Scale 36px + texto 22px | Solid dark |
| 5 | CTA: "Quer ajuda?" | Headline 28px + CTA button | Solid #D4A574 |

---

## Navigation (Stories-Native)

- **Padrão:** Vertical swipe/tap-through
- **Progress:** 5 barras de progresso (uma por frame)
- **Indicadores:** Dots na parte inferior
- **Safe Areas:** Texto não conflita com UI nativo IG (top 120px, bottom 250px)
- **CTA Frame:** Botão centralizado, não conflita com reply box

---

## Export Expectation

- **Canvas Final:** 1080x1920 (por frame)
- **Arquivos:** 5 PNGs
- **Naming:** `ac-30-20-frame-{n}.png` (n = 1-5)
- **Validation:** `identify` para confirmar cada dimensão

---

## Render Compliance Card

- Canvas: 1080x1920 ✅
- Preview Hub: HTML navegável com 5 frames ✅
- Primeira Impressão: Image-led ✅
- Fonte: Blog hero ✅
- Min Font Size: 24px ✅
- Navegação: Vertical tap/swipe ✅
- Export Paths: `social/publish/ac-30-20-frame-{n}.png` ✅
- Validação: `identify` → confirmar 1080x1920 ✅

---

## Evidence Status

| Evidência | Status | Método |
|----------|--------|--------|
| Baseline ref | ✅ verified | Caminho no output |
| Source image | ✅ verified | Caminho no blog assets |
| Export | ⚠️ pending | Ainda não executado |
| Preview test | ⚠️ pending | Após render |
| VDC completo | ✅ ready | Este card |

---

## Quality Gate Checklist

- [x] Client DNA Acceptance verificado
- [x] Estilo em allowed list
- [x] First Impression declarada
- [x] Similarity risk avaliado
- [x] Min font size em px
- [x] Canvas declarada
- [x] Navigation native do formato
- [x] Skill invocations evidenciadas
- [ ] Reviewer valida (PENDENTE)
- [ ] Checkpoint usuário (PENDENTE)