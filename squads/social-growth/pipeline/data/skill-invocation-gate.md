# Skill Invocation Gate

This is a non-negotiable gate for every social post generation task in Social Growth Squad.

## Golden Rule

No social post, carousel, story sequence, Reel, single post, pin or derivative social asset may be created, visually directed, rendered, reviewed, exported or delivered unless the responsible agent has invoked the required skills for that step and recorded evidence of that invocation.

If skill invocation is missing, the asset is `BLOCKED`. A visually acceptable result does not compensate for missing skill evidence.

## Required Skills by Agent

### Creator

Must invoke:

- `copywriting`

Must also invoke when research/trend context is part of the task:

- `content-trend-researcher`

### Visual Director

Must invoke:

- `creative-director`
- `social-visual-system`
- exactly one native visual format skill per asset:
  - `instagram-carousel`
  - `stories-sequence`
  - `reels-sequence`
  - `facebook-post`
  - `linkedin-carousel`
  - `social-single-post`
  - `pinterest-pin`

### Creative Renderer

Must invoke:

- `social-visual-system`
- the exact visual format skill assigned in the Visual Decision Card for each asset

### Reviewer

Must invoke:

- `copywriting` when reviewing social copy
- `seo-2025-expert` when reviewing blog, SEO, GEO or discovery output
- the visual gate documents and the format skill evidence when reviewing visual social assets

### Pipeline Auditor

Must invoke:

- `pipeline-compliance-audit`

The Pipeline Auditor's report is invalid unless it includes its own ledger row
for `pipeline-compliance-audit`, source file
`skills/pipeline-compliance-audit/SKILL.md`, and a concrete audit rule applied
to the delivery.

## Invocation Means

An agent has invoked a skill only when all are true:

1. The agent loaded the corresponding `skills/{skill}/SKILL.md` before producing its output.
2. The output states which skill was loaded and where it was applied.
3. The output contains a `Skill Invocation Ledger` section.
4. The output demonstrates at least one concrete decision taken from the skill instructions.

Merely listing a skill name is not invocation.

## Required Ledger

Every artifact produced by Creator, Visual Director, Creative Renderer, Reviewer
and Pipeline Auditor for social post generation or delivery approval must include:

```md
## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Creator | copywriting | skills/copywriting/SKILL.md | AC-00-00 copy | Hook/CTA structure used in slides | invoked |
```

For Visual Director and Creative Renderer, include one row per asset for the native format skill.

## Selective Loading Rule

Visual Director and Creative Renderer must not load every native visual skill by default. They must load:

1. the base skill(s) required by the agent;
2. exactly one native format skill per asset;
3. additional references only when the VDC, RCC, route policy or audit packet requires them.

Selective loading does not relax the gate. The ledger still needs a concrete use for every required skill that was loaded.

## Veto Conditions

Reject and redo if any are true:

1. A required skill is absent from the `Skill Invocation Ledger`.
2. A ledger row has no concrete use.
3. A visual asset has no exact native format skill.
4. The renderer used a different format behavior from the skill assigned by Visual Director.
5. The Reviewer approves an asset without verifying the ledger.
6. The pipeline runner or operator creates a social asset manually while bypassing the skill-loading step.
7. The Pipeline Auditor returns `PASS` or `PASS_WITH_WARNINGS` without invoking `pipeline-compliance-audit`.

## Runner Rule

The pipeline runner must not execute social generation work inline unless it performs the same skill-loading and ledger requirements as a subagent. If that cannot be guaranteed, the runner must dispatch the declared subagent.

The pipeline runner must not execute Step 04B inline unless it first loads
`skills/pipeline-compliance-audit/SKILL.md` and records that invocation in the
audit report. If that cannot be guaranteed, dispatch `pipeline-auditor`.
