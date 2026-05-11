# Trend Opportunity Radar

Use este arquivo como radar canônico de hipóteses estratégicas por cliente.
Objetivo: separar `sinal validado` de `espaço promissor ainda pouco explorado`.

## Taxonomia Obrigatória

### Opportunity Status

- `validated` — hipótese já sustentada por sinal consistente.
- `under_tested` — hipótese plausível, ainda com pouca evidência.
- `execution_failed` — hipótese ainda viva, mas o teste falhou por execução.
- `distribution_failed` — hipótese ainda viva, mas não recebeu distribuição suficiente.
- `market_misaligned` — hipótese parece fraca para oferta/mercado atual.
- `strategic_bet` — hipótese sem prova forte ainda, mas importante testar.
- `discarded` — hipótese rejeitada com base suficiente.

### Decision Tag

- `scale`
- `optimize`
- `retest`
- `pause`
- `kill`

## Scorecard Mínimo

Avaliar cada hipótese com nota `alta`, `média` ou `baixa` para:

1. Dor real
2. Aderência à oferta
3. Prova disponível
4. Saturação concorrencial
5. Facilidade de teste

## Radar Table

| hypothesis_id | cluster | angle | source_signal | opportunity_status | confidence | decision_tag | why_now | next_test | owner |
|---|---|---|---|---|---|---|---|---|---|
| H-001 | objeções de compra | critério vs preço | DM + comentários + busca | strategic_bet | média | retest | dor forte, pouca cobertura qualificada | carrossel + stories + CTA de conversa | Eldon |

## Rules

1. Hipótese sem `source_signal` explícito não entra no radar.
2. `kill` só pode aparecer quando:
   - houve teste suficiente;
   - execução não foi claramente o problema;
   - distribuição não foi claramente o problema.
3. `under_tested` e `strategic_bet` não podem ser tratados como fracasso.
4. Toda hipótese deve apontar `next_test`.
5. Toda atualização deve preservar histórico, não sobrescrever arbitrariamente a lógica anterior.

## Source Signal Types

- `performance_signal`
- `search_signal`
- `sales_objection`
- `comment_pattern`
- `competitor_gap`
- `market_shift`
- `offer_gap`
- `strategic_inference`
