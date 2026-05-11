# Blog Image Bank

Cada artigo de blog deve ser publicado com um mini banco de 3-5 imagens que alimentam tanto o artigo quanto os posts sociais derivados.

## Regra

- **3-5 imagens obrigatórias** por artigo de blog
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
| Blog escrita (Step 03D) | Blog Writer | Coleta 3-5 imagens, gera `{asset_id}-images.json` |
| Blog publicação | Blog Writer | Salva uma como hero do artigo, as demais no banco |
| Direção visual (Step 03B) | Visual Director | Lê `{parent_asset_id}-images.json` e aloca 1 imagem DIFERENTE para cada derivado social |
| Render (Step 03C) | Creative Renderer | Usa a imagem alocada no VDC como background |

## Regras de Alocação

1. **1 imagem por derivado social** — cada post derivado recebe uma imagem diferente do banco.
2. **Hero image é reservada** para o blog ou para a capa do carrossel — não deve ser reusada em múltiplos derivados.
3. **Cross-article permitido** — imagens de artigos irmãos podem ser usadas com justificativa no VDC.
4. **Crop variation válida** — a mesma imagem pode servir múltiplos derivados SE o crop/ponto focal mudar significativamente (ex: AC-30-29 usa 3 crops da mesma imagem).
5. **Esgotou o banco?** — justificar no VDC com `no-more-images: true` e usar `texture-only` como fallback ou nova curadoria.
