# Publishing Profile: {{CLIENT_NAME}}

> **INSTRUÇÕES PARA O CONFIGURADOR:**
> Preencha as informações abaixo para habilitar a publicação automática via Wagner WordPress.
> Após preencher, remova a marcação [PENDENTE].
> **Passo a passo completo em:** `_opensquad/_memory/multi-client-onboarding.md`

## WordPress Connection
- **Website URL:** [PENDENTE] (Ex: https://seusite.com)
- **REST API User:** [PENDENTE] (Seu nome de usuário)
- **Application Password:** [PENDENTE] (Gere em Usuários > Perfil no WordPress)

## Preferences
- **Default Post Status:** future
- **Default Category ID:** [PENDENTE] (O ID numérico da categoria no WP)
- **Enable Featured Image:** yes

## Schema Setup (etapa única por site)

Para permitir que o pipeline ative FAQPage/BlogPosting schema via REST API, adicione no `functions.php` do tema ativo:

```php
/**
 * Expõe meta fields do Yoast Schema via REST API
 * Necessário para o pipeline social-growth ativar schemas
 * programaticamente via REST API.
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

> **Onde colocar:** Aparência → Editor de Arquivos de Tema → `functions.php` → colar antes do `?>` final.
> **Executar uma vez apenas**, na ativação do cliente. Válido para todos os posts futuros.

## Maintenance Notes
- **Created on:** {{DATE}}
- **Last Verified:** never
