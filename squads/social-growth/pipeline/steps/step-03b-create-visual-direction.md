---
execution: subagent
agent: visual-director
model_tier: powerful
inputFile: squads/social-growth/output/content/content-production-package.md
outputFile: squads/social-growth/output/creative/visual-direction.json
---

# Step 03B: Create Visual Direction

## Context Loading

Load these files before executing:
- `squads/social-growth/pipeline/data/fast-safe-routing-policy.md` — determine whether the asset requires full visual direction or fast-track
- `squads/social-growth/state-summary.md` — current client/status context
- current brand profile from the database-backed client workspace or latest client report
- current creative profile from the database-backed client workspace or latest client report
- `squads/social-growth/output/blog/blog-post.md` — approved discovery-optimized blog when present
- `squads/social-growth/output/repurposing/content-repurpose.md` — approved repurpose package when present
- `squads/social-growth/output/content/content-production-package.md` — approved content production package
- `squads/social-growth/output/amiclube/social/drafts/*.md` — social post drafts with full caption copy (when present)
- `squads/social-growth/pipeline/data/nlm-visual-prototype.md` — optional prototype policy when an NLM reference exists
- `squads/social-growth/output/{client}/creative/nlm-prototypes/*.md` — NLM prototype handoff when present
- `squads/social-growth/output/strategy/content-plan.md` — strategic direction and cadence
- `squads/social-growth/pipeline/data/visual-styles.md` — professional style presets
- `squads/social-growth/pipeline/data/generation-contract.md` — canonical checklist for generation handoff
- `squads/social-growth/pipeline/data/visual-production-gate.md` — mandatory visual decision checklist for social assets
- `squads/social-growth/pipeline/data/skill-invocation-gate.md` — mandatory skill invocation evidence for social generation
- `squads/social-growth/output/{client}/creative-dna.md` — active client creative DNA when available
- `squads/social-growth/output/{client}/creative-dna-acceptance.json` — active client creative acceptance envelope when available
- `squads/social-growth/pipeline/data/tone-of-voice.md` — tone guardrails
- `squads/social-growth/pipeline/data/output-examples.md` — reference examples
- `squads/social-growth/pipeline/data/quality-criteria.md` — quality rubric
- `squads/social-growth/pipeline/data/anti-patterns.md` — mistakes to avoid
- `_opensquad/core/best-practices/image-design.md` — visual design rules
- `_opensquad/core/best-practices/article-to-post-linking.md` — article-to-post linking policy (link overlay requirements per platform)
- `_opensquad/core/best-practices/asset-update-workflow.md` — asset update chain (source → HTML → export)
- `squads/social-growth/pipeline/data/blog-image-bank.md` — image bank rules for social derivatives
- `squads/social-growth/output/{parent_blog_asset_id}/blog/assets/{parent_blog_asset_id}-images.json` — image bank JSON when available (load per asset)

For Design System integration (when format is covered by design-system/templates/):
- `squads/social-growth/design-system/tokens.css` — tokens fundamentais
- `squads/social-growth/pipeline/data/design-system-manifest.md` — schema do JSON manifest
- `squads/social-growth/pipeline/data/design-system-tokens.md` — referência de tokens
- `squads/social-growth/design-system/engine/compose.mjs` — motor de composição (não precisa ser carregado, apenas referenciado)
- `squads/social-growth/design-system/contracts/post-system.json` — contrato de formato/preset para seleção automática
- `squads/social-growth/design-system/engine/generate-direction-from-package.mjs` — gerador preferencial de direção visual a partir do pacote de conteúdo
- Skills de formato nativas (`instagram-carousel`, `linkedin-carousel`, etc.) **não precisam ser carregadas** — o template do Design System já codifica as regras do formato

If the current client record or content production package includes a dedicated creative-direction layer, also load:

- `skills/creative-director/SKILL.md`
- `skills/creative-director/references/creative-rules.md`
- `skills/creative-director/references/art-directions.md`
- `skills/creative-director/references/anti-repetition.md`
- `skills/creative-director/references/examples.md`
- `skills/creative-director/references/test-prompts.md`

For social format decisions, load selectively:

