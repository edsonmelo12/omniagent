# Visual Decision Card — AC-30-29

## Asset Overview

| Campo | Decisão |
|-------|---------|
| Asset ID | AC-30-29 |
| Cliente | AmiClube |
| Canal / Formato | Instagram Stories, sequência de 3 frames |
| Final Canvas | 1080x1920 px por frame |
| Visual Skill | stories-sequence |
| Direção visual | Minimalist Texture + Organic Image-led |
| Blog Parent | AC-30-13B — “Investimento em Decoração: Artesanal no Home Office” |
| Link público | Não resolvido; não inventar URL no render |
| Imagem-base | `squads/social-growth/output/amiclube/blog/assets/AC-30-13B-home-office-hero.jpg` |
| Status do VDC | Pronto para Creative Renderer |

## Contexto Editorial

AC-30-29 transforma o tema do artigo AC-30-13B em uma sequência interativa para Stories. A peça deve estimular resposta rápida sobre onde a decoração artesanal funciona melhor no home office, sem virar anúncio pesado nem simular interface de enquete dentro da arte final.

## Creative DNA Acceptance

| Critério | Decisão |
|----------|---------|
| DNA obrigatório | Quente, humano, artesanal e útil |
| Estilo aprovado | Minimalist Texture está em `allowed` no contrato de DNA da AmiClube |
| Direção complementar | Organic Image-led está em `allowed` no contrato de DNA e será usado como lógica de composição, não como estética fria ou tecnológica |
| Bloqueios | Bloquear estética cyber, tech, glitch, neon frio, corporativa, estéril ou genérica |
| Justificativa | A imagem do home office, a textura quente e a hierarquia simples reforçam acolhimento, curadoria e utilidade prática, alinhadas à AmiClube |
| Gate | Aprovado para render desde que o renderer preserve calor visual, textura artesanal e legibilidade mobile |

## Visual Production Gate

| Gate | Decisão obrigatória |
|------|---------------------|
| Canvas | 3 frames verticais, cada um em 1080x1920 px, proporção 9:16 |
| Skill | `stories-sequence` |
| Estilo | Minimalist Texture como estilo principal; Organic Image-led como direção de uso da imagem |
| Imagem | Usar hero do artigo como background atmosférico em todos os frames ou como base dominante com variação de crop/overlay |
| Crop | Crop vertical de ambiente de home office, preservando sensação de mesa, estante, peça artesanal e contexto acolhedor quando visíveis |
| Tipografia | Sans geométrica limpa, preferencialmente DM Sans, Montserrat ou equivalente já usado no sistema; pesos 600-800 para títulos e 400-600 para apoio |
| Fonte mínima | 42 px no canvas final; textos secundários preferencialmente entre 46 px e 60 px; labels de opção nunca abaixo de 48 px |
| Paleta | Creme quente `#F7EFE3`, areia `#D8BFA5`, terracota `#B66A45`, marrom café `#3B2A22`, verde sálvia `#8A9A7B`, branco quente `#FFF8EF` |
| Navegação | Preview navegável/agregado com indicador discreto de progresso ou dots; final PNG sem mock de rede social e sem chrome de aplicativo |
| Export validation | Renderer deve validar 3 PNGs finais em 1080x1920 px e registrar evidência no Render Compliance Card |

## First Impression Diversity

| Critério | Declaração |
|----------|------------|
| Base criativa | Não usar outros posts como base visual |
| Primeira impressão | A primeira impressão vem do artigo AC-30-13B e de uma composição editorial nova para Stories |
| Diferença planejada | Frame 1 deve abrir com atmosfera vertical de home office e pergunta central, não com card informativo estático ou layout reaproveitado |
| Recent assets | AC-30-28 e AC-30-30 podem ser consultados apenas como contexto de campanha, não como base de composição |
| Risco de similaridade | Baixo, desde que o renderer use crop vertical, ritmo de Stories e módulos de resposta próprios do asset |
| Continuidade | A continuidade vem do mesmo tema e da hero do artigo; a diversidade vem do formato interativo, centralização vertical e sequência de votação |

## Background Image Decision

