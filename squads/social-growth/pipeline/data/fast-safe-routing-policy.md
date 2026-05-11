# Fast-Safe Routing Policy

Esta política acelera a criação de posts sem reduzir os critérios finais de
qualidade. A regra central é simples: reduzir carregamento e etapas redundantes,
não remover gates críticos.

## Princípios

1. Informação permanece disponível, mas é carregada sob demanda.
2. Qualidade final continua protegida por Reviewer e Pipeline Auditor.
3. Todo ativo visual novo mantém VDC, RCC, Skill Invocation Ledger e Client DNA Acceptance.
4. Toda entrega pública em pt-BR deve manter acentos e diacríticos corretos.
5. Se houver dúvida sobre rota, escolher a rota mais segura.

## Rotas

| Rota | Quando usar | Agentes | Gates obrigatórios |
|---|---|---|---|
| `quick_status` | Consulta, agenda, lista de publicados, diagnóstico rápido | Atlas | `state-summary.md`; sem alteração de arquivos |
| `quick_social_copy` | Copy/caption simples sem alteração visual | Creator → Reviewer → Pipeline Auditor `asset_audit` | Skill Ledger, final_caption, pt-BR, Review, Compliance |
| `blog_derived_social` | Social derivado de blog finalizado | Content Repurposer → Visual Director → Creative Renderer → Reviewer → Pipeline Auditor | VDC, RCC, skill nativa seletiva, blog source, Review, Compliance |
| `full_campaign_asset` | Asset/lote novo, novo estilo, novo formato ou mudança estrutural | Creator → Visual Director → Creative Renderer → Reviewer → Pipeline Auditor | Pipeline completa |
| `correction_fast_track` | Correção em asset aprovado sem mudar formato/skill/imagem/estrutura | Executor responsável → Reviewer → Pipeline Auditor `incident_audit` | Incident Trace quando aplicável, Review, Compliance |
| `publishing_preflight` | Publicação/fila sem mudança de copy ou visual | Scheduler → Pipeline Auditor `quick_preflight` | Queue/monitor OK, captions, dry-run/validador, checkpoint |

## Gates Que Não Podem Ser Removidos

- Reviewer separado para entregas publicáveis.
- Pipeline Auditor antes de aprovação, agendamento, publicação ou hub final.
- VDC e RCC para asset visual novo ou mudança visual estrutural.
- Skill Invocation Ledger para Creator, Visual Director, Creative Renderer, Reviewer e Pipeline Auditor quando aplicável.
- Client Creative DNA Acceptance quando existir contrato do cliente.
- Incident Trace para correção pós-aprovação ou defeito reportado.
- Validação de ortografia pt-BR com acentos em conteúdo final.

## Carregamento por Rota

### `quick_status`

Carregar apenas:

- `_opensquad/_memory/preferences.md`
- `squads/social-growth/state-summary.md`
- arquivo específico solicitado, se a resposta depender dele

### `quick_social_copy`

Carregar apenas:

- `output/{client}/client-record.md`, se existir
- fonte do pedido ou blog final quando explicitamente necessário
- `skills/copywriting/SKILL.md`
- `pipeline/data/skill-invocation-gate.md`

### `blog_derived_social`

Carregar apenas:

- blog final aprovado
- `output/{client}/client-record.md`, se existir
- assets do blog relacionados
- `skills/creative-director/SKILL.md`
- `skills/social-visual-system/SKILL.md`
- exatamente uma skill nativa por asset
- gates visuais necessários

### `full_campaign_asset`

Carregar pipeline completa conforme steps, mas ainda com skills nativas seletivas.

## Skill Loading Seletivo

Visual Director e Creative Renderer não devem carregar todas as skills visuais por padrão. Para cada asset, carregar:

1. skills base obrigatórias do agente;
2. exatamente uma skill nativa conforme formato do asset;
3. referências adicionais somente quando citadas no VDC, RCC ou audit packet.

## Critério de Escalonamento

Escalar automaticamente para rota mais completa se qualquer item for verdadeiro:

1. muda formato, dimensão, skill visual ou estrutura;
2. muda decisão de imagem/fundo;
3. muda copy final publicável;
4. altera agenda, publicação, manifest, hub ou memória;
5. existe defeito pós-aprovação;
6. falta evidência para manter fast-track.
