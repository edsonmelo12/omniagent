# Creative Rules - Amiclube

## Purpose

Este arquivo define as regras visuais e editoriais que a skill deve obedecer ao planejar artes da Amiclube.

O objetivo não é apenas manter consistência de marca. O objetivo é garantir variedade real entre peças, evitando que o lote pareça um template repetido com troca de texto.

## Brand Behavior

A Amiclube deve transmitir:

- clareza
- confiança
- utilidade
- proximidade
- cuidado artesanal
- valor percebido sem exagero

A marca não deve parecer:

- genérica
- excessivamente corporativa
- fria demais
- visualmente carregada
- repetitiva entre peças
- dependente só de texto para convencer

## Visual Priorities

A skill deve priorizar, nesta ordem:

1. legibilidade
2. hierarquia
3. contraste
4. variação de composição
5. coerência de marca
6. acabamento visual

Se houver conflito entre beleza e clareza, a clareza vence.

## Composition Rules

### 1. Every piece needs a different focal logic

Cada peça do lote deve ter um foco principal distinto.

Exemplos de foco:

- headline dominante
- objeto central
- prova visual
- bastidor/processo
- comparação antes/depois
- fechamento manifesto

### 2. Do not reuse the same layout base too often

Evite repetir consecutivamente:

- headline no mesmo lugar
- CTA na mesma posição
- mesmo peso de imagem
- mesma moldura
- mesma proporção de blocos

### 3. Alternate density

O lote precisa alternar entre:

- peças mais densas
- peças mais abertas
- peças com mais texto
- peças com menos texto
- peças mais conceituais
- peças mais diretas

### 4. Use asymmetry intentionally

A composição não precisa ser perfeitamente centralizada o tempo inteiro.

Use assimetria quando:

- quiser mais energia
- quiser parecer editorial
- quiser quebrar a sensação de template

## Typography Rules

A tipografia deve seguir estas regras:

- usar hierarquia clara
- limitar o número de pesos
- evitar blocos de texto grandes sem respiro
- garantir leitura rápida em feed mobile
- deixar o título com impacto suficiente para funcionar sozinho

Não fazer:

- texto pequeno demais
- excesso de caixa alta
- blocos muito longos
- títulos sem contraste suficiente
- múltiplas hierarquias competindo entre si

## Color Rules

A cor deve servir à leitura e ao tom da peça.

Regras:

- usar contraste suficiente entre fundo e texto
- manter uma base de marca consistente
- variar o peso da cor entre peças
- evitar que todo lote tenha a mesma temperatura visual
- usar acento de cor com propósito, não como enfeite

Não fazer:

- paleta monótona em todo lote
- contraste fraco
- excesso de cores saturadas no mesmo frame
- acento colorido sem função

## Texture and Depth Rules

As artes podem usar profundidade, mas sem exagero.

Permitido:

- sombra sutil
- grão leve
- camadas
- recortes
- molduras
- textura de bastidor
- ruído editorial leve

Evitar:

- efeitos gratuitos
- brilho excessivo
- ruído forte demais
- profundidade que prejudica leitura
- elementos decorativos sem função

## Message Rules

A peça deve sempre responder a uma pergunta visual clara:

- o que isso é?
- por que isso importa?
- o que isso prova?
- o que isso evita?
- por que confiar?
- o que fazer agora?

Cada arte precisa de um motivo concreto para existir.

## Batch Rules

### Within a single batch

O lote deve conter variação de estrutura.

Regras:

- não usar a mesma abertura em todas as peças
- não repetir o mesmo tipo de fechamento em sequência
- alternar entre peça de prova, peça de ensino e peça de manifesto
- manter sensação de série, não de cópia

### Across batches

Os lotes seguintes devem evoluir.

Regras:

- batch novo não deve parecer remix leve do anterior
- a direção visual precisa mudar de família ou subfamília
- a repetição só é aceitável se houver motivo estratégico claro

## Quality Threshold

Uma arte só deve ser aprovada se:

- tiver leitura imediata no mobile
- tiver um ponto focal claro
- não parecer igual à peça anterior
- estiver alinhada ao objetivo do lote
- tiver acabamento suficiente para publicação
- contribuir para diversidade do conjunto

Se parecer "bonita mas igual", reprovar.

## Rejection Signals

Rejeitar ou pedir revisão quando a peça:

