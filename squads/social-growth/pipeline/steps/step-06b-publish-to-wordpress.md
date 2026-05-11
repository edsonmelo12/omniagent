---
execution: subagent
agent: wagner-wordpress
model_tier: powerful
inputFile: squads/social-growth/output/{client}/publishing/schedule-plan.md
outputFile: squads/social-growth/output/{client}/publishing/wordpress-status.md
---

# Step 06B: Publish to WordPress

## Context Loading

Load these files before executing:
- `squads/social-growth/output/{client}/blog/blog-post.md` — approved discovery-optimized blog content
- `squads/social-growth/output/{client}/creative/rendered-assets.md` — final render manifest (to find the image path)
- `squads/social-growth/output/{client}/publishing/schedule-plan.md` — final schedule and priorities
- `squads/social-growth/pipeline/data/{client}-publishing-profile.md` — client-scoped connection credentials
- `squads/social-growth/output/{client}/publishing/wordpress-category-governance.json` — taxonomy governance policy (limits + allowlist)
- `squads/social-growth/output/{client}/publishing/wordpress-categories-cache.json` — latest category sync snapshot
- `squads/social-growth/pipeline/data/wordpress-scheduling-cron-policy.md` — hybrid scheduling policy (WordPress `future` + cron monitoring)
- `squads/social-growth/pipeline/data/blog-policy.md` — transition words, title length, quality rules
- `_opensquad/_memory/company.md` — company profile for context

## Instructions

### Process
1. Identificar o título, o corpo do texto, os metadados (H1, Meta Description, Focus Keyword), **categorias sugeridas** e **asset_id** no arquivo de post de blog aprovado.
2. Extrair do `schedule-plan.md` a linha correspondente na seção `## Blog Publish Queue`:
   - `publish_at_iso`
   - `wordpress_target_status`
   - `article_id`
3. Ler credenciais do `{client}-publishing-profile.md`.
4. Localizar no manifesto de assets (`rendered-assets.md`) o caminho da imagem destacada.
5. Usar o script canônico `seo-publish.mjs` (com os parâmetros do cliente) para publicar. **NÃO** chamar o WordPress manualmente — o script gerencia todo o fluxo de 2 etapas (criação do post + aplicação de Yoast SEO em chamada separada).

### 2-Step Publishing Flow (obrigatório)

O script `seo-publish.mjs` implementa este fluxo automaticamente:

```
Step 1: POST /wp/v2/posts → cria o post (title, slug, content, featured_media, categories, date_gmt)
Step 2: POST /wp/v2/posts/{id} → atualiza com yoast_head_json (focuskw, title, metadesc)
```

**Por que 2 steps?** O `update_callback` do `register_rest_field('post', 'yoast_head_json')` não é chamado durante a criação de posts. A chamada separada de atualização garante que os metadados do Yoast SEO sejam persistidos.

### Campos Obrigatórios no Payload

| Campo | Origem | Obrigatório |
|-------|--------|-------------|
| `title` | blog-post.md ## Title Tag | Sim |
| `slug` | Derivado do title + keyword | Sim |
| `content` | blog-post.md ## Body + FAQ + Conclusão | Sim |
| `status` | `future` (padrão) ou `draft` (fallback) | Sim |
| `date` / `date_gmt` | schedule-plan.md `publish_at_iso` convertido | Sim (se future) |
| `featured_media` | ID do upload da imagem destacada | Sim |
| `categories` | Mapeado de `asset_category_map` no governance | Sim |
| `yoast_head_json.focuskw` | blog-post.md ## Primary keyword | Sim |
| `yoast_head_json.title` | ≤55 chars incluindo `\| Marca` | Sim |
| `yoast_head_json.metadesc` | 120-160 chars | Sim |

### Regras de Slug
- Slug deve conter a keyword normalizada (sem acentos, sem espaços).
- Se o slug vier de draft anterior com `__trashed-*`, deve ser substituído.

### Categorias
- Executar governança antes do publish:
  ```bash
  node squads/social-growth/scripts/wordpress-categories-governance.mjs --client {client} --mode ensure
  ```
