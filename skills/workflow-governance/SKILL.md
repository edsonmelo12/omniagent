---
name: workflow-governance
description: >
  Enforces deterministic pipeline execution with canonical paths, fixed contracts,
  and anti-drift rules for multi-agent runs.
type: prompt
version: "1.0.0"
categories:
  - governance
  - pipeline
  - qa
---

# Workflow Governance

Use this skill when a pipeline output must stay deterministic across runs.

## Purpose

Prevent agent drift, file drift, and output-shape drift.

## Required Governance Rules

1. Never change canonical output paths.
2. Never fork output shape without explicit contract update.
3. Keep one source of truth per artifact family.
4. Block progression when mandatory gate fails.
5. Always record execution evidence in the artifact.

## Canonical Contracts

- Blog final source of truth: `output/{client}/blog/blog-post.md`
- Blog approval preview directory: `output/{client}/blog/previews/`
- Campaign approval hub: `output/{client}/review/campaign-hub.html`

## Mandatory Behavior

- Validate required sections before review.
- Validate word-count target before review.
- Use canonical renderer for recurring HTML artifacts.
- Do not handcraft new layouts for canonical recurring files.

## Block Conditions

Stop the phase and mark as failed if:

1. Required section is missing.
2. Word count is below hard minimum.
3. Preview HTML is missing.
4. Canonical hub is missing or not refreshed by script.
