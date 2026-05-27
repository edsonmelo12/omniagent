# Pipeline Compliance Report — AC-30-10

## Verdict
PASS_WITH_WARNINGS

## Scope
- Client: AmiClube
- Delivery type: social visual asset (instagram-carousel)
- Asset(s): AC-30-10
- Source: pipeline DS (VDC → RCC → Reviewer → Pipeline Auditor)
- Requested action: re-review & approval after user-reported defects

## Skill Invocation Ledger
| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Pipeline Auditor | pipeline-compliance-audit | `skills/pipeline-compliance-audit/SKILL.md` | AC-30-10 v3 | Verified VDC/RCC existence, integrity checks, correction trace | invoked |

## Required Flow
- [x] Step 01 — Identity and routing — VDC v3
- [x] Step 02 — Creative Decision / DNA gate — editorial-myth (allowed)
- [x] Step 03 — VDC — ac-30-10-vdc-v3.md
- [x] Step 04 — RCC — ac-30-10-rcc-v3.md
- [x] Step 05 — Visual Production Gate — gate-verification-ac-30-10.md (novo: v3 expandido)
- [x] Step 06 — Review — content-review-ac-30-10.md (APPROVE)
- [x] Step 07 — Pipeline Audit — este relatório
- [x] Step 08 — Hub regeneration — regenerate-hub.mjs (PUBLISH)
- [x] Incident Trace — incident-trace-ac-30-10-background-html-quote.md

## Evidence Table
| Gate | Status | Evidence | Notes |
|---|---|---|---|
| Client DNA Acceptance | PASS | `creative-dna-acceptance.json` — editorial-myth in `allowed` | ✅ |
| Visual Decision Card | PASS | `visual-decision-cards/ac-30-10-vdc-v3.md` | VDC v3 editado pós-correção |
| Render Compliance Card | PASS | `visual-decision-cards/ac-30-10-rcc-v3.md` | RCC v3 com export evidence |
| Visual Production Gate | PASS | slides 1 image, 2-5 texture-pattern, 6 gradient | Todos os tipos declarados |
| Background Decision | PASS | slide 1 image-only; slides 2+ DS textures | Sem reuse de imagem |
| First Impression Diversity | PASS | capa com blog hero + dark-overlay, diferente dos recentes | ✅ |
| Typography Minimum Size | PASS | body 40px / caption 28px export | Acima do mínimo 25px do VDC v2 |
| Export Dimension Validation | PASS | 6 PNGs 1080x1350 cada | ✅ |
| Preview HTML Slide Count | PASS | 6 slides ⇔ 6 PNGs | ✅ |
| Skill Invocation Gate (VDC) | PASS | ledger com creative-director, social-visual-system, instagram-carousel | ✅ |
| Skill Invocation Gate (RCC) | PASS | ledger com social-visual-system, instagram-carousel, creative-director | ✅ |
| Skill Invocation Gate (Auditor) | PASS | pipeline-compliance-audit no ledger | ✅ |
| Caption Integrity | PASS | match com social-final-captions.json | ✅ |
| pt-BR Diacritics | PASS | acentos corretos em caption e slides | ✅ |
| CTA + Link Strategy | PASS | "Quer saber mais? O link está na bio." + URL real | ✅ |
| Mock/Chrome Prohibition | PASS | sem phone frames, Instagram UI, likes, comments | ✅ |
| Navigation Prohibition | PASS | sem setas/chevrons dentro da arte | ✅ |
| Hub Update Timing | PASS | hub regenerado após review/audit | ✅ |
| Incident Trace | PASS | ver incident-trace-ac-30-10-background-html-quote.md | ✅ |

## Integrity Checks
| Check | Status | Evidence | Notes |
|---|---|---|---|
| Actor separation | PASS | VDC (Visual Director), RCC (Creative Renderer), Review (Reviewer), Audit (Pipeline Auditor) | Pipeline agents distintos |
| Skill invocation evidence | PASS | Ledgers em VDC, RCC, Review e Audit | Todos com concrete use |
| Existing active version checked | PASS | VDC v3 → RCC v3 → Review v3 → este relatório | v3 é a versão ativa |
| Export final and dimensions | PASS | `social/publish/ac-30-10/{01-06}.png` 1080x1350 | 1520/1358/1413/1361/1418/898 KB |
| Hub update timing | PASS | hub regenerado após review/audit | Não houve atualização prematura |
| Visual claim parity | PASS | VDC/RCC claims conferem com DOM/PNG | imagem slide 1 carregando, textures slides 2-5, gradient slide 6 |
| Mock/chrome prohibition | PASS | DOM sem phone frames, Instagram UI ou app chrome | ✅ |
| Navigation prohibition | PASS | DOM sem setas/chevrons na superfície da arte | "arraste" é texto, não seta |
| Publication language allowed | PASS_WITH_WARNINGS | N/A — asset não está sendo publicado agora | Apenas re-review |

## Blockers
- None.

## Warnings
- VDC v3 foi criado retroativamente após a correção (não antes da renderização). Idealmente o VDC deve preceder o RCC na pipeline.
- compose.mjs linha 201-203 precisou de hotfix (encoding de espaços em url()). Engenho corrigido, mas a correção foi reativa ao defeito.

## Incident Trace Requirement
- Required: yes
- Trigger: usuário reportou que "a imagem não aparece no primeiro slide" e "fontes muito pequenas"
- Trace file: `review/incident-trace-ac-30-10-background-html-quote.md`
- Trace verdict: CLOSED
- Root cause labels: `implementation_bug`, `approval_gate_gap`, `layout_rule_missing`
- Mitigation enforcement point: `compose.mjs` linhas 201-203 (URL encoding de espaços + remoção de aspas simples em url()); `tokens.css` font sizes aumentados e declarados como mínimo vinculante

## Decision
May proceed to user checkpoint.
