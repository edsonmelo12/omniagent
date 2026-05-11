# Plano: Inteligência por Podcasts — Squad Social Growth

> **Status:** 🟡 ARMAZENADO — em amadurecimento, não em execução
> **Data de criação:** 2026-05-08
> **Responsável:** Atlas CEO (Edson autorizou armazenamento)
> **Revisão programada:** pós-campanha atual (30 dias)

---

## Contexto

Edson identificou três fontes de inteligência estratégica no mercado digital brasileiro:

| Fonte | Tipo | Episódios | Nichos aplicáveis |
|-------|------|-----------|-------------------|
| **Hotmart Cast** (Alexandre Abramo) | Podcast | 256+ | Marketing digital, creator economy, autoridade |
| **Kiwicast** (Kiwify) | Podcast | 400+ | Dropshipping, WhatsApp, tráfego pago, IA, operação |
| **VTurb** | Plataforma SaaS | — | VSL, conversão, copy (referência de técnica, não análise) |

**Não é objetivo de todos os clientes** — só nichos compatíveis: marketing digital, e-commerce, serviços, artesanato criativo, educação.

---

## O que já foi feito

### Pesquisa inicial (08/05/2026)

- Análise do Hotmart Cast via descrições públicas de ~30 episódios
- Identificação de 5 princípios universais de crescimento orgânico
- Validação cruzada com benchmarks externos (Buffer, Neil Patel, etc.)
- Output: `output/2026-05-08-170100/research/hotmart-cast-podcast-analysis.md`

### Hipóteses descobertas / reforçadas

| Hipótese | Status | Evidência |
|---|---|---|
| H-001 — critério de compra supera preço | ✅ Reforçada | Giulia Nardini + Millena Nóbrega |
| H-002 — objeção preço×valor como motor | ✅ Reforçada | Cátia Damasceno + Valter Azevedo |
| H-003 — prova de confiança artesanal | ✅ Reforçada | Carol Costa + Verônica Motta |
| H-005 — curadoria acessível (low ticket) | 🔁 Nova, não validada | Pedro Aredes (Kiwicast) |
| H-006 — objeções do público como estratégia | ✅ Reforçada | 4+ episódios (Valter, Cátia, Millena, Giulia) |

### Gaps estratégicos descobertos

1. **YouTube como canal de autoridade** — nichos técnicos funcionam bem com vídeo longo evergreen
2. **Cadência diária em Stories** — Verônica Motta (70k clientes) validou consistência > viralização
3. **Storytelling por canal** — mesmo tema com narrativa própria por formato (Millena Nóbrega)

---

## Decisão de implementação

**Modelo aprovado (lean):** processo informal, sob demanda, sem cadência fixa.

### Regras de governança

1. **Quem dispara:** Edson envia link do episódio via conversa
2. **Quem analisa:** Researcher (mesmo fluxo já utilizado na análise do Hotmart Cast)
3. **Onde salva:** `squads/social-growth/output/{client}/research/podcast-intelligence-{YYYY-MM}.md`
4. **Index central:** `squads/social-growth/_memory/podcast-intelligence-index.md` — uma linha por episódio analisado
5. **Quando consulta:** antes de cada ciclo de planejamento estratégico

### Formato do Index

```markdown
# Podcast Intelligence Index

| Data | Fonte | Episódio | Cliente(s) | Insight Principal | Decisão | Validado por |
|------|-------|-----------|------------|-------------------|---------|-------------|
| 2026-05-08 | Hotmart Cast | #192 Giulia Nardini | amiclube | Consistência > viralização | ACEITO → H-001 reforçado | Edson |
```

### Critérios de qualidade

- Analisar só episódios com guest com resultados reais comprovados
- Descartar insight se não for aplicável ao cliente (não forçar)
- Data máxima: episódios dos últimos 12 meses
- Limite: 3-5 episódios por ciclo de análise

### O que NÃO fazer

- ❌ Não ouvir todos os episódios
- ❌ Não criar processo formal com cadência fixa
- ❌ Não transformar análise em burocracia
- ❌ Não usar VTurb como fonte de análise (é plataforma SaaS, não podcast)

---

## Riscos documentados

| Risco | Mitigação |
|-------|-----------|
| Informação sem ação (paralisia) | Insight sem uso vai para arquivo morto, não para loop |
| many sources, pouco uso | Edson filtra: só episódios relevantes |
| Sobrecarga do Researcher | Tempo estimado: ~1h por episódio (não por ciclo) |
| Informação obsoleta | Filtro de data obrigatório (<12 meses) |

---

## Alternativa completa (disponível para depois)

Se o modelo lean provar valor, existe um plano completo disponível:

- **Processo:** 4 etapas (Descoberta → Extração → Integração → Validação)
- **Esforço:** ~2h por ciclo por cliente
- **Output:** documento estruturado por cliente + atualização do Hypothesis Ledger
- **Custo:** tempo do Researcher + Strategist + Atos Analista (opcional)
- **Disponível em:** `_memory/podcast-intelligence-plan.md` (este arquivo)

---

## Como acessar este plano

**Você pode perguntar a qualquer momento:**
- "E os podcasts?" → A squad responde: "Temos um plano de inteligência por podcasts armazenado em `_memory/podcast-intelligence-plan.md`"
- "Hotmart Cast serve para qual cliente?" → Verificar index + nichos aplicáveis
- "Temos hipóteses novas?" → Consultar H-005 e H-006 no index

**Para ativar o modelo lean:**
- Edson envia link → Researcher analisa → Index atualizado → Strategist consulta

---

## Infraestrutura

- **venv Python:** `/tmp/yt-transcript/venv/bin/python3` (não persistente entre sessões)
- **Cookies YouTube:** exportados do Firefox snap em `/tmp/yt-transcript/youtube_cookies.txt`
- **Key YouTube:** `AIzaSyAveAy-2pctz9mtGNVcQ-hEWBSLvYekgE4`
- **Script de inteligência:** `scripts/youtube-intelligence/youtube-intelligence.mjs`
- **Formato preferido:** `srv1` (XML) — único formato que funciona com captions ASR
- **Canais monitorados:** Hotmart (UCtHpJ...), Kiwify (UCOX18...)
- **Comando:** `node scripts/youtube-intelligence/youtube-intelligence.mjs --channel hotmart --count 5`

### Solução de problemas

| Problema | Solução |
|----------|---------|
| `No module named yt_dlp` | Criar venv + `pip install yt-dlp youtube-transcript-api faster-whisper` |
| `Sign in to confirm` (bot detection) | Exportar cookies do Firefox |
| Caption URL vazio (pb3 protobuf) | Usar formato `srv1` (índice 2) em vez de `vtt` |
| Script Node.js trava | Não usar `promisify` — usar `spawn` com Promises manuais |

---

## Histórico de decisões

| Data | Decisão | Detalhes |
|------|---------|----------|
| 2026-05-08 | ARMAZENADO | Edson decidiu armazenar e amadurecer — não implementar agora |
| 2026-05-08 | Modelo lean aprovado | Sem cadência fixa, sob demanda, index simples |
| 2026-05-08 | Arquivo de pesquisa criado | `hotmart-cast-podcast-analysis.md` salvo em output |
| 2026-05-08 | H-005/H-006 identificadas | Não validadas ainda — backlog |
| 2026-05-08 | Pipeline transcrição validado | 3 episódios Hotmart extraídos via yt-dlp + cookies Firefox |

---

*Este plano faz parte do `_memory` da squad. Revisitado após conclusão da campanha ativa de AmiClube (maio/2026).*