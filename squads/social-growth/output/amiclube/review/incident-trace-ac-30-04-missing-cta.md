# Pipeline Incident Trace — AC-30-04 — missing-cta

## Verdict
MITIGATED

## Incident Summary
- Client: AmiClube
- Asset(s): AC-30-04
- Defect: CTA "Artigo completo" ausente no card visual, apesar do brief exigir `Article Link Requirement`
- Severity: P1_BLOCKING
- Detected by: Usuário (pós-aprovação)
- Detected at: 2026-05-02
- Current status: Corrigido em v2.1

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|
| Criação do preview | Creative Renderer | HTML gerado sem CTA | Renderer ignorou `Article Link Requirement` do brief |
| Aprovação inicial | Reviewer | Status `preview_ready` | Não verificou presença de CTA no card |
| Auditoria v2 | Pipeline Auditor | `gate-verification-ac-30-04-v2.md` | CTA não foi auditado — regra não existia |
| Feedback do usuário | User | "Confirme se o CTA destacado sugere visitar o artigo" | Defeito identificado |
| Correção v2.1 | Creative Renderer | Botão "Artigo completo →" adicionado | CTA inserido com URL real do artigo |

## Where It Originated
- Stage: Creative Renderer (geração do preview HTML)
- Owner/Agent: Creative Renderer
- Evidence: `ac-30-04-facebook-authority.html` original sem elemento `.cta`
- Origin explanation: Renderer seguiu o visual brief (chips, headline, footer) mas não interpretou `Article Link Requirement` como obrigação de gerar botão visual no card

## Why It Passed
- Missed gate: Nenhum gate verificava CTA visual em posts derivados de artigo
- False positive: Asset foi aprovado porque caption continha "Leia o artigo completo aqui: [URL DO ARTIGO]" — mas isso é texto, não CTA visual
- Missing evidence: Não existia checklist de "CTA presente no card"
- Reviewer/Auditor gap: Ambos focaram em alinhamento, aspect ratio e export rules, mas não em CTA visual

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|
| `brief_mismatch` | Brief tem `Article Link Requirement`, card não tem CTA | Renderer não mapeou requirement para ação visual |
| `layout_rule_missing` | Regra de CTA obrigatório não existia em `social-export-rules.md` | Sem regra blocking, sem verificação |
| `approval_gate_gap` | Reviewer aprovou sem verificar CTA | Critério não estava no quality checklist |
| `visual_audit_gap` | Auditor não incluiu CTA no gate audit | Foco em alinhamento/export, não em conversão |

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|
| `previews/ac-30-04-facebook-authority.html` | Botão `<a class="cta">Artigo completo →</a>` adicionado | ✅ Corrigido |
| `previews/ac-30-04-linkedin-authority.html` | Mesmo CTA adicionado | ✅ Corrigido |
| `social-export-rules.md` | Regra "CTA Obrigatório" adicionada como BLOCKING | ✅ Adicionado |
| `reviewer.agent.md` | Quality criteria atualizado com verificação de CTA | ✅ Adicionado |
| `pipeline-auditor.agent.md` | Veto conditions atualizados (items 17-18) | ✅ Adicionado |
| `creative-renderer.agent.md` | Process step 15 + anti-pattern 10 + quality criteria | ✅ Adicionado |

## New Or Updated Rule
- Rule file: `social-export-rules.md`
- Rule summary: CTA visual obrigatório em posts derivados de artigo com `Article Link Requirement`
- Blocking condition added: Brief exige link mas card não tem CTA visível → **BLOCK**

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|
| Regra de CTA obrigatório na skill | Creative Renderer | `social-export-rules.md` + `creative-renderer.agent.md` | ✅ Ativo |
| Verificação de CTA no review | Reviewer | `reviewer.agent.md` quality criteria | ✅ Ativo |
| Veto de auditoria para CTA ausente | Pipeline Auditor | `pipeline-auditor.agent.md` veto conditions | ✅ Ativo |

## Recurrence Check
- Similar prior incidents: Nenhum registrado especificamente para CTA ausente
- Search/evidence: Busca em `incident-trace-*` anteriores — nenhum com `missing_cta`
- Residual risk: Baixo — regra agora está em 4 arquivos diferentes (skill + 3 agents)

## Learning
- What the squad learned: `Article Link Requirement` no brief deve ser mapeado para CTA visual no card, não apenas texto no caption
- What future agents must do: Ao ler brief com `Article Link Requirement`, gerar botão/link clicável no HTML do preview com URL real do artigo

## Closure Criteria
- [x] Defect corrected in final-facing artifact
- [x] Hub/manifest/draft/preview consistency verified
- [x] Rule/checklist updated or explicit reason not needed
- [x] Mitigation has an owner and enforcement point
- [x] Related audit report references this incident trace
- [x] User-facing final copy remains pt-BR compliant
