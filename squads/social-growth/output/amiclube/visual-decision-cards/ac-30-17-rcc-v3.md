# Render Compliance Card — AC-30-17 v3

## Veredito

**PASS — ready for queued publication**

## Render Evidence

| Gate | Evidência | Status |
|------|-----------|--------|
| VDC | `visual-decision-cards/ac-30-17-vdc-v3.md` | PASS |
| Preview HTML | `social/previews/ac-30-17-carousel-v3.html` | PASS |
| Export final | `social/publish/ac-30-17/ac-30-17-01.png` a `ac-30-17-07.png` | PASS |
| Dimensão | `file` confirmou 1080x1350 nos slides 1 e 7 | PASS |
| Gate verification | `review/gate-verification-ac-30-17-v3.md` | PASS |
| Incident traces | `incident-trace-ac-30-17-brief-mismatch.md`, `incident-trace-ac-30-17-missing-cta.md` | PASS |
| Link strategy | Link na bio no draft e slide final | PASS |
| pt-BR | Acentos e CTA em português | PASS |

## Correção Aplicada

Os PNGs existentes estavam em `338x423`, apesar do gate declarar 1080x1350. Os 7 slides foram reexportados a partir do HTML canônico, capturando apenas o carrossel final e removendo elementos de preview.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Creative Renderer | instagram-carousel | `skills/instagram-carousel/SKILL.md` | AC-30-17 v3 HTML/PNG | Reexportação de 7 slides 4:5 | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-17 v3 | Conferência de dimensão, CTA, link e incident traces | invoked |
