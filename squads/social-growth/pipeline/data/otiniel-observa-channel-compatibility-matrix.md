# Otiniel Observa - Matriz de Compatibilidade por Canal

## Objetivo

Definir quais campos são obrigatórios, opcionais ou não aplicáveis por canal/provedor no contrato `Otiniel -> Atos`.

## Legenda

- `R` = obrigatório
- `O` = opcional
- `N/A` = não aplicável

## Núcleo de Contexto (todos os canais)

| Campo | Meta | GA4 | YouTube | LinkedIn | CRM |
|---|---:|---:|---:|---:|---:|
| `client_id` | R | R | R | R | R |
| `channel` | R | R | R | R | R |
| `window_type` | R | R | R | R | R |
| `period_start` | R | R | R | R | R |
| `period_end` | R | R | R | R | R |
| `collection_source` | R | R | R | R | R |
| `evidence_level` | R | R | R | R | R |
| `completeness_status` | R | R | R | R | R |

## Métricas de Distribuição/Resposta

| Campo | Meta | GA4 | YouTube | LinkedIn | CRM |
|---|---:|---:|---:|---:|---:|
| `impressions` | R | N/A | O | O | N/A |
| `reach` | R | N/A | O | O | N/A |
| `likes` | O | N/A | O | O | N/A |
| `comments_count` | O | N/A | O | O | N/A |
| `shares` | O | N/A | O | O | N/A |
| `saves` | O | N/A | N/A | N/A | N/A |
| `profile_visits` | O | N/A | N/A | O | N/A |
| `link_clicks` | O | N/A | O | O | N/A |
| `video_views` | O | N/A | R | O | N/A |
| `video_retention_rate` | O | N/A | O | O | N/A |
| `followers_gained` | O | N/A | O | O | N/A |

## Métricas de Site/Negócio

| Campo | Meta | GA4 | YouTube | LinkedIn | CRM |
|---|---:|---:|---:|---:|---:|
| `sessions` | N/A | R | N/A | N/A | N/A |
| `users` | N/A | O | N/A | N/A | N/A |
| `engaged_users` | N/A | R | N/A | N/A | N/A |
| `avg_engagement_time_seconds` | N/A | R | N/A | N/A | N/A |
| `source_medium` | N/A | R | N/A | N/A | N/A |
| `campaign` | O | O | O | O | O |
| `landing_page` | N/A | O | N/A | N/A | N/A |
| `key_events` | N/A | O | N/A | N/A | N/A |
| `conversions` | O | O | O | O | O |
| `leads` | N/A | O | N/A | N/A | R |
| `revenue` | N/A | O | N/A | N/A | O |

## Readiness por Fase

### Fase 1 (baseline obrigatório)

- `Meta` ativo com coleta válida do período
- `GA4` ativo com coleta válida do período
- summaries gerados para `weekly` e `monthly`

### Fase 2

- `LinkedIn` quando houver acesso autorizado e demanda do cliente
- comparativos por campanha/canal

### Fase 3

- alertas automáticos
- scoring preditivo de conteúdo
- recomendações priorizadas por objetivo

## Regras de Compatibilidade Analítica

1. Não comparar métricas com semânticas diferentes sem qualificador explícito.
2. Não comparar períodos com janelas diferentes.
3. Métricas opcionais ausentes devem permanecer ausentes (`null`), sem imputação.

