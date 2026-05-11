---
name: pipeline-compliance-audit
description: >
  Audits whether a Social Growth Squad delivery followed the required workflow
  before user approval, scheduling, publishing, or hub finalization. Use after
  content review and before any approval checkpoint for blog posts, social
  assets, regenerations, WordPress publishing packages, and mixed campaign
  batches.
type: prompt
version: "1.0.0"
categories:
  - governance
  - audit
  - pipeline
  - quality-gate
---

# Pipeline Compliance Audit

This skill verifies process compliance. It does not judge whether copy, design,
or strategy is good. It answers one question:

> Is there enough evidence that the squad followed the required pipeline?

When an approved or reviewed delivery needs correction, it also answers:

> Where did the defect originate, why did it pass, what did the squad learn, and
> what mitigation prevents recurrence?

## Golden Rule

If there is no evidence file, command output, explicit verdict, or recorded
checkpoint, the step is considered not executed.

Do not accept verbal claims, good-looking output, inferred skill usage, or
previous reputation as evidence.

## When to Use

Use this skill:

- after `step-04-review-content.md`;
- before `step-05-approve-schedule.md`;
- before updating final campaign hub links, scheduling queues, WordPress status,
  social publish queues, or live publishing manifests;
- after any regeneration that changes copy, visual direction, render, format,
  skill, schedule, or publishable asset;
- after a user reports a defect in an already reviewed or approved asset;
- after any hub/manifest/draft/preview mismatch;
- after any correction that creates or updates a blocking rule;
- when the user asks whether the squad followed the pipeline.

## What to Read First

Load the relevant context before auditing. Always load the baseline files first, then add only the mode-specific files required by the Audit Packet.

Baseline files:

- `squads/social-growth/pipeline/data/audit-packet-template.md`
- `squads/social-growth/pipeline/pipeline.yaml`
- `squads/social-growth/pipeline/steps/step-04-review-content.md`
- `squads/social-growth/pipeline/steps/step-05-approve-schedule.md`
- `squads/social-growth/pipeline/data/skill-invocation-gate.md`
- `squads/social-growth/pipeline/data/pipeline-integrity-gate.md`

Mode-specific files:

- `squads/social-growth/pipeline/data/visual-production-gate.md`
- `squads/social-growth/pipeline/data/visual-evidence-contract.md`
- `squads/social-growth/pipeline/data/blog-policy.md`, for blog deliveries
- `squads/social-growth/pipeline/data/wordpress-scheduling-cron-policy.md`, for WordPress deliveries
- `squads/social-growth/pipeline/data/social-scheduling-cron-policy.md`, for social deliveries
- all artifact paths declared by the executor, reviewer, or previous step
- `squads/social-growth/pipeline/data/pipeline-incident-trace-template.md`, when the audit is triggered by a correction, regeneration, post-approval defect or mismatch
- prior `squads/social-growth/output/{client}/review/incident-trace-*.md` files, when checking recurrence

When an Audit Packet is provided, treat it as the scope boundary. Do not broaden into all `review/*`, all incident traces, all VDCs or all exports unless the audit mode or packet evidence requires it.

## Audit Modes

Use exactly one mode:

- `quick_preflight`: targeted readiness check for social/WordPress queue, monitor, credentials, captions, assets and checkpoint status. Use when no final visual/copy asset was created or regenerated.
- `asset_audit`: full compliance audit for one named asset.
- `batch_audit`: full compliance audit for a named batch.
- `incident_audit`: investigative audit for corrected approved outputs, user-reported defects, artifact mismatches, new blocking rules or repeated defects.

Mode selection rule:

1. If `requires_incident_trace=yes`, use `incident_audit`.
2. If `delivery_type` is `social_publishing_package` or `wordpress_publishing_package` and changed files are only schedule, queue, monitor, payload, credential resolver or captions, use `quick_preflight`.
3. If exactly one asset was created or regenerated, use `asset_audit`.
4. If multiple assets were created or regenerated, use `batch_audit`.

## Verdicts

Use exactly one verdict:

