# Observation Overview

## Período de Observação
2026-03-25 a 2026-04-24

## Resumo de Ativos Qualificados
| Ativo | Canal | Pilar | Ângulo | Performance Principal |
|---|---|---|---|---|
| Snapshot de perfil | Instagram | Não atribuído | Diagnóstico de presença | `379` impressões proxy, `379` alcance |
| Snapshot de página | Facebook | Não atribuído | Diagnóstico de presença | `1.392` followers, `1.392` fans |
| Snapshot de tráfego do site | Site | Não atribuído | Descoberta e conversão | `71` sessões, `46` usuários engajados, `5` conversões |
| Snapshot de negócio | Business | Não atribuído | Qualificação comercial | `18` leads, `4` meetings, `2` opportunities |

## Sinais Multicanal
- **Instagram:** coleta `live_api` funcionando no profile Meta após correção do adapter.
- **Facebook:** profile de observação criado no Otiniel e coleta `live_api` de página funcionando.
- **Blog/Site:** coleta `live_api` funcionando no GA4 após corrigir request duplicada de métricas.
- **Business:** trilha bootstrap segue útil para leitura de fundo de funil.

## Evidência Qualitativa (Voz da Audiência)
- **Sentimento Médio Agregado:** não calculado neste ciclo.
- **Temas Recorrentes (Tags):** `campaign`, `meta_note`, `manual_note`, `crm_note`, `pipeline_name`, `owner`, `deal_stage`.

## Dashboard 2 — Aquisição (origem de tráfego / site)
| Origem | Valor | Observação |
|---|---:|---|
| Sessões | 71 | `live_api` via GA4 |
| Usuários engajados | 46 | base de engajamento do período |
| Tempo de engajamento | 2201s | janela agregada |
| Key events | 5 | eventos relevantes agregados |
| Conversions | 5 | conversão final agregada |

## Dashboard 3 — Conversão (agregado)
| Estágio | Volume | Origem predominante | Observação |
|---|---:|---|---|
| Lead | 18 | Business bootstrap | Cobertura válida |
| Meeting | 4 | Business bootstrap | Parcial |
| Opportunity | 2 | Business bootstrap | Parcial |
| Proposal request | 1 | Business bootstrap | Sinal comercial útil |

## Metadados de Confiança
- Fonte: integrações autorizadas + fallbacks operacionais registrados
- Completude: `complete` no summary mensal, com limitações por source fallback
- Collection Source: `live_api` (Instagram + Facebook + GA4)
- Contrato Sensível: sem identificadores pessoais, sem texto bruto de DM/comentário, sem credenciais
