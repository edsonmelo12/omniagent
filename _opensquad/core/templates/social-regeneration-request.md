# Solicitação: REGENERAR asset social existente

## 1. Identificação do Asset Existente

- **Asset ID:** [AC-30-XX]
- **Versão atual:** [v1, v2, v3... — verificar em visual-decision-cards/]
- **Canal / Formato:** [Instagram Carrossel | Instagram Post Estático | Instagram Stories | Instagram Reels | Facebook Post | LinkedIn Carousel]
- **Skill nativa atual:** [instagram-carousel | stories-sequence | etc.]
- **Data da última criação:** [YYYY-MM-DD]

## 2. Link para Contexto Existente

- **VDC anterior:** `output/{cliente}/visual-decision-cards/{asset-id}-vdc-v{N}.md`
- **RCC anterior:** `output/{cliente}/visual-decision-cards/{asset-id}-rcc-v{N}.md`
- **Review anterior:** `output/{cliente}/review/{asset-id}-review.md`
- **HTML preview:** `output/{cliente}/social/previews/{asset-id}.html`
- **PNGs exportados:** `output/{cliente}/social/publish/{asset-id}/`
- **Artigo-pai (se aplicável):** [AC-30-YYB — título]

## 3. Diagnóstico: Por que precisa regenerar?

Escolha o problema identificado (ou descreva outro):

### Problemas Visuais
- [ ] **Tipografia desproporcional** — texto muito pequeno ou grande no canvas final
- [ ] **Imagem de fundo ruim** — imagem não serve ao post ou está mal posicionada
- [ ] **Estilo desalinhado com DNA** — Visual style não respeita o Creative DNA do cliente
- [ ] **Primeira impressão repetida** — capa igual a assets recentes do cliente (Similarity Risk: HIGH)
- [ ] **Cores erradas** — paleta não corresponde ao estilo selecionado
- [ ] **Layout quebrado** — conteúdo vazado, sobreposição, ou espaço negativo ruim

### Problemas Técnicos
- [ ] **Dimensões erradas** — PNG exportado em tamanho errado (ex: 338×423 em vez de 1080×1350)
- [ ] **HTML-PNG fora de sincronia** — preview HTML não corresponde aos PNGs exportados
- [ ] **Falta navigation** — carrossel/stories sem controles de navegação no preview
- [ ] **Export faltando** — PNGs não foram gerados ou estão corrompidos

### Problemas de Copy
- [ ] **pt-BR incorreto** — acentos faltando ou palavras erradas
- [ ] **CTA fraco** — chamada para ação não clara ou ausente
- [ ] **Copy desatualizado** — mensagem não reflete a estratégia atual

### Problemas de Estratégia
- [ ] **Mudança de direção** — estratégia mudou e o post precisa refletir novo posicionamento
- [ ] **Novo artigo-pai** — post agora deriva de outro artigo
- [ ] **Feedback do cliente** — cliente pediu ajuste

---

## 4. O que precisa mudar? (selecione e detalhe)

### [ ] Mudar Visual Style
- **De:** [estilo atual]
- **Para:** [novo estilo da Visual Styles Library]
- **Motivo:** [por que o estilo atual não funciona]

### [ ] Mudar Formato/Skill
- **De:** [formato atual]
- **Para:** [novo formato]
- **Motivo:** [ex: formato atual não serve ao objetivo]

### [ ] Mudar Imagem de Fundo
- **De:** [imagem atual ou "sem imagem"]
- **Para:** [nova imagem — especificar source: blog assets, nova busca, texture-only, no-image-justified]
- **Motivo:** [por que a imagem atual não serve]

### [ ] Regenerar por Problema Técnico
- **Problema específico:** [ex: dimensões erradas, tipografia desproporcional]
- **Correção esperada:** [descrever o que precisa ser ajustado no HTML/PNG]

### [ ] Regenerar por First Impression
- **Asset recente que repete:** [ID do asset que tem capa semelhante]
- **O que variar:** [imagem/crop | composição | tratamento | cor dominante | densidade | lógica focal]

---

## 5. decisão de Rota

- **Mudança de formato/skill visual?** [SIM → Pipeline Completa | NÃO → Fast-track]
- **Mudança de estilo (Visual Style Library)?** [SIM → Pipeline Completa | NÃO → Fast-track]
- **Rota correta:** [Pipeline Completa | Fast-track]

> **Regra:** Se mudar formato, skill visual ou estilo → Pipeline Completa (Visual Director → Creative Renderer → Reviewer → Pipeline Auditor). Se só regenerar com mesmo formato/dimensões/estilo → Fast-track (Creative Renderer → Reviewer → Pipeline Auditor).

---

## 6. Mantendo ou Mudando?

| Item | Manter (baseline) | Mudar |
|------|-------------------|-------|
| Formato/Canvas | [ ] | [ ] |
| Skill nativa | [ ] | [ ] |
| Visual Style | [ ] | [ ] |
| Imagem de fundo | [ ] | [ ] |
| Copy/Caption | [ ] | [ ] |
| CTA | [ ] | [ ] |

---

## 7. Regras Obrigatórias (invioláveis)

1. **Client Creative DNA Acceptance:** validar novo estilo contra `creative-dna.md` e `creative-dna-acceptance.json`
2. **Baseline Declarado:** no VDC, declarar qual asset aprovado está sendo usado como referência
3. **First Impression Diversity:** nova capa deve variar de pelo menos 2 fatores dos últimos 3 assets
4. **VDC+Novo:** criar novo VDC (v{N+1}) — não editar o antigo
5. **RCC+Novo:** criar novo RCC (v{N+1}) provando compliance
6. **HTML-PNG Sync:** validar que novo HTML corresponde aos novos PNGs
7. **pt-BR:** copy final com acentos corretos — texto sem acento é veto
8. **Separation of Duties:** quem executa não aprova — Reviewer separado
9. **Pipeline Compliance Audit:** mandatory antes do checkpoint

---

## 8. Output Esperado

1. Novo VDC: `visual-decision-cards/{asset-id}-vdc-v{N+1}.md`
2. Novo RCC: `visual-decision-cards/{asset-id}-rcc-v{N+1}.md`
3. Novo HTML preview: `social/previews/{asset-id}-v{N+1}.html` (ou sobrescrever se regeneration-only)
4. Novos PNGs: `social/publish/{asset-id}/` (sobrescrever os antigos)
5. Novo Review: `review/{asset-id}-review-v{N+1}.md`
6. Pipeline Compliance Report com `PASS`
7. Atualizar `campaign-hub.html` com cache-bust da nova versão
8. Atualizar `social-publish-assets.json` com a nova versão

---

## Versão Rápida (para uso cotidiano)

```
Regenera o post AC-30-XX do AmiClube.
- Problema: [tipografia | imagem | dimensões | estilo | first impression | copy]
- O que mudar: [descrever specifics]
- Formato muda? [sim | não]
- Estilo muda? [sim | não]

Rota: [pipeline completa | fast-track]
Mantenha: [o que permanece igual do baseline]
```

---

## Instrução Final para Atlas

1. Leia o VDC e RCC atuais para entender o que foi aprovado
2. Identifique o problema específico que justificam a regeneração
3. Determine a rota correta (pipeline completa vs. fast-track)
4. Execute o fluxo com os agentes adequados
5. Crie novos artefatos com versão incrementada (v{N+1})
6. Apresente execution card com Executor, Reviewer, Skills, Baseline, Arquivos Previstos e Critério de Veto
7. Aguarde confirmação antes de sobrescrever arquivos existentes