# Design System Tokens

Os tokens abaixo são a base de todos os templates sociais.

## Foundation

| Token | Uso |
|-------|-----|
| `--ds-preview-w` / `--ds-preview-h` | Tamanho do preview |
| `--ds-export-w` / `--ds-export-h` | Tamanho final de exportação |
| `--ds-space-*` | Escala de spacing em múltiplos de 8px |
| `--ds-font-*` | Escala tipográfica de preview |
| `--ds-export-font-*` | Escala tipográfica de exportação |
| `--ds-content-pad-x` | Padding horizontal do preview |
| `--ds-export-content-pad-x` | Padding horizontal final |

## Style Preset

Todo preset em `design-system/styles/` deve declarar:

| Token | Uso |
|-------|-----|
| `--style-bg` | Fundo principal |
| `--style-bg-alt` | Fundo alternativo |
| `--style-surface` | Cards e placas translúcidas |
| `--style-text-heading` | Títulos |
| `--style-text-body` | Corpo |
| `--style-text-muted` | Rótulos e rodapé |
| `--style-accent` | Destaque principal |
| `--style-accent-soft` | Destaque translúcido |
| `--style-border` | Bordas de destaque |
| `--style-heading-font` | Fonte de títulos |
| `--style-body-font` | Fonte de corpo |
| `--style-noise-opacity` | Intensidade de textura |
| `--style-gradient` | Fundo composto padrão |

## Regra

Templates devem usar tokens, não valores fixos de marca. Assim novos design systems podem ser adicionados sem alterar HTML.
