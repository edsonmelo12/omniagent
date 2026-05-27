# Podcast Intelligence Operating Guide

## Purpose

Guia unico para transformar videos, podcasts e episodios em memoria acionavel da squad, sem concentrar tudo no Strategist e sem gerar perguntas desnecessarias.

## Design Principles

1. Entregar pronto por padrao.
2. Perguntar apenas quando um dado realmente bloqueia a competencia ou o roteamento.
3. Separar origem, leitura e decisao.
4. Manter rastreabilidade total da fonte.
5. Registrar nomes, mecanismos e proveniencia.
6. Distribuir a leitura por competencia e consolidar no final.

## Natural Steps

### 1. Entrada
- Atlas recebe o link, video ID ou episodio.
- Registrar fonte, data, objetivo e cliente-alvo, quando houver.

### 2. Transcricao
- Extrair a transcricao com a melhor ferramenta disponivel.
- Se a transcricao vier sem segmentacao perfeita, continuar com best effort.

### 3. Extracao Neutra
- Gerar a tese central.
- Identificar estrategias dominantes.
- Mapear mecanismos, taticas e evidencias.
- Manter a leitura sem assumir relevancia para um cliente especifico ainda.

### 4. Nomeacao
- Atribuir um nome curto e memoravel a estrategia principal.
- Registrar tipo de nome, proveniencia e estrategia secundarias.

### 5. Roteamento por Competencia
- Atlas usa o `Podcast Intelligence Handoff Template`.
- Enviar cada tema para o agente mais especifico.
- Quando o tema cruzar competencias, escolher um dono principal e marcar os secundarios.

### 6. Leitura Especializada
- `Discovery Optimizer`: algoritmo, distribuicao, alcance, mecanica de plataforma.
- `Researcher`: mercado, audiencia, benchmark, sinais externos.
- `Strategist`: mix, cadencia, pilares, implicacao editorial.
- `Creator`: traducao do insight em execucao.
- `Reviewer`: qualidade, risco, aderencia final.
- `Atos Analista`: validacao pos-ciclo e aprendizagem por resultado.

### 7. Consolidacao
- Atlas recebe os retornos.
- Decidir se consolida, roteia de novo, segura por mais evidencias ou envia ao Strategist.

### 8. Registro
- Salvar o relatorio no template padrao.
- Atualizar o indice vivo.
- Atualizar o catalogo de estrategias.
- Se surgir padrao novo, registrar no mapa-mae por tipo.

### 9. Aplicacao
- Se houver impacto editorial, o Strategist converte em plano.
- Se houver impacto de canal/distribuicao, o Discovery Optimizer recebe a regra.
- Se houver impacto de execução, o Creator traduz para formato.
- Se houver impacto de qualidade, o Reviewer valida a aplicacao.

### 10. Aprendizagem
- O Atos Analista verifica se a regra se sustentou no ciclo.
- Se sustentou, sobe como padrao.
- Se nao sustentou, volta como hipótese ou arquiva.

## Question Policy

- fazer pergunta apenas quando o dado ausente muda a rota ou bloqueia a decisao
- no maximo 1 pergunta bloqueante por handoff
- se der para seguir com suposicao documentada, seguir

## Output Stack

1. `podcast-intelligence-report-template.md`
2. `podcast-intelligence-strategy-taxonomy.md`
3. `podcast-intelligence-strategy-catalog.md`
4. `podcast-intelligence-strategy-map.md`
5. `podcast-intelligence-index.md`

## Done Criteria

O processo esta pronto quando:

- a fonte foi registrada
- a tese foi extraida
- a estrategia foi nomeada
- o tema foi roteado por competencia
- a consolidacao foi entregue
- o indice foi atualizado
- o catalogo recebeu a nova entrada, se aplicavel

## Anti-Patterns

- centralizar tudo no Strategist
- fazer pergunta por padrao, nao por bloqueio
- perder a proveniencia da fonte
- misturar leitura neutra com decisao de campanha
- nome bonito sem mecanismo
