---
execution: subagent
agent: researcher
model_tier: powerful
inputFile: squads/social-growth/pipeline/data/intake-sources.md
outputFile: squads/social-growth/output/context/social-intelligence-summary.md
---

# Step 00B: Social Intelligence

## Context Loading

Load these files before executing:
- `squads/social-growth/pipeline/data/contextual-market-intelligence.md` — contextual scope and numeric reporting rules
- `squads/social-growth/pipeline/data/social-intelligence-intake.md` — automatic social data collection rules
- `squads/social-growth/pipeline/data/social-intelligence-summary-template.md` — required output structure
- `squads/social-growth/pipeline/data/brand-profile-template.md` — confirmed/inferred brand and offer profile
- `squads/social-growth/pipeline/data/client-intake-guide.md` — accepted inputs and editable fields
- `squads/social-growth/pipeline/data/intake-sources.md` — raw links, documents and notes
- `_opensquad/_memory/company.md` — current company context

## Instructions

### Process
1. Discover the client's official social profiles from the website and public web references.
2. Collect public signals from the discovered profiles, including recent posts, themes, formats and visible engagement.
3. Resolve the market scope from the client context, or infer it from the website, offer structure and public footprint if it is not explicit.
4. Read authorized analytics exports or screenshots if the user provided them.
5. Compare the brand against relevant competitors when possible.
6. Draft a brand profile with confirmed facts, inferred signals and proof gaps.
7. Record confidence, completeness, numeric signals and any unresolved profile matches.
8. Produce a structured social intelligence summary that the rest of the squad can reuse.
9. Carry forward creative constraints that are visible in the site, social profiles or user notes, especially palette, tone, layout style and channel priority.
10. Add a `Suggested Research Sources` block with practical source recommendations and ready-to-run queries the user can use to deepen market investigation.

## Output Format

Use the structure defined in `social-intelligence-summary-template.md`.

## Veto Conditions

Reject and redo if ANY are true:
1. The output does not identify discovered profiles or an explicit discovery failure.
2. The output invents metrics or fills missing data without evidence.
3. The output is not reusable by the client record and proposal steps.
4. The output omits market scope, competitor context or creative cues when they were available from the intake.

## Quality Criteria

- [ ] Official profiles were discovered or explicitly marked as unresolved.
- [ ] Public signals were summarized.
- [ ] Numeric signals were included for the executive layer.
- [ ] Confirmed analytics were separated from public-only signals.
- [ ] Main gaps and opportunities were identified.
- [ ] Confidence level was stated.
- [ ] The relevant market scope was resolved or explicitly marked as inferred.
- [ ] The summary includes suggested research sources with practical query examples for the user.
