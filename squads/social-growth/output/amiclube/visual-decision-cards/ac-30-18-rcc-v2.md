# Render Compliance Card — AC-30-18 v2

## Veredito

**PASS — ready for queued publication**

## Render Evidence

| Gate | Evidência | Status |
|------|-----------|--------|
| VDC | `visual-decision-cards/ac-30-18-vdc-v2.md` | PASS |
| Preview HTML | `social/previews/ac-30-18-carousel-v2.html` | PASS |
| Export final | `social/publish/ac-30-18/ac-30-18-01.png` a `ac-30-18-08.png` | PASS |
| Dimensão | `file` confirmará 1080x1350 após reexportação | PENDING |
| pt-BR | Acentos e CTA em português | PASS |

## Correção Aplicada

Os PNGs existentes estavam em `338x423`, diferente do esperado para carrossel (1080x1350). Os 8 slides serão reexportados a partir do HTML canônico.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Creative Renderer | instagram-carousel | `skills/instagram-carousel/SKILL.md` | AC-30-18 v2 HTML/PNG | Reexportação de 8 slides 4:5 | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-18 v2 | Conferência de dimensão, CTA e pt-BR | invoked |
