# Publishing Profile: {{CLIENT_NAME}}

> **INSTRUÇÕES PARA O CONFIGURADOR:**
> Preencha as informações abaixo para habilitar a publicação automática via Wagner WordPress.
> Após preencher, remova a marcação [PENDENTE].

## WordPress Connection
- **Website URL:** https://amiclube.com.br
- **REST API User:** edsonrmjunior
- **Application Password:** CoBy YZRb OjNf tUV3 I9sw Ma6Q

## Preferences
- **Default Post Status:** future
- **Scheduling Timezone:** America/Sao_Paulo
- **Cron Monitor Command:** `npm run social:monitor:wordpress-future -- --client amiclube`
- **Cron Social Queue Build:** `npm run social:build:publish-queue -- --client amiclube`
- **Cron Social Worker:** `npm run social:run:publish-worker -- --client amiclube`
- **Cron Social Monitor:** `npm run social:monitor:publish-queue -- --client amiclube`
- **Default Category ID:** 5 (Blog)
- **Enable Featured Image:** yes
- **Channel Eligibility Policy:** `squads/social-growth/output/amiclube/publishing/channel-eligibility.json`
- **Social Link Lifecycle Policy:** `squads/social-growth/output/amiclube/publishing/social-link-lifecycle.json`
- **Social Publish Assets Policy:** `squads/social-growth/output/amiclube/publishing/social-publish-assets-policy.json`
- **Category Governance Policy:** `squads/social-growth/output/amiclube/publishing/wordpress-category-governance.json`
- **Category Cache Snapshot:** `squads/social-growth/output/amiclube/publishing/wordpress-categories-cache.json`

## Maintenance Notes
- **Created on:** {{DATE}}
- **Last Verified:** 2026-04-22 (category sync + governance ensure)
- **Schema Setup:** 2026-04-28 — `register_post_meta` para `_yoast_wpseo_schema-page-type` e `_yoast_wpseo_schema-article-type` adicionado ao `functions.php`
- **Schema Status:** ✅ Ativo — pipeline consegue setar FAQPage/BlogPosting via REST API
