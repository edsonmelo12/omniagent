# Módulo de Proposta Comercial de Social Media

## Objetivo

Gerar uma proposta comercial para clientes que já têm site, portfólio ou produtos publicados, mas ainda não têm as redes sociais operadas como canal de crescimento.

O módulo deve ser acionado somente depois que o time seguir o roteiro universal de pesquisa definido em [research-and-proposal-route.md](research-and-proposal-route.md).
A estrutura textual da proposta e a versão deck devem seguir o template único em [proposal-and-deck-template.md](proposal-and-deck-template.md).
Quando o checkpoint de proposta for confirmado, a saída padrão deve aparecer primeiro como apresentação formatada, com título, objetivo, tese e arquétipo, e só depois como texto consolidado.
Se o ciclo não pediu proposta comercial, este módulo não deve ser executado.

O módulo usa pesquisa de mercado, saúde das redes e contexto do portfólio para montar uma apresentação que mostra:
- a situação atual
- a principal lacuna
- a oportunidade comercial
- a transformação esperada com social media
- a oferta recomendada

O módulo pode operar por cliente, por produto, por empreendimento, por marca ou por mercado, dependendo do contexto.

## Quando Usar

Use este módulo quando o cliente:
- já tem site, catálogo ou portfólio
- precisa de uma proposta de social media
- não quer um pacote fixo
- precisa de uma recomendação adaptada ao contexto
- deve enxergar uma história de transformação, não uma lista de serviços

Antes de acionar este módulo, o sistema deve perguntar ao usuário se este ciclo precisa incluir a proposta comercial em um documento único.
Se a resposta for sim, o relatório final deve consolidar pesquisa, estratégia e proposta em `output/<client-slug>/client-report.md`.
Se a resposta for não, pule este módulo e siga apenas com research, strategy e content.
Se o usuário não confirmou proposta, não montar deck.

## Entradas

- site institucional
- páginas de produto ou empreendimento
- perfis sociais públicos
- posts públicos, datas e sinais visíveis de engajamento
- exports oficiais ou screenshots de analytics, quando existirem
- contexto de mercado e sinais de concorrência
- market scope resolvido ou inferido
- números visíveis de presença, prova, consistência e conversão

## Fluxo de Análise

1. Ler o site e os materiais públicos.
2. Identificar o posicionamento atual do cliente.
3. Ler o cenário de mercado e concorrência.
4. Inspecionar os sinais de saúde das redes.
5. Determinar a principal lacuna comercial.
6. Selecionar o arquétipo mais adequado.
7. Montar o deck da proposta quando o checkpoint for confirmado.
8. Exibir a apresentação primeiro, com título e objetivo visíveis antes do texto longo.

The deck must never rely on a claim without a number, a count, a score or a confirmed source.
The deck must also expose the route result clearly enough that the same research can be reused as a presentation or dashboard input.

## Arquétipos

### Presença
Use quando o cliente tem site ou portfólio, mas o social está fraco, inconsistente ou inativo.

### Autoridade
Use quando o produto é bom, mas o mercado ainda não percebe valor, clareza ou prova suficientes.

### Conversão
Use quando a marca recebe atenção, mas não converte atenção em ação.

### Escala
Use quando a marca já mostra tração e o objetivo é ampliar o que funciona.

## Regras de Decisão

- Se a presença social for fraca, escolha `Presença`.
- Se o produto existir, mas o valor percebido for fraco, escolha `Autoridade`.
- Se houver atenção sem ação, escolha `Conversão`.
- Se um tema ou formato já performar bem, escolha `Escala`.
- Se o contexto de mercado for amplo, escolha o recorte mais relevante para o produto prioritário.
- Se o cliente atuar em mais de uma praça, escolha a tese por praça ou por produto prioritário.
- Se a proposta não tiver números, não apresente a afirmação no slide executivo.

Se o cliente tiver vários produtos ou empreendimentos distintos, o arquétipo pode ser escolhido por produto ou por item prioritário.

## Estrutura da Apresentação

A apresentação usa uma espinha fixa de 7 slides:

1. **Capa e Objetivo**
   - nome do cliente
   - objetivo comercial
   - tese da proposta
   - promessa principal

2. **Retrato Atual**
   - o que existe hoje
   - o que já é forte
   - o que ainda falta

3. **Diagnóstico**
   - principal lacuna
   - sinais-chave
   - impacto no negócio

4. **Leitura de Mercado**
   - posição no mercado
   - padrão da concorrência
   - espaço de oportunidade

5. **Transformação**
   - antes vs depois
   - impacto no negócio
   - mudança de percepção

6. **Proposta Recomendada**
   - arquétipo selecionado
   - escopo
   - cadência
   - resultado esperado

7. **Próximos Passos**
   - aprovação
   - record review
   - kick-off
   - implementação

## Estrutura da Proposta

A versão textual da proposta deve seguir a mesma ordem lógica do template:
1. Presentation header no topo, com título, objetivo, tese e arquétipo.
2. Executive Summary
3. Presence
4. Audience
5. Competitive Landscape
6. Score Readout
7. Opportunities
8. Proposal Readiness
9. Risks and Assumptions
10. Recommendation and next steps

## Blocos Variáveis

O módulo deve variar:
- tese
- diagnóstico
- oportunidade
- exemplos
- foco de KPIs
- oferta final
- CTA

O módulo deve manter fixo:
- estrutura
- lógica de decisão
- ordem dos slides
- enquadramento comercial

## O Que o Módulo Não Pode Fazer

- inventar números
- forçar pacote fixo
- gerar a mesma proposta para todo cliente
- ignorar o contexto de mercado
- apresentar a oferta antes da transformação

## Saídas Esperadas

- apresentação pronta para abrir na primeira tela, com título e objetivo
- deck pronto para apresentação
- diagnóstico executivo curto
- arquétipo selecionado
- oferta recomendada
- próximo passo claro

## KPIs Recomendados

A proposta pode citar KPIs como:
- seguidores e crescimento
- alcance e impressões
- salvamentos e compartilhamentos
- comentários e respostas
- visitas ao perfil
- cliques
- conclusão de vídeo
- taxa de engajamento

Use apenas métricas visíveis, exportadas ou confirmadas.
Se uma métrica não estiver confirmada, ela deve ficar fora da versão executiva do deck.

## Exemplos de Uso

- Marca imobiliária com site forte e projetos distintos: tende a `Autoridade` ou `Conversão`.
- Marca com produto forte, mas presença social fraca: tende a `Presença`.
- Marca com bom tráfego de conteúdo, mas pouca ação comercial: tende a `Conversão`.
- Marca com formato ou projeto claramente vencedor: tende a `Escala`.

## Decision Log

- Escolha: deck modular em vez de pacote fixo.
- Escolha: 4 arquétipos para refletir as principais lacunas comerciais.
- Escolha: estrutura de 7 slides para equilibrar clareza e flexibilidade.
- Escolha: a proposta deve começar pelo diagnóstico, não pela lista de serviços.
- Rejeitado: apresentação universal para todos os clientes.
- Motivo: seria repetitiva e comercialmente fraca.

## Recomendação Final

Para cada cliente, deixe o sistema escolher o arquétipo e depois montar o deck a partir da espinha fixa mais os blocos contextuais.

Isso mantém a proposta dinâmica, comercial e realmente adaptada ao cliente, com a apresentação aparecendo primeiro para reduzir dúvida e acelerar decisão.
