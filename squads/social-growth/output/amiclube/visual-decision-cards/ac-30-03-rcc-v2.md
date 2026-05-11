# Render Compliance Card — AC-30-03 v2

## Veredito

**PASS — ready for queued publication**

## Render Evidence

| Gate | Evidência | Status |
|------|-----------|--------|
| VDC | `visual-decision-cards/ac-30-03-vdc-v2.md` | PASS |
| Preview HTML | `social/previews/ac-30-03-reels-v2.html` | PASS |
| Export final | `social/publish/ac-30-03/ac-30-03-01.png` a `ac-30-03-04.png` | PASS |
| Dimensão | `file` confirmará 1080x1920 após reexportação | PENDING |
| Gate verification | `review/gate-verification-ac-30-03-v2.md` | PASS |
| Incident traces | `incident-trace-ac-30-03-vertical-alignment.md`, `incident-trace-ac-30-03-wrong-preview-link.md` | PASS |
| Link strategy | Link na bio no draft e frame final | PASS |
| pt-BR | Acentos e CTA em português | PASS |

## Correção Aplicada

Os PNGs existentes estavam em `340x621`, diferente do esperado para Reels (1080x1920). Os 4 frames serão reexportados a partir do HTML canônico, capturando apenas o conteúdo do Reels e removendo elementos de preview.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Creative Renderer | instagram-reels | `skills/instagram-reels/SKILL.md` | AC-30-03 v2 HTML/PNG | Reexportação de 4 frames 9:16 | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-03 v2 | Conferência de dimensão, CTA, link e incident traces | invoked |
