---
id: asset-update-workflow
name: "Asset Update Without Quality Loss"
whenToUse: |
  Updating social assets after initial export — whether editing copy,
  visuals, layout, or re-exporting.
  NOT for: creating new assets from scratch.
version: "1.0.0"
---

# Asset Update Workflow — Without Quality Loss

## Core Principle

> **JPEGs/PNGs are export artifacts, never edit sources.**

Every exported image file (`.jpg`, `.png`) is a **derivative** of its source files.
Editing the derivative breaks the chain and guarantees quality loss.

## Source Chain

```
Blog Article Draft (.md)
  → Social Post Draft (.md)        ← sourceDraft
    → Preview HTML (.html)          ← sourceHtml
      → Exported Image (.jpg/.png)  ← files
```

To edit, always go **left**: find the closest source and edit there.

## Decision Matrix

### What changed → Where to edit

| Change | Edit this | Re-export? | Risk |
|--------|-----------|------------|------|
| **Caption only** (no text on image) | Queue JSON (update `caption_preview`) | No | Zero |
| **Caption with overlay on image** | Preview HTML (edit overlay text/layout) | Yes | Low |
| **Visual layout** (grid, spacing, typography) | Preview HTML | Yes | Low |
| **Background image / photo** | Preview HTML (swap image ref) | Yes | Low |
| **Color scheme** (brand palette change) | Preview HTML + CSS variables | Yes | Low |
| **Article content changed** | Blog Draft → Social Draft → Preview HTML → Export | Full pipeline | Controlled — passes all validations |
| **Direct JPEG/PNG editing** (Photoshop/GIMP) | ❌ NEVER | N/A | High — source lost, can't regenerate consistently |

### Risk levels explained

- **Zero**: No visual change needed. Update only metadata/text.
- **Low**: Single source edited, re-export is deterministic — same input = same output.
- **Controlled**: Multiple layers change, but each step passes review.
- **High**: Source abandoned — next edit requires manual recreation.

## Step-by-Step: Updating a Social Asset

### Step 1 — Identify what changed

Check against the cross-references in `social-publish-assets.json`:

- `sourceDraft` → the copy draft `.md` file
- `sourceHtml` → the preview `.html` file
- `files` → the exported `.jpg`/`.png` files
- Queue entry → the `caption_preview` and `publish_at_*` fields

### Step 2 — Edit the correct source

| Change type | Action |
|-------------|--------|
| Visual overlay text | Edit the `<text>` node or overlay CSS in the Preview HTML |
| Layout/grid/spacing | Edit CSS variables or flex properties in the Preview HTML |
| Background image | Swap the `<img>` src or CSS `background-image` URL in the Preview HTML |
| Full caption (text only) | Update `caption_preview` in the queue JSON directly |
| Article-derived copy changed | Re-run the Content Repurposer step to regenerate the Post Draft |

### Step 3 — Re-export (if visuals changed)

```bash
# Reels (4 frames)
node scripts/capture-reels.mjs \
  --input "squads/social-growth/output/amiclube/social/previews/<asset>.html" \
  --output "squads/social-growth/output/amiclube/social/exports/<asset>/" \
  --prefix "<ASSET>-frame-"

# Carrossel (N slides)
node scripts/capture-carousel.mjs \
  --input "squads/social-growth/output/amiclube/social/previews/<asset>.html" \
  --output "squads/social-growth/output/amiclube/social/exports/<asset>/" \
  --prefix "<ASSET>-v2-slide-"

# Single image
node scripts/capture-single-slide.mjs \
  --input "squads/social-growth/output/amiclube/social/previews/<asset>.html" \
  --output "squads/social-growth/output/amiclube/social/exports/<asset>/"
```

The re-export overwrites the same file paths — the queue does NOT need path updates.

### Step 4 — Validate re-export

```bash
node squads/social-growth/scripts/run-social-publish-worker.mjs \
  --client amiclube --mode dry_run
```

Check: asset count, file sizes, image dimensions.

### Step 5 — Re-publish (if already live)

If the post is already published, you cannot replace the images on Instagram/Facebook.
Delete and re-post, or update only the caption via the platform's edit API.

## Versioning Convention

| Artifact | Version field | Location |
|----------|--------------|----------|
| Preview HTML | Filename suffix (`-v2`, `-v3`) | `social/previews/` |
| Exported image | Directory overwritten in place | `social/exports/<asset>/` |
| Asset manifest | `version` field | `social-publish-assets.json` |
| Queue | `updatedAt` | `social-publish-queue.json` |

When the visual direction changes significantly (layout, palette, typography), increment the preview filename:
- `ac-30-03-reels-v2.html` → `ac-30-03-reels-v3.html`
- And update `source_preview_path` and `sourceHtml` in the assets manifest.

## Rollback

To revert to a previous visual version:

1. Keep old preview HTML files (never delete — archive or rename with `-v1` suffix)
2. To roll back: point `sourceHtml` to the old file → re-export → dry-run → confirm

## Anti-Patterns

### Never Do

1. **Edit JPEG/PNG directly** — You lose the source. Next change requires manual recreation.
2. **Re-export without updating the preview HTML** — Old exports with old content = waste of time.
3. **Edit the queue entry caption but forget to update the overlay text in the image** — Visual and text will mismatch.
4. **Delete old preview HTML files** — You lose rollback capability. Archive, don't delete.
5. **Skip dry-run after re-export** — Broken exports slip through to the queue.

### Always Do

1. **Edit source, not artifact** — HTML first, export second.
2. **Dry-run after every re-export** — Validate before queueing.
3. **Keep preview versions** — `-v1`, `-v2`, `-v3` allow rollback.
4. **Update the manifest version** — Bump `social-publish-assets.json` version on changes.
5. **Document what changed and why** — Add a `notes` entry in the manifest.
