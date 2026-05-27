# Status de Publicação WordPress - AmiClube (Maio 2026)
**Operador:** Wagner WordPress (🌐)
**Status Global:** Distribuição Uniforme em 30 Dias
**Período:** 30/04/2026 a 30/05/2026
**Atualizado em:** 28/04/2026
**Cadência:** ~1 post a cada 5 dias (mínimo 4, máximo 5)

## 📝 Blog Posts (Agendados via WP-API)

| # | ID WP | Data | Ativo | Título | Gap |
|:---:|:---:|:---|:---|:---|---:|
| 1 | 13002 | 30/04 (Qui) 10:00 | AC-30-01 | Como escolher amigurumi com critério | — |
| 2 | 13003 | 05/05 (Ter) 10:00 | AC-30-01B | Ergonomia e cuidados ao escolher amigurumi | +5d |
| 3 | 13014 | 10/05 (Dom) 08:00 | AC-30-05 | Preço, valor e o que avaliar antes de comprar | +5d |
| 4 | 13016 | 15/05 (Sex) 08:00 | AC-30-05B | Tendências 2026: Por que o veludo é o novo luxo | +5d |
| 5 | 13037 | 20/05 (Qua) 08:00 | AC-30-09 | Reputação de marca artesanal | +5d |
| 6 | 13039 | 25/05 (Seg) 08:00 | AC-30-09B | Segurança em amigurumi artesanal | +5d |
| — | — | 28/05 (Qui) 08:00 | (reservado) | Próximo artigo do backlog | +3d |
| — | — | 30/05 (Sáb) 08:00 | (reservado) | Próximo artigo do backlog | +2d |

> **Timeline:** Semana 1 (30/04-01/05) | Semana 2 (04/05-06/05) | Semana 3 (07/05-08/05) — sem conflitos de data.

## 📱 Redes Sociais (Primeira Semana de Maio)

| ID Social | Data Agendada | Canal | Ativo | Título | Tipo | Status | Via |
|:---|:---|:---|:---|:---|:---|:---|:---|
| 6001 | 04/05/2026 18:30 | Instagram | AC-30-03 | Erro: focar só no preço **V2** | Carrossel | ✅ Scheduled | Worker (Meta API + imgBB) |
| 6002 | 03/05/2026 10:00 | Facebook | AC-30-04 | Marca artesanal premium **V2** | Post publicado | ✅ Published | Worker (Meta API) |
| 6003 | 05/05/2026 18:30 | Instagram | AC-30-19 | Conforto no uso | Post Estático | 🗑️ Removed | Worker (Meta API + imgBB) |
| 6004 | 06/05/2026 10:00 | Facebook | AC-30-34 | Ergonomia também importa | Post | ✅ Scheduled | Worker (Meta API) |
| 6005 | 06/05/2026 18:30 | Instagram | AC-30-20 | Escala de conforto | Stories | ✅ Scheduled | Worker (Meta API + imgBB) |
| 6006 | 07/05/2026 18:30 | Instagram | AC-30-17 | Checklist: Qualidade **V2** | Carrossel | ✅ Scheduled | Worker (Meta API + imgBB) |
| 6007 | 08/05/2026 18:30 | Instagram | AC-30-18 | Mitos: O que é amigurumi premium **V2** | Carrossel | ✅ Scheduled | Worker (Meta API + imgBB) |
| 6008 | 10/05/2026 18:30 | Instagram | AC-30-06 | Mitos e verdades sobre preço | Carrossel | ✅ Queued | Worker (Meta API + imgBB) |
| 6009 | 11/05/2026 18:30 | Instagram | AC-30-07 | Quando o barato sai caro | Carrossel estático | ✅ Queued | Worker (Meta API + imgBB) |
| 6010 | 12/05/2026 18:30 | Instagram | AC-30-08 | Valor percebido vs valor entregue | Post Estático | ✅ Scheduled | Worker |

## ⚙️ Log Técnico de API
- **Worker:** `scripts/run-social-publish-worker.mjs`
- **Fila:** `social-publish-queue.json`
- **Canal Eligibility:** `channel-eligibility.json`
- **imgBB:** `c0292d46612797b17c497298600d48b9`
- **Instagram:** User ID `17841444481115973`, Page ID `106701834627196`
- **Facebook:** Page ID `106701834627196` ("Amiclube - Por Sara Melo")

## ✅ Checklist de Validação
- [x] Caminhos V2 atualizados em `social-publish-assets.json`
- [x] Fila populada em `social-publish-queue.json`
- [x] `channel-eligibility.json` criado
- [x] Schedule plan reagendado para 01-07/05/2026
- [x] Assets V2: AC-30-03 ✅, AC-30-04 ✅, AC-30-17 ✅, AC-30-18 ✅
- [x] Agenda social reordenada sem colisão no mesmo canal/horário.

---
**Wagner WordPress (🌐)**
*Batch 01 - Primeira Semana de Maio. Executar worker em modo dry_run antes de live_api.*
