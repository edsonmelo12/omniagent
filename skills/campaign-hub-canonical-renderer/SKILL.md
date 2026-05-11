---
name: campaign-hub-canonical-renderer
description: >
  Rebuilds campaign-hub.html from canonical previews using a fixed layout,
  preventing manual drift and accidental card loss.
type: script
version: "1.0.0"
runtime: node
invocation: "node squads/social-growth/scripts/render-campaign-hub-canonical.mjs --client {client}"
categories:
  - render
  - governance
  - review
---

# Campaign Hub Canonical Renderer

Use this skill whenever `campaign-hub.html` must be refreshed.

## Purpose

Keep one immutable hub layout and only update data cards.

## Inputs

- Blog previews under `output/{client}/blog/**/previews/*.html`
- Social previews under `output/{client}/social/previews/*.html`
- Review verdict from `output/{client}/review/content-review.md`

## Output

- `output/{client}/review/campaign-hub.html`

## Rule

Do not manually rewrite hub structure for recurring updates.

## Typical Command

```bash
node squads/social-growth/scripts/render-campaign-hub-canonical.mjs --client amiclube
```
