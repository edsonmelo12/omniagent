# Gate Verification Report — AC-30-10

**Asset:** AC-30-10
**Formato:** Instagram Carousel (6 slides)
**Artigo-pai:** AC-30-09 (Reputação de marca artesanal)
**Data:** 2026-05-11

---

## 1. Article Link Distribution Contract

| Campo | Obrigatório | Encontrado | Status |
|-------|------------|------------|--------|
| blog_parent_id | ✅ | AC-30-09 | ✅ PASS |
| article_url | ✅ (para blog_derivative) | https://amiclube.com.br/reputacao-marca-artesanal-avaliar-antes-comprar/ | ✅ PASS |
| link_strategy | ✅ (link_na_bio) | link_na_bio | ✅ PASS |
| visual_ctA | ✅ | "O link está na bio" | ✅ PASS |
| caption_ctA | ✅ | "Quer saber mais? O link está na bio." | ✅ PASS |

---

## 2. Social Export Rule

| Elemento | Status | Ação |
|---------|--------|------|
| .mock_header | ✅ AUSENTE | - |
| .nav buttons (‹ ›) | ✅ AUSENTE | - |
| .nav prev/next | ✅ AUSENTE | - |
| Slides 2-6 image reuse | ✅ AUSENTE | texture-only inner slides |
| Slides (conteúdo) | ✅ Manter | - |
| CTA (link na bio) | ✅ Manter | - |

---

## Veredicto

| Gate | Status |
|------|--------|
| Article Link Distribution | ✅ PASS (article_url + link_na_bio) |
| Social Export Rule | ✅ PASS (mock removido do HTML) |

**Resultado:** ✅ PASS — Todos gates compliance raggiunti
