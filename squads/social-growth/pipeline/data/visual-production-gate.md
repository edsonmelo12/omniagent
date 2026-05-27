# Visual Production Gate

This gate is mandatory for every social visual asset before it can move from visual direction to rendering, from rendering to review, and from review to export/publication.

The goal is to remove surprise from the creative process. Every asset must declare the design decisions that affect readability, campaign-hub review, export fidelity and final visual quality.

The canonical single checklist for the whole flow lives in `pipeline/data/generation-contract.md`. Use this gate to enforce the VDC/RCC evidence behind that checklist.

## Gate Principle

No social visual asset may advance unless the responsible agent has explicitly declared and validated:

- client creative DNA acceptance;
- final canvas;
- campaign-hub preview behavior;
- **post-preview HTML generated and caption verified;**
- visual skill;
- selected visual style;
- baseline/reference;
- NotebookLM prototype reference, when used;
- first impression diversity;
- background image decision;
- background treatment by slide, including slide 1 and slides 2+;
- typography family and minimum font size;
- typography hierarchy by level, including title, body, caption and CTA;
- color system;
- navigation behavior;
- export validation method.
- regenerated preview HTML and exported PNGs whenever the asset uses a new background image or crop;

Missing decisions are blockers, not suggestions.

## Stage 0 — Client Creative DNA Acceptance Gate

Before choosing or approving any visual style, load the active client's creative DNA and acceptance contract when available:

- `squads/social-growth/output/{client}/creative-dna.md`
- `squads/social-growth/output/{client}/creative-dna-acceptance.json`

The Visual Director must select styles inside the client's creative envelope. Variation is allowed and expected, but it must vary execution, composition, image/crop, density, rhythm or hierarchy without changing the brand's personality.

Rules:

1. If the selected style is in `allowed`, it may advance when the VDC is complete.
2. If the selected style is in `conditional`, it may advance only with a specific justification tied to the client's DNA and asset objective.
3. If the selected style is in `blockedByDefault`, it must be rejected unless explicit user approval is recorded in the VDC.
4. Diversity alone is not a valid reason to leave the client's creative DNA.
5. The Creative Renderer must not render a VDC that fails this gate.
6. The Reviewer must block any asset whose VDC fails this gate, even if the render is technically correct.

Deterministic validation command:

```bash
node squads/social-growth/scripts/validate-creative-dna-acceptance.mjs --client {client} --assets {asset_ids_csv} --version {active_version}
```

## Stage 1 — Visual Decision Gate

The Visual Director must include one completed decision card per asset.

```md
### Visual Decision Card — [asset_id]

- **Asset ID**: [required]
- **Channel / Format**: [required]
- **Visual Skill**: [instagram-carousel | stories-sequence | reels-sequence | facebook-post | linkedin-carousel | social-single-post | pinterest-pin]
- **Final Canvas**: [width x height px]
- **Campaign-Hub Preview**: [max display size, scaling behavior, no-clipping rule]
- **Selected Style**: [exact name from Visual Styles Library]
- **Client DNA Acceptance**: [allowed | conditional + justification | blocked + explicit user approval path]
- **Baseline / Reference**: [approved asset path or explicit `not available` + reason]
- **NLM Prototype Reference**: [not used | path/link + useful elements + discarded elements]
- **Composition Logic**: [image-led | typography-led | mixed]
- **Recent Assets Checked**: [last 3 client assets, or `not available` + reason]
- **Opening Image / Crop**: [image path, crop, focal point, or `not used`]
- **First Impression Role**: [hero | texture | proof | backstage | context | comparison | CTA | typography-led]
- **Difference From Recent Assets**: [image/crop | composition | treatment | color | density | focal logic]
- **Similarity Risk**: [low | medium | high]
- **Continuity Justification**: [required if similarity risk is medium/high]
- **Background Image Decision**: [background-image | texture-only | no-image-justified]
- **Background Image Source**: [existing asset path, external URL/license, or `not used`]
- **Background Image Slids Scope**: [slide-1-only | crop-variation-justified + declaration]
- **Image Treatment**: [crop, blur, overlay, opacity, focal point]
- **Contrast Strategy (slide 1)**: [dark-overlay | light-overlay | gradient-mask | zone-isolation | no-overlay-justified]
- **Text Legibility on Image**: [legible | borderline | fails] + justification if borderline/fails
- **Typography**: [family, weights, title/body/caption sizes]
- **Minimum Font Size**: [px on final canvas]
- **Palette**: [hex values and roles]
- **CTA Treatment**: [position, styling, action]
- **Navigation / Interaction**: [required controls by format]
- **Export Expectation**: [PNG/JPEG count, exact dimensions]
- **Validation Method**: [how renderer/reviewer should verify]
- **Post-Preview Generated**: [yes/no/pending] — URL do HTML + data de geração
- **Caption Sourced From**: [social-final-captions.json | inline] — tracking da origem do caption
- **Caption Integrity**: [match | desync | pending] — compara caption no post-preview com social-final-captions.json
```

