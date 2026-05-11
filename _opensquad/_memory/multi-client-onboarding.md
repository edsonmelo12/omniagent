# Multi-Client Onboarding

> Instruções legíveis por humanos e por IAs para adicionar um novo cliente ao squad `social-growth`.

## Pré-requisitos

- WordPress instalado no site do cliente
- Yoast SEO ativo e configurado
- Usuário com permissão `edit_posts` (para Application Password e schema)
- Application Password gerada em Usuários → Perfil no WordPress

## Passo 1 — Publishing Profile

Criar `squads/social-growth/pipeline/data/{cliente}-publishing-profile.md` copiando o template de `novo-cliente-publishing-profile.md`:

```
cp squads/social-growth/pipeline/data/novo-cliente-publishing-profile.md \
   squads/social-growth/pipeline/data/{cliente}-publishing-profile.md
```

Preencher: Website URL, REST API User, Application Password, Default Category ID.

### Category Map (opcional)

Se o cliente usar múltiplas categorias, adicionar uma linha no profile:

```
- **Category Map:** NomeCategoria: ID, OutraCategoria: ID
```

Se ausente, o validador usará `Default Category ID` para todos os posts.

## Passo 2 — Schema Setup (etapa única)

No WordPress do cliente, ir em **Aparência → Editor de Arquivos de Tema → functions.php**.
Adicionar antes do `?>` final:

```php
/**
 * Expõe meta fields do Yoast Schema via REST API.
 * Necessário para o pipeline social-growth ativar schemas
 * (FAQPage, BlogPosting, etc.) via REST API.
 */
foreach (['_yoast_wpseo_schema-page-type', '_yoast_wpseo_schema-article-type'] as $meta_key) {
    register_post_meta('post', $meta_key, [
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);
}
```

Salvar. Executar uma vez apenas, válido para todos os posts futuros.

### Verificar se funcionou

```bash
curl -s -u "USUARIO:SENHA_APP" \
  "https://sitecliente.com/wp-json/wp/v2/posts/1?context=edit&_fields=id,meta" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print([k for k in d.get('meta',{}) if 'yoast' in k or 'schema' in k])"
```

Deverá retornar `['_yoast_wpseo_schema-page-type', '_yoast_wpseo_schema-article-type']`.

## Passo 3 — Validar conexão WP

```bash
node squads/social-growth/scripts/post-publish-validator.mjs \
  --client={cliente} --post-id 1
```

Se retornar dados do post, conexão OK.

## Passo 4 — Organization Schema (nível de site)

Acessar **Yoast SEO → Configurações → Geral → Schemas** e configurar:
- **Tipo de organização:** Empresa ou Organização
- **Nome:** Nome do cliente
- **Logotipo:** Upload do logo

Isso faz o `yoast_head` incluir `"@type": "Organization"` no schema global.

## Passo 5 — Validar pipeline local

```bash
node squads/social-growth/scripts/local-blog-validator.mjs \
  --client={cliente} --fix
```

## Uso no Pipeline

- `step-06d-validate-seo.md` usa `{client}` no path — o Pipeline Runner substitui pelo cliente ativo.
- `post-publish-validator.mjs --client={cliente} --post-id {id} --fix` valida e corrige posts.
- `local-blog-validator.mjs --client={cliente} --fix` valida e corrige .md locais.
- `deep-fix-blog.mjs --geo --client={cliente}` adiciona seções GEO faltantes (FAQ, Schema, Source Notes, etc.).

## Referências

- Template de profile: `squads/social-growth/pipeline/data/novo-cliente-publishing-profile.md`
- Exemplo configurado: `squads/social-growth/pipeline/data/amiclube-publishing-profile.md`
- Validador WP: `squads/social-growth/scripts/post-publish-validator.mjs`
- Validador local: `squads/social-growth/scripts/local-blog-validator.mjs`
- Fix GEO: `squads/social-growth/scripts/deep-fix-blog.mjs`
- Data: publish date
