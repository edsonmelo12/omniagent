---
execution: subagent
agent: content-repurposer
model_tier: powerful
inputFile: squads/social-growth/output/content/content-production-package.md
outputFile: squads/social-growth/output/amiclube/social/drafts/
---

# Step 03A1: Generate Social Post Drafts

## Context Loading

Load these files before executing:

- `squads/social-growth/output/content/content-production-package.md` — approved content
- `squads/social-growth/output/amiclube/review/campaign-manifest.json` — asset metadata and blogParentId
- `squads/social-growth/output/amiclube/blog/*-draft.md` — blog drafts for article reference
- `squads/social-growth/output/strategy/content-plan.md` — strategic direction
- `squads/social-growth/pipeline/data/generation-contract.md` — canonical checklist for caption, link and export fields
- `_opensquad/core/best-practices/article-to-post-linking.md` — linking policy
- `_opensquad/core/best-practices/copywriting.md` — copy rules

## Instructions

### Process

1. Read the content production package and identify all social assets.
2. For each social asset derived from a blog article (contentMode = `blog_derivative`):
   - Read the parent blog draft to extract the article URL or slug
   - Read any pre-existing caption copy in the content production package
   - Generate a complete social draft `.md` file
3. Write each draft to: `squads/social-growth/output/{client}/social/drafts/{asset-id}.md`
4. Update `social-publish-assets.json` with the `sourceDraft` path for each asset.
5. Make sure each draft can satisfy `generation-contract.md` later in the flow: asset identity, caption, link strategy, final canvas and export proof must be derivable from the draft.

### Draft Format

Each draft file must include:

```markdown
---
asset_id: AC-30-XX
platform: [Instagram | Facebook | LinkedIn]
type: [reels | carrossel | post]
status: [planned | review | preview_ready]
created_at: YYYY-MM-DD
derived_from_article: AC-30-YY
article_url: [URL or null]
article_slug: [slug-from-article]
visual_version: v1
---

# AC-30-XX — Title

## Caption ([Platform])

[Full caption text — platform-adapted, character-count checked]

---

## Visual Brief

[Brief summary of on-screen text per slide/frame]

## Article Link Requirement

[Per platform: link na bio, direct URL, or first comment]
- Platform rule from article-to-post-linking.md

## Hashtags

[#tag1 #tag2 #tag3]
```

### Rules

- Each social post gets ONE draft file — no shared drafts
- Caption must be platform-adapted (character limits, line breaks, hashtag count)
- Link requirement must be specified per the article-to-post-linking policy
- Drafts should already carry enough signal to complete the generation contract downstream.
- `visual_version` tracks the preview HTML version (v1, v2, v3...)
- `article_url` starts as `null`; filled when the article is published on WordPress

## Quality Criteria

- [ ] Every social asset in the campaign has a draft file
- [ ] Each draft includes full caption text (not just preview)
- [ ] Caption length is checked against platform limits
- [ ] Link requirement is specified per platform
- [ ] `blogParentId` is referenced and article slug is included
- [ ] Visual brief summarizes what text appears on each slide/frame
- [ ] Drafts are saved to correct client directory

## Integration

- **Reads from**: `output/content/content-production-package.md`, `campaign-manifest.json`, blog drafts
- **Writes to**: `social/drafts/{asset-id}.md` per asset
- **Updates**: `social-publish-assets.json` (`sourceDraft` field)
- **Feeds**: `step-03b-create-visual-direction.md` (reads drafts for caption content)
- **Triggers**: after `step-03a-content-production.md`
- **Depends on**: Approved content production package
