# Render Compliance Card — AC-30-07 v4

## Veredito

**PASS — ready for queued publication**

## Render Evidence

| Gate | Evidência | Status |
|------|-----------|--------|
| VDC canônico | `visual-decision-cards/ac-30-07-vdc-v4.md` | PASS |
| Preview HTML | `social/previews/ac-30-07-v4-reels.html` | PASS |
| Texto pt-BR | CTA corrigido: “Comente \"QUERO ANÁLISE\" e te enviamos um guia gratuito.” | PASS |
| Export final | `social/publish/ac-30-07-v4/ac-30-07-v4-frame-{1..4}.png` | PASS |
| Dimensões | `file` confirmou 1080x1920 nos frames 1 e 4 | PASS |
| Review | `review/ac-30-07-v4-review.md` | PASS |
| Compliance | `review/pipeline-compliance-ac-30-07-v4.md` | PASS |

## Correções Aplicadas

- Removido trecho não pt-BR do CTA no HTML (`我们将`).
- Frames v4 reexportados a partir do HTML corrigido.
- Fila deve apontar para os exports v4, não para os PNGs antigos `360x640`.

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|-------|-------|-------------|------------|--------------|--------|
| Creative Renderer | reels-sequence | `skills/reels-sequence/SKILL.md` | AC-30-07 v4 HTML/PNG | Render de sequência 9:16 com 4 frames | invoked |
| Pipeline Auditor | pipeline-compliance-audit | `skills/pipeline-compliance-audit/SKILL.md` | AC-30-07 v4 | Conferência de evidências, pt-BR, dimensões e fila | invoked |
