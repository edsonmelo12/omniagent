# Rendered Assets

Client: active client
Cycle: current cycle
Owner: Creative Renderer
Status: template

## Purpose

This file records the final exported creative assets and the render manifest that downstream review and scheduling steps consume.
Replace `pending` with real export metadata after rendering.

The rows below are the current cycle example. For another client, regenerate the manifest from the active client table.

## Manifest

| Day | Title | Channel | Format | Asset Type | Source Class | Source Notes | Validation | Output Path | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pare de travar em receitas confusas | Instagram | PNG | editorial card | No external source | n/a | pending | pending | pending | master asset |
| 2 | O que você recebe não é só uma receita | Instagram | PNG | product proof reel/card | Unsplash / Pexels or CC0 / Public Domain | Source search note: product detail, proof-supporting close-up, value-in-context | pending | pending | pending | proof and value asset |
| 3 | Organização vende mais do que improviso | Instagram | PNG | checklist card | No external source | n/a | pending | pending | pending | routine asset |
| 4 | 3 dúvidas que travam sua venda | Instagram | PNG | objection carousel | No external source | n/a | pending | pending | pending | 3-card sequence |
| 5 | Bastidor que gera valor percebido | Instagram | PNG | process shot | Unsplash / Pexels or CC0 / Public Domain | Source search note: hands-at-work, process context, making visible | pass | output/creative/_tests/test-client-post-v21-final.png | rendered | validated compact-title anti-halo test render |
| 6 | O erro que faz você vender menos | Instagram | PNG | comparison card | No external source | n/a | pending | pending | pending | contrast asset |
| 7 | O que aprendemos nesta semana | Instagram | PNG | recap card | No external source | n/a | pending | pending | pending | weekly summary |
| 8 | Clareza comercial muda tudo | Instagram | PNG | editorial carousel | No external source | n/a | pending | pending | pending | argument sequence |
| 9 | O valor real está no que evita | Instagram | MP4/PNG | proof reel | Unsplash / Pexels or CC0 / Public Domain | Source search note: visible outcome, evidence frame, proof-first close-up | pending | pending | pending | evidence-led asset |
| 10 | Como vender sem parecer confuso | Instagram | PNG | text-first post | No external source | n/a | pending | pending | pending | typography-led asset |
| 11 | Suporte também é diferencial | Instagram | PNG | reassurance carousel | No external source or CC0 / Public Domain | Source search note: calm trust context if needed | pending | pending | pending | trust asset |
| 12 | Rotina simples para não travar | Instagram | PNG | planner/checklist card | No external source | n/a | pending | pending | pending | saveable planner |
| 13 | Prova que convence sem forçar | Instagram | MP4/PNG | proof reel | Unsplash / Pexels or CC0 / Public Domain | Source search note: proof-first close-up, result detail, context evidence | pending | pending | pending | hook-close evidence |
| 14 | A tese da campanha | Instagram | PNG | manifesto carousel | No external source | n/a | pending | pending | pending | closing thesis |

## Export Notes

- The master asset must be rendered first.
- Downstream variants should reuse the same visual system.
- Each output must include a stable path and status.
- Each output must include a validation status before it can be considered ready.
- Each external-image output must include a source class and source notes field.
- The final manifest must be readable by review and scheduling without reinterpretation.