- `skills/social-visual-system/SKILL.md`
- `skills/social-visual-system/references/brand-intake.md`
- `skills/social-visual-system/references/visual-foundation.md`
- `skills/social-visual-system/references/component-system.md`
- `skills/social-visual-system/references/format-selection.md`
- `skills/social-visual-system/references/review-and-export.md`
- exactly one native format skill per asset: `instagram-carousel`, `linkedin-carousel`, `stories-sequence`, `reels-sequence`, `facebook-post`, `social-single-post`, or `pinterest-pin`

## Instructions

### Process
1. Analyze the emotional tone and objective of each piece in the blog, repurpose package and content production package.
1a. Invoke required visual skills before deciding style, format or composition: `creative-director`, `social-visual-system`, and exactly one native format skill per social asset. Do not load unused native format skills.
2. Read the brand profile and preserve the confirmed versus inferred split inside the visual brief.
3. Read the creative profile and preserve the confirmed versus inferred split inside the visual brief.
4. If an `NLM Visual Prototype Handoff` exists, treat it as reference only. Extract useful sequence, hierarchy, mood or CTA direction, and explicitly discard watermark, unsupported claims, wrong typography, wrong format and generic styling.
5. **Select one style from the `Visual Styles Library`**, or the default style mapped to the chosen format in `design-system/contracts/post-system.json`, whichever better matches the content's goal, brand profile and creative profile.
6. Define the visual system (colors, typography, textures) based on the chosen style, the brand palette and the creative constraints.
7. Create a specific creative brief for each asset, describing the image story, background treatment, overlay guidance, font hierarchy, focal points and proof treatment.
8. Include blog featured-image direction when a blog asset is in scope, and make the cover concept explicitly thesis-led rather than generic.
9. For blog assets, include a free/public source search note with 3-5 candidate sources or asset types only when image research is active, and explain why the final choice wins on topic match, thesis match and one-glance clarity.
   - include source origin, license class, license check date and fallback candidate.
10. Prefer free or public sources by default; only mention paid stock as an exception that requires explicit approval outside the standard flow.
11. Provide clear instructions for the rendering step, ensuring the chosen aesthetic is preserved and the selected source type remains defensible.
12. If the batch has a dedicated creative-direction layer, enforce the anti-repetition and direction-family rules from that skill before finalizing the brief.
13. For each social asset, select exactly one visual format skill and state it explicitly in the brief.
14. Use this routing by default:
    - Instagram feed carousel or multi-slide educational post -> `instagram-carousel`
    - Instagram Stories, Facebook Stories or vertical frame-by-frame sequence -> `stories-sequence`
    - Instagram Reels, Facebook Reels or short-form video sequence -> `reels-sequence`
    - LinkedIn document-style carousel -> `linkedin-carousel`
    - Pinterest save-oriented vertical visual -> `pinterest-pin`
    - Facebook static post (1200x630 or 1080x1080), Facebook link-preview graphic, announcement or blog teaser -> `facebook-post`
    - LinkedIn single visual, non-Facebook teaser, cover, or any other one-frame asset -> `social-single-post` with platform-specific dimensions
15. If the content package format label and the ideal visual skill disagree, preserve the platform intent and explain the adjustment in the production notes.
16. **Guardrail**: `social-single-post` is ONLY for one-frame assets. If the content has multiple frames/slides or timed scenes, use `instagram-carousel`, `stories-sequence`, `reels-sequence`, or `linkedin-carousel`. Never assign `social-single-post` to multi-frame content, and use `facebook-post` instead for Facebook-native static posts.
17. Apply the Visual Production Gate: every social asset must include a completed Visual Decision Card before the direction can move to rendering. If NLM was used, complete the `NLM Prototype Reference` field.
18. Apply Client Creative DNA Acceptance: every VDC must declare whether the selected style is `allowed`, `conditional`, or `blocked` for the client. Block styles outside the envelope unless explicit user approval is recorded.
19. For every blog-derived social asset:
    a. Check `output/{client}/blog/assets/{parent_asset_id}-images.json` (the **image bank**) first.
    b. If the image bank exists, allocate **1 different image per derived social asset** from the bank. Do not reuse the same image across multiple derivatives unless justified by crop variation.
    c. If the image bank does not exist, check the raw `output/{client}/blog/assets/` folder for hero images.
    d. Declare `background-image`, `texture-only`, or `no-image-justified`. If a relevant image exists and is not used, explain why.
    e. In the VDC, record which specific image from the bank was allocated: `bank_image_id: "img-02"`.
