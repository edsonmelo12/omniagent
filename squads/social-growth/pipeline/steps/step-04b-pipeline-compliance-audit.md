---
execution: subagent
agent: pipeline-auditor
model_tier: fast
inputFile: squads/social-growth/output/review/content-review.md
outputFile: squads/social-growth/output/{client}/review/pipeline-compliance-{asset-or-batch-id}.md
---

# Step 04B: Pipeline Compliance Audit

## Purpose

Validate whether the delivery followed the required Social Growth Squad workflow
before any user approval checkpoint, scheduling, publishing, queue update, or
final campaign hub decision.

When the audit is triggered by a correction, regeneration, post-approval defect
or artifact mismatch, this step must also produce an Incident Trace that explains
where the error originated, why it passed, what rule changed and how recurrence
will be prevented.

This step audits process compliance only. It does not replace `Step 04: Review
Content`, which evaluates content, design and quality.

## Context Loading

Load these files before executing:

- `skills/pipeline-compliance-audit/SKILL.md` — mandatory audit method
- `squads/social-growth/pipeline/data/fast-safe-routing-policy.md` — route and audit-mode selection
- `squads/social-growth/pipeline/data/audit-packet-template.md` — required scoping contract when invoking the auditor manually or from Atlas
- `squads/social-growth/pipeline/pipeline.yaml` — active step order
- `squads/social-growth/pipeline/steps/step-04-review-content.md` — upstream review contract
- `squads/social-growth/pipeline/steps/step-05-approve-schedule.md` — downstream checkpoint contract
- `squads/social-growth/pipeline/data/skill-invocation-gate.md` — mandatory skill evidence rules
- `squads/social-growth/pipeline/data/pipeline-integrity-gate.md` — anti-self-approval, evidence parity and version-regression rules
- Delivery-policy files for the selected `audit_mode` only:
  - `visual-production-gate.md` and `visual-evidence-contract.md` for `asset_audit`, `batch_audit` and `incident_audit` involving visual assets
  - `pipeline-incident-trace-template.md` for `incident_audit` or when `requires_incident_trace=yes`
  - `blog-policy.md` for blog deliveries
  - `wordpress-scheduling-cron-policy.md` for WordPress packages
  - `social-scheduling-cron-policy.md` for social publishing packages
- Evidence files explicitly listed in the Audit Packet. Avoid broad reads such as `review/*` unless the mode is `incident_audit` or the packet lists those files.

## Instructions

### Process

1. Load `skills/pipeline-compliance-audit/SKILL.md` before any audit decision.
2. Record the skill in the report's `Skill Invocation Ledger` with one concrete decision taken from the skill.
3. Read or construct an Audit Packet with `client`, `audit_mode`, `delivery_type`, `asset_ids`, `changed_files`, `evidence_files`, `commands_run`, `reviewer_verdict`, `requires_incident_trace`, `user_checkpoint_status`, `orchestrator`, `stage_owners`, `active_version_evidence` and `integrity_claims_to_check`.
4. Identify the delivery type: social visual asset, blog post, WordPress publishing package, social publishing package, or mixed batch.
5. Identify the active asset IDs, blog parents, requested action and client.
6. Apply `pipeline-compliance-audit` exactly as written, scoped by `audit_mode`.
7. Verify evidence for every required gate in the delivery type and mode.
8. Treat missing evidence as missing execution.
9. Verify that `Step 04` produced a separate Reviewer verdict unless `audit_mode=quick_preflight` and the packet marks `reviewer_verdict=not_required` with a reason.
10. Apply `pipeline-integrity-gate.md` before any `PASS` or `PASS_WITH_WARNINGS` verdict.
11. Verify actor separation: Atlas/orchestrator, Visual Director, Creative Renderer, Reviewer and Pipeline Auditor cannot collapse into one inline execution unless a prior user-approved degraded mode exists.
12. Verify active version state before hub/manifest updates. A newer approved version cannot be replaced by an older or unversioned artifact without explicit user request and Incident Trace.
13. Verify claim parity: VDC/RCC/Review statements about images, navigation, mocks, dimensions, CTA/link and publication readiness must match DOM/export evidence.
14. Verify that the user has not been asked to approve, schedule or publish before this audit, except when `quick_preflight` is checking an already-approved cron/publishing window.
15. Determine whether Incident Trace is required using the packet and `pipeline-incident-trace-template.md` trigger conditions.
16. If Incident Trace is required, write it to `squads/social-growth/output/{client}/review/incident-trace-{asset-or-batch-id}-{short-defect}.md` before returning a non-blocking verdict.
17. Emit one verdict: `PASS`, `PASS_WITH_WARNINGS`, `BLOCKED`, or `INVALID`.
18. Write the report to `squads/social-growth/output/{client}/review/pipeline-compliance-{asset-or-batch-id}.md`.
19. If verdict is `BLOCKED` or `INVALID`, route the work back to the exact failed upstream step.

