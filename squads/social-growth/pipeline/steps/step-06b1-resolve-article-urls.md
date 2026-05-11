---
execution: subagent
agent: wagner-wordpress
model_tier: powerful
inputFile: squads/social-growth/output/amiclube/publishing/wordpress-status.md
outputFile: squads/social-growth/output/amiclube/review/campaign-manifest.json
---

# Step 06B1: Resolve Article URLs

## Context Loading

Load these files before executing:

- `squads/social-growth/output/amiclube/review/campaign-manifest.json` — article + social asset registry
- `squads/social-growth/output/amiclube/publishing/wordpress-status.md` — WP post IDs and current status
- `squads/social-growth/output/amiclube/publishing/social-publish-assets.json` — export manifest with sourceDraft refs
- `squads/social-growth/pipeline/data/{client}-publishing-profile.md` — WordPress site URL and credentials
- `squads/social-growth/output/amiclube/social/drafts/*.md` — social post drafts (to update article_url)
- `squads/social-growth/output/amiclube/publishing/social-publish-queue.json` — queue entries (to update links_resolved)

## Instructions

### Purpose

After Wagner publishes blog articles to WordPress (step-06b), this step resolves the public article URLs and propagates them to every downstream file that needs them.

### Process

1. **Read the campaign manifest** and identify all blog assets with `article_url: null`.

2. **For each unpublished blog asset**, check `wordpress-status.md` for its WP post ID.

3. **Query the WordPress REST API** for each post:

   ```
   GET /wp/v2/posts/{wp_id}
   ```

   Extract the `link` field from the response — this is the public permalink.

   > Even for `draft` or `future` posts, WordPress returns a `link`. However, the URL only resolves publicly when the post status changes to `publish`.

4. **Update the campaign manifest**:

   ```json
   {
     "assetId": "AC-30-01",
     "article_url": "https://amiclube.com.br/como-escolher-amigurumi-com-criterio/",
     "article_url_resolved_at": "2026-05-01T10:00:00.000Z"
   }
   ```

5. **Update each social draft** that derives from this article: edit the `article_url` field in the frontmatter.

6. **Update the assets manifest**: set `articleUrl` on each export that maps to this article.

7. **Update the queue**: set `links_resolved: true` on each queue entry whose parent article now has a URL.

### WordPress API Call

```bash
curl -s -X GET "https://amiclube.com.br/wp-json/wp/v2/posts/{wp_id}" \
  --user "${WP_USER}:${WP_APP_PASSWORD}"
```

The response includes:
- `id`: WP post ID
- `link`: public permalink (e.g., `https://amiclube.com.br/como-escolher-amigurumi-com-criterio/`)
- `status`: `publish`, `future`, `draft`, etc.
- `date_gmt`: scheduled publish date

If the post is still `draft` or `future`, the `link` is still usable — it will be the final URL once published.

### What Gets Updated

| File | Field | From → To |
|------|-------|-----------|
| `campaign-manifest.json` | `article_url` | `null` → URL |
| `campaign-manifest.json` | `article_url_resolved_at` | `null` → ISO timestamp |
| `social/drafts/{asset}.md` | `article_url` | `null` → URL |
| `social-publish-assets.json` | `articleUrl` | `null` → URL |
| `social-publish-queue.json` | `links_resolved` | (new field) → `true` |
| `wordpress-status.md` | Link Público column | WP edit link → public URL |

### Edge Cases

| Scenario | Action |
|----------|--------|
| Article not yet sent to WP | Skip — `article_url` stays `null` |
| WP API returns error | Log error, skip, do not block other assets |
| Article is `draft` | Still resolve the link (will be final URL), mark as `future_link` |
| Article is `future` | Resolve link, mark as `future_link` |
| Social post is `seasonal_offer` (no parent article) | Skip — no link needed |
| WP post ID not found in status file | Cross-check with wordpress-status.md; if missing, skip |

### Quality Criteria

- [ ] Every published article has `article_url` resolved in campaign manifest
- [ ] Every social draft that derives from a resolved article has `article_url` populated
- [ ] Every queue entry for a resolved article has `links_resolved: true`
- [ ] Failed API calls are logged but do not block resolution of other assets
- [ ] `wordpress-status.md` shows public URLs for resolved articles

### Integration

- **Reads from**: `campaign-manifest.json`, `wordpress-status.md`, `social-publish-assets.json`, `social/drafts/*.md`, `social-publish-queue.json`
- **Writes to**: `campaign-manifest.json`, `social/drafts/*.md`, `social-publish-assets.json`, `social-publish-queue.json`, `wordpress-status.md`
- **Depends on**: Articles published to WordPress (step-06b complete)
- **Triggers before**: Social publish worker (run-social-publish-worker.mjs)