- usa a mesma composição do asset anterior
- tem pouco contraste
- depende demais de texto para funcionar
- não tem um foco claro
- parece genérica demais
- repete o mesmo mood do lote inteiro
- não tem motivo visual forte

## Default Creative Modes

A skill deve priorizar alternância entre estes modos:

- editorial
- proof-led
- backstage
- manifesto
- comparison
- educational
- closing

### Suggested sequence in a batch

Uma sequência equilibrada pode ser:

1. manifesto
2. prova
3. bastidor
4. fechamento

ou

1. educacional
2. comparação
3. prova
4. manifesto

## Working Definition of "Too Similar"

Duas peças estão “parecidas demais” quando compartilham:

- mesmo centro visual
- mesma distribuição de texto
- mesma temperatura cromática
- mesma lógica de entrada
- mesma densidade
- mesmo tipo de foco

Se 3 ou mais desses itens coincidirem, a skill deve buscar outra direção.

## Vertical Content Alignment Rule

Cada peça social tem 3 zonas verticais:

```
┌─────────────────────────┐
│  ZONA TOPO              │ ← header bar, brand lockup, label (fixo)
├─────────────────────────┤
│                         │
│  ZONA MEIO              │ ← conteúdo criativo: headline, body, bullets
│  ← CENTRALIZAR AQUI     │
│                         │
├─────────────────────────┤
│  ZONA FUNDO             │ ← progress bar, bottom accent (fixo)
└─────────────────────────┘
```

**Regra:** O conteúdo criativo (Zona Meio) deve ser centralizado verticalmente no espaço disponível entre a Zona Topo e a Zona Fundo. Zonas Topo e Fundo permanecem em suas posições naturais.

**CSS obrigatório — estrutura de 3 zonas com divs separadas:**
```css
/* .slide é flex column — justify-content:center centraliza todos os filhos no meio do slide */
.slide { display: flex; flex-direction: column; align-items: center; justify-content: center; }

/* .header-zone = ZONA TOPO — position:absolute no topo */
.header-zone { position: absolute; top: 0; left: 0; right: 0; z-index: 2; padding: 24px 36px 0; }

/* .slide-content = ZONA MEIO — centraliza o conteúdo criativo */
.slide-content { position: relative; z-index: 2; width: 100%; padding: 0 36px; display: flex; flex-direction: column; justify-content: center; }

/* .content-creative = div interno que agrupa headline + body — recebe justify-content:center */
.content-creative { display: flex; flex-direction: column; justify-content: center; }

/* .bottom-accent + .progress-bar = ZONA FUNDO — no fundo do slide via position:absolute */

/* Export mode: escalar fontes na proporção 1080/420 = 2.57x */
/* .headline { font-size: 67px !important; } (26px × 2.57 = 67) */
/* .body-text { font-size: 36px !important; } (14px × 2.57 = 36) */
```

**Estrutura HTML correta — 3 zonas:**
```html
<div class="slide">
  <!-- elementos decorativos: overlay, SVG, circles — position:absolute, z-index:1 -->
  <div class="header-zone">              <!-- ZONA TOPO — fixo no topo -->
    <div class="header-bar">...</div>
    <div class="accent-line">...</div>
  </div>
  <div class="slide-content">           <!-- ZONA MEIO — centralizado no slide -->
    <div class="content-creative">   <!-- conteúdo criativo centralizado -->
      <h1 class="headline">...</h1>
      <p class="body-text">...</p>
    </div>
  </div>
  <div class="bottom-accent">...</div>  <!-- ZONA FUNDO — fixo no fundo -->
  <div class="progress-bar">...</div>   <!-- ZONA FUNDO — fixo no fundo -->
</div>
```

**CSS errado — o que NÃO fazer:**
```css
/* ERRADO: .slide sem justify-content:center */
.slide { display: flex; flex-direction: column; }

/* ERRADO: .slide-content sem display:flex; justify-content:center */
.slide-content { padding: 40px 36px 68px; }

/* ERRADO: .content-creative sem display:flex; justify-content:center */
.content-creative { }

/* ERRADO: misturar zonas dentro do mesmo div — header-bar junto com headline no mesmo div */
.slide-content > div {
  .header-bar { }
  .headline { }  /* ← NÃO — header-bar é zona topo, headline é zona meio */
}
```

## Final Rule

A melhor peça não é a que mais impressiona isoladamente.

É a que:

- comunica melhor
- varia melhor dentro do lote
- reforça a identidade da Amiclube
- mantém o conjunto vivo e não repetitivo
