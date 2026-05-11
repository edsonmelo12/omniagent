---
execution: subagent
agent: creative-renderer
model_tier: powerful
inputFile: squads/social-growth/output/creative/visual-direction.md
outputFile: squads/social-growth/output/creative/rendered-assets.md
---

# Step 03C: Render Creative Assets

## Context Loading

Load these files before executing:
- `squads/social-growth/pipeline/data/fast-safe-routing-policy.md` — confirm full render vs correction fast-track route
- `squads/social-growth/state-summary.md` — current client/status context
- current creative profile from the database-backed client workspace or latest client report
- `squads/social-growth/output/creative/client-creative-profile-template.md` — normalized creative table for the active client
- `squads/social-growth/output/content/content-production-package.md` — approved content source
- `squads/social-growth/output/creative/visual-direction.md` — approved visual direction and selected style (markdown)
- `squads/social-growth/output/creative/visual-direction.json` — approved visual direction as JSON manifest (Design System path)
- `squads/social-growth/output/creative/validation-checklist.md` — batch validation gate before render
- `squads/social-growth/pipeline/data/visual-production-gate.md` — mandatory visual production checklist and render compliance gate
- `squads/social-growth/pipeline/data/skill-invocation-gate.md` — mandatory skill invocation evidence for social generation
- `squads/social-growth/pipeline/data/visual-styles.md` — professional style presets
- `squads/social-growth/output/{client}/creative-dna-acceptance.json` — active client creative acceptance envelope when available
- `squads/social-growth/output/creative/production-package.md` — production rules and piece-by-piece guidance
- `_opensquad/core/best-practices/image-design.md` — layout and image composition rules

### Design System Context (when using Design System path)

When the visual direction was produced as a JSON manifest (Design System path), load these instead of format skills:

- `squads/social-growth/design-system/tokens.css` — tokens fundamentais
- `squads/social-growth/design-system/engine/compose.mjs` — motor de composição (zero tokens)
- `squads/social-growth/pipeline/data/design-system-manifest.md` — schema do JSON manifest
- `squads/social-growth/pipeline/data/design-system-tokens.md` — referência de tokens
- Skills de formato nativas **não precisam ser carregadas** — o template já codifica as regras

## Instructions

### Process — Design System Path (JSON manifest)

When the visual direction is a JSON manifest (`visual-direction.json`), the render is **deterministic and token-free**:

1. Validate the JSON manifest against the schema in `design-system-manifest.md`.
2. Run the engine:
   ```bash
   node squads/social-growth/design-system/engine/compose.mjs \
     --manifest squads/social-growth/output/creative/visual-direction.json
   ```
3. The engine generates a complete, self-contained HTML preview with `body.export-mode` for PNG capture.
4. Export PNGs via Playwright using the existing export script or `design-system/engine/export-slides.mjs`.
5. Validate the generated HTML (slide count, copy fidelity, style match) before marking `ready`.
6. Include a `Skill Invocation Ledger` noting that composition was handled by `design-system/engine/compose.mjs` (0 tokens, deterministic).

**Skills NOT loaded in this path (already encoded in the template):**
- `social-visual-system/SKILL.md`
- Native format skills (`instagram-carousel`, `reels-sequence`, etc.)

### Process — Full Render Path (markdown direction)

When the visual direction is markdown (legacy path), follow the full rendering process:

1. Identify the **Selected Style** from the visual direction and load the corresponding preset.
1a. Invoke `social-visual-system` and the exact native visual format skill declared in each asset's VDC before rendering. Do not load unrelated visual format skills.
2. Read the creative profile and preserve the confirmed versus inferred split in every render decision.
3. Build the asset background first, applying the requested image story, textures (noise, grain, paper), gradients, and overlays as instructed.
4. Read the assigned `Visual Skill` for each asset and adapt the composition behavior to that format before laying out elements.
5. Apply the typography system, ensuring the specific font behaviors (shadows, kerning, color) are faithful to the brief.
6. Compose each slide/asset with depth, using layers for text, elements, and textures.
7. Perform a "final pass" with professional finishing effects (vignette, blur, glow) as described in the Visual Direction.
8. If the batch includes a blog asset, render or reference the featured image so the cover concept matches the thesis-led direction.
9. Preserve the selected source class and source rationale from the visual direction in the render manifest when a blog asset is present.
10. Confirm the asset still passes the batch validation checklist before export.
11. Apply the Visual Production Gate before rendering: if a social asset has no complete Visual Decision Card, mark it `blocked` and do not render.
12. Run or honor the Client Creative DNA Acceptance Gate before rendering. If the VDC fails, mark the asset `blocked` and do not render.
13. Implement the declared background decision. If `background-image` is declared, load the declared image/source and treatment; if unavailable, block the asset instead of falling back silently.
14. Implement the declared first impression: opening image/crop, focal point, treatment and composition must preserve the difference from recent assets.
15. Implement the declared campaign-hub preview behavior and minimum font size.
16. Export the final assets and record the technical execution (style used, background type, visual skill) in the manifest.
17. Include one Render Compliance Card per social asset, following `visual-production-gate.md`.
18. Add a `Skill Invocation Ledger` proving the renderer loaded the required visual skills and applied them to layout, navigation and export behavior.
19. **HTML-PNG Sync Enforcement**: The preview HTML and published PNGs for each asset must be visually and content-identical. Before marking an asset `ready`:
    - The HTML slide/frame count must exactly match the number of published PNGs.
    - The HTML copy, layout, CTA, branding, and visual style must match the PNGs pixel-to-pixel in content.
    - If the HTML was generated from a different context than the PNGs, regenerate the HTML to match the published PNGs.
    - Run `node squads/social-growth/scripts/verify-html-png-sync.mjs --client {client}` and include the result in the Render Compliance Card.
    - A desync is a BLOCKING condition — do not advance the asset.

