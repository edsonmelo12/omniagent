# Social Growth Squad

## Startup

1. If `graphify-out/` exists, read `graphify-out/GRAPH_REPORT.md` first.
2. Prefer `graphify query`, `graphify path`, or `graphify explain` for any question about `manifest`, `review`, `publish`, `hub`, previews, or scripts.
3. Read raw files only after the graph gives the map.

## Working Rule

- Treat `social-final-captions.json`, `campaign-manifest.json`, `social-publish-assets.json`, and the review/hub HTML as the canonical chain.
- After changing any code, docs, or generated artifact in this squad, run `graphify update .`.
- When debugging exports, inspect the preview HTML first, then the exporter, then the generated PNGs.
- If a recreated post is missing publish/caption JSON, `generate-review-modal.mjs` can fall back to `social/previews/*-post-preview-manifest.json` for images and preview HTML for copy. Still update the canonical JSON chain so hub and modal stay aligned.
