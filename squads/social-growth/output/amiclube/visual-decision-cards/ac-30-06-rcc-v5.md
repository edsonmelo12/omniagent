# Render Compliance Card — AC-30-06 v5

## Veredito

**PASS — ready for queued publication**

## Render Evidence

| Gate | Evidência | Status |
|------|-----------|--------|
| VDC | `visual-decision-cards/ac-30-06-vdc-v5.md` | PASS |
| Preview HTML | `social/previews/ac-30-06-v5.html` | PASS |
| Export final | `social/publish/ac-30-06/ac-30-06-01.png` a `ac-30-06-07.png` | PASS |
| Dimensão | `file` confirmou 1080x1350 em todos os slides | PASS |
| Skill compliance | instagram-carousel skill seguida rigorosamente | PASS |
| Base64 images | Hero image embedded as data: URI | PASS |
| Progress bar | Present in all slides, correct fill | PASS |
| Swipe arrows | Present in slides 1-6, absent in 7 | PASS |
| pt-BR | Acentos e CTA em português | PASS |

## Observação

HTML gerado via Python (conforme exigido pela skill) com imagem como base64 data: URI. Estrutura segue exatamente a Standard 7-slide sequence da skill instagram-carousel.

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Creative Renderer | instagram-carousel | `skills/instagram-carousel/SKILL.md` | AC-30-06 v5 HTML/PNG | Gerou HTML com base64, 7 slides, progress bar, swipe arrows | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-06 v5 | Conferência de dimensão, CTA, link e skill compliance | invoked |
