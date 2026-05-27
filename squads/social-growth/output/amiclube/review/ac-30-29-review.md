# Review — AC-30-29

## Asset Overview

| Campo | Valor |
|-------|-------|
| Asset ID | AC-30-29 |
| Canal | Instagram feed (post único) |
| Blog Parent | AC-30-13B |
| Status | Em revisão |

## Pipeline Route

- **Route:** blog_derived_social
- **Gates applied:** visual-production-gate + skill-invocation-gate

## Quality Score

| Critério | Score | Justificativa |
|----------|-------|---------------|
| Clareza da proposta | 10/10 | Pergunta curta e fácil de ler no feed |
| Clareza visual | 10/10 | Hierarquia simples e imagem forte |
| Prova (imagem) | 9/10 | Hero da campanha em full-bleed |
| Fechamento (CTA) | 10/10 | CTA curto e escaneável |
| Anti-repetição | 10/10 | Nova composição para feed, diferente do Stories |
| pt-BR Acentuação | 10/10 | Textos com acentuação correta |
| **TOTAL** | **59/60 (98.3%)** | |

## Decision

| Decisão | Status |
|---------|--------|
| **APPROVE** | ✅ Publicar |

## Visual Direction Validation

| Elemento | Status | Evidência |
|----------|--------|-----------|
| Imagem-base | ✅ | Hero da campanha aplicada |
| Estilo | ✅ | Premium Editorial / Dark Premium no envelope |
| Paleta | ✅ | Preto quente, terracota e bege claro |
| First Impression | ✅ | Capa nova para o feed |
| Legibilidade | ✅ | Texto curto e contraste alto |

## Render Validation

| Elemento | Status |
|----------|--------|
| Preview HTML | ✅ Gerado em `previews/ac-30-29-premium-editorial-single-post.html` |
| PNG | ✅ 1 frame em `publish/ac-30-29-post/` |
| Caption | ✅ Em `social-final-captions.json` (AC-30-29) |

## Skill Invocation Ledger

| Skill | Evocado | Evidência |
|-------|---------|-----------|
| reviewer-gate | ✅ | Revisão independente do AC-30-29 |
| social-single-post | ✅ | Preview e export do post único |
| premium-editorial | ✅ | Preset validado na direção visual |

## Metadata

- **Review Version:** 2.0.0
- **Reviewed:** 2026-05-16
- **Reviewer:** Reviewer
- **Next:** Pipeline Auditor → Campaign Hub update
