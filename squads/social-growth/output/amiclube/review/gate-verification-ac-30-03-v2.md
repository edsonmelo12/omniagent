# Gate Verification — AC-30-03 v2

**Asset:** AC-30-03 · Erro: focar só no preço
**Platform:** Instagram Reels (4 frames, 1080×1920)
**Date:** 2026-05-02
**Auditor:** Pipeline Reviewer

---

## Gate 1: Brief Alignment
| Check | Result |
|---|---|
| asset_id matches draft | PASS |
| platform = Instagram | PASS |
| type = reels | PASS |
| derived_from_article = AC-30-01 | PASS |
| article_url resolved | PASS → `https://amiclube.com.br/escolher-com-criterio` |
| objective = Descoberta | PASS |
| 4 frames | PASS |

**Gate 1: PASS**

---

## Gate 2: Article Link Distribution
| Check | Result |
|---|---|
| article_url not null | PASS |
| link_strategy = link_na_bio | PASS |
| Last frame CTA says "link na bio" | PASS |
| Caption says "link da bio" | PASS |

**Gate 2: PASS**

---

## Gate 3: Source/Image Match
| Check | Result |
|---|---|
| Hero image path | `AC-30-01-escolher-com-criterio-hero.jpg` |
| Image file exists | PASS |
| All 4 frames use same source image | PASS |
| No foreign/wrong image references | PASS |

**Gate 3: PASS**

---

## Gate 4: Layout/Ratio
| Check | Result |
|---|---|
| aspect-ratio | `9 / 16` (1080×1920) — PASS |
| Frame width (preview) | `360px` (scales 1080→360) — PASS |
| Content padding | `28px 24px 22px` — PASS |
| No hardcoded heights breaking ratio | PASS |
| Phone frame border (`10px solid`) | PASS |

**Gate 4: PASS**

---

## Gate 5: Creative DNA
| Check | Result |
|---|---|
| Dark overlay with dual gradient | PASS |
| Warm palette (warm/coral/teal) | PASS (`--warm: #b45309`, `--accent: #0f766e`) |
| Playfair Display for titles | PASS |
| Proof-led composition (number cards) | PASS |
| Image-led (hero background on all frames) | PASS |
| blur + scale on backgrounds for depth | PASS |
| Shield metadata present | PASS |

**Gate 5: PASS**

---

## Gate 6: Copy pt-BR
| Check | Result |
|---|---|
| No Spanish words | PASS |
| No English words in copy | PASS |
| All diacritics correct (é, ã, ç) | PASS |
| "repetir" not in copy | PASS |

**Gate 6: PASS**

---

## Gate 7: Social Export Rule
| Check | Result |
|---|---|
| No `.mock-header` in HTML | PASS |
| No `.nav` / `.nav-arrow` / `.carousel-nav` in HTML or CSS | PASS |
| No `.prev` / `.next` in CSS | PASS |
| No "curtir/comentar/compartilhar" buttons | PASS |
| Navigation via JS only (keydown, mousedown, touchstart) | PASS |
| JS targets `.frame-container` (not `.carousel`) | PASS |

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
| Headline centered vertically (all frames) | PASS |
| Body/content centered vertically | PASS |
| CTA centered vertically | PASS |
| Topline (kicker/time) absolute top — no flow interference | PASS |
| Chips absolute bottom — no flow interference | PASS |
| No `flex-start` or `space-between` on `.screen` | PASS |
| No empty space > 30% in center area | PASS |

**Gate 9: PASS**

---

## Gate 10: Final Visual Review
| Check | Result |
|---|---|
| Frame 1: hook centered, topline top, chips bottom | PASS |
| Frame 2: PREÇO ≠ QUALIDADE centered | PASS |
| Frame 3: 3 filters grid centered | PASS |
| Frame 4: CTA + body centered | PASS |
| Text contrast against dark overlay | PASS |
| No visual overlap or clipping | PASS |

**Gate 10: PASS**

---

## Incident Trace Requirement
| Check | Result |
|---|---|
| Post-approval correction triggered trace | PASS |
| Wrong preview link trace exists | PASS → `incident-trace-ac-30-03-wrong-preview-link.md` |
| Vertical alignment trace exists | PASS → `incident-trace-ac-30-03-vertical-alignment.md` |
| Origin, why-it-passed, root cause and mitigation documented | PASS |
| Recurrence mitigation enforced in rule files | PASS |

---

## Verdict

**AC-30-03 v2: APPROVED**

All 10 gates passed. Asset is ready for campaign hub approval and scheduling.

### Changes from v1 → v2
1. Image: wrong source → `AC-30-01-escolher-com-criterio-hero.jpg`
2. JS: `.carousel` → `.frame-container` (was targeting wrong element, drag/swipe broken)
3. CTA: "Compartilhar" → "link na bio" (matches brief)
4. Frame 2: gradient only → now uses hero image with blur
5. Draft: `article_url: null` → `https://amiclube.com.br/escolher-com-criterio`
6. Deleted broken `ac-30-03-reels-frames.html` (had CSS syntax error + nav buttons still in CSS)
7. Alignment: all content centered vertically; topline/chips positioned absolutely — no flex flow interference
