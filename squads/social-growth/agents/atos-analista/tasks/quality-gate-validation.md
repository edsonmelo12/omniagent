# Task: Quality Gate Validation & Risk Scoring

## Objective
Evaluate the produced content against historical evidence, structural rules (SEO/GEO), and lineage/channel integrity before review.

## Mandate: Orphan & Diversity Audit
- [ ] Check `campaign-manifest.json` for blog-to-social ratio (min 1:3).
- [ ] Check `campaign-manifest.json` for channel diversity (min 2 distinct channels per blog).
- [ ] Penalize (+40 points) and set status `HOLD` for any blog with < 3 social assets OR < 2 channels.

## Input
- Produced blog post or social asset
- `campaign-manifest.json`
- Historical performance data (Otiniel Observa)
- Intention Hook (from database)

## Action
1. Execute `npx tsx squads/social-growth/scripts/validate-blog-quality-gate.mjs`.
2. Compare content structures with "Success Patterns" from the Atos database.
3. Perform **Lineage Audit**: count social assets where `blogParentId === blogId`.
4. Perform **Diversity Audit**: count distinct channels used by those social assets.
5. Assign a **Risk Score** (0-100) where 100 is "High Probability of Failure".

## Quality Gate
- [ ] Lineage integrity: Blog must have 3 or more social derivatives.
- [ ] Channel Diversity: Blog must be present in 2 or more distinct channels.
- [ ] Structure follows SEO/GEO best practices.
- [ ] Alignment with Intention Hook is verified.

## Output
- `squads/social-growth/output/{client}/review/atos-risk-score.md`
