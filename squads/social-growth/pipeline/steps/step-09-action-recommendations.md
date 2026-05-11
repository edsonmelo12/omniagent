---
execution: subagent
agent: strategist
model_tier: powerful
inputFile: squads/social-growth/output/{client}/strategy/atos-strategic-report.md
outputFile: squads/social-growth/output/{client}/strategy/action-plan.md
---

# Step 09: Action Recommendations

## Context Loading

Load these files before executing:
- `squads/social-growth/output/{client}/strategy/atos-strategic-report.md` — analytical verdicts and priorities from Atos
- `squads/social-growth/output/{client}/strategy/trend-opportunity-radar.md` — current opportunity radar for the client
- `squads/social-growth/output/{client}/strategy/strategy-feedback-loop.md` — cumulative learning memory for the client
- `squads/social-growth/pipeline/data/action-playbook.md` — response patterns by symptom
- `squads/social-growth/pipeline/data/trend-opportunity-radar-template.md` — mandatory status taxonomy for opportunities
- `squads/social-growth/pipeline/data/strategy-feedback-loop-template.md` — mandatory learning memory contract
- `squads/social-growth/pipeline/data/monitoring-rhythm.md` — review cadence
- `squads/social-growth/pipeline/data/quality-criteria.md` — operational quality rules
- `_opensquad/core/best-practices/strategist.md` — planning and decision logic

## Instructions

### Process
1. Convert each Atos verdict into an action recommendation.
2. Separate quick wins from structural adjustments.
3. Prioritize what should change first in the next cycle.
4. Keep recommendations specific by channel and funnel stage.
5. Forçar alocação explícita do próximo ciclo:
   - 1 item para `scale`
   - 1 item para `optimize`
   - 1 item para `retest`
   - 1 item para `pause` ou `kill` quando houver base suficiente
6. Atualizar também os artefatos canônicos:
   - `squads/social-growth/output/{client}/strategy/trend-opportunity-radar.md`
   - `squads/social-growth/output/{client}/strategy/strategy-feedback-loop.md`
7. Deliver an action plan reusable by Eldon in strategy planning.

## Output Format

```markdown
# Action Plan

## Quick Wins
[immediate adjustments]

## Structural Moves
[larger changes to cadence, format, funnel or theme]

## Decision Portfolio
- `scale`: [hipótese/ângulo vencedor]
- `optimize`: [hipótese/ângulo promissor com ajuste claro]
- `retest`: [hipótese ainda subtestada ou com falso negativo suspeito]
- `pause` ou `kill`: [o que sai ou perde prioridade]

## By Channel
[Instagram, LinkedIn, Blog/Site and optional channels]

## Priority Order
[what should happen first]

## Handoff to Strategist (Eldon)
[clear implementation directives for the next planning cycle]
```

## Veto Conditions

Reject and redo if ANY are true:
1. The recommendations are generic or not tied to Atos signals.
2. The plan does not define what to do first.
3. The handoff to Eldon is missing or non-actionable.
4. The plan does not update the decision portfolio (`scale/optimize/retest/pause|kill`).
