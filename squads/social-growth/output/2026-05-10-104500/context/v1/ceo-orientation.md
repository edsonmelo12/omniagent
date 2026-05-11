# Orientação do CEO

## Contexto da Run
*   **Cliente:** AmiClube (Amigurumi de Luxo)
*   **Propósito da Run:** Execução do Step 000 (CEO Orientation) para sincronizar realidade, identificar gargalos no cronograma de hoje (10/05/2026) e priorizar ações de publicação.
*   **Estágio do Pipeline:** Step 06 (Schedule Delivery) / Step 07 (Monitor Health).

## Avaliação da Situação
Edson, dei uma olhada no cenário de hoje e temos um ponto de atenção imediata. São 10:45 AM e o post de blog **AC-30-05** (*Preço, valor e o que avaliar antes de comprar*), que estava previsto para as 08:00 AM, ainda consta como `future` no plano e `Em revisão (preview pronto)` no backlog. 

Por outro lado, a frente social está em ordem: o carrossel **AC-30-06** já está na fila de publicação (`scheduled`) para as 18:30 PM de hoje, com todos os 7 slides exportados e validados na versão v5.

## Cronograma Real (10/05/2026)
*   **HOJE 08:00 (ATRASADO):** AC-30-05 (Blog Post) - Status: `future` (Pendente agendamento/publicação).
*   **HOJE 18:30:** AC-30-06 (Instagram Carrossel) - Status: `scheduled` (Confirmado na fila).
*   **11/05 18:30:** AC-30-07 (Instagram Reels) - Status: `scheduled`.
*   **12/05 18:30:** AC-30-08 (Instagram Post) - Status: `scheduled`.
*   **15/05 08:00:** AC-30-05B (Blog Post) - Status: `future` (Preview pronto).

## Alertas de Publicação
*   **ALERTA CRÍTICO:** AC-30-05 (Blog) perdeu a janela das 08:00. O preview está pronto, mas o agendamento no WordPress não foi confirmado pelo worker.
*   **AVISO:** `pending_caption:AC-30-04` persiste nos logs de monitoramento, embora o post já tenha sido publicado em 03/05. É um ruído de histórico que não bloqueia a fila atual.

## Itens Críticos
1.  **Publicação AC-30-05:** Precisamos disparar a publicação ou agendamento retroativo deste artigo no WordPress para não comprometer a autoridade da Semana 2.
2.  **Sincronização de Backlog:** O `editorial-backlog.md` ainda lista AC-30-06 como `review`, mas ele já está `scheduled` no monitor real. Precisamos baixar essa flag para evitar retrabalho de revisão.

## Prioridade Recomendada
1.  **Desbloqueio Blog (Imediato):** Executar a publicação do AC-30-05 no WordPress. Como já passou das 08:00, deve ser publicado "agora".
2.  **Validação de Links (Até 15:30):** Validar os links de destino do AC-30-06 para garantir que o redirecionamento para o blog (AC-30-05) esteja funcional antes das 18:30.
3.  **Higiene de Dados (Hoje):** Atualizar o `editorial-backlog.md` e `schedule-plan.md` para refletir o status `scheduled` dos itens que já estão na fila do monitor.

## Riscos e Suposições
*   **Risco de Link Quebrado:** Se o AC-30-06 for publicado às 18:30 e o Blog Post AC-30-05 não estiver no ar, o CTA "link na bio" levará a um 404 ou página de erro, gerando frustração no lead premium.
*   **Suposição:** Assume-se que o preview do AC-30-05 já passou pelo crivo de qualidade e está pronto para o "live", dado o status `Em revisão (preview pronto)` com gate OK.

## Orientação para Agentes
*   **Wagner (WordPress):** Prioridade total em publicar o AC-30-05. Verifique se o slug está correto conforme o plano social.
*   **Scheduler:** Revalide a fila social após a publicação do blog para garantir que o `link_target` do AC-30-06 está ativo.
*   **Atos (Analista):** Sincronize o `editorial-backlog.md` com o `social-publish-monitor.md`.

## Decisões Registradas
*   Priorização do agendamento manual/forçado do AC-30-05 devido à perda da janela matinal.
*   Manutenção do AC-30-06 na fila original das 18:30 (janela de alta performance de domingo).
