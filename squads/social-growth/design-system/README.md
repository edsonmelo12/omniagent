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

## Expandir para novos formatos

1. Escolha o formato em `contracts/post-system.json`.
2. Gere um manifesto-base com o scaffold:

```bash
node squads/social-growth/design-system/engine/scaffold-manifest.mjs \
  --format instagram-carousel \
  --style editorial-magazine \
  --asset-id AC-99-01 \
  --output /tmp/opencode/ac-99-01.json
```

3. Pesquise referências do formato, extraia os tokens visuais e ajuste só o manifesto.
4. Rode `compose.mjs` e depois `export-slides.mjs`.
5. Valide a saída final antes de promover para o pipeline.

Se quiser começar pela direção visual em vez do manifesto, use:

```bash
node squads/social-growth/design-system/engine/scaffold-visual-direction.mjs \
  --format facebook-post \
  --asset-id AC-99-01 \
  --output /tmp/opencode/ac-99-01-visual-direction.json
```

Para gerar a direção inicial a partir do pacote de conteúdo:

```bash
node squads/social-growth/design-system/engine/generate-direction-from-package.mjs \
  --package squads/social-growth/output/content/content-production-package.md \
  --output /tmp/opencode/visual-direction.json
```

Para rodar 03B -> 03C em sequência:

```bash
node squads/social-growth/design-system/engine/run-design-system-cycle.mjs \
  --package squads/social-growth/output/amiclube/content/content-production-package.md \
  --asset-id AC-30-35 \
  --client amiclube \
  --brand AmiClube
```

### Mapa rápido

- `facebook-post` e `social-single-post`: autoridade, reputação, conversão curta.
- `instagram-carousel` e `linkedin-carousel`: progressão editorial e prova.
- `reels-sequence` e `stories-sequence`: retenção, ritmo e CTA rápido.
- `pinterest-pin`: descoberta visual com foco em legibilidade.

## Fluxo operacional (determinístico — padrão)

1. Visual Director cria `visual-direction.json` com `style`, `format` e `slides`.
2. Creative Renderer chama `compose.mjs --manifest visual-direction.json` — **nunca** gera HTML manualmente.
3. O HTML é salvo em `output/{client}/social/previews/`.
4. PNGs exportados via `export-slides.mjs`.
5. Batch render disponível: `node scripts/batch-render.mjs`.

## Garantias (Fase 1 + Fase 2)

- **8 formatos implementados:** `instagram-carousel`, `reels-sequence`, `stories-sequence`, `linkedin-carousel`, `facebook-post`, `pinterest-pin`, `social-single-post`, `post-preview`.
- **8 presets de estilo:** `dark-premium`, `editorial-magazine`, `editorial-myth`, `high-energy-cyber`, `minimalist-texture`, `authentic-rough`, `motion-social`, `paper-bulletin`.
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

## Status

- **Fase 1 (Fundação):** ✅ Completa
- **Fase 2 (Estilos e Formatos):** ✅ Completa (8 presets, 8 templates, engine multi-formato)
- **Fase 3 (Pipeline — DS como alternativa):** ✅ Completa
- **Fase 4 (Pipeline — DS como padrão determinístico):** ✅ Ativa (este release)
  - Visual Director produz JSON manifest por padrão
  - Creative Renderer chama `compose.mjs` por padrão
  - Batch render via `scripts/batch-render.mjs`
  - Caminho legado (markdown VDC + HTML manual) requer aprovação do Atlas CEO
