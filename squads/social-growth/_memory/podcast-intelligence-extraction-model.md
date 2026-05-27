# Modelo Padrão: Extração de Estratégias por Podcasts / YouTube

> **Status:** CANÔNICO LEAN — pronto para uso sob demanda
> **Propósito:** transformar fala bruta em estratégia acionável para qualquer cliente, sem burocracia

## Objetivo

Extrair, de cada episódio, apenas o que pode virar decisão de campanha, pauta, canal ou formato para o cliente analisado.

## O que entra

- tese central do episódio
- estratégia dominante
- mecanismo de funcionamento
- tática citada
- evidência concreta
- aplicabilidade por tipo de negócio
- risco de má leitura
- decisão sugerida para a squad

## O que não entra

- frases inspiracionais sem mecanismo
- exemplos sem relação com a realidade do cliente
- insights bonitos, mas sem implicação prática
- transcrição longa sem síntese

## Fluxo de extração

1. **Validar a fonte**
   - verificar canal, data, convidado e relevância para o cliente
2. **Ler a tese central**
   - resumir em 1 frase o que o episódio realmente defende
3. **Marcar estratégias**
   - posicionamento, oferta, distribuição, conversão, prova, operação, retenção
4. **Identificar mecanismos**
   - como a estratégia gera resultado na prática
5. **Separar táticas**
   - ações citadas que podem virar execução
6. **Checar aplicabilidade**
    - o que vale para o cliente-alvo e o que deve ser descartado
7. **Fechar em decisão**
   - `scale`, `optimize`, `retest`, `pause` ou `archive`

## Critério de confiança

| Nível | Regra |
|---|---|
| Alta | há mecanismo claro + exemplo concreto + aplicabilidade direta |
| Média | há sinal consistente, mas falta validação no cliente |
| Baixa | há boa fala, mas sem evidência suficiente para agir |

## Saída padrão

### 1. Tese Central
Uma frase objetiva.

### 1.1 Strategy Name
Nome curto, memoravel e rastreavel da estrategia extraida.

### 2. Estratégias Identificadas
Lista das estratégias dominantes com score e evidências.

### 2.1 Provenance
- source name
- video or episode ID
- published date
- guest name(s), when available

### 3. Mecanismos
Como a estratégia funciona.

### 4. Táticas Mencionadas
Ações específicas que podem ser replicadas.

### 5. Aplicabilidade para o Cliente-Alvo

- `alta`: vale testar já
- `média`: vale monitorar e adaptar
- `baixa`: arquivar

### 5.1 Camada de Contexto do Cliente

Mapear antes da decisão:

- nicho
- estágio de maturidade
- oferta principal
- canal dominante
- restrições de produção

### 6. Decisão

- `scale` quando o padrão é forte e repetível
- `optimize` quando a direção é boa, mas a execução precisa ajuste
- `retest` quando a hipótese ainda está incompleta
- `pause` quando o sinal não compensa o custo
- `archive` quando o conteúdo não conversa com o cliente

## Pergunta de controle

> Se eu transformar isso em pauta de conteúdo amanhã, o que exatamente muda?

Se a resposta não for clara, o insight não passa.
