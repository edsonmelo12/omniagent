# Orientação do CEO

## Contexto da Run
- **Cliente:** AmiClube (continuar campanha existente)
- **Propósito:** Execução contínua do pipeline social para o ciclo Abril-Maio 2026
- **Estágio atual:** Pipeline em execução — posts da Semana 1 publicados/agendados, Semana 2-4 em produção e fila de publicação
- **Data de referência:** 2026-04-30 (quinta-feira)

## Avaliação da Situação

### Blog (WordPress)
- **Semana 1 ✅ Publicados:** AC-30-01 (ID 13002) publicado em 30/04 10h; AC-30-01B (ID 13003) agendado para 01/05 10h
- **Semana 2 🟡 Pendentes:** AC-30-05 (10/05) e AC-30-05B (15/05) em status `future` — draft prontos para revisão
- **Semana 3 🟢 Preview:** AC-30-09 e AC-30-09B com preview pronto (gate blog OK), prontos para agendar no WP

### Sociais (Fila de Publicação)
- **11 ativos na fila** com exports válidos — nenhuma pendência de `missing_exported_files`
- **Semana 1 social:** AC-30-02, AC-30-03, AC-30-04 em revisão
- **Semana 2 social:** AC-30-06, AC-30-07, AC-30-08 — AC-30-08 já em `queued`, demais em revisão
- **Semana 3-4 social:** AC-30-17, AC-30-18, AC-30-19, AC-30-20, AC-30-34 prontos (aprovados); AC-30-25, 26, 27 exportados recentemente em `review`

### Sincronização da Realidade
| Asset | Backlog | Hub | Rendered Assets | Exports |
|-------|---------|-----|-----------------|---------|
| AC-30-17 | Preview pronto (aprovado) | ✅ | ready | ✅ 7 PNGs |
| AC-30-18 | Preview pronto (aprovado) | ✅ | ready | ✅ 8 PNGs |
| AC-30-19 | Preview pronto (aprovado) | ✅ | ready | ✅ 1 PNG |
| AC-30-20 | Preview pronto (aprovado) | ✅ | ready | ✅ 5 PNGs |
| AC-30-34 | Preview pronto (aprovado) | ✅ | ready | ✅ 1 PNG |
| AC-30-25 | review | ✅ | ready for review | ✅ 6 PNGs |
| AC-30-26 | review | ✅ | ready for review | ✅ 4 PNGs |
| AC-30-27 | review | ✅ | ready for review | ✅ 1 PNG |

**Status:** ✅ Realidade sincronizada — backlog = hub = rendered-assets

## Cronograma Real

### Posts Confirmados (30/04 - 25/05)
| Data | Canal | Asset | Status |
|------|-------|-------|--------|
| 30/04 | Blog | AC-30-01 | ✅ publicado (ID 13002) |
| 01/05 | Blog | AC-30-01B | ✅ agendado (ID 13003) |
| 01/05 | Instagram | AC-30-03 | queued — 18:30 |
| 02/05 | Facebook | AC-30-04 | queued — 10:00 |
| 02/05 | Instagram | AC-30-02 | queued — 18:30 |
| 05/05 | Instagram | AC-30-17 | scheduled — 10:00 |
| 05/05 | Instagram | AC-30-19 | scheduled — 10:00 |
| 05/05 | Instagram | AC-30-20 | scheduled — 10:00 |
| 05/05 | Instagram | AC-30-06 | queued |
| 06/05 | Facebook | AC-30-34 | scheduled — 10:00 |
| 07/05 | Instagram | AC-30-18 | scheduled — 10:00 |
| 08/05 | Instagram | AC-30-08 | scheduled — 10:00 |
| 09/05 | Instagram | AC-30-07 | queued — 18:30 |
| 10/05 | Blog | AC-30-05 | 🟡 future |
| 15/05 | Blog | AC-30-05B | 🟡 future |
| 20/05 | Blog | AC-30-09 | preview_ready |
| 25/05 | Blog | AC-30-09B | preview_ready |

**Total:** 6 blogs confirmados + 11 sociais na fila  
**Próximos 7 dias:** 9 ativações (2 blogs + 7 sociais)

### Fila de Publicação (social-publish-monitor)
- **Status:** OK — sem critical/warning
- **Itens:** 11 ativos com `queued` ou `scheduled`
- **Bloqueios:** nenhum — semua exportados com PNGs válidos

## Alertas de Publicação
✅ **Nenhum item bloqueado** — fila limpa desde a reconciliação de 29/04  
✅ Todos os 15 assets têm PNGs exportados em `social/publish/`  
✅ `social-publish-assets.json` sincronizado com filesystem

**Histórico recente (29/04):** AC-30-17, AC-30-18 e AC-30-08 foram reconciliados após `missing_exported_files` — problema resolvido e monitor limpo.

## Itens Críticos

