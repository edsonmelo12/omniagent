# Blog Image Bank

Quando a pesquisa de imagens estiver ativa, cada artigo de blog deve ser publicado com um mini banco de 3-5 imagens que alimentam tanto o artigo quanto os posts sociais derivados. Quando a pesquisa for adiada, o banco pode ser criado sob demanda antes da publicação ou da etapa visual.

## Regra

- **3-5 imagens obrigatórias** quando a pesquisa de imagens estiver ativa
- **Free/public sources** por padrão (Pexels, Unsplash, Wikimedia Commons, CC0)
- **Paid stock** apenas com aprovação explícita fora do fluxo padrão
- **Licença verificada** antes de incluir no banco
- **1 imagem vira a hero** do artigo; as demais ficam disponíveis para derivados sociais

## Estrutura do Banco de Imagens

O banco de imagens é um JSON salvo em `output/{client}/blog/assets/{asset_id}-images.json`:

```json
{
  "asset_id": "AC-30-13",
  "client": "amiclube",
  "hero_image": "AC-30-13-compra-inteligente-hero.jpg",
  "images": [
    {
      "id": "img-01",
      "filename": "AC-30-13-compra-inteligente-hero.jpg",
      "source_url": "https://www.pexels.com/photo/...",
      "license": "Pexels License",
      "license_verified_at": "2026-04-25",
      "attribution_required": false,
      "alt": "Close-up de amigurumi tigre em crochê",
      "suggested_use": "hero do artigo / capa de carrossel",
      "orientation": "landscape",
      "dominant_colors": ["#8B4513", "#D2B48C", "#2F4F4F"]
    },
    {
      "id": "img-02",
      "filename": "AC-30-13-ambiente-casa.jpg",
      "source_url": "https://www.pexels.com/photo/...",
      "license": "Pexels License",
      "license_verified_at": "2026-04-25",
      "attribution_required": false,
      "alt": "Amigurumi decorando estante de sala",
      "suggested_use": "slide 2-6 do carrossel / stories",
      "orientation": "portrait",
      "dominant_colors": ["#F5F0E8", "#8B7355", "#2E8B57"]
    }
  ]
}
```

## Como o Banco é Consumido

| Passo | Quem | O que faz |
|-------|------|-----------|
| Blog escrita (Step 03D) | Blog Writer | Coleta 3-5 imagens quando image research está ativa, gera `{asset_id}-images.json` |
| Blog publicação | Blog Writer | Salva uma como hero do artigo, as demais no banco |
| Direção visual (Step 03B) | Visual Director | Lê `{parent_asset_id}-images.json` e aloca imagem para **slide 1 (capa)** apenas |
| Render (Step 03C) | Creative Renderer | Aplica imagem alocada no VDC **somente no slide 1**; slides 2+ usam Design System |

## Regra de Imagem Única por Derivado

- **Imagem do banco alimenta exclusivamente o slide 1 (capa)** do asset derivado.
- **Slides 2+** usam criatividade do Design System: texturas, gradientes, padrões, composições tipográficas — **sem repetir** a imagem do slide 1.
- **Rationale:** o primeiro frame carrega a imagem de autoridade/prova do artigo; os demais carregam ritmo visual via design tokens.
- **Exceção:** crop variation Justified — a mesma imagem do banco pode aparecer em slides 2+ SE o crop/ponto focal for radicalmente diferente E declarado no VDC com justificativa explícita.

## Regras de Alocação

1. **1 imagem por derivado social** — cada post derivado recebe **1 imagem do banco** para o slide 1 (capa).
2. **Hero image é reservada** para o blog ou para a capa (slide 1) — não deve ser reusada em múltiplos derivados sem crop variationjustified.
3. **Slides 2+ não usam imagem do banco** — usam Design System. Repetir imagem de banco em slides 2+ sem justificativa de crop variation é veto.
4. **Cross-article permitido** — imagens de artigos irmãos podem ser usadas com justificativa no VDC.
5. **Crop variation Justified** — a mesma imagem pode aparecer em slides 2+ SE o crop/ponto focal mudar significativamente E for declarada no VDC com justificativa explícita.
6. **Esgotou o banco?** — justificar no VDC com `no-more-images: true` e usar `texture-only` como fallback ou nova curadoria.
7. **Alternar imagens entre derivados** — derivados diferentes do mesmo artigo devem receber imagens diferentes do banco para garantir first impression diversity.
