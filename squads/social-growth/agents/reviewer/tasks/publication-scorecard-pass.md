---
task: "Publication Scorecard Pass"
order: 1
input: |
  - review_inputs: Blog post, architecture, brief, review rubric, and scorecard rules
output: |
  - scorecard_pass: Weighted score, blockers, and structural findings
---

# Publication Scorecard Pass

Score the package with enough rigor that the final decision can be trusted.

## Process

1. Score each weighted dimension with justification.
2. Identify blockers by severity, including genericity, repetition, weak hook, and shallow GEO.
3. Validate whether the article preserved its structure family, copy brief lock, and image logic.
4. When social assets are present, apply `pipeline/data/skill-invocation-gate.md` before scoring quality: missing required skill evidence is a P1 blocker.
5. Produce a structured scorecard pass for the final reviewer decision.

## Output Format

```yaml
scorecard_pass:
  weighted_scores:
    - dimension: ""
      weight: 0
      score: 0
      notes: ""
  total: 0
  preliminary_decision: ""
  blockers:
    - severity: ""
      item: ""
      location: ""
      required_action: ""
  structure_variety_notes: ""
  copy_and_hook_notes: ""
  skill_invocation_gate:
    checked: false
    missing_required_skills: []
    ledger_findings: []
    decision: ""
```

## Output Example

```yaml
scorecard_pass:
  weighted_scores:
    - dimension: "Intent alignment"
      weight: 20
      score: 17
      notes: "Tema e promessa estao bem alinhados ao leitor."
    - dimension: "Differentiation and anti-genericity"
      weight: 10
      score: 4
      notes: "A abertura perdeu tensao e o corpo voltou a um arco previsivel."
  total: 76
  preliminary_decision: "revise"
  blockers:
    - severity: "P1"
      item: "Abertura generica"
      location: "Intro"
      required_action: "Recuperar o hook escolhido e aumentar contraste logo na abertura."
  structure_variety_notes: "A family chosen as teardown now reads partly like a checklist article."
  copy_and_hook_notes: "O CTA esta coerente, mas a promessa perdeu contundencia."
```

## Quality Criteria

- [ ] Every weighted score includes a justification.
- [ ] Structural repetition is scored, not hand-waved.
- [ ] Hook and copy quality are evaluated explicitly.
- [ ] Social generation outputs include verified Skill Invocation Ledgers when present.

## Veto Conditions

Reject and redo if ANY are true:
1. The scorecard ignores genericity or repetition.
2. The blockers do not point to exact locations and actions.
3. Social generation output is scored as publishable before required skill invocation is verified.