### Mode-Specific Minimum Gates

#### quick_preflight

Use for social or WordPress publishing readiness checks when no final copy/visual asset was created or regenerated.

Required evidence:
- active schedule/queue file;
- monitor status with no criticals;
- exported assets or payload manifest;
- final captions for social connector publishing;
- dry-run or validator result when available;
- user checkpoint status.

Do not require VDC, RCC, visual gate, full review history or prior incident traces unless the packet explicitly says the task changed a visual/copy asset or `requires_incident_trace=yes`.

#### asset_audit

Use for one named asset. Load only the asset's VDC, RCC, review verdict, export evidence, manifest row and incident trace when triggered.

#### batch_audit

Use for a named asset batch. Require packet-listed evidence for every asset in the batch.

#### incident_audit

Use for post-approval defects or corrected approved outputs. Load incident trace template and related prior traces for recurrence check.

### Mandatory Self-Check

Before returning `PASS` or `PASS_WITH_WARNINGS`, the Pipeline Auditor must verify
its own skill invocation:

- `pipeline-compliance-audit` appears in the `Skill Invocation Ledger`;
- `Source File` is `skills/pipeline-compliance-audit/SKILL.md`;
- `Concrete Use` names the audit rule applied;
- `Status` is `invoked`.

If any item is missing, the audit report is automatically `INVALID`.

## Output Format

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

## Skill Invocation Ledger
| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|

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

## Veto Conditions

Reject and return upstream if ANY are true:

1. The audit report does not exist.
2. The audit report lacks a `PASS` or `PASS_WITH_WARNINGS` verdict.
3. The report does not cite evidence paths, command outputs or explicit review verdicts.
4. The Pipeline Auditor's own `pipeline-compliance-audit` skill invocation is missing, vague or lacks concrete use.
5. A social visual asset lacks a complete Visual Decision Card.
6. A social visual asset lacks a complete Render Compliance Card.
7. A required skill is missing from a `Skill Invocation Ledger` or has no concrete use.
8. The Reviewer did not validate skill invocation and visual production gates.
9. A multi-frame preview cannot be reviewed frame by frame.
10. Exported assets lack dimension validation.
11. Client Creative DNA Acceptance is missing or failed when a contract exists.
12. Final user-facing pt-BR copy is missing required accents or diacritics.
13. Campaign hub, schedule, queue or publish status was finalized before review and audit.
14. User approval is missing before scheduling or publishing.
15. A correction/regeneration of a previously reviewed or approved asset lacks an Incident Trace.
16. Incident Trace lacks origin stage, false-positive explanation, root cause taxonomy or mitigation.
17. Mitigation has no owner, rule/checklist/file, or enforcement point.
18. The report lacks the required `Integrity Checks` section for `asset_audit`, `batch_audit` or `incident_audit`.
19. The same actor executed and reviewed, reviewed and audited, or Atlas produced the full delivery inline while claiming separate agents.
20. A newer approved version exists and the delivery updates hub, manifest or publish paths to an older or unversioned artifact.
21. VDC/RCC/Review visual claims contradict DOM, preview or export evidence.
22. The delivery or final response uses `ready for publication` language without final export files and dimension validation.

## Quality Criteria

- [ ] Delivery type is identified.
- [ ] Audit mode is identified and justified.
- [ ] The Pipeline Auditor invoked `pipeline-compliance-audit` and recorded it with concrete use.
- [ ] The Pipeline Auditor applied `pipeline-integrity-gate.md` and recorded `Integrity Checks`.
- [ ] Required gates match the delivery type.
- [ ] Each gate has `PASS`, `WARN`, `BLOCKED` or `N/A`.
- [ ] Every `N/A` has a reason.
- [ ] Blockers and warnings are separated.
- [ ] The decision names the exact next step.
- [ ] `PASS` or `PASS_WITH_WARNINGS` only authorizes moving to user checkpoint, not publishing.
- [ ] Incident-triggered audits include an Incident Trace with cause-root and mitigation.
- [ ] Recurrence was checked against prior incident traces when a defect category repeats.
