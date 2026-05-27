---
execution: subagent
agent: scheduler
model_tier: powerful
inputFile: squads/social-growth/output/publishing/schedule-plan.md
outputFile: squads/social-growth/output/publishing/publish-result.md
---

# Step 06C: Publish Social Media

## Context Loading

Load these files before executing:
- `squads/social-growth/output/publishing/schedule-plan.md` — approved schedule
- `squads/social-growth/output/review/content-review.md` — approved review with verdict
- `squads/social-growth/output/creative/rendered-assets.md` — rendered asset manifest
- `squads/social-growth/output/{client}/publishing/social-final-captions.json` — required final captions, CTAs, hashtags, link strategy and alt text
- `squads/social-growth/pipeline/data/generation-contract.md` — canonical checklist for publishable metadata and export parity
- `_opensquad/_memory/company.md` — company context for client slug resolution
- `squads/social-growth/pipeline/data/publishing-module-blueprint.md` — publishing architecture
- `squads/social-growth/infra/postgres/migrations/018_publishing_profiles.sql` — profile schema reference

## 🚀 Alternative: Integrated Workflow

For autonomous agents or streamlined execution, use the integrated workflow instead of running steps individually:

```bash
node squads/social-growth/scripts/publish-workflow.mjs --client {slug}
```

This executes in sequence:
1. Build publish queue
2. Validate all links (blocks if 404)
3. Run dry-run
4. Live publish (if approved)
5. Reconcile status (update plan + monitor)

**When to use:** Autonomous operation, daily publishing routines, minimal intervention required.

**When to use individual steps:** Debugging, custom publishing flows, partial execution.

## Instructions

### Process

1. **Resolve the active client** from the run context. Use the company name in `_opensquad/_memory/company.md` to derive the client slug.

2. **Load publishing profiles** from the database. Query `publishing_profiles` WHERE `client_id` matches the resolved client AND `channel` IN (`instagram`, `linkedin`, `facebook`) AND `connection_status = 'active'`. For each profile:
   - Note the `channel`, `provider`, `publish_mode`, `approval_mode`
   - Parse `secret_ref` to determine how to resolve credentials
   - Validate that `publish_mode` allows the intended operation

3. **Resolve secrets for each profile** by calling:
   ```bash
   node squads/social-growth/scripts/resolve-client-secrets.mjs --client {slug}
   ```
   This reads the profiles from the database and writes a temporary `.env` file at `squads/social-growth/.env.publish.{slug}` with the resolved credentials.

4. **Export HTML previews to PNGs** using the export script:
   ```bash
   node squads/social-growth/scripts/export-social-publish-assets.mjs --client {slug}
   ```
   This converts all approved HTML previews into individual PNG files per slide.

5. **Validate exported assets** (structure + file existence):
    ```bash
    node squads/social-growth/scripts/validate-social-publish-assets.mjs --client {slug}
    ```

5b. **Verify image quality** — run a visual sanity check on every exported multi-frame asset:
    ```bash
    node squads/social-growth/scripts/validate-social-publish-assets.mjs --client {slug}
    ```
    This step runs automatically within step 5 and checks:
    - **No duplicate frames**: every frame in a carousel/reels/stories must have a unique content hash (MD5). Duplicate frames indicate an export pipeline bug.
    - **Minimum brightness**: no frame may have brightness below 5% (detects solid-black or near-black exports caused by CSS constraint mismatches).
    - **Minimum dimensions**: frames must meet the type's `min_width` x `min_height` requirements (default: 1080x1920 for reels/stories, 1080x1080 for carousels).
    
    **If any quality check fails**: DO NOT proceed to publish. Report the specific failure (which asset, which frame, what failed) and request a re-export fix.

6. **Convert PNGs to JPEG** (Instagram requires JPEG format):
   ```bash
   node squads/social-growth/scripts/convert-png-to-jpeg.mjs --client {slug}
   ```

7. **Build the publish queue**:
    ```bash
    node squads/social-growth/scripts/build-social-publish-queue.mjs --client {slug}
    ```

   Confirm the queue payload can satisfy `generation-contract.md`: asset identity, caption, link strategy, final canvas/export proof and alt text must already be present or derivable.

8. **Regenerate the social monitor immediately after queue build**:
   ```bash
   node squads/social-growth/scripts/monitor-social-publish-queue.mjs --client {slug}
   ```

   Treat `social-publish-monitor.md` as the authoritative gate. `schedule-status.md` is a historical summary and must not override a fresh monitor result.

   `social-publish-monitor.md` must report no `missing final_caption` criticals before live publishing. `caption_preview` is informational and must not be treated as publishable copy.

