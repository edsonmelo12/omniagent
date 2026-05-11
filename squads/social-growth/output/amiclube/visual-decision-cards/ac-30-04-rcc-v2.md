# Render Compliance Card — AC-30-04

## Veredito

**PASS — published**

## Render Evidence

| Gate | Evidência | Status |
|------|-----------|--------|
| VDC | `visual-decision-cards/ac-30-04-vdc-v2.md` | PASS |
| Preview HTML | `social/previews/ac-30-04-facebook-authority.html` | PASS |
| Export final | `social/publish/ac-30-04/ac-30-04-01.png` | PASS |
| Dimensão | `file` confirmou 1200x630 | PASS |
| Gate verification | `review/gate-verification-ac-30-04-v2.md` | PASS |
| Published | `published_post_id` e URL Facebook confirmados | PASS |
| pt-BR | Acentos e CTA em português | PASS |

## Observação

Post Facebook já publicado com ID `1285514783692438` e URL confirmada. PNG em dimensão correta (1200x630).

## Skill Invocation Ledger

| Agent | Skill/Contrato | Source File | Applied To | Concrete Use | Status |
|-------|----------------|-------------|------------|--------------|--------|
| Creative Renderer | social-single-post | `skills/social-single-post/SKILL.md` | AC-30-04 HTML/PNG | Render de Facebook post 1.91:1 | invoked |
| Pipeline Auditor | visual-production-gate | `pipeline/data/visual-production-gate.md` | AC-30-04 | Conferência de dimensão, CTA e pt-BR | invoked |
