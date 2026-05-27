# Reconciliação de Consistência — AmiClube

> Gerado em: 2026-05-03  
> Escopo: fila social, exports, manifest, monitor, status de agenda e evidências de gates.  
> Política: este arquivo não altera status operacional; ele registra decisões recomendadas para aplicação controlada posterior.

## Resumo

| Severidade | Quantidade | Interpretação |
|------------|------------|---------------|
| P0 | 0 | Sem quebra estrutural bloqueante após correção de agentes/steps. |
| P1 | 15 | Divergências que afetam prontidão de publicação ou trilha de aprovação. |
| P2 | 9 | Exports fora da fila atual ou pendências de governança não bloqueantes imediatas. |
| P3 | 4 | Arquivos órfãos ou steps não usados na pipeline ativa. |

## Decisões Recomendadas

| Ativo | Classificação | Evidência Atual | Ação Recomendada | Pode Atualizar Status Agora? |
|-------|---------------|-----------------|------------------|------------------------------|
| AC-30-04 | `published_status_sync_applied` | Fila e monitor indicam `published`; possui `published_post_id` e URL Facebook. Assets e manifest foram sincronizados para `published`. | Nenhuma ação adicional, exceto manter histórico publicado. | Aplicado. |
| AC-30-02 | `published_history_gap_unconfirmed` | `schedule-status.md` marca publicado; export aprovado; não está na fila/monitor atual; não foi encontrada URL/post publicado confirmável nos arquivos locais. | Não reinserir na fila. Confirmar URL/post antes de registrar como histórico publicado. | Não. |
| AC-30-03 | `queued_ready_applied` | VDC/RCC/review dedicados criados; PNGs reexportados e confirmados em 1080x1920; incident traces mitigados. | Nenhuma promoção para `published`; manter na fila para 2026-05-04. | Aplicado. |
| AC-30-06 | `queued_ready_applied` | VDC/RCC/review/compliance v5 criados do zero seguindo rigorosamente a skill instagram-carousel; HTML gerado via Python com base64; PNGs v5 confirmados em 1080x1350. | Nenhuma promoção para `published`; manter na fila para 2026-05-10. | Aplicado. |
| AC-30-07 | `queued_ready_applied` | VDC/RCC canônicos criados a partir da evidência v4 existente; HTML corrigido para pt-BR; exports v4 reexportados e confirmados em 1080x1920; fila aponta para os arquivos v4. | Nenhuma promoção para `published`; manter na fila para 2026-05-11. | Aplicado. |
| AC-30-08 | `queued_ready_applied` | VDC/RCC/review/compliance dedicados criados; PNG reexportado como full-canvas 1080x1350; fila e manifests sincronizados para `queued`/`approved`/`preview_ready`. | Nenhuma promoção para `published`; manter na fila para 2026-05-12. | Aplicado. |
| AC-30-17 | `queued_ready_applied` | VDC/RCC/review/compliance dedicados criados; PNGs reexportados e confirmados em 1080x1350; incident traces mitigados. | Nenhuma promoção para `published`; manter na fila para execução do conector. | Aplicado. |
| AC-30-18 | `queued_ready_applied` | VDC/RCC/review/compliance v2 dedicados criados; PNGs reexportados e confirmados em 1080x1350. | Nenhuma promoção para `published`; manter na fila para 2026-05-08. | Aplicado. |
| AC-30-19 | `queued_ready_applied` | VDC/RCC/review/compliance v2 dedicados criados; PNG confirmado em 1080x1350; review consolidado existente. | Nenhuma promoção para `published`; manter na fila para 2026-05-05. | Aplicado. |
| AC-30-20 | `queued_ready_applied` | VDC/RCC/review/compliance v3 dedicados criados; PNGs reexportados e confirmados em 1080x1920; review v3 existente. | Nenhuma promoção para `published`; manter na fila para 2026-05-06. | Aplicado. |
| AC-30-34 | `queued_ready_applied` | VDC/RCC/review/compliance v1 dedicados criados; PNG confirmado em 1200x630; review consolidado existente. | Nenhuma promoção para `published`; manter na fila para 2026-05-06. | Aplicado. |

## Exports Fora da Fila Atual

| Ativo | Status no Export | Status no Manifest | Recomendação |
|-------|------------------|--------------------|--------------|
| AC-30-10 | review | Em revisão (preview pronto) | Manter como `future_review`; só entrar na fila quando Semana 3 for agendada. |
| AC-30-11 | review | Em revisão (preview pronto) | Já entrou na fila para 2026-05-21 10:00; manter alinhado com a manifest e a queue. |
| AC-30-12 | review | review | Manter fora da fila até decisão de canal/data. |
| AC-30-21 | review | preview_ready | Decidir se substitui/acompanha AC-30-06/07/08; não publicar sem nova fila. |
| AC-30-25 | review | review | Manter como Semana 4/futuro; requer decisão de calendário. |
| AC-30-26 | review | review | Manter como Semana 4/futuro; requer decisão de calendário. |
| AC-30-27 | review | review | Manter como Semana 4/futuro; requer decisão de calendário. |
| AC-30-35 | approved | APPROVED v2 | Classificar como `future_or_optional`; não publicar sem entrada explícita na fila. |

## Aplicação Segura Proposta

1. `AC-30-04` já foi sincronizado como publicado nos manifests, porque há URL e ID de publicação na fila.
2. Confirmar URL/post de `AC-30-02`; só se confirmado, registrar como histórico publicado, não como item ativo.
3. Antes das próximas janelas, criar ou anexar evidências dedicadas para `AC-30-03`, `AC-30-19`, `AC-30-34`, `AC-30-20`, `AC-30-17`, `AC-30-18`.
4. Semana 2 (`AC-30-06`, `AC-30-07`, `AC-30-08`) está reconciliada como fila pronta, sem promoção para `published`.
5. Manter exports fora da fila como futuro/arquivado até existir decisão explícita de calendário.

## Próximo Comando de Controle

```bash
npm run social:consistency:audit -- --client=amiclube --fail-on=P0
```
