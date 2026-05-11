# Article Link Distribution Contract — Test Report

**Artigo-pai:** AC-30-05B (Veludo = Novo Luxo)
**URL artigo:** https://amiclube.com.br/tendencias-2026-veludo
**Data:** 2026-05-02

---

## Assets Testados

### AC-30-25 v3 (Instagram Carrossel 6p)

| Campo | Valor | Status |
|-------|-------|--------|
| blog_parent_id | AC-30-05B | ✅ |
| article_url | https://amiclube.com.br/tendencias-2026-veludo | ✅ |
| platform | Instagram Carrossel | ✅ |
| link_strategy | link_in_bio | ✅ |
| visual_cta (frame 6) | "DESCUBRA O TOQUE" + CTA button | ⚠️ Precisa verificar literal |
| caption_cta | Não declarada no VDC | ❌ FALTA |

### AC-30-26 v3 (Instagram Reels 4p)

| Campo | Valor | Status |
|-------|-------|--------|
| blog_parent_id | AC-30-05B | ✅ |
| article_url | https://amiclube.com.br/tendencias-2026-veludo | ✅ |
| platform | Instagram Reels | ✅ |
| link_strategy | link_in_bio | ✅ |
| visual_ctA (frame 4) | "SENTE O TOQUE" + "COMENTAR" button | ⚠️ Sem "link na bio" literal |
| caption_ctA | Não declarada | ❌ FALTA |

---

## Verificação de Implementação

### Check 1: Visual CTA em Frame Final

AC-30-25 v3 frame 6:
```html
<div class="headline sm">DESCUBRA O TOQUE</div>
<div class="cta-btn">COMENTAR</div>
```

Problema: O CTA é "COMENTAR" — usuário interage e não vai para artigo. Não há referência a "link na bio" ou artigo.

AC-30-26 v3 frame 4:
```html
<div class="headline" style="color:#B48A1D">SENTE O TOQUE</div>
<div class="cta-btn">COMENTAR</div>
```

Problema: Mesmo — "COMENTAR" não leva ao artigo.

### Check 2: Caption Draft

Os VDCs não incluem campo de caption_cta, apenas o CTA interno de engajamento ("COMENTAR").

---

## Conclusão

| Verificação | AC-30-25 v3 | AC-30-26 v3 |
|------------|-------------|-------------|
| article_url declarada | ✅ | ✅ |
| link_strategy correta | ✅ link_in_bio | ✅ link_in_bio |
| visual_cta menciona artigo/link | ❌ Apenas "COMENTAR" | ❌ Apenas "COMENTAR" |
| caption_cta declarada | ❌ Não | ❌ Não |
| **BLOCKED** | **BLOCKED_INSTAGRAM_NO_BIO_CTA** | **BLOCKED_INSTAGRAM_NO_BIO_CTA** |

---

## Correção Necessária

O frame CTA precisa incluir:

1. **CTA visual:**
   - "Link na bio" como texto + seta
   - ou "Leia o artigo completo no link da bio"

2. **Caption (para o scheduling):**
   - "Leia o artigo completo no link da bio: [URL]"
   - Ou referência clara de que o link do artigo está na bio

---

## Lição

A regra está funcionando como deveria: **BLOQUEADA**.

Os assets têm o article_url (que vem do blog_parent_id no alignment), mas:

1. Os CTAs internos são “COMENTAR” (engajamento), não “LINK NA BIO” (tráfego)
2. O VDC não inclui campos de caption_cta
3. O publishing manifest não tem `article_link_distribution`

Próximos passos:

1. Atualizar VDC para incluir Article Link Distribution
2. Atualizar HTML do frame CTA para incluir texto "link na bio" quando objetivo é tráfego
3. Atualizar publishing manifest com link strategy
4. Reaplicar após correção

---

**Veredicto Final:** ❌ BLOCKED — Instagram sem visual CTA de “link na bio”