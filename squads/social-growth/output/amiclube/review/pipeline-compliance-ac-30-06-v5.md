# Pipeline Compliance Report — AC-30-06 v5

## Veredito

**PASS — ready for queued publication**

## Evidence Table

| Gate | Evidence | Status |
|------|----------|--------|
| Visual Decision Card | `visual-decision-cards/ac-30-06-vdc-v5.md` | PASS |
| Render Compliance Card | `visual-decision-cards/ac-30-06-rcc-v5.md` | PASS |
| Review | `review/ac-30-06-v5-review.md` | PASS |
| Preview HTML | `social/previews/ac-30-06-v5.html` | PASS |
| Export | `social/publish/ac-30-06/ac-30-06-01.png` a `ac-30-06-07.png` | PASS |
| Dimension | `file`: PNG image data, 1080 x 1350 (all slides) | PASS |
| Queue | Agendado para 2026-05-10 18:30 BRT | PASS |
| Skill Compliance | instagram-carousel skill followed exactly | PASS |
| Base64 Images | Hero image embedded as data: URI | PASS |

## Decision

AC-30-06 foi regenerado do zero seguindo rigorosamente a skill instagram-carousel. Pode permanecer em fila (`queued`) para execução do conector. Não promover para `published` antes da publicação real.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Pipeline Auditor | pipeline-compliance-audit | `skills/pipeline-compliance-audit/SKILL.md` | AC-30-06 v5 | Auditoria de VDC, RCC, review, preview, export e fila | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-06 v5 | Confirmação de dimensão final, CTA e skill compliance | invoked |
| Visual Director | instagram-carousel | `skills/instagram-carousel/SKILL.md` | AC-30-06 v5 | Geração de HTML com base64, 7 slides, progress bar, swipe arrows | invoked |
| Visual Director | social-visual-system | `skills/social-visual-system/SKILL.md` | AC-30-06 v5 | Definição de sistema visual, cores, tipografia | invoked |
