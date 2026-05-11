# Adicionar suporte a schema FAQPage via REST API

## O que faz

Registra as meta fields `_yoast_wpseo_schema-page-type` e `_yoast_wpseo_schema-article-type` como acessíveis via REST API, permitindo que o pipeline do squad ative schema FAQPage/BlogPosting nos posts programaticamente.

## Como aplicar

1. Acesse **Aparência → Editor de Arquivos de Tema** no WordPress Admin
2. Selecione o tema **Hello Elementor**
3. Abra o arquivo **functions.php**
4. Adicione o bloco abaixo **antes do `?>` final** (ou no final do arquivo, antes de qualquer `?>`):

```php
/**
 * Expõe meta fields do Yoast Schema via REST API
 * Necessário para o pipeline social-growth ativar FAQPage/BlogPosting
 * schema nos posts programaticamente via REST API.
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

5. Clique em **Atualizar Arquivo**

## Verificar

Após salvar, rode no terminal:

```bash
curl -s -u "edsonrmjunior:SUA_SENHA_APP" \
  "https://amiclube.com.br/wp-json/wp/v2/posts/13002?context=edit&_fields=id,meta" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); \
  print([k for k in d.get('meta',{}) if 'yoast' in k or 'schema' in k])"
```

Deverá retornar `['_yoast_wpseo_schema-page-type', '_yoast_wpseo_schema-article-type']`.

## Após ativar

Avise que posso rodar o comando para ativar FAQPage nos 4 posts agendados:

```bash
cd /home/edsonrmjunior/Local\ Sites/omniagent && \
curl -s -u "edsonrmjunior:CoBy YZRb OjNf tUV3 I9sw Ma6Q" \
  -X POST "https://amiclube.com.br/wp-json/wp/v2/posts/13002" \
  -H "Content-Type: application/json" \
  -d '{"meta":{"_yoast_wpseo_schema-page-type":"FAQPage","_yoast_wpseo_schema-article-type":"BlogPosting"}}'
```
