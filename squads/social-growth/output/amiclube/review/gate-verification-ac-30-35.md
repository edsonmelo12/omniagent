# Gate Verification Report — AC-30-35

**Asset:** AC-30-35
**Formato:** Facebook Post
**Artigo-pai:** AC-30-09 (Reputação de marca artesanal)
**Data:** 2026-05-02

---

## 1. Article Link Distribution Contract

| Campo | Obrigatório | Encontrado (v2) | Status |
|-------|------------|-----------------|--------|
| blog_parent_id | ✅ | AC-30-09 | ✅ PASS |
| article_url | ✅ | https://amiclube.com.br/reputacao-marca-artesanal | ✅ PASS |
| link_strategy | ✅ (direct_url/first_comment) | first_comment | ✅ PASS |
| visual_ctA | ✅ | "ver detalhes nos comentários" | ✅ PASS |
| caption_ctA | ✅ | "Link nos comentários: https://amiclube.com.br/reputacao-marca-artesanal" | ✅ PASS | |

**Problema:** (RESOLVIDO v2) - article_url agora declarada com https://amiclube.com.br/reputacao-marca-artesanal

---

## 2. Visual Reality Check

### Image Load Check
- Imagem: `../../blog/assets/AC-30-09-reputacao-marca-hero.jpg`
- Arquivo existe: ✅ SIM
- Status: ✅ PASS

### Monotony Check
- Facebook single post: não aplica (1 frame)

### Copy Integrity Check
- Verificar typos no texto: ✅ parece íntegro
- "FOTO BONITA NÃO BASTA" — correto
- "saber mais nos comentários" — correto
- Status: ✅ PASS

---

## 3. Article Image Rotation Contract

- Artigo-pai: AC-30-09 (não AC-30-05B)
- Imagem: `AC-30-09-reputacao-marca-hero.jpg`
- Arquivo existe: ✅
- É derivado de AC-30-09 (não 05B), então não compete com rotação AC-30-25/26/27
- Status: ✅ PASS (artigo diferente)

---

## Veredicto

| Gate | Status |
|------|--------|
| Article Link Distribution | ✅ PASS (v2) |
| Visual Reality Check | ✅ PASS |
| Image Rotation | ✅ PASS |
| Social Export Rule | ✅ PASS (mock removido do HTML) |

**Resultado:** ✅ PASS — Todos gates compliance raggiunti

---

## v2 Corrections Applied

| Campo | Antes (v1) | Depois (v2) |
|-------|-------------|---------------|
| article_url | não declarada | https://amiclube.com.br/reputacao-marca-artesanal |
| link_strategy | implícita | first_comment |
| visual_ctA | "saber mais nos comentários" | "ver detalhes nos comentários" |
| caption_ctA | sem URL | "Link nos comentários: https://amiclube.com.br/reputacao-marca-artesanal" |

---

## Veredicto Final

**✅ PASS — APPROVED (v2)**

```
VISUAL_REALITY_CHECK: ✅ PASS (imagem existe, copy OK)
ARTICLE_LINK_DISTRIBUTION: ✅ PASS (article_url declarada)
ARTICLE_IMAGE_ROTATION: ✅ PASS (artigo diferente: AC-30-09 vs 05B)
```