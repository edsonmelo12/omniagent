# Estratégia de Geração de Imagens - Otimização de Créditos DALL-E

**Data:** 2026-05-02  
**Status:** Planejamento (não implementado)  
**Contexto:** AmiClube + Portal de Mídias

---

## Problema Identificado

- Meta: 8 artigos blog/mês + 24 posts sociais/mês (3 por artigo)
- Necessidade atual: ~32-40 imagens DALL-E/mês
- Custo: 115 créditos/mês (conta Plus) → risco de ultrapassar allocation

---

## Premissa

| Canal | Volume/mês | Imagem DALL-E |
|-------|------------|---------------|
| Blog | 8 artigos | 8 imagens hero |
| Social | 24 posts | reuse + variações |
| **Total** | 32 ativos | **~12-15 otimizado** |

---

## Estratégia Proposta: Primeira Impressão

### Princípio
- **Slide 1 do carrossel** = imagem DALL-E (hero visual)
- **Slides 2-7** = tipografia editorial + cores extraídas
- **Reels/Stories** = capa DALL-E + text overlays

### Estrutura por Artigo

```
Artigo: "X sinais de Y"
├─ Blog Hero (DALL-E): ilustração editorial style
│
├─ Social 1 (Carrossel 7 slides):
│   ├─ Slide 1: Blog Hero (imagem DALL-E) ← FIRST IMPRESSION
│   └─ Slides 2-7: Tipografia + paleta de cores
│
├─ Social 2 (Reels):
│   └─ Capa: Blog Hero (mesma imagem)
│
└─ Social 3 (Facebook/Post):
    └─ Imagem: Blog Hero ou variação
```

### Economia por Formato

| Formato | Slides/Frames | Imagens DALL-E | Economia |
|---------|---------------|----------------|----------|
| Instagram Carrossel | 7 slides | 1 imagem | -85% |
| Instagram Reels | 4 frames | 1 imagem | -75% |
| Instagram Stories | 5 frames | 1 imagem | -80% |
| Facebook Post | 1 post | 1 imagem | 0% |

---

## Cenários de Implementação

### Cenário A: Misto (Pexels Blog + DALL-E Social)
- Blog: imagens Pexels (já licenciadas)
- Social: 1 DALL-E por artigo (slide 1 carrossel)
- Custo: ~8-12 imagens/mês

### Cenário B: DALL-E Puro
- Blog + Social: imagens DALL-E
- Custo: ~12-15 imagens/mês

### Cenário C: Priorizado por Prioridade
- Artigos P1: 1 DALL-E exclusiva
- Artigos P2/P3: reuse de P1 ou Pexels
- Custo: ~6-10 imagens/mês

---

## Comparativo de Custo

| Cenário | Imagens/mês | Créditos | Posts/mês | Sobra |
|---------|-------------|----------|-----------|-------|
| Atual (sem otimização) | ~32-40 | 115 | ~24 | ~75 |
| Otimizado (A) | ~10-12 | 115 | ~24 | ~103 |
| Otimizado (B) | ~12-15 | 115 | ~24 | ~100 |
| Otimizado (C) | ~6-10 | 115 | ~24 | ~105 |

---

## Regra de Primeira Impressão (Visual First Impression Gate)

### Obrigatório para Todo Asset Social
- [ ] Slide 1 / Frame 1 deve ter imagem DALL-E ou Blog Hero
- [ ] Slides/frames seguintes usam tipografia + paleta extraída
- [ ] Evita reuse de imagem em sequência (variação de crop/cor)

### Critério de Veto
- Carrossel com slide 1 tipográfico = **BLOQUEAR**
- Reels sem capa de imagem = **BLOQUEAR**
- Primeiro slide igual ao último post social recente = **BLOQUEAR** (First Impression Diversity)

---

## Article Image Rotation Contract (Nova Regra)

### Problema Original
Posts derivados do mesmo artigo estavam reutilizando a mesma Blog Hero em todos os formatos (Carrossel, Reels, Facebook), causando repetição visual no feed.

