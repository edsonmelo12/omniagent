---
id: article-to-post-linking
name: "Article-to-Post Linking Policy"
whenToUse: |
  Creating social posts derived from blog articles, or reviewing
  social assets that reference article content.
  NOT for: standalone social content (tips, behind-the-scenes, engagement-only).
version: "1.0.0"
---

# Article-to-Post Linking Policy

## Why Link

Every social post derived from a blog article must link back to the original article. This:

1. **Generates traffic** to the blog, increasing SEO authority
2. **Provides depth** for users who want more than a caption
3. **Closes the cycle**: article → social snippet → article
4. **Validates the effort** of producing long-form content

Without a link, the post is a dead end. With a link, it feeds the ecosystem.

## Rule by Platform

| Platform | Where to link | How to present | Visual requirement |
|----------|---------------|----------------|--------------------|
| **Instagram Reels** | Link in bio | Caption: "Leia o artigo completo no link da bio" | Overlay text "Link na bio" fixed at bottom-right corner of frame 4 (last frame) |
| **Instagram Carrossel** | Link in bio | Last slide: call-to-action with arrow pointing to bio | Overlay "Link na bio 📲" on last slide |
| **Instagram Post (static)** | Link in bio | Caption: "Leia o artigo completo — link na bio" | No visual overlay needed (static image) |
| **Facebook Post** | Direct URL in post body | First paragraph: context + inline link | No visual overlay needed (link is in text) |
| **LinkedIn Post** | URL in first comment | Post: "Deixo o link no primeiro comentário ↓" | No visual overlay needed |

## CTA Vocabulary (Standard)

Use these exact or close variations — never invent new CTAs without review:

| Platform | CTA |
|----------|-----|
| Instagram Reels | "Leia o artigo completo no link da bio" |
| Instagram Carrossel | "Quer saber mais? O link está na bio" |
| Instagram Post | "Tem mais sobre isso no blog — link na bio" |
| Facebook | "Leia o artigo completo em: [URL]" |
| LinkedIn | "Link para o artigo completo no primeiro comentário ↓" |

## Visual Placement

### Instagram Reels (frame 4 / last frame)

```
┌─────────────────────────┐
│                         │
│    (content)            │
│                         │
│                         │
│                         │
│              ┌──────────┤
│              │ Link na  │
│              │ bio 🔗   │
│              └──────────┘
└─────────────────────────┘
```

Position: bottom-right, 24px padding from edges.
Background: semi-transparent dark pill (#000000 at 60% opacity).
Font: Inter SemiBold, 14px, white.

### Instagram Carrossel (last slide)

```
┌─────────────────────────┐
│                         │
│                         │
│    Quer saber mais?     │
│                         │
│    Link na bio 📲       │
│                         │
│                         │
└─────────────────────────┘
```

Position: centered vertically, 32px from bottom.

### Facebook / LinkedIn

No visual overlay. The link lives in the text body or first comment.

## Exceptions

These post types do NOT require an article link:

- Tips & quick hacks (standalone, not derived from article)
- Behind-the-scenes / process content
- Engagement-only content (polls, questions, quizzes)
- Seasonal offers / promotions (link to sales page, not blog)

When in doubt, check `contentMode` in the campaign manifest:
- `blog_derivative` → **must** link
- `seasonal_offer` → link to sales page
- `editorial_backlog` → check if derived from an article

## Quality Checklist

- [ ] The post's `blogParentId` resolves to a published article URL
- [ ] The link/CTA is present in the correct format for the platform
- [ ] Instagram: overlay is visible and legible at mobile size
- [ ] Facebook: URL is clickable and resolves correctly
- [ ] LinkedIn: URL is in first comment, not post body
- [ ] The CTA uses standard vocabulary (no invented phrasing)
- [ ] Non-derivative posts (tips, BTS, engagement) correctly skip linking

## Reject Conditions

- Post is `blog_derivative` but has NO link → **hard reject**
- Instagram Reels last frame missing "Link na bio" overlay → **hard reject**
- Facebook post with URL in caption but no clickable link → **reject** (must use native link)
- CTA uses non-standard phrasing without review → **soft reject**
- Overlay text illegible (low contrast, too small, cropped) → **hard reject**
