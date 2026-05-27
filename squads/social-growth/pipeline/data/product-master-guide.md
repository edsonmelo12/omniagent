# Product Master Guide - Social Growth Platform

## Purpose

Consolidate the product direction for the `social-growth` squad into one reference:
- operating model
- social intelligence
- blog discovery and repurposing
- commercial proposals
- relational schema
- MVP roadmap
- screen map

This guide is the single entry point for future product decisions.

## Product Direction

The squad uses PostgreSQL as the stable runtime store.
Markdown artifacts are optional review and delivery copies, not the authoritative layer.

### Core Principles
- PostgreSQL is the source of truth for clients, products and services.
- Markdown remains the human-readable delivery and review layer when needed.
- Each agency is isolated as a tenant.
- Each client lives in its own workspace.
- Social intelligence must be collected before a proposal is built.
- The brand profile must be generated from intake and research before content or proposal work starts.
- The creative profile must be generated from intake, brand and social evidence before visual direction or render work starts.
- The blog layer must be optimized for SEO, GEO and LLM readability before it is repurposed into social assets.
- When the site or entity is still unclear, run the GEO / AI discoverability audit before scaling content.
- Proposals are optional and must be generated from evidence, not guesses when the client needs a sales deck.
- Before any proposal cycle starts, the system must ask the proposal checkpoint question and only build the consolidated commercial report if the user opts in.
- The first UI should stay compact and operational.

## What the Product Solves

- removes manual social searching from proposal building
- turns site + social signals into a structured diagnosis
- turns research into a blog architecture, article and discovery-optimized final draft
- turns long-form content into native social assets without rewriting strategy from scratch
- turns long-form strategic references into reusable strategy assets
- turns strategy into repeatable reels and motion pieces when the campaign needs short-form video
- supports repeated client cycles with history and versioning
- prepares the system for dashboarding and future multi-agency scale

## Operating Model

### Input
- website
- social links
- documents
- discovery notes
- analytics exports when available

### Processing
1. Discover official profiles.
2. Collect social intelligence.
3. Build or update the client record.
4. Run market research and the GEO / AI discoverability audit when needed.
5. Build the creative profile from the approved brand and social evidence.
6. Optionally generate the proposal after the checkpoint.
7. If long-form content is in scope, follow `blog-content-flow.md`.
8. Create content and schedule.
9. Monitor and iterate.

### Output
- client record
- research
- proposal
- blog architecture
- blog draft
- optimized blog post
- repurposed social assets
- content plan
- schedule
- monitoring summary

## Key Modules

### Social Intelligence Intake
Collects public social signals and confirmed analytics when available.

### Social Intelligence Summary
Stores the structured evidence layer before proposal creation.

### GEO / AI Discoverability Audit
Stores the site-level entity clarity, answerability, proof density and schema readiness used before article-level discovery optimization.

### Brand Profile Template
Stores the confirmed and inferred brand and offer intelligence used by content, motion and proposal modules.

### Creative Profile
Stores the confirmed and inferred creative system used by the visual director and renderer: palette anchors, typography cues, layout family, channel priority, image risk, source class and anti-repetition notes.

The creative profile is client-specific visual DNA. It should stabilize the look of a client without freezing the composition into a single template.

### Creative Decision Order

The system should decide creative direction in this order:

1. client niche
2. client creative profile
3. post objective
4. post idea
5. format and channel
6. composition
7. typography
8. CTA
9. export and finishing

The niche should lead the image search.
The post idea should shape the message.
The creative profile should keep the result coherent across all pieces for that client.

### Strategy Intelligence Intake
Stores reusable strategic mechanisms extracted from podcasts, cases and interviews.

### Blog Architect
Creates the thesis, structure family and proof map for long-form blog content before drafting.

### Blog Writer
Creates long-form blog drafts from the approved strategy, research context and blog architecture.

### Discovery Optimizer
Finalizes the blog for SEO, content GEO and LLM discoverability, including author and schema blocks.
If the brand or site itself is ambiguous, the upstream GEO / AI discoverability audit should run first.

### Content Repurposer
Translates the optimized blog into native social assets such as LinkedIn posts, carousels and short-form scripts.

### Social Sales Proposal Module
Selects the archetype and builds the commercial proposal from evidence after the checkpoint is confirmed, rendering the presentation header first with title, objective, thesis and archetype.
It should only run after the proposal checkpoint confirms that the cycle needs the commercial report.

### Proposal and Deck Template
Defines the shared structure for proposal Markdown and slide-deck Markdown so every client follows the same research-to-presentation route. The deck should surface before the long-form text when both are requested.

