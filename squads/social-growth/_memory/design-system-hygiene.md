# Design System — Higienização Pós-Fase 1

**Data:** 2026-05-10
**Status:** Pilotos concluídos

## Objetivo

Separar a entrega estrutural do Design System dos artefatos de validação, evitando poluir o output operacional da AmiClube antes de um piloto aprovado.

## Ações Executadas

- Removidos os artefatos de prova.
- Confirmado que não ficou preset temporário.
- Documentado no `README.md` que validações devem usar `/tmp/opencode`.

## Pilotos Realizados

| Asset | Preset | Formato | Resultado |
|-------|--------|---------|-----------|
| AC-30-14 | editorial-magazine → editorial-myth | instagram-carousel | 7 slides, 7 PNGs exportados, hub atualizado |
| AC-30-06 | editorial-myth | instagram-carousel | 7 slides, 7 PNGs exportados, hub atualizado |

**Aprendizados dos pilotos:**
- `data-text-variant` (light/dark) necessário para alternância de cor de texto entre fundos.
- `truthCard` necessário para citações em itálico com borda em slides de conteúdo.
- Formato `post-preview` funciona independente: galeria + caption + hashtags, via `--format post-preview`.
- Export-mode do template `instagram-carousel.hbs` oculta corretamente `.ig-header`, `.avatar`, `.ig-dots`, `.header-zone`, `.deck-label`, `.footer-zone`, `.swipe-arrow`, `.progress-bar` — PNG limpo.

## Engine Capabilities (compose.mjs)

| Feature | Descrição | Uso no Manifesto |
|---------|-----------|------------------|
| `data-text-variant` | `"dark"` = texto branco, `"light"` = texto escuro | `slide.textVariant` |
| `truthCard` | Renderiza body em card com borda (itálico) em slides de conteúdo | `slide.truthCard: true` |
| `--format` | Sobrescreve format do manifesto via CLI | `node compose.mjs --manifest x --format post-preview` |
| `post-preview` | Formato que gera página de galeria + caption + hashtags | Requer `caption`, `hashtags`, `exported_images` no manifesto |

## Próximos Passos

- Criar template `social-single-post.hbs` para posts estáticos (ex: AC-30-08).
- Adicionar preset `high-energy-cyber`, `minimalist-texture`, `authentic-rough`, `motion-social`.
- Estender engine para suportar `reels-sequence` e `stories-sequence`.
- Medir redução de tokens comparada ao fluxo antigo.
