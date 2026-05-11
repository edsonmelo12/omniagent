# Monitoring KPIs - Social Growth Squad

## Regra de Credenciais para Monitoria

**Obrigatório:** Antes de qualquer tentativa de coleta de métricas via API (Meta Insights, GA4, etc.), o agente Monitor DEVE verificar se as credenciais do cliente estão cadastradas e válidas.

**Fluxo de verificação:**
1. Consultar tabela `observation_profiles` ou resolver via `secret_ref`
2. Se `credentials_valid=false` → alertar Edson imediatamente
3. Se `credentials_valid=true` → prosseguir com coleta usando skill `meta-insights`
4. Registrar status de validade em cada ciclo de monitoria

**Alerta automático:** Toda vez que o pipeline executar publish em modo `live_api`, o Monitor deve ser acionado automaticamente para verificar se tem credenciais válidas cadastradas. Se não tiver, générer alerta P0 antes de qualquer monitoramento.

**Checklist de credenciais por plataforma:**
- Instagram: access_token válido (Meta Graph API)
- Facebook: page_access_token válido
- GA4: service_account credentials ou API key

---

## Coleta de Métricas

**Skill:** `meta-insights` (localizada em `/skills/meta-insights/`)

**Uso:**
```bash
node --env-file=squads/social-growth/.env.publish.{client} \
  skills/meta-insights/scripts/insights.js \
  --client {slug} \
  --period last_7_days
```

**Agendamento:**
- **Diária:** Todo dia às 10:00 BRT via cron
- **Semanal:** Toda segunda-feira 10:00 (futuro)

**Script de cron:** `squads/social-growth/scripts/run-meta-insights-cron.sh`
**Configuração:** `squads/social-growth/scripts/crontab-meta-insights.txt`

**Dados coletados:**
- Account: `follower_count`, `media_count`, `reach`
- Post-level: `views`, `reach`, `likes`, `comments`, `shares`, `saved`, `total_interactions`

**Frequência:**
- Automática: diária 10:00 BRT (via cron)
- Manual: via Monitor agent

**Armazenamento:**
- JSON em `squads/social-growth/output/{client}/monitoring/insights-{timestamp}.json`

---

## Prioridade Alta

- crescimento liquido de seguidores
- alcance por post e por semana
- taxa de engajamento
- taxa de conclusao de video
- salvamentos e compartilhamentos

## Prioridade Media

- comentarios por post
- visitas ao perfil
- cliques no link ou CTA
- visualizacoes totais
- tempo medio de visualizacao

## Prioridade Operacional

- frequencia de publicacao
- consistencia de formatos
- distribuicao entre feed, reels, stories e posts longos
- reacao do publico por plataforma

## Leituras-Sinal

- alcance alto com engajamento baixo: distribui, mas nao conecta
- alcance baixo com boa taxa de engajamento: o conteudo e bom, a distribuicao precisa melhorar
- conclusao baixa em video: hook ou ritmo precisam de ajuste
- muitos comentarios e poucos cliques: CTA precisa ficar mais clara
