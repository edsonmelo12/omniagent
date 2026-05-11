---
execution: subagent
agent: atos-analista
model_tier: powerful
inputFile: squads/social-growth/output/{client}/oto/observation-overview.md
outputFile: squads/social-growth/output/{client}/strategy/atos-strategic-report.md
---

# Step 08: Strategic Analysis & Decision Verdict

## Context Loading

Load these files before executing:
- `squads/social-growth/output/{client}/oto/observation-overview.md` — normalized evidence from Oto
- `squads/social-growth/output/{client}/oto/observation-overview.html` — approved visual preview used in checkpoint
- `squads/social-growth/output/strategy/content-plan.md` — original plan and hypotheses
- `squads/social-growth/output/{client}/strategy/trend-opportunity-radar.md` — optional prior radar of strategic opportunities
- `squads/social-growth/output/{client}/strategy/strategy-feedback-loop.md` — optional cumulative learning memory
- `squads/social-growth/pipeline/data/atos-analista-prd.md` — analytical rules and decision taxonomy
- `squads/social-growth/pipeline/data/trend-opportunity-radar-template.md` — status and decision taxonomy for underexplored angles
- `squads/social-growth/pipeline/data/strategy-feedback-loop-template.md` — cumulative strategic learning contract
- `squads/social-growth/pipeline/data/atos-analista-sensitive-contract.md` — data sensitivity contract
- `squads/social-growth/pipeline/data/otiniel-observa-channel-compatibility-matrix.md` — field compatibility per channel
- `_opensquad/core/best-practices/data-analysis.md` — analytical principles

## Instructions

### Process
0. **Validação de Contrato:** confirme que os dados recebidos respeitam o contrato sensível (`permitido/mascarar/bloquear`) antes de analisar.
1. **Julgamento de Hipóteses:** Compare as evidências do Oto com as metas do Eldon. O que foi VALIDADO? O que foi REPROVADO?
2. **Detecção de Padrões:** Identifique quais combinações de Pilar + Ângulo estão gerando o melhor "Business Value".
3. **Análise de Portfólio:** O mix de conteúdo está equilibrado entre Autoridade, Descoberta e Conversão?
4. **Classificação de Hipótese (Obrigatório):** Para cada ângulo relevante, classifique com uma destas etiquetas:
   - `validated`
   - `under_tested`
   - `execution_failed`
   - `distribution_failed`
   - `market_misaligned`
   - `strategic_bet`
   - `discarded`
5. **Veredito por Ativo/Pilar:** Aplique decisão explícita com uma destas tags:
   - `scale`
   - `optimize`
   - `retest`
   - `pause`
   - `kill`
6. **Proteção contra falso negativo:** não usar `kill` quando a evidência sugere que o problema principal pode ser execução, distribuição ou amostra insuficiente.
7. **Recomendações para o Eldon:** Gere a lista priorizada de mudanças táticas para o próximo ciclo editorial.

## Output Format

```markdown
# Atos Strategic Report

## ⚖️ Vereditos Analíticos
| Alvo (Pilar/Ângulo) | Veredito | Justificativa Baseada em Evidência | Confiança |
|---------------------|----------|-------------------------------------|-----------|
| ...                 | ...      | ...                                 | ...       |

## 🧠 Padrões Detectados
- **Padrão Vencedor:** [Descrição do que escalar]
- **Conflito Identificado:** [Ex: Alcance alto mas conversão baixa]

## 🎯 Validação de Hipóteses do Ciclo
- [Hipótese 1]: [VALIDADA/REPROVADA] - [Breve porquê]

## 🧭 Opportunity Radar Update
| Hypothesis | Source Signal | Opportunity Status | Confidence | Decision Tag | Next Test |
|------------|---------------|--------------------|------------|--------------|-----------|
| ...        | ...           | ...                | ...        | ...          | ...       |

## 🧪 False Negative Suspects
- [Ângulo que parece fraco, mas pode ter falhado por execução/distribuição]

## 🚀 Próximos Passos Sugeridos (Input para o Eldon)
1. [Ação prioritária 1]
2. [Ação prioritária 2]
3. [Sugestão de pauta baseada em lacuna de evidência]

## 🛡️ Guardrails & Gaps
- [O que o Atos não conseguiu concluir por falta de dados]
- [Incompatibilidades de janela/métrica encontradas]
```

## Veto Conditions

Reject and redo if ANY are true:
1. O relatório não termina em decisões claras (taxonomia de decisão).
2. Não há nível de confiança explícito para os vereditos.
3. As recomendações não são acionáveis pelo Eldon.
4. O relatório tenta inferir comportamento individual de usuário.
5. O relatório usa campo bloqueado pelo contrato sensível.
6. O relatório mata (`kill`) um ângulo sem descartar antes falha de execução ou distribuição.
