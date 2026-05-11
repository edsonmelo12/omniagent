# Article Image Rotation Contract — Test Report

**Artigo:** AC-30-05B (Veludo = Novo Luxo)
**Data:** 2026-05-02
**Status:** ✅ PASS

---

## Catálogo de Imagens Available

| Imagem | Caminho | Uso |
|--------|-------|-----|
| Hero | `blog/assets/AC-30-05b-veludo-luxo-hero.jpg` | Imagem principal do artigo |
| Texture (não disponível) | — | Não há textura alternativa |

---

## Assets Derivados do Artigo

| Asset | Source Image | Crop | Treatment | First Impression Role | Fatores de Variação |
|-------|------------|------|-----------|-------------------|---------------------|
| AC-30-25 v3 | hero | macro (canto sup) | dark overlay + gold | texture | 3 fatores |
| AC-30-26 v3 | hero | close (centro) | motion blur | sensory | 3 fatores |

---

## Verificação de Repetição

### Teste 1: Mesma Imagem?
- AC-30-25 usa `hero`: ✅ SIM
- AC-30-26 usa `hero`: ✅ SIM
- **Resultado:** Mesma imagem — MAS...

### Teste 2: Mesmo Crop?
- AC-30-25: macro ≠ AC-30-26: close
- **Resultado:** Crops diferentes — ✅ PASS

### Teste 3: Mesmo Tratamento?
- AC-30-25: dark overlay + gold ≠ AC-30-26: motion blur
- **Resultado:** Tratamentos diferentes — ✅ PASS

### Teste 4: Primeira Impressão Distinta?
- AC-30-25: texture + macro + gold → textura visual
- AC-30-26: sensory + close + blur → movimento visual
- **Resultado:** Funções visuais diferentes — ✅ PASS

---

## Conclusão

| Check | Status |
|-------|--------|
| BLOCKED_IMAGE_REPETITION (2+ mesmo source+crop+treatment) | ✅ NÃO BLOQUEADO — crops diferentes |
| BLOCKED_HERO_REPETITION (3+ mesmo hero) | ✅ NÃO BLOQUEADO — apenas 2 assets, variação OK |
| BLOCKED_MISSING_IMAGE_CONTRACT | ✅ NÃO BLOQUEADO — contratos declarados nos VDCs |

---

## Lessons Learned

1. **Mesma imagem é permitida**, desde que cada asset varie pelo menos 2 fatores
2. **Crop** = way mais fácil de variar
3. **Tratamento** (dark overlay, blur, gradient) = segundo way mais fácil
4. **Primeira impressão Role** (texture, sensory, proof) = terceiro way

### Combinações Válidas

| Asset | Imagem | Crop | Treatment | Função |
|-------|-------|------|-----------|-------|
| A | hero | macro | dark | texture |
| B | hero | close | blur | sensory |
| C | hero | full | solid | proof |

### Combinações Inválidas

| Asset | Imagem | Crop | Treatment | Função |
|-------|-------|------|-----------|-------|
| A | hero | full | dark | hero |
| B | hero | full | dark | hero |
| C | hero | full | dark | hero |

**Razão:** Mesma imagem + mesmo crop + mesmo tratamento = 3x repetição

---

**Veredicto Final:** ✅ PASS — Article Image Rotation Contract seguido corretamente