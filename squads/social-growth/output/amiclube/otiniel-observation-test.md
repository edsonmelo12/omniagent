# Amiclube - Teste de Observação no Otiniel

## Contexto

- Cliente: Amiclube
- Sistema: `social-growth`
- Baseline analítico: `Meta + GA4`
- Data do teste: 2026-04-20
- Janela usada na coleta: 2026-04-13T19:43:39.903Z até 2026-04-20T19:43:39.903Z

## Perfis Ativos

- Meta / Instagram
  - Profile ID: `b7e89eb8-3006-4f51-8cbf-da8ac40569e7`
  - Account ref: `17841444481115973`
  - Status de validação: `active`
- GA4 / Site
  - Profile ID: `80715ff8-e1d1-481a-809a-15553bb09fb5`
  - Account ref: `219566620`
  - Property ref: `302524520`
  - Status de validação: `active`

## Execução

- Meta:
  - Validação: `active`
  - Coleta: `completed`
  - Records received: `1`
  - Records normalized: `7`
- GA4:
  - Validação: `active`
  - Coleta: `completed`
  - Records received: `1`
  - Records normalized: `5`

## Resultado de Prontidão

- `ready=true`
- `activeProfiles=2`
- `connectedSources=2`
- `expiredProfiles=0`
- `invalidProfiles=0`

## Cobertura

- Social:
  - `profileCount=1`
  - `activeProfileCount=1`
  - `evidenceCount=14`
  - `summaryCount=2`
  - `completenessStatus=partial`
- Site:
  - `profileCount=1`
  - `activeProfileCount=1`
  - `evidenceCount=15`
  - `summaryCount=4`
  - `completenessStatus=partial`
- Business:
  - `completenessStatus=missing`
- Qualitative:
  - `completenessStatus=minimal`

## Gaps Observados

- O domínio `business` ainda não tem conexão ativa.
- O domínio `business` ainda não tem evidência normalizada.
- O domínio `qualitative` ainda não tem conexão ativa.

## Leitura Operacional

- A observação do Amiclube está funcional no núcleo `Meta + GA4`.
- O CRM continua opcional e não bloqueia prontidão.
- A base atual é suficiente para observação e síntese operacional, mas não para fechar leitura completa de negócios sem fontes adicionais.
