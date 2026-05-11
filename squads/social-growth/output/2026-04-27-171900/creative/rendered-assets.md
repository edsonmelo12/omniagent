# Rendered Assets

## Manifest
| Asset ID | Title | Style | Visual Skill | Format | Background Texture | Output Path | Status |
|---|---|---|---|---|---|---|---|
| AC-30-06 | Mitos e verdades sobre preço de amigurumi | Editorial Magazine | instagram-carousel | Navigable carousel 420x525 (7 slides) | Alternating colors + blog catalog images (x2) | previews/AC-30-06.html | ready |
| AC-30-07 | Quando o barato sai caro no artesanal | Editorial + Blur | instagram-carousel | Navigable carousel 420x525 (4 slides) | Blur image bg + alternating dark/light/CTA | previews/AC-30-07.html | ready |
| AC-30-08 | O barato que parece economia | Dark Premium | social-single-post | HTML preview 420x525 | Low-light radial + noise mask 4% | previews/AC-30-08.html | ready |
| AC-30-21 | A CONTA FECHA? 5 critérios | Editorial Magazine | instagram-carousel | Navigable carousel 420x525 (8 slides) | Alternating solid colors (x4) + blog catalog images (x2) | previews/AC-30-21.html | ready |
| AC-30-22 | 3 perguntas antes da compra | Authentic Rough | social-single-post | HTML preview 420x525 | Paper grain + noise mask 8% | previews/AC-30-22.html | ready |

## Spacing System
- **Grid base**: 8px. All padding, gap and margin use multiples of 8 (8, 16, 24, 32, 40, 48, 56, 64).
- **Content padding**: 32px horizontal, 56px bottom (clears progress bar)
- **Line-height**: unitless values throughout (1.15, 1.5, 1.65)
- **Alignment**: content slides use `justify-content: flex-end` (bottom); cover/CTA use `center`

## Rendering Notes
- AC-30-21: Carrossel navegável com track horizontal (translateX), progress bar em todo slide com fill proporcional, swipe arrow na borda direita (exceto slide 8), suporte a drag/touch swipe, dots indicators, e frame IG completo (header + ações + caption). Alinhamento vertical consistente com `justify-content: space-between` (header no topo, conteúdo ao centro). Paleta de 4 cores contrastantes: off-white #F5F0EA, terracota suave #E8D5C4, verde sálvia #D4DDD0, terracota #C85A48 (CTA). **Imagens do catálogo do blog**: Slide 1 usa AC-30-05-preco-valor-hero.jpg (Pexels, pessoa segurando etiqueta) com overlay gradiente escuro; Slide 4 usa AC-30-01-escolher-com-criterio-hero.jpg (Pexels, amigurumi close) com overlay claro. Ambas do catálogo `output/amiclube/blog/assets/`, licença Pexels free. Playfair Display para títulos, DM Sans para corpo.
- AC-30-22: Estética lo-fi com fonte Courier Prime (máquina de escrever). Background off-white queimado #f5f0ea com ruído 8%. Sticky tag vermelha #b91c1c. Checklist com "vistos" manuais. CTA com borda tracejada.
- AC-30-06: Carrossel Mito vs Realidade com 7 slides. Split visual mito (vermelho #b91c1c) / verdade (verde #15803d) em caixas lado a lado. Paleta de 4 cores: off-white #F5F0EA, terracota suave #E8D5C4, verde sálvia #D4DDD0, terracota #C85A48 (CTA). Imagens do catálogo: slide 1 (AC-30-05b-veludo-luxo-hero.jpg), slide 4 (AC-30-05-preco-valor-hero.jpg). Alinhamento space-between, grid 8px. Progress bar com fill proporcional.
- AC-30-07: Carrossel navegável 4 slides (corrigido: era social-single-post com frames empilhados). Estrutura: objeção → quebra → critério → ação. Frame 1 com imagem blur (AC-30-05-preco-valor-hero.jpg, Pexels, filtro blur 2px + overlay escuro 55%), frame 2 fundo preto sólido (tom alerta), frame 3 off-white #F5F0EA (checklist), frame 4 terracota #C85A48 (CTA). Alinhamento space-between, grid 8px. Progress bar com fill proporcional. Visual skill corrigida de social-single-post para instagram-carousel.
- AC-30-08: Dark Premium com gradiente radial + noise mask 4%. Playfair Display título, DM Sans corpo. CTA com borda dourada #D4AF37.

## Image Sources (Blog Catalog)
| Asset | Slide | File | Source | URL | License |
|---|---|---|---|---|---|
| AC-30-21 | 1 (Cover) | AC-30-05-preco-valor-hero.jpg | Pexels | https://www.pexels.com/photo/a-person-holding-a-price-tag-8715774/ | Pexels License (free, no attribution) |
| AC-30-21 | 4 (Qualidade) | AC-30-01-escolher-com-criterio-hero.jpg | Pexels | https://www.pexels.com/photo/handcrafted-amigurumi-angel-dolls-in-soft-focus-37111419/ | Pexels License (free, no attribution) |
| AC-30-06 | 1 (Cover) | AC-30-05b-veludo-luxo-hero.jpg | Pexels | https://www.pexels.com/photo/8465936/ | Pexels License (free, no attribution) |
| AC-30-06 | 4 (Mito 3) | AC-30-05-preco-valor-hero.jpg | Pexels | https://www.pexels.com/photo/a-person-holding-a-price-tag-8715774/ | Pexels License (free, no attribution) |

**Rule applied**: Before sourcing new images, the blog's image catalog at `output/amiclube/blog/assets/` was checked. Both images were already approved for the AC-30-05 and AC-30-01 blog articles respectively, and were reused here rather than sourcing from scratch.

## Export Settings
- Dimensions: 420x525 (proporção 4:5)
- Mobile contrast check: PASSED (all 3 assets)
