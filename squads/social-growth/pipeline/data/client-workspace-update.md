# Client Workspace Update

Registro da implementação das telas de clientes e do fluxo de exclusão, com a adaptação do estilo dos templates `templates/clientes/` para a realidade do OmniAgent.

## Objetivo

Entregar duas telas principais no dashboard:

1. Gerenciar Clientes
2. Criar/Editar Cliente

As telas precisavam seguir o estilo visual definido nos templates, mas respeitar a estrutura real do banco, os contratos do backend e o fluxo já usado pelo squad.

## Decisões Registradas

- Mantivemos a linguagem visual dos templates como base.
- A navegação foi feita sem roteador pesado, usando estado local no `App`.
- A tela de criar/editar cliente passou a incluir o catálogo de produtos/serviços.
- A edição de cliente foi exposta no backend.
- A exclusão de cliente e produto foi habilitada com confirmação na UI.
- O produto foco continua sendo o ativo principal do cliente.

## O Que Foi Implementado

### Backend

- `PATCH /api/v1/clients/:clientId`
- `DELETE /api/v1/clients/:clientId`
- `DELETE /api/v1/products/:productId`
- atualização de site associado ao cliente quando o website é editado
- limpeza de registros auxiliares ao excluir cliente
- promoção automática de outro produto quando o produto foco é excluído

### Frontend

- tela `Gerenciar Clientes`
- tela `Criar/Editar Cliente`
- seção nativa de produtos/serviços no formulário de cliente
- ações de editar e excluir cliente
- ações de editar, priorizar, arquivar, focar e excluir produto
- navegação entre dashboard, clientes e formulário

### Dados e API

- o dashboard passou a usar `loadClient`, `updateClient`, `deleteClient` e `deleteProduct`
- o contrato de produtos continua usando `proof_points`
- o cadastro de cliente mantém `clients`, `client_sites` e `client_products` como base

## Arquivos Principais Alterados

- [`dashboard/src/App.tsx`](/home/edsonrmjunior/Local%20Sites/omniagent/dashboard/src/App.tsx)
- [`dashboard/src/components/DashboardPage.tsx`](/home/edsonrmjunior/Local%20Sites/omniagent/dashboard/src/components/DashboardPage.tsx)
- [`dashboard/src/components/ClientsWorkspacePages.tsx`](/home/edsonrmjunior/Local%20Sites/omniagent/dashboard/src/components/ClientsWorkspacePages.tsx)
- [`dashboard/src/components/ClientProductsPanel.tsx`](/home/edsonrmjunior/Local%20Sites/omniagent/dashboard/src/components/ClientProductsPanel.tsx)
- [`dashboard/src/lib/backendApi.ts`](/home/edsonrmjunior/Local%20Sites/omniagent/dashboard/src/lib/backendApi.ts)
- [`backend/src/modules/clients/clients.routes.ts`](/home/edsonrmjunior/Local%20Sites/omniagent/backend/src/modules/clients/clients.routes.ts)
- [`backend/src/modules/clients/clients.service.ts`](/home/edsonrmjunior/Local%20Sites/omniagent/backend/src/modules/clients/clients.service.ts)
- [`backend/src/modules/clients/clients.repository.ts`](/home/edsonrmjunior/Local%20Sites/omniagent/backend/src/modules/clients/clients.repository.ts)
- [`backend/src/modules/clients/clients.schemas.ts`](/home/edsonrmjunior/Local%20Sites/omniagent/backend/src/modules/clients/clients.schemas.ts)
- [`backend/src/modules/client-products/client-products.routes.ts`](/home/edsonrmjunior/Local%20Sites/omniagent/backend/src/modules/client-products/client-products.routes.ts)
- [`backend/src/modules/client-products/client-products.service.ts`](/home/edsonrmjunior/Local%20Sites/omniagent/backend/src/modules/client-products/client-products.service.ts)
- [`backend/src/modules/client-products/client-products.repository.ts`](/home/edsonrmjunior/Local%20Sites/omniagent/backend/src/modules/client-products/client-products.repository.ts)

## Resultado Funcional

### Gerenciar Clientes

- lista clientes cadastrados
- permite busca
- mostra cliente em foco
- mostra produto foco
- permite editar cliente
- permite excluir cliente

### Criar/Editar Cliente

- carrega cliente existente para edição
- permite alterar nome, slug, segmento, site e observações
- inclui catálogo de produtos/serviços no mesmo fluxo
- permite excluir cliente em edição
- em criação, permite rascunhar produtos antes de persistir

### Produtos/Serviços

- criar
- editar
- priorizar
- arquivar
- definir foco
- excluir

## Validações Executadas

- `backend` build OK
- `dashboard` build OK

## Observações

- Existe um warning de bundle por causa do `ClientProductsPanel` ser importado dinamicamente no dashboard e estaticamente no workspace de clientes. Não quebra a aplicação.
- A exclusão de cliente remove os dados auxiliares ligados ao cliente e apaga os produtos vinculados.
- A exclusão de produto preserva consistência do foco do cliente.

## Próximos Passos

1. Remover o warning de bundle do `ClientProductsPanel` consolidando a estratégia de importação.
2. Fazer um refinamento visual fino das telas para aproximar ainda mais do template original.
3. Revisar se o delete de cliente deve mostrar uma confirmação mais forte com texto de risco.
4. Avaliar se o catálogo de produtos na criação deve ter ordem/regras de foco mais explícitas.
5. Expandir a tela de edição para refletir mais contexto operacional do cliente, se necessário.
