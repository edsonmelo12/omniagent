# Gate Verification — AC-30-02 v2

**Asset:** AC-30-02 · 5 Sinais de um Amigurumi Premium
**Platform:** Instagram Carousel (7 slides, 1080×1350)
**Date:** 2026-05-02
**Auditor:** Pipeline Reviewer

---

## Gate 1: Brief Alignment
| Check | Result |
|---|---|
| asset_id matches draft | PASS |
| platform = Instagram | PASS |
| type = carrossel | PASS |
| derived_from_article = AC-30-01 | PASS |
| article_url resolved | PASS → `https://amiclube.com.br/escolher-com-criterio` |
| objective = Descoberta | PASS |
| 7 slides | PASS |

**Gate 1: PASS**

---

## Gate 2: Article Link Distribution
| Check | Result |
|---|---|
| article_url not null | PASS |
| link_strategy = link_na_bio | PASS |
| Last slide CTA says "link na bio" | PASS |
| Caption says "link da bio" | PASS |

**Gate 2: PASS**

---

## Gate 3: Source/Image Match
| Check | Result |
|---|---|
| Hero image path | `AC-30-01-escolher-com-criterio-hero.jpg` |
| Image file exists | PASS |
| All 7 slides use same source image | PASS |
| No foreign/wrong image references | PASS |

**Gate 3: PASS**

---

## Gate 4: Layout/Ratio
| Check | Result |
|---|---|
| aspect-ratio | `1080 / 1350` (4:5) — PASS |
| Frame width (preview) | `360px` (scales 1080→360) — PASS |
| Content padding | `34px 30px 28px` — PASS |
| No `space-between` pushing content apart | PASS (flex + `margin-top: auto` on pill-row) |
| No hardcoded heights breaking ratio | PASS |

**Gate 4: PASS**

---

## Gate 5: Creative DNA
| Check | Result |
|---|---|
| Dark overlay with gradient | PASS (`.overlay` with dual gradient) |
| Warm palette (gold/teal/cream) | PASS (`--gold: #D4AF37`, `--teal: #0f766e`) |
| Playfair Display for titles | PASS |
| Proof-led composition (check cards) | PASS |
| Image-led (hero background on all slides) | PASS |
| blur + scale on background for legibility | PASS (8px blur, 1.18 scale) |
| Shield metadata present | PASS |

**Gate 5: PASS**

---

## Gate 6: Copy pt-BR
| Check | Result |
|---|---|
| "invisíveis" (not "invisibles") | PASS |
| "partes" (not "Parts") | PASS |
| No Spanish words ("Estos", etc.) | PASS |
| No English words in copy | PASS |
| All diacritics correct | PASS |

**Gate 6: PASS**

---

## Gate 7: Social Export Rule
| Check | Result |
|---|---|
| No `.mock-header` in HTML | PASS |
| No `.nav` / `.nav-arrow` / `.carousel-nav` in HTML | PASS |
| No "curtir/comentar/compartilhar" buttons | PASS |
| No `.interaction` bar | PASS |
| Navigation via JS only (keydown, mousedown, touchstart) | PASS |
| No HTML buttons for slide navigation | PASS |

**Gate 7: PASS**

---

## Gate 8: Navigation Preview
| Check | Result |
|---|---|
| Keyboard (← →) | PASS |
| Mouse drag | PASS |
| Touch swipe | PASS |
| No UI elements visible in export | PASS |
| Progress bar (design element, not nav) | PASS |

**Gate 8: PASS**

---

## Gate 9: Alignment (NEW — BLOCKING)
| Check | Result |
|---|---|
| Headline centered vertically (all slides) | PASS |
| Check cards centered vertically (slides 2-6) | PASS |
| CTA centered vertically (slide 7) | PASS |
| Brand/kicker absolute top — no flow interference | PASS |
| Pill-row absolute bottom — no flow interference | PASS |
| No `flex-start` or `space-between` on `.content` | PASS |
| No empty space > 30% in center area | PASS |

**Gate 9: PASS**

---

## Gate 10: Final Visual Review
| Check | Result |
|---|---|
| Cover: title + body centered, brand top, pills bottom | PASS |
| Inner slides: check cards centered | PASS |
| CTA slide: card + CTA centered | PASS |
| Text contrast against dark overlay | PASS |
| No visual overlap or clipping | PASS |

**Gate 10: PASS**

---

## Incident Trace Requirement
| Check | Result |
|---|---|
| Related post-approval alignment correction covered | PASS |
| Trace file | `incident-trace-ac-30-03-vertical-alignment.md` |
| AC-30-02 received preventive mitigation from same rule | PASS |
| Alignment rule enforced | PASS |

---

## Verdict

**AC-30-02 v2: APPROVED**

All 10 gates passed. Asset is ready for campaign hub approval and scheduling.

### Changes from v1 → v2
1. Image: wrong source → `AC-30-01-escolher-com-criterio-hero.jpg`
2. Ratio: `360×480` (3:4) → `aspect-ratio: 1080/1350` (4:5)
3. Copy: "invisibles" → "invisíveis", "Parts" → "partes"
4. Overlay: `.bg::before` → separate `.overlay` element with dual gradient
5. Fonts: no import → Google Fonts (DM Sans, Inter, Playfair Display)
6. Slide content: generic signals → specific checklist items (Densidade, Acabamento, Detalhes, Textura, Postura)
7. Draft: `article_url: null` → `https://amiclube.com.br/escolher-com-criterio`
8. Draft: `status: review` → `status: approved`
9. Alignment: all content centered vertically; brand-group top, pill-row bottom via absolute positioning — no flex flow interference
