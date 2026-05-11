# Pipeline Compliance Report — AC-30-18 v2

## Veredito

**PASS — ready for queued publication**

## Evidence Table

| Gate | Evidence | Status |
|------|----------|--------|
| Visual Decision Card | `visual-decision-cards/ac-30-18-vdc-v2.md` | PASS |
| Render Compliance Card | `visual-decision-cards/ac-30-18-rcc-v2.md` | PASS |
| Review | `review/ac-30-18-v2-review.md` | PASS |
| Preview HTML | `social/previews/ac-30-18-carousel-v2.html` | PASS |
| Export | `social/publish/ac-30-18/ac-30-18-01.png` a `ac-30-18-08.png` | PASS |
| Dimension | `file`: PNG image data, 1080 x 1350 | PASS |
| Queue | Agendado para 2026-05-08 18:30 BRT | PASS |

## Decision

AC-30-18 pode permanecer em fila (`queued`) para execução do conector. Não promover para `published` antes da publicação real.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Pipeline Auditor | pipeline-compliance-audit | `skills/pipeline-compliance-audit/SKILL.md` | AC-30-18 | Auditoria de VDC, RCC, review, preview, export e fila | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-18 | Confirmação de dimensão final e CTA | invoked |
