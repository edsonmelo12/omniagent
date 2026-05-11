---
execution: subagent
agent: atlas-ceo
model_tier: powerful
outputFile: squads/social-growth/output/{run_id}/context/ceo-orientation.md
---

# Step 000: CEO Orientation

## Context Loading

Load these files before executing:
- `_opensquad/_memory/company.md` — company context and brand direction
- `_opensquad/_memory/preferences.md` — language and user preferences
- `squads/social-growth/state.json` — current squad state
- `squads/social-growth/_memory/memories.md` — squad memory and past learnings
- `squads/social-growth/pipeline/data/master-guide.md` — complete squad operating guide
- `squads/social-growth/pipeline/data/operational-index.md` — operational index
- `squads/social-growth/output/{client}/publishing/schedule-plan.md` — actual publishing schedule with dates
- `squads/social-growth/output/{client}/publishing/schedule-status.md` — published vs pending status
- `squads/social-growth/output/{client}/publishing/social-publish-monitor.md` — queue status and blocked items

## Instructions

### Process

1. Carregar e absorver o contexto completo do squad, cliente e estado atual.
2. **Sincronizar a realidade da campanha** — sempre conferir se o `editorial-backlog.md`, `campaign-hub.html` e `rendered-assets.md` refletem o status exato dos ativos (Pronto, Pendente, Em Revisão). Nunca deixar o backlog desatualizado em relação ao hub.
3. **Carregar cronograma real** — ler `schedule-plan.md` (datas agendadas), `schedule-status.md` (o que já foi feito), e `social-publish-monitor.md` (status da fila de publicação). Identificar quantos posts estão confirmados, quais as datas e se há itens bloqueados na fila.
4. Avaliar o cenário real: em que data estamos, quantos posts já passaram, quantos estão por vir, o que está bloqueado na fila de publicação. 
5. Identificar gargalos, riscos e oportunidades no fluxo atual.
6. Priorizar os próximos passos com base em impacto e urgência.
7. Produzir um documento de orientação claro que:
   - Declara o contexto e estágio atual com as datas reais
   - Identifica itens críticos que requerem atenção
   - Recomenda a ordem de prioridade para os passos restantes
   - Sinaliza riscos, suposições ou decisões necessárias
   - Fornece diretrizes claras para os agentes que seguem
8. Se esta for a primeira execução, orientar para intake e descoberta.
9. Se for execução subsequente, verificar memórias para decisões passadas e evitar repetir padrões conhecidos.

## Output Format

```
# Orientação do CEO

## Contexto da Run
[nome do cliente, propósito da run, estágio atual do pipeline]

## Avaliação da Situação
[o que está acontecendo agora, o que foi feito, o que está pendente]

## Cronograma Real
[próximos posts agendados com datas, status da fila de publicação, quantos confirmados vs em previsão]

## Alertas de Publicação
[itens bloqueados na fila (missing_exported_files, etc.), itens prestes a vencer]

## Itens Críticos
[itens que requerem atenção imediata ou decisão]

## Prioridade Recomendada
[lista ordenada de próximos passos com justificativa]

## Riscos e Suposições
[o que pode dar errado, o que se supõe ser verdadeiro]

## Orientação para Agentes
[diretivas para os agentes do squad nesta run]

## Decisões Registradas
[decisões tomadas nesta orientação, para rastreabilidade]
```

## Condições de Veto

Rejeitar e refazer se QUALQUER um for verdadeiro:
1. A orientação não referencia o estado atual do squad ou memórias.
2. A prioridade recomendada não é justificada pelo contexto.
3. Riscos e suposições não estão explicitamente declarados.
4. A realidade da campanha não foi sincronizada com o hub e backlog.
5. **O cronograma real não foi carregado e verificado (schedule-plan.md, schedule-status.md, social-publish-monitor.md).**
6. **Há itens "blocked" na fila de publicação que não foram mencionados nos Alertas.**

## Critérios de Qualidade

- [ ] O contexto completo foi carregado antes de produzir a orientação.
- [ ] A orientação conecta claramente ao estado do squad e contexto do cliente.
- [ ] Riscos e oportunidades estão explicitamente identificados.
- [ ] A ordem de prioridade é justificada por impacto.
- [ ] Os agentes seguindo este passo têm orientação clara e acionável.
- [ ] A realidade da campanha foi sincronizada (backlog = hub = rendered-assets).
- [ ] **O cronograma real foi carregado e as datas conferidas.**
- [ ] **Itens bloqueados na fila de publicação foram identificados e reportados.**
