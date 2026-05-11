---
name: blog-preview-canonical-renderer
description: >
  Renders canonical blog preview HTML directly from blog-post.md sections,
  preventing short/manual preview drift.
type: script
version: "1.0.0"
runtime: node
invocation: "node squads/social-growth/scripts/render-blog-preview-canonical.mjs --client {client} --slug {slug}"
categories:
  - render
  - blog
  - governance
---

# Blog Preview Canonical Renderer

Use this skill to generate preview HTML from the actual final article source.

## Purpose

Keep preview text aligned with `blog-post.md` and avoid short ad-hoc previews.

## Input

- `output/{client}/blog/blog-post.md`
- Featured image section from the same file

## Output

- `output/{client}/blog/previews/{slug}.html`

## Rule

Do not handwrite recurring previews when canonical renderer is available.
