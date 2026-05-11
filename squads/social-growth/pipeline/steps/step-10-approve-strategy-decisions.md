---
type: checkpoint
owner: user-checkpoint
requiredArtifacts:
  - squads/social-growth/output/{client}/strategy/atos-strategic-report.md
  - squads/social-growth/output/{client}/strategy/action-plan.md
  - squads/social-growth/output/{client}/strategy/trend-opportunity-radar.md
  - squads/social-growth/output/{client}/strategy/strategy-feedback-loop.md
outputFile: squads/social-growth/output/{client}/approvals/strategy-decision-approval.md
---

# Step 10: Approve Strategy Decisions

## Context Loading

Load these files before executing:
- `squads/social-growth/output/{client}/strategy/atos-strategic-report.md` — analytical verdicts that justify the strategic moves
- `squads/social-growth/output/{client}/strategy/action-plan.md` — proposed decision portfolio for the next cycle
- `squads/social-growth/output/{client}/strategy/trend-opportunity-radar.md` — current map of validated, under-tested and strategic-bet angles
- `squads/social-growth/output/{client}/strategy/strategy-feedback-loop.md` — cumulative decision memory
- `squads/social-growth/output/{client}/index.md` — current operational source of truth when available

## Instructions

### Process
1. Present the decision portfolio from `action-plan.md` as the main approval surface.
2. Show the user, in plain language, the four mandatory buckets:
   - `scale`
   - `optimize`
   - `retest`
   - `pause` or `kill`
3. Expose which hypotheses in the radar and feedback loop support each bucket.
4. Ask the user to confirm whether the approved portfolio should seed the next planning cycle.
5. If the user requests changes, capture them explicitly by bucket.
6. Save the user's decision before any future strategy refresh.
7. If approval is granted, record that `step-02-strategy-plan.md` must treat this artifact as the approved starting point for the next cycle.

## Output Format

```markdown
# Strategy Decision Approval

## Approved Decision Portfolio
- `scale`: [item]
- `optimize`: [item]
- `retest`: [item]
- `pause` or `kill`: [item]

## Evidence Used
- Atos report: [key verdict]
- Radar: [key opportunity statuses]
- Feedback loop: [key confirmed/refuted learnings]

1. Aprovar e usar este portfolio como base do proximo ciclo.
2. Pausar para ajustes.

Se houver ajuste, descrever por bucket:
- scale
- optimize
- retest
- pause|kill
```

## Output Example

```markdown
# Strategy Decision Approval

## Approved Decision Portfolio
- `scale`: checklist de compra consciente com comparativos
- `optimize`: CTA de curadoria/orcamento em ativos de alto alcance
- `retest`: prova de reputacao artesanal com framing de confianca
- `pause` ou `kill`: oferta generica sem criterio visivel

## Evidence Used
- Atos report: checklist orientado a decisao gerou melhor valor de negocio
- Radar: H-001 validada; H-003 subtestada; H-004 pede ajuste de distribuicao
- Feedback loop: prova social segue promissora, mas sem amostra suficiente para escalar

1. Aprovar e usar este portfolio como base do proximo ciclo.
2. Pausar para ajustes.

Resposta do usuario:
1

Confirmacao registrada para o proximo ciclo estrategico.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The step does not ask for explicit user approval.
2. The approval is not captured before the pipeline ends.
3. The decision portfolio is not shown bucket by bucket.
4. The checkpoint proceeds without the required Atos report, action plan, radar or feedback loop artifacts.

## Quality Criteria

- [ ] The user sees the full decision portfolio before deciding.
- [ ] The approval or pause decision is saved to the canonical output file.
- [ ] The rationale references Atos, radar and feedback loop evidence.
- [ ] Requested changes are captured by bucket when approval is not granted.
