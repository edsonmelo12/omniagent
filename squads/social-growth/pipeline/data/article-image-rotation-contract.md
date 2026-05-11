# Article Image Rotation Contract — Template

**Uso:** Preencher antes de renderizar qualquer pacote social derivado de artigo.

---

## Exemplo: Artigo AC-30-05B (Veludo = Novo Luxo)

```md
## Article Image Rotation Contract — AC-30-05B

**Artigo:** AC-30-05B — Veludo = Novo Luxo
**Data:** 2026-05-02
**Catálogo de Imagens Available:**
- `blog/assets/AC-30-05b-veludo-luxo-hero.jpg` (imagem principal)
- `blog/assets/AC-30-05b-veludo-texture.jpg` (textura close-up)
- `blog/assets/AC-30-05b-veludo proof.jpg` (detalhe de cost)

---

| Asset | Format | Source Image | Crop | Treatment | First Impression Role | Reuse Risk | Notes |
|-------|--------|------------|------|-----------|-------------------|-----------|-------|
| AC-30-25 | Carousel 6p | hero | macro (canto sup Dir) | dark overlay + gold | texture | low | Abertura visual com textura |
| AC-30-26 | Reels 4p | hero | close (centro) | motion blur | sensory | Medium — mismo hero, tratamento diff |
| AC-30-27 | Facebook | texture | full | solid | proof | low | Imagem alternativa |

---

### Variação de Fatores por Asset

- **AC-30-25:** crop (macro vs full) + tratamento (dark overlay vs solid) + função (texture vs proof)
- **AC-30-26:** crop (close vs full) + tratamento (blur vs solid) + função (sensory vs proof)
- **AC-30-27:** source (texture vs hero) + função (proof)

---

### Verificação de Repetição

- 2+ posts com mesmo source + mesmo crop + mesmo tratamento = **BLOCKED_IMAGE_REPETITION**
- 3+ posts usam mesmo hero sem variação = **BLOCKED_HERO_REPETITION**

**Status:** ✅ PASS — Cada post varia 3+ fatores

---

## Template Vazio

```md
## Article Image Rotation Contract — [Artigo ID]

**Artigo:** [ID] — [Título]
**Data:** [YYYY-MM-DD]
**Catálogo de Imagens Available:**
- [imagem 1 path]
- [imagem 2 path]
- [imagem N path]

---

| Asset | Format | Source Image | Crop | Treatment | First Impression Role | Reuse Risk | Notes |
|-------|--------|------------|------|-----------|-------------------|-----------|-------|
| | | | | | | | |

---

### Variação de Fatores por Asset

- **Asset A:** 
- **Asset B:** 
- **Asset C:** 

---

### Verificação de Repetição

- 2+ posts com mesmo source + mesmo crop + mesmo tratamento = **BLOCKED_IMAGE_REPETITION**
- 3+ posts usam mesmo hero sem variação = **BLOCKED_HERO_REPETITION**

**Status:** ✅ PASS / ❌ BLOCKED

---
```

---

## Checklist de Verificação

- [ ] Catálogo de imagens do artigo identificado
- [ ] Cada asset declara Source Image, Crop, Treatment, First Impression Role
- [ ] Cada asset varia pelo menos 2 fatores vs outros
- [ ] 2+ posts com mesma config = BLOCKED_IMAGE_REPETITION
- [ ] 3+ posts com mesmo hero sem variação = BLOCKED_HERO_REPETITION
- [ ] VDC inclui Image Rotation Contract
- [ ] Render corresponde ao contrato

---

## Blockers

| Blocker | Condição | Ação |
|---------|---------|------|
| BLOCKED_IMAGE_REPETITION | 2+ posts com mesma imagem + mesmo crop + mesmo tratamento | Variar pelo menos 2 fatores |
| BLOCKED_HERO_REPETITION | 3+ posts usam mesma hero sem variação documentada | Usar imagem alternativa ou variar crop/tratamento |
| BLOCKED_MISSING_IMAGE_CONTRACT | VDC não declara Source/Crop/Treatment/Reuse Risk | Preencher contrato antes de renderizar |

---

## Reference

- Skill: `skills/visual-reality-check/SKILL.md` — Check 6
- Strategy: `squads/social-growth/_memory/image-generation-strategy.md`
- First Impression: `skills/creative-director/SKILL.md` — First Impression Diversity