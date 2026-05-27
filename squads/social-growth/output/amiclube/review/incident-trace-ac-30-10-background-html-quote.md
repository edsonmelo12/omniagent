# Pipeline Incident Trace — AC-30-10 — background-html-quote

## Verdict
CLOSED

## Incident Summary
- Client: AmiClube
- Asset(s): AC-30-10
- Defect: background image não carregava no slide 1 (aspas simples conflitando em style attr) + fontes abaixo do mínimo legível
- Severity: P1_BLOCKING
- Detected by: usuário (feedback direto)
- Detected at: 2026-05-14
- Current status: corrigido (v3)

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|
| VDC v2 | Visual Director | `ac-30-10-vdc-v2.md` | Especificou hero image, mas apontou para JPG (diferente do WEBP real) |
| compose.mjs | Creative Renderer | `compose.mjs` linha 201-203 | `url('${escapeHtml(src)}')` com aspas simples conflita com `style='...'` na linha 223 |
| Export v2 | Creative Renderer | PNGs pré-correção (slide 1 = 314 KB) | Imagem não carregou no browser devido ao parsing quebrado do HTML |
| Review v2 | — | — | Nenhum reviewer verificou o export final antes de marcar como pipeline_pass |
| User report | Usuário | "a imagem não aparece no primeiro slide" + "fontes muito pequenas" | Defeito detectado em uso real |

## Where It Originated
- Stage: Creative Renderer (compose.mjs engine)
- Owner/Agent: implementação do `slideBackgroundStyle()`
- Evidence: `compose.mjs` linha 201-203
- Origin explanation: `url('${escapeHtml(background.src)}')` produz aspas simples dentro de `style='...'`, quebrando o HTML. O engine não tratava a possibilidade de a URL conter espaços (arquivo WEBP com espaço no nome).

## Why It Passed
- Missed gate: nenhum Reviewer/auditor verificou o export final PNG (slide 1 com 314 KB vs ~1.4 MB = 78% menor — sinal claro)
- False positive: "imagem referenciada no VDC, RCC e HTML" foi considerado evidência suficiente sem verificar render real
- Missing evidence: PNG export final não foi verificado visualmente nem por tamanho de arquivo
- Reviewer/Auditor gap: v2 marcado como `pipeline_pass` sem export reality check

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|
| `implementation_bug` | `compose.mjs` linha 201-203 | `url('...')` com aspas simples dentro de `style='...'` — conflito HTML |
| `approval_gate_gap` | Nenhuma verificação de export PNG | v2 passou sem validação visual dos PNGs |
| `layout_rule_missing` | `tokens.css` — font sizes muito pequenos | body 15px e caption 10px no preview abaixo do legível para revisão |

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|
| `design-system/engine/compose.mjs` (linhas 201-203) | `url('${escapeHtml(src)}')` → `url(${encodedSrc})` com URL-encoding de espaços e aspas | ✅ merged |
| `design-system/tokens.css` (linhas 23-30) | body: 15→19px, caption: 10→13px, export body: 34→40px, export caption: 24→28px | ✅ merged |
| `design-system/templates/instagram-carousel.hbs` (linha 236) | CTA font-size: 12px hardcoded → `var(--ds-font-caption)` | ✅ merged |
| `output/creative/visual-direction-ac-30-10.json` | Adicionado Skill Invocation Ledger + design_tokens | ✅ |
| HTML preview | Regenerado via compose.mjs com engine corrigido | ✅ |
| PNG exports | Reexportados (6/6, slide 1 = 1520 KB) | ✅ |
| VDC/RCC v3 | Criados refletindo editorial-myth real | ✅ |

## New Or Updated Rule
- Rule file: `design-system/engine/compose.mjs` linha 198-205
- Rule summary: background.src deve ter espaços codificados como `%20` e não usar `url('...')` com aspas simples dentro de `style='...'`
- Blocking condition added: se background.src contiver espaços E estiver dentro de url() com aspas simples = bug

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|
| URL-encoding de espaços em background.src | compose.mjs | `slideBackgroundStyle()` — `encodedSrc` sempre usado em `url()` | ✅ enforced |
| Font sizes mínimos vinculantes em tokens.css | Design System | `tokens.css` — body 19px/40px, caption 13px/28px | ✅ enforced |
| CTA font-size via CSS var (não hardcoded) | Design System | `instagram-carousel.hbs` — `var(--ds-font-caption)` | ✅ enforced |
| Reviewer checklist: comparar tamanhos de PNGs | Reviewer | `generation-contract.md` item 4 (Export and Proof) | ⚠️ documentation pending |

## Recurrence Check
- Similar prior incidents: nenhum registrado (primeiro incidente com compose.mjs)
- Search/evidence: grep por `url('` em compose.mjs — única ocorrência (corrigida)
- Residual risk: baixo — engine agora faz URL encoding de espaços em vez de depender de aspas

## Learning
- O engine compose.mjs não tratava URLs com espaços (arquivos com nome composto, ex: "instagram carousel-...webp")
- PNG export final deve ser validado visualmente OU por comparação de tamanho antes de APPROVE (slide com imagem ausente é 4-5x menor)
- Hardcoded font sizes em templates devem ser substituídos por CSS vars para consistência do DS
- VDC/RCC precisam ser criados antes da renderização, não retroativamente

## Closure Criteria
- [x] Defect corrected in final-facing artifact
- [x] Hub/manifest/draft/preview consistency verified
- [x] Rule/checklist updated (compose.mjs + tokens.css)
- [x] Mitigation has an owner and enforcement point
- [x] Related audit report references this incident trace
- [x] User-facing final copy remains pt-BR compliant
