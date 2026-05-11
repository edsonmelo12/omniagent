# Otiniel Observa - Teste Qualitativo do Amiclube

## Contexto

- Cliente: Amiclube
- Canal: `qualitative`
- Provider: `manual`
- Perfil ativo: `Amiclube Qualitative Bootstrap`
- Objetivo: validar a trilha qualitativa do Otiniel com intake manual de teste

## Execução

- Foi criado um profile `manual` em `channel=qualitative`.
- O profile ficou ativo com `accountRef=manual://amiclube-qualitative`.
- Foi submetido um intake manual com uma evidência textual e janela recente de observação.
- O backend retornou o intake com sucesso e atualizou a prontidão do cliente.

## Resultado

- `recordsReceived=1`
- `recordsNormalized=0`
- `ready=true`
- `activeProfiles=4`
- `connectedSources=4`

## Cobertura Atual

- `social`: `partial`
- `site`: `partial`
- `business`: `partial`
- `qualitative`: `partial`

## Leitura Operacional

- O Amiclube agora tem cobertura ativa nas quatro camadas do Otiniel.
- O perfil qualitativo fecha a última lacuna de observação para leitura de contexto, narrativa e sinais manuais.
- O estado atual permanece pronto para uso operacional e evolução de pauta.

## Observação

- Este teste usa bootstrap manual para validação estrutural da trilha qualitativa.
- A evidência textual pode ser ampliada depois com sinais reais de campo, entrevistas ou revisão humana.
