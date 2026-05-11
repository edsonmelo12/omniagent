---
task: "Angle and Gap Lock"
order: 1
input: |
  - strategy_context: Approved content strategy, topic direction, and market context
  - research_signals: Market, social, and GEO notes that reveal demand and ambiguity
  - canonical_brief: Existing brief constraints that must be preserved
output: |
  - angle_options: Three materially different angle options
  - chosen_angle: The selected angle with rationale
  - editorial_gap: The content gap or tension that justifies the article
  - repetition_risk: Patterns that must not be repeated
---

# Angle and Gap Lock

Define why this article deserves to exist before deciding how it will be structured.

## Process

1. Extract the live tension from strategy, research, and search intent instead of defaulting to a generic topic summary.
2. Generate three angle options that differ in thesis, structure family, and proof style.
3. Choose the strongest angle based on demand, credibility, and anti-repetition value.
4. State what nearby posts must not repeat and what information gain this article will add.

## Output Format

```yaml
angle_options:
  - angle: ""
    thesis: ""
    structure_family: ""
    proof_style: ""
    why_it_could_win: ""
chosen_angle:
  angle: ""
  thesis: ""
  structure_family: ""
  rationale: ""
editorial_gap:
  unresolved_question: ""
  information_gain: ""
  proof_need: ""
repetition_risk:
  avoid_opening: ""
  avoid_arc: ""
  avoid_generic_claim: ""
```

## Output Example

```yaml
angle_options:
  - angle: "Por que volume editorial nao resolve a falta de demanda qualificada"
    thesis: "Marcas confundem frequencia com sistema e perdem capacidade de gerar demanda util."
    structure_family: "contrarian guide"
    proof_style: "comparacao entre volume, consistencia e aproveitamento"
    why_it_could_win: "Ataca um erro comum sem virar checklist generico."
  - angle: "O teardown de um blog que publica muito e nao vira referencia"
    thesis: "A falha nao e falta de esforco; e falta de tese, prova e distribuicao."
    structure_family: "teardown critico"
    proof_style: "sintomas, mecanismo e correcoes"
    why_it_could_win: "Faz leitura critica e gera contraste forte."
  - angle: "Framework para transformar um tema em blog + social + discoverability"
    thesis: "Um sistema editorial forte nasce de uma pauta que ja nasce reutilizavel."
    structure_family: "framework operacional"
    proof_style: "sequencia, checkpoints e failure modes"
    why_it_could_win: "Gera utilidade operacional imediata."
chosen_angle:
  angle: "O teardown de um blog que publica muito e nao vira referencia"
  thesis: "A falha nao e falta de esforco; e falta de tese, prova e distribuicao."
  structure_family: "teardown critico"
  rationale: "Entrega contraste, prova e anti-repeticao sem soar como manual generico."
editorial_gap:
  unresolved_question: "Por que empresas publicam e ainda assim nao viram referencia?"
  information_gain: "Conecta tese editorial, prova e descoberta em vez de listar dicas soltas."
  proof_need: "Sintomas observaveis, erros recorrentes e sinais de distribuicao fraca."
repetition_risk:
  avoid_opening: "Nao abrir com definicao escolar de blog ou marketing de conteudo."
  avoid_arc: "Nao usar problema -> 3 passos -> FAQ -> conclusao."
  avoid_generic_claim: "Nao prometer autoridade sem mostrar o mecanismo."
```

## Quality Criteria

- [ ] The three angle options are materially different.
- [ ] The chosen angle has a clear content gap and information gain.
- [ ] Repetition risks are explicit and actionable.

## Veto Conditions

Reject and redo if ANY are true:
1. The angle options are cosmetic variations of the same article.
2. The chosen angle has no defensible editorial gap.
