---
type: checkpoint
outputFile: squads/social-growth/output/approvals/schedule-approval.md
---

# Step 05: Approve Schedule

## Context Loading

Load these files before executing:
- `squads/social-growth/output/review/content-review.md` — final content review
- `squads/social-growth/output/blog/blog-post.md` — approved discovery-optimized blog when present
- `squads/social-growth/output/repurposing/content-repurpose.md` — approved repurpose package when present
- `squads/social-growth/output/content/content-production-package.md` — content production package ready for agenda
- `squads/social-growth/output/creative/visual-direction.md` — visual direction approved alongside the copy
- `squads/social-growth/output/creative/rendered-assets.md` — final render manifest for the cycle
- `squads/social-growth/output/creative/validation-checklist.md` — final validation gate for the batch
- `squads/social-growth/output/{client}/review/pipeline-compliance-{asset-or-batch-id}.md` — mandatory pipeline compliance report from Step 04B
- `squads/social-growth/output/strategy/content-plan.md` — strategic priorities

## Instructions

### Process
1. Present the approved blog, repurpose package, content production package, visual direction, rendered assets and the proposed posting sequence.
2. Confirm that the creative validation checklist passed before approval.
3. Confirm that Step 04 returned `PUBLISH`.
   - if Step 04 returned `REVISE` or `HOLD`, do not proceed to scheduling.
   - capture requested revisions and return to the appropriate upstream step.
4. Confirm that Step 04B returned `PASS` or `PASS_WITH_WARNINGS`.
   - if Step 04B returned `BLOCKED` or `INVALID`, do not ask for approval.
   - route the work back to the failed upstream step named in the audit report.
5. Present any Step 04B warnings to the user before asking for approval.
6. Ask the user to confirm that the schedule can proceed.
7. If the user asks for changes, capture the request clearly.
8. Save the user response before moving to the scheduler step.
9. If approval is granted, record that the next step may create the final schedule.

## Output Format

```
# Schedule Approval

O blog aprovado, o pacote de repurpose, o pacote de producao de conteudo, a direcao visual e os assets renderizados estao prontos.
O checklist criativo tambem foi validado.
O relatorio de conformidade da pipeline retornou `[PASS | PASS_WITH_WARNINGS]`.

## Blog Constraints
[word-count target, featured-image direction, source search note, and render status]

1. Aprovar e seguir para o plano de agendamento.
2. Pausar para ajustes.

Se houver ajuste, descreva objetivamente o que mudar:
- plataforma
- formato
- ordem de publicacao
- tom ou CTA
- direcao visual
```

## Output Example

```
# Schedule Approval

O blog aprovado, o pacote de repurpose, o pacote de producao de conteudo, a direcao visual e os assets renderizados foram revisados e estao prontos para a fila final.

1. Aprovar e seguir para o plano de agendamento.
2. Pausar para ajustes.

Resposta do usuario:
1

Confirmacao registrada para a etapa de agendamento.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The step does not ask for explicit user approval.
2. The approval is not captured before the next step.
3. Step 04B did not return `PASS` or `PASS_WITH_WARNINGS`.
4. The step asks for approval while the compliance audit is `BLOCKED` or `INVALID`.

## Quality Criteria

- [ ] The user has a clear approval choice.
- [ ] The response is saved before scheduling.
- [ ] The next step only runs after approval.
- [ ] The schedule step only proceeds when review verdict is `PUBLISH`.
- [ ] The schedule step only proceeds when pipeline compliance verdict is `PASS` or `PASS_WITH_WARNINGS`.
- [ ] Compliance warnings are shown to the user before approval.
- [ ] Blog length and featured-image constraints are visible before approval.
- [ ] Blog source search notes are visible before approval.