### Image Decision Rules

1. **Slide 1 (capa) ONLY** — imagem do blog image bank é alocada exclusivamente no slide 1. Slides 2+ devem usar Design System (texturas, gradientes, padrões, composições tipográficas).
2. Reutilizar a imagem do banco em slides 2+ é permitido SOMENTE com crop variationjustified e declaração explícita no VDC.
3. Se o asset é derivado de blog, verificar `output/{client}/blog/assets/{parent_asset_id}-images.json` e alocar 1 imagem para o slide 1.
4. Se nenhuma imagem é usada, a decisão deve ser `texture-only` ou `no-image-justified` com razão clara.
5. `no-image-justified` é válido apenas quando o conceito visual depende intencionalmente de texto, ícones, diagramas ou contraste tipográfico puro.
6. **Contraste texto vs. imagem** — slide 1 com background-image deve declarar estratégia de contraste: `dark-overlay`, `light-overlay`, `gradient-mask`, `zone-isolation` ou `no-overlay-justified`. Se o overlay compromete legibilidade, justificar explicitamente.
7. Uso genérico de imagem não é permitido. A imagem deve suportar a tese do post, não apenas decorar o frame.
8. Slides 2+ must not inherit a default flat background without an explicit design-system treatment. They must declare `texture-only`, `gradient` or `solid`, and the exported result must show visible variation or a documented reason for continuity.

### First Impression Diversity Rules

1. The first frame, cover or feed-facing thumbnail must be checked against recent client assets before rendering.
2. The opening frame should vary at least two of these factors from recent assets: image/crop, composition, treatment, dominant color, density or focal logic.
3. Reusing a blog image is allowed only when the crop, role or treatment creates a clearly different first impression.
4. A repeated first impression is valid only when continuity is intentional and documented in `Continuity Justification`.
5. If recent assets are unavailable, mark `Recent Assets Checked` as `not available` and still declare the intended difference strategy.

## Stage 2 — Render Compliance Gate

The Creative Renderer must include one completed render compliance card per asset.

