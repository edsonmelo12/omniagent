# Master Guide

## What This Squad Does

The `social-growth` squad turns client links, documents and notes into an editable client record, a market read, a research brief, an organic content plan, a discoverable blog layer, repurposed social assets and a monitored publishing cycle.
The squad keeps the original planning flow intact; live publishing is not a new squad agent. The backend now records a local publishing execution layer with dry-run and live-simulated output, while platform adapters remain a later integration layer.
Commercial proposal generation stays optional and is only used after the proposal checkpoint when the client needs a sales deck or offer recommendation.
Before any proposal output is generated, the squad must ask the canonical proposal checkpoint question and only continue if the user opts in.
When the proposal is used, the output should open with the presentation header, title, objective, thesis and archetype before the long-form text.
Every research cycle must follow [research-and-proposal-route.md](research-and-proposal-route.md) so the output can be reused as a proposal, presentation or dashboard input.
Every research cycle must be persisted in the database before strategy starts.
Every strategy cycle must consult the persisted strategy library before selecting the thesis.
Research stays analytical until a downstream artifact is explicitly requested.
When the cycle is client-facing, the consolidated report should be saved as `output/<client-slug>/client-report.md`.

## Core Flow

Use the canonical sequence docs instead of restating the pipeline here:

- [Campaign State Machine](campaign-state-machine.md)
- [Stage Contracts](stage-contracts.md)
- [blog-content-flow.md](blog-content-flow.md)
- [campaign-transition-workflow.md](campaign-transition-workflow.md)

The only rule at this level is: do not start downstream work before the upstream record, research and strategy state are in place.

## Who Owns What

- Intake: sources and first draft client record
- Strategy: priorities and cadence
- Blog Architect: thesis, structure family and proof map for long-form blog
- Creator: channel-native content
- Blog Writer: long-form blog drafts from approved architecture
- Discovery Optimizer: article-level SEO, GEO and LLM finalization for discoverability
- GEO / AI discoverability audit: handled upstream in research and strategy when the site or entity is still ambiguous
- Content Repurposer: blog-to-social translation
- Reviewer: quality, clarity and output integrity
- Pipeline Auditor: process compliance before any user approval, scheduling or publishing
- Scheduler: publication order
- Monitor: performance and actions

Publishing is still modeled as a campaign stage, but not as a new squad role.
It is handled by the approval-gated flow and the backend publishing executor, which records validation and result output without claiming platform API delivery.
Client credentials must live in an external secrets backend and be resolved through a `secret_ref` owned by the publishing module, never through Markdown files or raw database fields.

## Global Blog Standards

The universal policy for all blog output lives in [blog-policy.md](blog-policy.md). If long-form content is in scope, use [blog-content-flow.md](blog-content-flow.md) as the working sequence.

The high-level rules remain simple:

- blog length is decided by function, not by client;
- the featured image must reinforce the post thesis, not the category;
- visual sourcing is free/public by default;
- the article must prove a point, not only explain a topic.

## Blog Skill Dynamics

Use the skill sequence only as needed and keep it tied to the canonical blog flow:

1. `content-trend-researcher`
2. `copywriting`
3. `write-seo-geo-content`
4. `seo-2025-expert`
5. `review`

Important:
- do not flatten every article into the same skeleton;
- preserve the selected section arc;
- reject generic featured images or convenience picks;
- scripted generators are not part of the valid writing flow.

## What to Open First

1. `start-here.md`
2. `operational-index.md`
3. `internal-quickstart.md`
4. `research-and-proposal-route.md`

## What to Check Every Time

- client record
- market research
- presence digital map
- audience hypotheses
- trend-signal backlog (content phase only)
- content plan
- blog architecture
- blog draft
- optimized blog post
- repurpose package
- review
- schedule plan
- monitoring notes

## Social Visual Production Gate

Every social visual asset must pass `visual-production-gate.md` before it can move between visual direction, rendering, review and export.

Every social visual asset must also satisfy the canonical generation checklist in `generation-contract.md`.

- Visual Director must create a Visual Decision Card for each social asset.
- Creative Renderer must create a Render Compliance Card for each rendered social asset.
- Reviewer must block approval when either card is missing or incomplete.
- Blog-derived social assets must check `output/{client}/blog/assets/` first and either use a thesis-relevant background image or justify `texture-only` / `no-image-justified`.
- Campaign-hub preview behavior, typography family, minimum font size, final canvas, navigation and export validation are required decisions, not optional notes.

## Pipeline Compliance Gate

Every delivery must pass `step-04b-pipeline-compliance-audit.md` after Reviewer and before any user approval checkpoint.

- Pipeline Auditor must create `output/{client}/review/pipeline-compliance-{asset-or-batch-id}.md`.
- The report must return `PASS` or `PASS_WITH_WARNINGS` before Step 05 can ask the user for approval.
- `BLOCKED` or `INVALID` stops the flow and routes the work back to the failed upstream step.
- A good-looking asset or article is not enough; missing evidence means the step did not happen.
- Hub, schedule, queue and publishing updates must not be finalized before the compliance audit passes.

## Simple Rule

If the client record changes, reopen research and everything downstream.
If the research changes, reopen strategy and everything downstream.
If the strategy library changes, rerun strategy and regenerate any downstream content that depends on it.
If the strategy changes, rebuild the content plan, blog architecture, blog draft, discovery-optimized post, repurpose package and schedule.
If the blog architecture changes, rebuild the blog draft, discovery-optimized post, repurpose package and review chain.
If the research is analytic only and no proposal was requested, do not generate the proposal module.
If the blog changes, rerun discovery optimization and repurpose before review.
If the repurpose changes, rerun review before publishing.
If the content changes, review before publishing.
If the review passes, run the pipeline compliance audit before asking the user for approval.
If the pipeline compliance audit is `BLOCKED` or `INVALID`, do not ask for approval, schedule or publish.
If publishing adapters are introduced later, keep them outside squad role expansion unless the workflow proves that a dedicated executor is needed.
If the article length or featured image does not reinforce the thesis, rebuild the blog architecture before drafting.
