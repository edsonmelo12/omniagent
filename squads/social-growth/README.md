# Social Growth Squad

Squad para operar redes sociais e blog de clientes com foco em intake, registro editavel, pesquisa, estrategia, criacao, otimizacao de descoberta, repurpose, direcao visual, renderizacao, revisao, agenda e monitoramento.
A camada de inteligência social e de mercado e contextual: pode ser local, regional, nacional ou por nicho, dependendo do cliente.
Toda pesquisa deve seguir o roteiro universal em [pipeline/data/research-and-proposal-route.md](pipeline/data/research-and-proposal-route.md) para garantir que o resultado possa virar apresentação, proposta, dashboard, blog ou repurpose.
Quando houver proposta comercial, a primeira saída para o cliente deve ser o deck/apresentação com título, objetivo, tese e arquétipo, seguido do texto consolidado.
Quando a entrega for client-facing, o resultado final deve ficar em `output/<cliente>/client-report.md`.
Marca e oferta sao camadas diferentes: a marca permanece no contexto do cliente e a oferta ativa mora no catalogo de produtos/servicos. A API ainda aceita `product` como alias tecnico, mas a interface e os artefatos novos devem priorizar `offer` e `offer profile`.

## Delivery Phases

1. Database-first
   - o banco é a fonte de verdade para clientes, produtos, registros e estratégias
   - os artefatos em Markdown passam a ser apenas documentação ou material derivado
2. Markdown outputs
   - os arquivos em `output/**/*.md` podem existir como cache, revisão humana ou histórico
   - não devem ser tratados como entrada obrigatória para o sistema

## Entry Points

0. [Comece Aqui](pipeline/data/comece-aqui.md)
1. [Start Here](pipeline/data/start-here.md)
2. [Master Guide](pipeline/data/master-guide.md)
3. [Operational Index](pipeline/data/operational-index.md)
4. [Internal Quickstart](pipeline/data/internal-quickstart.md)
5. [Product Master Guide](pipeline/data/product-master-guide.md)
6. [Backend Architecture Blueprint](pipeline/data/backend-architecture.md)
7. [API Contract Draft](pipeline/data/api-contract.md)
8. [Backend Folder Structure](pipeline/data/backend-folder-structure.md)

## Current Flow

1. Intake sources
2. Social intelligence summary
3. Build brand profile and client record
4. Build creative profile
5. Strategy intelligence intake
6. Add market context
7. Create strategy
8. Build ranked blog topic backlog (trend-validity gated)
9. Optional: generate a commercial proposal, presentation-first
10. Produce content
11. Optimize discovery content
12. Repurpose into native social assets
13. Create visual direction
14. Render creative assets
15. Review quality with publication scorecard (publish/revise/hold)
16. Approve schedule
17. Publish
18. Monitor
19. Adjust the next cycle

## Core Working Files

- [Market Intel](output/research/market-intel.md)
- [Content Plan](output/strategy/content-plan.md)
- [GEO / AI Discoverability Audit](../../_opensquad/core/best-practices/geo-ai-discoverability.md)
- [Discovery Optimization Guide](pipeline/data/content-discovery-optimization.md)
- [Blog Draft](output/blog/blog-post-draft.md)
- [Blog Post](output/blog/blog-post.md)
- [Content Repurpose](output/repurposing/content-repurpose.md)
- [Content Production Package](output/content/content-production-package.md)
- [Creative Folder Index](output/creative/README.md)
- [Visual Direction](output/creative/visual-direction.json)
- [Creative Validation Checklist](output/creative/validation-checklist.md)
- [Daily Validation Template](output/creative/daily-validation-template.md)
- [Creative Playbook](output/creative/operational-playbook.md)
- [Rendered Assets](output/creative/rendered-assets.md)
- [Content Review](output/review/content-review.md)
- [Schedule Plan](output/publishing/schedule-plan.md)

## Creative Direction Layer

The squad uses a dedicated creative-direction skill to reduce repetition and increase visual variation in batch production.
The creative decision order is: niche first, then client creative profile, then post objective, then post idea.

- Skill: [Creative Director](../../skills/creative-director/SKILL.md)
- Reference files:
  - [Creative Rules](../../skills/creative-director/references/creative-rules.md)
  - [Art Directions](../../skills/creative-director/references/art-directions.md)
  - [Anti-Repetition](../../skills/creative-director/references/anti-repetition.md)
  - [Examples](../../skills/creative-director/references/examples.md)
  - [Test Prompts](../../skills/creative-director/references/test-prompts.md)

Use this layer before finalizing the visual brief for any client batch.
When the piece is image-led, the preferred pattern is a suggestive full-bleed background, controlled dark overlay, and clear typography in the client's palette.

## Operating Rules

