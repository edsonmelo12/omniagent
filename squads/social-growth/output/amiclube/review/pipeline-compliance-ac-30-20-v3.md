# Pipeline Compliance Report — AC-30-20 v3

## Veredito

**PASS — ready for queued publication**

## Evidence Table

| Gate | Evidence | Status |
|------|----------|--------|
| Visual Decision Card | `visual-decision-cards/ac-30-20-vdc-v3.md` | PASS |
| Render Compliance Card | `visual-decision-cards/ac-30-20-rcc-v3.md` | PASS |
| Review | `review/ac-30-20-v3-review.md` | PASS |
| Preview HTML | `social/previews/ac-30-20-v3-stories.html` | PASS |
| Export | `social/publish/ac-30-20/ac-30-20-01.png` a `ac-30-20-05.png` | PASS |
| Dimension | `file`: PNG image data, 1080 x 1920 | PASS |
| Queue | Agendado para 2026-05-06 18:30 BRT | PASS |

## Decision

AC-30-20 pode permanecer em fila (`queued`) para execução do conector. Não promover para `published` antes da publicação real.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Pipeline Auditor | pipeline-compliance-audit | `skills/pipeline-compliance-audit/SKILL.md` | AC-30-20 | Auditoria de VDC, RCC, review, preview, export e fila | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-20 | Confirmação de dimensão final e CTA | invoked |
