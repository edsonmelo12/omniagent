---
execution: subagent
agent: scheduler
model_tier: powerful
inputFile: squads/social-growth/output/approvals/schedule-approval.md
outputFile: squads/social-growth/output/publishing/schedule-plan.md
---

# Step 06: Schedule Delivery

## Context Loading

Load these files before executing:
- `squads/social-growth/output/approvals/schedule-approval.md` — user approval
- `squads/social-growth/output/blog/blog-post.md` — approved discovery-optimized blog when present
- `squads/social-growth/output/repurposing/content-repurpose.md` — approved repurpose package when present
- `squads/social-growth/output/content/content-production-package.md` — approved content production package
- `squads/social-growth/output/creative/visual-direction.md` — approved visual direction
- `squads/social-growth/output/creative/rendered-assets.md` — final render manifest
- `squads/social-growth/output/review/content-review.md` — review notes
- `squads/social-growth/output/strategy/content-plan.md` — plan and cadence
- `_opensquad/core/best-practices/social-networks-publishing.md` — publishing constraints

## Instructions

### Process
1. Convert the approved content into a calendar-friendly delivery order.
2. Group posts by platform, priority, visual complexity, render state and timing.
3. **Check existing schedule** — read the current `{client}/publishing/schedule-plan.md` and query WordPress (`/wp/v2/posts?status=future`) for already-occupied dates. The new batch must start **after** the last occupied date.
4. **Distribute uniformly** — calculate `interval = total_days / total_posts` and space posts evenly. Never cluster all posts in the first few days.
5. **Ensure no date overlap** — same channel must never have 2+ items on the same date.
5. Keep the schedule realistic and easy to execute.
6. Add notes on what should go first, what can wait and what needs attention.
7. Return a final publishing plan, not just a list of posts.

## Output Format

```
# Schedule Plan

## Calendar
[date, platform, format, theme, status]

## Priority Order
[what goes first and why]

## Execution Notes
[timing, dependencies, reminders]

## Render References
[render manifest path and asset status when relevant]

## Blog Constraints
[word-count target, featured-image direction and source rationale used in the cycle]
```

## Output Example

```
# Schedule Plan

## Calendar
| Data | Canal | Formato | Tema | Status |
|---|---|---|---|---|
| Seg | Instagram | Carrossel | Crescimento | Pronto |
| Ter | LinkedIn | Post | Posicionamento | Pronto |
| Qui | Instagram | Reel | Dica rapida | Pronto |
| Sex | Stories | Sequencia | Bastidores | Pronto |

## Priority Order
- Primeiro o carrossel, porque ele sustenta os demais formatos.
- Depois o LinkedIn, para consolidar autoridade.

## Execution Notes
- manter intervalo entre publicacoes principais;
- revisar respostas nos stories no mesmo dia;
- registrar o que performou melhor.

## Visual Notes
- use a mesma familia visual para o ciclo;
- destacar prova visual nas pecas de maior conversao;
- simplificar capas para leitura mobile.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The schedule is too crowded for the team to execute.
2. The plan does not state what goes first.

## Quality Criteria

- [ ] The calendar is easy to execute.
- [ ] Priority order is explicit.
- [ ] Visual direction is reflected in the execution order.
- [ ] Timing respects capacity and channel behavior.
- [ ] Notes help the team act immediately.
- [ ] Blog length and featured-image constraints are reflected in the execution notes.
- [ ] Blog source rationale is reflected in the execution notes.
- [ ] **No date conflicts** — checked against existing schedule-plan.md and WordPress `future` posts.
- [ ] **New batch starts after previous** — first date is > last occupied date in calendar.
- [ ] **Max 1 post per channel per day** — no same-channel date overlap.
- [ ] **Uniform distribution** — posts are evenly spaced across the full period, not clustered at the start.
