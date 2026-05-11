# Visual Reality Check — AC-30-25 v3

**Data:** 2026-05-02
**Asset:** AC-30-25 v3 (Instagram Carousel)
**Frames:** 6

---

## Check 1: Image Load

| Frame | Imagem src | Arquivo existe | Status |
|-------|-----------|---------------|---------|
| 1 | `../../blog/assets/AC-30-05b-veludo-luxo-hero.jpg` | ✅ existe | PASS |
| 2 | N/A (gradient) | — | PASS |
| 3 | N/A (texture) | — | PASS |
| 4 | N/A (detail) | — | PASS |
| 5 | N/A (solid) | — | PASS |
| 6 | N/A (solid) | — | PASS |

**Veredicto Image Load:** ✅ PASS

---

## Check 2: Visual Match (VDC vs Render)

| promessa VDC | aparece no render | Status |
|-------------|-----------------|---------|
| Dark Premium | ✅ Fundo #1A1A1A presente | PASS |
| Minimalist Texture | ✅ Pattern SVG em Frame 3 | PASS |
| Gold accent | ✅ Gradient gold em Frame 2, CTA | PASS |
| Velvet hero | ✅ Imagem carrega no Frame 1 | PASS |

**Veredicto Visual Match:** ✅ PASS

---

## Check 3: Monotony

| Frame | Tipo visual | Tamanho bytes |
|-------|-----------|---------------|
| 1 | Hero image | 265KB |
| 2 | Gradient gold | 70KB |
| 3 | Texture pattern | 28KB |
| 4 | Detail glow | 26KB |
| 5 | Solid dark | 20KB |
| 6 | CTA solid | 21KB |

- Diferença: 265KB vs 20KB = 13x variação
- 6 frames, 6 visuals diferentes

**Veredicto Monotony:** ✅ PASS (variação > 50%)

---

## Check 4: Copy Integrity

| Frame | Texto | Verificação | Status |
|-------|------|--------------|-------|
| 1 | "ESTÉTICA DARK LUXO" | ✅ texto íntegro | PASS |
| 2 | "Por que veludo?" | ✅ texto íntegro | PASS |
| 3 | "Sensação tátil" | ✅ texto íntegro | PASS |
| 4 | "Brilho sutil" | ✅ texto íntegro | PASS |
| 5 | "Durabilidade" | ✅ texto íntegro | PASS |
| 6 | "enviamos uma amostra" | ✅ espaço correto | PASS |

**Veredicto Copy:** ✅ PASS

---

## Veredicto Final

**PASS_VISUAL_REALITY**

Todos os checks passaram:
- ✅ Image Load
- ✅ Visual Match
- ✅ Monotony
- ✅ Copy Integrity

---

## Evidência

- Frame 1: 265KB (imagem hero carregada)
- Frame 2: 70KB (gradient)
- Frame 3: 28KB (texture pattern)
- Frame 4: 26KB (detail glow)
- Frame 5: 20KB (solid)
- Frame 6: 21KB (CTA)

Variação visual garantida.