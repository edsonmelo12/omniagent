---
name: ga4-insights
description: >
  Coleta métricas do Google Analytics 4 (GA4) via Data API.
  Usado para buscar pageviews, sessões, usuários, fontes de tráfego, páginas principais.
  Requer credentials de service account em arquivo JSON.
description_pt_BR: >
  Coleta métricas do Google Analytics 4 (GA4) via Data API.
  Usado para buscar pageviews, sessões, usuários, fontes de tráfego.
  Requer credentials de service account em arquivo JSON.
type: script
version: "1.0.0"
script:
  path: scripts/insights.js
  runtime: node
  invoke: "node {skill_path}/scripts/insights.js --client {client} --period {period}"
env:
  - GOOGLE_APPLICATION_CREDENTIALS
categories: [analytics, google, ga4, website]
---

# GA4 Insights

Collect Google Analytics 4 metrics via Data API.

## When to use

- Collect website traffic metrics (page views, sessions, users)
- Analyze traffic sources (organic, direct, social, referral)
- Get top performing pages
- Track user engagement (bounce rate, duration)
- Feed the Monitor agent with real web analytics data

## Workflow

### 1. Identify the client and period

```
Client: amiclube
Period: last_7_days | last_30_days | last_90_days
```

### 2. Run the GA4 collector

```bash
node --env-file=squads/social-growth/.env.publish.{client} \
  skills/ga4-insights/scripts/insights.js \
  --client amiclube \
  --period last_7_days
```

### 3. Data collected

- Overview: users, sessions, pageviews, bounce_rate, engagement
- Top pages: page path, views, avg time
- Traffic sources: source, medium, sessions
- Devices: device category, users

## Supported Reports

| Report | Metrics |
|--------|--------|
| `overview` | total users, sessions, pageviews, bounce rate |
| `pages` | page path, views, avg time |
| `sources` | source, medium, sessions |
| `devices` | device category, users |
| `realtime` | active users right now |

## Constraints

- Requires: Service account JSON credentials
- Property ID: configured per client in DB
- Data delay: up to 24-48 hours
- Lookback: max 90 days

## Credentials

The skill uses `observation_profiles` table in database:
- `provider`: 'ga4'
- `secret_ref`: path to service account JSON file

## Output shape

```json
{
  "collected_at": "2026-05-04T22:00:00Z",
  "client": "amiclube",
  "period": "last_30_days",
  "overview": {
    "total_users": 5420,
    "total_sessions": 6892,
    "pageviews": 12453,
    "bounce_rate": 42.5,
    "engagement_rate": 57.5
  },
  "pages": [
    {
      "path": "/blog/tendencias-2026",
      "pageviews": 1234,
      "avg_engagement_time": 180
    }
  ],
  "sources": [
    {
      "source": "google",
      "medium": "organic",
      "sessions": 3200
    }
  ]
}
```