```md
### Render Compliance Card — [asset_id]

- **Decision Card Found**: [yes/no]
- **NLM Prototype Used**: [not used | reference_only + path/link]
- **Prototype Elements Preserved**: [sequence | hierarchy | mood | CTA | composition | none]
- **Prototype Elements Discarded**: [watermark | typography | claims | format | generic styling | other]
- **Final Canvas Rendered**: [width x height px]
- **Campaign-Hub Preview Implemented**: [yes/no + behavior]
- **Visual Skill Behavior**: [pass/fail + notes]
- **Background Decision Implemented**: [background-image | texture-only | no-image-justified]
- **Background Source Implemented**: [path/source or `not used`]
- **Image Treatment Implemented**: [crop/overlay/blur/etc.]
- **Image Bank Applied to**: [slide 1 only | crop-variation-justified + slides where]
- **Slides 2+ Background**: [Design System — no image bank reuse | exception declared]
- **Contrast Strategy Implemented**: [pass/fail] + notes
- **Text Legibility Check**: [pass/fail] — texto legível em canvas final
- **Opening Frame Implemented**: [image/crop/focal point/treatment]
- **First Impression Difference Preserved**: [yes/no + notes]
- **Typography Implemented**: [family/weights/sizes]
- **Minimum Font Size Check**: [pass/fail + smallest px]
- **Navigation Check**: [pass/fail + controls]
- **Export Paths**: [HTML and final image paths]
- **Export Dimension Check**: [command/tool/manual note]
- **Post-Preview Generated**: [yes/no/pending] + URL
- **Caption Source Confirmed**: [social-final-captions.json | inline]
- **Caption Integrity Check**: [match | desync | pending] —比对 com social-final-captions.json
- **Status**: [ready | blocked]
```

### Format-Specific Interaction Rules

- `instagram-carousel`: horizontal track or equivalent slide navigation, visible previous/next controls in preview, progress indicator, one slide visible at a time, final canvas 1080x1350 unless otherwise declared.
- `stories-sequence`: vertical 9:16 frames, one idea per frame, progress indicator or frame dots in preview, no fake carousel chrome, final canvas 1080x1920 unless otherwise declared.
- `reels-sequence`: vertical 9:16 scene sequence or frame beats, safe-area-aware text, cover direction when declared, no carousel or story tap-through UI in final output, final canvas 1080x1920 unless otherwise declared.
- `facebook-post`: one Facebook-native static frame, no carousel/Reels/Stories UI, final canvas 1200x630 or 1080x1080 unless otherwise declared.
- `linkedin-carousel`: document-style sequence, no Instagram UI, no fake app chrome, restrained navigation in preview only.
- `social-single-post`: one frame only. Any multi-frame content must be rerouted before render.
- `pinterest-pin`: vertical save-oriented layout, no carousel controls, high scanability.

### Typography Readability Rules

1. The VDC and RCC must declare at least title, body, caption and CTA sizes when text is present.
2. Secondary body or caption copy must be legible at final export size without zooming.
3. If a slide needs to compress below the declared minimum font size, shorten the copy or reflow the composition instead of reducing the type.

### Mock/Chrome And Navigation Rules

When the brief, user or client says to avoid mocks, fake publication previews,
fake social UI or platform chrome, the preview and final export must not include
visual simulation of the platform surface. The following are blockers unless the
brief explicitly requests them:

- phone/device frames;
- fake social account headers;
- avatars, verified badges, likes, comments, share/save icons;
- captions, hashtags or engagement counters inside the art surface;
- browser/app chrome used to imply the asset is already published.

When the brief says no arrows inside the art, the reviewable art surface must not
include `←`, `→`, `Anterior`, `Próximo`, chevrons or visible arrow buttons.
Preview-only navigation may exist outside the exported art surface only when the
RCC declares the export crop and proves those controls are excluded from final
PNGs.

The Reviewer and Pipeline Auditor must inspect the DOM and/or exported PNGs when
these prohibitions are present. A prose claim of `no mock` or `no arrows` is not
evidence.

## Stage 3 — Review Gate

The Reviewer must reject or block an asset if any required decision or evidence is missing.

Required review checks:

- Client creative DNA acceptance gate passed.
- Visual Decision Card exists and is complete.
- Render Compliance Card exists and matches the decision card.
- HTML-PNG sync gate passed (slide count, content, validation script).
- Background image decision is implemented or justified.
- First impression diversity is declared and preserved in the opening frame or cover.
- If a related blog image exists and was not used, the justification is explicit and strategically valid.
- Final canvas and preview behavior match the format.
- Typography family, hierarchy and minimum font size are declared and respected.
- Navigation works for multi-frame assets.
- Export dimensions are verified before publication/export status is granted.
- Campaign-hub preview can be reviewed comfortably without clipping core content.
- If the background image or crop changed in a regeneration cycle, the hub must point to the regenerated preview/PNG artifacts, not the prior version.
- If a NotebookLM prototype was used, the Reviewer must verify that it stayed reference-only and did not bypass VDC, RCC, export validation or source validation.

