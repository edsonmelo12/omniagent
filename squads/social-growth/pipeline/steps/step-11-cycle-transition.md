---
execution: subagent
agent: strategist
model_tier: powerful
inputFile: squads/social-growth/output/{client}/approvals/strategy-decision-approval.md
outputFile: squads/social-growth/output/{client}/strategy/next-cycle-briefing.md
---

# Step 11: Cycle Transition

## Context Loading

Load these files before executing:
- `squads/social-growth/output/{client}/approvals/strategy-decision-approval.md` — approved decision portfolio from the current cycle
- `squads/social-growth/output/{client}/strategy/atos-strategic-report.md` — final analytical verdicts
- `squads/social-growth/output/{client}/strategy/action-plan.md` — recommended actions for the next cycle
- `squads/social-growth/output/{client}/strategy/trend-opportunity-radar.md` — current strategic opportunity map
- `squads/social-growth/output/{client}/strategy/strategy-feedback-loop.md` — cumulative strategic memory
- `squads/social-growth/pipeline/data/campaign-transition-workflow.md` — canonical transition workflow
- `squads/social-growth/output/{client}/strategy/next-cycle-analysis-checklist.md` — client-specific transition checklist when available
- `squads/social-growth/output/{client}/index.md` — current operational source of truth
- `squads/social-growth/output/{client}/client-intel-summary.md` — client context and business direction
- `squads/social-growth/output/{client}/pauta-atual.md` — current editorial baseline when available
- `squads/social-growth/pipeline/data/weekly-cycle-template.md` — next-cycle structure reference
- `_opensquad/_memory/company.md` — agency context and routing
- `_opensquad/_memory/preferences.md` — language and output preferences

## Instructions

### Process
1. Read the approved decision portfolio and treat it as the input boundary for the next cycle.
2. Read the feedback loop and radar to identify what should be repeated, adjusted, retested or paused.
3. Read the transition workflow and checklist to extract the natural sequence for the next cycle.
4. Decide the next-cycle thesis, primary objection, proof point and CTA.
5. Map the next cycle by channel and funnel stage.
6. Convert the current-cycle learning into a concise next-cycle briefing.
7. Explicitly identify what enters and what stays out of the next cycle.
8. Record the decision portfolio that should seed the next strategy planning step.

## Output Format

```markdown
# Next Cycle Briefing

## Cycle Summary
[what the last cycle proved]

## Decision Portfolio
- `scale`: [item]
- `optimize`: [item]
- `retest`: [item]
- `pause` or `archive`: [item]

## Next-Cycle Thesis
[single sentence]

## Primary Objection
[main friction to solve]

## Primary Proof
[evidence that should anchor the next cycle]

## Channel Map
[blog, carousel, reels, stories, direct]

## What Enters
[allowed angles, formats, CTAs]

## What Stays Out
[rejected angles, avoided patterns]

## Success Signals
[metrics and behavioural signals]

## Handoff Notes
[what step 02 must treat as the starting point]
```

## Veto Conditions

Reject and redo if ANY are true:
1. The briefing does not turn the approved decision portfolio into a new starting point.
2. The next-cycle thesis is vague or exchangeable.
3. The channel map does not separate roles.
4. The output does not say what stays out.

## Quality Criteria

- [ ] The previous cycle is summarized in one clear thesis.
- [ ] The decision portfolio is explicit.
- [ ] The next-cycle thesis is explicit.
- [ ] The objection, proof and CTA are explicit.
- [ ] The channel map is explicit.
- [ ] The output separates inputs from exclusions.
- [ ] The handoff is usable by the next strategy planning step.
