# Pipeline Incident Trace Template

## Purpose

Whenever an already-reviewed or already-approved delivery needs correction, the
Pipeline Auditor must produce an incident trace. The trace converts a defect into
operational learning: origin, missed gate, root cause, mitigation and recurrence
prevention.

This file is mandatory for Social Growth Squad audits. A correction without an
incident trace is not considered fully closed.

## Trigger Conditions

Create an incident trace when any condition is true:

- user reports a defect after a reviewer or auditor approval;
- an approved asset is regenerated, patched or relinked;
- hub, manifest, draft and preview disagree;
- a preview points to a missing or obsolete file;
- a source image, article URL, dimensions, language, export rule or visual rule is wrong;
- a new blocking rule is created because of the defect;
- the same category of error occurred before in the campaign or client workspace.

## Required Output Path

Use this path:

`squads/social-growth/output/{client}/review/incident-trace-{asset-or-batch-id}-{short-defect}.md`

Examples:

- `squads/social-growth/output/amiclube/review/incident-trace-ac-30-03-vertical-alignment.md`
- `squads/social-growth/output/amiclube/review/incident-trace-ac-30-03-wrong-preview-link.md`

## Severity

Use exactly one severity:

- `P0_INVALID`: final-facing output was approved but is unusable, missing or wrong file.
- `P1_BLOCKING`: publishable quality/compliance failed after approval.
- `P2_MAJOR`: non-publish blocker, but significant process gap.
- `P3_MINOR`: documentation or metadata drift that does not affect publishing.

## Root Cause Taxonomy

Use one or more root cause labels:

| Label | Meaning |
|---|---|
| `brief_mismatch` | Output diverged from brief, article parent, platform or objective. |
| `asset_link_error` | Hub, manifest, draft or preview points to the wrong file/path. |
| `source_asset_mismatch` | Image, article URL, source slug or parent asset is wrong. |
| `layout_rule_missing` | Visual/layout rule did not exist or was too vague. |
| `visual_audit_gap` | Reviewer/auditor did not perform visual reality check. |
| `copy_language_error` | pt-BR, diacritics, foreign language or visible copy failed. |
| `export_rule_violation` | Mock, UI controls, navigation or non-publish UI leaked into export. |
| `manifest_drift` | Manifest, hub, draft or publish folder disagree. |
| `implementation_bug` | Code/HTML/CSS/JS implementation error. |
| `approval_gate_gap` | Asset was marked approved without required evidence. |
| `recurrence_control_gap` | Similar error happened before and mitigation did not prevent recurrence. |

## Required Report Format

```md
# Pipeline Incident Trace — [asset-or-batch-id] — [short defect]

## Verdict
[OPEN | MITIGATED | CLOSED | RECURRENCE]

## Incident Summary
- Client:
- Asset(s):
- Defect:
- Severity:
- Detected by:
- Detected at:
- Current status:

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|

## Where It Originated
- Stage:
- Owner/Agent:
- Evidence:
- Origin explanation:

## Why It Passed
- Missed gate:
- False positive:
- Missing evidence:
- Reviewer/Auditor gap:

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|

## New Or Updated Rule
- Rule file:
- Rule summary:
- Blocking condition added:

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|

## Recurrence Check
- Similar prior incidents:
- Search/evidence:
- Residual risk:

## Learning
- What the squad learned:
- What future agents must do differently:

## Closure Criteria
- [ ] Defect corrected in final-facing artifact
- [ ] Hub/manifest/draft/preview consistency verified
- [ ] Rule/checklist updated or explicit reason not needed
- [ ] Mitigation has an owner and enforcement point
- [ ] Related audit report references this incident trace
- [ ] User-facing final copy remains pt-BR compliant
```

## Blocking Policy

The Pipeline Auditor must return `BLOCKED` or `INVALID` when an incident-triggering
defect is corrected but no incident trace exists.

The Reviewer must return `REJECT` or `BLOCKED` when reviewing a corrected asset
whose previous approval failed and no incident trace is attached.

## Minimum Acceptable Mitigation

At least one mitigation must be enforceable in a future run. Acceptable examples:

- add or update a blocking rule in a gate file;
- add a required checklist item to reviewer or auditor output;
- add manifest/hub consistency verification;
- add evidence requirements for visual reality checks;
- add recurrence search against prior incident traces.

Non-acceptable examples:

- “be more careful”;
- “review manually next time” without checklist or owner;
- “fixed now” without rule/evidence;
- mitigation that has no file, owner or enforcement point.