## Veto Conditions

Reject and redo if any are true:

1. A social asset has no Visual Decision Card.
2. A social render has no Render Compliance Card.
3. A selected style violates the client's creative DNA acceptance contract without explicit user approval.
4. The final canvas is missing or differs from the declared format without explanation.
5. The campaign-hub preview behavior is missing or unusable.
6. The font family or minimum font size is missing.
7. The selected style is missing or does not come from `visual-styles.md`.
8. The asset uses a flat background by default without texture, image or explicit justification.
9. A blog-derived asset ignores available blog imagery without a written reason.
10. A background image is used without source path, license/source status, or treatment notes.
11. A multi-frame asset lacks navigation/progress suitable for review.
12. The reviewer cannot verify export dimensions.
13. A cover or first frame repeats recent image, crop, composition and treatment without a documented continuity reason.
14. The preview HTML slide count differs from the published PNG count.
15. The preview HTML content, copy, CTA or branding does not match the published PNGs.
16. The brief prohibits mocks or fake publication previews and the DOM/export includes platform chrome.
17. The brief prohibits navigation arrows and the DOM/export includes visible arrows or previous/next buttons inside the reviewable/exported art surface.
18. A regenerated post changed image/background but the hub or review modal still points to the older preview/PNG version.
18. RCC/Review claims photography, background image, image rotation or specific dimensions without matching DOM/export evidence.
19. **Slides 2+ reutilizam imagem do banco** sem justificativa de crop variationjustified declarada no VDC.
20. **Contrast Strategy ausente ou ilegível** — slide 1 com background-image sem estratégia de contraste declarada OU com `Text Legibility: fails`.
21. **Design System ignorado em slides 2+** — slides usam imagem que não é do banco E não usam tokens do Design System (textura, gradiente, padrão, composição tipográfica).
22. **NotebookLM prototype treated as final art** — prototype PDF/image is used directly for publication or hub approval without canonical VDC/RCC/render/review evidence.
23. **Prototype limitations not declared** — NLM reference used but watermark, unsupported claims, format issues or discarded elements are missing from VDC/RCC.

## Stage 4 — HTML-PNG Sync Gate

This gate runs after render and before review. It ensures the preview HTML file is a faithful mirror of the published PNGs.

Required checks:

1. **Slide/Frame Count Match**: The number of slides or frames in the preview HTML must exactly equal the number of PNG files in `social/publish/{asset_id}/`.
2. **Content Match**: The copy, CTA, branding, and visual layout in the HTML must correspond to what is rendered in the PNGs.
3. **Validation Command**: Run `node squads/social-growth/scripts/verify-html-png-sync.mjs --client {client}` and record the output in the Render Compliance Card.

### Sync Compliance Card

Add this section to the Render Compliance Card:

```md
- **HTML-PNG Sync**: [pass/fail]
- **HTML Slide Count**: [number]
- **PNG Count**: [number]
- **Content Verified**: [yes/no + notes]
- **Sync Script Output**: [pass/fail or error message]
```

### Veto Conditions

Reject and redo if any are true:

1. HTML slide count differs from PNG count.
2. HTML contains copy, themes, or layouts that do not match the published PNGs.
3. The sync verification script reports a desync.
4. The HTML was regenerated from a stale or different context than the PNGs.

## Status Labels

- `ready`: all required fields and evidence are present.
- `blocked`: a required decision, render detail, preview behavior or validation method is missing.
- `revise`: the asset is complete enough to inspect but fails a creative or technical criterion.
