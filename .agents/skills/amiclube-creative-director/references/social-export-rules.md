# Social Export Rules — Auditoria Obrigatória

## Problema

 preview HTML inclui elementos de interface que NÃO fazem parte do post publicado:

- Mock header (avatar, nome da página)
- Botões de interação (Curtir, Comentar, Compartilhar)
- Navegação de carrossel (setas ← →) **inseridas dentro do container**
- Barra de progresso, timestamps
- Qtd de visualizações/compartilhamentos

Esses elementos são mock apenas para **revisão visual**, não servem para publicação.

---

## Regra (BLOCKING)

### Para EXPORTAÇÃO (imagem final publicável)

Cada asset social DEVE seguir esta estrutura:

```html
<body class="preview-mode">
  <!-- Conteúdo -->
</body>
```

```css
/* Elementos de interface: visíveis apenas em preview */
.mock-header, .carousel-nav, .nav-arrow { display: none; }

/* Preview mode: mostra navegação via teclado */
body.preview-mode { overflow: auto; }
body.preview-mode .frame { cursor: grab; }

/* Export mode: oculta TODO que não é conteúdo real */
body.export-mode .mock-header,
body.export-mode .carousel-nav,
body.export-mode .nav-arrow { display: none !important; }
```

### Navegação de Carrossel/Reels

| Tipo | Preview | Export |
|------|---------|--------|
| Botões ‹ › dentro do carousel | ❌ BLOCKED | Deve estar fora ou via CSS |
| Navegação via teclado (← →) | ✅ Permite | Não aparece no screenshot |
| Dots/progress indicator | ⚠️ Depende | Se for parte do design, mantém |

---

## Auditoria — Checklist (OBRIGATÓRIO)

### block_if (rejeitar)
- [ ] `.nav-arrow` ou `.carousel-nav` dentro do container de imagem
- [ ] Botões de "Curtir/Comentar/Compartilhar" no HTML
- [ ] `.mock-header` com avatar/nome no HTML
- [ ] Elementos de interface aparecem no screenshot de exportação

### pass_if (aprovar)
- [ ] Navegação removida do container (via CSS `display: none`)
- [ ] body usa `preview-mode` (default) ou `export-mode`
- [ ] Screenshot contém apenas slides/frames + CTA
- [ ] Elementos de mock ocultos via `display: none !important`

---

## Implementação Correta

### Preview HTML (para revisão visual)
- Classe `preview-mode` no body
- Navegação existente mas via teclado (← →)
- Mock removido do HTML

### Export (para screenshot)
1. Adicionar `?mode=export` ou mudar classe para `export-mode`
2. Screenshot 2x scale
3. Salvar em `publish/{asset}/`

---

## Exemplo: AC-30-35 Facebook

```
preview/              → ac-30-35-facebook-reputacao.html (mock)
preview/              → ac-30-35-export.html (clean)
publish/ac-30-35/   → ac-30-35-01.png (1200×630)
```

### Clean export NÃO tem:
- ❌ .mock-header
- ❌ .interaction (botões)
- ❌ .nav-arrows

### Clean export TEM:
- ✅ .post (só conteúdo)
- ✅ CTA com link visível
- ✅ branding (quando necessário)

---

## Regra de Alinhamento de Conteúdo (BLOCKING)

O conteúdo principal de todo slide/frame DEVE estar centralizado verticalmente na área útil.
Elementos auxiliares (kickers, timers, contadores de frame, chips) podem ocupar topo/rodapé,
mas headline, argumento, card, grade ou CTA ficam no centro.

### Regra Universal

| Elemento | Posição vertical |
|----------|-----------------|
| Headline / título | **Centro** |
| Argumento / corpo | **Centro** |
| Card de prova / checklist | **Centro** |
| CTA / fechamento | **Centro** |
| Kicker / badge / timer | Topo (auxiliar) |
| Chips / contadores de frame | Rodapé (auxiliar) |

### Padrão CSS (OBRIGATÓRIO)

```css
/* Container: centro é o padrão para TODOS os frames */
.screen {
  position: absolute; inset: 0;
  z-index: 2;
  padding: 28px 24px 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Topline (kicker, timer): fica no topo naturalmente */
.topline { /* flex row, no justify-content override needed */ }

/* Conteúdo principal: agrupar para centralização limpa */
.screen .content {
  /* agrupar headline + body + cards aqui */
}

/* Chips/pills no rodapé */
.chips, .pill-row {
  margin-top: auto;
}

/* CTA / fechamento com texto centralizado */
.screen--cta {
  text-align: center;
}
.screen--cta .content {
  align-items: center;
}
```

### Estrutura HTML Correta

```html
<div class="screen">
  <div class="topline">
    <div class="kicker">LABEL</div>
    <div class="time">0:03</div>
  </div>
  <div class="content">
    <div class="title">Headline no centro</div>
    <div class="body">Argumento no centro</div>
  </div>
  <div class="chips">
    <div class="chip">1/4</div>
  </div>
</div>
```

