# Skill: Visual Reality Check

**Versão:** 1.0
**Data:** 2026-05-02
** pipeline gate:** Obrigatório após Creative Renderer e antes de Reviewer/Pipeline Auditor approve

---

## Definição

Visual Reality Check é o gate de qualidade visual obrigatória que verifica se o asset renderizado corresponde à intenção visual declarada na VDC (Visual Decision Card), se as imagens carregam corretamente, se há variação visual suficiente entre frames e se o copy final está íntegro.

Nenhum asset pode ser aprovado apenas por conformidade de arquivo, checklist textual ou existência de PNGs. A aprovação exige verificação visual real do resultado renderizado.

---

## Propósito

1. Garantir que a promessa visual da VDC aparece no render final.
2. Impedir que imagens quebrem por caminho errado.
3. Impedir que assets fiquem monótonos (todos os frames com o mesmo fundo).
4. Impedir erros de copy visíveis na arte final (typos, palavras coladas, caracteres trocados).
5. Garantir que o Reviewer e o Pipeline Auditor veem screenshots, não apenas código.

---

## Quando Usar

Sempre que um asset visual for regenerado ou criado:

- Quando **Creative Renderer** termina o HTML e exporta PNGs
- Antes de **Reviewer** dar veredicto APPROVE
- Antes de **Pipeline Auditor** dar veredicto PASS

O Visual Reality Check deve ser executado antes de qualquer APPROVE ou PASS.

---

## Checks Obrigatórios

### 1. Image Load Check

- Toda imagem referenciada no HTML (`src="..."`) precisa existir no filesystem.
- O preview precisa carregar sem imagem quebrada (ícone de link quebrado).
- Se imagem de hero/source for declarada na VDC, ela precisa aparecer no frame 1 ou no PN exportado.
- Evidência: screenshot do frame com imagem carregada verificável.

### 2. Visual Match Check

- O render precisa corresponder à VDC.
- Se a VDC promete estilos como "macro texture", "motion glow", "blur", "sensory-led", "gradient accent", "texture pattern", o HTML/PNG precisa mostrar isso visualmente.
- Não basta mencionar no markdown da VDC.
- Evidência: comparação entre promessa VDC e screenshot real.

### 3. Monotony Check

- Multi-frame assets (carousel, reels, stories) não podem usar o mesmo fundo visual em todos os frames, salvo decisão explícita justificada na VDC.
- Para assets com 4+ frames, pelo menos 50% precisam ter variação visual: imagem, crop, textura, gradiente, cor, detalhe de luz, padrão SVG, composição.
- Verificação por: comparação de tamanho de arquivo entre frames (variação indica variação visual) + verificação visual.
- Evidência: screenshot de cada frame mostrando diferença.

### 4. Copy Integrity Check

- Proibir typos visíveis em arte final.
- Exemplos bloqueadores:
  - Caracteres trocados: `SENS@ÇÃO` (em vez de `SENSAÇÃO`)
  - Palavras coladas: `enviamosuma` (em vez de `enviamos uma`)
  - Erro de acento em pt-BR
  - Texto quebrado por encoding
  - Idioma misturado (pt-BR comEN)
- Evidência: screenshot放大 de cada frame com texto legível.

### 5. Screenshot-Based Review

- Reviewer precisa olhar screenshots/PNGs exportados, não só HTML ou código.
- Evidência registrada: "visual inspection passed" ou "BLOCKED" com screenshot evidência.

### 6. Article Image Rotation Contract

Para assets derivados do mesmo artigo, verificar se a primeira impressão é distinta:

- Declare qual imagem do artigo foi usada: `hero`, `alternativa`, `texture`, `proof`
- Declare o crop: `full`, `macro`, `close`, `canto`
- Declare o tratamento: `dark overlay`, `blur`, `gradient`, `texture pattern`, `solid`
- Declare o papel visual: `hero`, `texture`, `proof`, `backstage`, `context`, `comparison`, `CTA`, `typography-led`
- Calcule o risco de repetição: `low`, `medium`, `high`

Regras de bloqueio:

- **2+ posts adjacentes com mesma imagem + mesmo crop + mesmo tratamento = BLOCKED_IMAGE_REPETITION**
- **3+ posts derivados do mesmo artigo usando a mesma hero sem variação documentada = BLOCKED_HERO_REPETITION**
- **VDC não declara Source Image, Crop/Focal Point, Treatment ou Reuse Risk = BLOCKED_MISSING_IMAGE_CONTRACT**

A mesma imagem pode ser reutilizada, mas cada asset precisa variar pelo menos **2 fatores**:
- crop
- escala/zoom
- ponto focal
- overlay
- cor dominante
- blur
- textura
- composição
- posição do texto
- função visual

Exemplo de contratos válidos:

| Asset | Imagem Usada | Crop | Tratamento | Primeira Impressão | Risco |
|-------|------------|------|-----------|-------------------|-------|
| AC-30-25 | hero veludo | macro | dark overlay | texture | low |
| AC-30-26 | hero veludo | close | motion blur | sensory | medium |
| AC-30-27 | hero veludo | full | editorial clean | context | low |

| Asset | Imagem Usada | Crop | Tratamento | Primeira Impressão | Risco |
|-------|------------|------|-----------|-------------------|-------|
| Post A | imagem A | macro | dark | hero | low |
| Post B | imagem A | close | blur | texture | low (variação 3 fatores) |
| Post C | imagem B | full | solid | proof | low |

