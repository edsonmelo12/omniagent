# Review Card — AC-30-30

## Asset
- **ID:** AC-30-30
- **Tipo:** Facebook Post
- **Canal:** Facebook
- **Preview:** `social/previews/ac-30-30.html`

---

## Review Gates

### G1: Copywriting & pt-BR
| Item | Status | Justificativa |
|------|--------|-------------|
| Acentuação correta | ✅ PASS | Todos os acentos corretos |
| Português do Brasil | ✅ PASS | Linguagem apropiada |
| Clareza | ✅ PASS | Texto direto |
| Labels visíveis | ✅ PASS | Nenhum label aparente |

### G2: Visual Composition
| Item | Status | Justificativa |
|------|--------|-------------|
| Estilo declarado | ✅ PASS | Dark Premium |
| Estilo no DNA | ✅ PASS | Allowed list |
| First Impression | ✅ PASS | Diferente dos demais |
| Sem setas | ✅ PASS | Conforme regra |
| Sem mocks | ✅ PASS | Conforme regra |

### G3: Format & Export
| Item | Status | Justificativa |
|------|--------|-------------|
| Canvas correto | ✅ PASS | 1200x630 |
| Fonte legível | ✅ PASS | Tamanhos verificados |
| Sem rodapé técnico | ✅ PASS | Corrigido em 2026-05-09: bloco `Render Compliance Card — AC-30-30` removido do HTML e PNG reexportado capturando somente `.frame` |

### G4: Skill Invocation
| Skill | Status |
|-------|--------|
| creative-director | ✅ INVOKED |
| social-visual-system | ✅ INVOKED |
| facebook-post | ✅ INVOKED |

### G5: DNA Acceptance
| Item | Status |
|------|--------|
| allowed style | ✅ PASS |
| mustFeelLike | ✅ PASS |

---

## Veredito: **APROVADO** ✅

## Correção pós-aprovação — 2026-05-09

- **Problema identificado:** o preview HTML incluía um bloco técnico `.compliance` visível abaixo da arte, com metadados de Render Compliance Card.
- **Causa:** o bloco de evidência foi inserido no HTML de revisão em vez de permanecer em artefato de compliance separado.
- **Correção:** removido o CSS/HTML `.compliance` de `social/previews/ac-30-30.html` e reexportado `social/publish/ac-30-30/ac-30-30.png` capturando apenas o elemento `.frame`.
- **Regra aplicada:** metadados de bastidor não podem aparecer na superfície visível nem no PNG final.

---

## Metadata

- **Review Version:** 1.0.0
- **Created:** 2026-05-04
- **Status:** APROVADO