### 1. Revisão de assets Week 4 (AC-30-25/26/27)
- **Status:** exportados, prontos para revisão
- **Origem:** derivados de AC-30-05B (veludo como novo luxo)
- **Gate:** devem passar pelo Visual Production Gate + First Impression Diversity Gate
- **Ação:** revisão prioritária antes de agendar publicação

### 2. Blog AC-30-05 e AC-30-05B em draft
- **Status:** "Em revisão (preview pronto)" no backlog
- **Gate:**Blog Policy deve validar (transições ≥30%, links externos, imagens com alt)
- **Ação:** finalizar revisão para agendar em 10/05 e 15/05

### 3. Suplicidade de revisão social
- **Muitos assets em "review"** — AC-30-02, 03, 04, 06, 07, 12, 19, 20, 34, 25, 26, 27
- **Gargalo:** Reviewer como bottleneck — assets prontos mas não validados
- **Ação:** priorizar revisão dos assets com janela de publicação próxima (05-08/05)

## Prioridade Recomendada

### 🔴 Prioridade 1 — Revisão imediata (proximas 24h)
1. **Revisar AC-30-25/26/27** — exports prontos, janela de publicação próxima
2. **Revisar AC-30-19/20/34** — já aprovados no conceito, precisam validação final de export
3. **Revisar AC-30-02/03/04** — publicados na Semana 1, precisam aprovação para manter fluxo

### 🟡 Prioridade 2 — Blog e derivação social
4. **Finalizar AC-30-05 e AC-30-05B** — gate blog, agendar para 10/05 e 15/05
5. **Gerar social derivado de AC-30-05** — AC-30-21, AC-30-22 (backlog)
6. **Gerar social derivado de AC-30-05B** — AC-30-23, AC-30-24 (backlog)

### 🟢 Prioridade 3 — Pipeline continua
7. **Agendar AC-30-09 e AC-30-09B** — preview_ready, agendar 20/05 e 25/05
8. **Preparar AC-30-13 e AC-30-13B** — Semana 4 em previsão

**Justificativa:** A janela de publicação entre 05-09/05 concentra 8 ativos. A revisão precisa avanzar agora para evitar que ativos prontos fiquem represados na fila por falta de validação.

## Riscos e Suposições

### Riscos Identificados
1. **Bottleneck de revisão** — 12+ assets em "review" podem atrasar publicação se não houver validação rápida
2. **Dependência de acesso do Edson** — postsblog devem ser publicados antes das 08:45 BRT; sociais após 17:45 BRT
3. **Assets novos sem First Impression Gate** — AC-30-25/26/27 recém-exportados precisam validar variação visual contra assets recentes (First Impression Diversity Gate)
4. **Blog drafts sem gate completo** — AC-30-05 e AC-30-05B podem ter transições <30% ou missing alt text

### Suposições
- Edson disponível para review manual nas próximas 48h
- Credenciais de publicação social (Meta API) continuam válidas
- Imagens derivadas do blog (veludo) têm licença OK (Pexels 8465936)
- Gate Visual Production está sendo aplicado nos novos exports

## Orientação para Agentes

### Para Reviewer
- Priorizar assets com janela de publicação iminente (AC-30-25/26/27 → 05/05)
- Aplicar First Impression Diversity Gate — verificar variação de capa/crop vs assets recentes (AC-30-17, AC-30-18, AC-30-08)
- Validar Visual Production Gate — canvas final, fonte em px, imagem de background quando aplicável

### Para Creator/Intake
- Blog AC-30-05 e AC-30-05B precisam gate completo: transições ≥30%, links externos, imagens com alt
- Social derivado AC-30-21/22 (de AC-30-05) e AC-30-23/24 (de AC-30-05B) devem seguir Same Article Visual Variation Rule

### Para Visual Director
- AC-30-25/26/27 derivados de AC-30-05B (veludo) — verificar se primeiro frame/capa varia em relação a AC-30-17 (veludo hero image reuse)
- Cross-reference com `rendered-assets.md` para validar baseline applied

### Para Scheduler (Wagner)
- Janelas de publicação: Blog antes 08:45, Sociais após 17:45
- AC-30-09 e AC-30-09B em preview_ready — agendar 20/05 e 25/05 às 08:00

## Decisões Registradas

1. **Realidade sincronizada** — backlog, hub e rendered-assets correspondem ao estado atual dos 15 exports sociais
2. **Fila limpa** — `social-publish-monitor.md` sem critical/warning desde reconciliação de 29/04
3. **Primeira execução do ciclo** — não há memórias anteriores desta run; contexto carregado a partir do squad e estado do cliente
4. **Gates ativos** — Visual Production Gate e First Impression Diversity Gate aplicados nos novos assets (AC-30-25/26/27)
5. **Ordem de prioridade definida** — revisão → blog → derivação social → agendamento