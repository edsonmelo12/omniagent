# Render Compliance Card — AC-30-14 v2

## Veredito
PASS — ready for review

## Render Evidence

| Gate | Evidência | Status |
|------|-----------|--------|
| VDC | `visual-decision-cards/ac-30-14-vdc.md` (updated) | PASS |
| Image Bank | `blog/assets/AC-30-13-images.json` — img-02 allocated | PASS |
| Preview HTML | `social/previews/ac-30-14-carousel-ocasiao.html` | PASS |
| Dimensão | 1080×1350 (4:5) no CSS | PASS |
| Texto pt-BR | Acentos verificados — OK | PASS |
| DNA Acceptance | Warm Editorial alinhado ao DNA AmiClube | PASS |
| Imagem de fundo | img-02 (AC-30-13-toys-collection.jpg) com crops variados por slide | PASS |
| Overlay escuro | Gradiente 30-90% para legibilidade em todos os slides | PASS |

## Image Allocation Compliance

| Requisito | Status |
|-----------|--------|
| 1 imagem do banco de AC-30-13 | PASS — img-02 |
| Crop variation por slide | PASS — 5 posições diferentes |
| Hero image não reusada | PASS — img-01 (hero) reservada para o blog |
| Overlay para legibilidade | PASS — gradiente escuro |

## Design System Compliance

| Requisito | Status |
|-----------|--------|
| Warm Editorial palette | PASS |
| DM Sans + Playfair Display | PASS |
| Alinhamento vertical (space-between) | PASS |
| Sem setas de navegação na arte | PASS |
| Sem mocks de interface | PASS |
| Progress bar + slide number | PASS |

## Estrutura Verificada

| Slide | Conteúdo | Crop | Status |
|-------|----------|------|--------|
| 1 | Capa: "Você sabe qual amigurumi combina?" | center center | PASS |
| 2 | Presente especial | 30% center (urso) | PASS |
| 3 | Decorar espaço | 70% center (pintinho) | PASS |
| 4 | Presentear criança | center 70% (base) | PASS |
| 5 | Escritório | center 20% (topo) | PASS |
| 6 | Síntese: "melhor para agora" | center center | PASS |
| 7 | CTA: "Comente aqui" | 25% center (urso) | PASS |

## pt-BR Accentuation Check

| Texto | Status |
|-------|--------|
| "você", "amigurumi", "ocasião", "ninguém" | PASS |
| "profissionalismo", "personalidade", "significado" | PASS |
| "leveza", "espaço", "criança", "escritório" | PASS |
| Sem caracteres chineses ou erros de digitação | PASS |

## Skill Invocation Ledger

| Agent | Skill | Applied To | Use | Status |
|-------|-------|------------|-----|--------|
| Visual Director | creative-director | AC-30-14 | Estilo Warm Editorial + crop map | invoked |
| Visual Director | social-visual-system | AC-30-14 | Regras de carrossel, palette | invoked |
| Visual Director | instagram-carousel | AC-30-14 | 7 slides 4:5 com img-02 | invoked |
| Creative Renderer | instagram-carousel | AC-30-14 | HTML preview com bg real | invoked |
