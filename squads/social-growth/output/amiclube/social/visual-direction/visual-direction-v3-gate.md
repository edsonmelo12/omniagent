# Visual Direction — AC-30-06 e AC-30-07 (v3 com Gate)

## Selected Style

- **AC-30-06:** Editorial Magazine com imagem de fundo
- **AC-30-07:** Motion Social com imagem de fundo

---

## AC-30-06 — Instagram Carrossel

### Visual Decision Card — AC-30-06

| Campo | Valor |
|-------|-------|
| Asset ID | AC-30-06 |
| Channel / Format | Instagram / Carrossel |
| Visual Skill | instagram-carousel |
| Final Canvas | 1080x1350px (6 slides) |
| Campaign-Hub Preview | max-width 420px, centralizado, sem corte |
| Selected Style | Editorial Magazine |
| Baseline / Reference | AC-30-17 (carrossel aprovado) — variações necessárias |
| Composition Logic | image-led |
| **Background Image Decision** | **background-image** ✅ |
| Background Image Source | `output/amiclube/blog/assets/AC-30-05-preco-valor-hero.jpg` |
| Image Treatment | Blur 8px, overlay preto 40% opacity, texto sobreposto |
| Typography | Montserrat Bold (títulos), Montserrat Regular (corpo) |
| Minimum Font Size | 34px no canvas final |
| Palette | #F5F0EB (fundo), #1A1A1A (texto), #C44D3C (mito), #2D6A4F (verdade) |
| CTA Treatment | Botão dourado (#C9A227) no slide final, "ENVIA 'CHECKLIST' NO DIRECT" |
| Navigation / Interaction | Setas ←→, dots indicadores, barra de progresso, suporte teclado |
| Export Expectation | 6 PNGs (1080x1350 cada) + HTML navegável |
| Validation Method | identify para dimensões, Playwright para navegação |

### Justificativa de Imagem

- Artigo-pai: AC-30-05 (Preço, valor e o que avaliar antes de comprar)
- Imagem disponível: `AC-30-05-preco-valor-hero.jpg` — foto de etiqueta de preço em close, alinhada ao tema "preço vs valor"
- Decisão: Usar como background com overlay para criar profundidade e reforçar o tema visualmente
- Tratamento: blur + overlay escuro para garantir legibilidade do texto branco/dourado

---

## AC-30-07 — Instagram Stories

### Visual Decision Card — AC-30-07

| Campo | Valor |
|-------|-------|
| Asset ID | AC-30-07 |
| Channel / Format | Instagram / Stories (4 frames) |
| Visual Skill | stories-sequence |
| Final Canvas | 1080x1920px (4 frames) |
| Campaign-Hub Preview | max-width 360px, centralizado, sem corte |
| Selected Style | Motion Social |
| Baseline / Reference | AC-30-20 (stories aprovado) — variações necessárias |
| Composition Logic | image-led |
| **Background Image Decision** | **background-image** ✅ |
| Background Image Source | `output/amiclube/blog/assets/AC-30-05-source-price-tag-pexels.jpg` |
| Image Treatment | Blur 12px, overlay gradiente roxo (#1A0A2E → #0D0D0D), texto sobreposto |
| Typography | Poppins Bold (títulos), Poppins Regular (corpo) |
| Minimum Font Size | 38px no canvas final |
| Palette | #0D0D0D (fundo), #FFFFFF (texto), #FF2D95 (accent), #F4D03F (CTA) |
| CTA Treatment | Botão amarelo (#F4D03F) no frame 4, "ENVIA 'CHECKLIST' NO DIRECT" |
| Navigation / Interaction | Progress dots (4), swipe vertical, suporte touch |
| Export Expectation | 4 PNGs (1080x1920 cada) + HTML navegável |
| Validation Method | identify para dimensões, Playwright para progress dots |

### Justificativa de Imagem

- Artigo-pai: AC-30-05 (Preço, valor e o que avaliar antes de comprar)
- Imagem disponível: `AC-30-05-source-price-tag-pexels.jpg` — foto de etiqueta de preço/tag, tema visual forte
- Decisão: Usar como background com gradiente roxo para criar contraste e urgency (tom provocativo do conteúdo)
- Tratamento: blur + gradiente para que o texto branco destaque e reforce o "barato sai caro"

---

## Matriz de Variação

| Asset | Estilo | Imagem | Baseline | Status |
|-------|--------|--------|----------|--------|
| AC-30-17 | Editorial Magazine | Sim (hero) | Anterior | Baseline |
| AC-30-18 | Editorial Magazine | Sim (hero) | Anterior | Baseline |
| AC-30-19 | Dark Premium | Sim (hero) | Anterior | Baseline |
| AC-30-20 | Dark Premium | Sim (hero) | Anterior | Baseline |
| **AC-30-06** | Editorial Magazine | **Sim (hero)** | AC-30-17 | ✅ NOVO v3 |
| **AC-30-07** | Motion Social | **Sim (tag)** | AC-30-20 | ✅ NOVO v3 |

---

## Evidência

- Imagens verificadas em `output/amiclube/blog/assets/`
- License: Pexels (free/public)
- Decision Gate aplicado: completos