## Output Format

```
# Rendered Assets

## Manifest
| Day | Title | Style | Visual Skill | Format | Background Texture | Source Class | Output Path | Status |
|---|---|---|---|---|---|---|---|---|

## Blog Featured Image
[title, asset path, style, and thesis-led cover status when relevant]

## Blog Featured Image Source Notes
[source class, source origin, license notes, and rationale preserved from visual direction]

## Rendering Notes
[Specific technical implementation details for the selected style]

## Export Settings
[dimensions, color profiles, noise/texture intensity levels]

## Render Compliance Cards
[one completed Render Compliance Card per social asset, following `visual-production-gate.md`]

## Skill Invocation Ledger
| Agent | Skill | Source File | Applied To | Concrete Use | Status |
|---|---|---|---|---|---|
```

## Output Example

```
# Rendered Assets

## Manifest
| Day | Title | Style | Visual Skill | Format | Background Texture | Source Class | Output Path | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Pare de travar em receitas confusas | Dark Premium | instagram-carousel | PNG | Charcoal Grain 4% | Free/public cover source | output/render/day-01-ig.png | ready |

## Rendering Notes
Background was built with a radial gradient (dark center to charcoal edges) + a noise mask. Text uses an antique serif font with increased line height for authority.

## Export Settings
- 1080x1350 PNG-24;
- No color profile compression to preserve texture detail;
- High-contrast mobile check: PASSED.
```

## Veto Conditions

Reject and redo if ANY are true:
1. The background is a flat, solid color without the requested texture.
2. The typography doesn't follow the hierarchy or style selected.
3. The output doesn't match the Visual Direction brief.
4. The render ignores the assigned visual skill behavior.
5. **[instagram-carousel]** Output is NOT a swipeable carousel with horizontal track (translateX), progress bar on every slide, swipe arrow on right edge (except last slide), and alternating light/dark backgrounds.
6. **[stories-sequence]** Output is NOT in vertical 9:16 format (1080×1920) with one idea per frame, fast rhythm, no carousel UI, and a review-friendly progress indicator/dots.
7. **[reels-sequence]** Output is NOT vertical 9:16 with scene timing or frame beats, safe-area-aware text, and cover direction when declared.
8. **[facebook-post]** Output is NOT a single Facebook-native frame in the declared `1200x630` or `1080x1080` canvas, or it includes carousel/Reels/Stories UI.
9. **[linkedin-carousel]** Output contains fake app chrome, swipe arrows, progress bars, or Instagram-style UI — format must be document-style with restrained backgrounds and no navigation cues.
10. **[social-single-post]** Output contains multiple frames/slides with navigation. `social-single-post` is for ONE frame only. Multi-frame content must use `instagram-carousel`, `stories-sequence`, `reels-sequence`, or `linkedin-carousel`.
11. A social asset is missing a complete Visual Decision Card.
12. A social asset is missing a complete Render Compliance Card.
13. A social asset fails the Client Creative DNA Acceptance Gate.
14. The renderer ignored the declared background image decision or silently replaced it with a flat background.
15. The rendered typography is smaller than the minimum font size declared in the Visual Decision Card.
16. The campaign-hub preview behavior was not implemented or clips copy, CTA or navigation.
17. The renderer changed the opening image/crop/treatment in a way that removes the declared first-impression difference.
18. The output does not include a `Skill Invocation Ledger`.
19. `social-visual-system` was not invoked before rendering.
20. The native format skill invoked by the renderer does not match the Visual Decision Card assignment.
21. The preview HTML and published PNGs differ in content, slide count, copy, CTA, branding, or visual style.
22. The `verify-html-png-sync.mjs` script reports a desync for the asset.

## Quality Criteria

- [ ] Background has depth and texture as requested.
- [ ] Typography is sharp and well-composed.
- [ ] Final finishing (noise, shadows) is professional.
- [ ] Asset matches the "Selected Style" preset.
- [ ] Asset respects the assigned visual skill behavior.
- [ ] Asset still passes the batch validation checklist.
- [ ] Manifest is complete with technical details.
- [ ] Blog featured image, when present, matches the thesis-led direction.
- [ ] Blog featured image source class and rationale are preserved in the manifest.
- [ ] Every social asset has a complete Render Compliance Card.
- [ ] Every social asset passed Client Creative DNA Acceptance before render.
- [ ] Every social asset implements the declared background/image decision or is blocked.
- [ ] Every social asset preserves the declared first impression difference in the opening frame or cover.
- [ ] Every social asset respects the declared minimum font size.
- [ ] Every social asset implements the declared campaign-hub preview behavior.
- [ ] Required render skills were invoked and evidenced in `Skill Invocation Ledger`.
