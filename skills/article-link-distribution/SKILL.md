# Article Link Distribution Contract

**Versão:** 1.0
**Data:** 2026-05-02
** pipeline gate:** Obrigatório para todo asset `blog_derivative` antes de publicação

---

## Definição

Article Link Distribution Contract é o gate obrigatório que verifica se todo asset social derivado de artigo (blog_derivative) inclui a estratégia de link correta para cada plataforma.

Cada asset que deriva de um artigo-pai deve declarar explicitamente:

1. Qual é o artigo-pai
2. URL completa do artigo
3. Estratégia de distribuição do link
4. CTA visual (quando aplicável)
5. CTA de caption (quando aplicável)

Sem isso, o asset **não pode ser aprovado para publicação**.

---

## Quando Usar

Todo asset com `content_mode: "blog_derivative"` deve passar por este check antes de:

- Ser marcado como `approved`
- Ir para scheduling/fila
- Ser publicado
- Ser importado no WordPress/meta

---

## Estratégias Por Plataforma

### Instagram Carrossel

| Campo | Obrigatório? | Valor |
|-------|--------------|-------|
| link_strategy | ✅ | `link_in_bio` |
| visual_cta | ✅ | "Link na bio" ou similar no último slide |
| caption_cta | ✅ | "Leia o artigo completo no link da bio." |

### Instagram Reels

| Campo | Obrigatório? | Valor |
|-------|--------------|-------|
| link_strategy | ✅ | `link_in_bio` |
| visual_cta | ✅ | "Link na bio" no frame CTA |
| caption_cta | ✅ | "Link na bio" ou "bio" |

### Instagram Stories

| Campo | Obrigatório? | Valor |
|-------|--------------|-------|
| link_strategy | ✅ | `link_sticker` ou `link_in_bio` |
| link_sticker | ✅ (when applicable) | Link sticker com URL do artigo |
| visual_cta | ✅ (when applicable) | CTA visual para sticker |
| caption_cta | ⚠️ Não aplicável | N/A |

### Facebook Post

| Campo | Obrigatório? | Valor |
|-------|--------------|-------|
| link_strategy | ✅ | `direct_url` ou `first_comment` |
| article_url | ✅ | URL completa do artigo |
| caption_cta | ✅ | "Leia o artigo completo: [URL]" |

### LinkedIn Post

| Campo | Obrigatório? | Valor |
|-------|--------------|-------|
| link_strategy | ✅ | `direct_url` |
| article_url | ✅ | URL completa do artigo |
| caption_cta | ✅ | "Leia o artigo completo no link." |

### Pinterest Pin

| Campo | Obrigatório? | Valor |
|-------|--------------|-------|
| link_strategy | ✅ | `direct_url` |
| article_url | ✅ | URL completa do destino |
| caption_cta | ✅ | "Leia mais no link." |

### Blog Teaser / Link Preview

| Campo | Obrigatório? | Valor |
|-------|--------------|-------|
| link_strategy | ✅ | `direct_url` |
| article_url | ✅ | URL completa do artigo |
| preview_image | ✅ | OG image ou blog hero |

---

## Campos Obrigatórios

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| blog_parent_id | ID do artigo-pai | AC-30-05B |
| article_url | URL completa do artigo | https://amiclube.com.br/veludo-luxo |
| link_strategy | Plataforma/estratégia | `link_in_bio`, `direct_url`, `link_sticker`, `first_comment` |
| visual_cta | Texto/CTA visual no asset | "Link na bio" |
| caption_cta | Texto de caption | "Leia mais no link da bio." |
| fallback_strategy | Estratégia alternativa se a principal falhar | `first_comment` |

---

## Blockers

Se o link não está configurado corretamente:

- `BLOCKED_MISSING_ARTICLE_URL` — asset é blog_derivative mas não tem article_url
- `BLOCKED_WRONG_LINK_STRATEGY` — estratégia não corresponde à plataforma
- `BLOCKED_INSTAGRAM_NO_BIO_CTA` — Instagram sem CTA "link na bio"
- `BLOCKED_FACEBOOK_NO_URL` — Facebook sem URL direta
- `BLOCKED_LINK_STRATEGY_MISMATCH` — estrategia declarada mas não implementada

---

## Fluxo

```
Artigo-pai identificado
        ↓
Article Link Distribution Contract
        ↓
    [CHECK]
       ↓
  PASS / BLOCKED (não pode publicar sem isso)
        ↓
Scheduling / Filas / WordPress
```

---

## Exemplo de Contrato

```md
## Article Link Distribution — AC-30-25

**Artigo-pai:** AC-30-05B (Veludo = Novo Luxo)
**URL:** https://amiclube.com.br/tendencias-2026-veludo
**Plataforma:** Instagram Carrossel

| Campo | Valor |
|-------|-------|
| link_strategy | link_in_bio |
| visual_cta | "Link na bio" (slide 6, CTA) |
| caption_cta | "Leia o artigo completo no link da bio." |

✅ PASS — Link strategy válida para Instagram
```

---

## Exemplo de Contrato Inválido

```md
## Article Link Distribution — AC-30-26

**Artigo-pai:** AC-30-05B
**URL:** ❌ NÃO DECLARADA
**Plataforma:** Instagram Reels

| Campo | Valor |
|-------|-------|
| link_strategy | ❌ NÃO DECLARADA |
| visual_cta | ❌ NÃO DECLARADO |
| caption_cta | ❌ NÃO DECLARADO |

❌ BLOCKED_MISSING_ARTICLE_URL — Contrato não preenchido
```

---

## Publicação sem Contrato

O publishing manifest deve incluirArticle Link Distribution:

```json
{
  "asset_id": "AC-30-25",
  "type": "carrossel",
  "status": "approved",
  "content_mode": "blog_derivative",
  "blog_parent_id": "AC-30-05B",
  "article_link_distribution": {
    "article_url": "https://amiclube.com.br/veludo-luxo",
    "link_strategy": "link_in_bio",
    "visual_cta": "Link na bio",
    "caption_cta": "Leia o artigo completo no link da bio."
  },
  "exports": [...]
}
```

Se `article_link_distribution` está ausente ou vazio para `blog_derivative`, o asset **não pode ser aprovado para publicação**.

---

## Verificação de Implementação

Para confirmar que o link foi implementado:

1. **Preview HTML**: Verificar se o frame/slide final tem CTA visual com "link na bio"
2. **Caption draft**: Verificar se caption inclui a CTA de link
3. **Publishing manifest**: Campo `article_link_distribution` presente e válido

---

## Referências

- Skill: `skills/visual-reality-check/SKILL.md`
- Strategy: `squads/social-growth/_memory/image-generation-strategy.md`
- Alignment: `squads/social-growth/_memory/blog-social-alignment.json`

---

## SKILL.md