20. For every social asset, declare first impression diversity: recent assets checked, opening image/crop, first impression role, difference from recent assets and similarity risk.
21. Declare the campaign-hub preview size and behavior separately from final export dimensions so the renderer does not improvise the review experience.
22. Run the deterministic DNA gate before handoff when a client acceptance file exists:
    ```bash
    node squads/social-growth/scripts/validate-creative-dna-acceptance.mjs --client {client} --assets {asset_ids_csv} --version {active_version}
    ```
23. Complete the canonical generation checklist in `generation-contract.md` before handoff.
24. Add a `Skill Invocation Ledger` proving each required skill was loaded and how it shaped the VDC decisions.

## Deterministic Path (Default — JSON Manifest)

The default output for this step is `visual-direction.json`. The Design System covers the supported social formats and should be used whenever possible.

If the package targets a supported social format, the manifest must include `asset_id`, `client`, `brand`, `style`, `format`, `canvas`, `preview`, `slides`, and any relevant caption or footer fields.

Use the format preset mapping from `design-system/contracts/post-system.json` unless a stronger brand or asset constraint is explicitly documented.

The JSON must be suitable for direct handoff to `design-system/engine/compose.mjs` with no manual HTML creation.

If an asset truly requires the legacy route, keep the markdown brief and follow `pipeline/data/visual-direction-legacy-fallback.md`.

## Veto Conditions

Reject and redo if ANY are true:
1. No style from the library was selected.
2. The directions are generic (e.g., "just use white background").
3. Background textures or specific font behaviors are missing.
4. Any social asset is missing its visual format skill assignment.
5. Any social asset is missing a complete Visual Decision Card.
6. Any social asset is missing Client Creative DNA Acceptance status.
7. The selected style violates the client's creative DNA acceptance contract without explicit user approval.
8. Any social asset is missing final canvas, campaign-hub preview behavior, first impression diversity, typography family, minimum font size, image/background decision, navigation expectation, export expectation or validation method.
9. A blog-derived social asset ignores available blog imagery without a strategic justification.
10. A blog-derived social asset reuses the same image bank photo as another derivative in the same batch without documented crop/first-impression variation.
11. A cover or first frame repeats recent image/crop/composition/treatment without documented continuity reason.
12. The output does not include a `Skill Invocation Ledger`.
13. `creative-director` or `social-visual-system` was not invoked before visual decisions were made.
14. Any asset lacks an invoked native format skill row matching its visual skill assignment.
15. NLM prototype was used but the VDC does not declare what was preserved, what was discarded and which claims require source validation.

## Quality Criteria

- [ ] A professional style from the library is active.
- [ ] Hierarchy and textures are clearly described.
- [ ] Each asset has a specific creative direction.
- [ ] Each asset has an explicit visual format skill assignment.
- [ ] Each asset has explicit Client Creative DNA Acceptance status.
- [ ] The direction enhances the emotional impact of the copy.
- [ ] Batches with a dedicated creative-direction layer follow the anti-repetition rules and do not reuse the same visual logic across adjacent pieces.
- [ ] Blog assets include a thesis-led featured image direction when relevant.
- [ ] Blog assets include a free/public source search note with source origin + license check date + fallback + explicit selection rationale when image research is active.
- [ ] Every social asset includes a completed Visual Decision Card.
- [ ] If an NLM prototype informed the direction, the VDC marks it as `reference_only` and declares preserved/discarded elements.
- [ ] Every social asset declares final canvas and campaign-hub preview behavior.
- [ ] Every social asset declares first impression role, opening image/crop, recent comparison and similarity risk.
- [ ] Every social asset completes the canonical generation checklist.
- [ ] Every social asset declares `background-image`, `texture-only`, or `no-image-justified`.
- [ ] Blog-derived social assets checked the blog image bank (`{parent_asset_id}-images.json`) before declaring image source.
- [ ] Each blog-derived social asset in the same batch uses a **different image** from the bank (or justified crop variation if same image).
- [ ] Every social asset declares typography family, font hierarchy and minimum font size in px.
- [ ] Required visual skills were invoked and evidenced in `Skill Invocation Ledger`.