### Client Report Template
Defines the single consolidated delivery file for a client. The final report lives in a client-named folder as `client-report.md` and gathers research, intelligence, proposal and deck summary in one place.
This is the target when the user answers yes to the proposal checkpoint.

### Multi-Agency Platform Blueprint
Defines the long-term SaaS direction for agencies and client workspaces.

### Backend Architecture Blueprint
Defines the TypeScript API layer, tenant boundaries, and local-to-remote database path.

### API Contract Draft
Defines the first HTTP surface for auth, clients, intelligence, proposals and monitoring.

### Backend Folder Structure
Defines the backend repository layout and module boundaries.

### Relational Schema Draft
Defines the minimum database structure for the platform.

### MVP Roadmap
Defines what to build first and what to defer.

### Screen Map
Defines the minimum UI needed for the first release.

## Product Stack Recommendation

- PostgreSQL for relational storage
- API layer for business rules
- web dashboard for agency and client operations
- file storage for evidence and attachments
- Markdown exports for human-readable delivery

## Tenant Model

### Agency
The top-level tenant. Holds branding, users, clients and billing later.

### Client Workspace
The isolated workspace within an agency. Holds:
- site
- social profiles
- intelligence snapshots
- client record
- research
- proposal
- consolidated client report
- proposal deck summary
- content
- blog
- repurposed social assets
- monitoring

## Permissions

- `admin_agency`
- `strategist`
- `social_media`
- `reviewer`
- `client`
- `viewer`

## Minimum Data Model

### Tables
- agencies
- users
- memberships
- clients
- client_sites
- brand_profiles
- brand_profile_sources
- creative_profiles
- creative_profile_sources
- social_profiles
- social_intelligence_snapshots
- social_intelligence_sources
- strategy_intelligence_sources
- strategy_intelligence_assets
- client_briefs
- market_researches
- proposals
- content_plans
- content_production_packages
- approvals
- schedules
- monitoring_reports
- evidence_files

## MVP Release Order

1. Markdown operating artifacts
2. PostgreSQL schema
3. Authentication and tenants
4. Client workspace and client record
5. Social intelligence collection
6. Strategy intelligence intake
7. Optional proposal generation
8. Monitoring
9. Dashboard UI

## Screen Set

### Agency Area
- dashboard
- clients
- proposals
- approvals
- monitoring

### Client Area
- overview
- social intelligence
- client record
- market research
- proposal
- content
- monitoring

### Operations Area
- source intake
- evidence library
- builder views

## Content and Proposal Logic

- The system chooses an archetype from the diagnostic evidence.
- Archetypes available:
  - Presença
  - Autoridade
  - Conversão
  - Escala
- The system should ask the proposal checkpoint before choosing whether the consolidated client report is part of the cycle.
- The proposal uses a fixed 7-slide structure with variable blocks.
- The proposal and deck share the same universal narrative order.
- The offer must match the client’s actual stage and gap.
- The content engine may render short-form motion assets through the Remotion video skill when the weekly plan includes reels or discovery video.
- The blog layer should carry `TL;DR`, `author`, `source notes` and schema before repurpose.

## What Not to Do

- do not treat Markdown as the source of truth
- do not let the product drift back to file-based persistence
- do not require manual social searching before proposal creation
- do not treat strategy extraction as disposable analysis when it should be reusable
- do not skip the GEO / AI discoverability audit when the site or entity is still unclear
- do not ship long-form content without discovery optimization when the blog is meant to be found
- do not repurpose a blog before the long-form draft is approved
- do not invent analytics
- do not build a large dashboard before the operational core exists
- do not collapse all clients into one generic flow

## Success Criteria

- agencies can onboard clients cleanly
- the system can discover and summarize social presence
- the proposal is built from evidence when requested
- the database can support dashboard views
- the platform can expand to multiple agencies without redesign

## Final Recommendation

Build the system in this order:
1. Markdown operating layer
2. relational core
3. social intelligence
4. brand profile
5. strategy intelligence
6. optional proposal generation
7. blog discovery and repurposing
8. monitoring
9. dashboard
10. multi-agency scale

This keeps the product professional, maintainable and ready to grow.

## Squad Improvement Layer

- [Squad Improvement Roadmap](squad-improvement-roadmap.md)
- [Campaign State Machine](campaign-state-machine.md)
- [Stage Contracts](stage-contracts.md)
- [Campaign Backend Map](campaign-backend-map.md)
