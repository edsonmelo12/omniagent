---
execution: manual_assisted
agent: atlas-ceo
model_tier: standard
inputFile: squads/social-growth/output/{client}/social/drafts/
outputFile: squads/social-growth/output/{client}/creative/nlm-prototypes/
optional: true
---

# Step 03A2: NLM Visual Prototype

## Purpose

Create an optional NotebookLM visual prototype before final visual direction. This step helps the squad test slide rhythm, hierarchy, mood and CTA framing before Visual Director creates the canonical Visual Decision Card.

This step is never a final production step.

## Context Loading

Load these files before executing:

- `squads/social-growth/pipeline/data/nlm-visual-prototype.md` — operating policy and handoff format
- `squads/social-growth/pipeline/data/nlm-visual-prototype-prompts.md` — approved prompt templates
- `squads/social-growth/pipeline/data/generation-contract.md` — final generation requirements
- `squads/social-growth/pipeline/data/visual-production-gate.md` — VDC/RCC/review gate
- `squads/social-growth/pipeline/data/visual-styles.md` — visual style references
- `squads/social-growth/state-summary.md` — current client/status context
- `squads/social-growth/output/{client}/social/drafts/*.md` — source drafts when available
- `squads/social-growth/output/{client}/creative-dna.md` — client creative DNA when available
- `squads/social-growth/output/{client}/creative-dna-acceptance.json` — client creative acceptance envelope when available

## Trigger Conditions

Run this step only when Atlas explicitly decides that a prototype will reduce uncertainty, usually for:

- new carousel;
- complex narrative asset;
- new campaign visual direction;
- uncertain first impression;
- need to compare visual approaches quickly.

Skip this step when the asset has a proven baseline or when the standard Design System path is already sufficient.

## Process

1. Confirm the asset is not already in final production.
2. Select the correct prompt template from `nlm-visual-prototype-prompts.md`.
3. Fill objective, client, CTA route, and any source-sensitive claims.
4. Generate the prototype manually in NotebookLM Studio/Presentation.
5. Save or reference the exported prototype under `output/{client}/creative/nlm-prototypes/` when a local file is available.
6. Evaluate the prototype with the checklist in `nlm-visual-prototype.md`.
7. Produce an `NLM Visual Prototype Handoff` for Visual Director.
8. Mark the prototype as `reference_only`, `discarded`, or `regenerate`.

## Output Format

```md
# NLM Visual Prototype Handoff — [asset_id]

- Asset ID:
- Client:
- Source notebook:
- Prompt used:
- Prototype file/link:
- Target format:
- Prototype status: reference_only | discarded | regenerate
- Useful elements to preserve:
- Elements to discard:
- Claims requiring source validation:
- Format issues:
- CTA route:
- Atlas decision:

## Evaluation Checklist

- [ ] Format/orientation correct
- [ ] pt-BR copy with correct accents and diacritics
- [ ] No unsupported claims
- [ ] No fake social UI
- [ ] No direct-publication use
- [ ] Useful visual direction
- [ ] Final VDC/RCC/Review still required
```

## Veto Conditions

Block use of the prototype if any are true:

1. It is treated as final art.
2. It includes unsupported claims.
3. It has uncorrected pt-BR orthographic or accent errors.
4. It uses fake social UI.
5. It conflicts with the client creative DNA.
6. It omits format/orientation evidence.
7. It bypasses Visual Director, Creative Renderer or Reviewer.

## Integration

- **Reads from**: social drafts, campaign strategy, creative DNA, NotebookLM sources.
- **Writes to**: optional prototype handoff and reference files.
- **Feeds**: `step-03b-create-visual-direction.md`.
- **Does not feed directly**: publication, scheduler, campaign hub, social-publish-assets, social-final-captions.
- **Depends on**: Atlas approval and source-backed prompt.
