# Pipeline Compliance Report — AC-30-08 v1

## Veredito

**PASS — ready for queued publication**

## Evidence Table

| Gate | Evidence | Status |
|------|----------|--------|
| Visual Decision Card | `visual-decision-cards/ac-30-08-vdc-v1.md` | PASS |
| Render Compliance Card | `visual-decision-cards/ac-30-08-rcc-v1.md` | PASS |
| Review | `review/ac-30-08-v1-review.md` | PASS |
| Preview | `social/previews/ac-30-08-instagram-post-estatico.html` | PASS |
| Export | `social/publish/ac-30-08/ac-30-08-01.png` | PASS |
| Dimension | `file`: PNG image data, 1080 x 1350 | PASS |
| Copy | pt-BR com acentos; sem trecho estrangeiro | PASS |
| Queue | Agendado para 2026-05-12 18:30 BRT | PASS |

## Decision

AC-30-08 pode permanecer em fila (`queued`) para a janela programada. Não promover para `published` antes da execução do conector.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Pipeline Auditor | pipeline-compliance-audit | `skills/pipeline-compliance-audit/SKILL.md` | AC-30-08 | Auditoria de VDC, RCC, review, preview, export e fila | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-08 | Confirmação de imagem full-canvas e dimensão final | invoked |
