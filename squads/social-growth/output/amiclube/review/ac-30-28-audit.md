# Pipeline Auditor Card — AC-30-28

## Asset
- **ID:** AC-30-28
- **Tipo:** Instagram Post
- **Canal:** Instagram
- **Canvas:** 1080x1350

---

## Pipeline Execution Summary

| Etapa | Status | Evidência |
|-------|--------|----------|
| VDC Creation | ✅ COMPLETE | `social/ac-30-28-vdc.md` |
| Visual Direction | ✅ COMPLETE | Organic Image-led |
| Creative Render | ✅ COMPLETE | `social/previews/ac-30-28.html` |
| Reviewer | ✅ APPROVED | `review/ac-30-28-review.md` |
| Export | ✅ COMPLETE | `social/publish/ac-30-28/ac-30-28.png` |

---

## Compliance Gates

### Pipeline Compliance
| Gate | Status | Evidência |
|------|--------|----------|
| Full pipeline followed | ✅ PASS | VDC → Render → Reviewer → Export |
| VDC completo | ✅ PASS | Todas as seções declaradas |
| Reviewer aprovou | ✅ PASS | Veredicto: APROVADO |
| Export executado | ✅ PASS | PNG gerado |

### Creative DNA Acceptance
| Gate | Status | Evidência |
|------|--------|----------|
| Estilo no envelope | ✅ PASS | Organic Image-led em allowed |
| Sinais proibidos ausencia | ✅ PASS | Nenhum sinal cold/corporate/tech |

### First Impression Diversity
| Gate | Status | Evidência |
|------|--------|----------|
| Diferença declarada | ✅ PASS | Background full-bleed vs crop close-up |
| Justificativa estratégica | ✅ PASS | Imagem blog como background |

### pt-BR Compliance
| Gate | Status | Evidência |
|------|--------|----------|
| Ortografia correta | ✅ PASS | Acentos corretos |
| Diacríticos | ✅ PASS | Todos corretos |

---

## Final Assets

| Arquivo | Caminho |
|--------|---------|
| Preview HTML | `output/amiclube/social/previews/ac-30-28.html` |
| Export PNG | `output/amiclube/social/publish/ac-30-28/ac-30-28.png` |
| VDC | `output/amiclube/social/ac-30-28-vdc.md` |
| Review | `output/amiclube/review/ac-30-28-review.md` |

---

## Publication Status

- **Status:** PRONTO PARA PUBLICAÇÃO
- **Data:** 2026-05-04
- **Link Blog:** AC-30-13B (artigo pai)
- **Próximo passo:** Substituir URL placeholder e publicar

---

## Hub Link Update

Para atualizar o link no campaign hub, executar:
```bash
node scripts/regenerate-hub.mjs --client amiclube
```

Ou atualizar manualmente o campaign-hub.html com:
- Asset ID: AC-30-28
- Preview: `social/previews/ac-30-28.html`
- Publish: `social/publish/ac-30-28/ac-30-28.png`