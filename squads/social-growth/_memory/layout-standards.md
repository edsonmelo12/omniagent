# Layout Standards — Social Assets (AmiClube)

## Purpose

Este documento define as regras de layout CSS e estrutura HTML para todos os assets sociais da squad. Seu objetivo é garantir consistência de alinhamento vertical, escala de fontes no export e renderização limpa em todos os formatos — sem exceções.

---

## Rule 1 — Arquitetura de 3 Zonas

Cada slide/peça social é composto por 3 zonas verticais:

```
┌────────────────────────────────────────┐
│  ZONA TOPO         (header-zone)        │ ← position:absolute, top:0
├────────────────────────────────────────┤
│                                        │
│  ZONA MEIO       (slide-content)        │ ← display:flex, justify-content:center
│    └── conteúdo   (content-creative)    │ ← display:flex, justify-content:center
│                                        │
├────────────────────────────────────────┤
│  ZONA FUNDO      (bottom-accent +      │
│                   progress-bar)         │ ← position:absolute, bottom:0
└────────────────────────────────────────┘
```

**Regras:**
- Cada zona tem uma div wrapper exclusiva. Nunca misturar zonas dentro do mesmo div.
- `.header-zone` e `.progress-bar`/`.bottom-accent` ficam no topo e fundo via `position:absolute`, não interferindo no fluxo do meio.
- `.slide-content` é o container da zona meio — vazio por padrão, só recebe `.content-creative`.

---

## Rule 2 — CSS de Centralização (inviolável)

```css
/* === SLIDE BASE === */
.slide {
  display: flex;
  flex-direction: column;
  align-items: center;          /* centraliza horizontalmente */
  justify-content: center;     /* centraliza todos os filhos no meio vertical */
}

/* === ZONA TOPO === */
.header-zone {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 24px 36px 0;         /* respiro do topo */
}

/* === ZONA MEIO === */
.slide-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0 36px;              /* sem padding-top/bottom — a centralização cuida do espaçamento */
  display: flex;
  flex-direction: column;
  justify-content: center;     /* centraliza .content-creative */
}

.content-creative {
  display: flex;
  flex-direction: column;
  justify-content: center;       /* centraliza o conteúdo criativo */
}

/* === ZONA FUNDO === */
.bottom-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  z-index: 3;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
```

---

## Rule 3 — CSS Errado (o que NÃO fazer)

```css
/* ERRADO: .slide sem justify-content:center — conteúdo vai para o topo */
.slide { display: flex; flex-direction: column; }

/* ERRADO: .slide-content sem display:flex → justify-content não funciona */
.slide-content { padding: 40px 36px 68px; }

/* ERRADO: .content-creative sem display:flex; justify-content:center */
.content-creative { }

/* ERRADO: misturar header-bar + headline no mesmo div interno */
.slide-content > div {
  .header-bar { }   /* ← ZONA TOPO não pertence aqui */
  .headline { }     /* ← ZONA MEIO */
}

/* ERRADO: .slide-content > div com flex:1 — ocupa todo espaço e anula o center do pai */
.slide-content > div { flex: 1; }

/* ERRADO: .slide-content com padding-top/bottom que empurra conteúdo para o topo */
.slide-content { padding: 40px 36px 68px; }
```

---

## Rule 4 — Estrutura HTML Correta

```html
<div class="slide">
  <!-- elementos decorativos: overlay, SVG circles — position:absolute, z-index:1 -->
  <div class="header-zone">             <!-- ZONA TOPO — fixo no topo -->
    <div class="header-bar">...</div>
    <div class="accent-line">...</div>
  </div>

  <div class="slide-content">          <!-- ZONA MEIO — centraliza -->
    <div class="content-creative">    <!-- conteúdo criativo centralizado -->
      <h1 class="headline">...</h1>
      <p class="body-text">...</p>
      <p class="sub-text">...</p>
    </div>
  </div>

  <div class="bottom-accent">...</div>  <!-- ZONA FUNDO — fixo embaixo -->
  <div class="progress-bar">...</div>   <!-- ZONA FUNDO — fixo embaixo -->
</div>
```

**Observações:**
- Não colocar `.header-bar` dentro de `.slide-content` — isso é ZONA TOPO.
- Não colocar `.bottom-accent` ou `.progress-bar` dentro de `.slide-content` — isso é ZONA FUNDO.
- Não usar `flex:1` em nenhum div interno.
- Não usar divs vazias artificiais para forçar alinhamento (`<div></div>` no fundo).

---

## Rule 5 — Fontes: Preview vs. Export

**Preview (420px de largura):**
- Tamanhos em pixel fixo, proporcionais ao viewport de preview.
- Exemplo: `.headline { font-size: 26px; }`

**Export (1080px de largura — ratio ≈ 2.57×):**
- Todas as fontes precisam ser escaladas proporcionalmente.
- Declarar overrides no bloco `body.export-mode` dentro do HTML.

