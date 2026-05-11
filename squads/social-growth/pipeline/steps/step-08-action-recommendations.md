---
execution: subagent
agent: monitor
model_tier: powerful
inputFile: squads/social-growth/output/monitoring/health-summary.md
outputFile: squads/social-growth/output/monitoring/action-plan.md
---

# Step 08: Action Recommendations

## Context Loading

Load these files before executing:
- `squads/social-growth/output/monitoring/health-summary.md` — health summary from the previous step
- `squads/social-growth/pipeline/data/action-playbook.md` — response patterns by symptom
- `squads/social-growth/pipeline/data/monitoring-rhythm.md` — review cadence
- `squads/social-growth/pipeline/data/quality-criteria.md` — operational quality rules
- `_opensquad/core/best-practices/strategist.md` — planning and decision logic

## Instructions

### Process
1. Convert each risk signal into an action recommendation.
2. Separate quick wins from structural adjustments.
3. Prioritize what the team should change first.
4. Keep recommendations specific to the monitored channels.
5. Deliver an action plan that the strategist can reuse.

## Output Format

```
# Action Plan

## Quick Wins
[immediate adjustments]

## Structural Moves
[larger changes to cadence, format or theme]

## By Channel
[Instagram, Facebook, TikTok recommendations]

## Priority Order
[what should happen first]
```

## Output Example

```
# Action Plan

## Quick Wins
- tighten hooks on short video
- test more direct CTAs
- repeat the best-performing topics

## Structural Moves
- increase the share of discovery formats
- reduce weak post styles
- create a fixed weekly review rhythm

## By Channel
- Instagram: push carousels and Reels with clearer openings.
- Facebook: focus on community-oriented and explanatory posts.
- TikTok: optimize retencao and cut long intros.

## Priority Order
1. Fix hook quality.
2. Improve retencao.
3. Rebalance the format mix.
4. Review results next cycle.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The recommendations are generic or not tied to a signal.
2. The plan does not say what to do first.

## Quality Criteria

- [ ] Quick wins are immediate and concrete.
- [ ] Structural moves are clearly separated.
- [ ] Recommendations are channel-specific.
- [ ] Priority order is explicit.
