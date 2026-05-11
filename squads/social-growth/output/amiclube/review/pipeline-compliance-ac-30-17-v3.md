# Pipeline Compliance Report — AC-30-17 v3

## Veredito

**PASS — ready for queued publication**

## Evidence Table

| Gate | Evidence | Status |
|------|----------|--------|
| Visual Decision Card | `visual-decision-cards/ac-30-17-vdc-v3.md` | PASS |
| Render Compliance Card | `visual-decision-cards/ac-30-17-rcc-v3.md` | PASS |
| Review | `review/ac-30-17-v3-review.md` | PASS |
| Gate Verification | `review/gate-verification-ac-30-17-v3.md` | PASS |
| Incident Trace | `review/incident-trace-ac-30-17-brief-mismatch.md` | PASS |
| Incident Trace | `review/incident-trace-ac-30-17-missing-cta.md` | PASS |
| Export | `social/publish/ac-30-17/ac-30-17-01.png` a `ac-30-17-07.png` | PASS |
| Dimension | `file`: PNG image data, 1080 x 1350 | PASS |
| Queue | Agendado para 2026-05-07 18:30 BRT | PASS |

## Decision

AC-30-17 pode permanecer em fila (`queued`) para execução do conector. Não promover para `published` antes da publicação real.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Pipeline Auditor | pipeline-compliance-audit | `skills/pipeline-compliance-audit/SKILL.md` | AC-30-17 | Auditoria de VDC, RCC, review, incidents, preview, export e fila | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-17 | Confirmação de dimensão final e CTA/link | invoked |
