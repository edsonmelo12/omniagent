# Orientação do CEO

Edson, pensando com você, dei uma olhada completa no que está acontecendo com a campanha do AmiClube agora, carreguei todas as memórias da squad, o estado atual do pipeline e os arquivos de agendamento. Vou te trazer a orientação dessa run de forma clara, com o "por que" de cada recomendação, como combinamos.

## Contexto da Run
Cliente: AmiClube (agência digital Portal de Mídias, foco em posicionamento e tráfego qualificado).
Propósito da run: Dar continuidade à campanha de conteúdo e social, corrigir inconsistências de status e resolver erros de publicação identificados.
Estágio atual do pipeline: Step 1 de 26 (step-000-ceo-orientation), squad com status running, iniciada em 03/05/2026 às 11:23 BRT.

## Avaliação da Situação
O que já foi feito: Temos 6 posts de blog confirmados (Semanas 1 a 3), com cadência de 2 posts por semana. A fila social tem 11 itens, sendo 10 já exportados e aguardando janela de publicação, e 1 item com erro de API. O Blog Semana 3 (AC-30-09 e AC-30-09B) já tem preview pronto, e a Semana 4 está em previsão, aguardando aprovação de novos artigos do backlog.

O que está pendente: O Blog Semana 2 (AC-30-05 e AC-30-05B) tem inconsistência de status: o `schedule-status.md` indica "Draft", mas o WordPress mostra "future". O Blog Semana 3 ainda não foi agendado no WordPress. O post AC-30-04 (Facebook) falhou por erro de API descontinuada.

O que está acontecendo agora: A fila social está com 10 itens aguardando a janela segura de publicação (após 17:45 BRT), e o AC-30-03 (Instagram) foi reagendado para 04/05 como recuperação, mudando de vídeo para imagem estática.

## Cronograma Real
Próximos posts confirmados de blog:
- AC-30-05: 10/05/2026 às 08:00 BRT (status future no WordPress)
- AC-30-05B: 15/05/2026 às 08:00 BRT (status future no WordPress)
- AC-30-09: 20/05/2026 às 08:00 BRT (preview pronto)
- AC-30-09B: 25/05/2026 às 08:00 BRT (preview pronto)
- Semana 4 (previsão): AC-30-13 (~28/05) e AC-30-13B (~30/05), aguardando aprovação de backlog.

Próximos itens da fila social:
- AC-30-03 (Instagram): 04/05 às 18:30 BRT (reagendado, recovery)
- AC-30-04 (Facebook): falhou em 03/05, precisa de correção
- AC-30-17/19/20 (Instagram): 05/05 às 18:30 BRT (aguardando janela)
- Demais itens: agendados até 09/05, todos com exports confirmados.

Total de posts de blog confirmados: 6. Total em previsão: 2. Fila social: 11 itens, 10 aguardando janela, 1 com erro.

## Alertas de Publicação
- **AC-30-04 (Facebook)**: Falha na publicação em 03/05 com erro 403 da API do Facebook. A permissão `publish_actions` foi descontinuada, e o Meta Graph API agora exige o uso de produtos de Sharing em vez desse escopo antigo.
- **AC-30-03 (Instagram)**: Foi reagendado para 04/05 como recuperação, alterado de vídeo para imagem estática (motivo: `static_image_post_not_video`).
- Nenhum item bloqueado por `missing_exported_files`: todos os 10 itens queued têm exports registrados em `social-publish-assets.json` e arquivos PNG confirmados.

## Itens Críticos
1. **Erro de API Facebook (AC-30-04)**: O post não será publicado até que a integração migre para os novos produtos de Sharing do Meta, o que impacta diretamente a presença social do cliente nesse canal.
2. **Inconsistência de status Blog Semana 2**: O `schedule-status.md` marca AC-30-05 e AC-30-05B como "Draft", mas o WordPress mostra "future". Isso gera confusão na gestão e pode atrasar o agendamento correto.
3. **Blog Semana 3 não agendado**: AC-30-09 e AC-30-09B têm preview pronto há dias, mas ainda não foram agendados no WordPress, o que arrisca quebrar a cadência de 2 posts por semana.
4. **Validação de recovery AC-30-03**: O post foi alterado para imagem estática em vez de vídeo para recuperação; é necessário confirmar se esse formato está alinhado com o planejamento original para não prejudicar o engajamento.

