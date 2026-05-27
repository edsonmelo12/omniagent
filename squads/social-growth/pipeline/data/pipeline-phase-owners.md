# Pipeline Phase Owners

## Purpose

Expose, in one place, who is responsible for each pipeline phase so users can see ownership clearly before and during execution.

## Source of Truth

- Primary runtime source: `squads/social-growth/squad.yaml` under `pipeline.phase_owners`.
- Step-level contract: each `pipeline/steps/step-*.md` must declare `agent` in frontmatter.
- Human checkpoints must declare explicit `owner` in frontmatter.

## Ownership Matrix

| Phase | Step | Owner |
|---|---|---|
| 00 | `step-00-intake-sources.md` | `intake` |
| 00B | `step-00-social-intelligence.md` | `researcher` |
| 01 | `step-01-build-client-record.md` | `intake` |
| 01B | `step-01b-geo-ai-discoverability.md` | `geo-audit` |
| 01 | `step-01-research-market.md` | `researcher` |
| 02 | `step-02-strategy-plan.md` | `strategist` |
| 03AA | `step-03aa-build-blog-topic-backlog.md` | `strategist` |
| 03BA | `step-03ba-build-blog-brief.md` | `strategist` |
| 03BB | `step-03bb-build-blog-architecture.md` | `blog-architect` |
| 03D | `step-03d-create-blog-post.md` | `blog-writer` |
| 03E | `step-03e-optimize-discovery-content.md` | `discovery-optimizer` |
| 03F | `step-03f-repurpose-content.md` | `content-repurposer` |
| 03 | `step-03-create-content.md` | `creator` |
| 03A1 | `step-03a1-generate-social-drafts.md` | `content-repurposer` |
| 03B | `step-03b-create-visual-direction.md` | `visual-director` |
| 03C | `step-03c-render-creative.md` | `creative-renderer` |
| 04 | `step-04-review-content.md` | `reviewer` |
| 05 | `step-05-approve-schedule.md` | `user-checkpoint` |
| 06 | `step-06-schedule-delivery.md` | `scheduler` |
| 06B | `step-06b-publish-to-wordpress.md` | `wagner-wordpress` |
| 06B1 | `step-06b1-resolve-article-urls.md` | `wagner-wordpress` |
| 07 | `step-07-monitor-health.md` | `monitor` |
| 08 | `step-08-atos-analise-estrategica.md` | `atos-analista` |
| 09 | `step-09-action-recommendations.md` | `strategist` |
| 10 | `step-10-approve-strategy-decisions.md` | `user-checkpoint` |

## Operational Artifact Owners (Mandatory)

| Artifact | Build/Refresh Owner | Approval Owner | Consumption Phase |
|---|---|---|---|
| `output/{client}/review/campaign-manifest.json` | `reviewer` | `user-checkpoint` | 04 -> 05 -> 06/06B |
| `output/{client}/review/campaign-hub.html` | `reviewer` | `user-checkpoint` | 04 -> 05 -> 06/06B |

## Rule

Any new phase is non-compliant until it has:

1. a declared owner in `squad.yaml` `pipeline.phase_owners`
2. an `agent` or explicit checkpoint `owner` in the step frontmatter
3. a visible row in this matrix

## Runtime Visibility Rule

During any run, the user must always be able to see:

1. the current phase/step
2. the responsible specialist agent
3. the current status (`running`, `checkpoint`, `done`)
4. the next handoff target when applicable
5. pending approvals when applicable (`agenda`, `estratégia`)

Primary runtime status source remains `squads/social-growth/state.json`.
