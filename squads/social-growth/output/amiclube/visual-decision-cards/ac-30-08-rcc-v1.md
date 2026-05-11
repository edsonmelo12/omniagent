# Render Compliance Card — AC-30-08 v1

## Veredito

**PASS — ready for queued publication**

## Render Evidence

| Gate | Evidência | Status |
|------|-----------|--------|
| VDC | `visual-decision-cards/ac-30-08-vdc-v1.md` | PASS |
| Preview HTML | `social/previews/ac-30-08-instagram-post-estatico.html` | PASS |
| Export final | `social/publish/ac-30-08/ac-30-08-01.png` | PASS |
| Dimensão | `file` confirmou 1080x1350 | PASS |
| Texto pt-BR | Acentos e CTA em pt-BR verificados | PASS |
| Imagem | Hero do blog AC-30-05 em full canvas, sem miniatura duplicada | PASS |

## Correção Aplicada

O PNG anterior tinha dimensão nominal 1080x1350, mas continha o card pequeno centralizado em área escura. O arquivo foi reexportado capturando apenas `.frame`, resultando em arte final full-canvas 1080x1350.

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|-------|-------|-------------|------------|--------------|--------|
| Creative Renderer | social-single-post | `skills/social-single-post/SKILL.md` | AC-30-08 HTML/PNG | Render de post estático 4:5 | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-08 | Conferência de imagem, dimensão, pt-BR e export final | invoked |
