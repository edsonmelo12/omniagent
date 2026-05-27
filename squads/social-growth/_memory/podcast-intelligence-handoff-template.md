# Podcast Intelligence Handoff Template

## Purpose

Padronizar o repasse de um vídeo, podcast ou episódio para o agente especialista correto antes da síntese final.

## Question Policy

- default: proceed with best effort and deliver ready
- ask questions only when a missing input blocks the analysis or changes the routing decision
- maximum: 1 blocking question per handoff
- if the answer can be inferred with reasonable confidence, mark it as an assumption and continue

## Input

- source link
- video or episode ID
- source name
- published date
- client target
- analysis objective
- dominant theme
- current confidence

## Routing Decision

- `Discovery Optimizer` -> algoritmo, distribuição, alcance, mecânica de plataforma
- `Researcher` -> mercado, audiência, benchmark, sinais externos
- `Strategist` -> mix, cadência, pilares, implicação editorial
- `Creator` -> execução, formato, adaptação do insight para peça
- `Reviewer` -> qualidade, risco, aderência final
- `Atos Analista` -> validação pós-ciclo e aprendizagem por resultado

## Handoff Summary

- why this agent should receive it
- what question this agent must answer
- what evidence should be prioritized
- what output is expected back
- what assumptions can be safely made if the answer is not explicit
- candidate strategy name, when the episode clearly supports one

## Expected Output

- one-line thesis
- strategy name, if clear
- 3 to 5 key signals
- decision suggestion
- confidence level
- what should happen next

## Veto Rules

- do not send ambiguous themes without a primary competency owner
- do not let the Strategist absorb specialist work before the specialist weighs in
- do not merge routing and final synthesis into one step
- do not skip the final consolidation pass
- do not ask for clarification if the analysis can proceed with a documented assumption

## Final Consolidation

Atlas receives the specialist output and decides:

- consolidate now
- route to another specialist
- hold for more evidence
- send to Strategist for campaign-level action