| Item | Decisão |
|------|---------|
| Background Image Decision | background-image |
| Background Image Source | `squads/social-growth/output/amiclube/blog/assets/AC-30-13B-home-office-hero.jpg` |
| Motivo | A hero do artigo comunica imediatamente home office, textura artesanal e curadoria de decoração. Como o asset deriva do blog, usar a imagem evita um card genérico e mantém vínculo editorial claro. |
| Tratamento | Full-bleed com crop vertical; overlay quente em marrom/creme entre 35% e 55%; blur sutil opcional apenas nas áreas de texto; preservar textura e ambiente |
| Focal point | Ambiente de home office e detalhes artesanais; evitar cortes que deixem a imagem abstrata demais |
| Legibilidade | Aplicar vinheta ou painel translúcido orgânico somente atrás de texto quando necessário |

## Layout E Composição

| Regra | Direção |
|-------|---------|
| Alinhamento vertical | Conteúdo principal centralizado no eixo vertical de Stories, respeitando áreas seguras superior e inferior |
| Safe area superior | Manter elementos essenciais abaixo de 220 px para evitar conflito com UI do Instagram |
| Safe area inferior | Manter CTA e labels acima de 1720 px para evitar conflito com campo de resposta/controles nativos |
| Margens laterais | Mínimo 86 px; preferir 96 px em textos longos |
| Densidade | Um foco por frame; sem excesso de blocos, selos ou elementos decorativos |
| Elementos orgânicos | Usar caixas arredondadas, textura leve de papel/linho e sombras suaves; evitar geometria tecnológica |
| Proibições | Sem setas dentro da arte, sem mock de rede social, sem slides empilhados, sem URLs inventadas |

## Frame Direction

### Frame 1 — Enquete Editorial

| Elemento | Direção |
|----------|---------|
| Função | Abrir com pergunta de escolha rápida |
| Copy principal | “Qual estilo combina mais?” |
| Opções | “Mesa” e “Estante” |
| Composição | Pergunta central em bloco editorial quente; opções como dois botões/pílulas orgânicas abaixo, equilibradas e sem ícone de seta |
| Imagem | Crop vertical com mais atmosfera e menos detalhe competitivo atrás do título |
| Observação | Não simular sticker de enquete do Instagram; representar apenas a ideia de escolha dentro da linguagem visual da marca |

### Frame 2 — Contexto Útil

| Elemento | Direção |
|----------|---------|
| Função | Explicar o valor do artigo sem depender de link público |
| Copy | “O artigo mostra onde cada opção funciona melhor: mesa, estante ou fundo de câmera.” |
| Composição | Texto em bloco central com respiro amplo; pode usar três microchips textuais: “mesa”, “estante”, “fundo de câmera” |
| Imagem | Mesmo background, com crop ligeiramente deslocado para variar leitura visual |
| Observação | Não usar “Ver artigo completo” se não houver link público resolvido |

### Frame 3 — CTA De Resposta

| Elemento | Direção |
|----------|---------|
| Função | Encerrar com ação simples e conversacional |
| Copy principal | “Vote!” |
| CTA | “Mande a opção no Direct” |
| CTA alternativo permitido | “Votar na enquete” somente se houver enquete nativa aplicada fora da arte pelo social publisher |
| Composição | Título forte central, CTA abaixo em pílula quente; sem seta, sem mock de botão de aplicativo |
| Imagem | Crop mais limpo, com overlay um pouco mais forte para fechamento claro |

## Copy Final Em pt-BR

| Frame | Copy aprovada |
|-------|---------------|
| 1 | “Qual estilo combina mais?” + “Mesa” + “Estante” |
| 2 | “O artigo mostra onde cada opção funciona melhor: mesa, estante ou fundo de câmera.” |
| 3 | “Vote!” + “Mande a opção no Direct” |

Revisão ortográfica: copy em português do Brasil com acentuação correta. Não remover acentos na exportação.

## Typography

| Elemento | Família | Peso | Tamanho recomendado |
|----------|---------|------|---------------------|
| Headline | DM Sans ou Montserrat | 700-800 | 92-118 px |
| Body | DM Sans ou Montserrat | 500-600 | 54-66 px |
| Labels/opções | DM Sans ou Montserrat | 700 | 56-72 px |
| CTA | DM Sans ou Montserrat | 700 | 58-76 px |
| Microtexto, se inevitável | DM Sans ou Montserrat | 500 | mínimo 42 px |

