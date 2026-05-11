# Blog Publication Scorecard Template

## Purpose

Standardize go/no-go publication decisions using a weighted SEO/GEO score and blocker rules.

## Score Model (0-100)

- Intent alignment: `20`
- GEO clarity and extractability: `20`
- Proof and credibility: `15`
- On-page SEO structure: `15`
- Technical consistency (schema, links, rendering): `10`
- Differentiation and anti-genericity: `10`
- CTA and funnel coherence: `10`

## Decision Rules

- `publish`: score `>= 80` and no `P1` blockers.
- `revise`: score `70-79` or only `P2` blockers.
- `hold`: score `< 70` or any `P1` blocker.

## Blocker Severity

- `P1`: publish blocker (must fix before publish)
- `P2`: quality risk (recommended fix before publish)
- `P3`: optimization opportunity

## Output Structure

```
## Publication Scorecard
| Dimension | Weight | Score | Notes |
|---|---:|---:|---|

## Score Summary
- total:
- decision: [publish / revise / hold]

## Blockers
| Severity | Item | Location | Required Action |
|---|---|---|---|

## Required Fixes (P1)
- ...

## Recommended Fixes (P2)
- ...

## Optional Improvements (P3)
- ...
```
