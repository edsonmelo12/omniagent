# Pipeline Incident Trace — AC-30-06 — no-images

## Verdict
CLOSED

## Incident Summary
- Client: AmiClube
- Asset(s): AC-30-06 (Instagram Carrossel — Mitos e Verdades sobre preço)
- Defect: Ativo sem imagens de fundo, apesar de ser derivado do blog AC-30-05 que possui imagem hero (`AC-30-05-preco-valor-hero.jpg`)
- Severity: P1_BLOCKING
- Detected by: Edson (usuário), após aprovação
- Detected at: 2026-05-03
- Current status: Corrigido — HTML preview v4 com background-image e PNGs finais v4 em 1080x1350

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|
| Brief / Context | Intake / Strategist | `blog-social-alignment.json` | Asset vinculado ao blog AC-30-05 (Preço, valor e o que avaliar antes de comprar) |
| Visual Direction | Visual Director | **Ausência de VDC** | Nenhum Visual Decision Card criado para AC-30-06 |
| Renderização | Creative Renderer | `ac-30-06-instagram-carrossel-v3.html` | Renderizou 7 slides com texturas puras (light/dark/gradient + noise svg), sem aplicar `background-image` |
| Revisão | Reviewer | **Ausência de RCC e Review** | Nenhum Render Compliance Card; reviewer aprovou sem verificar Image Decision |
| Export | Creative Renderer | `social/publish/ac-30-06/*.png` | 7 PNGs exportados em 1080x1350, slides sem imagens |
| Campanha | Scheduler / Hub | `campaign-manifest.json`, `campaign-hub.html` | Preview aponta para v3, status `preview_ready`, agendado para 05/05 |

## Where It Originated
- Stage: Visual Director (falha em criar VDC) + Creative Renderer (falha em aplicar imagem)
- Owner/Agent: Visual Director, Creative Renderer
- Evidence: Sem VDC; HTML v3 não contém `background-image: url(...)` para imagem do blog; texturas puras aplicadas
- Origin explanation: O Visual Director não declarou `Background Image Decision` nem justificativa `texture-only`/`no-image-justified`. O Creative Renderer seguiu texturas puras sem questionar. A regra de consultar `output/amiclube/blog/assets/` não foi aplicada.

## Why It Passed
- Missed gate: Visual Production Gate — Stage 1 (Visual Decision Card ausente), Stage 2 (Render Compliance Card ausente)
- False positive: Reviewer aprovou com base em estética visual (tipografia, cores, progressão) e não verificou Image Decision ou conformidade com blog pai
- Missing evidence: Sem VDC, sem RCC, sem declaração de `Background Image Decision`, sem evidência de consulta ao catálogo de imagens do blog
- Reviewer/Auditor gap: Foco em layout e tipografia, não em conformidade de imagem obrigatória para ativos derivados de blog

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|
| `source_asset_mismatch` | HTML sem `background-image`; blog AC-30-05 possui `AC-30-05-preco-valor-hero.jpg` | Imagem disponível no catálogo não foi usada sem justificativa |
| `visual_audit_gap` | Sem VDC/RCC | Visual Director e Reviewer não aplicaram Image Decision Rules |
| `approval_gate_gap` | Sem VDC/RCC nos registros | Gate de aprovação não exigiu evidência de decisão de imagem |
| `layout_rule_missing` | Regra de consulta a `blog/assets/` não foi aplicada | Visual Production Gate — Image Decision Rules violados |

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|
| `visual-decision-cards/ac-30-06-vdc-v4.md` | Criar VDC com `Background Image Decision: background-image`, source `AC-30-05-preco-valor-hero.jpg` | ✅ Completo |
| `visual-decision-cards/ac-30-06-rcc-v4.md` | Criar RCC com `Background Decision Implemented: background-image` | ✅ Completo |
| `social/previews/ac-30-06-instagram-carrossel-v4.html` | Atualizar slides com `background-image: url('...AC-30-05-preco-valor-hero.jpg')` | ✅ Completo |
| `social/publish/ac-30-06-v4/*.png` | PNGs finais v4 confirmados em 1080x1350 | ✅ Completo |
| `campaign-manifest.json` | Atualizado canonicalPreviewPath para v4 | ✅ Completo |

## New Or Updated Rule
- Rule file: `visual-production-gate.md` (já existe)
- Rule summary: Blog-derived assets MUST declare `Background Image Decision` and justify if not using available blog imagery
- Blocking condition added: `source_asset_mismatch` → **BLOCKED** when blog image exists and not used without written justification

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|
| Exigir VDC completo com Image Decision para todo ativo social | Visual Director | `step-03b-create-visual-direction.md` | ❌ Pendente |
| Exigir RCC com verificação de imagem blog | Creative Renderer | `step-03c-render-creative.md` | ❌ Pendente |
| Adicionar checklist de Image Decision ao Reviewer | Reviewer | `step-04-review-content.md` | ❌ Pendente |
| Validar `background-image` no preview HTML via script | Pipeline Auditor | `verify-html-png-sync.mjs` | ❌ Pendente |

## Recurrence Check
- Similar prior incidents: AC-30-21 (mesmo defeito, imagens não usadas), AC-30-17 (brief mismatch)
- Search/evidence: AC-30-21 também sem imagens; AC-30-17 teve VDC criado após incidente
- Residual risk: Alto — se Visual Director não estiver obrigado a preencher Image Decision, novos ativos serão gerados sem imagens

## Learning
- What the squad learned: Ativos derivados de blog devem seguir `Image Decision Rules` obrigatoriamente; estética sem conformidade é insuficiente
- What future agents must do differently: Visual Director deve preencher `Background Image Decision` com source path antes de renderizar; Reviewer deve bloquear sem VDC/RCC

## Closure Criteria
- [x] Defect corrected in final-facing artifact (preview HTML com imagem)
- [x] Hub/manifest/draft/preview consistency verified
- [x] Rule/checklist updated or explicit reason not needed
- [x] Mitigation has an owner and enforcement point
- [x] Related audit report references this incident trace
- [x] User-facing final copy remains pt-BR compliant

## Post-Review Update (2026-05-03)
- Review verdict: **APPROVED**
- PNGs finais v4 confirmados em 1080x1350
- HTML preview verified: all 7 slides have correct background images
- VDC and RCC complete with Skill Invocation Ledger
- Status: CLOSED
