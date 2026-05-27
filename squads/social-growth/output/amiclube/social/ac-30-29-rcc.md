# Render Compliance Card — AC-30-29

## Asset Identification

| Campo | Valor |
|-------|-------|
| Asset ID | AC-30-29 |
| Cliente | AmiClube |
| Canal | Instagram feed |
| Formato | 1080x1350 px |
| Frames | 1 |
| Blog Parent | AC-30-13B |

## Visual Production Gate Validation

| Gate | Status | Evidência |
|------|--------|-----------|
| Canvas dimensions | ✅ PASS | 1080x1350 px |
| Skill applied | ✅ PASS | social-single-post |
| Style | ✅ PASS | premium-editorial |
| Background Image Scope | ✅ PASS | Hero da campanha em full-bleed |
| First Impression Diversity | ✅ PASS | Capa nova para o feed, sem reutilizar composição de stories |
| Contrast Strategy | ✅ PASS | Overlay escuro controlado aplicado |
| Text Legibility | ✅ PASS | Legível em canvas único |
| Anti-Pattern Compliance | ✅ PASS | Sem setas, sem mock, sem URL inventada |

## Export Paths

| Entrega | Caminho |
|---------|---------|
| Preview HTML | `squads/social-growth/output/amiclube/social/previews/ac-30-29-premium-editorial-single-post.html` |
| PNG Final | `squads/social-growth/output/amiclube/social/publish/ac-30-29-post/ac-30-29-post.png` |

## Caption Sourced From

| Campo | Valor |
|-------|-------|
| Caption Source | social-final-captions.json |
| Asset Caption ID | AC-30-29 |
| Link Target | `https://amiclube.com.br/?p=13046` |
| Link Strategy | link_na_bio |

## Typography Validation

| Elemento | Tamanho | Peso | Status |
|----------|---------|------|--------|
| Headline | 58px | 800 | ✅ PASS |
| Body | 18px | 500-700 | ✅ PASS |
| CTA | 13px | 800 | ✅ PASS |

## Copy Validation

| Campo | Copy | Status |
|-------|------|--------|
| Headline | "Mesa, estante ou fundo de câmera?" | ✅ pt-BR com acentuação |
| Body | "Escolha o ponto que mais combina com o seu home office e com a sua rotina." | ✅ pt-BR com acentuação |
| CTA | "Salve para comparar" | ✅ pt-BR com acentuação |

## Pipeline Steps Completed

1. ✅ Manifesto do post único criado
2. ✅ Preview HTML gerado
3. ✅ PNG final exportado
4. ✅ RCC atualizado

## Validation Checklist

- [x] 1 frame final, 1080x1350 px
- [x] Preview HTML com layout compatível com o canvas
- [x] Imagem-base correta (campanha AC-30-13B)
- [x] Fonte mínima respeitada
- [x] Copy em pt-BR com acentuação correta

## Skill Invocation Ledger

| Skill | Evocado | Evidência |
|-------|---------|-----------|
| social-single-post | ✅ | Template `social-single-post.hbs` |
| premium-editorial | ✅ | Preset `design-system/styles/premium-editorial.css` |
| social-visual-system | ✅ | Tokens e composição do design system |

## Metadata

- **RCC Version:** 2.0.0
- **Created:** 2026-05-16
- **Created by:** Creative Renderer
- **Next:** Reviewer → Pipeline Auditor → Campaign Hub update
