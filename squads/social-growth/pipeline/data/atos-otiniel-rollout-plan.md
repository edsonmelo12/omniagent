# Plano de Execução Natural - Governança Otiniel -> Atos

## Objetivo

Implantar governança de campos sensíveis e contrato canônico de análise entre `Otiniel Observa` e `Atos Analista`.

## Escopo do Plano

- contrato de dados sensíveis
- dicionário canônico e derivados
- compatibilidade por canal
- ajuste do pipeline para enforcement operacional
- checklist de aceite para operação contínua

## Fase 1 - Contrato Canônico (obrigatória)

### Passos

1. Consolidar lista de campos no contrato sensível.
2. Classificar cada campo: `permitido`, `mascarar`, `bloquear`.
3. Definir tipos e defaults (`0` vs `null`).
4. Definir fórmulas oficiais de derivados.
5. Publicar checklist de governança.

### Pronto quando

- contrato publicado e referenciado no pipeline
- campos bloqueados listados como hard block
- fórmulas oficiais documentadas

## Fase 2 - Compatibilidade de Coleta por Canal

### Passos

1. Declarar matriz `R/O/N/A` por canal/provedor.
2. Definir baseline mínimo (`Meta + GA4`).
3. Registrar conectores de expansão (`LinkedIn`, `YouTube`, `CRM`).
4. Definir regra de fallback com rastreabilidade.

### Pronto quando

- matriz publicada
- baseline de prontidão explícito
- fallback com `collection_source` obrigatório

## Fase 3 - Enforcement no Pipeline

### Passos

1. Ajustar step de observação para não repassar dados sensíveis.
2. Ajustar step analítico para consumir apenas o contrato canônico.
3. Inserir veto conditions de segurança de dados.
4. Atualizar índice operacional com novos artefatos.

### Pronto quando

- step de observação não exige texto bruto de usuário
- step do Atos exige contrato sensível e matriz de canal
- vetos de segurança ativos no pipeline

## Fase 4 - Operação Recorrente

### Passos

1. Rodar ciclo semanal com conferência de completude.
2. Registrar gaps como `missing`, sem inferência.
3. Revalidar consistência dos derivados e comparações.
4. Atualizar backlog de conectores conforme maturidade do cliente.

### Pronto quando

- relatórios semanais com `completeness_status` explícito
- decisões do Atos com confiança e gaps declarados
- nenhuma exposição de campo bloqueado nos outputs

## Critérios de Aceite Final

1. Atos consome somente dados agregados por janela.
2. Campos `bloquear` não aparecem no payload analítico.
3. Campos `mascarar` chegam sanitizados.
4. Toda evidência traz origem, completude e nível de evidência.
5. Comparações são feitas apenas entre métricas/janelas compatíveis.

## Entregáveis deste plano

- `atos-analista-sensitive-contract.md`
- `otiniel-observa-channel-compatibility-matrix.md`
- ajustes de `step-07-monitor-health.md` e `step-08-atos-analise-estrategica.md`
- atualização do `operational-index.md`

