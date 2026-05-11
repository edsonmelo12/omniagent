---
task: "Copy Brief Lock"
order: 1
input: |
  - blog_architecture: Approved thesis, arc, proof map, and family guardrails
  - strategy_context: Research, audience, and funnel context
  - brief_constraints: Canonical brief and CTA direction
output: |
  - copy_brief_lock: Locked writing brief for the draft
  - hook_strategy: Three hook options and one chosen hook
---

# Copy Brief Lock

Lock the persuasive logic of the article before drafting the body.

## Process

1. Translate the architecture into a writing brief with reader, problem, promise, objection, and CTA intensity.
2. Generate three distinct hook options using different emotional drivers or structural types.
3. Choose the hook that best fits the thesis, audience awareness, and non-generic positioning.
4. Produce a concise brief the drafting task can execute directly.

## Output Format

```yaml
copy_brief_lock:
  target_reader: ""
  reader_problem: ""
  awareness: ""
  promise: ""
  dominant_objection: ""
  proof_available: ""
  CTA_direction: ""
hook_strategy:
  option_a:
    hook: ""
    driver: ""
    structure: ""
  option_b:
    hook: ""
    driver: ""
    structure: ""
  option_c:
    hook: ""
    driver: ""
    structure: ""
  chosen_hook: ""
  rationale: ""
```

## Output Example

```yaml
copy_brief_lock:
  target_reader: "Gestor ou dono que ja publica, mas nao percebe ganho real de autoridade."
  reader_problem: "Ele investe em volume, mas nao consegue transformar posts em referencia citavel."
  awareness: "problem aware"
  promise: "Mostrar por que o problema nao e frequencia e sim espinha editorial."
  dominant_objection: "Parece teoria demais para uma operacao pequena."
  proof_available: "Erros recorrentes, sinais de distribuicao fraca e exemplos de estrutura."
  CTA_direction: "Levar para diagnostico estrategico ou revisao editorial."
hook_strategy:
  option_a:
    hook: "Publicar mais nao corrige um blog que ninguem lembra."
    driver: "loss aversion"
    structure: "contrarian statement"
  option_b:
    hook: "O problema do seu blog pode nao ser falta de conteudo. Pode ser falta de tese."
    driver: "curiosity"
    structure: "belief challenge"
  option_c:
    hook: "Tem empresa publicando toda semana e ainda assim invisivel para busca, IA e vendas."
    driver: "status risk"
    structure: "scenario lead"
  chosen_hook: "O problema do seu blog pode nao ser falta de conteudo. Pode ser falta de tese."
  rationale: "Conecta tensao editorial, busca e autoridade sem soar clickbait."
```

## Quality Criteria

- [ ] The copy brief lock is specific to the article and audience.
- [ ] Hook options are meaningfully different.
- [ ] The chosen hook supports the thesis and CTA direction.

## Veto Conditions

Reject and redo if ANY are true:
1. The chosen hook could be pasted into any generic marketing article.
2. The copy brief lock lacks a clear objection or promise.
