---
execution: subagent
agent: Creative Renderer
version: 2
status: rendering
client: amiclube
asset: AC-30-10
format: instagram-carousel
---

# Render Compliance Card — AC-30-10 v2

## Asset Identification

- **Asset ID:** AC-30-10
- **Version:** v2
- **Client:** AmiClube
- **Stage Owner:** Creative Renderer
- **Format:** Instagram carousel, 6 slides, 1080x1350 PNG each
- **Style:** Editorial Magazine + Proof Layer

## Style Tokens

| Token | Hex | Applied To |
|---|---|---|
| Ink | `#111827` | export canvas and text contrast |
| Cream | `#f7f3ee` | texture-only slides 2-6 |
| Terracotta | `#c45c1f` | signal labels and accents |
| Amber | `#d9a85a` | CTA and highlight blocks |
| Teal | `#0f766e` | secondary contrast accent |
| Warm Brown | `#b45309` | tonal balance |

## Image Source

- **Hero Image:** `output/amiclube/blog/assets/AC-30-09-reputacao-marca-hero.jpg`
- **Source URL:** `https://www.pexels.com/photo/handmade-crochet-sheep-toy-on-white-background-36779479/`
- **License:** Pexels License (free for commercial use)
- **Use Scope:** slide 1 only
- **Inner Slides:** texture-only, no image reuse

## Slides Content

### Slide 1 (Cover)
- Label: GUIA DE COMPRA
- Title: FOTO BONITA NÃO BASTA
- Support: 5 sinais para avaliar reputação com mais critério antes de comprar.

### Slide 2 (Signal 1)
- Question: A peça aparece em detalhe real?
- Answer: Foto de longe ou edição pesada = mais suposição.
- Note: Textura, proximidade e ângulos = mais serenidade.

### Slide 3 (Signal 2)
- Question: A marca explica materiais e uso?
- Answer: Contextualizar não é aula técnica.
- Note: Materiais, personalização e uso = menos ruído.

### Slide 4 (Signal 3)
- Question: A apresentação sugere cuidado?
- Criteria: luz coerente · fundo limpo · leitura clara
- Note: Vitrine organizada = compra menos arriscada.

### Slide 5 (Signal 4)
- Question: O atendimento transmite tranquilidade?
- Answer: Clareza, prazo explicado e personalização sem ruído.
- Note: Calma e precisão são sinais de cuidado.

### Slide 6 (Signal 5 + CTA)
- Question: O portfólio é consistente?
- Close: Consistência = marca não depende de acerto ocasional.
- Checklist: 7 perguntas rápidas de confiança.
- CTA: Quer saber mais? O link está na bio.

## Export Specification

- **Output Directory:** `output/amiclube/social/publish/ac-30-10/`
- **Files:** `ac-30-10-01.png` through `ac-30-10-06.png`
- **Dimensions:** 1080x1350 px each
- **Format:** PNG
- **Preview HTML:** `output/amiclube/social/previews/ac-30-10-carousel-reputacao.html`

## Validation Checklist

- [ ] Slide count: 6
- [ ] Dimensions: 1080x1350 each
- [ ] Slide 1 uses image; slides 2-6 are texture-only
- [ ] No arrows/chevrons in art
- [ ] No mock/chrome (phone frame, Instagram header, likes, comments)
- [ ] pt-BR diacritics preserved
- [ ] CTA link target: `https://amiclube.com.br/reputacao-marca-artesanal-avaliar-antes-comprar/`
- [ ] HTML preview matches PNG content
- [ ] Caption rendered in post-preview matches `social-final-captions.json`

## Skill Invocation Ledger

| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
| Creative Renderer | social-visual-system | `skills/social-visual-system/SKILL.md` | AC-30-10 v2 render | Typography, textures, export fidelity and no-image inner slides | invoked |
| Creative Renderer | instagram-carousel | `skills/instagram-carousel/SKILL.md` | AC-30-10 v2 format | 6-slide carousel, export verification and preview behavior | invoked |
| Creative Renderer | creative-director | `skills/creative-director/SKILL.md` | AC-30-10 v2 execution | Editorial proof-layer consistency and CTA treatment | invoked |

## Manifest Generation

```json
{
  "asset_id": "AC-30-10",
  "client": "amiclube",
  "style": "Editorial Magazine + Proof Layer",
  "format": "instagram-carousel",
  "slides": [
    { "id": 1, "text-variant": "dark", "label": "GUIA DE COMPRA", "title": "FOTO BONITA NÃO BASTA", "support": "5 sinais para avaliar reputação com mais critério antes de comprar." },
    { "id": 2, "text-variant": "light", "question": "A peça aparece em detalhe real?", "answer": "Foto de longe ou edição pesada = mais suposição.", "note": "Textura, proximidade e ângulos = mais serenidade." },
    { "id": 3, "text-variant": "light", "question": "A marca explica materiais e uso?", "answer": "Contextualizar não é aula técnica.", "note": "Materiais, personalização e uso = menos ruído." },
    { "id": 4, "text-variant": "light", "question": "A apresentação sugere cuidado?", "criteria": ["luz coerente", "fundo limpo", "leitura clara"], "note": "Vitrine organizada = compra menos arriscada." },
    { "id": 5, "text-variant": "light", "question": "O atendimento transmite tranquilidade?", "answer": "Clareza, prazo explicado e personalização sem ruído.", "note": "Calma e precisão são sinais de cuidado." },
    { "id": 6, "text-variant": "light", "question": "O portfólio é consistente?", "close": "Consistência = marca não depende de acerto ocasional.", "cta": "Quer saber mais? O link está na bio." }
  ]
}
```

## Render Execution

Status: **rendering** → export and sync pending
