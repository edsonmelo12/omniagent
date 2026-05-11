# Pipeline Incident Trace — AC-30-04 — vertical-alignment-and-aspect-ratio

## Verdict
MITIGATED

## Incident Summary
- Client: AmiClube
- Asset(s): AC-30-04
- Defect: Conteúdo sem centralização vertical; LinkedIn aspect ratio incorreto (1200/627 vs 1200/630); draft article_url null
- Severity: P1_BLOCKING
- Detected by: Auditor (pós-aprovação)
- Detected at: 2026-05-02
- Current status: Corrigido em v2

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|
| Criação do preview | Creative Renderer | HTML gerado | `.card-container` criado sem `justify-content: center`; aspect ratio LinkedIn errado |
| Aprovação inicial | Reviewer | Status `preview_ready` | Gate de alinhamento vertical não existia ainda; defeito não detectado |
| Auditoria pós-aprovação | Pipeline Auditor | `gate-verification-ac-30-04-v2.md` | Defeitos identificados; correções aplicadas |
| Correção v2 | Auditor | Edits nos HTMLs e draft | Centralização adicionada; aspect ratio corrigido; article_url preenchido |

## Where It Originated
- Stage: Creative Renderer (geração do preview HTML)
- Owner/Agent: Creative Renderer
- Evidence: `.card-container` sem `justify-content: center` em ambos os previews
- Origin explanation: Regra de alinhamento vertical não existia quando AC-30-04 foi criado; renderer seguiu padrão flex sem centralização

## Why It Passed
- Missed gate: Gate de alinhamento vertical não existia na auditoria original
- False positive: Asset foi marcado `preview_ready` sem verificação visual de centralização
- Missing evidence: Screenshot de exportação não foi comparado com regra de centro vertical
- Reviewer/Auditor gap: Regra blocking foi criada após AC-30-02/03; AC-30-04 não foi revalidado

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|
| `layout_rule_missing` | Regra criada após aprovação de AC-30-04 | Alinhamento vertical não era gate na criação original |
| `implementation_bug` | `aspect-ratio: 1200/627` no LinkedIn | Valor digitado errado no CSS |
| `manifest_drift` | Draft `article_url: null` vs manifest com URL | Draft não foi atualizado com URL do artigo-pai |
| `approval_gate_gap` | Status `preview_ready` sem gate de alinhamento | Asset aprovado sem verificação da regra nova |

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|
| `previews/ac-30-04-linkedin-authority.html` | `justify-content: center` + `margin-top: auto` nos chips + aspect ratio `1200/630` | ✅ Corrigido |
| `previews/ac-30-04-facebook-authority.html` | `justify-content: center` + `margin-top: auto` nos chips | ✅ Corrigido |
| `drafts/ac-30-04.md` | `article_url` preenchido com URL do artigo | ✅ Corrigido |

## New Or Updated Rule
- Rule file: `social-export-rules.md`
- Rule summary: Alinhamento vertical centralizado é BLOCKING para todos os frames/slides
- Blocking condition added: `justify-content: flex-start` ou `space-between` no container principal → BLOCK

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|
| Gate de alinhamento vertical obrigatório | Pipeline Auditor | `gate-verification-*.md` | ✅ Ativo |
| Verificação de aspect ratio vs brief | Pipeline Auditor | Gate G4 | ✅ Ativo |
| Consistência draft/manifest article_url | Pipeline Auditor | Gate G7 | ✅ Ativo |

## Recurrence Check
- Similar prior incidents: AC-30-03 (vertical alignment), AC-30-02 (alignment)
- Search/evidence: `incident-trace-ac-30-03-vertical-alignment.md` existe; mesma causa raiz
- Residual risk: Médio — regra existe mas precisa ser aplicada preventivamente em assets novos

## Learning
- What the squad learned: Regras blocking criadas após aprovação de assets devem trigger revalidação de todos os assets do mesmo tipo
- What future agents must do: Ao criar nova regra blocking, rodar revalidação em todos os previews existentes do mesmo cliente

## Closure Criteria
- [x] Defect corrected in final-facing artifact
- [x] Hub/manifest/draft/preview consistency verified
- [x] Rule/checklist updated or explicit reason not needed
- [x] Mitigation has an owner and enforcement point
- [x] Related audit report references this incident trace
- [x] User-facing final copy remains pt-BR compliant
