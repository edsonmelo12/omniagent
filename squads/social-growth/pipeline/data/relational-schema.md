# Relational Schema Draft

## Purpose

Define the minimum relational structure for the multi-agency platform.

This is the target schema for the persistence phase.
The same business concepts are drafted in the operational tools and persisted here as the source of truth.

This schema is intended to support:
- login and permissions
- agency and client isolation
- brand and offer intelligence
- creative direction and render inputs
- social intelligence snapshots
- youtube strategy analyses
- strategy intelligence assets
- briefs, blog content and proposals
- monitoring and evidence
- dashboard-ready reporting

Dashboard reports are derived from the persisted tables below and are not the primary source of truth.

## Core Tables

### agencies
- id
- name
- slug
- branding_json
- plan
- status
- created_at
- updated_at

### users
- id
- name
- email
- password_hash
- status
- created_at
- updated_at

### memberships
- id
- agency_id
- user_id
- role
- permissions_json
- created_at
- updated_at

### clients
- id
- agency_id
- name
- slug
- website_url
- segment
- status
- notes
- created_at
- updated_at

### client_sites
- id
- client_id
- url
- label
- source_type
- confidence
- created_at
- updated_at

### brand_profiles
- id
- client_id
- version
- status
- source_snapshot_id
- source_client_record_id
- source_market_research_id
- confirmed_json
- inferred_json
- proof_json
- confidence
- created_at
- updated_at

### brand_profile_sources
- id
- brand_profile_id
- source_url
- source_type
- collected_at
- confidence
- notes

### creative_profiles
- id
- client_id
- source_brand_profile_id
- source_offer_profile_id
- source_snapshot_id
- source_client_record_id
- source_market_research_id
- version
- status
- confidence
- confirmed_json
- inferred_json
- proof_json
- created_at
- updated_at

### creative_profile_sources
- id
- creative_profile_id
- source_url
- source_type
- collected_at
- confidence
- notes

### offer_profiles
- id
- client_id
- product_id
- version
- status
- confidence
- summary
- confirmed_json
- inferred_json
- proof_json
- created_at
- updated_at

### social_profiles
- id
- client_id
- platform
- handle
- profile_url
- discovery_source
- status
- confidence
- created_at
- updated_at

### social_intelligence_snapshots
- id
- client_id
- collected_at
- public_only
- confidence
- presence_score
- consistency_score
- proof_score
- conversion_readiness
- main_gaps_json
- opportunity_notes_json
- raw_notes
- created_at
- updated_at

Recommended payload shape:
- `brand`: name, category, region, pricing, delivery, CTA
- `audience`: primary, secondary, pains, desires, objections, awareness
- `offer`: main offer, supporting offers, hierarchy, UVP, promise, differentiators
- `signals`: color palette, typography, visual cues, motion cues, tone
- `creative`: palette anchors, typography direction, layout family, CTA style, source class, anti-repetition notes
- `proof`: testimonials, reviews, cases, before/after, process proof, gaps
- `confidence`: confirmed, inferred, partial, needs confirmation

### social_intelligence_sources
- id
- snapshot_id
- source_url
- source_type
- collected_at
- confidence
- notes

### youtube_strategy_analyses
- id
- client_id
- version
- status
- payload_json
- created_at
- updated_at

### strategy_intelligence_assets
- id
- client_id
- version
- kind
- source_analysis_id
- status
- payload_json
- created_at
- updated_at

### client_briefs
- id
- client_id
- version
- status
- payload_json
- created_at
- updated_at

### market_researches
- id
- client_id
- version
- status
- payload_json
- created_at
- updated_at

Recommended payload shape:
- `market`: scope, stage, maturity, positioning, density, weights, summary
- `competition`: clientUrl, competitors, competitorUrls, sourceUrls, competitorCount, benchmarkSummary
- `recommendations`: editorialPillars, differentiators, contentAngles, weights, nextPautas

### market_presence_baselines
- id
- client_id
- version
- scope
- market_context
- source_snapshot_id
- source_client_record_id
- source_market_research_id
- collected_at
- presence_score
- consistency_score
- proof_score
- conversion_score
- confidence_score
- profiles_count
- source_count
- evidence_count
- last_post_date
- notes
- payload_json
- created_at
- updated_at

### market_presence_interventions
- id
- client_id
- baseline_id
- period_start
- period_end
- actions_taken_json
- channels_edited_json
- content_volume
- cta_changes
- site_changes
- proof_changes
- notes
- payload_json
- created_at
- updated_at

### market_presence_checkpoints
- id
- client_id
- version
- baseline_id
- intervention_id
- source_snapshot_id
- source_client_record_id
- source_market_research_id
- collected_at
- presence_score
- consistency_score
- proof_score
- conversion_score
- confidence_score
- profiles_count
- source_count
- evidence_count
- last_post_date
- notes
- payload_json
- created_at
- updated_at

### market_presence_comparisons
- id
- client_id
- baseline_id
- checkpoint_id
- presence_delta
- consistency_delta
- proof_delta
- conversion_delta
- maturity_delta
- profiles_delta
- source_delta
- evidence_delta
- reading
- attribution
- analogy
- executive_summary
- payload_json
- created_at
- updated_at