- `PASS`: all critical gates have evidence; the delivery may move to user checkpoint.
- `PASS_WITH_WARNINGS`: no critical blocker, but non-critical risks must be shown to the user.
- `BLOCKED`: at least one required gate is missing, unverifiable, contradictory, or failed.
- `INVALID`: the delivery bypassed the pipeline or altered final-facing outputs without required upstream evidence.

Only `PASS` and `PASS_WITH_WARNINGS` may move to a user approval checkpoint.
Neither verdict authorizes scheduling or publishing without explicit user approval.

## Required Gates by Delivery Type

### Social Visual Asset

Required evidence:

1. intake/context source or blog parent;
2. source backlog, alignment file, or request scope;
3. `Skill Invocation Ledger` for the relevant agents;
4. Visual Decision Card;
5. Client Creative DNA Acceptance when a client contract exists;
6. First Impression Diversity declaration;
7. Render Compliance Card;
8. HTML preview path;
9. exported asset paths;
10. dimension validation evidence;
11. Reviewer verdict from a separate review step;
12. Pipeline Compliance Report;
13. explicit user checkpoint before scheduling or publishing;
14. hub update only after the compliant preview path is known.
15. incident trace when the asset was previously reviewed/approved and later corrected.
16. integrity checks for actor separation, active version, export/dimensions, hub timing and visual-claim parity.

### Blog Post

Required evidence:

1. topic/backlog or approved request scope;
2. blog brief;
3. blog architecture;
4. draft or final post;
5. SEO/GEO/discovery optimization evidence;
6. featured image decision and source record;
7. pt-BR orthography and diacritics validation;
8. Reviewer verdict;
9. Pipeline Compliance Report;
10. explicit user checkpoint before WordPress scheduling or publishing.

### WordPress Publishing Package

Required evidence:

1. approved blog post or approved update scope;
2. WordPress payload or publishing manifest;
3. category, slug, status, date, featured image and Yoast fields;
4. post-publish validation evidence when publication already occurred;
5. Reviewer or validator verdict;
6. Pipeline Compliance Report;
7. explicit user approval before live publish, unless an approved cron policy already covers the exact action.

### Social Publishing Package

Required evidence:

1. approved social asset list;
2. exported publishable files;
3. `social-publish-assets.json` or queue manifest;
4. queue monitor evidence;
5. dry-run or pre-flight result when applicable;
6. Pipeline Compliance Report;
7. explicit user approval before live publish, unless an approved cron policy already covers the exact action.

For `quick_preflight`, this evidence list is sufficient. Do not require VDC, RCC, visual-production gate or full reviewer history unless the package also changed a visual/copy asset.

## Critical Blockers

Return `BLOCKED` or `INVALID` when any are true:

1. A social visual asset has no Visual Decision Card.
2. A social visual asset has no Render Compliance Card.
3. A required skill is absent from the `Skill Invocation Ledger`.
4. The ledger lists a skill but no concrete decision from that skill.
5. The Reviewer approved without verifying the skill invocation gate.
6. The Reviewer approved without verifying the visual production gate for visual assets.
7. The rendered format does not match the native visual skill.
8. Exported dimensions are missing or wrong.
9. Multi-frame preview does not allow all frames to be reviewed.
10. Client Creative DNA Acceptance is missing or failed.
11. Final user-facing pt-BR copy is missing required accents or diacritics.
12. Hub, queue, schedule, or publishing status was updated before required review and compliance gates.
13. The executor and reviewer are the same pass without separate evidence.
14. Evidence paths do not exist or point to old versions.
15. The user approval checkpoint is missing before scheduling or publishing.
16. A previously reviewed/approved delivery was corrected without an incident trace.
17. The incident trace does not identify origin stage, why the error passed, root cause label and mitigation.
18. Mitigation is generic and has no owner, file/checklist/rule, or enforcement point.
19. A repeated error lacks `recurrence_control_gap` classification and stronger mitigation.
20. The compliance report for an asset, batch or incident lacks the `Integrity Checks` section required by `pipeline-integrity-gate.md`.
21. The same actor executed and reviewed, reviewed and audited, or Atlas produced the full delivery inline while claiming separate agents.
22. A newer approved version exists and the delivery updates hub, manifest or publish paths to an older or unversioned artifact.
23. VDC/RCC/Review claims about photography, images, mock/chrome absence, navigation absence, dimensions or publication readiness contradict DOM, preview or export evidence.
24. A final response or report says `ready for publication` while export files or dimension validation are missing.