### Regra Nova
A mesma imagem do artigo pode ser reutilizada, mas **cada post precisa ter primeira impressão distinta**.

Para cada pacote social derivado de artigo, declarar:

```md
## Article Image Rotation Contract — [Artigo ID]

| Asset | Source Image | Crop | Treatment | First Impression Role | Risco |
|-------|------------|------|-----------|-------------------|-------|
| Carrossel | hero | macro | dark overlay | texture | low |
| Reels | hero | close | motion blur | sensory | medium |
| Facebook | hero | full | editorial | proof | low |
```

### Definições
- **Source Image**: `hero`, `alternativa`, `texture`, `proof` — qual imagem do catálogo do artigo foi usada
- **Crop**: `full`, `macro`, `close`, `canto`, `detalhe` — região da imagem
- **Treatment**: `dark overlay`, `blur`, `gradient`, `texture pattern`, `solid` — estilo aplicado
- **First Impression Role**: `hero`, `texture`, `proof`, `backstage`, `context`, `comparison`, `CTA` — função visual no feed
- **Risco**: `low`, `medium`, `high` — risco de parecer repetido vs outros posts

### Regras de Rotação
Cada post derivado do mesmo artigo deve variar pelo menos **2 fatores**:
- crop
- escala/zoom
- ponto focal
- overlay
- cor dominante
- blur
- textura
- composição
- posição do texto
- função visual (papel)

### Critério de Veto Atualizado
- Carrossel com slide 1 tipográfico = **BLOQUEAR**
- Reels sem capa de imagem = **BLOQUEAR**
- **2+ posts com mesma imagem + mesmo crop + mesmo tratamento = BLOCKED_IMAGE_REPETITION**
- **3+ posts usam mesma hero sem variação documentada = BLOCKED_HERO_REPETITION**
- **VDC não declara Image Rotation Contract = BLOCKED_MISSING_IMAGE_CONTRACT**

### Exemplos de Uso

#### Exemplo válido: mesma imagem, 3 fatores variação
| Asset | Imagem | Crop | Tratamento | Primeira Impressão |
|-------|-------|------|----------|------------------|
| Carrossel | hero A | macro | dark overlay | texture |
| Reels | hero A | close | blur | sensory |
| Facebook | hero A | full | solid | proof |

#### Exemplo válido: imagens alternativas
| Asset | Imagem | Crop | Tratamento | Primeira Impressão |
|-------|-------|------|----------|------------------|
| Carrossel | hero | macro | dark | texture |
| Reels | textura | full | gradient | context |
| Facebook | proof | close | solid | proof |

#### Exemplo inválido: repetição sem variação
| Asset | Imagem | Crop | Tratamento | Primeira Impressão |
|-------|-------|------|----------|------------------|
| Carrossel | hero | full | dark | hero |
| Reels | hero | full | dark | hero |
| Facebook | hero | full | dark | hero |

**Bloqueado**: 3 posts com mesma imagem, mesmo crop, mesmo tratamento = `BLOCKED_HERO_REPETITION`

---

## Próximos Passos (Implementado)

1. ✅ Article Image Rotation Contract adicionado à `visual-reality-check/SKILL.md`
2. ✅ image-generation-strategy.md atualizado com matriz de rotação
3. ✅ Blockers implementados: BLOCKED_IMAGE_REPETITION, BLOCKED_HERO_REPETITION, BLOCKED_MISSING_IMAGE_CONTRACT
4. Próximo passo: testar com 3 assets derivados do mesmo artigo

---

## Notas de Reunião

- Edson perguntou sobre custo de DALL-E com conta Plus
-的解释: 115 créditos/mês, ~80-115 imagens (DALL-E 3)
- Discussão: otimização por slide 1 vs geração plena
- Decisão: registrar para amadurecimento, não implementar agora

---

**Documento de planejamento — masih em análise**