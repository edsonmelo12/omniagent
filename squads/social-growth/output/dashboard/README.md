# Dashboard Operacional - Social Growth Squad

## Visão Geral

Dashboard interativa para monitoramento da squad de crescimento social.

## Estrutura

```
output/dashboard/
├── index.html    # Página principal da dashboard (multi-cliente)
├── chat.html     # Chat operacional da squad com fallback local
├── products.html  # Catálogo de produtos em página dedicada
├── data.js       # Dados dinâmicos injetados no browser
└── README.md     # Este arquivo
```

## Fonte de Dados

- A dashboard lê `output/amiclube/publishing/social-publish-queue.json`
- O `data.js` é regenerado automaticamente pelo script de atualização
- Atualmente configurado para `amiclube`

## Como Usar

### Visualizar a Dashboard

Abra o arquivo `index.html` no navegador:
- Via arquivo: `file:///home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/output/amiclube/dashboard/index.html`
- Via servidor: `http://localhost:8080` (se tiver um servidor HTTP rodando)

Abra o arquivo `products.html` para ver o catálogo completo de produtos em uma página dedicada.

Abra `chat.html` para usar o terminal operacional da squad. Para respostas via API local, inicie o servidor Node:

```bash
cd /home/edsonrmjunior/Local Sites/omniagent/squads/social-growth
node scripts/serve-dashboard.mjs
```

Com o servidor rodando, o chat fica integrado mesmo se `chat.html` for aberto por `file://`, porque a página tenta conectar em `http://localhost:8080/api/chat`. Se o servidor não estiver ativo, o chat usa apenas o fallback local do browser.

Endpoints disponíveis no servidor:
- `GET /api/chat/context` retorna o contexto consolidado dos artefatos do dashboard.
- `POST /api/chat` recebe `{ "prompt": "..." }` e responde no contrato operacional do chat.

### Atualizar Dados

Execute o script de atualização:

```bash
cd /home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/scripts
npm run dashboard:update
```

Ou diretamente:

```bash
node scripts/update-dashboard-data.mjs
```

### Integração Automática

Para atualizar automaticamente, adicione ao seu fluxo de publicação:

1. Após executar o monitor (`monitor-social-publish-queue.mjs`)
2. Execute `npm run dashboard:update` para sincronizar os dados

## Dados Automatizados

O script extrai automaticamente:
- **Métricas da fila**: Total, publicados, agendados, bloqueados
- **Queue items**: Todos os itens da fila com status
- **Última atualização**: Timestamp UTC

Fonte: `output/amiclube/publishing/social-publish-queue.json`

## Customização

### Alterar Cliente

Edite `data.js` ou modifique o script para extrair de outros clientes.

### Adicionar Métricas

1. Adicione o campo no script `update-dashboard-data.mjs`
2. O JavaScript na página akan automaticamente renderizar

## Design System

Usando o design system `dashboard` do Open Design:
- Tema escuro
- IBM Plex Sans
- Primária: #0C5CAB
- Cores: success (#10B981), warning (#F59E0B), danger (#EF4444)
