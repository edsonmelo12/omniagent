---
task: "Retrieval Pass"
order: 1
input: |
  - draft_post: Blog draft with thesis, hook, and family arc already defined
  - architecture_context: Blog architecture, brief, and GEO context
output: |
  - optimization_plan: Retrieval and clarity plan for the final pass
---

# Retrieval Pass

Improve extractability and entity clarity without flattening the article.

## Process

1. Reconfirm search intent, entity targets, and the article's direct-answer path.
2. Identify whether a top summary block is actually needed or whether a direct opening serves retrieval better; then refine definitions, FAQ tightening, and source framing.
3. Explicitly note which structural elements and hook logic must be preserved.
4. Produce an optimization plan that the final pass can execute safely.

## Output Format

```yaml
optimization_plan:
  direct_answer_path: ""
  opening_pattern_decision: ""
  entity_targets:
    - ""
  retrieval_improvements:
    - ""
  preserve:
    thesis: ""
    structure_family: ""
    chosen_hook: ""
    section_arc: ""
  risks_to_avoid:
    - ""
```

## Output Example

```yaml
optimization_plan:
  direct_answer_path: "Abrir com resposta curta ao problema antes do aprofundamento."
  opening_pattern_decision: "Nao usar TL;DR. A abertura contraria sustenta melhor a tensao e a diferenciacao deste artigo."
  entity_targets:
    - "Portal de Midias"
    - "sistema editorial"
  retrieval_improvements:
    - "Explicitar a resposta curta nos dois primeiros paragrafos sem criar bloco-resumo padrao."
    - "Explicitar prova e limites em bloco proprio."
  preserve:
    thesis: "O problema nao e volume; e falta de espinha editorial."
    structure_family: "teardown critico"
    chosen_hook: "O problema do seu blog pode nao ser falta de conteudo. Pode ser falta de tese."
    section_arc: "problema -> sintoma -> mecanismo -> prova -> limites -> conclusao"
  risks_to_avoid:
    - "Nao transformar o artigo em checklist generico."
    - "Nao enfraquecer a tensao da abertura."
```

## Quality Criteria

- [ ] The optimization plan improves retrieval without rewriting the thesis.
- [ ] The opening-pattern decision is explicit and not template-driven.
- [ ] Preserve rules are explicit.
- [ ] Risks to avoid include flattening and genericity.

## Veto Conditions

Reject and redo if ANY are true:
1. The optimization plan does not protect the chosen hook and section arc.
2. The improvements focus only on SEO mechanics and ignore GEO extractability.
