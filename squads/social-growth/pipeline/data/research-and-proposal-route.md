# Roteiro Universal de Pesquisa e Proposta

## Objetivo

Padronizar qualquer pesquisa da squad `social-growth` para que o resultado final possa virar:
- diagnóstico executivo;
- apresentação comercial;
- proposta de social media;
- dashboard de presença digital.

O roteiro vale para qualquer cliente com presença digital, não apenas para a Dallas.

## Princípio Central

Toda pesquisa deve sair da descrição genérica e chegar em leitura acionável.
Antes de pesquisar, o time deve ler o client record persistido.
Depois de pesquisar, o resultado deve ser gravado no banco como market research versionado.
A estratégia sempre vem depois e deve consultar a biblioteca persistida para selecionar a tese certa.

O fluxo precisa responder, nesta ordem:
1. Quem é o cliente?
2. Onde ele aparece digitalmente?
3. Quais sinais públicos existem?
4. Qual é a leitura quantitativa da presença?
5. Como ele se compara ao mercado e aos concorrentes?
6. Qual é o gap principal entre operação e comunicação?
7. Isso já sustenta uma apresentação ou proposta?

## Stage Boundaries

- **Pesquisa**: coleta sinais, mede presença digital, mapeia mercado, concorrência, audiência e GEO / AI discoverability.
- **Proposta comercial**: só é produzida quando o usuário pede explicitamente ou quando o ciclo chega ao checkpoint de proposta.
- **Conteúdo**: só começa depois que a pesquisa e a estratégia já estão fechadas.
- **Tendências**: a pesquisa de tendências começa na fase de conteúdo (backlog de pautas/blog), não na pesquisa de mercado.
- **Público/persona**: devem ser tratados como hipóteses de pesquisa, não como personas criativas inventadas.

## Ordem Obrigatória

1. **Client Record**
   - validar nome, segmento, oferta, praça e objetivo.

2. **Social Intelligence**
   - localizar site e perfis sociais;
   - registrar site, blog e perfis sociais como presença digital;
   - registrar seguidores, posts, último post e status de coleta;
   - marcar a confiança de cada dado.

3. **Market Research**
   - mapear mercado, audiência e concorrência;
   - identificar benchmarks diretos e aspiracionais;
   - observar padrões de posicionamento e conteúdo.
   - persistir a nova versão de market research no banco;
   - registrar referências e IDs quando houver.

4. **Quantitative Readout**
   - contar canais descobertos;
   - contar canais ativos;
   - registrar números visíveis;
   - marcar o que é `confirmed`, `partial` ou `not confirmed`.

5. **Executive Synthesis**
   - resumir forças, lacunas, oportunidades e riscos;
   - explicitar o arquétipo ou a tese mais provável.

6. **Proposal Readiness**
   - declarar se o material já sustenta apresentação comercial;
   - se o checkpoint de proposta estiver confirmado, a primeira saída deve ser a apresentação formatada com título, objetivo, tese e arquétipo;
   - se sim, preparar a transição para o módulo de proposta;
   - se não, apontar o que ainda falta.

## Proposal Trigger Rule

Não gerar proposta comercial por padrão.

Gerar apenas quando:

- o usuário pedir proposta, deck ou relatório consolidado; ou
- o ciclo atingir o checkpoint de proposta e o time precisar do artefato comercial para avançar.

Quando a proposta não for necessária, a pesquisa deve parar em leitura analítica e pronto para reutilização.

## Saída Esperada

Toda pesquisa deve terminar com:
- resumo executivo;
- leitura de presença;
- leitura de mercado e concorrência;
- leitura de audiência como hipótese;
- recomendações de fontes para pesquisa futura de tendências na fase de conteúdo;
- score ou leitura comparativa;
- evidências;
- nota de prontidão para apresentação ou proposta.
- referência ao registro persistido no banco, quando aplicável.
- indicação clara de quais sinais devem ser levados para a etapa de strategy.

## Regras de Redação

- números vêm antes de opinião;
- dados confirmados vêm antes de inferências;
- concorrência deve aparecer quando houver mercado comparável;
- a proposta comercial é opcional, mas a prontidão para proposta deve ser declarada;
- não inventar métricas que não foram observadas.

## Uso no Fluxo

Este documento é o padrão de referência para:
- `step-01-research-market.md`
- `research-record.md`
- `social-intelligence-summary-template.md`
- `social-sales-proposal-module.md`
- `operating-flow.md`
- `comece-aqui.md`
- `daily-usage-guide.md`

## Handoff para Strategy

Toda pesquisa fecha com um handoff para strategy contendo:
- client record usado como base;
- market research versionado;
- social intelligence summary;
- principal tese ou arquétipo inferido;
- observações que ajudem a consultar `strategy_library_strategies`.

O passo de strategy nunca deve inventar a tese do zero se a biblioteca persistida já tiver um fit melhor.

## Checkpoint de Proposta

Depois da inteligência social e da leitura de prontidão, o sistema deve perguntar ao usuário se este ciclo também precisa gerar uma proposta comercial / sales deck.

Pergunta padrão:
- "Este ciclo também deve gerar um documento único com a proposta comercial, deck e relatório consolidado?"

Essa é a frase canônica que o squad deve usar sempre que o checkpoint de proposta for acionado.

Se a resposta for:
- **sim**: o fluxo deve incluir o módulo de proposta e salvar a entrega final em `output/<client-slug>/client-report.md`
- **não**: o fluxo segue apenas com research, strategy e content

Esse checkpoint deve acontecer antes da strategy quando a proposta fizer parte do ciclo, para que a tese escolhida já considere o uso comercial do documento final.

## Critério de Conclusão

A pesquisa só está completa quando o time consegue responder:
- o que existe hoje;
- o que isso significa;
- como isso se compara ao mercado;
- e se já vale transformar o resultado em proposta.
