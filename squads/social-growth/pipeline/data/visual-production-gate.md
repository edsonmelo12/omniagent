# Visual Production Gate

This gate is mandatory for every social visual asset before it can move from visual direction to rendering, from rendering to review, and from review to export/publication.

The goal is to remove surprise from the creative process. Every asset must declare the design decisions that affect readability, campaign-hub review, export fidelity and final visual quality.

## Gate Principle

No social visual asset may advance unless the responsible agent has explicitly declared and validated:

- client creative DNA acceptance;
- final canvas;
- campaign-hub preview behavior;
- visual skill;
- selected visual style;
- baseline/reference;
- first impression diversity;
- background image decision;
- typography family and minimum font size;
- color system;
- navigation behavior;
- export validation method.

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
- **Composition Logic**: [image-led | typography-led | mixed]
- **Recent Assets Checked**: [last 3 client assets, or `not available` + reason]
- **Opening Image / Crop**: [image path, crop, focal point, or `not used`]
- **First Impression Role**: [hero | texture | proof | backstage | context | comparison | CTA | typography-led]
- **Difference From Recent Assets**: [image/crop | composition | treatment | color | density | focal logic]
- **Similarity Risk**: [low | medium | high]
- **Continuity Justification**: [required if similarity risk is medium/high]
- **Background Image Decision**: [background-image | texture-only | no-image-justified]
- **Background Image Source**: [existing asset path, external URL/license, or `not used`]
- **Image Treatment**: [crop, blur, overlay, opacity, focal point]
- **Typography**: [family, weights, title/body/caption sizes]
- **Minimum Font Size**: [px on final canvas]
- **Palette**: [hex values and roles]
- **CTA Treatment**: [position, styling, action]
- **Navigation / Interaction**: [required controls by format]
- **Export Expectation**: [PNG/JPEG count, exact dimensions]
- **Validation Method**: [how renderer/reviewer should verify]
```

### Image Decision Rules

1. If the asset is derived from a blog post, first check `output/{client}/blog/assets/` for related imagery.
2. If a related image exists, default to `background-image` unless it conflicts with the content strategy.
3. If no image is used, the decision must be `texture-only` or `no-image-justified` with a clear reason.
4. `no-image-justified` is valid only when the visual concept intentionally depends on text, icons, diagrams or pure typographic contrast.
5. Generic image use is not allowed. The image must support the post thesis, not merely decorate the frame.

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
- **Final Canvas Rendered**: [width x height px]
- **Campaign-Hub Preview Implemented**: [yes/no + behavior]
- **Visual Skill Behavior**: [pass/fail + notes]
- **Background Decision Implemented**: [background-image | texture-only | no-image-justified]
- **Background Source Implemented**: [path/source or `not used`]
- **Image Treatment Implemented**: [crop/overlay/blur/etc.]
- **Opening Frame Implemented**: [image/crop/focal point/treatment]
- **First Impression Difference Preserved**: [yes/no + notes]
- **Typography Implemented**: [family/weights/sizes]
- **Minimum Font Size Check**: [pass/fail + smallest px]
- **Navigation Check**: [pass/fail + controls]
- **Export Paths**: [HTML and final image paths]
- **Export Dimension Check**: [command/tool/manual note]
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
18. RCC/Review claims photography, background image, image rotation or specific dimensions without matching DOM/export evidence.

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