## Incident Trace Requirement

An Incident Trace is mandatory when the audit scope includes any of these:

- correction of an asset already marked `approved`, `APPROVED`, `preview_ready`, `PASS`, or equivalent;
- patch to hub, manifest, draft, preview, export path or publish queue after review;
- user-reported defect after a previous approval or review;
- new blocking rule created because a defect was found;
- repeated defect category in the same client workspace.

The trace must follow:

`squads/social-growth/pipeline/data/pipeline-incident-trace-template.md`

Required trace evidence:

- timeline of stages and owners;
- origin stage and owner/agent;
- why the defect passed previous checks;
- root cause taxonomy label(s);
- correction applied;
- rule/checklist updated or explicit reason no rule was needed;
- mitigation owner and enforcement point;
- recurrence check against prior incident traces.

If the incident trace is required but absent or incomplete, return `BLOCKED`.

## Evidence Rules

Each evidence row must include:

- gate name;
- status: `PASS`, `WARN`, `BLOCKED`, `N/A`;
- evidence path, command output, screenshot, explicit verdict, or reason;
- notes about version, asset id, or scope.

Use `N/A` only when the gate truly does not apply to the delivery type. Explain why.

For incident-triggered audits, add these evidence rows:

- `Incident Trace Exists`;
- `Origin Stage Identified`;
- `False Positive Explained`;
- `Root Cause Classified`;
- `Mitigation Enforced`;
- `Recurrence Checked`.

## Report Output

Write the report to:

`squads/social-growth/output/{client}/review/pipeline-compliance-{asset-or-batch-id}.md`

Use this structure:

```md
# Pipeline Compliance Report — [asset-or-batch-id]

## Verdict
[PASS | PASS_WITH_WARNINGS | BLOCKED | INVALID]

## Scope
- Client:
- Audit mode:
- Delivery type:
- Asset(s):
- Source:
- Requested action:

## Required Flow
- [ ] Step / gate name — status

## Evidence Table
| Gate | Status | Evidence | Notes |
|---|---|---|---|

## Integrity Checks
| Check | Status | Evidence | Notes |
|---|---|---|---|
| Actor separation | PASS/BLOCKED/INVALID | path:line | ... |
| Skill invocation evidence | PASS/BLOCKED | path:line | ... |
| Existing active version checked | PASS/BLOCKED/INVALID | path:line | ... |
| Export final and dimensions | PASS/BLOCKED/N/A | command/path | ... |
| Hub update timing | PASS/BLOCKED/INVALID/N/A | path:line | ... |
| Visual claim parity | PASS/BLOCKED | path:line | ... |
| Mock/chrome prohibition | PASS/BLOCKED/N/A | path:line | ... |
| Navigation prohibition | PASS/BLOCKED/N/A | path:line | ... |
| Publication language allowed | PASS/BLOCKED/N/A | path:line | ... |

## Blockers
- None, or exact blockers.

## Warnings
- None, or exact warnings.

## Incident Trace Requirement
- Required: [yes/no]
- Trigger:
- Trace file:
- Trace verdict: [OPEN | MITIGATED | CLOSED | RECURRENCE | N/A]
- Root cause labels:
- Mitigation enforcement point:

## Decision
[May proceed to user checkpoint | Must return to step X | Invalid until rebuilt through pipeline]
```

## Decision Language

Use precise language:

- `May proceed to user checkpoint` means only the user may approve the next step.
- `Must return to step X` means the pipeline must fix missing or failed evidence.
- `Invalid until rebuilt through pipeline` means the output cannot be reused as approved work.

## Final Rule

The Pipeline Auditor is the last internal gate before a user checkpoint. If the
compliance report is not `PASS` or `PASS_WITH_WARNINGS`, the squad must not ask
the user to approve, schedule, publish, or finalize the hub.

The Pipeline Auditor must invoke this skill for every audit. A pipeline
compliance report that does not include a `Skill Invocation Ledger` row for
`pipeline-compliance-audit` with source file
`skills/pipeline-compliance-audit/SKILL.md` and a concrete applied rule is
invalid, even if the rest of the report appears complete.
