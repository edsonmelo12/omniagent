# Strategy Feedback Loop

Use este arquivo como memória estratégica cumulativa do cliente.
Objetivo: impedir redescoberta burra entre ciclos.

## Active Hypotheses

| hypothesis_id | angle | current_status | confidence | owner | next_review |
|---|---|---|---|---|---|
| H-001 | critério de compra > preço | under_tested | média | Eldon | 2026-05-01 |

## Confirmed Learnings

- [data] [aprendizado confirmado] -> [implicação estratégica]

## Refuted Learnings

- [data] [hipótese rejeitada] -> [motivo]

## False Negative Suspects

- [hipótese] -> [por que pode ter falhado por execução/distribuição e não por tese]

## Winning Formats

- [canal + formato + contexto] -> [por que venceu]

## Saturated Angles

- [ângulo] -> [sinal de saturação]

## Next Bets

- [hipótese nova] -> [teste recomendado]

## Decision Ledger

| cycle | item | evidence_summary | confidence | decision | rationale |
|---|---|---|---|---|---|
| 2026-W17 | H-001 | comentários + CTR + retenção | média | optimize | tese boa, hook ainda fraco |

## Hard Rules

1. Toda decisão deve cair em uma destas tags:
   - `scale`
   - `optimize`
   - `retest`
   - `pause`
   - `kill`
2. Aprendizado sem evidência resumida não entra no ledger.
3. `kill` exige justificativa explícita de por que não é problema de execução nem de distribuição.
4. Se confiança for `baixa`, preferir `retest` ou `pause`, não `kill`.