### Auditoria — Checklist (BLOCKING)

- [ ] Headline está visualmente no centro vertical da área útil
- [ ] Corpo/argumento está visualmente no centro vertical
- [ ] Card/checklist está visualmente no centro vertical
- [ ] CTA está visualmente no centro vertical
- [ ] Topline (kicker/timer) pode ficar no topo — é auxiliar
- [ ] Chips podem ficar no rodapé — são auxiliares
- [ ] Nenhum frame deixa mais de 30% da área central vazia

### Critérios de Rejeição (BLOCK)

- ❌ Headline começa nos primeiros 25% superiores do frame → **BLOCK**
- ❌ Bloco principal (título + corpo) ocupa só metade superior → **BLOCK**
- ❌ `justify-content: flex-start` no container `.screen` → **BLOCK**
- ❌ `justify-content: space-between` no container `.screen` → **BLOCK**
- ❌ Conteúdo informativo "pendurado" no topo → **BLOCK**
- ❌ Apenas CTA centralizado e demais frames no topo → **BLOCK**
- ❌ Frame usa `top`, `align-self: start` ou `padding-top` grande para empurrar conteúdo → **BLOCK**

### Nota

O alinhamento ao topo só é aceitável quando o `.screen` usa `justify-content: center`
e o conteúdo tem múltiplos blocos empilhados que começam no topo.
Nunca usar `flex-start` ou `space-between` como alinhamento do container principal.

---

## Regra de CTA Obrigatório (BLOCKING)

Quando um post social é derivado de artigo e o brief inclui `Article Link Requirement`,
o preview HTML DEVE conter botão ou link visível convidando o leitor ao artigo.

### Trigger

| Condição | Obrigação |
|----------|-----------|
| Brief contém `Article Link Requirement` | CTA visível no card é **obrigatório** |
| Post derivado de blog (`derived_from_article`) | CTA com link para artigo é **obrigatório** |
| Objetivo = Autoridade | CTA para artigo completo reforça posicionamento |

### Implementação Correta

```html
<!-- CTA obrigatório em posts derivados de artigo -->
<a href="URL_DO_ARTIGO" class="cta">Artigo completo →</a>
```

```css
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 10px;
  background: #fff;
  color: #234555;
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
  white-space: nowrap;
  text-decoration: none;
}
```

### Posicionamento

| Elemento | Posição |
|----------|---------|
| Headline | Centro |
| Lead/corpo | Centro |
| Chips | Rodapé (`margin-top: auto`) |
| **CTA artigo** | Após chips, antes do footer |
| Footer (brand + engajamento) | Rodapé |

### Auditoria — Checklist (BLOCKING)

- [ ] Brief contém `Article Link Requirement` → CTA visível presente no card
- [ ] CTA é elemento `<a>` ou `<button>` clicável, não apenas texto
- [ ] CTA contém URL válida do artigo-pai (não placeholder `[URL DO ARTIGO]`)
- [ ] CTA posicionado após chips e antes do footer
- [ ] CTA visualmente destacado (contraste, padding, bordas)

### Critérios de Rejeição (BLOCK)

- ❌ Brief exige link mas card não tem CTA visível → **BLOCK**
- ❌ CTA é apenas texto solto sem botão ou link → **BLOCK**
- ❜ CTA usa placeholder `[URL DO ARTIGO]` sem URL real → **BLOCK**
- ❜ CTA sobreposto a chips ou footer (layout quebrado) → **BLOCK**

---

## Regra de Fidelidade ao Brief (BLOCKING)

Quando o brief de um carrossel lista itens numerados ou seções específicas para cada slide,
o conteúdo gerado DEVE corresponder exatamente ao brief — título e descrição de cada slide.

### Trigger

| Condição | Obrigação |
|----------|-----------|
| Brief lista slides numerados (ex: "Slide 2: sinal 1") | Cada slide deve ter título e descrição exatos do brief |
| Brief contém lista de itens para carrossel | Não inventar temas próprios; seguir o brief literalmente |
| Visual Brief especifica conteúdo por slide | Validar slide-a-slide antes de marcar `ready` |

### Auditoria — Checklist (BLOCKING)

- [ ] Brief lista N itens para N slides → cada slide corresponde ao item do brief
- [ ] Títulos dos slides correspondem ao brief (sem sinônimos inventados)
- [ ] Descrições/copies dos slides preservam o sentido do brief
- [ ] Nenhum slide contém tema inventado não presente no brief

### Critérios de Rejeição (BLOCK)

- ❌ Slide usa tema/título diferente do brief → **BLOCK**
- ❌ Renderer inventou conteúdo próprio ao invés de seguir brief → **BLOCK**
- ❌ Mais slides que itens do brief sem justificativa → **BLOCK**
- ❌ Menos slides que itens do brief (item omitido) → **BLOCK**