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

1. Intake sources
2. Build the client record
3. Add market context, presence digital and audience hypotheses
4. Create strategy
5. Optionally produce a commercial proposal after the checkpoint, presentation-first
6. Build blog architecture when long-form content is in scope
7. Produce content only after research, strategy and blog architecture are closed
8. Optimize discovery content
9. Repurpose into native social assets
10. Review quality
11. Audit pipeline compliance
12. Approve schedule
13. Publish
14. Monitor
15. Adjust the next cycle

This flow is governed by the [Campaign State Machine](campaign-state-machine.md) and [Stage Contracts](stage-contracts.md).

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

The universal policy for all blog output lives in [blog-policy.md](blog-policy.md). The rules below are the operational summary that every client must follow.

- Blog length is decided by function, not by client.
- The featured image must reinforce the post thesis, not the client category.
- The featured image must be selected by explicit thesis/topic criteria, not category convenience.
- Visual sourcing must be free or public by default; paid stock is not the standard path.
- Avoid generic stock imagery unless the topic genuinely benefits from a literal scene.
- Prefer original or topic-specific visuals when the article is conceptual, strategic or proof-led.
- Use `BlogPosting` only when the visible article supports editorial content.
- Use `FAQPage` only when the FAQ is present in the visible article.
- Use `Organization` and `WebSite` for entity pages, not for generic blog posts.
- Schema must follow the visible content; never add markup to compensate for missing substance.
- The article must prove a point, not only explain a topic.
- A post that feels inevitable for the theme is better than one that feels generic for the market.

## Blog Skill Dynamics

The blog flow uses skills in sequence, and each skill has a different job:

1. `content-trend-researcher` validates the angle, information gain, and anti-repetition path before drafting.
2. `copywriting` locks the reader, promise, objection, hook strategy, and CTA direction before body writing starts.
3. `write-seo-geo-content` turns the approved brief into a family-specific article with search, proof, and extractability discipline.
4. `seo-2025-expert` tightens retrieval, entity clarity, source framing, and GEO/AI visibility without flattening the chosen structure.
5. `review` validates length, proof, hook quality, featured image selection criteria, and anti-repetition before publication.

Important:
- Optimization may improve headings, but it must not normalize every article into the same skeleton.
- The writer must preserve the selected section arc from the architecture step.
- The reviewer must reject output that reads like a repeated mold even if the copy itself is technically correct.
- The reviewer must reject output if the featured image is generic, mismatched or selected by convenience instead of criteria.
- A family label is not permission to use a prose template. Every final article must be authored from the brief, architecture, and proof context for that specific client and topic.
- Scripted article generators are not part of the valid blog flow. They may only support rendering or packaging after the final copy already exists.

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
