# Squad Memory Archive

> Entradas anteriores a 2026-04-27 foram arquivadas para otimizar o carregamento do Atlas.
> Para histórico completo, consultar este arquivo.

## 2026-04-16 - Portal de Mídias example anchor

...

## 2026-04-16 - Discussão sobre Criatividade Editorial (Edson)

- **Problema:** Repetição na estrutura dos artigos (Manual de Instruções).
- **Sugestão registrada:** Implementar 4 novas famílias estruturais (Teardown, Battle Card, Manifesto, Quiz).
- **Ação Futura:** Criar 3 variações de templates de briefing (Educativo, Provocador, Estudo de Caso) para forçar o Blog Architect a sair do padrão.
- **Decisão:** Não implementar agora, apenas registrar para o futuro.

## 2026-04-27 — Publicação Social: step-06c + live_api no worker

- **Problema:** Pipeline encerrava no agendamento textual (step-06) sem nunca publicar nas redes sociais. Scripts de export e publisher existiam mas nunca eram invocados.
- **Arquitetura multi-cliente:** Cada cliente tem `publishing_profiles` no banco com `secret_ref` apontando para credenciais. Tokens nunca armazenados em markdown ou código.
- **Criado** `pipeline/steps/step-06c-publish-social.md` — novo step que resolve secrets do banco, exporta HTML para PNG/JPEG, valida, faz dry-run e publica ao vivo após aprovação.
- **Criado** `scripts/resolve-client-secrets.mjs` — bridge banco → .env temporário com suporte a scheme `env://`
- **Criado** `scripts/convert-png-to-jpeg.mjs` — conversão PNG→JPEG via sharp (fallback para ImageMagick)
- **Modificado** `scripts/run-social-publish-worker.mjs` — implementado `live_api` mode que invoca o `instagram-publisher/scripts/publish.js` via Meta Graph API
- **Modificado** `pipeline.yaml` — step-06c adicionado entre step-06b e step-07, também como checkpoint de aprovação
- **Fluxo:** schedule → WordPress → resolve secrets → export PNG → convert JPEG → build queue → dry-run → user approval → live publish

## 2026-04-27 — AC-30-21: imagens do catálogo do blog + grid 8px + alinhamento space-between

