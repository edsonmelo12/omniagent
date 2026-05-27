# Design System Manifest Schema

Este documento define o JSON que **substitui completamente** a geração de HTML pelo LLM na etapa visual.

**Regra:** O LLM não deve gerar HTML/CSS para assets cobertos pelo Design System. Deve gerar apenas este manifesto JSON. O HTML é responsabilidade do engine (`compose.mjs`).

**Output padrão do Visual Director:** `visual-direction.json` neste schema. O caminho legado (markdown VDC) só é permitido com aprovação explícita do Atlas CEO.

## Campos obrigatórios

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `asset_id` | string | Identificador estável do asset |
| `client` | string | Cliente ativo |
| `style` | string | Preset CSS em `design-system/styles/` sem extensão |
| `format` | string | Template em `design-system/templates/` sem extensão |
| `slides` | array | Lista de slides/frames a renderizar |

## Campos recomendados

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `brand` | string | Nome visual da marca |
| `title` | string | Título do preview HTML |
| `topic` | string | Tema do asset |
| `deck_label` | string | Rótulo superior do carrossel |
| `footer` | string | Rodapé do asset |
| `canvas` | object | Dimensões finais de exportação |
| `preview` | object | Dimensões de preview |
| `design_tokens` | object | Overrides criativos locais |
| `first_impression` | object | Decisão de primeira impressão |

## Slide

```json
{
  "type": "cover | content | cta",
  "eyebrow": "Rótulo curto",
  "background": {
    "type": "solid | gradient | image | texture-pattern",
    "color": "#0D0D0D",
    "from": "#0D0D0D",
    "to": "#241F12",
    "src": "/caminho/absoluto/imagem.jpg",
    "overlay": "rgba(0,0,0,0.52)",
    "texture": "noise | grain | paper | pattern | none"
  },
  "contrast_strategy": "dark-overlay | light-overlay | gradient-mask | zone-isolation | no-overlay-justified",
  "text_legibility": "legible | borderline | fails",
  "title": { "text": "Título de capa" },
  "heading": { "text": "Título de slide" },
  "subtitle": { "text": "Linha de apoio" },
  "body": { "text": "Texto principal" },
  "cta": { "text": "Chamada final" }
}
```

**Nota:** `type: "cover"` é o único slide que pode usar `background.type: "image"` (imagem do banco). Slides `type: "content"` devem usar `solid`, `gradient` ou `texture-pattern`. Use `contrast_strategy` para ativos de capa com imagem.

---

## Post-Preview Format

O formato `post-preview` gera uma página de galeria + caption para review visual antes da publicação. Consome **exclusivamente** arquivos JSON — nenhuma string inline.

### Manifesto (formato post-preview)

```json
{
  "asset_id": "AC-30-31",
  "client": "amiclube",
  "format": "post-preview",
  "caption_source": "social-final-captions",
  "asset_caption_id": "AC-30-31",
  "exported_images": [
    "output/amiclube/social/publish/ac-30-31/ac-30-31-01.png",
    "output/amiclube/social/publish/ac-30-31/ac-30-31-02.png"
  ],
  "channel": "instagram",
  "objective": "authority"
}
```

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `asset_id` | string | ✅ | Identificador do asset |
| `client` | string | ✅ | Cliente ativo |
| `format` | string | ✅ | Valor fixo: `post-preview` |
| `caption_source` | string | ✅ | Fonte do caption: `social-final-captions` |
| `asset_caption_id` | string | ✅ | ID que busca em `social-final-captions.json` |
| `exported_images` | array | ✅ | Caminhos dos PNGs exportados (galeria) |
| `channel` | string | ❌ | Canal (instagram/facebook/linkedin) |
| `objective` | string | ❌ | Objetivo estratégico do post |
| `cta_override` | string | ❌ | Sobrescreve CTA lido do JSON |

### Fluxo de caption (zero manual)

1. `compose.mjs` detecta `caption_source: "social-final-captions"`
2. Lê `output/{client}/publishing/social-final-captions.json`
3. Busca `captions[].asset_id === asset_caption_id`
4. Extrai `final_caption`, `hashtags`, `cta`, `link_target`, `alt_text`
5. Compõe HTML — **string manual não é usada**

### Fallback (compatibilidade)

Se `caption_source` não for `"social-final-captions"` ou o JSON não existir, o engine tenta ler `manifest.caption` e `manifest.hashtags` (compatibilidade com manifests antigos gerados inline). Mensagem de warn no console indica fallback.

### Regra de eficiência

- **Caption nunca é gerado via LLM** — vem do `social-final-captions.json` que é a fonte canônica de publicação.
- **Hashtags nunca são geradas via LLM** — extraídas do mesmo JSON.
- **Post-preview é gerado determinísticamente** — mesmo conteúdo = mesmo HTML.
- **Tokens gastos com caption: 0**

```

## Regra de qualidade

O LLM não deve gerar HTML/CSS para assets cobertos pelo Design System. Deve gerar apenas este manifesto JSON. O HTML é responsabilidade do engine.
