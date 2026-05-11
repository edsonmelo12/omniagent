# Publishing Profile: {{CLIENT_NAME}}

> **INSTRUÇÕES PARA O CONFIGURADOR:**
> Preencha as informações abaixo para habilitar a publicação automática via Wagner WordPress.
> Após preencher, remova a marcação [PENDENTE].

## WordPress Connection
- **Website URL:** [PENDENTE] (Ex: https://seusite.com)
- **REST API User:** [PENDENTE] (Seu nome de usuário)
- **Application Password:** [PENDENTE] (Gere em Usuários > Perfil no WordPress)

## Preferences
- **Default Post Status:** future
- **Scheduling Timezone:** America/Sao_Paulo
- **Cron Monitor Command:** `npm run social:monitor:wordpress-future -- --client {{client-slug}}`
- **Cron Social Queue Build:** `npm run social:build:publish-queue -- --client {{client-slug}}`
- **Cron Social Worker:** `npm run social:run:publish-worker -- --client {{client-slug}}`
- **Cron Social Monitor:** `npm run social:monitor:publish-queue -- --client {{client-slug}}`
- **Default Category ID:** [PENDENTE] (O ID numérico da categoria no WP)
- **Enable Featured Image:** yes
- **Channel Eligibility Policy:** `squads/social-growth/output/{{client-slug}}/publishing/channel-eligibility.json`
- **Social Link Lifecycle Policy:** `squads/social-growth/output/{{client-slug}}/publishing/social-link-lifecycle.json`
- **Social Publish Assets Policy:** `squads/social-growth/output/{{client-slug}}/publishing/social-publish-assets-policy.json`

## Maintenance Notes
- **Created on:** {{DATE}}
- **Last Verified:** never
