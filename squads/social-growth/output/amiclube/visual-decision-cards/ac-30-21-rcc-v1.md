# Render Compliance Card — AC-30-21 v1

## Veredito
PASS

## Render Evidence
| Gate | Evidência | Status |
|------|-----------|--------|
| VDC | squads/social-growth/output/amiclube/visual-decision-cards/ac-30-21-vdc-v1.md | PASS |
| Preview HTML | squads/social-growth/output/amiclube/social/previews/ac-30-21-carousel-v1.html | PASS |
| Export final | squads/social-growth/output/amiclube/social/publish/ac-30-21/ac-30-21-01.png a ac-30-21-07.png | PASS |
| Dimensão | 1080x1350 px (verificado via `file`) | PASS |
| Texto pt-BR | Todos os slides com acentos corretos (á, ã, ç, ó, ê, etc.) | PASS |
| Imagem | no-image-justified implementado — fundo #1A1A1A (dark) sem imagens, tipografia-led | PASS |

## VDC Compliance Checklist

### Canvas & Dimensões
- [x] 1080x1350 px — 7 slides exportados
- [x] Aspect ratio 4:5 (Instagram carousel)

### Estilo Editorial Magazine
- [x] Background: #1A1A1A (dark) em todos os slides
- [x] Alternância: slides ímpares dark (#1A1A1A), pares accent (#222222)
- [x] Tipografia: Playfair Display 700 (headlines/títulos especiais), DM Sans 700 (headlines), DM Sans 500 (subheads), DM Sans 400 (body)

### Palette Aplicada
- [x] #1A1A1A — fundo principal
- [x] #F5F0EA — texto principal
- [x] #C85A48 — accent vermelho tijolo
- [x] #D4AF37 — accent dourado
- [x] #555555 — secondary

### Estrutura de Slides
| Slide | Conteúdo | Status |
|-------|----------|--------|
| 1 | Cover: "Barato x Caro: A conta fecha?" — tipografia-led, logo lockup | PASS |
| 2 | O que você paga vs o que você recebe — comparison box | PASS |
| 3 | Custo do material importa (mas não é tudo) — quote box | PASS |
| 4 | Mão de obra especializada: o verdadeiro valor — steps list | PASS |
| 5 | Acabamento que dura anos vs alternativa rápida — comparison grid | PASS |
| 6 | O barato que vira custo oculto — warning box | PASS |
| 7 | CTA: "Comentar ANÁLISE" + "Salvar para depois" — bottom-center | PASS |

### Elementos de Navegação
- [x] Progress bar em cada slide (slide X/7)
- [x] Swipe arrow (exceto slide 7)
- [x] Carrossel horizontal com controls prev/next (arrow keys + drag)
- [x] Progress dots (7 dots abaixo do viewport)

### Export Mode CSS
- [x] Implementado — esconde swipe-arrow, progress-label, ig-header, ig-dots, ig-actions, ig-caption no PNG export

### pt-BR Validation
- [x] "Barato x Caro: A conta fecha?" — acentos ok
- [x] "O que você paga vs o que você recebe" — acentos ok
- [x] "Custo do material importa (mas não é tudo)" — acentos ok
- [x] "Mão de obra especializada: o verdadeiro valor" — acentos ok
- [x] "Acabamento que dura anos vs alternativa rápida" — acentos ok
- [x] "O barato que vira custo oculto" — acentos ok
- [x] "Comentar ANÁLISE", "Salvar para depois" — acentos ok
- [x] "ANÁLISE DE CUSTOS", "Comparação", "Materiais", "Mão de Obra", "Acabamento", "Realidade" — tags com acentos ok

## Skill Invocation Ledger
| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|-------|-------|-------------|------------|--------------|--------|
| Creative Renderer | instagram-carousel | skills/instagram-carousel/SKILL.md | AC-30-21 | Render 7 slides 1080x1350, progress bar, swipe arrows, export mode | invoked |
| Visual Director | creative-director | .agents/skills/creative-director/SKILL.md | AC-30-21 | Validação DNA allowed, seleção Editorial Magazine | invoked |
| Visual Director | social-visual-system | squads/social-growth/pipeline/skills/social-visual-system/SKILL.md | AC-30-21 | Regras de composição, CTA, pt-BR | invoked |

## Files Generated
1. HTML Preview: `squads/social-growth/output/amiclube/social/previews/ac-30-21-carousel-v1.html`
2. PNGs (7):
   - `ac-30-21-01.png` (1080x1350)
   - `ac-30-21-02.png` (1080x1350)
   - `ac-30-21-03.png` (1080x1350)
   - `ac-30-21-04.png` (1080x1350)
   - `ac-30-21-05.png` (1080x1350)
   - `ac-30-21-06.png` (1080x1350)
   - `ac-30-21-07.png` (1080x1350)
3. RCC: `squads/social-growth/output/amiclube/visual-decision-cards/ac-30-21-rcc-v1.md`

## Conclusão
HTML gerado com sucesso, 7 PNGs exportados (1080x1350 verificados), RCC criado com todas as verificações passando. carousel está pronto para publicação no Instagram.
