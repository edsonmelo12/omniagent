# Design System Manifest Schema

Este documento define o JSON que substitui a geração de HTML pelo LLM na etapa visual.

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
    "type": "solid | gradient | image",
    "color": "#0D0D0D",
    "from": "#0D0D0D",
    "to": "#241F12",
    "src": "/caminho/absoluto/imagem.jpg",
    "overlay": "rgba(0,0,0,0.52)"
  },
  "title": { "text": "Título de capa" },
  "heading": { "text": "Título de slide" },
  "subtitle": { "text": "Linha de apoio" },
  "body": { "text": "Texto principal" },
  "cta": { "text": "Chamada final" }
}
```

## Regra de qualidade

O LLM não deve gerar HTML/CSS para assets cobertos pelo Design System. Deve gerar apenas este manifesto JSON. O HTML é responsabilidade do engine.