- **Problema:** AC-30-21 estava sem imagens, fundo monótono (variação imperceptível de off-white) e alinhamento inconsistente (cover center, conteúdo flex-end).
- **Catálogo utilizado:** `output/amiclube/blog/assets/` — 2 imagens Pexels já pesquisadas e licenciadas foram reutilizadas (AC-30-05-preco-valor-hero.jpg no slide 1, AC-30-01-escolher-com-criterio-hero.jpg no slide 4). Nenhuma nova fonte foi necessária.
- **Alinhamento:** Trocado de center/flex-end para `justify-content: space-between` em todos os slides — header no topo, conteúdo ao centro, progress bar no fundo. Elimina o "pulo" visual entre slides.
- **Paleta:** 4 cores contrastantes aplicadas: off-white (#F5F0EA), terracota suave (#E8D5C4), verde sálvia (#D4DDD0), terracota (#C85A48).
- **Grid 8px:** Mantido. Todos os valores de padding, gap e margin em múltiplos de 8.
- **Regra estabelecida:** Sempre consultar o catálogo de imagens do blog (`output/{client}/blog/assets/`) ANTES de buscar novas fontes para posts sociais derivados.

## 2026-04-27 — Implementação Render Compliance Gate

- **Problema:** AC-30-21 foi gerado como slides empilhados (sem navegação), ignorando o modelo de interação do `instagram-carousel`.
- **Diagnóstico:** Nenhuma etapa do pipeline validava que o output seguia o formato nativo da skill visual atribuída.
- **Ação:** Adicionadas veto conditions condicionais por skill visual no `step-03c-render-creative.md` (shift-left), quality criteria no `step-04-review-content.md` (segunda barreira), e auto-validação no `creative-renderer.agent.md`.
- **Skills impactadas:** `instagram-carousel`, `stories-sequence`, `linkedin-carousel` — cada uma com regras específicas de navegação, progress bar, chrome e dimensões.
- **AC-30-21 corrigido:** Re-renderizado como carrossel navegável com track horizontal (translateX), progress bar, swipe arrows, dots, drag/touch swipe e frame IG completo.
- **Assets futuros:** Todo carrossel/stories deverá passar pela gate antes de chegar ao reviewer.

## 2026-04-27 - Regeneração AC-30-08 (Edson)

- **Escopo:** Regenerar AC-30-08 (Post Estático "Valor percebido vs valor entregue") usando estrutura completa do squad.
- **Agentes acionados:** 🗂️ Intake → ✍️ Creator → 🎨 Visual Director → 🖼️ Creative Renderer → 🧪 Reviewer
- **Skills utilizadas:** copywriting, creative-director, social-visual-system, social-single-post
- **Formato:** Instagram Post Estático, estilo Dark Premium
- **Resultado:** Copy e preview HTML gerados, revisão aprovada (APPROVE, 67/70)
- **Aprendizado:** Pipeline adaptado para asset único funciona bem quando contexto upstream já existe.
- **Skill instalada:** `content-repurposing` (tipo prompt) criada a partir do best-practices existente.

## 2026-04-28 — Pendente: Agente Orquestrador (próxima sessão)

- **Problema:** 15 agentes especializados sem uma interface unificada. Edson precisa saber qual agente ativar para cada tarefa.
- **Solução registrada:** Criar `squads/social-growth/agents/orquestrador.agent.md`
  - Persona: "Chefe de gabinete" do squad — roteia intenções do usuário para o agente correto
  - Mapa agente → função pré-carregado no arquivo
  - Leitura de `state.json` e fila para resumo de contexto
  - Não executa steps da pipeline, apenas roteia comandos
- **Ações futuras:**
  1. Criar `orquestrador.agent.md` (~50 linhas)
  2. Adicionar entrada em `squad-party.csv` como `displayName: Orquestrador`
  3. Não consolidar agentes — 15 é aceitável com orquestrador
- **Decisão:** Não implementar agora, apenas registrar para a próxima sessão.

## 2026-04-28 — Procedimentos transformados em expertise permanente do squad

- **`squad.yaml`** — adicionados `blog-policy.md` e `wordpress-scheduling-cron-policy.md` à seção `data` (agentes passam a carregar as regras automaticamente).
- **`step-06b-publish-to-wordpress.md`** — reescrito com:
  - 2-Step Publishing Flow (cria post → depois aplica Yoast SEO)
  - `yoast_head_json` como campo obrigatório
  - Pós-validação com `post-publish-validator.mjs --fix`
  - Quality criteria expandidos (título ≤55 chars, categoria válida, slug sem __trashed, validação executada)
- **`wagner-wordpress.agent.md`** — reescrito com:
  - Payload `yoast_head_json` documentado
  - 2-step flow como padrão
  - Pós-validação obrigatória
  - Quality criteria atualizados
  - Scripts canônicos: `seo-publish.mjs`, `post-publish-validator.mjs`
- **`pipeline.yaml`** — adicionado `step-06d-validate-seo.md` (etapa de validação pós-publicação).
- **`step-06d-validate-seo.md`** — criado: lê wordpress-status.md, executa validador em cada post, gera relatório consolidado.
- **Scripts parametrizados:** `seo-publish.mjs` e `post-publish-validator.mjs` agora aceitam `--client=nome` para ler credenciais do publishing profile. Fallback para AmiClube se não informado.
- **Cross-client ready:** Para atender novo cliente, basta criar `{cliente}-publishing-profile.md` no diretório `data/` e passar `--client={cliente}` nos scripts.

## 2026-04-28 — deep-fix-blog: correção de links externos, imagens inline e transições

- **Criado** `scripts/deep-fix-blog.mjs` — script especializado nos 3 problemas remanescentes que o validador principal não conseguia resolver automaticamente.
- **Links externos:** Adicionada atribuição Pexels real em 4 artigos (com URL e descrição da imagem de origem).
- **Imagens inline:** Adicionadas imagens dos assets/ com alt text contendo a keyword em 4 artigos.
- **Transições:** Inserção estratégica de palavras de transição no início de parágrafos (Primeiramente, Além disso, Por outro lado, Portanto, etc.) com rateio por função semântica.

| Problema | Antes | Depois |
|----------|-------|--------|
| Links externos ausentes | 10/10 | 4/10 com link real no body; 6/10 com link na seção de atribuição |
| Imagens inline sem alt | 10/10 | 4/10 com imagem no body |
| Transições <25% | 8/10 abaixo | 5/10 ≥25% no body |

**Uso:** `node deep-fix-blog.mjs --all`

## 2026-04-28 — local-blog-validator: varredura e ajuste de artigos .md locais

- **Criado** `scripts/local-blog-validator.mjs` — scanner que lê arquivos .md de blog locais e aplica os mesmos 9 checks (meta desc, título, keyword, links, transições).
- **Auto-fix:** título, keyword no título, keyword na meta desc, keyword na intro, links internos — tudo ajustado diretamente nos arquivos .md.
- **10 artigos escaneados**, 34 correções aplicadas:
  - Títulos encurtados para ≤55 chars
  - Keywords inseridas em titles, meta descs e intros faltantes
  - Links internos adicionados para amiclube.com.br

| Resultado | Antes | Depois |
|-----------|-------|--------|
| 🟢 ≥85% | 0 | 2 |
| 🟡 ≥60% | 1 | 7 |
| 🔴 <60% | 9 | 1 |
| Média geral | 38% | 78% |

- **Pendentes manuais** (em todos os artigos): links externos, imagens com alt text, transições ≥25%.
- **Uso:** `node local-blog-validator.mjs [--fix]`

## 2026-04-28 — Post-publish validator refinado: safety net, não mecanismo principal

- **Abordagem revisada:** O validador é um safety net de última milha. O mecanismo principal de qualidade é preventivo (Writer + Reviewer).
- **Checkers separados em 2 categorias:**
  - 🔴 **Críticos (auto-fix seguro):** meta description comprimento/conteúdo, título SEO comprimento/conteúdo, slug, categoria, links internos — todos com auto-fix via re-POST.
  - 🟡 **Informativos (apenas reporta):** links externos, imagens com alt, transições, focus keyword vazia, keyword na introdução — sem auto-fix, requerem curadoria humana.
- **Score composto:** pontuação de 0-100%. ≥85% = aprovado, ≥60% = atenção, <60% = rejeitado.
- **Modo --silent:** quando chamado pelo seo-publish.mjs (integração), exibe apenas o score final e eventuais auto-fixes.
- **Uso:** `node post-publish-validator.mjs --post-id <id> [--fix] [--silent]`

## 2026-04-28 — Post-publish validator: rotina de pós-validação Yoast

- **Criado** `scripts/post-publish-validator.mjs` — script autônomo que lê um post do WordPress e roda 12 checks equivalentes ao Yoast:
  1. Focus keyword definida
  2. Título SEO ≤55 chars
  3. Keyword no título SEO
  4. Meta description 120-160 chars
  5. Keyword na meta description
  6. Keyword no slug
  7. Links internos ≥1
  8. Links externos ≥1
  9. Imagens com alt text ≥1
  10. Keyword na introdução (1º parágrafo)
  11. Categoria definida (não Uncategorized)
  12. Palavras de transição ≥25%
- **Auto-fix:** Corrige automaticamente título, descrição, slug, keyword no título/desc/intro, e categorias. Links externos e transições exigem intervenção manual.
- **Integrado** ao `seo-publish.mjs` — roda automaticamente após cada post ser enviado, chamando o validador com `--fix`.
- **Uso manual:** `node post-publish-validator.mjs --post-id <id> --fix`
- **Resultado pós-correção:** 4 posts com SEO titles corretos, slugs com keyword, metadescs com keyword, introduções com keyword, categorias corretas.

## 2026-04-28 — Correção: palavras de transição + título SEO ≤55 chars + fluxo 2-step

- **Problema 1:** Posts publicados tinham ~16% de frases com palavras de transição (Yoast exige ≥30%).
- **Problema 2:** Título SEO extrapolava o limite visível do Yoast (>600px / ~55 chars).
- **Problema 3:** `_yoast_wpseo_title` não era salvo na criação de posts novos (apenas na atualização), porque o `update_callback` do `register_rest_field` não era chamado durante POST para `/posts` (criação), apenas para `/posts/{id}` (atualização).
- **Solução fluxo:** `publishPost` agora usa **2 chamadas**: (1) cria post sem yoast_head_json, (2) atualiza com yoast_head_json. Isso garante que o update_callback dispare.
- **Solução título:** Todos os títulos SEO encurtados para ≤55 chars (ex: "Escolher amigurumi com critério: guia | AmiClube").
- **Solução transição:** Adicionadas palavras de transição no conteúdo dos posts da semana 2 (Além disso, Portanto, Por exemplo, Por outro lado, Em suma, Primeiramente, Contudo).
- **Pipeline:** Adicionado ao `step-03d` referência de palavras de transição + validação de título ≤55 chars; adicionado ao `step-04` critério de qualidade correspondente.
- **Política:** `blog-policy.md` agora exige ≥30% frases com transição.

## 2026-04-28 — Correção: categorias WordPress obrigatórias no `seo-publish.mjs`

- **Problema:** Posts publicados via script direto (sem passar pelo Wagner WordPress) ficavam sem categoria (ID 1 = Uncategorized).
- **Causa:** `seo-publish.mjs` não enviava `categories` no payload REST.
- **Solução:** Adicionado campo `categories` a cada post no script, mais validação de rejeição se `categories` estiver vazio.
- **Mapeamento:** `CATEGORY_MAP` fixo no script (Blog=5, Escolha e Ergonomia=273, Preço Valor e Tendências=274, Confiança e Reputação=275, Compra e Conversão=276).
- **Atualizado:** `wordpress-scheduling-cron-policy.md` com rejection criteria para categorias faltantes e payload de exemplo com `categories`.
- **Regra estabelecida:** Todo POST para `/wp/v2/posts/{id}` deve incluir `categories: [id]`. O script `seo-publish.mjs` rejeita posts sem categorias antes de enviar.

## 2026-04-28 — Bridge Yoast SEO via REST API + Script Canônico

- **Problema:** Os campos `_yoast_wpseo_focuskw`, `_yoast_wpseo_title`, `_yoast_wpseo_metadesc` não são registrados com `show_in_rest`, portanto o REST API do WordPress ignora qualquer tentativa de salvá-los via `meta._yoast_wpseo_*`.
- **Solução implementada:** Código `register_rest_field('post', 'yoast_head_json', ['update_callback' => ...])` no `functions.php` do tema (Hello Elementor) que intercepta o campo `yoast_head_json` e persiste nos metadados do Yoast.
- **Script canônico:** `scripts/seo-publish.mjs` — unifica conteúdo, slug, featured_media, data, status E `yoast_head_json` em uma única chamada POST para `/wp/v2/posts/{id}`.
- **Regras de envio:**
  - `yoast_head_json.focuskw` → `_yoast_wpseo_focuskw`
  - `yoast_head_json.title` → `_yoast_wpseo_title` (saída no `<title>`)
  - `yoast_head_json.metadesc` → `_yoast_wpseo_metadesc` (saída no `<meta name="description">`)
  - O slug deve SEMPRE ser enviado explicitamente no POST (posts com slug `__trashed-*` são restos de lixeira).
  - Posts em status `trash` precisam ser restaurados para `future` ANTES de editar.
- **Aprendizado:** Após configurar o `register_rest_field` no servidor, a automação flui sem intervenção manual.
- **Decisão:** Manter `seo-publish.mjs` como script canônico de publicação; remover scripts de teste fragmentados.

## 2026-04-26 - Semana 4 social ampliada com carrosséis de descoberta

- **Escopo:** criação de `AC-30-17` e `AC-30-18` como carrosséis de descoberta, cada um com preview canônico próprio e sem inventar novo formato.
- **Direção aplicada:** `AC-30-17` virou checklist de qualidade antes do preço; `AC-30-18` virou mitos/fatos sobre o que sustenta a leitura de premium.
- **Ajuste importante:** ambos foram renderizados dentro do envelope reduzido de preview social para não ocupar a área útil inteira da tela.
- **Próximo passo:** exportar, validar e sincronizar o hub canônico para checkpoint do usuário.

## 2026-05-02 — Planejamento: Estratégia de Geração de Imagens DALL-E

- **Status:** Pendente de implementação
- **Decisão:** Otimizar geração de imagens para posts sociais usando estratégia de "Primeira Impressão" — slide 1 do carrossel com imagem DALL-E, slides seguintes com tipografia editorial.
- **Documento completo:** `_memory/image-generation-strategy.md`
- **Economia estimada:** ~32-40 → ~12-15 imagens/mês (65% redução de créditos)
- **Próximo ciclo de revisão:** Quando a campanha atingir semana 4 (aproximadamente 27/05) ou quando nova campanha for iniciada
- **Trigger para implementação:**
  1. Definir cenário preferido (A: misto Pexels+DALL-E, B: DALL-E puro, C: priorizado por prioridade)
  2. Estabelecer alocação de créditos por cliente (AmiClube vs Portal de Mídias)
  3. Atualizar Visual Director com gate de Primeira Impressão
  4. Implementar no próximo ciclo de campanha
- **Responsável:** Edson (decisão), Atlas (orquestração)
