# Gate Verification Report — AC-30-11

**Asset:** AC-30-11
**Formato:** Instagram Reels (4 frames)
**Artigo-pai:** AC-30-09 (Reputação de marca artesanal)
**Data:** 2026-05-02

---

## 1. Article Link Distribution Contract

| Campo | Obrigatório | Encontrado | Status |
|-------|------------|------------|--------|
| blog_parent_id | ✅ | AC-30-09 | ✅ PASS |
| article_url | ✅ (para blog_derivative) | ⚠️ não declarada no markup | ⚠️ |
| link_strategy | ✅ (link_na_bio) | link_na_bio | ✅ PASS |
| visual_ctA | ✅ | "link na bio" | ✅ PASS |
| caption_ctA | ✅ | "Link na bio" | ✅ PASS |

---

## 2. Social Export Rule

| Elemento | Status | Ação |
|---------|--------|------|
| .mock_header | ❌ PRESENTE | Remover |
| .nav buttons | ❌ PRESENTE | Remover |
| Frames (conteúdo) | ✅ Manter | - |
| CTA (link na bio) | ✅ Manter | - |

---

## Veredicto

| Gate | Status |
|------|--------|
| Article Link Distribution | ✅ PASS (link_na_bio) |
| Social Export Rule | ✅ PASS (mock removido do HTML) |

**Resultado:** ✅ PASS — Todos gates compliance raggiunti