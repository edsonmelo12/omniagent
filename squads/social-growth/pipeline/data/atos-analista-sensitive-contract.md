# Atos Analista - Contrato Sensível de Dados

## Objetivo

Definir exatamente quais campos o `Atos Analista` pode consumir do `Otiniel Observa`, com governança explícita de sensibilidade.

Regra central:
- `Atos` só recebe sinais agregados por janela (`asset`, `weekly`, `monthly`).
- `Atos` nunca recebe identificadores pessoais, texto bruto de usuário, credenciais ou segredos.

## Classificação de Repasse

- `permitido`: pode ser entregue ao Atos sem transformação adicional.
- `mascarar`: pode ser entregue após sanitização/padronização.
- `bloquear`: nunca pode ser entregue ao Atos.

## Campos Canônicos e Governança

| Campo | Tipo | Status | Regra |
|---|---|---|---|
| `client_id` | string | permitido | obrigatório |
| `asset_id` | string | permitido | obrigatório na janela `asset` |
| `channel` | enum | permitido | `instagram|facebook|site|youtube|linkedin|business` |
| `window_type` | enum | permitido | `asset|weekly|monthly` |
| `period_start` | date | permitido | obrigatório |
| `period_end` | date | permitido | obrigatório |
| `collection_source` | enum | permitido | `live_api|metadata_snapshot|mock_collection` |
| `evidence_level` | enum | permitido | `high|medium|low` |
| `completeness_status` | enum | permitido | `complete|partial|missing` |
| `campaign` | string | mascarar | normalizar nomenclatura; remover identificadores sensíveis |
| `source_medium` | string | mascarar | taxonomia controlada |
| `landing_page` | string | mascarar | remover parâmetros não permitidos (exceto UTM) |
| `format` | enum | permitido | `carousel|reel|story|image|video|article|blog` |
| `theme` | string | permitido | vocabulário controlado |
| `impressions` | integer | permitido | agregado |
| `reach` | integer | permitido | agregado |
| `likes` | integer | permitido | agregado |
| `comments_count` | integer | permitido | somente contagem, sem conteúdo textual |
| `shares` | integer | permitido | agregado |
| `saves` | integer | permitido | agregado |
| `profile_visits` | integer | permitido | agregado |
| `link_clicks` | integer | permitido | agregado |
| `video_views` | integer | permitido | agregado |
| `video_retention_rate` | number | permitido | percentual agregado (0-100) |
| `sessions` | integer | permitido | agregado |
| `users` | integer | permitido | agregado |
| `engaged_users` | integer | permitido | agregado |
| `avg_engagement_time_seconds` | number | permitido | agregado |
| `key_events` | integer | permitido | agregado por evento padronizado |
| `conversions` | integer | permitido | agregado |
| `followers_gained` | integer | permitido | agregado |
| `leads` | integer | permitido | agregado |
| `revenue` | number | permitido | agregado por janela/campanha |

## Campos Bloqueados (Hard Block)

Nunca repassar para o Atos:
- `user_id`
- `user_pseudo_id`
- `session_id`
- `email`
- `phone`
- `name`
- `ip`
- texto bruto de comentário/DM/formulário/CRM
- `secret_ref`
- access token, refresh token, client secret
- URL com parâmetros que permitam identificação pessoal

## Derivados Oficiais

- `engagement_total = likes + comments_count + shares + saves`
- `engagement_rate = (engagement_total / reach) * 100` quando `reach > 0`, senão `null`
- `ctr = (link_clicks / impressions) * 100` quando `impressions > 0`, senão `null`
- `lead_rate = (leads / sessions) * 100` quando `sessions > 0`, senão `null`
- `conversion_rate = (conversions / sessions) * 100` quando `sessions > 0`, senão `null`
- `revenue_per_session = revenue / sessions` quando `sessions > 0`, senão `null`
- `revenue_per_lead = revenue / leads` quando `leads > 0`, senão `null`

## Regras de Qualidade

1. Não dividir por zero; retornar `null`.
2. Percentuais com duas casas decimais.
3. `0` significa medido e zerado; `null` significa indisponível.
4. Comparações só entre janelas compatíveis.
5. O Atos não pode recalcular métrica bruta com definição divergente do contrato.

