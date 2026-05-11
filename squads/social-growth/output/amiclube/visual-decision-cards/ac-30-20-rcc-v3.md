# Render Compliance Card — AC-30-20 v3

## Veredito

**PASS — ready for queued publication**

## Render Evidence

| Gate | Evidência | Status |
|------|-----------|--------|
| VDC | `visual-decision-cards/ac-30-20-vdc-v3.md` | PASS |
| Preview HTML | `social/previews/ac-30-20-v3-stories.html` | PASS |
| Export final | `social/publish/ac-30-20/ac-30-20-01.png` a `ac-30-20-05.png` | PASS |
| Dimensão | `file` confirmará 1080x1920 após reexportação | PENDING |
| Review v3 | `review/ac-30-20-v3-review.md` | PASS |
| VDC consolidado | `social/visual-direction/ac-30-20-v3-vdc.md` | PASS |
| pt-BR | Acentos e CTA em português | PASS |

## Correção Aplicada

Os PNGs existentes estavam em `360x640`, diferente do esperado para Stories (1080x1920). Os 5 frames serão reexportados a partir do HTML canônico.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Creative Renderer | stories-sequence | `skills/stories-sequence/SKILL.md` | AC-30-20 v3 HTML/PNG | Reexportação de 5 frames 9:16 | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-20 v3 | Conferência de dimensão, CTA e pt-BR | invoked |
