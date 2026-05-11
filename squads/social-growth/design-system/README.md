# Social Growth Design System

Este módulo reduz o consumo de tokens na geração de artes sociais. O LLM deixa de escrever HTML/CSS do zero e passa a gerar um manifesto JSON compacto. O engine monta o HTML final de forma determinística.

## Compor um asset

```bash
node squads/social-growth/design-system/engine/compose.mjs \
  --manifest squads/social-growth/design-system/examples/ac-30-design-manifest.json \
  --out squads/social-growth/output/amiclube/social/previews/ac-30-design-system-demo.html
```

Para validações sem tocar no output operacional do cliente, use `/tmp/opencode`:

```bash
node squads/social-growth/design-system/engine/compose.mjs \
  --manifest squads/social-growth/design-system/examples/ac-30-design-manifest.json \
  --out /tmp/opencode/ac-30-design-system-demo.html
```

## Criar um preset de marca

```bash
node squads/social-growth/design-system/engine/preset-from-brand.mjs \
  --name "client-amiclube-sazonal-2026" \
  --primary "#1A3A2A" \
  --secondary "#2C5F2D" \
  --accent "#FFE77A" \
  --heading "Fraunces" \
  --body "Nunito Sans"
```

## Criar um preset via JSON

```bash
node squads/social-growth/design-system/engine/preset-from-brand.mjs \
  --json caminho/para/preset.json
```

## Fluxo operacional

1. Visual Director cria o manifesto JSON com `style`, `format` e `slides`.
2. Creative Renderer chama `compose.mjs`.
3. O HTML é salvo em `output/{client}/social/previews/`.
4. O export continua usando Playwright e os scripts atuais.

## Garantias (Fase 1 + Fase 2)

- **8 formatos implementados:** `instagram-carousel`, `reels-sequence`, `stories-sequence`, `linkedin-carousel`, `facebook-post`, `pinterest-pin`, `social-single-post`, `post-preview`.
- **7 presets de estilo:** `dark-premium`, `editorial-magazine`, `editorial-myth`, `high-energy-cyber`, `minimalist-texture`, `authentic-rough`, `motion-social`.
- Engine: `compose.mjs` valida, compõe e gera HTML para todos os formatos (0 tokens de LLM).
- Export: `export-slides.mjs` para captura via Playwright.
- Pipeline integrado: Step 03B pode gerar JSON manifest; Step 03C chama engine.
- Sem dependências novas.
- HTML final é auto-contido, com CSS inline, preview navegável e `body.export-mode` para exportação.
- Artefatos de teste devem ser gerados em `/tmp/opencode`, salvo quando forem parte de um piloto aprovado.

## Checklist de Higienização

- [ ] Não deixar HTML/PNG de teste em `output/{client}/social/previews/`.
- [ ] Não manter presets temporários em `styles/`.
- [ ] Validar `compose.mjs` com `node --check` antes de usar em pipeline.
- [ ] Validar `preset-from-brand.mjs` com `node --check` antes de criar presets de cliente.
- [ ] Usar `--out /tmp/opencode/...` para testes rápidos.

## Piloto Controlado

1. Escolher 1 carrossel real já aprovado pela squad.
2. Criar o manifesto JSON a partir do conteúdo aprovado.
3. Compor o HTML via `compose.mjs`.
4. Exportar PNG com Playwright em `body.export-mode`.
5. Comparar com o fluxo antigo em qualidade, tempo e consumo estimado de tokens.
6. Só integrar Step 03B/03C depois do piloto aprovado.

## Status

- **Fase 1 (Fundação):** ✅ Completa (tokens.css, dark-premium.css, instagram-carousel.hbs, compose.mjs)
- **Fase 2 (Estilos e Formatos):** ✅ Completa (7 presets, 8 templates, engine multi-formato)
- **Fase 3 (Pipeline):** ✅ Completa (Step 03B/03C adaptados, agentes atualizados)
