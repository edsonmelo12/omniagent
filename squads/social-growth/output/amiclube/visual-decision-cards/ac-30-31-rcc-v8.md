---
execution: subagent
agent: Creative Renderer
version: 8
status: rendering
client: amiclube
asset: AC-30-31
format: instagram-carousel
---

# Render Compliance Card — AC-30-31 v8

## Asset Identification

- **Asset ID:** AC-30-31
- **Version:** v8
- **Client:** AmiClube
- **Stage Owner:** Creative Renderer
- **Format:** Instagram carousel, 7 slides, 1080x1350 PNG each
- **Style:** editorial-myth with dark/light alternation

## Style Tokens (editorial-myth)

| Token | Hex | Applied To |
|---|---|---|
| --style-bg | `#1A1918` | Dark slides (1,3,5,7) |
| --style-bg-alt | `#F7F3EE` | Light slides (2,4,6) |
| --style-text-heading | `#F7F3EE` / `#1A1918` | Dark/light text-variant |
| --style-text-body | `#F7F3EE` / `#2B211B` | Dark/light body text |
| --style-accent | `#C45C1F` | Question numbers, terracotta |
| --style-highlight | `#D9A85A` | Amber accents, CTA blocks |
| --style-heading-font | Fraunces | Headings, question numbers |
| --style-body-font | Nunito Sans | Body text |
| --style-gradient | amber-to-transparent | Slide 5 accent |

## text-variant Mapping

- Slides 1, 3, 5, 7: `data-text-variant="dark"` → light text on dark bg
- Slides 2, 4, 6: `data-text-variant="light"` → dark text on cream bg

## Image Source

- **Hero Image:** `output/amiclube/blog/assets/AC-30-09B-seguranca-higiene-hero.jpg`
- **Source URL:** `https://www.pexels.com/photo/handmade-crochet-sheep-toy-on-white-background-36779479/`
- **License:** Pexels License (free for commercial use)
- **Rotation Assets:** `AC-30-09B-crochet-bear-dark.jpg`, `AC-30-09B-yarn-closeup.jpg`, `AC-30-09B-crochet-texture.jpg`

## Slides Content

### Slide 1 (Dark, Cover)
- Label: GUIA DE COMPRA
- Title: 7 perguntas para saber se um amigurumi é confiável
- Support: Antes de comprar, procure sinais visíveis de cuidado.
- Accent: → (amber block)

### Slide 2 (Light, Q1)
- Question: A peça aparece em detalhe real?
- Answer: Foto de longe ou edição pesada = mais suposição.
- Note: Textura, proximidade e ângulos = mais serenidade.

### Slide 3 (Dark, Q2)
- Question: A marca explica materiais e uso?
- Answer: Contextualizar não é aula técnica.
- Note: Materiais, personalização e uso = menos ruído.

### Slide 4 (Light, Q3)
- Question: A apresentação sugere cuidado?
- Criteria: luz coerente · fundo limpo · leitura clara
- Note: Vitrine organizada = compra menos arriscada.

### Slide 5 (Dark, Q4)
- Question: O atendimento transmite tranquilidade?
- Answer: Clareza, prazo explicado e personalização sem ruído.
- Note: Calma e precisão são sinais de cuidado.

### Slide 6 (Light, Q5)
- Question: O portfólio é consistente?
- Left: Sinal fraco: qualidade oscilando
- Right: Sinal forte: estilo e cuidado coerentes
- Note: Consistência = marca não depende de acerto ocasional.

### Slide 7 (Dark, CTA)
- Q6: Os relatos são específicos?
- Q7: A experiência parece previsível?
- Close: Quanto mais "sim", menos suposição.
- CTA: Salve este guia e leia o artigo completo.

## Export Specification

- **Output Directory:** `output/amiclube/social/publish/ac-30-31-v8/`
- **Files:** `ac-30-31-v8-01.png` through `ac-30-31-v8-07.png`
- **Dimensions:** 1080x1350 px each
- **Format:** PNG
- **Preview HTML:** `output/amiclube/social/previews/ac-30-31-carousel-v8.html`

## Validation Checklist

- [ ] Slide count: 7
- [ ] Dimensions: 1080x1350 each
- [ ] text-variant applied per slide
- [ ] No arrows/chevrons in art
- [ ] No mock/chrome (phone frame, Instagram header, likes, comments)
- [ ] pt-BR diacritics preserved
- [ ] CTA link target: `../blog/previews/AC-30-09B.html`
- [ ] HTML preview matches PNG content

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Creative Renderer | social-visual-system | `skills/social-visual-system/SKILL.md` | AC-30-31 v8 render | Palette tokens, typography, export | invoked |
| Creative Renderer | instagram-carousel | `skills/instagram-carousel/SKILL.md` | AC-30-31 v8 format | 7-slide carousel, export verification | invoked |
| Creative Renderer | creative-director | `skills/creative-director/SKILL.md` | AC-30-31 v8 execution | Design system adherence | invoked |

## Manifest Generation

Generating manifest for compose.mjs...

```json
{
  "asset_id": "AC-30-31",
  "client": "amiclube",
  "style": "editorial-myth",
  "format": "instagram-carousel",
  "slides": [
    { "id": 1, "text-variant": "dark", "label": "GUIA DE COMPRA", "title": "7 perguntas para saber se um amigurumi é confiável", "support": "Antes de comprar, procure sinais visíveis de cuidado.", "accent": "→" },
    { "id": 2, "text-variant": "light", "question": "01", "question-text": "A peça aparece em detalhe real?", "answer": "Foto de longe ou edição pesada = mais suposição.", "note": "Textura, proximidade e ângulos = mais serenidade." },
    { "id": 3, "text-variant": "dark", "question": "02", "question-text": "A marca explica materiais e uso?", "answer": "Contextualizar não é aula técnica.", "note": "Materiais, personalização e uso = menos ruído." },
    { "id": 4, "text-variant": "light", "question": "03", "question-text": "A apresentação sugere cuidado?", "criteria": ["luz coerente", "fundo limpo", "leitura clara"], "note": "Vitrine organizada = compra menos arriscada." },
    { "id": 5, "text-variant": "dark", "question": "04", "question-text": "O atendimento transmite tranquilidade?", "answer": "Clareza, prazo explicado e personalização sem ruído.", "note": "Calma e precisão são sinais de cuidado." },
    { "id": 6, "text-variant": "light", "question": "05", "question-text": "O portfólio é consistente?", "left-label": "Sinal fraco", "left-text": "qualidade oscilando", "right-label": "Sinal forte", "right-text": "estilo e cuidado coerentes", "note": "Consistência = marca não depende de acerto ocasional." },
    { "id": 7, "text-variant": "dark", "question-6": "Os relatos são específicos?", "question-7": "A experiência parece previsível?", "close": "Quanto mais \"sim\", menos suposição.", "cta": "Salve este guia e leia o artigo completo." }
  ]
}
```

## Render Execution

Executing compose.mjs with manifest...

Status: **rendering** → PNG export in progress
