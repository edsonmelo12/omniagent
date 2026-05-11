---
name: meta-insights
description: >
  Coleta métricas de insights do Instagram e Facebook via Meta Graph API.
  Used for fetching post-level metrics (views, reach, likes, comments, shares, saves)
  and account-level metrics (follower_count, reach, impressions).
  Requires credentials from .env.publish.{client} or environment variables.
description_pt_BR: >
  Coleta métricas de insights do Instagram e Facebook via Meta Graph API.
  Usado para buscar métricas por post (views, reach, likes, comments, shares, saves)
  e métricas de conta (follower_count, reach, impressions).
  Requer credenciais do .env.publish.{client} ou variáveis de ambiente.
type: script
version: "1.0.0"
script:
  path: scripts/insights.js
  runtime: node
  invoke: "node --env-file=.env {skill_path}/scripts/insights.js --client {client} --period {period}"
env:
  - INSTAGRAM_ACCESS_TOKEN
  - INSTAGRAM_USER_ID
  - FACEBOOK_ACCESS_TOKEN
  - FACEBOOK_PAGE_ID
categories: [analytics, social-media, meta, instagram]
---

# Meta Insights

Collect Instagram and Facebook metrics via Meta Graph API.

## When to use

- Collect post engagement metrics (views, reach, likes, comments, shares, saved)
- Track account-level performance (follower growth, reach, impressions)
- Feed the Monitor agent with real data for campaign optimization

## Workflow

### 1. Identify the client and period

```
Client: amiclube
Period: last_7_days | last_30_days | lifetime
```

### 2. Run the insights collector

```bash
node --env-file=.env squads/social-growth/scripts/insights.js \
  --client amiclube \
  --period last_7_days
```

### 3. Data collected

- Per post: `views`, `reach`, `likes`, `comments`, `shares`, `saved`, `total_interactions`
- Per account: `follower_count`, `reach`, `impressions`, `profile_views`

### 4. Integration

The script outputs JSON that can be saved to the monitoring_reports table.

## Supported Metrics

| Metric | Post | Account | Description |
|-------|------|---------|-------------|
| `views` | ✅ | ✅ | Total visualizações |
| `reach` | ✅ | ✅ | Público atingido |
| `likes` | ✅ | - | Curtidas |
| `comments` | ✅ | - | Comentários |
| `shares` | ✅ | - | Compartilhamentos |
| `saved` | ✅ | - | Salvos |
| `total_interactions` | ✅ | ✅ | Engagement total |
| `follower_count` | - | ✅ | Total de seguidores |
| `profile_views` | - | ✅ | Visitas ao perfil |

## Constraints

- Data delay: up to 48 hours
- Stories: available for 24 hours only
- Requires: Instagram Business or Creator account
- Token: must have `instagram_basic`, `instagram_manage_insights`

## Output shape

```json
{
  "collected_at": "2026-05-04T18:00:00Z",
  "client": "amiclube",
  "period": "last_7_days",
  "account_metrics": {
    "follower_count": 1250,
    "reach": 8500,
    "impressions": 12000
  },
  "posts": [
    {
      "media_id": "17969782069736348",
      "post_url": "https://instagram.com/p/...",
      "published_at": "2026-05-01T18:30:00Z",
      "metrics": {
        "views": 3200,
        "reach": 2800,
        "likes": 342,
        "comments": 28,
        "shares": 15,
        "saved": 45,
        "total_interactions": 430
      }
    }
  ]
}
```