### proposals
- id
- client_id
- version
- archetype
- thesis
- status
- payload_json
- created_at
- updated_at

Recommended payload shape:
- `marketResearchId`
- `source.marketResearchId`
- `marketResearch.summary`
- `slides` with separate market and proposal narratives

### blog_drafts
- id
- client_id
- version
- status
- payload_json
- created_at
- updated_at

### discovery_optimized_posts
- id
- client_id
- version
- status
- payload_json
- created_at
- updated_at

### content_repurpose_packages
- id
- client_id
- version
- status
- payload_json
- created_at
- updated_at

### content_plans
- id
- client_id
- version
- status
- payload_json
- created_at
- updated_at

### content_production_packages
- id
- client_id
- version
- status
- payload_json
- created_at
- updated_at

### approvals
- id
- client_id
- artifact_type
- artifact_id
- status
- approved_by
- approved_at
- notes
- created_at
- updated_at

### schedules
- id
- client_id
- version
- status
- payload_json
- created_at
- updated_at

### publishing_profiles
- id
- client_id
- channel
- provider
- account_label
- external_account_id
- secret_ref
- connection_status
- approval_mode
- publish_mode
- capabilities_json
- constraints_json
- last_validated_at
- last_error_code
- last_error_message
- created_at
- updated_at

### monitoring_reports
- id
- client_id
- period_start
- period_end
- status
- payload_json
- created_at
- updated_at

### evidence_files
- id
- client_id
- related_type
- related_id
- file_url
- file_name
- file_type
- source_url
- confidence
- created_at
- updated_at

## Relationship Rules

- One agency has many clients.
- One agency has many memberships.
- One user can belong to many agencies through memberships.
- One client can have many social profiles.
- One client can have many social intelligence snapshots.
- One snapshot can have many sources.
- One client can have many YouTube strategy analyses.
- One client can have many strategy intelligence assets.
- One strategy analysis can generate many strategy intelligence assets.
- One client can have many offer profiles derived from the active catalog.
- One offer profile belongs to one product at a time.
- One client can have many market presence baselines, interventions, checkpoints and comparisons.
- One baseline can have many interventions and checkpoints.
- One checkpoint can have one comparison.
- One client can have many briefs, research records, proposals, blog drafts, discovery-optimized posts, repurpose packages, plans, packages, schedules, publishing profiles and monitoring reports.
- One client can have many approvals tied to different artifacts.
- One client can have many evidence files.
- One client can have many publishing executions.
- One publishing execution should resolve to one publishing profile when live delivery is attempted.

## Suggested Constraints

- `agencies.slug` must be unique.
- `users.email` must be unique.
- `memberships` must be unique by `(agency_id, user_id)`.
- `clients.slug` must be unique per agency.
- `social_profiles` must be unique by `(client_id, platform, handle)`.
- `youtube_strategy_analyses.version` should be incrementing per client.
- `strategy_intelligence_assets` should be unique by `(client_id, version, kind)`.
- `offer_profiles` should be unique by `(client_id, product_id, version)`.
- `client_briefs.version`, `market_researches.version`, `proposals.version`, `blog_drafts.version`, `discovery_optimized_posts.version`, `content_repurpose_packages.version`, `content_plans.version`, `content_production_packages.version`, and `schedules.version` should be incrementing per client.
- `market_presence_baselines.version` and `market_presence_checkpoints.version` should be incrementing per client.
- `market_presence_comparisons` should be unique by `(baseline_id, checkpoint_id)`.
- `artifact_type` in approvals should reference a controlled list.
- `publishing_profiles` should be unique by `(client_id, channel, account_label)`.
- `publishing_profiles.secret_ref` should point to an external secrets backend, never to a raw token value.

## Recommended JSON Payloads

Use `payload_json` or equivalent structured columns for:
- client record details
- brand profile snapshots
- offer profile snapshots
- research findings
- proposal content
- blog draft content
- discovery optimization payloads
- content repurpose payloads
- content plan items
- content production package items
- schedule details
- monitoring summaries
- YouTube analysis payloads
- strategy intelligence payloads
- market presence baseline payloads
- market presence intervention payloads
- market presence checkpoint payloads
- market presence comparison payloads

This keeps the schema stable while allowing the content structure to evolve.

## Index Suggestions

- `clients(agency_id, status)`
- `social_profiles(client_id, platform)`
- `social_intelligence_snapshots(client_id, collected_at desc)`
- `client_briefs(client_id, version desc)`
- `blog_drafts(client_id, version desc)`
- `discovery_optimized_posts(client_id, version desc)`
- `content_repurpose_packages(client_id, version desc)`
- `proposals(client_id, version desc)`
- `monitoring_reports(client_id, period_end desc)`

## Data Rules

- Store raw evidence separately from interpreted summaries.
- Preserve timestamps on every record.
- Never overwrite the only historical snapshot.
- Keep the latest approved artifact and prior versions.
- Tag every record with the owning agency where relevant.

## Migration Path

The current Markdown files can be migrated gradually:
- extract identity and metadata into relational tables
- keep the narrative content in JSON payloads or linked documents
- render Markdown from the structured records when needed

## Final Recommendation

Use this schema as the minimum stable foundation for the product.
It is enough to power login, workspaces, intelligence, proposals and dashboards without locking the system into a brittle file-only model.
