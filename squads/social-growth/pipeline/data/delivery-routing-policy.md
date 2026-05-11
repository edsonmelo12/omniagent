# Delivery Routing Policy

Define quando usar a pipeline completa (agentes) versus o fast-track (scripts diretos) para criação e regeneração de assets sociais.

Para seleção rápida de rota e carregamento proporcional de contexto, aplicar também `fast-safe-routing-policy.md`.

## Regra Geral

**Todo asset novo** deve passar pela pipeline completa com Visual Director → Creative Renderer → Reviewer.

Atlas atua como orquestrador da rota. Atlas não pode substituir Visual Director,
Creative Renderer, Reviewer e Pipeline Auditor numa única execução e ainda assim
marcar a entrega como pipeline completa. Se for necessário operar em modo
degradado, o checkpoint do usuário deve aprovar esse modo antes da execução e o
resultado máximo é `pipeline_degraded`, nunca `pipeline_pass`.

**Regenerações e edits** podem usar fast-track (scripts diretos) apenas quando TODAS as condições abaixo forem verdadeiras.

## Routing Matrix

| Cenário | Rota | Agentes | Artefatos obrigatórios |
|---------|------|---------|------------------------|
| **Asset social novo** (sem pipeline prévia) | Pipeline completa | Visual Director → Creative Renderer → Reviewer → Pipeline Auditor | VDC + RCC + Approved Reviewer + Compliance PASS |
| **Asset social novo** derivado de blog existente | Pipeline completa | Visual Director → Creative Renderer → Reviewer → Pipeline Auditor | VDC + RCC + Approved Reviewer + Compliance PASS |
| **Regeneração** de asset aprovado (mesmo formato, mesma skill visual) | Fast-track | Creative Renderer → Reviewer → Pipeline Auditor | RCC + Approved Reviewer + Compliance PASS |
| **Regeneração** com mudança de formato/skill visual | Pipeline completa | Visual Director → Creative Renderer → Reviewer → Pipeline Auditor | VDC + RCC + Approved Reviewer + Compliance PASS |
| **Edit de copy** sem mudança visual | Fast-track | Creator → Reviewer → Pipeline Auditor | Approved Reviewer + Compliance PASS |
| **Edit visual** (cor, fonte, layout) | Fast-track | Creative Renderer → Reviewer → Pipeline Auditor | RCC + Approved Reviewer + Compliance PASS |
| **Asset novo** em campanha existente com baseline aprovado | Pipeline completa | Visual Director → Creative Renderer → Reviewer → Pipeline Auditor | VDC (com baseline declarado) + RCC + Approved Reviewer + Compliance PASS |
| **Publicação/fila sem alteração visual/copy** | Quick preflight | Scheduler → Pipeline Auditor (`quick_preflight`) | Queue/monitor OK + captions finais + dry-run/validador + checkpoint |
| **Correção pós-aprovação ou defeito reportado** | Incident audit | Executor responsável → Reviewer → Pipeline Auditor (`incident_audit`) | Incident Trace + mitigação operacional + Compliance PASS |
| **Consulta, status, agenda ou lista** | Quick status | Atlas | `state-summary.md`; sem alteração de arquivos |
| **Copy/caption simples sem mudança visual** | Fast-safe copy | Creator → Reviewer → Pipeline Auditor (`asset_audit`) | Skill Ledger + Review + Compliance PASS |

## Condições para Fast-track

Fast-track só é permitido quando TODOS os itens abaixo são verdadeiros:

1. O asset já possui um baseline aprovado em pipeline anterior
2. O formato e dimensões finais NÃO mudam
3. A skill visual atribuída NÃO muda (mesmo formato nativo)
4. A decisão de imagem/fundo NÃO muda
5. Não há mudança estrutural no layout
6. O Reviewer valida o resultado final separadamente

Se QUALQUER condição falhar: usar pipeline completa.

## Violações

As seguintes situações são VETO obrigatório e impedem o asset de avançar:

1. Asset novo sem Visual Decision Card completo → VETO
2. Asset novo sem Render Compliance Card completo → VETO
3. Qualquer asset (novo ou regenerado) sem validação do Reviewer → VETO
4. Asset derivado de blog sem consultar `output/{client}/blog/assets/` → VETO
5. Asset com `background-image` declarado sem imagem implementada → VETO
6. Asset sem declaração de primeira impressão e similaridade com assets recentes → VETO
7. Qualquer entrega sem relatório `Pipeline Compliance Report` com `PASS` ou `PASS_WITH_WARNINGS` → VETO
8. Mesmo ator executando e aprovando a própria etapa → VETO
9. Skill listada como `invoked` sem evidência de fonte carregada e decisão concreta → VETO
10. Rebaixar hub/manifest de versão aprovada mais nova para artefato antigo ou sem versão → VETO
11. Atualizar hub/manifest antes de export final e validação de dimensões quando a entrega declara publish-ready → VETO
12. Claims de VDC/RCC/Review contradizem DOM, preview ou PNG final → VETO

## Regra Anti-Atalho

Se a ação altera ativo final, percepção visual, agenda, publicação, script, manifest, hub ou memória, ela não é "só um detalhe". Deve passar pelo pipeline ou pelo menos por delegacão + checkpoint.

A pipeline runner é a única interface de execução autorizada. Comandos diretos para scripts (ex: `node export-social-publish-assets.mjs`) só são permitidos dentro de um step da pipeline, nunca como resposta a um pedido do usuário sem passar pelo runner primeiro.

## Regra de Auditoria Final

Antes de checkpoint do usuário, agendamento, publicação, atualização final de hub ou fila, executar `step-04b-pipeline-compliance-audit.md`.

O Pipeline Auditor não aprova qualidade criativa; ele valida se a rota declarada deixou evidência suficiente. Se o veredito for `BLOCKED` ou `INVALID`, retornar ao step indicado no relatório.

Use `quick_preflight` para checagens de publicação/fila quando a tarefa não criou nem regenerou ativo visual/copy. Use `asset_audit`, `batch_audit` ou `incident_audit` quando houver mudança de asset, lote ou defeito pós-aprovação.

Todo `asset_audit`, `batch_audit` ou `incident_audit` deve aplicar também
`pipeline/data/pipeline-integrity-gate.md`. Ausência de `Integrity Checks` no
relatório torna o audit `INVALID`.
