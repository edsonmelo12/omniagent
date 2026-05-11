# Pipeline Incident Trace — AC-30-17 — missing-cta-last-slide

## Verdict
MITIGATED

## Incident Summary
- Client: AmiClube
- Asset(s): AC-30-17
- Defect: Slide 7 não continha CTA "link na bio" conforme exigido pelo `Article Link Requirement` do brief
- Severity: P1_BLOCKING
- Detected by: Pipeline Auditor (pós-aprovação)
- Detected at: 2026-05-02
- Current status: Corrigido em v3

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|
| Criação v1/v2 | Creative Renderer | HTMLs sem CTA link na bio | Slide 7 tinha apenas "salvar checklist" |
| Brief | Content Repurposer | `Article Link Requirement` no draft | Exigia "Quer saber mais? O link está na bio" |
| Aprovação | Reviewer | Status aprovado | Não verificou CTA no último slide |
| Correção v3 | Auditor | `ac-30-17-carousel-v3.html` | CTA "link na bio" adicionado |

## Where It Originated
- Stage: Creative Renderer
- Owner/Agent: Creative Renderer
- Evidence: Brief com `Article Link Requirement` presente, slide 7 sem menção ao link na bio
- Origin explanation: Renderer focou no CTA de engajamento ("salvar checklist", "enviar curadoria") mas ignorou o CTA de conversão para o artigo

## Why It Passed
- Missed gate: CTA Rule (BLOCKING) recém-criada após AC-30-04 não foi aplicada retroativamente
- False positive: Slide 7 tinha CTA de engajamento, mas não o CTA de link para artigo
- Missing evidence: Checklist não incluía "último slide de carrossel derivado de artigo deve ter link na bio"
- Reviewer/Auditor gap: Mesma falha sistêmica do AC-30-04

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|
| `brief_mismatch` | Brief exige "link na bio" no último slide | Renderer não implementou |
| `approval_gate_gap` | CTA Rule criada após AC-30-04 | Não aplicada a assets anteriores |
| `recurrence_control_gap` | Mesmo padrão do AC-30-04 | Mitigação não previniu recorrência em outros assets |

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|
| `previews/ac-30-17-carousel-v3.html` | CTA group com "enviar curadoria" + "Quer saber mais? O link está na bio" | ✅ Corrigido |
| `social-export-rules.md` | Regra CTA Obrigatório já existente | ✅ Referência |

## New Or Updated Rule
- Rule file: CTA Rule existente em `social-export-rules.md`
- Rule summary: Aplicada retroativamente a todos os carrosséis derivados de artigo
- Blocking condition added: Carrossel derivado de artigo sem CTA link no último slide → **BLOCK**

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|
| CTA Rule retroativa | Pipeline Auditor | Audit todos os assets derivados de artigo | ✅ Em execução |
| Brief-to-slide mapping | Creative Renderer | Process step 15 | ✅ Adicionado |

## Recurrence Check
- Similar prior incidents: AC-30-04 (missing CTA no card)
- Search/evidence: `incident-trace-ac-30-04-missing-cta.md` — mesma causa raiz
- Residual risk: Baixo — regra agora aplicada retroativamente

## Learning
- What the squad learned: CTA Rule criada para um asset deve ser aplicada a TODOS os assets existentes do mesmo tipo
- What future agents must do: Ao criar nova regra blocking, rodar revalidação em todos os assets existentes do cliente

## Closure Criteria
- [x] Defect corrected in final-facing artifact
- [x] Hub/manifest/draft/preview consistency verified
- [x] Rule/checklist updated or explicit reason not needed
- [x] Mitigation has an owner and enforcement point
- [x] Related audit report references this incident trace
- [x] User-facing final copy remains pt-BR compliant