- Mapear via `asset_category_map` no governance JSON.
- `category_names` vazio → usar fallback do governance.

### Pós-Validação Obrigatória

Após publicar, executar o validador de segurança:

```bash
node squads/social-growth/scripts/post-publish-validator.mjs --post-id {id} --fix
```

O validador checa:
- 🔴 **Críticos (auto-fix):** meta description, título SEO, slug, categoria, links internos
- 🟡 **Informativos (reporta apenas):** links externos, imagens com alt, transições ≥25%

## Output Format

```markdown
# WordPress Publication Status

## Summary
[Status: Sucesso/Erro]

## Post Details
- **Title**: [Título do post]
- **WordPress ID**: [ID retornado pela API]
- **Status**: [Future ou Draft]
- **Publication Mode**: [future_schedule ou draft_fallback]
- **Scheduled Local (BRT)**: [YYYY-MM-DD HH:MM]
- **Scheduled UTC (date_gmt)**: [YYYY-MM-DD HH:MM:SS]
- **Edit URL**: [Link direto para o editor no WP-Admin]

## SEO Fields
- **Focus KW**: [keyword]
- **SEO Title**: [título] ([N] chars)
- **Meta Description**: [texto] ([N] chars)
- **Slug**: [slug]

## Media Details
- **Featured Image**: [Nome do arquivo enviado]
- **Media ID**: [ID da imagem na biblioteca de mídia]

## Category Governance
- **Mapped Categories**: [lista final]
- **Created Categories**: [lista criada no run]
- **Governance Notes**: [limites, bloqueios, fallback]

## Post-Publish Validation
- **Score**: [N%]
- **Pass**: [N] ❌ | [N] ✅ | [N] 🔧
- **Pending**: [issues que exigem curadoria humana]

## Next Steps
1. Acompanhe o status via cron de monitoramento (`social:monitor:wordpress-future`).
2. Revise blocos e metadados no link de edição.
3. Se o post não virar `publish` após o horário, registrar incidente e aplicar retry controlado.
```

## Veto Conditions

Reject and redo if ANY are true:
1. O link de edição do WordPress não foi gerado ou retornado.
2. O conteúdo enviado está sem o corpo do texto ou sem título.
3. O `status` final não está coerente com a regra (`future` com `publish_at_iso` válido, senão `draft` com justificativa).
4. O slug contém `__trashed` (resquício de lixeira).
5. `yoast_head_json` não foi enviado ou está vazio.
6. **O título do post contém ` | ` (pipe seguido de marca)** — o título do post no WordPress não deve incluir o nome da marca; o ` | Marca` vai apenas no SEO title (`yoast_head_json.title`).
7. **O `<h1>` aparece duplicado no início do body** — verificar se o content já começa com `<h1>...</h1>`; se sim, remover antes de enviar.
8. **Há conflito de data** — verificar se já existe outro post agendado no mesmo horário antes de publicar.

## Quality Criteria

- [ ] O script `seo-publish.mjs` (ou fluxo equivalente 2-step) foi executado.
- [ ] `yoast_head_json` com focuskw, title e metadesc foi enviado na 2ª chamada.
- [ ] `categories` foi enviado e não contém Uncategorized (ID 1).
- [ ] O ID do post e o link de edição estão presentes no relatório.
- [ ] O status da postagem segue o modo híbrido (`future` padrão; `draft` só em fallback justificado).
- [ ] `date_gmt` foi enviado quando o status é `future`.
- [ ] A imagem destacada foi processada e enviada.
- [ ] O slug não contém `__trashed`.
- [ ] O `post-publish-validator.mjs` foi executado com `--fix`.
- [ ] O relatório de validação está incluído no output.
- [ ] Título do post não contém ` | ` — marca aparece apenas no SEO title.
- [ ] Conteúdo não começa com `<h1>` duplicado — H1 do campo `H1` é a única instância no content.
- [ ] Data não conflita com outros posts `future` — verificado via WP API antes de publicar.