```css
/* === EXPORT MODE — 1080x1350 === */
body.export-mode {
  --slide-w: 1080px;
  --slide-w: 1080px;
  --slide-h: 1350px;
}

body.export-mode .slide { min-width: var(--slide-w); height: var(--slide-h); }
body.export-mode .header-zone { padding: 60px 80px 0; }
body.export-mode .slide-content { padding: 0 80px; }

/* Fontes escaladas (ratio ≈ 2.57× do preview 420px) */
body.export-mode .headline { font-size: 67px !important; line-height: 1.1 !important; margin-bottom: 24px !important; }
body.export-mode .headline.lg { font-size: 77px !important; margin-bottom: 20px !important; }
body.export-mode .headline.sm { font-size: 51px !important; }
body.export-mode .body-text { font-size: 36px !important; line-height: 1.45 !important; }
body.export-mode .sub-text { font-size: 39px !important; max-width: 820px !important; line-height: 1.4 !important; }
body.export-mode .accent-line { width: 103px !important; height: 8px !important; margin-bottom: 31px !important; }
body.export-mode .header-bar .label { font-size: 23px !important; letter-spacing: 3.9px !important; }
body.export-mode .header-bar .num { font-size: 26px !important; }
body.export-mode .tag { font-size: 26px !important; letter-spacing: 5.2px !important; }
body.export-mode .feature-label { font-size: 33px !important; }
body.export-mode .feature-desc { font-size: 28px !important; }
```

**Fórmulas:**
- Ratio para carrosséis/posts: `1080 / 420 = 2.571`
- Ratio para Stories/Reels (preview 380px): `1080 / 380 = 2.842`
- Ratio para Stories/Reels (preview 380px, export 1920px): `1920 / 380 = 5.053`

---

## Rule 6 — CSS de Export-mode Obrigatório

Todo HTML de preview social **precisa** ter um bloco `body.export-mode` no `<style>` com:

1. **`--slide-w`** e **`--slide-h`** — variáveis CSS para o canvas final
2. **Override de dimensões** — `.carousel-viewport`, `.carousel-track`, `.slide` em tamanho final
3. **Override de fontes** — todas as classes tipográficas em pixel fixo para o canvas final
4. **Hide chrome** — elementos de navegação ocultados (`.swipe-arrow`, `.progress-label`, `.preview-dots`, `.controls`, `.header`)
5. **Centralização** — `.slide { justify-content: center }`

```css
/* === EXPORT MODE === */
body.export-mode .swipe-arrow,
body.export-mode .progress-label,
body.export-mode .preview-dots,
body.export-mode .controls,
body.export-mode .header { display: none !important; }
body.export-mode .progress-bar { padding: 0 !important; }
body.export-mode .progress-track { display: none !important; }
body.export-mode .carousel-viewport { border-radius: 0; }
body.export-mode { --slide-w: 1080px; --slide-h: 1350px; }
body.export-mode .carousel-container { width: var(--slide-w); }
body.export-mode .carousel-viewport { width: var(--slide-w); height: var(--slide-h); }
body.export-mode .carousel-track { display: flex; height: var(--slide-h); }
body.export-mode .slide { min-width: var(--slide-w); height: var(--slide-h); }
body.export-mode .slide { justify-content: center !important; align-items: center !important; }
body.export-mode .slide-content { display: flex !important; flex-direction: column !important; justify-content: center !important; }
body.export-mode .content-creative { display: flex !important; flex-direction: column !important; justify-content: center !important; }
body.export-mode .header-zone { position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; z-index: 2 !important; }
```

---

## Rule 7 — Screenshot no Export

**Sempre usar `page.screenshot()` com `clip`, nunca `locator.screenshot()` em elementos com `display:none`.**

**Fluxo de export por frame:**
1. `page.evaluate` → mostrar só o frame ativo (`display: j===idx ? 'flex' : 'none'`) + aplicar dimensões do canvas final
2. `page.evaluate` → adicionar `document.body.classList.add('export-mode')` para ativar CSS de export-mode
3. `page.evaluate` → aplicar `display:flex; justify-content:center` em `.content-creative`
4. `page.waitForTimeout(200)` → aguardar renderização
5. `page.screenshot({ path: out, type: 'png', clip: { x:0, y:0, width:cfg.width, height:cfg.height } })`

**Não usar:**
- `locator.screenshot()` — falha em elementos `display:none`
- `fullPage: true` — captura página inteira, não o canvas
- `page.screenshot()` sem `clip` — captura viewport inteiro com chrome

---

## Checklist de Pré-Export

Antes de exportar qualquer asset social, verificar:

- [ ] HTML tem `.header-zone` separado de `.slide-content`
- [ ] HTML tem `.content-creative` dentro de `.slide-content`
- [ ] HTML tem `body.export-mode` com fontes escaladas
- [ ] `.slide` tem `justify-content: center`
- [ ] `.slide-content` tem `display: flex; justify-content: center`
- [ ] Nenhum div interno tem `flex: 1` ou `flex: auto`
- [ ] Dimensões do canvas final configuradas em `--slide-w` / `--slide-h`
- [ ] Fontes em pixel fixo no `body.export-mode` (headline, body-text, label, etc.)
- [ ] Script de export usa `page.screenshot()` com `clip`, não `locator.screenshot()`

---

## Formatos e Ratios de Escala

| Formato | Preview Width | Export Width | Ratio |
|---|---|---|---|
| Instagram Post (quadrado) | 420px | 1080px | 2.57× |
| Instagram Carousel | 420px | 1080px | 2.57× |
| Instagram Stories | 380px | 1080px | 2.84× |
| Instagram Reels | 380px | 1080px | 2.84× |
| Facebook Post | 638px | 1200px | 1.88× |

| Export Height | Preview Height | Ratio |
|---|---|---|
| Instagram (1080×1350) | 525px | 2.57× |
| Stories/Reels (1080×1920) | 673px | 2.85× |
| Facebook (1200×630) | 336px | 1.87× |
