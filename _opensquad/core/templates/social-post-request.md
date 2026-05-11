# Solicitação: [CRIAR NOVO | REGERAR] asset social para cliente {cliente}

## 1. Contexto do Pedido

- **Tipo de solicitação:** [criar novo asset | regenerar asset aprovado | editar copy | editar visual]
- **Asset ID:** [AC-30-XX] (se já existe) ou [novo — definir ID conforme editorial-backlog]
- **Canal / Formato:** [Instagram Carrossel | Instagram Post Estático | Instagram Stories | Instagram Reels | Facebook Post | LinkedIn Carousel | Pinterest Pin]
- **Artigo-pai (se derivado de blog):** [AC-30-YYB — título ou slug]
- **Tema / Tese central:** [1 frase que resume o post]
- **Objetivo:** [engajamento | salvamentos | cliques | autoridade | conversão]
- **Motivo da regeneração (se aplicável):** [o que não funcionou na versão anterior]

## 2. Copy e Conteúdo

- **Headline / Gancho:** [texto do gancho — ou delegar ao Creator]
- **Body / On-screen text:** [copy dos slides/frames — ou delegar ao Creator]
- **CTA:** [texto e tipo do CTA]
- **Hashtags:** [ou delegar ao Creator]

## 3. Direção Visual (se asset novo ou mudança de estilo)

- **Visual Style (da Visual Styles Library):** [Dark Premium | Editorial Magazine | High-Energy Cyber | Minimalist Texture | Authentic Rough | Motion Social] — ou delegar ao Visual Director
- **Composição:** [image-led | typography-led | mixed]
- **Imagem de fundo:** [usar imagem do blog em output/{cliente}/blog/assets/ | texture-only | no-image-justified com motivo]
- **Referência / Baseline:** [caminho de asset aprovado anterior ou "não disponível"]

## 4. Roteamento (Atlas decide, mas declare a intenção)

- **Rota esperada:** [pipeline completa | fast-track]
  - Pipeline completa: asset novo OU muda formato/skill visual
  - Fast-track: regeneração sem mudança de formato, dimensões, skill visual ou decisão de imagem

## 5. Regras Obrigatórias (invioláveis)

1. **Client Creative DNA Acceptance:** o Visual Director deve validar o estilo contra `creative-dna.md` e `creative-dna-acceptance.json` do cliente
2. **Visual Production Gate completo:** VDC + RCC + Review Gate + HTML-PNG Sync Gate
3. **First Impression Diversity:** a capa/primeiro frame deve variar em pelo menos 2 fatores dos últimos 3 assets do cliente
4. **Skill Invocation Ledger:** provar que as skills foram carregadas e aplicadas
5. **Pipeline Compliance Audit:** obrigatório antes de qualquer checkpoint
6. **Ortografia pt-BR:** copy final com acentuação correta — texto sem acento é veto
7. **Quem executa não aprova:** Reviewer deve ser agente separado do executor

## 6. Agentes Esperados

| Agente | Responsabilidade | Artefato |
|--------|-----------------|----------|
| Content Repurposer / Creator | Copy/caption adaptada por plataforma | Draft `.md` |
| Visual Director | Direção visual + VDC completo | `visual-decision-cards/{id}-vdc.md` |
| Creative Renderer | HTML canônico + RCC | `social/previews/{id}.html` |
| Reviewer | Validação independente | `review/{id}-review.md` |
| Pipeline Auditor | Conformidade da pipeline | Compliance Report |

## 7. Formato e Dimensões

| Formato | Canvas Final | Skill Nativa |
|---------|-------------|--------------|
| Instagram Carrossel | 1080×1350 | instagram-carousel |
| Instagram Post Estático | 1080×1350 | social-single-post |
| Instagram Stories | 1080×1920 | stories-sequence |
| Instagram Reels | 1080×1920 | reels-sequence |
| Facebook Post | 1200×630 | facebook-post |
| LinkedIn Carousel | 1080×1080 | linkedin-carousel |
| Pinterest Pin | 1000×1500 | pinterest-pin |

## 8. Output Esperado

1. Draft salvo em `output/{cliente}/social/drafts/{asset-id}.md`
2. VDC salvo em `output/{cliente}/visual-decision-cards/{asset-id}-vdc-v{N}.md`
3. HTML preview em `output/{cliente}/social/previews/{asset-id}.html`
4. RCC salvo em `output/{cliente}/visual-decision-cards/{asset-id}-rcc-v{N}.md`
5. Review salvo em `output/{cliente}/review/{asset-id}-review.md`
6. PNGs exportados em `output/{cliente}/social/publish/{asset-id}/`
7. Campaign Hub atualizado
8. Pipeline Compliance Report com status `PASS` ou `PASS_WITH_WARNINGS`

---

## Versão Rápida (para uso cotidiano)

```
Cria um post social para o AmiClube:
- Asset: [ID ou "novo"]
- Formato: [carrossel | post estático | stories | reels | facebook]
- Tema: [1 frase]
- Artigo-pai: [AC-30-XXB ou "sem artigo"]
- Versão: [novo | regenerar v{N} — motivo]

Siga a pipeline completa com VDC, RCC, Reviewer separado e Pipeline Auditor. Respeite o Creative DNA do AmiClube, o Visual Production Gate e a First Impression Diversity. Copy em pt-BR com acentuação correta. Mostre o execution card antes de executar.
```

---

## Instrução Final para Atlas

Aplique a Delivery Routing Policy. Se a rota for pipeline completa, convoque Visual Director → Creative Renderer → Reviewer → Pipeline Auditor com handoff claro. Se for fast-track, convoque apenas Creative Renderer → Reviewer → Pipeline Auditor. Apresente o execution card e aguarde confirmação antes de qualquer alteração em arquivos.