# Pipeline Incident Trace — AC-30-03 — wrong preview link

## Verdict
CLOSED

## Incident Summary
- Client: amiclube
- Asset(s): AC-30-03
- Defect: Campaign hub preview button pointed to `ac-30-03-reels-frames.html`, while the canonical approved preview is `ac-30-03-reels-v2.html`.
- Severity: P0_INVALID
- Detected by: User
- Detected at: 2026-05-02
- Current status: Corrected in `campaign-hub.html` and manifest points to the canonical v2 file.

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|
| Preview regeneration | Assistant / Reviewer lane | `social/previews/ac-30-03-reels-v2.html` | Canonical AC-30-03 preview was regenerated and approved. |
| Cleanup | Assistant / Reviewer lane | `social/previews/ac-30-03-reels-frames.html` removed | Broken alternate preview was deleted because it had CSS syntax errors and stale nav CSS. |
| Manifest update | Assistant / Reviewer lane | `review/campaign-manifest.json` | Manifest was updated to `social/previews/ac-30-03-reels-v2.html`. |
| Hub state | Campaign hub | `review/campaign-hub.html` | Hub still pointed to deleted `ac-30-03-reels-frames.html`. |
| User report | User | Conversation checkpoint | User identified that AC-30-03 link pointed to the wrong file. |
| Correction | Assistant / Reviewer lane | `review/campaign-hub.html` | Hub preview button changed to `../social/previews/ac-30-03-reels-v2.html`. |

## Where It Originated
- Stage: Hub synchronization after preview regeneration
- Owner/Agent: Reviewer / campaign hub update lane
- Evidence: `review/campaign-hub.html` referenced `../social/previews/ac-30-03-reels-frames.html` after that file was deleted.
- Origin explanation: Manifest and hub were not verified as a pair after replacing the canonical preview path.

## Why It Passed
- Missed gate: Manifest Consistency Gate did not require hub/draft/manifest/preview path parity.
- False positive: Manifest was correct, so the asset appeared approved even though the user-facing hub still linked to the stale file.
- Missing evidence: No explicit command/evidence checked AC-30-03 links inside `campaign-hub.html` after deletion.
- Reviewer/Auditor gap: Audit validated preview content and manifest, but not the final hub button target.

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|
| `asset_link_error` | `campaign-hub.html` stale link | User-facing preview button pointed to a removed file. |
| `manifest_drift` | Manifest path differed from hub path | Canonical manifest was updated but hub was not regenerated/synchronized. |
| `approval_gate_gap` | Approved asset still had broken hub path | Approval did not require hub link verification. |

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|
| `squads/social-growth/output/amiclube/review/campaign-hub.html` | Changed AC-30-03 preview link to `../social/previews/ac-30-03-reels-v2.html`. | DONE |
| `squads/social-growth/output/amiclube/review/campaign-manifest.json` | Already pointed to `social/previews/ac-30-03-reels-v2.html`. | VERIFIED |
| `squads/social-growth/output/amiclube/social/previews/ac-30-03-reels-frames.html` | Removed broken obsolete preview. | DONE |

## New Or Updated Rule
- Rule file: `squads/social-growth/pipeline/data/pipeline-incident-trace-template.md`
- Rule summary: Any hub/manifest/draft/preview mismatch after review triggers Incident Trace.
- Blocking condition added: Corrected output cannot be closed without incident trace and mitigation.

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|
| Verify hub/manifest/draft/preview consistency after relinking. | Pipeline Auditor | `pipeline-compliance-audit` + Incident Trace trigger conditions | ENFORCED |
| Treat stale preview links as `P0_INVALID`. | Pipeline Auditor | `pipeline-incident-trace-template.md` severity policy | ENFORCED |
| Require trace for post-approval relinks. | Reviewer + Pipeline Auditor | `reviewer.agent.md`, `pipeline-auditor.agent.md`, runner incident enforcement | ENFORCED |

## Recurrence Check
- Similar prior incidents: AC-30-03 had stale hub link after canonical preview changed.
- Search/evidence: Current trace records the first formal incident under the new template.
- Residual risk: Future manual hub edits can drift unless manifest-to-hub verification is executed.

## Learning
- What the squad learned: Updating the manifest is not enough; user-facing hub links are a separate publishability surface.
- What future agents must do differently: After deleting or replacing a preview file, verify every user-facing link that referenced the old path.

## Closure Criteria
- [x] Defect corrected in final-facing artifact
- [x] Hub/manifest/draft/preview consistency verified
- [x] Rule/checklist updated or explicit reason not needed
- [x] Mitigation has an owner and enforcement point
- [x] Related audit report references this incident trace
- [x] User-facing final copy remains pt-BR compliant
