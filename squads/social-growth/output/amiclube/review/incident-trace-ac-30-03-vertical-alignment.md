# Pipeline Incident Trace — AC-30-03 — vertical alignment

## Verdict
CLOSED

## Incident Summary
- Client: amiclube
- Asset(s): AC-30-03
- Defect: Reels frames used only the upper half of the useful area; main content was not centered vertically like the CTA frame.
- Severity: P1_BLOCKING
- Detected by: User
- Detected at: 2026-05-02
- Current status: Corrected in `ac-30-03-reels-v2.html`; new blocking alignment rule added.

## Timeline
| Stage | Owner/Agent | Evidence | What Happened |
|---|---|---|---|
| HTML regeneration | Assistant / Creative Renderer lane | `social/previews/ac-30-03-reels-v2.html` | Frames used `.screen` flex flow with top content, topline and chips in normal layout flow. |
| Initial audit | Assistant / Reviewer lane | `review/gate-verification-ac-30-03-v2.md` | Audit passed export rules, image source, copy and JS selector, but did not block vertical empty-area usage. |
| User report | User | Conversation checkpoint | User identified that content filled only about half the usable area. |
| Rule discussion | User + Assistant | Conversation checkpoint | Demand clarified: main content must be vertically centered in every frame, not only CTA. |
| Correction | Assistant / Renderer lane | `social/previews/ac-30-03-reels-v2.html` | Topline and chips moved to absolute positioning; `.screen` centers the `.content` block. |
| Rule update | Assistant / Auditor lane | `.agents/skills/amiclube-creative-director/references/social-export-rules.md` | Alignment became blocking: main content must be vertically centered; `flex-start`/`space-between` on `.screen` blocked. |
| Trace system update | Assistant / Auditor lane | `pipeline-incident-trace-template.md`, auditor/reviewer/runner docs | Post-approval corrections now require Incident Trace with cause-root and mitigation. |

## Where It Originated
- Stage: Creative Renderer / HTML layout implementation
- Owner/Agent: Creative Renderer lane
- Evidence: Earlier `ac-30-03-reels-v2.html` used `.screen` as a column container with supporting elements in the same flow as the main content.
- Origin explanation: The layout did not separate auxiliary top/bottom elements from the main message block, so the central area was underused.

## Why It Passed
- Missed gate: Visual Alignment Gate did not yet require center-of-page alignment for all main content.
- False positive: The CTA frame was centered, making the composition appear partially compliant, while hook/content frames still looked top-heavy.
- Missing evidence: No audit item measured or inspected central area usage and vertical balance across all frames.
- Reviewer/Auditor gap: The audit checked forbidden UI, image path, copy and navigation, but did not treat vertical alignment as blocking.

## Root Cause
| Cause Label | Evidence | Explanation |
|---|---|---|
| `layout_rule_missing` | Alignment rule previously allowed cover/hook at top | The rule itself permitted the flawed pattern. |
| `visual_audit_gap` | Initial report approved visual review without center-content check | Visual audit did not inspect usable-area balance. |
| `implementation_bug` | Topline/chips participated in flex flow | Auxiliary elements interfered with main content centering. |
| `approval_gate_gap` | Asset remained approved until user flagged it | Approval gate did not block empty central area. |

## Correction Applied
| File/Artifact | Change | Status |
|---|---|---|
| `social/previews/ac-30-03-reels-v2.html` | `.screen` centers content; `.topline` absolute top; `.chips` absolute bottom; all main `.content` blocks centered. | DONE |
| `.agents/skills/amiclube-creative-director/references/social-export-rules.md` | Added blocking rule for vertical main-content alignment and empty central area. | DONE |
| `review/gate-verification-ac-30-03-v2.md` | Added Gate 9: Alignment as blocking gate; final visual review moved to Gate 10. | DONE |
| `social/previews/ac-30-02-carousel-5-sinais.html` | Applied same center-content architecture to prevent recurrence in related asset. | DONE |
| `review/gate-verification-ac-30-02-v2.md` | Added Gate 9: Alignment as blocking gate. | DONE |

## New Or Updated Rule
- Rule file: `.agents/skills/amiclube-creative-director/references/social-export-rules.md`
- Rule summary: Main content of every slide/frame must be vertically centered in the usable area. Auxiliary toplines and chips may sit top/bottom only if they do not affect central content flow.
- Blocking condition added: `justify-content: flex-start` or `space-between` on `.screen`, top-heavy content, or more than 30% empty central area blocks approval.

## Mitigation Plan
| Mitigation | Owner | Where Enforced | Status |
|---|---|---|---|
| Add Visual Alignment Gate to every social visual audit. | Reviewer | `gate-verification-*` reports | ENFORCED |
| Block non-centered main content. | Pipeline Auditor + Reviewer | `social-export-rules.md` | ENFORCED |
| Separate auxiliary elements from content flow. | Creative Renderer | Required CSS/HTML pattern in `social-export-rules.md` | ENFORCED |
| Require Incident Trace for future post-approval visual corrections. | Pipeline Auditor | `pipeline-incident-trace-template.md` and `pipeline-auditor.agent.md` | ENFORCED |

## Recurrence Check
- Similar prior incidents: AC-30-02 and AC-30-03 both had alignment/empty-area risk caused by flex-flow assumptions.
- Search/evidence: Current correction touched both AC-30-02 and AC-30-03 gate reports and previews.
- Residual risk: Other older social previews may still use `flex-start` or `space-between`; future audits must search for these in `.screen`/`.content` containers.

## Learning
- What the squad learned: “No mock UI” and “correct image” are insufficient; visual balance is a publishability gate.
- What future agents must do differently: Build social frames with center-content architecture first, then place auxiliary labels/timers/chips outside the main flow.

## Closure Criteria
- [x] Defect corrected in final-facing artifact
- [x] Hub/manifest/draft/preview consistency verified
- [x] Rule/checklist updated or explicit reason not needed
- [x] Mitigation has an owner and enforcement point
- [x] Related audit report references this incident trace
- [x] User-facing final copy remains pt-BR compliant
