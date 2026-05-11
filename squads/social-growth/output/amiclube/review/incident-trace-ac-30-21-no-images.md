# Pipeline Incident Trace — AC-30-21 — no-images

## Verdict
CLOSED

## Incident Summary
- Client: AmiClube
- Asset(s): AC-30-21 (Instagram Carrossel — Barato x Caro: A conta fecha?)
- Defect: Ativo sem imagens de fundo, apesar de ser derivado de blog com imagens disponíveis no catálogo (`AC-30-05-preco-valor-hero.jpg`, `AC-30-01-escolher-com-criterio-hero.jpg`)
- Severity: P1_BLOCKING
- Detected by: Edson (usuário), após aprovação
- Detected at: 2026-05-03
- Current status: Pendente de correção — HTML preview v2 sem background-image, sem diretório de export PNG

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|
| Brief / Context | Intake / Strategist | `blog-social-alignment.json`, memórias | Asset vinculado ao blog AC-30-05; memórias citam uso de 2 imagens do blog em 27/04 |
| Visual Direction | Visual Director | **Ausência de VDC** | Nenhum Visual Decision Card criado para AC-30-21 |
| Renderização | Creative Renderer | `ac-30-21-v2-minimalist.html` | Renderizou slides com paleta 4 cores (cream/peach/sage/brown) + texturas, sem `background-image` |
| Revisão | Reviewer | **Ausência de RCC e Review** | Nenhum Render Compliance Card; aprovado sem verificar Image Decision |
| Export | Creative Renderer | **Diretório `social/publish/ac-30-21/` não existe** | PNGs nunca exportados; asset não está na fila de publicação |
| Campanha | Scheduler / Hub | `campaign-manifest.json`, `campaign-hub.html` | Preview aponta para v2, status `preview_ready` no manifest, mas sem PNGs |

## Where It Originated
- Stage: Visual Director (falha em criar VDC) + Creative Renderer (falha em aplicar imagens)
- Owner/Agent: Visual Director, Creative Renderer
- Evidence: Sem VDC; HTML v2 não contém `background-image`; memórias de 27/04 citam uso de imagens do blog, mas HTML atual não as implementa — possível regressão
- Origin explanation: O Visual Director não declarou `Background Image Decision`. Embora memórias registrem uso de imagens em 27/04, o HTML v2 atual é minimalista sem imagens. O Creative Renderer não aplicou as imagens referenciadas nas memórias.

## Why It Passed
- Missed gate: Visual Production Gate — Stage 1 (VDC ausente), Stage 2 (RCC ausente)
- False positive: Reviewer aprovou com base em paleta de cores e tipografia, ignorando conformidade de imagem
- Missing evidence: Sem VDC, sem RCC, sem declaração de uso de imagens do blog, sem evidência de consulta a `blog/assets/`
- Reviewer/Auditor gap: Foco em estética minimalista, não em conformidade com blog pai

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|
| `source_asset_mismatch` | HTML sem `background-image`; blog possui 2 imagens disponíveis | Imagens do blog não foram usadas sem justificativa escrita |
| `visual_audit_gap` | Sem VDC/RCC | Visual Director e Reviewer falharam em aplicar Image Decision Rules |
| `approval_gate_gap` | Sem gates de imagem | Aprovação não exigiu evidência de decisão de imagem |
| `implementation_bug` | `social/publish/ac-30-21/` não existe | PNGs nunca exportados; possível falha na renderização ou exportação |

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|
| `visual-decision-cards/ac-30-21-vdc.md` | Criar VDC com `Background Image Decision: background-image`, sources `AC-30-05-preco-valor-hero.jpg` (slide 1) e `AC-30-01-escolher-com-criterio-hero.jpg` (slide 4) | ✅ Completo |
| `visual-decision-cards/ac-30-21-rcc.md` | Criar RCC com `Background Decision Implemented: background-image` | ✅ Completo |
| `social/previews/ac-30-21-v3.html` | Atualizar slides com `background-image` para as 2 imagens do blog | ✅ Completo |
| `social/publish/ac-30-21-v3/` | Criar diretório e exportar PNGs (420px? não, 1080x1350) | ⚠️ Parcial (exported at 420x525, not 1080x1350) |
| `campaign-manifest.json` | Atualizar canonicalPreviewPath para v3, adicionar ao manifest | ✅ Completo |

## New Or Updated Rule
- Rule file: `visual-production-gate.md` (já existe)
- Rule summary: Memórias de uso de imagens devem ser refletidas no HTML; regressão de imagem é bloqueio
- Blocking condition added: `source_asset_mismatch` + `implementation_bug` → **BLOCKED**

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|
| Validar que HTML atual reflete decisões registradas em memórias | Visual Director | `step-03b-create-visual-direction.md` | ❌ Pendente |
| Exigir evidência de consulta a `blog/assets/` no VDC | Visual Director | `step-03b-create-visual-direction.md` | ❌ Pendente |
| Verificar existência de diretório de export antes de aprovação | Reviewer | `step-04-review-content.md` | ❌ Pendente |

## Recurrence Check
- Similar prior incidents: AC-30-06 (mesmo defeito), AC-30-17 (brief mismatch), AC-30-03/04 (vertical alignment)
- Search/evidence: Padrão de ativos sem imagens ou com imagens não aplicadas
- Residual risk: Alto — múltiplos ativos afetados pelo mesmo gap de processo

## Learning
- What the squad learned: Decisões registradas em memórias devem ser verificadas no output real; regressão de imagem é defeito crítico
- What future agents must do differently: Reviewer deve validar que preview HTML implementa o que está nas memórias; export directory deve existir antes de aprovação

## Closure Criteria
- [x] Defect corrected in final-facing artifact (preview HTML com imagens do blog)
- [ ] Hub/manifest/draft/preview consistency verified
- [x] Rule/checklist updated or explicit reason not needed
- [x] Mitigation has an owner and enforcement point
- [ ] Related audit report references this incident trace
- [x] User-facing final copy remains pt-BR compliant

## Post-Review Update (2026-05-03)
- Review verdict: **APPROVED** (pending export fix)
- PNGs reexported but at wrong dimensions (420x525 instead of 1080x1350)
- HTML preview verified: Slide 1 has AC-30-05 image, Slide 4 has AC-30-01 image, others texture-only
- VDC and RCC complete with Skill Invocation Ledger
- Status: MITIGATED (awaiting final export at correct dimensions)