## Palette

| Uso | Cor | Hex |
|-----|-----|-----|
| Texto principal | Branco quente | `#FFF8EF` |
| Texto escuro em pílulas claras | Marrom café | `#3B2A22` |
| Overlay quente | Marrom profundo | `#2F211A` |
| Fundo/painel claro | Creme quente | `#F7EFE3` |
| Destaque artesanal | Terracota | `#B66A45` |
| Apoio natural | Verde sálvia | `#8A9A7B` |
| Sombra suave | Marrom translúcido | `rgba(47, 33, 26, 0.28)` |

## CTA Treatment

| Item | Direção |
|------|---------|
| CTA principal | “Mande a opção no Direct” |
| CTA secundário/operacional | “Votar na enquete” apenas como orientação de publicação, não como seta ou elemento direcional |
| Estilo | Pílula orgânica, alto contraste, sem seta |
| Posição | Área central-inferior segura, acima de 1720 px |
| Tom | Conversacional, leve e direto |

## Navigation / Interaction

| Item | Direção |
|------|---------|
| Preview | Criar preview navegável/agregado com 3 frames, progress dots ou barra discreta, um frame visível por vez |
| Arte final | PNGs estáticos sem controles de UI, sem mock de Stories, sem elementos que pareçam interface nativa falsa |
| Interação real | Publisher pode adicionar enquete nativa do Instagram fora da arte, se desejar; a arte não deve conter seta nem simulação de sticker |

## Export Expectation

| Entrega | Caminho esperado |
|---------|------------------|
| Preview navegável/agregado | `squads/social-growth/output/amiclube/social/previews/ac-30-29.html` |
| PNG Frame 1 | `squads/social-growth/output/amiclube/social/publish/ac-30-29/ac-30-29-frame-1.png` |
| PNG Frame 2 | `squads/social-growth/output/amiclube/social/publish/ac-30-29/ac-30-29-frame-2.png` |
| PNG Frame 3 | `squads/social-growth/output/amiclube/social/publish/ac-30-29/ac-30-29-frame-3.png` |
| RCC | Registrar Render Compliance Card para AC-30-29 junto ao pacote de render ou no arquivo de compliance adotado pela squad |

## Validation Method

O Creative Renderer deve validar antes de enviar para review:

- 3 frames finais, todos com 1080x1920 px.
- Preview HTML com exatamente 3 frames e navegação funcional.
- Copy do preview e dos PNGs igual à copy aprovada neste VDC.
- Ausência de seta dentro da arte.
- Ausência de mock de rede social, chrome falso ou slides empilhados.
- Imagem-base correta e tratada como background atmosférico.
- Fonte mínima respeitada, com menor texto igual ou superior a 42 px.
- Áreas seguras superior e inferior preservadas para Stories.
- Paleta quente, humana e artesanal preservada.
- Link público não inventado.
- Render Compliance Card criado com evidência de canvas, skill, background, tipografia, navegação, export paths e validação de dimensões.

## Orientation To Creative Renderer

Gerar o preview navegável/agregado e os 3 PNGs finais. Criar o Render Compliance Card (RCC) correspondente. Após review aprovado, atualizar o campaign hub conforme o fluxo da squad; não atualizar o hub antes do review.

## Anti-Pattern Compliance

| Regra | Status |
|-------|--------|
| Sem setas dentro da arte | Obrigatório |
| Sem mock de rede social | Obrigatório |
| Sem slides empilhados | Obrigatório |
| Sem estética cyber/tech/fria | Obrigatório |
| Sem URL inventada | Obrigatório |
| Sem usar outros posts como base | Obrigatório |
| Sem texto sem acentuação em pt-BR | Obrigatório |

## Metadata

- **VDC Version:** 2.0.0
- **Created/Updated:** 2026-05-09
- **Created by:** Visual Director — social-growth
- **Next:** Creative Renderer → Reviewer → Campaign Hub update após aprovação
