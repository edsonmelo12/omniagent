---
execution: subagent
agent: monitor
model_tier: powerful
inputFile: squads/social-growth/output/publishing/v1/schedule-plan.md
outputFile: squads/social-growth/output/monitoring/health-summary.md
---

# Step 07: Monitor Health

## Context Loading

Load these files before executing:
- `squads/social-growth/output/publishing/v1/schedule-plan.md` — current content cadence and delivery order
- `squads/social-growth/pipeline/data/monitoring-intake.md` — expected metrics intake
- `squads/social-growth/pipeline/data/monitoring-kpis.md` — KPI priority list
- `squads/social-growth/pipeline/data/monitoring-rhythm.md` — review cadence
- `_opensquad/core/best-practices/data-analysis.md` — analytical quality rules

## Instructions

### Process
1. Read the schedule and identify which metrics matter for each channel.
2. Summarize the current health model for Instagram, Facebook and TikTok.
3. Highlight the KPIs that should be watched every week.
4. Note which signal combinations indicate risk or opportunity.
5. Produce an executive health summary that can feed the action step.

## Output Format

```
# Health Summary

## Overall Status
[green / yellow / red with a short explanation]

## KPI Priorities
[list of KPIs with reasons]

## Channel Notes
[Instagram, Facebook, TikTok]

## Signals to Watch
[what indicates health, risk or improvement]
```

## Output Example

```
# Health Summary

## Overall Status
Yellow — the profile is active, but the current system needs consistent measurement.

## KPI Priorities
- crescimento liquido
- engajamento
- retencao de video
- salvamentos e compartilhamentos

## Channel Notes
- Instagram: melhor canal para descoberta e prova.
- Facebook: bom para estabilidade e base existente.
- TikTok: maior chance de alcance rapido, mas exige hook forte.

## Signals to Watch
- alcance alto com pouco engajamento
- video com quedas fortes de retencao
- crescimento sem aumento de visitas ao perfil
```

## Veto Conditions

Reject and redo if ANY are true:
1. The summary only lists metrics without interpretation.
2. The report does not distinguish between channels.

## Quality Criteria

- [ ] The report states overall health clearly.
- [ ] KPI priorities are ordered by importance.
- [ ] Each channel has a short health note.
- [ ] Signals to watch are explicit and useful.
