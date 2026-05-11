# Pipeline Integrity Gate

This gate prevents simulated pipeline compliance, self-approval and unsupported
creative claims. It applies to every Social Growth Squad delivery before any
`PASS`, `APPROVED`, `pipeline_pass`, campaign hub update, schedule update,
queue update or publish-ready statement.

## Golden Rule

No artifact is considered executed, reviewed, approved or audited unless there is
separate, verifiable evidence for the actor, file, version and output being
claimed.

Declarative statements such as `invoked`, `verified`, `APPROVED`, `PASS`,
`compliant`, `ready for publication`, or `pipeline_pass` do not count as evidence
by themselves.

## Role Separation

Atlas is the orchestrator. Atlas may create the execution card, assemble the
Audit Packet, dispatch agents and summarize results. Atlas must not be the sole
author of VDC, RCC, Review and Pipeline Audit for the same delivery.

For social visual assets, the report must prove these roles are separate unless
an explicit degraded-mode checkpoint was approved by the user before execution:

| Stage | Required owner | Evidence required |
|---|---|---|
| Visual Decision Card | Visual Director | VDC path + ledger + owner |
| Render Compliance Card | Creative Renderer | RCC path + render/export evidence + owner |
| Review | Reviewer | Review verdict path + owner different from renderer |
| Pipeline Audit | Pipeline Auditor | Compliance report + `pipeline-compliance-audit` ledger |

If the same actor executed and reviewed, or reviewed and audited, the delivery is
`BLOCKED`. If Atlas directly produced final delivery artifacts while claiming a
full agent pipeline, the delivery is `INVALID`.

## Evidence-First PASS Rules

Every `PASS` or `PASS_WITH_WARNINGS` report must include evidence rows for these
checks when they apply:

| Integrity Check | Evidence required | Blocking result |
|---|---|---|
| Actor separation | owner/agent names in VDC, RCC, Review and Audit | `BLOCKED` if same actor or missing |
| Skill invocation | source skill file + concrete decision from skill | `BLOCKED` if only listed as invoked |
| Existing active version | grep/glob or manifest evidence for latest asset version | `BLOCKED` on unapproved version regression |
| Export final exists | final PNG/JPEG paths + dimension validation | `BLOCKED` before publish-ready or hub finalization |
| Hub update timing | review/audit PASS before hub link change | `INVALID` if hub was finalized early |
| Visual claim parity | VDC/RCC claims match DOM/export evidence | `BLOCKED` if claim contradicts render |
| Mock/chrome prohibition | DOM/export check for fake app chrome when prohibited | `BLOCKED` if present |
| Navigation prohibition | DOM/export check for arrows/buttons when prohibited | `BLOCKED` if present |
| Article link fidelity | source article path and final CTA/link path | `BLOCKED` if wrong or placeholder |

## Version Regression Rule

Before creating or updating an asset, the orchestrator or auditor must check for
existing versions in VDCs, RCCs, previews, publish exports, reviews, manifests and
campaign hub links.

If an asset already has a later approved version (for example `v6`) the pipeline
must not replace the hub, manifest or publish path with a lower or unversioned
artifact (for example `v1` or `asset.html`) unless all are true:

1. the user explicitly requested replacement of the active version;
2. an Incident Trace explains why the active version is being superseded;
3. the new version has passed VDC, RCC, separate Review, export validation and
   Pipeline Audit;
4. the hub/manifest update records the new canonical version.

Unapproved version regression is `INVALID`.

## Claim Parity Rules

The Pipeline Auditor must compare VDC/RCC/Review claims against the actual render
and export evidence. These are mandatory blockers:

1. RCC claims `photography`, `background image`, `image rotation`, `hero image`,
   `crop`, `full-bleed` or similar, but the HTML/PNG contains only flat colors,
   icons, emoji or text.
2. Review claims `no arrows` but DOM/export contains `←`, `→`, `Anterior`,
   `Próximo`, visible arrow buttons or equivalent controls inside the reviewable
   art surface.
3. Review claims `no mock` but DOM/export contains fake platform chrome such as
   `phone-frame`, `instagram-header`, avatar, likes, comments, caption, hashtags,
   verified badge or app interaction bars.
4. RCC claims dimensions without command output, image metadata, screenshot size
   or deterministic validation evidence.
5. Review claims First Impression Diversity without recent assets checked, cover
   evidence and a concrete difference in image/crop, composition, treatment,
   dominant color, density or focal logic.

## Hub And Publication Language

Use `ready for publication`, `pronto para publicação` or equivalent only when all
are true:

1. VDC exists and passed;
2. RCC exists and passed;
3. separate Reviewer approved;
4. Pipeline Auditor returned `PASS` or `PASS_WITH_WARNINGS`;
5. final publishable files exist;
6. dimensions were validated;
7. hub/manifest links point to the same canonical version;
8. user approval checkpoint is complete when scheduling or publishing is involved.

If final export is missing, the maximum status is `preview_ready` or
`export_pending`, never `ready for publication`.

## Required Audit Section

Every Pipeline Compliance Report for `asset_audit`, `batch_audit` or
`incident_audit` must include:

```md
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
```

Missing `Integrity Checks` section makes the report `INVALID`.

## Veto Conditions

Reject and return upstream if any are true:

1. Atlas or the runner authored the full pipeline inline while claiming separate
   agents executed it.
2. A Reviewer verdict was authored by the same actor that rendered the asset.
3. The Pipeline Auditor only confirms artifacts created by the same actor without
   contradiction checks.
4. A skill is marked `invoked` without loaded skill source and concrete decision.
5. A newer approved asset version exists and the hub/manifest is changed to an
   older or unversioned artifact.
6. Hub, schedule, queue or publish manifest is finalized before export evidence,
   separate review and compliance audit.
7. The final response says `ready for publication` when export files or dimension
   validation are missing.
8. Visual claims in VDC/RCC/Review contradict the DOM, preview or exported files.
