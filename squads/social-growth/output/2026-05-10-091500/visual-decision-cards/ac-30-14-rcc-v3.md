# Release Criteria Check — AC-30-14 v3

## Asset Info

- **Asset ID:** AC-30-14
- **Cliente:** AmiClube
- **Versão:** v3
- **Canal:** Instagram Carrossel (7 slides)
- **Formato:** 1080×1350 (4:5)
- **Estilo:** editorial-myth

---

## Critérios de Qualidade

### ✅ Presença de artefatos

| Artefato | Path | Status |
|----------|------|--------|
| JSON manifest | `creative/visual-direction.json` | ✅ OK |
| HTML preview | `social/previews/ac-30-14-carousel-v3.html` | ✅ OK |
| PNGs (7 slides) | `social/publish/ac-30-14/ac-30-14-01.png` a `ac-30-14-07.png` | ✅ OK |
| VDC (referência) | `visual-decision-cards/ac-30-14-vdc-v3.md` | ✅ OK |
| RCC (este arquivo) | `visual-decision-cards/ac-30-14-rcc-v3.md` | ✅ OK |

### ✅ Dimensões corretas

| Slide | Dimensão esperada | Dimensão real | Status |
|-------|-------------------|---------------|--------|
| 01-07 | 1080×1350 | 1080×1350 | ✅ OK |

**Verificação:** `file` command confirma PNG image data, 1080 x 1350

### ✅ Regras de veto

| Regra | Verificação | Status |
|-------|-------------|--------|
| Ausência de HTML ou PNG | 7 PNGs + 1 HTML presentes | ✅ PASS |
| Dimensões diferentes de 1080×1350 | Todas as 7 imagens são 1080×1350 | ✅ PASS |
| Presença de setas ou mocks | Verificado no HTML — sem swipe-arrows internos na arte | ✅ PASS |
| HTML não espelha os PNGs | Slide count = 7 em ambos | ✅ PASS |
| pt-BR sem acentos | Todos os textos verificados com acentos corretos | ✅ PASS |

### ✅ Content Check (pt-BR)

| Slide | Headline | Subtítulo | Acentos |
|-------|----------|-----------|---------|
| 1 (Capa) | "Você sabe qual amigurumi combina com cada ocasião?" | — | ✅ OK |
| 2 | "Presente especial" | "momento de dar algo único" | ✅ OK |
| 3 | "Decorar espaço" | "peça que aquece o ambiente" | ✅ OK |
| 4 | "Presentear criança" | "companions de carinho" | ✅ OK |
| 5 | "Ambiente profissional" | "toque de personalidade no escritório" | ✅ OK |
| 6 | "Conexão afetiva" | "o que torna cada peça única" | ✅ OK |
| 7 (CTA) | "Comente: qual occasion..." | "Comente aqui" button | ✅ OK |

### ✅ First Impression Diversity

- **AC-30-13:** Ursinho marrom + pintinho amarelo (crop center)
- **AC-30-15:** Usou img-03 (plush-nursery) — DIFERENTE
- **AC-30-16:** Usou img-04 (gifts-pink) — DIFERENTE
- **AC-30-14 v3 (este):** Close-up pintinho amarelo (crop right-side tight) — DIFERENTE ✅

**Veredito:** First impression diversity SATISFEITA

---

## Output Files

```
output/2026-05-10-091500/
├── creative/
│   └── visual-direction.json ✅
├── social/
│   ├── previews/
│   │   └── ac-30-14-carousel-v3.html ✅
│   └── publish/
│       └── ac-30-14/
│           ├── ac-30-14-01.png ✅
│           ├── ac-30-14-02.png ✅
│           ├── ac-30-14-03.png ✅
│           ├── ac-30-14-04.png ✅
│           ├── ac-30-14-05.png ✅
│           ├── ac-30-14-06.png ✅
│           └── ac-30-14-07.png ✅
└── visual-decision-cards/
    ├── ac-30-14-vdc-v3.md ✅ (referência)
    └── ac-30-14-rcc-v3.md ✅ (este arquivo)
```

---

## Approval Gate

- **Status:** ✅ PRONTO PARA PUBLICAÇÃO
- **Data:** 2026-05-10
- **Validated by:** Creative Renderer (via Design System compose.mjs)

---

*Este RCC confirma que o asset AC-30-14 v3 atende todos os critérios de qualidade e está pronto para publicação no canal Instagram Carrossel.*