Evidência: screenshot de cada frame comparando primeiro impressão.

---

### 7. Article Link Distribution Contract

Para assets `blog_derivative`, verificar se o link do artigo está configurado:

- Declarar `blog_parent_id` (artigo-pai)
- Declarar `article_url` (URL completa)
- Declarar `link_strategy` por plataforma
- Declarar `visual_cta` (quando aplicável)
- Declarar `caption_cta` (quando aplicável)

Regras de bloqueio por plataforma:

| Plataforma | Obrigatório | Estratégia Correta |
|------------|------------|-------------------|
| Instagram Carrossel | link_strategy + visual_ctA + caption_ctA | `link_in_bio` + "Link na bio" |
| Instagram Reels | link_strategy + visual_ctA + caption_ctA | `link_in_bio` + "Link na bio" |
| Instagram Stories | link_strategy + visual_ctA | `link_sticker` ou `link_in_bio` |
| Facebook Post | article_url + link_strategy | `direct_url` ou `first_comment` |
| LinkedIn Post | article_url + link_strategy | `direct_url` |
| Pinterest | article_url + link_strategy | `direct_url` |

Blockers:

- **BLOCKED_MISSING_ARTICLE_URL** — blog_derivative sem article_url
- **BLOCKED_WRONG_LINK_STRATEGY** — estratégia não corresponde à plataforma
- **BLOCKED_INSTAGRAM_NO_BIO_CTA** — Instagram sem CTA "link na bio" no frame final
- **BLOCKED_FACEBOOK_NO_URL** — Facebook sem URL direta

Exemplo válido:

```md
## Article Link Distribution — AC-30-25

| Campo | Valor |
|-------|-------|
| blog_parent_id | AC-30-05B |
| article_url | https://amiclube.com.br/veludo-luxo |
| link_strategy | link_in_bio |
| visual_cta | "Link na bio" (slide 6) |
| caption_cta | "Leia o artigo completo no link da bio." |

✅ PASS
```

Exemplo inválido:

```md
## Article Link Distribution — AC-30-26

| Campo | Valor |
|-------|-------|
| blog_parent_id | AC-30-05B |
| article_url | ❌ NÃO DECLARADA |
| link_strategy | ❌ NÃO DECLARADO |
| visual_cta | N/A |
| caption_cta | N/A |

❌ BLOCKED_MISSING_ARTICLE_URL
```

Evidência: Publishing manifest + screenshot do frame com visual CTA + caption draft.

---

## Status de Bloqueio

Se qualquer checks falhar:

- `BLOCKED_IMAGE_LOAD` — imagem não carrega, caminho errado
- `BLOCKED_VISUAL_MISMATCH` — VDC não corresponde ao render
- `BLOCKED_MONOTONY` — todos os frames parecem iguais
- `BLOCKED_COPY_ERROR` — erro de copy visível na arte final
- `BLOCKED_IMAGE_REPETITION` — 2+ posts com mesma imagem + mesmo crop + mesmo tratamento sem justificativa
- `BLOCKED_HERO_REPETITION` — 3+ posts usam mesma hero sem variação documentada
- `BLOCKED_MISSING_IMAGE_CONTRACT` — VDC não declara Source Image, Crop, Treatment ou Reuse Risk
- **BLOCKED_MISSING_ARTICLE_URL** — blog_derivative sem article_url declarada
- **BLOCKED_WRONG_LINK_STRATEGY** — estratégia não corresponde à plataforma
- **BLOCKED_INSTAGRAM_NO_BIO_CTA** — Instagram sem CTA "link na bio" no frame final
- **BLOCKED_FACEBOOK_NO_URL** — Facebook sem URL direta

Quando bloqueado, o asset **não pode**:
- Receber veredicto APPROVE do Reviewer
- Receber veredicto PASS do Pipeline Auditor
- Ir para o hub como aprovado
- Ser agendado para publicação

---

## Fluxo

```
Creative Renderer (03C)
        ↓
Visual Reality Check (03D) ← NOVO GATE
        ↓
    [CHECKS]
       ↓
   PASS / BLOCKED
        ↓
Reviewer (04)
        ↓
Pipeline Auditor (04B)
```

---

## Evidência

O Visual Reality Check deve produzir um relatório com:

- Frame verificado (número)
- Check executado
- Resultado (PASS/FAIL)
- evidência (screenshot ou caminho)
- Status final: `PASS_VISUAL_REALITY` ou `BLOCKED_...`

---

## Exemplo de Relatório

```
# Visual Reality Check — AC-30-25 v3

## Frame 1
- [PASS] Image Load Check: Imagem carregada, caminho correto
- [PASS] Visual Match Check: Hero image visível
- [PASS] Monotony Check: Frame 1 tem imagem (265KB vs 20KB médio)

## Frame 2
- [PASS] Image Load Check: N/A (sem imagem)
- [PASS] Visual Match Check: Gradient gold aparece
- [PASS] Monotony Check: Fundo diferente de Frame 1

## Frame 3
- [PASS] Image Load Check: N/A (sem imagem)
- [PASS] Visual Match Check: Texture pattern SVG visível
- [PASS] Monotony Check: Padrão diferente de Frames 1-2

## Copy Check
- [PASS] Frame 1: texto íntegro
- [PASS] Frame 6: "enviamos uma" correto

## Veredito: ✅ PASS_VISUAL_REALITY
```

---

## Responsabilidade

Skill `visual-reality-check` invoked por: qualquer regeneração ou criação de asset visual.

---

## SKILL.md