9. **Validate all links before proceeding**:
    ```bash
    node squads/social-growth/scripts/validate-links-before-publish.mjs --client {slug}
    ```
    
    **Critical:** If any link returns 404 or is unreachable, the script will:
    - Block the affected assets in the queue
    - Exit with failure
    - Require manual fix before retry
    
    **Never skip this step** — broken links cause publishing failures and damage brand credibility.

10. **Run dry-run validation** for every channel with an active profile:
    ```bash
    node squads/social-growth/scripts/run-social-publish-worker.mjs --client {slug} --mode dry_run
    ```

11. **Present the dry-run summary** to the user for approval:
    ```
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    📋 Publishing Summary — {client name}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Instagram: {N} posts ready for publishing
    LinkedIn:  {N} posts ready for publishing
    Facebook:  {N} posts ready for publishing
    Mode:      {dry_run_only / live_enabled}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ```

12. **If user confirms**: run live publishing for each channel:
    ```bash
    node squads/social-growth/scripts/run-social-publish-worker.mjs --client {slug} --mode live_api
    ```

13. **Record results**: save the publish result (post IDs, URLs, status) to `outputFile`.

## Output Format

```
# Publishing Result

## Client
{client name}

## Profiles Used
| Channel | Provider | Status | Post Count |
|---|---|---|---|

## Published Posts
| Asset ID | Channel | Post ID | Permalink | Status |
|---|---|---|---|---|

## Dry Run Summary
{results from dry-run}

## Live Publish Summary
{results from live publish}

## Errors
{any errors encountered}
```

## Veto Conditions

Reject and redo if ANY are true:
1. No active publishing profile found for the resolved client.
2. Secret resolution failed for any required profile.
3. Asset export produced zero valid files.
4. `social-publish-monitor.md` reports `FAILED` after queue rebuild.
5. A scheduled asset has neither a manifest row nor recoverable PNG files in `social/publish/{asset_id}/`.
6. User did not explicitly confirm the dry-run summary before live publishing.
7. Any live publish step returned a non-retryable error.
8. Any connector-published social asset is missing `final_caption`.
9. Any multi-frame asset has two or more frames with identical content (same MD5 hash).
10. Any exported frame has brightness below 5% (indicates export pipeline captured a blank/black image).
11. The HTML preview file was modified in-place to fix export dimensions — export must use a dedicated `-export.html` variant or runtime CSS overrides, never modify the canonical preview referenced by `campaign-hub.html`.
12. Any `link_target` in the publish queue does not match a known article/landing URL from the campaign manifest (invented/fabricated URLs are rejected).
13. Any `link_target` in the publish queue returns HTTP 4xx/5xx on HEAD request (broken links are rejected).
14. Any post (carousel or single-image) is published without a non-empty `final_caption`. The caption must be validated before the first API call — post-publish caption edits are not supported for carousels by the Instagram API.
15. Any caption exceeds 2200 characters (Instagram limit) after composing base text with hashtags.

## Quality Criteria

- [ ] Client identity was resolved from company context.
- [ ] Publishing profiles were loaded and validated.
- [ ] Secrets were resolved without exposing raw values.
- [ ] Each HTML preview was exported to PNG/JPEG.
- [ ] Exported assets passed validation.
- [ ] No exported frame has duplicate content (unique MD5 per frame).
- [ ] All exported frames pass minimum brightness threshold (>5%).
- [ ] All exported frames meet minimum dimension requirements.
- [ ] HTML preview files were not modified in-place for export (dedicated export variant or runtime CSS overrides used).
- [ ] Social monitor was regenerated after queue build and is not `FAILED`.
- [ ] Dry-run completed successfully.
- [ ] User explicitly confirmed before live publishing.
- [ ] All publish results were recorded.
- [ ] All `link_target` URLs match known article/landing URLs from the campaign manifest.
- [ ] All `link_target` URLs are reachable (HEAD request returns 2xx/3xx).
- [ ] All published posts have non-empty captions validated before the first API call.
- [ ] Caption was passed during album/image container creation — never attempted as a post-publish edit.
- [ ] All captions are under 2200 characters and use normalized Unicode (NFC).
- [ ] Every connector-published item used approved `final_caption`, CTA, hashtags/link strategy and alt text.
