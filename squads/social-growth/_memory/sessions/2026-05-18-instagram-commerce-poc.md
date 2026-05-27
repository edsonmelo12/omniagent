# Sessão: Instagram Commerce POC - 18/05/2026

## Contexto da Sessão

Discutimos a viabilidade de implementar um "Social Commerce AI Pipeline" utilizando o catálogo de produtos do Instagram connected ao cliente Amiclube.

## O que foi feito

### 1. Análise de Credenciais e Permissões
- **Cliente:** Amiclube (ID: b256a639-1017-4a41-bef8-0d3daf6d320f)
- **Page ID:** 106701834627196
- **Instagram Business Account:** 17841444481115973 (@amiclube)
- **Token:** 32 permissões concedidas
- **Catálogo:** ID 362908558546091 (16 produtos - receitas de Amigurumi)

### 2. Estratégia Definida
- **Volume de posts:** 4-6 posts/semana
- **Destino do lead:** Landing page Hotmart
- **Gestão de token:** Edson (manual)
- **Abordagem:** Proof of Concept primeiro, escalar depois

### 3. Infraestrutura de Banco de Dados
Criadas 3 novas tabelas no PostgreSQL:

```sql
-- client_instagram_catalog
-- Mapeamento entre produtos do cliente e catálogo Instagram
- client_id (UUID)
- instagram_catalog_id
- instagram_product_id
- instagram_product_name
- hotmart_url
- related_content_themes[]

-- instagram_published_posts
-- Rastreamento de posts publicados com produto marcado
- client_id, instagram_media_id
- instagram_product_id, product_tag_status
- published_url, published_at
- utm_source, utm_medium, utm_campaign
- click_count

-- social_media_tokens
-- Gerenciamento de tokens de acesso
- client_id, platform
- access_token, refresh_token
- token_expires_at
```

### 4. Dados Carregados (Seed)
- 5 produtos mapeados com temas relacionados:
  - COMBO Squirtle, Pikachu e Charmander (pokemon, iniciante, combo, personagens)
  - COMBO Pikachu e Charmander (pokemon, iniciante, combo)
  - Pé de Pano (livre, infantil, iniciante)
  - COMBO Pica Pau + Pé de Pano (combo, personagens, tv)
  - Pica-Pau (personagens, tv, iniciante)
- Token armazenado com expiração: 17/07/2026

### 5. Módulo Backend Criado

**Arquivos criados:**
- `backend/src/modules/instagram-commerce/instagram-commerce.service.ts`
- `backend/src/modules/instagram-commerce/instagram-commerce.routes.ts`
- `backend/scripts/migrate-instagram-commerce.ts`
- `backend/scripts/seed-instagram-commerce.ts`
- `backend/scripts/test-instagram-commerce.ts`

**Rotas API registradas:**
```
GET  /api/v1/clients/:clientId/instagram-commerce/products
GET  /api/v1/clients/:clientId/instagram-commerce/token
GET  /api/v1/clients/:clientId/instagram-commerce/posts
GET  /api/v1/clients/:clientId/instagram-commerce/analytics
POST /api/v1/clients/:clientId/instagram-commerce/publish
```

## Resultados do Teste

```
✅ getActiveProducts: 5 produtos encontrados
✅ getActiveToken: Token ativo, expira 17/07/2026
✅ getPublishedPosts: 0 posts (primeira publicação ainda não feita)
```

## Próximos Passos

### Fase 1: Proof of Concept (Próxima sessão)
- [ ] Testar publicação real de um post com produto marcado via API
- [ ] Validar se product_tag funciona na prática
- [ ] Verificar se UTMs são registrados corretamente

### Fase 2: Integração com Squad (Futuro)
- [ ] Modificar pipeline do Social Growth para buscar produtos relacionados por tema
- [ ] Adicionar campo `instagram_product_id` no campaign-manifest.json
- [ ] Criar automação: geração de post → buscar produto → publicar com tag

### Fase 3: Operacionalização (Futuro)
- [ ] Dashboard de monitoramento de posts com tags
- [ ] Alerta de expiração de token (7 dias antes)
- [ ] Relatório de conversão (cliques em UTM → landing Hotmart)

## Limitações Identificadas

1. **Reels:** API não suporta upload de vídeo sintético - precisa de vídeo real
2. **Marcação em posts existentes:** Só consegue marcar produtos ao publicar novo conteúdo
3. **Token:** Precisa de renovação manual (Edson)

## Arquivos de Referência

- `backend/src/modules/instagram-commerce/instagram-commerce.service.ts` - Lógica principal
- `backend/scripts/migrate-instagram-commerce.ts` - Criação das tabelas
- `backend/scripts/seed-instagram-commerce.ts` - Dados iniciais

---

**Próxima sessão:** Continuar do teste de publicação real ou integrar com squad?