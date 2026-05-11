---
name: blog-quality-gate
description: >
  Runs deterministic quality gates for blog artifacts: structure contract,
  word-count policy, preview readiness, and featured-image validity.
type: script
version: "1.0.0"
runtime: node
invocation: "node squads/social-growth/scripts/validate-blog-quality-gate.mjs --client {client}"
categories:
  - qa
  - seo
  - publishing
---

# Blog Quality Gate

Use this skill before any review checkpoint that can lead to schedule/publish.

## Required Checks

1. Contract compliance for `blog-post.md`.
2. Required sections in final article.
3. Word count in allowed range.
4. Canonical preview presence.
5. Featured image local, valid, and 16:9 minimum.
6. Preview visible text density aligned with `blog-post.md` (anti-drift ratio).
7. Campaign hub existence.

## Exit Rule

- Exit code `0`: gate passed.
- Non-zero: hard fail. Do not continue to approval.

## Typical Command

```bash
node squads/social-growth/scripts/validate-blog-quality-gate.mjs --client amiclube
```
