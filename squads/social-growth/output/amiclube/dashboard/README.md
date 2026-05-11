# Dashboard Operacional - Social Growth Squad

## Visão Geral

Dashboard interativa para monitoramento da squad de crescimento social.

## Estrutura

```
dashboard/
├── index.html    # Página principal da dashboard
├── data.json     # Dados dinâmicos (gerado automaticamente)
└── README.md     # Este arquivo
```

## Como Usar

### Visualizar a Dashboard

Abra o arquivo `index.html` no navegador:
- Via arquivo: `file:///home/edsonrmjunior/Local Sites/omniagent/squads/social-growth/output/amiclube/dashboard/index.html`
- Via servidor: `http://localhost:8080` (se tiver um servidor HTTP rodando)

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
- **Queue items**: Próximos 10 ativos com status
- **Última atualização**: Timestamp UTC

Fonte: `output/amiclube/publishing/social-publish-monitor.md`

## Customização

### Alterar Cliente

Edite `data.json` ou modifique o script para extrair de outros clientes.

### Adicionar Métricas

1. Adicione o campo no script `update-dashboard-data.mjs`
2. O JavaScript na página akan automaticamente renderizar

## Design System

Usando o design system `dashboard` do Open Design:
- Tema escuro
- IBM Plex Sans
- Primária: #0C5CAB
- Cores: success (#10B981), warning (#F59E0B), danger (#EF4444)