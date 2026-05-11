# Pipeline Compliance Report — AC-30-34

## Veredito

**PASS — ready for queued publication**

## Evidence Table

| Gate | Evidence | Status |
|------|----------|--------|
| Visual Decision Card | `visual-decision-cards/ac-30-34-vdc-v1.md` | PASS |
| Render Compliance Card | `visual-decision-cards/ac-30-34-rcc-v1.md` | PASS |
| Review | `review/ac-30-34-review.md` | PASS |
| Preview HTML | `social/previews/ac-30-34-facebook.html` | PASS |
| Export | `social/publish/ac-30-34/ac-30-34-01.png` | PASS |
| Dimension | `file`: PNG image data, 1200 x 630 | PASS |
| Queue | Agendado para 2026-05-06 10:00 BRT | PASS |

## Decision

AC-30-34 pode permanecer em fila (`queued`) para execução do conector. Não promover para `published` antes da publicação real.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Pipeline Auditor | pipeline-compliance-audit | `skills/pipeline-compliance-audit/SKILL.md` | AC-30-34 | Auditoria de VDC, RCC, review, preview, export e fila | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-34 | Confirmação de dimensão final e CTA | invoked |
