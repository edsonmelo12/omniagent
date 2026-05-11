# Pipeline Incident Trace — AC-30-17 — brief-mismatch

## Verdict
MITIGATED

## Incident Summary
- Client: AmiClube
- Asset(s): AC-30-17
- Defect: Preview v1 continha temas genéricos (Acabamento, Propósito, Confiança, Cuidado, Coerência) ao invés dos 5 sinais do brief (Densidade Constante, Fio Mercerizado, Junções Perfeitas, Trava Interna, Base Estruturada)
- Severity: P0_INVALID
- Detected by: Pipeline Auditor (pós-aprovação)
- Detected at: 2026-05-02
- Current status: Corrigido em v3

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|
| Criação do v1 | Creative Renderer | `ac-30-17-carousel.html` | Gerou 5 slides com temas genéricos em vez dos 5 sinais específicos do brief |
| Aprovação inicial | Reviewer | Status `Preview pronto (aprovado)` | Não comparou conteúdo slide-a-slide com o brief |
| Criação do v2 | Creative Renderer | `ac-30-17-carousel-v2.html` | Conteúdo corrigido com os 5 sinais, mas nunca foi promovido a canônico |
| Auditoria | Pipeline Auditor | Gate audit AC-30-17 | Detectou brief_mismatch + link canônico errado |
| Correção v3 | Auditor | `ac-30-17-carousel-v3.html` | Fix alignment, CTA, pills, progress export, regenerou PNGs |

## Where It Originated
- Stage: Creative Renderer (geração do preview HTML)
- Owner/Agent: Creative Renderer
- Evidence: V1 slides com kickers "1. Acabamento", "2. Propósito" vs brief exigindo "01 Densidade Constante", "02 Fio Mercerizado"
- Origin explanation: Renderer não mapeou os 5 itens específicos do `Visual Brief` para os slides. Inventou temas próprios ao invés de seguir o brief literalmente.

## Why It Passed
- Missed gate: Nenhum gate verificava conteúdo slide-a-slide contra o brief
- False positive: Reviewer aprovou porque estrutura visual (7 slides, dark premium, chips) parecia correta, mas conteúdo estava errado
- Missing evidence: Não existia checklist de "cada slide corresponde ao item do brief"
- Reviewer/Auditor gap: Foco em estética e formato, não em fidelidade ao conteúdo do brief

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|
| `brief_mismatch` | V1 temas ≠ brief sinais | Renderer ignorou lista específica do brief e criou conteúdo genérico |
| `visual_audit_gap` | Reviewer aprovou sem comparação | Verificação superficial — conferiu formato, não conteúdo |
| `approval_gate_gap` | Sem gate de brief fidelity | Não existia requisito de validar slide vs item do brief |
| `manifest_drift` | V2 criado mas não canônico | Correção parcial sem atualização de hub/manifest |

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|
| `previews/ac-30-17-carousel-v3.html` | Novo arquivo com conteúdo correto + alignment fix + CTA | ✅ Criado |
| `campaign-manifest.json` | canonicalPreviewPath → v3, slug → v3, status → preview_ready | ✅ Corrigido |
| `campaign-hub.html` | Preview button → v3 | ✅ Corrigido |
| `drafts/ac-30-17.md` | article_url preenchido, version → v3 | ✅ Corrigido |
| `publish/ac-30-17/` | 7 PNGs regenerados do v3 a 1080×1350 | ✅ Regenerado |

## New Or Updated Rule
- Rule file: `social-export-rules.md` (já existente)
- Rule summary: Conteúdo de carrossel deve corresponder item-a-item ao brief
- Blocking condition added: Slide conteúdo diverge do brief → **BLOCK**

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|
| Brief fidelity gate | Creative Renderer | `creative-renderer.agent.md` process step | ✅ Adicionado |
| Slide-to-brief verification | Reviewer | `reviewer.agent.md` quality criteria | ✅ Adicionado |
| Manifest consistency check | Pipeline Auditor | `pipeline-auditor.agent.md` veto | ✅ Adicionado |

## Recurrence Check
- Similar prior incidents: AC-30-04 (missing CTA), AC-30-02/03 (wrong images)
- Search/evidence: Padrão recorrente de conteúdo visual divergir do brief
- Residual risk: Médio — múltiplos assets anteriores podem ter o mesmo problema

## Learning
- What the squad learned: Brief com lista numerada de itens deve ser traduzido literalmente em slides correspondentes
- What future agents must do: Ao gerar carrossel com itens numerados no brief, criar 1 slide por item com título e descrição exatos

## Closure Criteria
- [x] Defect corrected in final-facing artifact
- [x] Hub/manifest/draft/preview consistency verified
- [x] Rule/checklist updated or explicit reason not needed
- [x] Mitigation has an owner and enforcement point
- [x] Related audit report references this incident trace
- [x] User-facing final copy remains pt-BR compliant