- The database is the single source of truth for clients, offers and brand context.
- The current client record and market research live in the database, not in Markdown output files.
- If the offer changes, update the database record first.
- If strategy changes, rebuild the content plan, blog, discovery optimization and schedule from DB-backed records.
- If the blog changes, rerun discovery optimization and repurpose before publishing.
- If the repurpose changes, regenerate the content production package before review.
- If a Markdown artifact changes, treat it as a derivative view unless the DB was updated too.
- Final blog output must be generated through the squad flow: brief -> architecture -> draft -> discovery optimization -> review.
- Do not use family-based article generators, hardcoded scripts, or reusable prose templates as a shortcut for final blog delivery.
- Scripts may assist with rendering, indexing, or format conversion, but they may not author or rewrite the final article body.
- Any blog artifact that bypasses the skill-driven flow is invalid and must be regenerated through the squad.

## Useful References

- Backend environment example: `backend/.env.example`
- Brave Search is configured only in the backend via `BRAVE_SEARCH_API_KEY`
- Meta Graph API is configured only in the backend via `META_GRAPH_ACCESS_TOKEN`
- Instagram Business Discovery also expects `META_INSTAGRAM_BUSINESS_ACCOUNT_ID`
- YouTube presence enrichment is configured only in the backend via `SOCIAL_PRESENCE_YOUTUBE_API_KEY`
- The dashboard does not need provider-specific environment variables
- If the API keys are empty, the backend skips the API path and keeps the HTML fallback and database flow running
- Brave Search also helps discover social profile URLs when the client site does not expose them clearly
- Meta Graph API is used first for Facebook and Instagram presence when the token is configured
- Social presence history now lives in the backend as `social_presence_snapshots`
- Social presence collection is API-first when a provider is configured, with HTML scraping as fallback
- [Naming Standard](pipeline/data/naming-standard.md)
- [Research and Proposal Route](pipeline/data/research-and-proposal-route.md)
- [Proposal and Deck Template](pipeline/data/proposal-and-deck-template.md)
- [Comece Aqui](pipeline/data/comece-aqui.md)
- [Social Intelligence Intake](pipeline/data/social-intelligence-intake.md)
- [Contextual Market Intelligence](pipeline/data/contextual-market-intelligence.md)
- [Strategy Intelligence Intake](pipeline/data/strategy-intelligence-intake.md)
- [Social Intelligence Summary Template](pipeline/data/social-intelligence-summary-template.md)
- [Social Sales Proposal Module](pipeline/data/social-sales-proposal-module.md)
- [Client Workspace Update](pipeline/data/client-workspace-update.md)
- [Multi-Agency Platform Blueprint](pipeline/data/multi-agency-platform.md)
- [Backend Architecture Blueprint](pipeline/data/backend-architecture.md)
- [API Contract Draft](pipeline/data/api-contract.md)
- [Backend Folder Structure](pipeline/data/backend-folder-structure.md)
- [Relational Schema Draft](pipeline/data/relational-schema.md)
- [MVP Roadmap](pipeline/data/mvp-roadmap.md)
- [Screen Map](pipeline/data/screen-map.md)
- [Local DB Setup](pipeline/data/local-db-setup.md)
- [Migration Order](pipeline/data/migration-order.md)
- [Postgres Local README](infra/postgres/README.md)
- [Social Intelligence Step](pipeline/steps/step-00-social-intelligence.md)
- [Client Intake Guide](pipeline/data/client-intake-guide.md)
- [Daily Usage Guide](pipeline/data/daily-usage-guide.md)
- [Daily Execution Checklist](pipeline/data/daily-execution-checklist.md)
- [Account Launch Kit](pipeline/data/account-launch-kit.md)
- [Campaign Transition Workflow](pipeline/data/campaign-transition-workflow.md)
- [Campaign Planning Gate](pipeline/data/campaign-planning-gate.md)
- [Campaign Planning Pack](pipeline/data/campaign-planning-pack.md)
- [Campaign Review Pack](pipeline/data/campaign-review-pack.md)
- [Next Cycle Briefing](output/amiclube/strategy/next-cycle-briefing.md) review copy only
- [YouTube Intelligence Brief Quickstart](pipeline/data/youtube-intelligence-brief-quickstart.md)
- [YouTube Intelligence Consolidated Brief Template](pipeline/data/youtube-intelligence-consolidated-brief-template.md)
- [YouTube Intelligence Client Adaptation Template](pipeline/data/youtube-intelligence-client-adaptation-template.md)
- [Weekly Cycle Template](pipeline/data/weekly-cycle-template.md)
- [Monitoring KPIs](pipeline/data/monitoring-kpis.md)
- [Action Playbook](pipeline/data/action-playbook.md)
