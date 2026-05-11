# Article Link Distribution Contract — Test Report: AC-30-27

**Artigo-pai:** AC-30-05B (Veludo = Novo Luxo)
**URL artigo:** https://amiclube.com.br/tendencias-2026-veludo
**Formato:** Facebook Post (1200x630)
**Data:** 2026-05-02

---

## Verificação Article Link Distribution

### Check 1: article_url declarada no asset

| Campo | Obrigatório | Encontrado | Status |
|-------|-------------|------------|--------|
| article_url | ✅ | ❌ NÃO DECLARADA | **BLOCKED_MISSING_ARTICLE_URL** |

### Check 2: link_strategy correta para Facebook

| Campo | Obrigatório | Encontrado | Status |
|-------|-------------|------------|--------|
| link_strategy | ✅ direct_url ou first_comment | ⚠️ PARCIAL — CTA diz "Ver artigo completo" mas sem URL física | **BLOCKED_WRONG_LINK_STRATEGY** |
| article_url | ✅ | ❌ NÃO DECLARADA | BLOCKED |

### Check 3: visual CTA ou caption

| Campo | Obrigatório | Encontrado | Status |
|-------|-------------|------------|--------|
| visual_cta | ✅ (quando aplicável) | "Ver artigo completo" (texto mas sem URL) | ⚠️ PARCIAL |
| caption_cta | ✅ (para caption do post) | ❌ NÃO DECLARADO | **BLOCKED_MISSING_ARTICLE_URL** |

---

## Conclusão

| Verificação | Resultado |
|-------------|----------|
| article_url declarada | ❌ FALTA |
| link_strategy correta para Facebook | ❌ FALTA — precisa de URL direta, não "link na bio" |
| visual_cta menciona artigo | ⚠️ PARCIAL — texto existe mas precisa de URL |
| caption_cta declarado | ❌ FALTA |
| **BLOCKED** | **BLOCKED_MISSING_ARTICLE_URL** + **BLOCKED_WRONG_LINK_STRATEGY** |

---

## Problemas Identificados

1. **CTA:** "Ver artigo completo" é texto, mas Facebook precisa de URL direta física
2. **article_url:** Não está declarada em nenhum lugar no markup
3. **link_strategy:** Deveria ser `direct_url` ou `first_comment`, mas não há URL

---

## Correção Necessária

O CTA precisa incluir a URL ou usar estratégia de primeiro comentário:

**Opção 1: CTA com URL direta**
```html
<div class="cta">https://amiclube.com.br/tendencias-2026-veludo</div>
```

**Opção 2: First comment strategy**
- Post: Texto + primeiro comentário inclui URL

---

## Veredicto Final

**❌ BLOCKED**

```
BLOCKED_MISSING_ARTICLE_URL
BLOCKED_WRONG_LINK_STRATEGY
```

AC-30-27 não pode ser aprovado para publicação sem Article Link Distribution completa para Facebook.

Próximo passo: Corrigir AC-30-27 com URL direta do artigo.