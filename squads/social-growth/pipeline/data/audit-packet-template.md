# Audit Packet Template

Use this packet before invoking `Pipeline Auditor`. It narrows the audit scope and prevents broad workspace scans when a targeted check is enough.

## Required Fields

| Field | Description |
|---|---|
| `client` | Client slug or name. |
| `audit_mode` | `quick_preflight`, `asset_audit`, `batch_audit`, or `incident_audit`. |
| `delivery_type` | `social_visual_asset`, `blog_post`, `wordpress_publishing_package`, `social_publishing_package`, or `mixed_batch`. |
| `asset_ids` | Exact asset IDs in scope. Empty only for client-level publishing checks. |
| `changed_files` | Files changed by the current task. |
| `evidence_files` | Review, manifest, queue, monitor, VDC/RCC, export or validator files relevant to the scope. |
| `commands_run` | Commands already executed and their summarized outcomes. |
| `reviewer_verdict` | Path and verdict, or `not_required` with reason for quick preflight. |
| `requires_incident_trace` | `yes` or `no`. |
| `incident_trigger` | Reason when trace is required. |
| `user_checkpoint_status` | `approved`, `pending`, `not_required`, or `missing`. |
| `orchestrator` | Atlas or other orchestrator responsible for dispatch, not final approval. |
| `stage_owners` | Declared owners for VDC, RCC/render, review and audit. |
| `active_version_evidence` | Paths/manifest rows proving current canonical version before changes. |
| `integrity_claims_to_check` | Claims that need DOM/export parity checks, such as no mock, no arrows, photography, dimensions, final export and ready-for-publication language. |

## Audit Modes

### quick_preflight

Use for social/WordPress publishing readiness checks when no visual/copy asset was created or regenerated.

Allowed evidence set:
- schedule or queue file;
- final captions file when social publishing is involved;
- exported assets manifest;
- monitor file;
- dry-run or validator output;
- user checkpoint status.

Do not load all VDCs, RCCs, prior reviews or incident traces unless the packet explicitly lists them.

### asset_audit

Use for one asset that was created, revised or prepared for approval.

Load only files related to the listed `asset_ids`, plus required gate docs.

### batch_audit

Use for a small named batch. The packet must list every asset ID and evidence file.

### incident_audit

Use when a reviewed/approved item was corrected, a user reported a defect, or a blocking rule changed because of a defect.

Must load the incident trace template and related prior incident traces for the same defect category or asset family.

## Packet Skeleton

```md
# Audit Packet — [scope]

- client:
- audit_mode:
- delivery_type:
- asset_ids:
- changed_files:
- evidence_files:
- commands_run:
- reviewer_verdict:
- requires_incident_trace:
- incident_trigger:
- user_checkpoint_status:
- orchestrator:
- stage_owners:
- active_version_evidence:
- integrity_claims_to_check:

## Notes
- [short context]
```
