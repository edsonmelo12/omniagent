# Trend Opportunity Radar

## Taxonomia Ativa

- Opportunity status: `validated`, `under_tested`, `execution_failed`, `distribution_failed`, `market_misaligned`, `strategic_bet`, `discarded`
- Decision tag: `scale`, `optimize`, `retest`, `pause`, `kill`

## Radar Table

| hypothesis_id | cluster | angle | source_signal | opportunity_status | confidence | decision_tag | why_now | next_test | owner |
|---|---|---|---|---|---|---|---|---|---|
| H-001 | decisao de compra | criterio vs preco | performance_signal + sales_objection | validated | alta | scale | criterio de compra mostrou valor percebido e aderencia ao blog | ampliar carrossel utilitario + artigo de comparacao | Eldon |
| H-002 | objecoes comerciais | preco x valor | sales_objection + comment_pattern | strategic_bet | media | retest | objecao recorrente, cobertura editorial ainda curta | sequencia social + CTA de curadoria no direct | Eldon |
| H-003 | prova de confianca | reputacao da marca artesanal | competitor_gap + strategic_inference | under_tested | media | retest | tema importante para ticket e risco percebido, ainda pouco testado | blog + prova social + FAQ de confianca | Eldon |
| H-004 | descoberta social | mensagem generica de oferta | performance_signal | market_misaligned | media | pause | CTA generico mostrou sinal pior que CTA especifico | pausar copia vaga e reavaliar depois de novo ciclo | Eldon |
| H-005 | conversao assistida | curadoria no direct | sales_objection + performance_signal | strategic_bet | media | optimize | ponte social -> conversa comercial parece promissora, mas ainda sem volume robusto | testar CTA unico em ativos de maior alcance | Eldon |

## False Negative Suspects

- `conversao social direta`: sinal ainda parcial; nao matar sem separar problema de CTA, oferta e janela.
- `prova de confianca`: tema pouco explorado; baixa evidência hoje nao basta para descartar.

## Rules Applied This Cycle

1. Nenhum angulo recebeu `kill`.
2. Toda hipotese tem `source_signal`.
3. Angulos subexplorados ficaram em `retest` ou `pause`, nao em descarte.