## Prioridade Recomendada
1. **Corrigir erro de API do Facebook (AC-30-04)**: Por que? O `publish_actions` foi descontinuado, então todos os posts futuros nesse canal falharão se não migrarmos para os Sharing products do Meta. Isso é prioridade máxima para evitar acúmulo de publicações pendentes.
2. **Sincronizar status do Blog Semana 2**: Por que? A inconsistência entre `schedule-status.md` e WordPress pode levar a erros de agendamento, então alinhar isso garante que os posts de 10/05 e 15/05 sejam publicados no horário correto (antes da janela bloqueada de 08:45 BRT).
3. **Agendar Blog Semana 3 no WordPress**: Por que? Os previews de AC-30-09 e AC-30-09B já estão aprovados e prontos, então adiantar o agendamento garante que a cadência de 2 posts por semana seja mantida sem atrasos.
4. **Validar recovery do AC-30-03 (Instagram)**: Por que? O post foi alterado para imagem estática, e precisamos confirmar que o formato ainda atende aos objetivos de engajamento do canal antes da janela de 04/05.

## Riscos e Suposições
**Riscos**:
1. Se o erro do Facebook não for corrigido até o próximo post agendado (06/05), teremos mais falhas de publicação nesse canal.
2. A inconsistência de status do blog pode fazer com que posts sejam publicados em horários fora da janela segura do Edson (antes de 08:45 BRT ou entre 15:30-17:45 BRT).
3. A janela de publicação social (após 17:45 BRT) pode ser interrompida se houver erros não tratados na fila.

**Suposições**:
1. O cliente (Edson) prefere resolver erros de integração e inconsistências de status antes de criar novos conteúdos.
2. Os previews do Blog Semana 3 (AC-30-09 e AC-30-09B) estão aprovados e prontos para agendamento imediato.
3. Todos os 10 itens queued na fila social têm exports válidos e não apresentarão erros de arquivo ao publicar.

## Orientação para Agentes
1. **Wagner WordPress**: Priorizar a sincronização de status do Blog Semana 2 (AC-30-05/05B) entre `schedule-status.md` e WordPress, seguindo o `wordpress-scheduling-cron-policy.md`. Depois, agendar o Blog Semana 3 (AC-30-09/09B) no WordPress para as datas planejadas (20/05 e 25/05 às 08:00 BRT).
2. **Monitor**: Investigar o erro 403 do Facebook e migrar a integração para os novos produtos de Sharing do Meta, conforme as memórias de 2026-04-27 sobre publicação social. Validar também o recovery do AC-30-03 para confirmar se o formato de imagem estática está correto.
3. **Visual Director**: Confirmar se o AC-30-03 (recovery) mantém a coerência visual e o objetivo de engajamento original, mesmo como imagem estática.
4. **Reviewer**: Validar as correções de status do blog, a migração da API do Facebook e o formato do AC-30-03 antes de liberar novas publicações na fila.
5. **Scheduler**: Manter a cadência de 2 posts de blog por semana, respeitando rigorosamente as janelas de disponibilidade do Edson: não executar antes de 08:45 BRT, nem entre 15:30-17:45 BRT, com janela segura de publicação após 17:45 BRT.

## Decisões Registradas
1. Priorizar a correção do erro de API do Facebook sobre novas criações, para evitar acúmulo de posts falhos na fila social.
2. Sincronizar todos os status de blog entre `schedule-status.md` e WordPress antes de realizar novos agendamentos, para evitar inconsistências de gestão.
3. Manter a cadência de 2 posts de blog por semana, com publicações às 08:00 BRT (antes da janela bloqueada de 08:45 BRT).
4. Todos os posts sociais devem ser validados pelo Monitor e Reviewer antes de entrar na fila de publicação ao vivo, respeitando as regras de 2026-04-27 sobre publicação social.
5. O recovery do AC-30-03 (Instagram) é aceito como imagem estática temporária, mas deve ser validado pelo Visual Director e Reviewer para garantir que não prejudica o engajamento do canal.
